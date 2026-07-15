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
          <p>Solicitudes y Autorizaciones PAC</p>
        </div>

        <form id="login-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" class="input" placeholder="ejemplo@oficinavirtual.com" required value="medico@oficinavirtual.com">
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label for="password">Contraseña</label>
              <a href="#/forgot-password" class="btn-text" style="font-size: 11px;">¿Olvidó contraseña?</a>
            </div>
            <input type="password" id="password" class="input" placeholder="••••••••" required value="Medico123*">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
            <i data-lucide="log-in"></i> Iniciar Sesión
          </button>
        </form>
        
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--text-muted);">
          <span>Cuentas de prueba:<br>
            <strong>Médico:</strong> medico@oficinavirtual.com / Medico123*<br>
            <strong>Autorizador:</strong> autorizador@oficinavirtual.com / Autorizador123*<br>
            <strong>Admin:</strong> admin@oficinavirtual.com / Admin123*
          </span>
        </div>
      </div>
    `;
  },

  afterRender() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        store.setAuth(data.user, data.accessToken, data.refreshToken);
        store.showToast('¡Bienvenido a la Oficina Virtual!', 'success');
        
        // Redirect to dashboard
        window.location.hash = '#/dashboard';
      } catch (err) {
        store.showToast(err.message || 'Error al iniciar sesión', 'error');
      }
    });
  }
};

window.LoginView = LoginView;
