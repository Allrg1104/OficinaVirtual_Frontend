// OFICINA VIRTUAL - REQUESTS LIST VIEW (VANILLA JS)

const RequestsView = {
  requests: [],

  async render() {
    const user = store.state.user;
    const isDoctor = user.role === 'medico';

    return `
      <div class="card">
        <div class="card-header" style="flex-wrap: wrap; gap: 16px;">
          <h2>Bandeja de Solicitudes</h2>
          <div style="display: flex; gap: 12px;">
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

        <!-- Filters Section -->
        <form id="filters-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="filter-status">Estado</label>
            <select id="filter-status" class="input select">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="informacion_adicional">Información Adicional</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label for="filter-doc">Documento Paciente</label>
            <input type="text" id="filter-doc" class="input" placeholder="Buscar por documento">
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
            <button type="submit" class="btn btn-primary" style="flex: 1; height: 40px; padding: 0 16px;">
              <i data-lucide="search"></i> Filtrar
            </button>
            <button type="button" id="btn-clear-filters" class="btn btn-secondary" style="height: 40px; width: 40px; padding: 0; display: flex; align-items: center; justify-content: center;" title="Limpiar filtros">
              <i data-lucide="rotate-ccw"></i>
            </button>
          </div>
        </form>

        <!-- Requests Table -->
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
              <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                  <i data-lucide="loader" class="animate-spin" style="margin: 0 auto 8px auto; width: 24px; height: 24px;"></i>
                  Buscando solicitudes...
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
    const form = document.getElementById('filters-form');
    const tableBody = document.getElementById('requests-table-body');
    const clearBtn = document.getElementById('btn-clear-filters');
    const exportBtn = document.getElementById('btn-export-excel');

    // Initial load
    await loadTable();

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loadTable();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        form.reset();
        await loadTable();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const queryParams = getFormFilters();
        const urlParams = new URLSearchParams(queryParams).toString();
        const API_URL = 'http://localhost:4000/api';
        
        // Trigger file download
        const downloadUrl = `${API_URL}/export/excel?${urlParams}&token=${store.state.accessToken}`;
        window.open(downloadUrl, '_blank');
      });
    }

    function getFormFilters() {
      const status = document.getElementById('filter-status').value;
      const patientDoc = document.getElementById('filter-doc').value;
      const startDate = document.getElementById('filter-start').value;
      const endDate = document.getElementById('filter-end').value;

      const filters = {};
      if (status) filters.status = status;
      if (patientDoc) filters.patientDoc = patientDoc;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      return filters;
    }

    async function loadTable() {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
            <i data-lucide="loader" class="animate-spin" style="margin: 0 auto 8px auto; width: 24px; height: 24px;"></i>
            Cargando solicitudes...
          </td>
        </tr>
      `;
      lucide.createIcons();

      try {
        const filters = getFormFilters();
        const result = await apiFetch('/requests', {
          method: 'GET',
          // Append query params to the endpoint string manually since dynamic search
          ...({}),
        });

        // Simulating filters in client if needed, but backend handles it!
        // Wait, the apiFetch wrapper takes options. Let's make sure it handles query strings.
        // We can stringify filters into path:
        const queryString = new URLSearchParams(filters).toString();
        const path = `/requests?${queryString}`;
        const searchResult = await apiFetch(path);

        self.requests = searchResult.data || [];

        if (self.requests.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                <i data-lucide="folder-x" style="margin: 0 auto 12px auto; width: 36px; height: 36px;"></i>
                No se encontraron solicitudes con los filtros aplicados.
              </td>
            </tr>
          `;
          lucide.createIcons();
          return;
        }

        const user = store.state.user;
        const isDoc = user.role === 'medico';

        tableBody.innerHTML = self.requests.map(req => {
          const statusBadge = `badge badge-${req.status}`;
          const formattedStatus = req.status.replace('_', ' ').toUpperCase();
          const creationDate = new Date(req.createdAt).toLocaleDateString();

          return `
            <tr>
              <td>
                <div style="font-weight: 600;">#${req._id.substring(req._id.length - 6).toUpperCase()}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${creationDate}</div>
              </td>
              <td>
                <div style="font-weight: 500;">${req.patient.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Doc: ${req.patient.document}</div>
              </td>
              <td>
                <div style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="${req.medicalInfo.diagnosis}">${req.medicalInfo.diagnosis}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">CIE10: ${req.medicalInfo.cie10Code}</div>
              </td>
              <td>
                <div style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="${req.medicalInfo.procedure}">${req.medicalInfo.procedure}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">CUPS: ${req.medicalInfo.cupsCode}</div>
              </td>
              ${!isDoc ? `
                <td>
                  <div style="font-weight: 500;">${req.doctorSnapshot.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">IPS: ${req.doctorSnapshot.ips || 'N/A'}</div>
                </td>
              ` : ''}
              <td>
                <span class="${statusBadge}">${formattedStatus}</span>
              </td>
              <td style="text-align: right;">
                <a href="#/requests/detail?id=${req._id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                  Ver detalle
                </a>
              </td>
            </tr>
          `;
        }).join('');

        lucide.createIcons();
      } catch (err) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: #ef4444; padding: 40px;">
              <i data-lucide="alert-triangle" style="margin: 0 auto 12px auto; width: 36px; height: 36px;"></i>
              Error al cargar solicitudes: ${err.message || 'Error desconocido'}
            </td>
          </tr>
        `;
        lucide.createIcons();
      }
    }
  }
};

window.RequestsView = RequestsView;
