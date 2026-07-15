// OFICINA VIRTUAL - CREATE REQUEST WIZARD VIEW (VANILLA JS)

const RequestCreateView = {
  state: {
    step: 1,
    files: {
      historia_clinica: null,
      examenes: null,
      formulas: null,
      otros: []
    }
  },

  render() {
    this.state.step = 1;
    this.state.files = { historia_clinica: null, examenes: null, formulas: null, otros: [] };
    
    return `
      <div style="max-width: 900px; margin: 0 auto;">
        <div class="card">
          <div class="wizard-steps">
            <div class="wizard-step active" id="step-indicator-1">
              <span class="step-num">1</span> Datos del Paciente
            </div>
            <div class="wizard-step" id="step-indicator-2">
              <span class="step-num">2</span> Información Médica
            </div>
            <div class="wizard-step" id="step-indicator-3">
              <span class="step-num">3</span> Documentos Adjuntos
            </div>
          </div>

          <form id="create-request-form">
            <!-- Step 1: Patient Details -->
            <div id="step-container-1" class="wizard-step-content">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label for="patient-name">Nombre Completo del Paciente</label>
                  <input type="text" id="patient-name" class="input" placeholder="Ej: Carlos Mario Gomez" required>
                </div>
                <div class="form-group">
                  <label for="patient-doc">Número de Documento</label>
                  <input type="text" id="patient-doc" class="input" placeholder="Ej: 1020456789" required>
                </div>
                <div class="form-group">
                  <label for="patient-birth">Fecha de Nacimiento</label>
                  <input type="date" id="patient-birth" class="input" required>
                </div>
                <div class="form-group">
                  <label for="patient-gender">Sexo</label>
                  <select id="patient-gender" class="input select" required>
                    <option value="" disabled selected>Selecciona sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
                <button type="button" class="btn btn-primary btn-next" data-next="2">
                  Siguiente <i data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>

            <!-- Step 2: Medical Info -->
            <div id="step-container-2" class="wizard-step-content hidden">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label for="medical-diagnosis">Diagnóstico Principal</label>
                  <input type="text" id="medical-diagnosis" class="input" placeholder="Ej: Insuficiencia Cardíaca Congestiva" required>
                </div>
                <div class="form-group">
                  <label for="medical-cie10">Código CIE10</label>
                  <input type="text" id="medical-cie10" class="input" placeholder="Ej: I50.0" required>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <div class="form-group">
                  <label for="medical-procedure">Procedimiento Solicitado</label>
                  <input type="text" id="medical-procedure" class="input" placeholder="Ej: Implante de Marcapasos Bicameral" required>
                </div>
                <div class="form-group">
                  <label for="medical-cups">Código CUPS</label>
                  <input type="text" id="medical-cups" class="input" placeholder="Ej: 37.83.01" required>
                </div>
              </div>
              <div class="form-group">
                <label for="medical-justification">Justificación Clínica del Procedimiento</label>
                <textarea id="medical-justification" class="input textarea" placeholder="Describa el historial clínico del paciente y la justificación para realizar este procedimiento de alto costo..." required></textarea>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-top: 30px;">
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
              <p style="margin-bottom: 20px; font-size: 13px; color: var(--text-muted);">
                Por favor adjunte los soportes médicos requeridos para el estudio de esta solicitud de alto costo. Solo formatos PDF, PNG, JPG, JPEG (máx. 10MB c/u).
              </p>

              <!-- Upload field 1 -->
              <div class="form-group" style="margin-bottom: 20px;">
                <label>1. Historia Clínica (Obligatorio)</label>
                <div class="upload-zone" id="zone-hc" data-type="historia_clinica">
                  <i data-lucide="upload-cloud"></i>
                  <span class="upload-text">Haz clic o arrastra la Historia Clínica aquí</span>
                  <input type="file" id="file-hc" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                </div>
                <div id="preview-hc" class="file-preview-list"></div>
              </div>

              <!-- Upload field 2 -->
              <div class="form-group" style="margin-bottom: 20px;">
                <label>2. Exámenes y Ayudas Diagnósticas</label>
                <div class="upload-zone" id="zone-exams" data-type="examenes">
                  <i data-lucide="upload-cloud"></i>
                  <span class="upload-text">Haz clic o arrastra los Exámenes aquí</span>
                  <input type="file" id="file-exams" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                </div>
                <div id="preview-exams" class="file-preview-list"></div>
              </div>

              <!-- Upload field 3 -->
              <div class="form-group" style="margin-bottom: 24px;">
                <label>3. Fórmulas / Prescripciones</label>
                <div class="upload-zone" id="zone-formulas" data-type="formulas">
                  <i data-lucide="upload-cloud"></i>
                  <span class="upload-text">Haz clic o arrastra las Fórmulas aquí</span>
                  <input type="file" id="file-formulas" accept=".pdf,.png,.jpg,.jpeg" style="display: none;">
                </div>
                <div id="preview-formulas" class="file-preview-list"></div>
              </div>

              <div style="display: flex; justify-content: space-between; margin-top: 30px;">
                <button type="button" class="btn btn-secondary btn-prev" data-prev="2">
                  <i data-lucide="arrow-left"></i> Anterior
                </button>
                <button type="submit" class="btn btn-primary">
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
    const nextButtons = form.querySelectorAll('.btn-next');
    const prevButtons = form.querySelectorAll('.btn-prev');

    nextButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const nextStep = parseInt(btn.getAttribute('data-next'));
        
        // Basic validations before moving
        if (self.state.step === 1) {
          const patientName = document.getElementById('patient-name').value;
          const patientDoc = document.getElementById('patient-doc').value;
          const patientBirth = document.getElementById('patient-birth').value;
          const patientGender = document.getElementById('patient-gender').value;

          if (!patientName || !patientDoc || !patientBirth || !patientGender) {
            store.showToast('Por favor completa todos los campos del paciente', 'error');
            return;
          }
        }

        if (self.state.step === 2) {
          const diag = document.getElementById('medical-diagnosis').value;
          const cie10 = document.getElementById('medical-cie10').value;
          const proc = document.getElementById('medical-procedure').value;
          const cups = document.getElementById('medical-cups').value;
          const just = document.getElementById('medical-justification').value;

          if (!diag || !cie10 || !proc || !cups || !just) {
            store.showToast('Por favor completa todos los campos médicos', 'error');
            return;
          }
        }

        self.goToStep(nextStep);
      });
    });

    prevButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const prevStep = parseInt(btn.getAttribute('data-prev'));
        self.goToStep(prevStep);
      });
    });

    // Setup drag & drop click inputs
    ['hc', 'exams', 'formulas'].forEach(key => {
      const zone = document.getElementById(`zone-${key}`);
      const input = document.getElementById(`file-${key}`);
      
      if (zone && input) {
        zone.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const fileType = zone.getAttribute('data-type');
            self.state.files[fileType] = file;
            self.renderFilePreview(key, file);
          }
        });
      }
    });

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!self.state.files.historia_clinica) {
        store.showToast('La Historia Clínica es obligatoria', 'error');
        return;
      }

      // Collect data
      const patient = {
        name: document.getElementById('patient-name').value,
        document: document.getElementById('patient-doc').value,
        birthDate: document.getElementById('patient-birth').value,
        gender: document.getElementById('patient-gender').value,
      };

      const medicalInfo = {
        diagnosis: document.getElementById('medical-diagnosis').value,
        cie10Code: document.getElementById('medical-cie10').value,
        procedure: document.getElementById('medical-procedure').value,
        cupsCode: document.getElementById('medical-cups').value,
        justification: document.getElementById('medical-justification').value,
      };

      // Construct FormData for multipart upload
      const formData = new FormData();
      formData.append('patient', JSON.stringify(patient));
      formData.append('medicalInfo', JSON.stringify(medicalInfo));

      // Append files
      if (self.state.files.historia_clinica) {
        formData.append('historia_clinica', self.state.files.historia_clinica);
      }
      if (self.state.files.examenes) {
        formData.append('examenes', self.state.files.examenes);
      }
      if (self.state.files.formulas) {
        formData.append('formulas', self.state.files.formulas);
      }

      try {
        store.showToast('Enviando solicitud...', 'info');
        
        await apiFetch('/requests', {
          method: 'POST',
          body: formData, // Fetch automatically drops JSON header and handles bounds if body is FormData
        });

        store.showToast('Solicitud radicada exitosamente', 'success');
        window.location.hash = '#/requests';
      } catch (err) {
        store.showToast(err.message || 'Error al radicar solicitud', 'error');
      }
    });
  },

  goToStep(stepNum) {
    this.state.step = stepNum;
    
    // Toggle container views
    document.querySelectorAll('.wizard-step-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-container-${stepNum}`).classList.remove('hidden');

    // Toggle steps navigation highlights
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active', 'completed'));
    
    for (let i = 1; i <= 3; i++) {
      const stepIndicator = document.getElementById(`step-indicator-${i}`);
      if (i < stepNum) {
        stepIndicator.classList.add('completed');
      } else if (i === stepNum) {
        stepIndicator.classList.add('active');
      }
    }

    lucide.createIcons();
  },

  renderFilePreview(key, file) {
    const preview = document.getElementById(`preview-${key}`);
    if (!preview) return;

    preview.innerHTML = `
      <div class="file-preview-item">
        <div class="file-info">
          <i data-lucide="file-text" style="color: var(--primary);"></i>
          <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        </div>
        <button type="button" class="btn-remove-file" id="remove-${key}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;

    lucide.createIcons();

    // Setup remove listener
    document.getElementById(`remove-${key}`).addEventListener('click', () => {
      const zone = document.getElementById(`zone-${key}`);
      const fileType = zone.getAttribute('data-type');
      this.state.files[fileType] = null;
      document.getElementById(`file-${key}`).value = '';
      preview.innerHTML = '';
    });
  }
};

window.RequestCreateView = RequestCreateView;
