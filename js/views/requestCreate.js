// OFICINA VIRTUAL - CREATE REQUEST WIZARD VIEW (VANILLA JS)

const RequestCreateView = {
  state: {
    step: 1,
    files: {
      historia_clinica: null,
      examenes: null,
      formulas: null,
    }
  },

  render() {
    this.state.step = 1;
    this.state.files = { historia_clinica: null, examenes: null, formulas: null };

    return `
      <div style="max-width: 860px; margin: 0 auto;">
        <div class="card">
          <!-- Wizard Steps Indicator -->
          <div class="wizard-steps">
            <div class="wizard-step active" id="step-indicator-1">
              <span class="step-num">1</span>
              <span>Datos del Paciente</span>
            </div>
            <div style="flex: 1; height: 2px; background: var(--border); margin: 0 12px; border-radius: 2px;"></div>
            <div class="wizard-step" id="step-indicator-2">
              <span class="step-num">2</span>
              <span>Información Médica</span>
            </div>
            <div style="flex: 1; height: 2px; background: var(--border); margin: 0 12px; border-radius: 2px;"></div>
            <div class="wizard-step" id="step-indicator-3">
              <span class="step-num">3</span>
              <span>Documentos</span>
            </div>
          </div>

          <form id="create-request-form" novalidate>
            <!-- Step 1: Patient Details -->
            <div id="step-container-1" class="wizard-step-content">
              <h3 style="font-size: 14px; font-weight: 700; color: var(--primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="user" style="width: 16px; height: 16px;"></i> Información del Paciente
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label for="patient-name">Nombre Completo del Paciente *</label>
                  <input type="text" id="patient-name" class="input" placeholder="Ej: Carlos Mario Gómez Pérez" required>
                </div>
                <div class="form-group">
                  <label for="patient-doc">Número de Documento *</label>
                  <input type="text" id="patient-doc" class="input" placeholder="Ej: 1020456789" required>
                </div>
                <div class="form-group">
                  <label for="patient-birth">Fecha de Nacimiento *</label>
                  <input type="date" id="patient-birth" class="input" required>
                </div>
                <div class="form-group">
                  <label for="patient-gender">Sexo *</label>
                  <select id="patient-gender" class="input select" required>
                    <option value="" disabled selected>Selecciona sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
                <button type="button" class="btn btn-primary btn-next" data-next="2">
                  Siguiente <i data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Step 2: Medical Info -->
            <div id="step-container-2" class="wizard-step-content hidden">
              <h3 style="font-size: 14px; font-weight: 700; color: var(--primary); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="stethoscope" style="width: 16px; height: 16px;"></i> Información Clínica
              </h3>
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label for="medical-diagnosis">Diagnóstico Principal *</label>
                  <input type="text" id="medical-diagnosis" class="input" placeholder="Ej: Insuficiencia Cardíaca Congestiva" required>
                </div>
                <div class="form-group">
                  <label for="medical-cie10">Código CIE10 *</label>
                  <input type="text" id="medical-cie10" class="input" placeholder="Ej: I50.0" required>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label for="medical-procedure">Procedimiento Solicitado *</label>
                  <input type="text" id="medical-procedure" class="input" placeholder="Ej: Implante de Marcapasos Bicameral" required>
                </div>
                <div class="form-group">
                  <label for="medical-cups">Código CUPS *</label>
                  <input type="text" id="medical-cups" class="input" placeholder="Ej: 37.83.01" required>
                </div>
              </div>
              <div class="form-group">
                <label for="medical-justification">Justificación Clínica del Procedimiento *</label>
                <textarea id="medical-justification" class="input textarea" style="min-height: 130px;" placeholder="Describa el historial clínico del paciente y la justificación médica para realizar este procedimiento de alto costo..." required></textarea>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
                <button type="button" class="btn btn-secondary btn-prev" data-prev="1">
                  <i data-lucide="arrow-left"></i> Anterior
                </button>
                <button type="button" class="btn btn-primary btn-next" data-next="3">
                  Siguiente <i data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Step 3: Attachments -->
            <div id="step-container-3" class="wizard-step-content hidden">
              <h3 style="font-size: 14px; font-weight: 700; color: var(--primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="paperclip" style="width: 16px; height: 16px;"></i> Documentos Soportes
              </h3>
              <p style="margin-bottom: 20px; font-size: 13px; color: var(--text-muted); line-height: 1.5;">
                Adjunte los soportes médicos requeridos para el estudio de esta solicitud de alto costo.<br>
                <strong style="color: var(--text);">Formatos:</strong> PDF, PNG, JPG, JPEG — <strong style="color: var(--text);">Máx. 10 MB por archivo</strong>
              </p>

              <!-- Upload field 1 - Required -->
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 6px;">
                  1. Historia Clínica
                  <span style="font-size: 10px; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 10px; font-weight: 700;">OBLIGATORIO</span>
                </label>
                <div class="upload-zone" id="zone-hc" data-type="historia_clinica">
                  <i data-lucide="upload-cloud"></i>
                  <span class="upload-text"><strong>Haz clic o arrastra</strong> la Historia Clínica aquí</span>
                  <span class="upload-hint">PDF, PNG, JPG hasta 10 MB</span>
                  <input type="file" id="file-hc" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                </div>
                <div id="preview-hc" class="file-preview-list"></div>
              </div>

              <!-- Upload field 2 -->
              <div class="form-group" style="margin-bottom: 20px;">
                <label>2. Exámenes y Ayudas Diagnósticas</label>
                <div class="upload-zone" id="zone-exams" data-type="examenes">
                  <i data-lucide="upload-cloud"></i>
                  <span class="upload-text"><strong>Haz clic o arrastra</strong> los Exámenes aquí</span>
                  <span class="upload-hint">PDF, PNG, JPG hasta 10 MB</span>
                  <input type="file" id="file-exams" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                </div>
                <div id="preview-exams" class="file-preview-list"></div>
              </div>

              <!-- Upload field 3 -->
              <div class="form-group" style="margin-bottom: 24px;">
                <label>3. Fórmulas / Prescripciones Médicas</label>
                <div class="upload-zone" id="zone-formulas" data-type="formulas">
                  <i data-lucide="upload-cloud"></i>
                  <span class="upload-text"><strong>Haz clic o arrastra</strong> las Fórmulas aquí</span>
                  <span class="upload-hint">PDF, PNG, JPG hasta 10 MB</span>
                  <input type="file" id="file-formulas" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                </div>
                <div id="preview-formulas" class="file-preview-list"></div>
              </div>

              <div style="display: flex; justify-content: space-between; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
                <button type="button" class="btn btn-secondary btn-prev" data-prev="2">
                  <i data-lucide="arrow-left"></i> Anterior
                </button>
                <button type="submit" id="submit-request-btn" class="btn btn-primary" style="min-width: 180px;">
                  <i data-lucide="send"></i> Radicar Solicitud
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  afterRender() {
    const self = this;
    const form = document.getElementById('create-request-form');
    if (!form) return;

    // Wizard navigation
    form.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextStep = parseInt(btn.getAttribute('data-next'));
        if (!self.validateStep(self.state.step)) return;
        self.goToStep(nextStep);
      });
    });

    form.querySelectorAll('.btn-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        const prevStep = parseInt(btn.getAttribute('data-prev'));
        self.goToStep(prevStep);
      });
    });

    // Setup drag & drop for all zones
    [
      { key: 'hc', type: 'historia_clinica' },
      { key: 'exams', type: 'examenes' },
      { key: 'formulas', type: 'formulas' }
    ].forEach(({ key, type }) => {
      const zone = document.getElementById(`zone-${key}`);
      const input = document.getElementById(`file-${key}`);
      if (!zone || !input) return;

      // Click to open file picker
      zone.addEventListener('click', () => input.click());

      // File input change
      input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          self.handleFile(e.target.files[0], key, type);
        }
      });

      // Drag events
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          self.handleFile(files[0], key, type);
        }
      });
    });

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!self.state.files.historia_clinica) {
        store.showToast('La Historia Clínica es obligatoria para radicar la solicitud', 'error');
        return;
      }

      const submitBtn = document.getElementById('submit-request-btn');

      // Build FormData
      const formData = new FormData();
      formData.append('patient', JSON.stringify({
        name: document.getElementById('patient-name').value.trim(),
        document: document.getElementById('patient-doc').value.trim(),
        birthDate: document.getElementById('patient-birth').value,
        gender: document.getElementById('patient-gender').value,
      }));
      formData.append('medicalInfo', JSON.stringify({
        diagnosis: document.getElementById('medical-diagnosis').value.trim(),
        cie10Code: document.getElementById('medical-cie10').value.trim().toUpperCase(),
        procedure: document.getElementById('medical-procedure').value.trim(),
        cupsCode: document.getElementById('medical-cups').value.trim(),
        justification: document.getElementById('medical-justification').value.trim(),
      }));

      if (self.state.files.historia_clinica) formData.append('historia_clinica', self.state.files.historia_clinica);
      if (self.state.files.examenes) formData.append('examenes', self.state.files.examenes);
      if (self.state.files.formulas) formData.append('formulas', self.state.files.formulas);

      // Loading state
      submitBtn.classList.add('btn--loading');
      submitBtn.innerHTML = 'Enviando solicitud...';

      try {
        await apiFetch('/requests', {
          method: 'POST',
          body: formData,
        });

        store.showToast('¡Solicitud radicada exitosamente!', 'success');
        window.location.hash = '#/requests';
      } catch (err) {
        submitBtn.classList.remove('btn--loading');
        submitBtn.innerHTML = '<i data-lucide="send"></i> Radicar Solicitud';
        lucide.createIcons();
        store.showToast(err.message || 'Error al radicar solicitud', 'error');
      }
    });
  },

  handleFile(file, key, type) {
    const MAX_MB = 10;
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!allowedTypes.includes(file.type)) {
      store.showToast('Formato no permitido. Use PDF, PNG o JPG.', 'error');
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      store.showToast(`El archivo excede el límite de ${MAX_MB} MB.`, 'error');
      return;
    }

    this.state.files[type] = file;
    this.renderFilePreview(key, file);
  },

  goToStep(stepNum) {
    this.state.step = stepNum;

    document.querySelectorAll('.wizard-step-content').forEach(el => el.classList.add('hidden'));
    const container = document.getElementById(`step-container-${stepNum}`);
    if (container) container.classList.remove('hidden');

    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active', 'completed'));

    for (let i = 1; i <= 3; i++) {
      const indicator = document.getElementById(`step-indicator-${i}`);
      if (!indicator) continue;
      if (i < stepNum) indicator.classList.add('completed');
      else if (i === stepNum) indicator.classList.add('active');
    }

    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  validateStep(step) {
    if (step === 1) {
      const name = document.getElementById('patient-name').value.trim();
      const doc = document.getElementById('patient-doc').value.trim();
      const birth = document.getElementById('patient-birth').value;
      const gender = document.getElementById('patient-gender').value;

      const fields = [
        { el: document.getElementById('patient-name'), val: name },
        { el: document.getElementById('patient-doc'), val: doc },
        { el: document.getElementById('patient-birth'), val: birth },
        { el: document.getElementById('patient-gender'), val: gender },
      ];

      let ok = true;
      fields.forEach(({ el, val }) => {
        if (!val) { el.classList.add('input--error'); ok = false; }
        else { el.classList.remove('input--error'); }
      });

      if (!ok) { store.showToast('Por favor completa todos los campos del paciente', 'error'); }
      return ok;
    }

    if (step === 2) {
      const fields = ['medical-diagnosis', 'medical-cie10', 'medical-procedure', 'medical-cups', 'medical-justification'];
      let ok = true;
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.classList.add('input--error'); ok = false; }
        else { el.classList.remove('input--error'); }
      });
      if (!ok) { store.showToast('Por favor completa todos los campos médicos', 'error'); }
      return ok;
    }

    return true;
  },

  renderFilePreview(key, file) {
    const preview = document.getElementById(`preview-${key}`);
    if (!preview) return;

    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    const isImage = file.type.startsWith('image/');
    const iconName = file.type === 'application/pdf' ? 'file-text' : 'image';

    preview.innerHTML = `
      <div class="file-preview-item">
        <div class="file-info">
          <i data-lucide="${iconName}" style="color: var(--primary);"></i>
          <div>
            <div style="font-weight: 600; font-size: 13px;">${file.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${sizeMB} MB · ${isImage ? 'Imagen' : 'PDF'}</div>
          </div>
        </div>
        <button type="button" class="btn-remove-file" id="remove-${key}" title="Eliminar archivo">
          <i data-lucide="x-circle"></i>
        </button>
      </div>
    `;

    lucide.createIcons();

    document.getElementById(`remove-${key}`)?.addEventListener('click', () => {
      const zone = document.getElementById(`zone-${key}`);
      const fileType = zone?.getAttribute('data-type');
      if (fileType) this.state.files[fileType] = null;
      document.getElementById(`file-${key}`).value = '';
      preview.innerHTML = '';
    });
  }
};

window.RequestCreateView = RequestCreateView;
