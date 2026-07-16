// OFICINA VIRTUAL - FORGOT & RESET PASSWORD VIEW (VANILLA JS)

const ForgotPasswordView = {
  render() {
    return `
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <i data-lucide="key-round"></i>
          </div>
          <h2>Recuperar Contraseña</h2>
          <p>Ingresa tu correo y te enviaremos un token de recuperación</p>
        </div>

        <!-- Step 1: Request Token -->
        <form id="forgot-form" novalidate>
          <div class="form-group">
            <label for="forgot-email">Correo Electrónico</label>
            <input type="email" id="forgot-email" class="input" placeholder="ejemplo@oficinavirtual.com" required autocomplete="email">
          </div>

          <button type="submit" id="forgot-btn" class="btn btn-primary" style="width: 100%; margin-top: 8px; height: 44px; font-size: 14px;">
            <i data-lucide="send"></i> Enviar Token de Recuperación
          </button>

          <div style="margin-top: 20px; text-align: center;">
            <a href="#/login" class="btn-text" style="font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Volver al Login
            </a>
          </div>
        </form>

        <!-- Step 2: Reset Password (hidden initially) -->
        <form id="reset-form" class="hidden" novalidate>
          <div style="padding: 12px 16px; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); margin-bottom: 20px; font-size: 13px; color: #047857; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="check-circle" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
            <span>Token enviado. Revisa tu correo o usa el token de desarrollo abajo.</span>
          </div>

          <div class="form-group">
            <label for="reset-token">Token de Recuperación *</label>
            <input type="text" id="reset-token" class="input" placeholder="Ingresa el token de 6 dígitos" required>
            <span style="font-size: 11px; color: #10b981; margin-top: 4px;" id="debug-token-info"></span>
          </div>

          <div class="form-group">
            <label for="new-password">Nueva Contraseña *</label>
            <div style="position: relative;">
              <input type="password" id="new-password" class="input" placeholder="Mínimo 6 caracteres" required>
              <button type="button" id="toggle-new-pwd" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px;">
                <i data-lucide="eye" id="new-pwd-eye" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </div>

          <button type="submit" id="reset-btn" class="btn btn-primary" style="width: 100%; margin-top: 8px; height: 44px; font-size: 14px;">
            <i data-lucide="lock"></i> Restablecer Contraseña
          </button>

          <div style="margin-top: 16px; text-align: center;">
            <button type="button" id="back-to-forgot" class="btn-text" style="font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Cambiar correo
            </button>
          </div>
        </form>
      </div>
    `;
  },

  afterRender() {
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');
    const forgotBtn = document.getElementById('forgot-btn');
    const resetBtn = document.getElementById('reset-btn');
    const debugTokenInfo = document.getElementById('debug-token-info');
    const toggleNewPwd = document.getElementById('toggle-new-pwd');
    const newPwdEye = document.getElementById('new-pwd-eye');
    const newPwdInput = document.getElementById('new-password');

    let currentEmail = '';

    // Toggle password visibility
    if (toggleNewPwd) {
      toggleNewPwd.addEventListener('click', () => {
        const isHidden = newPwdInput.type === 'password';
        newPwdInput.type = isHidden ? 'text' : 'password';
        newPwdEye.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
        lucide.createIcons();
      });
    }

    // Back to step 1
    document.getElementById('back-to-forgot')?.addEventListener('click', () => {
      forgotForm.classList.remove('hidden');
      resetForm.classList.add('hidden');
    });

    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('forgot-email');
        const email = emailInput.value.trim();

        if (!email) {
          emailInput.classList.add('input--error');
          store.showToast('Por favor ingresa tu correo electrónico', 'error');
          return;
        }
        emailInput.classList.remove('input--error');

        // Loading state
        forgotBtn.classList.add('btn--loading');
        forgotBtn.textContent = 'Enviando token...';

        try {
          const data = await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });

          currentEmail = email;
          store.showToast('Token de recuperación generado correctamente.', 'success');

          forgotForm.classList.add('hidden');
          resetForm.classList.remove('hidden');

          if (data.debugToken) {
            debugTokenInfo.textContent = `Token (Dev): ${data.debugToken}`;
            document.getElementById('reset-token').value = data.debugToken;
          }

          lucide.createIcons();
        } catch (err) {
          forgotBtn.classList.remove('btn--loading');
          forgotBtn.innerHTML = '<i data-lucide="send"></i> Enviar Token de Recuperación';
          lucide.createIcons();
          document.getElementById('forgot-email').classList.add('input--error');
          store.showToast(err.message || 'Error al solicitar recuperación', 'error');
        }
      });
    }

    if (resetForm) {
      resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tokenInput = document.getElementById('reset-token');
        const pwdInput = document.getElementById('new-password');
        const token = tokenInput.value.trim();
        const password = pwdInput.value;

        let ok = true;
        if (!token) { tokenInput.classList.add('input--error'); ok = false; } else { tokenInput.classList.remove('input--error'); }
        if (!password || password.length < 6) { pwdInput.classList.add('input--error'); ok = false; store.showToast('La contraseña debe tener al menos 6 caracteres', 'error'); } else { pwdInput.classList.remove('input--error'); }
        if (!ok) return;

        // Loading state
        resetBtn.classList.add('btn--loading');
        resetBtn.textContent = 'Actualizando contraseña...';

        try {
          await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email: currentEmail, token, password })
          });

          store.showToast('Contraseña restablecida correctamente. Ya puedes iniciar sesión.', 'success');
          window.location.hash = '#/login';
        } catch (err) {
          resetBtn.classList.remove('btn--loading');
          resetBtn.innerHTML = '<i data-lucide="lock"></i> Restablecer Contraseña';
          lucide.createIcons();
          tokenInput.classList.add('input--error');
          store.showToast(err.message || 'Token inválido o expirado', 'error');
        }
      });
    }
  }
};

window.ForgotPasswordView = ForgotPasswordView;
