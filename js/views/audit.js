// OFICINA VIRTUAL - AUDIT LOG VIEW (VANILLA JS)

const AuditView = {
  logs: [],
  currentPage: 1,
  pageSize: 15,

  async render() {
    return `
      <div class="card">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h2>Bitácora de Auditoría del Sistema</h2>
            <span id="audit-results-badge" class="results-count hidden">0 registros</span>
          </div>
          <button id="btn-refresh-audit" class="btn btn-secondary" style="height: 38px; padding: 0 14px; font-size: 13px;" title="Recargar">
            <i data-lucide="refresh-cw"></i> Actualizar
          </button>
        </div>

        <!-- Filters -->
        <form id="audit-filters-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="audit-filter-action">Tipo de Acción</label>
            <select id="audit-filter-action" class="input select">
              <option value="">Todas las acciones</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE_REQUEST">Crear Solicitud</option>
              <option value="UPDATE_STATUS">Cambiar Estado</option>
              <option value="CREATE_USER">Crear Usuario</option>
              <option value="UPDATE_USER">Editar Usuario</option>
              <option value="PASSWORD_RESET">Cambio Contraseña</option>
              <option value="FAILED">Eventos Fallidos</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="audit-filter-user">Usuario / Email</label>
            <input type="text" id="audit-filter-user" class="input" placeholder="Buscar usuario...">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="audit-filter-start">Fecha Inicio</label>
            <input type="date" id="audit-filter-start" class="input">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="audit-filter-end">Fecha Fin</label>
            <input type="date" id="audit-filter-end" class="input">
          </div>

          <div style="display: flex; align-items: flex-end; gap: 8px;">
            <button type="submit" class="btn btn-primary" style="flex: 1; height: 42px; padding: 0 14px;">
              <i data-lucide="search"></i> Filtrar
            </button>
            <button type="button" id="audit-clear-filters" class="btn btn-secondary" style="height: 42px; width: 42px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Limpiar">
              <i data-lucide="rotate-ccw"></i>
            </button>
          </div>
        </form>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario / Rol</th>
                <th>Acción</th>
                <th>Descripción / Detalles</th>
                <th>IP / Navegador</th>
              </tr>
            </thead>
            <tbody id="audit-table-body">
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                  <i data-lucide="loader" class="animate-spin" style="margin: 0 auto 8px auto; width: 24px; height: 24px;"></i>
                  Cargando bitácora...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="audit-pagination" style="display: none;">
          <span class="pagination-info" id="audit-pagination-info">Mostrando 0 de 0</span>
          <div class="pagination-controls" id="audit-pagination-controls"></div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const self = this;
    const form = document.getElementById('audit-filters-form');
    const clearBtn = document.getElementById('audit-clear-filters');
    const refreshBtn = document.getElementById('btn-refresh-audit');

    await loadAuditLogs();

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        self.currentPage = 1;
        await loadAuditLogs();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        form.reset();
        self.currentPage = 1;
        await loadAuditLogs();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.classList.add('btn--loading');
        refreshBtn.innerHTML = 'Actualizando...';
        await loadAuditLogs();
        refreshBtn.classList.remove('btn--loading');
        refreshBtn.innerHTML = '<i data-lucide="refresh-cw"></i> Actualizar';
        lucide.createIcons();
      });
    }

    async function loadAuditLogs() {
      const tableBody = document.getElementById('audit-table-body');
      const resultsBadge = document.getElementById('audit-results-badge');
      const paginationEl = document.getElementById('audit-pagination');
      if (!tableBody) return;

      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i data-lucide="loader" class="animate-spin" style="margin: 0 auto 8px auto; width: 24px; height: 24px;"></i>
            Cargando bitácora...
          </td>
        </tr>
      `;
      if (paginationEl) paginationEl.style.display = 'none';
      if (resultsBadge) resultsBadge.classList.add('hidden');
      lucide.createIcons();

      try {
        const logs = await apiFetch('/users/audit-logs');
        self.logs = logs;

        // Apply client-side filters
        const actionFilter = document.getElementById('audit-filter-action')?.value?.toLowerCase() || '';
        const userFilter = document.getElementById('audit-filter-user')?.value?.toLowerCase() || '';
        const startFilter = document.getElementById('audit-filter-start')?.value;
        const endFilter = document.getElementById('audit-filter-end')?.value;

        let filtered = logs;
        if (actionFilter) {
          filtered = filtered.filter(l => l.action.toLowerCase().includes(actionFilter));
        }
        if (userFilter) {
          filtered = filtered.filter(l => (l.userName || '').toLowerCase().includes(userFilter) || (l.userEmail || '').toLowerCase().includes(userFilter));
        }
        if (startFilter) {
          filtered = filtered.filter(l => new Date(l.createdAt) >= new Date(startFilter));
        }
        if (endFilter) {
          const endDate = new Date(endFilter);
          endDate.setHours(23, 59, 59);
          filtered = filtered.filter(l => new Date(l.createdAt) <= endDate);
        }

        self.filteredLogs = filtered;

        if (resultsBadge) {
          resultsBadge.textContent = `${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`;
          resultsBadge.classList.remove('hidden');
        }

        if (filtered.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 56px 20px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                  <i data-lucide="file-search" style="width: 40px; height: 40px; opacity: 0.4;"></i>
                  <div>
                    <p style="font-weight: 600; margin-bottom: 4px;">Sin registros</p>
                    <p style="font-size: 12px;">No se encontraron logs con los filtros aplicados.</p>
                  </div>
                </div>
              </td>
            </tr>
          `;
          lucide.createIcons();
          return;
        }

        self.renderAuditPage();
        self.renderAuditPagination();

      } catch (err) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: #ef4444; padding: 48px 20px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <i data-lucide="alert-triangle" style="width: 36px; height: 36px;"></i>
                <div>
                  <p style="font-weight: 600; margin-bottom: 4px;">Error al cargar bitácora</p>
                  <p style="font-size: 12px; color: var(--text-muted);">${err.message || 'Error desconocido'}</p>
                </div>
              </div>
            </td>
          </tr>
        `;
        lucide.createIcons();
      }
    }
  },

  renderAuditPage() {
    const tableBody = document.getElementById('audit-table-body');
    if (!tableBody || !this.filteredLogs) return;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageItems = this.filteredLogs.slice(start, end);

    tableBody.innerHTML = pageItems.map(log => {
      const dateStr = new Date(log.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

      let actionBadge = 'badge badge-en_revision';
      if (log.action.includes('SUCCESS') || log.action === 'CREATE_REQUEST' || log.action === 'CREATE_USER') {
        actionBadge = 'badge badge-aprobada';
      } else if (log.action.includes('FAILED') || log.action.includes('EXPIRED') || log.action.includes('INVALID')) {
        actionBadge = 'badge badge-rechazada';
      } else if (log.action.includes('PASSWORD') || log.action.includes('RESET')) {
        actionBadge = 'badge badge-pendiente';
      } else if (log.action === 'LOGOUT') {
        actionBadge = 'badge badge-informacion_adicional';
      }

      const browser = log.userAgent ? getBrowserName(log.userAgent) : 'Desconocido';

      return `
        <tr>
          <td style="font-weight: 500; white-space: nowrap;">${dateStr}</td>
          <td>
            <div style="font-weight: 600;">${log.userName || 'Sistema'}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px;">${log.userRole || 'N/A'}</div>
          </td>
          <td><span class="${actionBadge}" style="font-size: 10px;">${log.action}</span></td>
          <td style="max-width: 300px; line-height: 1.4; font-size: 12.5px;">${log.details}</td>
          <td>
            <div style="font-weight: 500; font-size: 12px;">IP: ${log.ipAddress || '127.0.0.1'}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${browser}</div>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  },

  renderAuditPagination() {
    const totalPages = Math.ceil(this.filteredLogs.length / this.pageSize);
    const paginationEl = document.getElementById('audit-pagination');
    const infoEl = document.getElementById('audit-pagination-info');
    const controlsEl = document.getElementById('audit-pagination-controls');

    if (!paginationEl || !infoEl || !controlsEl) return;

    const start = Math.min((this.currentPage - 1) * this.pageSize + 1, this.filteredLogs.length);
    const end = Math.min(this.currentPage * this.pageSize, this.filteredLogs.length);

    infoEl.textContent = `Mostrando ${start}–${end} de ${this.filteredLogs.length} registros`;

    if (totalPages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';

    let pagesHtml = `<button class="page-btn" id="audit-pg-prev" ${this.currentPage === 1 ? 'disabled' : ''} title="Anterior"><i data-lucide="chevron-left"></i></button>`;

    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - range && i <= this.currentPage + range)) {
        pagesHtml += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-audit-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - range - 1 || i === this.currentPage + range + 1) {
        pagesHtml += `<span style="display: flex; align-items: center; padding: 0 4px; color: var(--text-muted);">…</span>`;
      }
    }

    pagesHtml += `<button class="page-btn" id="audit-pg-next" ${this.currentPage === totalPages ? 'disabled' : ''} title="Siguiente"><i data-lucide="chevron-right"></i></button>`;

    controlsEl.innerHTML = pagesHtml;
    lucide.createIcons();

    const self = this;
    document.getElementById('audit-pg-prev')?.addEventListener('click', () => {
      if (self.currentPage > 1) { self.currentPage--; self.renderAuditPage(); self.renderAuditPagination(); }
    });
    document.getElementById('audit-pg-next')?.addEventListener('click', () => {
      if (self.currentPage < totalPages) { self.currentPage++; self.renderAuditPage(); self.renderAuditPagination(); }
    });
    controlsEl.querySelectorAll('[data-audit-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        self.currentPage = parseInt(btn.getAttribute('data-audit-page'));
        self.renderAuditPage();
        self.renderAuditPagination();
      });
    });
  }
};

function getBrowserName(ua) {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Navegador Web';
}

window.AuditView = AuditView;
