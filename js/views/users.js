// OFICINA VIRTUAL - USERS MANAGEMENT VIEW (VANILLA JS)

const UsersView = {
  users: [],

  async render() {
    return `
      <div class="card">
        <div class="card-header">
          <h2>Usuarios del Sistema</h2>
          <button id="btn-create-user" class="btn btn-primary">
            <i data-lucide="user-plus"></i> Registrar Usuario
          </button>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Identificación</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Especialidad / IPS</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                  <i data-lucide="loader" class="animate-spin" style="margin: 0 auto 8px auto; width: 24px; height: 24px;"></i>
                  Cargando usuarios...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const self = this;
    const createBtn = document.getElementById('btn-create-user');
    
    await loadUsers();

    if (createBtn) {
      createBtn.addEventListener('click', () => openCreateModal());
    }

    async function loadUsers() {
      const tableBody = document.getElementById('users-table-body');
      if (!tableBody) return;

      try {
        const users = await apiFetch('/users');
        self.users = users;

        if (users.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                No hay usuarios registrados.
              </td>
            </tr>
          `;
          return;
        }

        tableBody.innerHTML = users.map(user => {
          const statusBadge = user.status === 'active' ? 'badge badge-aprobada' : 'badge badge-rechazada';
          const statusLabel = user.status === 'active' ? 'ACTIVO' : 'INACTIVO';
          
          return `
            <tr>
              <td style="font-weight: 600;">${user.name}</td>
              <td>${user.document}</td>
              <td>${user.email}</td>
              <td><span class="badge badge-en_revision">${user.role.toUpperCase()}</span></td>
              <td>
                ${user.role === 'medico' ? `
                  <div style="font-weight: 500;">${user.specialty || 'Sin especialidad'}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">IPS: ${user.ips || 'N/A'}</div>
                ` : '<span style="color: var(--text-muted);">N/A</span>'}
              </td>
              <td><span class="${statusBadge}">${statusLabel}</span></td>
              <td style="text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                <button class="btn btn-secondary btn-edit-user" data-id="${user.id}" style="padding: 6px 12px; font-size: 12px;">
                  <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Editar
                </button>
                <button class="btn btn-secondary btn-reset-pwd" data-id="${user.id}" style="padding: 6px 12px; font-size: 12px;" title="Reestablecer Contraseña">
                  <i data-lucide="key" style="width: 14px; height: 14px;"></i> Contraseña
                </button>
              </td>
            </tr>
          `;
        }).join('');

        lucide.createIcons();
        bindActionEvents();

      } catch (err) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: #ef4444; padding: 40px;">
              <i data-lucide="alert-triangle" style="margin: 0 auto 12px auto; width: 36px; height: 36px;"></i>
              Error al cargar usuarios: ${err.message || 'Error desconocido'}
            </td>
          </tr>
        `;
        lucide.createIcons();
      }
    }

    function bindActionEvents() {
      // Edit User Bindings
      document.querySelectorAll('.btn-edit-user').forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = btn.getAttribute('data-id');
          const user = self.users.find(u => u.id === userId);
          if (user) openEditModal(user);
        });
      });

      // Reset Password Bindings
      document.querySelectorAll('.btn-reset-pwd').forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = btn.getAttribute('data-id');
          const user = self.users.find(u => u.id === userId);
          if (user) openResetModal(user);
        });
      });
    }

    // Modal Control Helpers
    function showModal(title, bodyHtml) {
      const modal = document.getElementById('global-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalBody = document.getElementById('modal-body');
      const modalClose = document.getElementById('modal-close');

      modalTitle.innerText = title;
      modalBody.innerHTML = bodyHtml;
      modal.classList.remove('hidden');

      const closeModal = () => modal.classList.add('hidden');
      modalClose.onclick = closeModal;
      modal.querySelector('.modal-backdrop').onclick = closeModal;
      lucide.createIcons();
    }

    function hideModal() {
      document.getElementById('global-modal').classList.add('hidden');
    }

    function openCreateModal() {
      const bodyHtml = `
        <form id="modal-create-user-form">
          <div class="form-group">
            <label for="new-name">Nombre Completo</label>
            <input type="text" id="new-name" class="input" required placeholder="Ej: Dr. Manuel Santos">
          </div>
          <div class="form-group">
            <label for="new-doc">Número de Documento</label>
            <input type="text" id="new-doc" class="input" required placeholder="Ej: 1040332211">
          </div>
          <div class="form-group">
            <label for="new-email">Correo Electrónico</label>
            <input type="email" id="new-email" class="input" required placeholder="ejemplo@oficinavirtual.com">
          </div>
          <div class="form-group">
            <label for="new-role">Rol de Usuario</label>
            <select id="new-role" class="input select" required>
              <option value="" disabled selected>Seleccione rol</option>
              <option value="medico">Médico</option>
              <option value="autorizador">Autorizador</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <!-- Specialty & IPS fields, shown conditionally -->
          <div id="new-doc-fields" class="hidden">
            <div class="form-group">
              <label for="new-specialty">Especialidad Médica</label>
              <input type="text" id="new-specialty" class="input" placeholder="Ej: Pediatría">
            </div>
            <div class="form-group">
              <label for="new-ips">IPS Asociada</label>
              <input type="text" id="new-ips" class="input" placeholder="Ej: Hospital San Vicente">
            </div>
          </div>
          <div class="form-group">
            <label for="new-pwd">Contraseña Temporal</label>
            <input type="password" id="new-pwd" class="input" placeholder="Ej: Salud123*" value="Salud123*" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal').classList.add('hidden')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar Usuario</button>
          </div>
        </form>
      `;

      showModal('Registrar Nuevo Usuario', bodyHtml);

      // Role selector listener to toggle doctor fields
      const roleSel = document.getElementById('new-role');
      const docFields = document.getElementById('new-doc-fields');
      roleSel.addEventListener('change', () => {
        if (roleSel.value === 'medico') {
          docFields.classList.remove('hidden');
        } else {
          docFields.classList.add('hidden');
        }
      });

      // Submit handler
      const form = document.getElementById('modal-create-user-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('new-name').value,
          document: document.getElementById('new-doc').value,
          email: document.getElementById('new-email').value,
          role: roleSel.value,
          password: document.getElementById('new-pwd').value,
          specialty: document.getElementById('new-specialty')?.value || '',
          ips: document.getElementById('new-ips')?.value || '',
        };

        try {
          await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          store.showToast('Usuario registrado exitosamente', 'success');
          hideModal();
          await loadUsers();
        } catch (err) {
          store.showToast(err.message || 'Error al registrar usuario', 'error');
        }
      });
    }

    function openEditModal(user) {
      const isMedico = user.role === 'medico';

      const bodyHtml = `
        <form id="modal-edit-user-form">
          <div class="form-group">
            <label for="edit-name">Nombre Completo</label>
            <input type="text" id="edit-name" class="input" required value="${user.name}">
          </div>
          <div class="form-group">
            <label for="edit-role">Rol</label>
            <select id="edit-role" class="input select" required>
              <option value="medico" ${user.role === 'medico' ? 'selected' : ''}>Médico</option>
              <option value="autorizador" ${user.role === 'autorizador' ? 'selected' : ''}>Autorizador</option>
              <option value="administrador" ${user.role === 'administrador' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-status">Estado</label>
            <select id="edit-status" class="input select" required>
              <option value="active" ${user.status === 'active' ? 'selected' : ''}>Activo</option>
              <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
          
          <div id="edit-doc-fields" class="${isMedico ? '' : 'hidden'}">
            <div class="form-group">
              <label for="edit-specialty">Especialidad</label>
              <input type="text" id="edit-specialty" class="input" value="${user.specialty || ''}">
            </div>
            <div class="form-group">
              <label for="edit-ips">IPS</label>
              <input type="text" id="edit-ips" class="input" value="${user.ips || ''}">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal').classList.add('hidden')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      `;

      showModal('Editar Usuario', bodyHtml);

      const roleSel = document.getElementById('edit-role');
      const docFields = document.getElementById('edit-doc-fields');
      roleSel.addEventListener('change', () => {
        if (roleSel.value === 'medico') {
          docFields.classList.remove('hidden');
        } else {
          docFields.classList.add('hidden');
        }
      });

      const form = document.getElementById('modal-edit-user-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById('edit-name').value,
          role: roleSel.value,
          status: document.getElementById('edit-status').value,
          specialty: document.getElementById('edit-specialty')?.value || '',
          ips: document.getElementById('edit-ips')?.value || '',
        };

        try {
          await apiFetch(`/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          store.showToast('Usuario actualizado correctamente', 'success');
          hideModal();
          await loadUsers();
        } catch (err) {
          store.showToast(err.message || 'Error al actualizar usuario', 'error');
        }
      });
    }

    function openResetModal(user) {
      const bodyHtml = `
        <form id="modal-reset-pwd-form">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            Ingresa la nueva contraseña temporal para el usuario <strong>${user.name}</strong> (${user.email}).
          </p>
          <div class="form-group">
            <label for="admin-new-pwd">Nueva Contraseña</label>
            <input type="password" id="admin-new-pwd" class="input" placeholder="Min 6 caracteres" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal').classList.add('hidden')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Restablecer Clave</button>
          </div>
        </form>
      `;

      showModal('Restablecer Contraseña', bodyHtml);

      const form = document.getElementById('modal-reset-pwd-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('admin-new-pwd').value;

        try {
          await apiFetch(`/users/${user.id}/reset-password`, {
            method: 'PUT',
            body: JSON.stringify({ newPassword }),
          });
          store.showToast('Contraseña restablecida con éxito.', 'success');
          hideModal();
        } catch (err) {
          store.showToast(err.message || 'Error al restablecer contraseña', 'error');
        }
      });
    }
  }
};

window.UsersView = UsersView;
