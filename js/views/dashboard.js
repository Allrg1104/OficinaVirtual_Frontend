// OFICINA VIRTUAL - DASHBOARD VIEW (VANILLA JS)

const DashboardView = {
  stats: null,

  async render() {
    return `
      <!-- Dashboard Filters -->
      <form id="dash-filters-form" class="card" style="padding: 16px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: flex-end;">
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
          <div style="display: flex; gap: 8px; align-items: flex-end;">
            <button type="submit" class="btn btn-primary" style="flex: 1; height: 42px;">
              <i data-lucide="search"></i> Aplicar
            </button>
            <button type="button" id="dash-clear-filters" class="btn btn-secondary" style="height: 42px; width: 42px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <i data-lucide="rotate-ccw"></i>
            </button>
          </div>
        </div>
      </form>

      <!-- Dashboard Loader -->
      <div id="dash-loader" style="text-align: center; padding: 60px; color: var(--text-muted);">
        <i data-lucide="loader" class="animate-spin" style="width: 36px; height: 36px; margin: 0 auto 12px auto;"></i>
        <p style="font-size: 14px; font-weight: 500;">Cargando indicadores...</p>
      </div>

      <!-- Dashboard Indicators -->
      <div id="dash-indicators" class="metrics-grid hidden"></div>

      <!-- Charts Section -->
      <div id="dash-charts" class="hidden">
        <div class="dash-charts-grid">
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Solicitudes por Mes</h2></div>
            <div class="chart-container" id="chart-months-wrapper"></div>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Solicitudes por Estado</h2></div>
            <div class="chart-container" id="chart-status-wrapper" style="display: flex; align-items: center; justify-content: center;"></div>
          </div>
        </div>

        <div class="dash-charts-grid">
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Médicos con Más Solicitudes</h2></div>
            <div id="chart-doctors-wrapper" style="display: flex; flex-direction: column; gap: 14px; padding-top: 8px;"></div>
          </div>
          <div class="card" style="margin-bottom: 0;">
            <div class="card-header"><h2>Especialidades Más Solicitadas</h2></div>
            <div id="chart-specialties-wrapper" style="display: flex; flex-direction: column; gap: 14px; padding-top: 8px;"></div>
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

      loader.innerHTML = `
        <i data-lucide="loader" class="animate-spin" style="width: 36px; height: 36px; margin: 0 auto 12px auto;"></i>
        <p style="font-size: 14px; font-weight: 500;">Cargando indicadores...</p>
      `;
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
          <div style="max-width: 400px; margin: 0 auto; background: var(--surface); border: 1px solid #fca5a5; border-radius: var(--radius-lg); padding: 32px; text-align: center;">
            <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: #ef4444; margin: 0 auto 16px auto;"></i>
            <h3 style="margin-bottom: 8px;">Error al cargar panel</h3>
            <p style="color: var(--text-muted); font-size: 13px;">${err.message || 'Error de conexión con el servidor'}</p>
          </div>
        `;
        lucide.createIcons();
      }
    }

    function renderIndicators(ind) {
      const container = document.getElementById('dash-indicators');

      const cards = [
        { title: 'Total Solicitudes', val: ind.total, color: 'var(--primary)', bg: 'var(--primary-light)', icon: 'file-text' },
        { title: 'Pendientes', val: ind.pendiente, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: 'clock' },
        { title: 'En Revisión', val: ind.en_revision, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: 'eye' },
        { title: 'Aprobadas', val: ind.aprobada, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: 'check-circle' },
        { title: 'Rechazadas', val: ind.rechazada, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: 'x-circle' },
      ];

      container.innerHTML = cards.map(c => `
        <div class="metric-card">
          <div class="metric-icon" style="background-color: ${c.bg}; color: ${c.color};">
            <i data-lucide="${c.icon}"></i>
          </div>
          <div class="metric-info">
            <h3>${c.title}</h3>
            <p class="count-up-val" data-target="${c.val}">0</p>
          </div>
        </div>
      `).join('');

      lucide.createIcons();

      // Count-up animation
      document.querySelectorAll('.count-up-val').forEach(el => {
        const target = parseInt(el.getAttribute('data-target')) || 0;
        if (target === 0) { el.textContent = '0'; return; }

        let start = 0;
        const duration = 800;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Easing: easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target).toLocaleString('es-CO');
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    }

    function renderCharts(data) {
      // Bar Chart: Requests by Month
      const monthsWrapper = document.getElementById('chart-months-wrapper');
      if (data.requestsByMonth && data.requestsByMonth.length > 0) {
        monthsWrapper.innerHTML = drawBarChart(data.requestsByMonth);
      } else {
        monthsWrapper.innerHTML = '<div class="dropdown-empty">No hay datos de meses para este rango</div>';
      }

      // Donut Chart: Requests by Status
      const statusWrapper = document.getElementById('chart-status-wrapper');
      if (data.requestsByStatus && data.requestsByStatus.length > 0 && data.indicators.total > 0) {
        statusWrapper.innerHTML = drawDonutChart(data.requestsByStatus);
      } else {
        statusWrapper.innerHTML = '<div class="dropdown-empty">Sin solicitudes registradas</div>';
      }

      // Top Doctors bar list
      const doctorsWrapper = document.getElementById('chart-doctors-wrapper');
      if (data.requestsByDoctor && data.requestsByDoctor.length > 0) {
        const maxVal = Math.max(...data.requestsByDoctor.map(d => d.count), 1);
        doctorsWrapper.innerHTML = data.requestsByDoctor.map((d, i) => {
          const width = (d.count / maxVal) * 100;
          return `
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 500;">${d.name}</span>
                <strong style="font-size: 13px;">${d.count}</strong>
              </div>
              <div style="background-color: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                <div class="progress-bar-fill" data-width="${width}" style="background: linear-gradient(90deg, var(--primary), #6366f1); width: 0%; height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 100}ms;"></div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        doctorsWrapper.innerHTML = '<div class="dropdown-empty">Sin médicos con solicitudes</div>';
      }

      // Top Specialties bar list
      const specialtiesWrapper = document.getElementById('chart-specialties-wrapper');
      if (data.requestsBySpecialty && data.requestsBySpecialty.length > 0) {
        const maxVal = Math.max(...data.requestsBySpecialty.map(d => d.count), 1);
        specialtiesWrapper.innerHTML = data.requestsBySpecialty.map((s, i) => {
          const width = (s.count / maxVal) * 100;
          return `
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 500;">${s.name}</span>
                <strong style="font-size: 13px;">${s.count}</strong>
              </div>
              <div style="background-color: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                <div class="progress-bar-fill" data-width="${width}" style="background: linear-gradient(90deg, #10b981, #06b6d4); width: 0%; height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 100}ms;"></div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        specialtiesWrapper.innerHTML = '<div class="dropdown-empty">Sin especialidades registradas</div>';
      }

      // Animate progress bars
      setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-width') + '%';
        });
      }, 50);

      lucide.createIcons();
    }

    // SVG Bar Chart
    function drawBarChart(data) {
      const maxVal = Math.max(...data.map(d => d.count), 1);
      const barWidth = 36;
      const spacing = 60;
      const chartH = 180;

      const bars = data.map((d, i) => {
        const x = i * spacing + 40;
        const barH = Math.max((d.count / maxVal) * chartH, 2);
        const y = chartH + 20 - barH;
        return `
          <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="5"
                fill="url(#barGrad)" opacity="0.9"/>
          <text x="${x + barWidth / 2}" y="${chartH + 38}" text-anchor="middle" font-size="10"
                fill="var(--text-muted)" font-family="Inter,sans-serif">${d.label}</text>
          <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11"
                font-weight="700" fill="var(--text)" font-family="Inter,sans-serif">${d.count > 0 ? d.count : ''}</text>
        `;
      }).join('');

      const svgW = Math.max(data.length * spacing + 40, 320);

      return `
        <svg width="100%" height="240" viewBox="0 0 ${svgW} 240" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--primary)" stop-opacity="1"/>
              <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.8"/>
            </linearGradient>
          </defs>
          <line x1="20" y1="20" x2="${svgW - 10}" y2="20" stroke="var(--border)" stroke-dasharray="4" stroke-width="0.5"/>
          <line x1="20" y1="110" x2="${svgW - 10}" y2="110" stroke="var(--border)" stroke-dasharray="4" stroke-width="0.5"/>
          <line x1="20" y1="200" x2="${svgW - 10}" y2="200" stroke="var(--border)" stroke-width="1"/>
          ${bars}
        </svg>
      `;
    }

    // SVG Donut Chart
    function drawDonutChart(data) {
      const total = data.reduce((acc, d) => acc + d.count, 0);
      let accumulated = 0;

      const r = 52;
      const cx = 72;
      const cy = 72;
      const c = 2 * Math.PI * r;

      const colorMap = {
        'APROBADA': '#10b981',
        'RECHAZADA': '#ef4444',
        'PENDIENTE': '#f59e0b',
        'EN REVISION': '#3b82f6',
        'INFORMACION ADICIONAL': '#8b5cf6',
      };

      const slices = data.map(d => {
        const pct = d.count / total;
        const dash = pct * c;
        const offset = c - accumulated;
        accumulated += dash;
        const color = colorMap[d.status] || 'var(--primary)';
        return `
          <circle r="${r}" cx="${cx}" cy="${cy}" fill="transparent"
                  stroke="${color}" stroke-width="16"
                  stroke-dasharray="${dash} ${c - dash}"
                  stroke-dashoffset="${offset}"
                  transform="rotate(-90 ${cx} ${cy})"/>
        `;
      }).join('');

      const legends = data.map(d => {
        const color = colorMap[d.status] || 'var(--primary)';
        const pct = Math.round((d.count / total) * 100);
        return `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; flex-shrink: 0;"></span>
            <span style="font-weight: 700; min-width: 20px; text-align: right;">${d.count}</span>
            <span style="color: var(--text-muted); text-transform: capitalize; font-size: 11px;">${d.status.toLowerCase()} (${pct}%)</span>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; align-items: center; justify-content: center; gap: 24px; width: 100%; flex-wrap: wrap; padding: 10px;">
          <svg width="144" height="144" viewBox="0 0 144 144" style="flex-shrink: 0;">
            ${slices}
            <circle r="42" cx="${cx}" cy="${cy}" fill="var(--surface)"/>
            <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--text)" font-family="Inter,sans-serif">${total}</text>
            <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="Inter,sans-serif">TOTAL</text>
          </svg>
          <div style="display: flex; flex-direction: column;">${legends}</div>
        </div>
      `;
    }
  }
};

window.DashboardView = DashboardView;
