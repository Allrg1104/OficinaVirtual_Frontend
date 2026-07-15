// OFICINA VIRTUAL - REQUEST DETAIL VIEW (VANILLA JS)

const RequestDetailView = {
  request: null,
  filesToUpload: {
    historia_clinica: null,
    examenes: null,
    formulas: null
  },

  async render() {
    const params = getQueryParams();
    const requestId = params.id;
    if (!requestId) return `<div class="card">Radicado no válido.</div>`;

    this.filesToUpload = { historia_clinica: null, examenes: null, formulas: null };

    return `
      <div id="detail-loader" style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="loader" class="animate-spin" style="width: 32px; height: 32px; margin: 0 auto 10px auto;"></i>
        Cargando detalles de la solicitud...
      </div>
      <div id="detail-content" class="hidden">
        <!-- Renders dynamically -->
      </div>
    `;
  },

  async afterRender() {
    const params = getQueryParams();
    const requestId = params.id;
    if (!requestId) return;

    const self = this;
    const loader = document.getElementById('detail-loader');
    const content = document.getElementById('detail-content');

    await fetchDetails();

    async function fetchDetails() {
      try {
        const req = await apiFetch(`/requests/${requestId}`);
        self.request = req;

        loader.classList.add('hidden');
        content.classList.remove('hidden');

        renderDetailsMarkup();
        bindEvents();
      } catch (err) {
        loader.innerHTML = `
          <div class="card" style="text-align: center; padding: 40px;">
            <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: #ef4444; margin: 0 auto 16px auto;"></i>
            <h3>Error al cargar detalles</h3>
            <p style="color: var(--text-muted); font-size: 13px;">${err.message || 'Error desconocido'}</p>
          </div>
        `;
        lucide.createIcons();
      }
    }

    function renderDetailsMarkup() {
      const req = self.request;
      const user = store.state.user;
      const isDoc = user.role === 'medico';
      const isReviewer = user.role === 'autorizador' || user.role === 'administrador';
      
      const birthDateStr = new Date(req.patient.birthDate).toLocaleDateString();
      const age = new Date().getFullYear() - new Date(req.patient.birthDate).getFullYear();
      const statusBadge = `badge badge-${req.status}`;
      const statusLabel = req.status.replace('_', ' ').toUpperCase();

      // Render attachments list
      const attachmentsHtml = req.attachments.length > 0
        ? req.attachments.map(att => {
            const downloadUrl = `http://localhost:4000/api/requests/${req._id}/attachments/${att._id}?token=${store.state.accessToken}`;
            return `
              <div class="file-preview-item" style="margin-bottom: 8px;">
                <div class="file-info">
                  <i data-lucide="file-text" style="color: var(--primary);"></i>
                  <div>
                    <div style="font-weight: 600;">${att.fileName}</div>
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Tipo: ${att.fileType.replace('_', ' ')} | ${(att.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <a href="${downloadUrl}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;">
                  <i data-lucide="download"></i> Descargar
                </a>
              </div>
            `;
          }).join('')
        : '<p style="color: var(--text-muted); font-size: 13px;">No hay archivos adjuntos.</p>';

      // Render timeline of observations
      const timelineHtml = req.observations.length > 0
        ? req.observations.map(obs => `
            <div style="border-left: 3px solid var(--border); padding-left: 16px; position: relative; margin-bottom: 20px;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background-color: var(--primary); position: absolute; left: -6.5px; top: 4px;"></div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 500;">
                ${obs.userName} (${obs.userRole.toUpperCase()}) &bull; ${new Date(obs.createdAt).toLocaleString()}
              </div>
              <div style="font-size: 13px; font-weight: 500; margin-top: 6px; line-height: 1.5; color: var(--text);">
                ${obs.text}
              </div>
            </div>
          `).join('')
        : '<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No hay observaciones registradas.</p>';

      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left Column -->
          <div>
            <!-- Patient & Medical Info Card -->
            <div class="card">
              <div class="card-header">
                <h2>Radicado #${req._id.substring(req._id.length - 6).toUpperCase()}</h2>
                <span class="${statusBadge}">${statusLabel}</span>
              </div>

              <!-- Section 1: Patient -->
              <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary);">Datos del Paciente</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background-color: var(--surface-hover); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Nombre Completo</span>
                  <strong style="font-size: 14px;">${req.patient.name}</strong>
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Identificación</span>
                  <strong style="font-size: 14px;">${req.patient.document}</strong>
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Fecha Nacimiento</span>
                  <strong style="font-size: 14px;">${birthDateStr} (${age} años)</strong>
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Sexo</span>
                  <strong style="font-size: 14px;">${req.patient.gender === 'M' ? 'Masculino' : req.patient.gender === 'F' ? 'Femenino' : 'Otro'}</strong>
                </div>
              </div>

              <!-- Section 2: Medical Info -->
              <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary);">Información Médica</h3>
              <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Diagnóstico</span>
                  <strong style="font-size: 14px; font-weight: 600;">${req.medicalInfo.diagnosis}</strong>
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Código CIE10</span>
                  <strong style="font-size: 14px; font-weight: 600;">${req.medicalInfo.cie10Code}</strong>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Procedimiento Solicitado</span>
                  <strong style="font-size: 14px; font-weight: 600;">${req.medicalInfo.procedure}</strong>
                </div>
                <div>
                  <span style="font-size: 11px; color: var(--text-muted); display: block;">Código CUPS</span>
                  <strong style="font-size: 14px; font-weight: 600;">${req.medicalInfo.cupsCode}</strong>
                </div>
              </div>
              <div style="margin-bottom: 10px;">
                <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Justificación Clínica</span>
                <p style="font-size: 13px; line-height: 1.6; background-color: var(--surface-hover); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border);">${req.medicalInfo.justification}</p>
              </div>
            </div>

            <!-- Observations Timeline Card -->
            <div class="card">
              <div class="card-header">
                <h2>Historial de Observaciones</h2>
              </div>
              <div>${timelineHtml}</div>
            </div>
          </div>

          <!-- Right Column (Soportes / Acciones) -->
          <div>
            <!-- Attachments Card -->
            <div class="card">
              <div class="card-header">
                <h2>Documentos Soportes</h2>
              </div>
              <div>${attachmentsHtml}</div>
            </div>

            <!-- Authorizer Action Card -->
            ${isReviewer ? `
              <div class="card">
                <div class="card-header">
                  <h2>Gestionar Solicitud</h2>
                </div>
                <form id="reviewer-form">
                  <div class="form-group">
                    <label for="review-status">Nuevo Estado</label>
                    <select id="review-status" class="input select" required>
                      <option value="" disabled selected>Selecciona una opción</option>
                      <option value="en_revision" ${req.status === 'en_revision' ? 'selected' : ''}>Poner en Revisión</option>
                      <option value="aprobada">Aprobar Solicitud</option>
                      <option value="rechazada">Rechazar Solicitud</option>
                      <option value="informacion_adicional">Solicitar Info Adicional</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="review-observation">Observaciones / Motivo</label>
                    <textarea id="review-observation" class="input textarea" placeholder="Escriba la justificación o comentarios adicionales..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i data-lucide="check-circle-2"></i> Guardar Gestión
                  </button>
                </form>
              </div>
            ` : ''}

            <!-- Doctor Action Card (Submit Missing Documents if status is informacion_adicional) -->
            ${isDoc && req.status === 'informacion_adicional' ? `
              <div class="card">
                <div class="card-header">
                  <h2>Subir Información Solicitada</h2>
                </div>
                <form id="doctor-extra-form">
                  <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
                    Adjunte los documentos médicos solicitados para reactivar la solicitud.
                  </p>
                  
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label>Exámenes Diagnósticos</label>
                    <input type="file" id="extra-exams" class="input" accept=".pdf,.png,.jpg,.jpeg">
                  </div>

                  <div class="form-group" style="margin-bottom: 16px;">
                    <label>Fórmulas / Ficha Médica</label>
                    <input type="file" id="extra-formulas" class="input" accept=".pdf,.png,.jpg,.jpeg">
                  </div>

                  <div class="form-group">
                    <label for="extra-observation">Comentarios</label>
                    <textarea id="extra-observation" class="input textarea" style="min-height: 80px;" placeholder="Ej: Adjunto los exámenes clínicos solicitados por el auditor..." required></textarea>
                  </div>

                  <button type="submit" class="btn btn-primary" style="width: 100%;">
                    <i data-lucide="upload"></i> Subir Documentos
                  </button>
                </form>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      lucide.createIcons();
    }

    function bindEvents() {
      const reviewerForm = document.getElementById('reviewer-form');
      const doctorExtraForm = document.getElementById('doctor-extra-form');

      if (reviewerForm) {
        reviewerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const status = document.getElementById('review-status').value;
          const observation = document.getElementById('review-observation').value;

          try {
            store.showToast('Actualizando solicitud...', 'info');
            await apiFetch(`/requests/${requestId}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status, observation })
            });

            store.showToast('La solicitud ha sido gestionada correctamente.', 'success');
            await fetchDetails();
          } catch (err) {
            store.showToast(err.message || 'Error al actualizar estado', 'error');
          }
        });
      }

      if (doctorExtraForm) {
        doctorExtraForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const fileExams = document.getElementById('extra-exams').files[0];
          const fileFormulas = document.getElementById('extra-formulas').files[0];
          const observation = document.getElementById('extra-observation').value;

          if (!fileExams && !fileFormulas) {
            store.showToast('Por favor adjunte al menos un archivo', 'error');
            return;
          }

          const formData = new FormData();
          formData.append('observation', observation);
          if (fileExams) formData.append('examenes', fileExams);
          if (fileFormulas) formData.append('formulas', fileFormulas);

          try {
            store.showToast('Subiendo documentos...', 'info');
            await apiFetch(`/requests/${requestId}/attachments`, {
              method: 'POST',
              body: formData,
            });

            store.showToast('Documentos cargados con éxito. La solicitud está en revisión.', 'success');
            await fetchDetails();
          } catch (err) {
            store.showToast(err.message || 'Error al subir documentos', 'error');
          }
        });
      }
    }
  }
};

window.RequestDetailView = RequestDetailView;
