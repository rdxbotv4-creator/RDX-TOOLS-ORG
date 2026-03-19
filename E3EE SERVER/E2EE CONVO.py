# app.py  — Pro-Max final (Password-protected admin form + demo mode)
import os
import base64
import threading
import time
from datetime import datetime
from flask import Flask, request, render_template, redirect, url_for, jsonify, session, flash

# Crypto (for encrypt/decrypt helpers)
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes

# ---------------- Config ----------------
APP_SECRET = os.environ.get("APP_SECRET", "pro-e2ee-secret")   # change in production
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")  # change immediately on deploy
PORT = int(os.environ.get("PORT", 5000))

# ---------------- App init ----------------
app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = APP_SECRET
app.config['UPLOAD_FOLDER'] = 'messages'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ---------------- State & Logging ----------------
sending = False
sender_thread = None
log_lines = []

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{ts}] {msg}"
    print(entry)
    log_lines.append(entry)
    if len(log_lines) > 500:
        del log_lines[0]

# ---------------- Crypto helpers ----------------
def b64_decode_padded(s: str) -> bytes:
    s = (s or "").strip()
    pad = len(s) % 4
    if pad != 0:
        s += '=' * (4 - pad)
    return base64.b64decode(s)

def b64_encode(b: bytes) -> str:
    return base64.b64encode(b).decode('utf-8')

def encrypt_aes_gcm(plaintext: str, key_b64: str) -> str:
    key = b64_decode_padded(key_b64)
    if len(key) not in (16,24,32):
        raise ValueError("Key must decode to 16/24/32 bytes")
    nonce = get_random_bytes(12)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode('utf-8'))
    return b64_encode(nonce + ciphertext + tag)

def decrypt_aes_gcm(blob_b64: str, key_b64: str) -> str:
    blob = b64_decode_padded(blob_b64)
    key = b64_decode_padded(key_b64)
    nonce = blob[:12]
    tag = blob[-16:]
    ciphertext = blob[12:-16]
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag).decode('utf-8', errors='replace')

# ---------------- Placeholder send function ----------------
def send_to_uid(uid: str, message: str, key_b64: str, target_type: str, demo_webhook: str = None):
    """
    PLACEHOLDER:
    - For demo_mode (demo_webhook provided): POST encrypted payload to demo webhook (app's /receive).
    - For production you MUST replace this function with your own implementation that:
      * Uses only legally obtained keys/sessions
      * Follows platform rules
      * Implements exact encryption format + headers + cookies required by target service
    """
    if demo_webhook:
        import requests
        try:
            if key_b64:
                payload = encrypt_aes_gcm(message, key_b64)
            else:
                tmp_key = b64_encode(get_random_bytes(32))
                payload = encrypt_aes_gcm(message, tmp_key)
            data = {"target_type": target_type, "uid": uid, "payload": payload, "ts": datetime.utcnow().isoformat()+"Z"}
            r = requests.post(demo_webhook, json=data, timeout=8)
            return (r.status_code, r.text[:500])
        except Exception as e:
            return (0, f"demo post error: {e}")

    # Production path intentionally not implemented to avoid misuse
    log(f"[PLACEHOLDER] Would send to {target_type} uid={uid}. Message len={len(message)} Key given={bool(key_b64)}")
    raise NotImplementedError("Add your own send implementation here - do not use others' keys/accounts.")

# ---------------- Sender loop ----------------
def sender_loop(group_uids, inbox_uids, message, key_b64, interval, start_ts, demo_mode=True):
    global sending
    now = datetime.now()
    wait = (start_ts - now).total_seconds()
    if wait > 0:
        log(f"Waiting {int(wait)}s to start...")
        time.sleep(wait)
    log(f"Sender started: groups={len(group_uids)} inbox={len(inbox_uids)} interval={interval}s demo={demo_mode}")
    demo_webhook = url_for('receive', _external=True) if demo_mode else None

    while sending:
        # Groups
        for uid in group_uids:
            if not sending: break
            uid = uid.strip()
            if not uid: continue
            try:
                status, info = send_to_uid(uid, message, key_b64, target_type='group', demo_webhook=demo_webhook)
                log(f"Group {uid} -> status={status} info={str(info)[:150]}")
            except NotImplementedError as e:
                log(str(e))
                sending = False
                break
            except Exception as e:
                log(f"Error sending to group {uid}: {e}")

        # Inboxes
        for uid in inbox_uids:
            if not sending: break
            uid = uid.strip()
            if not uid: continue
            try:
                status, info = send_to_uid(uid, message, key_b64, target_type='inbox', demo_webhook=demo_webhook)
                log(f"Inbox {uid} -> status={status} info={str(info)[:150]}")
            except NotImplementedError as e:
                log(str(e))
                sending = False
                break
            except Exception as e:
                log(f"Error sending to inbox {uid}: {e}")

        # interval
        slept = 0
        while sending and slept < max(1, int(interval)):
            time.sleep(1); slept += 1
    log("Sender stopped.")

# ---------------- Simple auth ----------------
def require_login():
    return session.get("logged_in", False)

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        pwd = request.form.get('password','')
        if pwd == ADMIN_PASSWORD:
            session['logged_in'] = True
            flash("Login successful", "success")
            return redirect(url_for('index'))
        else:
            flash("Wrong password", "error")
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# ---------------- Routes ----------------
from flask import url_for

@app.route('/')
def index():
    if not require_login():
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start():
    global sending, sender_thread
    if not require_login():
        return redirect(url_for('login'))

    if sending:
        flash("Already running. Stop first.", "error")
        return redirect(url_for('index'))

    group_text = request.form.get('group_uids','') or ''
    inbox_text = request.form.get('inbox_uids','') or ''
    message = request.form.get('message','') or ''
    key_b64 = request.form.get('encryption_key','') or ''
    time_to_send = request.form.get('time_to_send','') or ''
    interval = int(request.form.get('interval',60))
    demo_mode_flag = (request.form.get('demo_mode','on') == 'on')

    def parse_lines(s):
        lines=[]
        for raw in s.replace(',','\n').splitlines():
            v = raw.strip()
            if v:
                lines.append(v)
        return lines

    group_uids = parse_lines(group_text)
    inbox_uids = parse_lines(inbox_text)

    if not time_to_send:
        flash("Start time required", "error"); return redirect(url_for('index'))
    try:
        start_ts = datetime.strptime(time_to_send, "%Y-%m-%dT%H:%M")
    except Exception:
        flash("Invalid time format", "error"); return redirect(url_for('index'))

    if not message:
        message = " "

    sending = True
    sender_thread = threading.Thread(target=sender_loop, args=(group_uids, inbox_uids, message, key_b64, interval, start_ts, demo_mode_flag), daemon=True)
    sender_thread.start()
    log("Schedule created.")
    flash("Schedule created", "success")
    return redirect(url_for('index'))

@app.route('/stop', methods=['POST'])
def stop():
    global sending
    if not require_login():
        return redirect(url_for('login'))
    if not sending:
        flash("Not running", "error"); return redirect(url_for('index'))
    sending = False
    log("Stop requested.")
    flash("Stop requested", "success")
    return redirect(url_for('index'))

@app.route('/status')
def status():
    if not require_login():
        return jsonify({"error":"not auth"}), 401
    return jsonify({"sending": sending, "log": log_lines[-160:]})

@app.route('/receive', methods=['POST'])
def receive():
    # Demo receiver — logs incoming demo payloads
    data = request.get_json() or {}
    log(f"/receive got: keys={list(data.keys())} size={len(str(data))}")
    return jsonify({"ok": True, "received": True})

@app.route('/decrypt', methods=['GET','POST'])
def decrypt_page():
    if not require_login():
        return redirect(url_for('login'))
    result=None; error=None
    if request.method=='POST':
        blob = (request.form.get('payload') or "").strip()
        key = (request.form.get('encryption_key') or "").strip()
        try:
            plaintext = decrypt_aes_gcm(blob, key)
            result = plaintext
            log("Decryption succeeded via UI.")
        except Exception as e:
            error=str(e); log(f"Decrypt error: {error}")
    return render_template('decrypt.html', result=result, error=error)

# ---------------- Login template route helper ----------------
@app.route('/login.html')
def login_template():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)