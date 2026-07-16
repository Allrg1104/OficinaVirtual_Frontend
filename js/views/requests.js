// OFICINA VIRTUAL - REQUESTS LIST VIEW (VANILLA JS)

const RequestsView = {
  requests: [],
  filtered: [],
  currentPage: 1,
  pageSize: 10,

  async render() {
    const user = store.state.user;
    const isDoctor = user.role === 'medico';

    return `
      <div class="card">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h2>Bandeja de Solicitudes</h2>
            <span id="results-badge" class="results-count hidden">0 resultados</span>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${!isDoctor ? `
              <button id="btn-export-excel" class="btn btn-secondary">
                <i data-lucide="file-spreadsheet" style="color: #10b981;"></i> Exportar Excel
              </button>
            ` : `
              <a href="#/requests/create" class="btn btn-primary">
                <i data-lucide="file-plus"></i> Nueva Solicitud
              </a>
            `}
          </div>
        </div>

        <!-- Filters -->
        <form id="filters-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="filter-status">Estado</label>
            <select id="filter-status" class="input select">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="informacion_adicional">Info. Adicional</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="filter-doc">Documento Paciente</label>
            <input type="text" id="filter-doc" class="input" placeholder="Buscar documento...">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="filter-start">Fecha Inicio</label>
            <input type="date" id="filter-start" class="input">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="filter-end">Fecha Fin</label>
            <input type="date" id="filter-end" class="input">
          </div>

          <div style="display: flex; align-items: flex-end; gap: 8px;">
            <button type="submit" class="btn btn-primary" style="flex: 1; height: 42px; padding: 0 14px;">
              <i data-lucide="search"></i> Filtrar
            </button>
            <button type="button" id="btn-clear-filters" class="btn btn-secondary" style="height: 42px; width: 42px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Limpiar filtros">
              <i data-lucide="rotate-ccw"></i>
            </button>
          </div>
        </form>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Radicado / Fecha</th>
                <th>Paciente</th>
                <th>Diagnóstico / CIE10</th>
                <th>Procedimiento / CUPS</th>
                ${!isDoctor ? '<th>Médico / IPS</th>' : ''}
                <th>Estado</th>
                <th style="text-align: right;">Acción</th>
              </tr>
            </thead>
            <tbody id="requests-table-body">
              ${this._skeletonRows(6)}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="requests-pagination" style="display: none;">
          <span class="pagination-info" id="pagination-info">Mostrando 0 de 0</span>
          <div class="pagination-controls" id="pagination-controls"></div>
        </div>
      </div>
    `;
  },

  _skeletonRows(count) {
    return Array.from({ length: count }, () => `
      <tr class="skeleton-row">
        <td><div class="skeleton-cell" style="width: 100px;"></div></td>
        <td><div class="skeleton-cell" style="width: 140px;"></div></td>
        <td><div class="skeleton-cell" style="width: 180px;"></div></td>
        <td><div class="skeleton-cell" style="width: 160px;"></div></td>
        <td><div class="skeleton-cell" style="width: 80px;"></div></td>
        <td><div class="skeleton-cell" style="width: 70px; margin-left: auto;"></div></td>
      </tr>
    `).join('');
  },

  async afterRender() {
    const self = this;
    const form = document.getElementById('filters-form');
    const clearBtn = document.getElementById('btn-clear-filters');
    const exportBtn = document.getElementById('btn-export-excel');

    await loadTable();

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        self.currentPage = 1;
        await loadTable();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        form.reset();
        self.currentPage = 1;
        await loadTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const queryParams = getFormFilters();
        const urlParams = new URLSearchParams(queryParams).toString();
        const API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:4000/api';
        const downloadUrl = `${API_URL}/export/excel?${urlParams}&token=${store.state.accessToken}`;
        window.open(downloadUrl, '_blank');
      });
    }

    function getFormFilters() {
      const status = document.getElementById('filter-status')?.value;
      const patientDoc = document.getElementById('filter-doc')?.value;
      const startDate = document.getElementById('filter-start')?.value;
      const endDate = document.getElementById('filter-end')?.value;
      const filters = {};
      if (status) filters.status = status;
      if (patientDoc) filters.patientDoc = patientDoc;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      return filters;
    }

    async function loadTable() {
      const tableBody = document.getElementById('requests-table-body');
      if (!tableBody) return;

      // Show skeleton
      tableBody.innerHTML = self._skeletonRows(5);
      const paginationEl = document.getElementById('requests-pagination');
      if (paginationEl) paginationEl.style.display = 'none';

      const resultsBadge = document.getElementById('results-badge');
      if (resultsBadge) resultsBadge.classList.add('hidden');

      try {
        const filters = getFormFilters();
        const queryString = new URLSearchParams(filters).toString();
        const searchResult = await apiFetch(`/requests?${queryString}`);

        self.requests = searchResult.data || [];

        if (resultsBadge) {
          resultsBadge.textContent = `${self.requests.length} resultado${self.requests.length !== 1 ? 's' : ''}`;
          resultsBadge.classList.remove('hidden');
        }

        if (self.requests.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 56px 20px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                  <i data-lucide="folder-x" style="width: 40px; height: 40px; opacity: 0.4;"></i>
                  <div>
                    <p style="font-weight: 600; margin-bottom: 4px;">Sin resultados</p>
                    <p style="font-size: 12px;">No se encontraron solicitudes con los filtros aplicados.</p>
                  </div>
                </div>
              </td>
            </tr>
          `;
          lucide.createIcons();
          return;
        }

        self.renderPage();
        self.renderPagination();

      } catch (err) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: #ef4444; padding: 48px 20px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <i data-lucide="alert-triangle" style="width: 36px; height: 36px;"></i>
                <div>
                  <p style="font-weight: 600; margin-bottom: 4px;">Error al cargar</p>
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

  renderPage() {
    const tableBody = document.getElementById('requests-table-body');
    if (!tableBody) return;

    const user = store.state.user;
    const isDoc = user.role === 'medico';

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageItems = this.requests.slice(start, end);

    tableBody.innerHTML = pageItems.map(req => {
      const statusBadge = `badge badge-${req.status}`;
      const formattedStatus = req.status.replace(/_/g, ' ').toUpperCase();
      const creationDate = new Date(req.createdAt).toLocaleDateString('es-CO');
      const shortId = req._id.substring(req._id.length - 6).toUpperCase();

      return `
        <tr>
          <td>
            <div style="font-weight: 700; font-size: 13px; color: var(--primary);">#${shortId}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${creationDate}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${req.patient.name}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Doc: ${req.patient.document}</div>
          </td>
          <td>
            <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="${req.medicalInfo.diagnosis}">${req.medicalInfo.diagnosis}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">CIE10: <strong>${req.medicalInfo.cie10Code}</strong></div>
          </td>
          <td>
            <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="${req.medicalInfo.procedure}">${req.medicalInfo.procedure}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">CUPS: <strong>${req.medicalInfo.cupsCode}</strong></div>
          </td>
          ${!isDoc ? `
            <td>
              <div style="font-weight: 500;">${req.doctorSnapshot.name}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">IPS: ${req.doctorSnapshot.ips || 'N/A'}</div>
            </td>
          ` : ''}
          <td><span class="${statusBadge}">${formattedStatus}</span></td>
          <td style="text-align: right;">
            <a href="#/requests/detail?id=${req._id}" class="btn btn-secondary" style="padding: 6px 14px; font-size: 12px;">
              <i data-lucide="eye" style="width: 13px; height: 13px;"></i> Ver detalle
            </a>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  },

  renderPagination() {
    const totalPages = Math.ceil(this.requests.length / this.pageSize);
    const paginationEl = document.getElementById('requests-pagination');
    const infoEl = document.getElementById('pagination-info');
    const controlsEl = document.getElementById('pagination-controls');

    if (!paginationEl || !infoEl || !controlsEl) return;

    const start = Math.min((this.currentPage - 1) * this.pageSize + 1, this.requests.length);
    const end = Math.min(this.currentPage * this.pageSize, this.requests.length);

    infoEl.textContent = `Mostrando ${start}–${end} de ${this.requests.length} solicitudes`;

    if (totalPages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';

    let pagesHtml = `
      <button class="page-btn" id="pg-prev" ${this.currentPage === 1 ? 'disabled' : ''} title="Anterior">
        <i data-lucide="chevron-left"></i>
      </button>
    `;

    // Show up to 5 page buttons around the current page
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - range && i <= this.currentPage + range)) {
        pagesHtml += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - range - 1 || i === this.currentPage + range + 1) {
        pagesHtml += `<span style="display: flex; align-items: center; padding: 0 4px; color: var(--text-muted); font-size: 13px;">…</span>`;
      }
    }

    pagesHtml += `
      <button class="page-btn" id="pg-next" ${this.currentPage === totalPages ? 'disabled' : ''} title="Siguiente">
        <i data-lucide="chevron-right"></i>
      </button>
    `;

    controlsEl.innerHTML = pagesHtml;
    lucide.createIcons();

    const self = this;

    document.getElementById('pg-prev')?.addEventListener('click', () => {
      if (self.currentPage > 1) { self.currentPage--; self.renderPage(); self.renderPagination(); }
    });
    document.getElementById('pg-next')?.addEventListener('click', () => {
      if (self.currentPage < totalPages) { self.currentPage++; self.renderPage(); self.renderPagination(); }
    });
    controlsEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        self.currentPage = parseInt(btn.getAttribute('data-page'));
        self.renderPage();
        self.renderPagination();
      });
    });
  }
};

window.RequestsView = RequestsView;
