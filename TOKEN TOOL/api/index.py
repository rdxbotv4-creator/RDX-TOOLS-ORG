from flask import Flask, jsonify, request, render_template
import base64
import io
import json
import os
import random
import string
import struct
import time
import uuid

import pyotp
import requests
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
from Crypto.Random import get_random_bytes

app = Flask(__name__, template_folder='../templates')

# User agent for requests
USER_AGENT = "Mozilla/5.0 (Linux; Android 15; NX789J Build/AQ3A.240812.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.109 Mobile Safari/537.36"


class Facebook:
    def __init__(self, email, password, auth=None, machine_id=None):
        self.email = email
        self.password = self.enc_password(password)
        self.auth = auth.replace(" ", "") if auth else ""
        self.URL = "https://b-graph.facebook.com/auth/login"
        self.API_KEY = "882a8490361da98702bf97a021ddc14d"
        self.SIG = "214049b9f17c38bd767de53752b53946"
        self.device_id = str(uuid.uuid4())
        self.adid = str(uuid.uuid4())
        self.secure_family_device_id = str(uuid.uuid4())
        self.machine_id = machine_id or ''.join(random.choices(string.ascii_letters + string.digits, k=24))
        self.jazoest = ''.join(random.choices(string.digits, k=5))
        self.sim_serial = ''.join(random.choices(string.digits, k=20))
        self.HEADERS = {
            "content-type": "application/x-www-form-urlencoded",
            "x-fb-net-hni": "45201",
            "zero-rated": "0",
            "x-fb-sim-hni": "45201",
            "x-fb-connection-quality": "EXCELLENT",
            "x-fb-friendly-name": "authenticate",
            "x-fb-connection-bandwidth": "78032897",
            "x-tigon-is-retry": "False",
            "authorization": "OAuth null",
            "x-fb-connection-type": "WIFI",
            "x-fb-device-group": "3342",
            "priority": "u=3,i",
            "x-fb-http-engine": "Liger",
            "x-fb-client-ip": "True",
            "x-fb-server-cluster": "True",
            "x-fb-request-analytics-tags": '{"network_tags":{"product":"350685531728","retry_attempt":"0"},"application_tags":"unknown"}',
            "user-agent": USER_AGENT
        }

    def enc_password(self, password):
        try:
            url = 'https://b-graph.facebook.com/pwd_key_fetch'
            params = {
                'version': '2',
                'flow': 'CONTROLLER_INITIALIZATION',
                'method': 'GET',
                'fb_api_req_friendly_name': 'pwdKeyFetch',
                'fb_api_caller_class': 'com.facebook.auth.login.AuthOperations',
                'access_token': '438142079694454|fc0a7caa49b192f64f6f5a6d9643bb28'
            }
            response = requests.post(url, params=params).json()
            public_key = response.get('public_key')
            key_id = str(response.get('key_id', '25'))
            
            rand_key = get_random_bytes(32)
            iv = get_random_bytes(12)
            pubkey = RSA.import_key(public_key)
            cipher_rsa = PKCS1_v1_5.new(pubkey)
            encrypted_rand_key = cipher_rsa.encrypt(rand_key)
            
            cipher_aes = AES.new(rand_key, AES.MODE_GCM, nonce=iv)
            current_time = int(time.time())
            cipher_aes.update(str(current_time).encode("utf-8"))
            encrypted_passwd, auth_tag = cipher_aes.encrypt_and_digest(password.encode("utf-8"))
            
            buf = io.BytesIO()
            buf.write(bytes([1, int(key_id)]))
            buf.write(iv)
            buf.write(struct.pack("<h", len(encrypted_rand_key)))
            buf.write(encrypted_rand_key)
            buf.write(auth_tag)
            buf.write(encrypted_passwd)
            encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
            return f"#PWD_FB4A:2:{current_time}:{encoded}"
        except Exception as e:
            raise Exception(f"Error encoding password: {e}")

    def login(self, app_id, twofactor_code=None):
        data = {
            'email': self.email,
            'password': self.password,
            'generate_session_cookies': '1',
            'locale': 'en_US',
            'client_country_code': 'US',
            'access_token': app_id,
            "api_key": self.API_KEY,
            "adid": self.adid,
            "account_switcher_uids": f'["{self.email}"]',
            "source": "login",
            "machine_id": self.machine_id,
            "jazoest": self.jazoest,
            "meta_inf_fbmeta": "V2_UNTAGGED",
            "fb_api_req_friendly_name": "authenticate",
            "fb_api_caller_class": "Fb4aAuthHandler",
            "sig": self.SIG
        }
        
        result = requests.post(self.URL, headers=self.HEADERS, data=data).json()
        
        if 'error' in result:
            error_data = result.get('error', {}).get('error_data', {})
            if 'login_first_factor' in error_data and 'uid' in error_data:
                if not self.auth and not twofactor_code:
                    return {'status': '2fa_required', 'uid': error_data.get('uid'), 'first_factor': error_data.get('login_first_factor')}
                else:
                    if not twofactor_code and self.auth:
                        twofactor_code = pyotp.TOTP(self.auth).now()
                    
                    data = {
                        'locale': 'en_US',
                        'format': 'json',
                        'email': self.email,
                        'device_id': self.device_id,
                        'access_token': app_id,
                        'generate_session_cookies': 'true',
                        'generate_machine_id': '1',
                        'twofactor_code': twofactor_code,
                        'credentials_type': 'two_factor',
                        'error_detail_type': 'button_with_disabled',
                        'first_factor': error_data['login_first_factor'],
                        'password': self.password,
                        'userid': error_data['uid'],
                        'machine_id': self.machine_id
                    }
                    result = requests.post(self.URL, headers=self.HEADERS, data=data).json()
        
        if 'access_token' in result:
            access_token = result.get('access_token')
            cookies_string = "; ".join(f"{c['name']}={c['value']}" for c in result.get("session_cookies", []))
            return {'status': 'success', 'token': access_token, 'cookies': cookies_string}
        else:
            return {'status': 'error', 'message': result.get('error', {}).get('message', 'Unknown error')}


def get_uid_from_cookie(cookies):
    import re
    match = re.search(r"c_user=(\d+)", cookies)
    return match.group(1) if match else None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/generate-token', methods=['POST'])
def generate_token():
    data = request.get_json()
    
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    auth = data.get('auth', '').strip()
    app_id = data.get('app_id', '').strip()
    twofactor_code = data.get('twofactor_code', '').strip()
    
    if not email or not password or not app_id:
        return jsonify({'status': 'error', 'message': 'Email, password, and app selection are required'})
    
    try:
        fb = Facebook(email, password, auth if auth else "")
        result = fb.login(app_id, twofactor_code if twofactor_code else None)
        
        if result['status'] == 'success':
            uid = get_uid_from_cookie(result['cookies'])
            return jsonify({
                'status': 'success',
                'uid': uid,
                'token': result['token'],
                'cookies': result['cookies']
            })
        elif result['status'] == '2fa_required':
            return jsonify({
                'status': '2fa_required',
                'uid': result['uid'],
                'message': 'Two-factor authentication required'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('message', 'Login failed')
            })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})


@app.route('/generate-multiple', methods=['POST'])
def generate_multiple():
    data = request.get_json()
    
    accounts_text = data.get('accounts', '').strip()
    app_id = data.get('app_id', '').strip()
    
    if not accounts_text or not app_id:
        return jsonify({'status': 'error', 'message': 'Accounts and app selection are required'})
    
    results = []
    lines = [l.strip() for l in accounts_text.strip().splitlines() if l.strip()]
    
    for line in lines:
        parts = [p.strip() for p in line.split("|")]
        if len(parts) >= 2:
            email = parts[0]
            password = parts[1]
            auth = parts[2] if len(parts) > 2 else ""
            
            try:
                fb = Facebook(email, password, auth)
                result = fb.login(app_id)
                
                if result['status'] == 'success':
                    uid = get_uid_from_cookie(result['cookies'])
                    results.append({
                        'email': email,
                        'status': 'success',
                        'uid': uid,
                        'token': result['token'],
                        'cookies': result['cookies']
                    })
                elif result['status'] == '2fa_required':
                    results.append({
                        'email': email,
                        'status': '2fa_required',
                        'message': 'Two-factor authentication required'
                    })
                else:
                    results.append({
                        'email': email,
                        'status': 'error',
                        'message': result.get('message', 'Login failed')
                    })
            except Exception as e:
                results.append({
                    'email': email,
                    'status': 'error',
                    'message': str(e)
                })
    
    return jsonify({'status': 'success', 'results': results})


def handler(event, context):
    """Vercel Python handler"""
    from flask import Flask
    
    # Get request details
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    query = event.get('queryStringParameters', {})
    headers = event.get('headers', {})
    body = event.get('body', '')
    
    # Build query string
    query_string = '&'.join([f"{k}={v}" for k, v in query.items()]) if query else ''
    
    # Create WSGI environment
    environ = {
        'REQUEST_METHOD': http_method,
        'PATH_INFO': path,
        'QUERY_STRING': query_string,
        'SERVER_NAME': 'localhost',
        'SERVER_PORT': '80',
        'HTTP_HOST': headers.get('host', 'localhost'),
        'wsgi.url_scheme': 'https',
        'wsgi.input': io.StringIO(body or ''),
        'wsgi.errors': io.StringIO(),
    }
    
    # Add all headers
    for k, v in headers.items():
        key = 'HTTP_' + k.upper().replace('-', '_')
        environ[key] = v
    
    # Response holder
    status = ['200 OK']
    headers_out = [{}]
    output = [b'']
    
    def write(data):
        output[0] = data
        
    def start_response(s, h):
        status[0] = s
        headers_out[0] = dict(h)
    
    # Execute app
    result = app(environ, start_response)
    body_data = b''.join(result)
    
    return {
        'statusCode': int(status[0].split()[0]),
        'headers': headers_out[0],
        'body': body_data.decode('utf-8')
    }
