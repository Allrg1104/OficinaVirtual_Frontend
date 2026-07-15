// OFICINA VIRTUAL - DASHBOARD VIEW (VANILLA JS)

const DashboardView = {
  stats: null,

  async render() {
    return `
      <!-- Dashboard Filters -->
      <form id="dash-filters-form" class="card" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; padding: 16px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label for="dash-filter-specialty">Especialidad</label>
          <input type="text" id="dash-filter-specialty" class="input" placeholder="Ej: Cardiología">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label for="dash-filter-start">Fecha Inicio</label>
          <input type="date" id="dash-filter-start" class="input">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label for="dash-filter-end">Fecha Fin</label>
          <input type="date" id="dash-filter-end" class="input">
        </div>
        <div style="display: flex; align-items: flex-end; gap: 8px;">
          <button type="submit" class="btn btn-primary" style="flex: 1; height: 40px;">
            <i data-lucide="search"></i> Aplicar
          </button>
          <button type="button" id="dash-clear-filters" class="btn btn-secondary" style="height: 40px; width: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="rotate-ccw"></i>
          </button>
        </div>
      </form>

      <!-- Dashboard Loader -->
      <div id="dash-loader" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="loader" class="animate-spin" style="width: 32px; height: 32px; margin: 0 auto 10px auto;"></i>
        Cargando indicadores...
      </div>

      <!-- Dashboard Cards -->
      <div id="dash-indicators" class="metrics-grid hidden">
        <!-- Filled dynamically -->
      </div>

      <!-- Charts Section -->
      <div id="dash-charts" class="hidden">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <!-- Chart 1: Solicitudes por Mes -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Solicitudes por Mes</h2></div>
            <div class="chart-container" id="chart-months-wrapper"></div>
          </div>
          <!-- Chart 2: Solicitudes por Estado -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Solicitudes por Estado</h2></div>
            <div class="chart-container" id="chart-status-wrapper" style="display: flex; align-items: center; justify-content: center;"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Chart 3: Top Médicos -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Médicos con Más Solicitudes</h2></div>
            <div id="chart-doctors-wrapper" style="display: flex; flex-direction: column; gap: 12px; padding-top: 10px;"></div>
          </div>
          <!-- Chart 4: Top Especialidades -->
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Especialidades Más Solicitadas</h2></div>
            <div id="chart-specialties-wrapper" style="display: flex; flex-direction: column; gap: 12px; padding-top: 10px;"></div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const self = this;
    const form = document.getElementById('dash-filters-form');
    const clearBtn = document.getElementById('dash-clear-filters');

    await loadDashboard();

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await loadDashboard();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        form.reset();
        await loadDashboard();
      });
    }

    async function loadDashboard() {
      const loader = document.getElementById('dash-loader');
      const indicatorsContainer = document.getElementById('dash-indicators');
      const chartsContainer = document.getElementById('dash-charts');

      loader.classList.remove('hidden');
      indicatorsContainer.classList.add('hidden');
      chartsContainer.classList.add('hidden');
      lucide.createIcons();

      try {
        const specialty = document.getElementById('dash-filter-specialty').value;
        const startDate = document.getElementById('dash-filter-start').value;
        const endDate = document.getElementById('dash-filter-end').value;

        const filters = {};
        if (specialty) filters.specialty = specialty;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const urlParams = new URLSearchParams(filters).toString();
        const stats = await apiFetch(`/dashboard/stats?${urlParams}`);
        self.stats = stats;

        loader.classList.add('hidden');
        indicatorsContainer.classList.remove('hidden');
        chartsContainer.classList.remove('hidden');

        renderIndicators(stats.indicators);
        renderCharts(stats);

      } catch (err) {
        loader.innerHTML = `
          <div class="card" style="text-align: center; padding: 40px; border-color: #fca5a5;">
            <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: #ef4444; margin: 0 auto 16px auto;"></i>
            <h3>Error al cargar panel</h3>
            <p style="color: var(--text-muted); font-size: 13px;">${err.message || 'Error de conexión'}</p>
          </div>
        `;
        lucide.createIcons();
      }
    }

    function renderIndicators(ind) {
      const indicatorsContainer = document.getElementById('dash-indicators');
      
      const cards = [
        { title: 'Total Solicitudes', val: ind.total, color: 'var(--primary)', bg: 'var(--primary-light)', icon: 'file-text' },
        { title: 'Pendientes', val: ind.pendiente, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: 'clock' },
        { title: 'En Revisión', val: ind.en_revision, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: 'eye' },
        { title: 'Aprobadas', val: ind.aprobada, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: 'check-circle' },
        { title: 'Rechazadas', val: ind.rechazada, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: 'x-circle' },
      ];

      indicatorsContainer.innerHTML = cards.map(c => `
        <div class="metric-card">
          <div class="metric-icon" style="background-color: ${c.bg}; color: ${c.color};">
            <i data-lucide="${c.icon}"></i>
          </div>
          <div class="metric-info">
            <h3>${c.title}</h3>
            <p>${c.val}</p>
          </div>
        </div>
      `).join('');

      lucide.createIcons();
    }

    function renderCharts(data) {
      // 1. Render Monthly Bar Chart (SVG)
      const monthsWrapper = document.getElementById('chart-months-wrapper');
      if (data.requestsByMonth && data.requestsByMonth.length > 0) {
        monthsWrapper.innerHTML = drawBarChart(data.requestsByMonth);
      } else {
        monthsWrapper.innerHTML = '<div class="dropdown-empty">No hay datos para este rango</div>';
      }

      // 2. Render Status Donut Chart (SVG)
      const statusWrapper = document.getElementById('chart-status-wrapper');
      if (data.requestsByStatus && data.requestsByStatus.length > 0 && data.indicators.total > 0) {
        statusWrapper.innerHTML = drawDonutChart(data.requestsByStatus);
      } else {
        statusWrapper.innerHTML = '<div class="dropdown-empty">Sin solicitudes registradas</div>';
      }

      // 3. Render Top Doctors list (Dynamic progress bar list)
      const doctorsWrapper = document.getElementById('chart-doctors-wrapper');
      if (data.requestsByDoctor && data.requestsByDoctor.length > 0) {
        const maxDocVal = Math.max(...data.requestsByDoctor.map(d => d.count), 1);
        doctorsWrapper.innerHTML = data.requestsByDoctor.map(d => {
          const width = (d.count / maxDocVal) * 100;
          return `
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>${d.name}</span>
                <strong>${d.count} sol.</strong>
              </div>
              <div style="background-color: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, var(--primary), #6366f1); width: ${width}%; height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        doctorsWrapper.innerHTML = '<div class="dropdown-empty">Sin médicos registrados</div>';
      }

      // 4. Render Top Specialties list
      const specialtiesWrapper = document.getElementById('chart-specialties-wrapper');
      if (data.requestsBySpecialty && data.requestsBySpecialty.length > 0) {
        const maxSpecVal = Math.max(...data.requestsBySpecialty.map(d => d.count), 1);
        specialtiesWrapper.innerHTML = data.requestsBySpecialty.map(s => {
          const width = (s.count / maxSpecVal) * 100;
          return `
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>${s.name}</span>
                <strong>${s.count} sol.</strong>
              </div>
              <div style="background-color: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #10b981, #06b6d4); width: ${width}%; height: 100%; border-radius: 4px;"></div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        specialtiesWrapper.innerHTML = '<div class="dropdown-empty">Sin especialidades registradas</div>';
      }

      lucide.createIcons();
    }

    // Native SVG Bar Chart drawer
    function drawBarChart(data) {
      const maxVal = Math.max(...data.map(d => d.count), 1);
      const bars = data.map((d, i) => {
        const x = i * 65 + 45;
        const height = (d.count / maxVal) * 160;
        const y = 190 - height;
        return `
          <rect class="chart-bar" x="${x}" y="${y}" width="36" height="${height}" rx="4" fill="var(--primary)" />
          <text class="chart-text" x="${x + 18}" y="212" text-anchor="middle" font-size="10" fill="var(--text-muted)">${d.label}</text>
          <text class="chart-text" x="${x + 18}" y="${y - 8}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">${d.count}</text>
        `;
      }).join('');

      return `
        <svg width="100%" height="240" viewBox="0 0 450 240">
          <line x1="20" y1="30" x2="430" y2="30" stroke="var(--border)" stroke-dasharray="4" stroke-width="0.5" />
          <line x1="20" y1="110" x2="430" y2="110" stroke="var(--border)" stroke-dasharray="4" stroke-width="0.5" />
          <line x1="20" y1="190" x2="430" y2="190" stroke="var(--border)" stroke-width="1" />
          ${bars}
        </svg>
      `;
    }

    // Native SVG Donut Chart drawer
    function drawDonutChart(data) {
      const total = data.reduce((acc, d) => acc + d.count, 0);
      let accumulatedAngle = 0;
      
      const r = 45;
      const cx = 70;
      const cy = 70;
      const c = 2 * Math.PI * r; // 282.74

      const slices = data.map(d => {
        const percentage = d.count / total;
        const strokeDash = percentage * c;
        const strokeOffset = c - accumulatedAngle;
        accumulatedAngle += strokeDash;

        let color = 'var(--primary)';
        if (d.status === 'APROBADA') color = '#10b981';
        else if (d.status === 'RECHAZADA') color = '#ef4444';
        else if (d.status === 'PENDIENTE') color = '#f59e0b';
        else if (d.status === 'EN REVISION') color = '#3b82f6';
        else if (d.status === 'INFORMACION ADICIONAL') color = '#8b5cf6';

        return `
          <circle r="${r}" cx="${cx}" cy="${cy}" fill="transparent" 
                  stroke="${color}" stroke-width="14" 
                  stroke-dasharray="${strokeDash} ${c - strokeDash}" 
                  stroke-dashoffset="${strokeOffset}" 
                  transform="rotate(-90 ${cx} ${cy})"/>
        `;
      }).join('');

      const legends = data.map(d => {
        let color = 'var(--primary)';
        if (d.status === 'APROBADA') color = '#10b981';
        else if (d.status === 'RECHAZADA') color = '#ef4444';
        else if (d.status === 'PENDIENTE') color = '#f59e0b';
        else if (d.status === 'EN REVISION') color = '#3b82f6';
        else if (d.status === 'INFORMACION ADICIONAL') color = '#8b5cf6';

        return `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 3px; background-color: ${color};"></span>
            <span style="font-weight: 700; min-width: 16px;">${d.count}</span>
            <span style="color: var(--text-muted); text-transform: capitalize;">${d.status.toLowerCase()}</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; align-items: center; justify-content: space-around; width: 100%; gap: 20px; padding: 10px;">
          <svg width="140" height="140" viewBox="0 0 140 140">
            ${slices}
            <circle r="36" cx="${cx}" cy="${cy}" fill="var(--surface)" />
            <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="var(--text)">${total}</text>
          </svg>
          <div style="display: flex; flex-direction: column;">
            ${legends}
          </div>
        </div>
      `;
    }
  }
};

window.DashboardView = DashboardView;
