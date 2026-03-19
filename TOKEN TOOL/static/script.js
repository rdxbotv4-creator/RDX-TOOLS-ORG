// Current form data storage
let currentFormData = null;
let currentTab = 'single';

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        currentTab = tab;

        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab).classList.add('active');

        // Hide results when switching tabs
        document.getElementById('results').style.display = 'none';
    });
});

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Get selected app ID based on current tab
function getSelectedAppId() {
    const radioName = currentTab === 'single' ? 'app_type' : 'app_type_multi';
    const selected = document.querySelector(`input[name="${radioName}"]:checked`);
    return selected ? selected.value : '';
}

// Generate token for single account
async function generateToken() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const auth = document.getElementById('auth').value.trim();
    const appId = getSelectedAppId();

    if (!email || !password) {
        showError('Please enter email and password');
        return;
    }

    if (!appId) {
        showError('Please select an app type');
        return;
    }

    currentFormData = { email, password, auth, appId };

    try {
        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Generating...';

        const response = await fetch('/generate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, auth, app_id: appId })
        });

        const result = await response.json();

        if (result.status === '2fa_required') {
            showTwoFactorModal();
        } else if (result.status === 'success') {
            showResults([{
                email,
                status: 'success',
                uid: result.uid,
                token: result.token,
                cookies: result.cookies
            }]);
        } else {
            showError(result.message || 'Login failed');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-key"></i> Generate Token';
    }
}

// Generate tokens for multiple accounts
async function generateMultipleTokens() {
    const accounts = document.getElementById('accounts').value.trim();
    const appId = getSelectedAppId();

    if (!accounts) {
        showError('Please enter account list');
        return;
    }

    if (!appId) {
        showError('Please select an app type');
        return;
    }

    try {
        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Generating All...';

        const response = await fetch('/generate-multiple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accounts, app_id: appId })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showResults(result.results);
        } else {
            showError(result.message || 'Failed to process accounts');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-keys"></i> Generate All Tokens';
    }
}

// Show 2FA modal
function showTwoFactorModal() {
    document.getElementById('twoFactorModal').classList.add('show');
    document.getElementById('twoFactorCode').value = '';
    document.getElementById('twoFactorCode').focus();
}

// Close 2FA modal
function closeModal() {
    document.getElementById('twoFactorModal').classList.remove('show');
}

// Submit 2FA code
async function submitTwoFactor() {
    const twoFactorCode = document.getElementById('twoFactorCode').value.trim();

    if (!twoFactorCode) {
        alert('Please enter 2FA code');
        return;
    }

    closeModal();

    try {
        const btn = document.querySelector('#single .btn-generate');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Verifying...';

        const response = await fetch('/generate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentFormData,
                twofactor_code: twoFactorCode
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showResults([{
                email: currentFormData.email,
                status: 'success',
                uid: result.uid,
                token: result.token,
                cookies: result.cookies
            }]);
        } else {
            showError(result.message || 'Login failed');
        }
    } catch (error) {
        showError('An error occurred: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-key"></i> Generate Token';
    }
}

// Show results
function showResults(results) {
    const resultsDiv = document.getElementById('results');
    const contentDiv = document.getElementById('resultsContent');

    let html = '';

    results.forEach((result, index) => {
        if (result.status === 'success') {
            html += `
                <div class="result-item success">
                    <div class="status">
                        <i class="fas fa-check-circle"></i>
                        <span>SUCCESS</span>
                    </div>
                    <div class="field">
                        <label>UID:</label>
                        <div class="value">${result.uid || 'N/A'}</div>
                    </div>
                    <div class="field">
                        <label>Access Token:</label>
                        <div class="value">${result.token}</div>
                        <button class="copy-btn" onclick="copyToClipboard('${result.token}')">
                            <i class="fas fa-copy"></i> Copy Token
                        </button>
                    </div>
                    <div class="field">
                        <label>Cookies:</label>
                        <div class="value">${result.cookies}</div>
                        <button class="copy-btn" onclick="copyToClipboard('${result.cookies.replace(/'/g, "\\'")}')">
                            <i class="fas fa-copy"></i> Copy Cookies
                        </button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="result-item error">
                    <div class="status">
                        <i class="fas fa-times-circle"></i>
                        <span>FAILED</span>
                    </div>
                    <div class="field">
                        <label>Email:</label>
                        <div class="value">${result.email}</div>
                    </div>
                    <div class="field">
                        <label>Error:</label>
                        <div class="value">${result.message || 'Unknown error'}</div>
                    </div>
                </div>
            `;
        }
    });

    contentDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Show error message
function showError(message) {
    const resultsDiv = document.getElementById('results');
    const contentDiv = document.getElementById('resultsContent');

    contentDiv.innerHTML = `
        <div class="result-item error">
            <div class="status">
                <i class="fas fa-times-circle"></i>
                <span>ERROR</span>
            </div>
            <div class="field">
                <div class="value">${message}</div>
            </div>
        </div>
    `;

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Close modal on outside click
document.getElementById('twoFactorModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('twoFactorModal')) {
        closeModal();
    }
});

// Handle Enter key in 2FA input
document.getElementById('twoFactorCode').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitTwoFactor();
    }
});
