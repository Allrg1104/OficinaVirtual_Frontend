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
          <p>Solicitudes y Autorizaciones PAC</p>
        </div>

        <!-- Step 1: Request Token -->
        <form id="forgot-form">
          <div class="form-group">
            <label for="forgot-email">Correo Electrónico</label>
            <input type="email" id="forgot-email" class="input" placeholder="ejemplo@oficinavirtual.com" required>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
            Enviar Token
          </button>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="#/login" class="btn-text" style="font-size: 13px;">Volver al Login</a>
          </div>
        </form>

        <!-- Step 2: Reset Password (hidden initially) -->
        <form id="reset-form" class="hidden">
          <div class="form-group">
            <label for="reset-token">Token de Recuperación</label>
            <input type="text" id="reset-token" class="input" placeholder="Ingresa el token de 6 dígitos" required>
            <span style="font-size: 11px; color: #10b981;" id="debug-token-info"></span>
          </div>

          <div class="form-group">
            <label for="new-password">Nueva Contraseña</label>
            <input type="password" id="new-password" class="input" placeholder="Min 6 caracteres" required>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
            Reestablecer Contraseña
          </button>
        </form>
      </div>
    `;
  },

  afterRender() {
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');
    const debugTokenInfo = document.getElementById('debug-token-info');

    let currentEmail = '';

    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        currentEmail = email;

        try {
          const data = await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });

          store.showToast('Token de recuperación generado con éxito.', 'success');
          
          // Switch forms
          forgotForm.classList.add('hidden');
          resetForm.classList.remove('hidden');

          // If debugToken is returned (development fallback), display it to user
          if (data.debugToken) {
            debugTokenInfo.innerText = `Token de simulación (Dev): ${data.debugToken}`;
            document.getElementById('reset-token').value = data.debugToken;
          }

          lucide.createIcons();
        } catch (err) {
          store.showToast(err.message || 'Error al solicitar recuperación', 'error');
        }
      });
    }

    if (resetForm) {
      resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('reset-token').value;
        const password = document.getElementById('new-password').value;

        try {
          await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              email: currentEmail,
              token,
              password
            })
          });

          store.showToast('Contraseña restablecida correctamente.', 'success');
          window.location.hash = '#/login';
        } catch (err) {
          store.showToast(err.message || 'Error al reestablecer contraseña', 'error');
        }
      });
    }
  }
};

window.ForgotPasswordView = ForgotPasswordView;
