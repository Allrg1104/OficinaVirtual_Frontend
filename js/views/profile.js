// OFICINA VIRTUAL - PROFILE VIEW (VANILLA JS)

const ProfileView = {
  render() {
    const user = store.state.user;
    if (!user) return `<div class="card">No has iniciado sesión</div>`;

    const isDoctor = user.role === 'medico';

    return `
      <div style="max-width: 800px; margin: 0 auto;">
        <div class="card">
          <div class="card-header">
            <h2>Mi Perfil</h2>
            <span class="badge badge-en_revision">${user.role.toUpperCase()}</span>
          </div>

          <form id="profile-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div class="form-group">
                <label>Nombre Completo</label>
                <input type="text" id="profile-name" class="input" value="${user.name}" required>
              </div>

              <div class="form-group">
                <label>Número de Documento</label>
                <input type="text" class="input" value="${user.document}" readonly style="background-color: var(--surface-hover); cursor: not-allowed;">
              </div>

              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" class="input" value="${user.email}" readonly style="background-color: var(--surface-hover); cursor: not-allowed;">
              </div>

              ${isDoctor ? `
                <div class="form-group">
                  <label>Especialidad</label>
                  <input type="text" id="profile-specialty" class="input" value="${user.specialty || ''}">
                </div>
                <div class="form-group">
                  <label>IPS / Centro de Salud</label>
                  <input type="text" id="profile-ips" class="input" value="${user.ips || ''}">
                </div>
              ` : ''}
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
              <i data-lucide="save"></i> Guardar Cambios
            </button>
          </form>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Cambiar Contraseña</h2>
          </div>

          <form id="change-pwd-form">
            <div class="form-group">
              <label for="old-password">Contraseña Actual</label>
              <input type="password" id="old-password" class="input" placeholder="••••••••" required>
            </div>

            <div class="form-group">
              <label for="new-password">Nueva Contraseña</label>
              <input type="password" id="new-password" class="input" placeholder="Min 6 caracteres" required>
            </div>

            <button type="submit" class="btn btn-primary">
              <i data-lucide="lock"></i> Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    `;
  },

  afterRender() {
    const profileForm = document.getElementById('profile-form');
    const pwdForm = document.getElementById('change-pwd-form');

    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('profile-name').value;
        const specialty = document.getElementById('profile-specialty')?.value;
        const ips = document.getElementById('profile-ips')?.value;

        try {
          const result = await apiFetch('/profile', {
            method: 'PUT',
            body: JSON.stringify({ name, specialty, ips }),
          });

          store.updateUser(result.user);
          store.showToast('Perfil actualizado correctamente.', 'success');
        } catch (err) {
          store.showToast(err.message || 'Error al actualizar perfil', 'error');
        }
      });
    }

    if (pwdForm) {
      pwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;

        try {
          await apiFetch('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify({ oldPassword, newPassword }),
          });

          store.showToast('Contraseña actualizada correctamente.', 'success');
          pwdForm.reset();
        } catch (err) {
          store.showToast(err.message || 'Error al cambiar contraseña', 'error');
        }
      });
    }
  }
};

window.ProfileView = ProfileView;
