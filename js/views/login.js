// OFICINA VIRTUAL - LOGIN VIEW (VANILLA JS)

const LoginView = {
  render() {
    return `
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <i data-lucide="shield-check"></i>
          </div>
          <h2>Oficina Virtual</h2>
          <p>Sistema de Autorizaciones PAC</p>
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" class="input" placeholder="ejemplo@oficinavirtual.com" required autocomplete="email" value="medico@oficinavirtual.com">
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label for="password">Contraseña</label>
              <a href="#/forgot-password" class="btn-text" style="font-size: 11px;">¿Olvidó su contraseña?</a>
            </div>
            <div style="position: relative;">
              <input type="password" id="password" class="input" placeholder="••••••••" required autocomplete="current-password" value="Medico123*">
              <button type="button" id="toggle-pwd" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px;" title="Mostrar/ocultar contraseña">
                <i data-lucide="eye" id="pwd-eye" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </div>

          <button type="submit" id="login-btn" class="btn btn-primary" style="width: 100%; margin-top: 8px; height: 44px; font-size: 14px;">
            <i data-lucide="log-in"></i> Iniciar Sesión
          </button>
        </form>

        <div style="margin-top: 24px; padding: 16px; background-color: var(--surface-hover); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <p style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Cuentas de demostración</p>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button class="demo-login-btn" data-email="medico@oficinavirtual.com" data-pwd="Medico123*" style="background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; text-align: left; font-size: 12px; color: var(--text); transition: background 0.15s ease; display: flex; justify-content: space-between; align-items: center;">
              <span>🩺 Médico</span>
              <span style="color: var(--text-muted); font-size: 11px;">medico@oficinavirtual.com</span>
            </button>
            <button class="demo-login-btn" data-email="autorizador@oficinavirtual.com" data-pwd="Autorizador123*" style="background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; text-align: left; font-size: 12px; color: var(--text); transition: background 0.15s ease; display: flex; justify-content: space-between; align-items: center;">
              <span>✅ Autorizador</span>
              <span style="color: var(--text-muted); font-size: 11px;">autorizador@oficinavirtual.com</span>
            </button>
            <button class="demo-login-btn" data-email="admin@oficinavirtual.com" data-pwd="Admin123*" style="background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; cursor: pointer; text-align: left; font-size: 12px; color: var(--text); transition: background 0.15s ease; display: flex; justify-content: space-between; align-items: center;">
              <span>⚙️ Administrador</span>
              <span style="color: var(--text-muted); font-size: 11px;">admin@oficinavirtual.com</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    const form = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePwd = document.getElementById('toggle-pwd');
    const pwdEye = document.getElementById('pwd-eye');

    if (!form) return;

    // Toggle password visibility
    if (togglePwd) {
      togglePwd.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        pwdEye.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
        lucide.createIcons();
      });
    }

    // Demo login buttons
    document.querySelectorAll('.demo-login-btn').forEach(btn => {
      btn.addEventListener('mouseover', () => { btn.style.backgroundColor = 'var(--surface)'; });
      btn.addEventListener('mouseout', () => { btn.style.backgroundColor = ''; });
      btn.addEventListener('click', () => {
        emailInput.value = btn.getAttribute('data-email');
        passwordInput.value = btn.getAttribute('data-pwd');
        emailInput.classList.remove('input--error');
        passwordInput.classList.remove('input--error');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Client-side validation
      let hasError = false;
      if (!email) { emailInput.classList.add('input--error'); hasError = true; } else { emailInput.classList.remove('input--error'); }
      if (!password) { passwordInput.classList.add('input--error'); hasError = true; } else { passwordInput.classList.remove('input--error'); }
      if (hasError) { store.showToast('Por favor completa todos los campos', 'error'); return; }

      // Set loading state
      loginBtn.classList.add('btn--loading');
      loginBtn.innerHTML = 'Iniciando sesión...';
      emailInput.disabled = true;
      passwordInput.disabled = true;

      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        store.setAuth(data.user, data.accessToken, data.refreshToken);
        store.showToast(`¡Bienvenido, ${data.user.name.split(' ')[0]}!`, 'success');

        const defaultPage = data.user.role === 'medico' ? '#/requests' : '#/dashboard';
        window.location.hash = defaultPage;
      } catch (err) {
        // Reset loading state
        loginBtn.classList.remove('btn--loading');
        loginBtn.innerHTML = '<i data-lucide="log-in"></i> Iniciar Sesión';
        lucide.createIcons();
        emailInput.disabled = false;
        passwordInput.disabled = false;

        // Shake error animation
        emailInput.classList.add('input--error');
        passwordInput.classList.add('input--error');
        store.showToast(err.message || 'Credenciales inválidas. Intenta de nuevo.', 'error');
      }
    });
  }
};

window.LoginView = LoginView;
