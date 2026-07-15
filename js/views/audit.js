// OFICINA VIRTUAL - AUDIT LOG VIEW (VANILLA JS)

const AuditView = {
  async render() {
    return `
      <div class="card">
        <div class="card-header">
          <h2>Bitácora de Auditoría del Sistema</h2>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario / Rol</th>
                <th>Acción</th>
                <th>Descripción / Detalles</th>
                <th>IP / Dispositivo</th>
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
      </div>
    `;
  },

  async afterRender() {
    const tableBody = document.getElementById('audit-table-body');
    if (!tableBody) return;

    try {
      const logs = await apiFetch('/users/audit-logs');

      if (logs.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
              No hay logs de auditoría registrados.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = logs.map(log => {
        const dateStr = new Date(log.createdAt).toLocaleString();
        
        // Style specific audit actions
        let actionBadge = 'badge badge-en_revision';
        if (log.action.includes('SUCCESS') || log.action === 'CREATE_REQUEST') {
          actionBadge = 'badge badge-aprobada';
        } else if (log.action.includes('FAILED') || log.action.includes('EXPIRED')) {
          actionBadge = 'badge badge-rechazada';
        } else if (log.action.includes('PASSWORD_RESET')) {
          actionBadge = 'badge badge-pendiente';
        }

        // Simplify user agent
        const browser = log.userAgent ? getBrowserName(log.userAgent) : 'Desconocido';

        return `
          <tr>
            <td style="font-weight: 500;">${dateStr}</td>
            <td>
              <div style="font-weight: 600;">${log.userName || 'Sistema'}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Rol: ${log.userRole || 'N/A'}</div>
            </td>
            <td><span class="${actionBadge}">${log.action}</span></td>
            <td style="max-width: 320px; line-height: 1.4; font-size: 12px; font-weight: 500;">${log.details}</td>
            <td>
              <div style="font-weight: 500;">IP: ${log.ipAddress || '127.0.0.1'}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Navegador: ${browser}</div>
            </td>
          </tr>
        `;
      }).join('');

      lucide.createIcons();

    } catch (err) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #ef4444; padding: 40px;">
            <i data-lucide="alert-triangle" style="margin: 0 auto 12px auto; width: 36px; height: 36px;"></i>
            Error al cargar bitácora: ${err.message || 'Error desconocido'}
          </td>
        </tr>
      `;
      lucide.createIcons();
    }

    function getBrowserName(ua) {
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Chrome')) return 'Chrome / Chromium';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Edge')) return 'MS Edge';
      return 'Dispositivo Web';
    }
  }
};

window.AuditView = AuditView;
