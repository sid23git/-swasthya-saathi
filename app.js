// Main Application Logic
class SwasthyaSaathiApp {
    constructor() {
        this.currentLanguage = 'hi';
        this.currentModule = 'dashboard';
        this.patients = [];
        this.appointments = [];
        this.voiceHandler = new VoiceHandler();
        this.chartRenderer = new ChartRenderer();

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        this.updateCharts();
    }

    // ===================================
    // Data Management
    // ===================================

    loadData() {
        const savedPatients = localStorage.getItem('patients');
        const savedAppointments = localStorage.getItem('appointments');

        if (savedPatients) {
            this.patients = JSON.parse(savedPatients);
        } else {
            // Demo data
            this.patients = [
                {
                    id: 1,
                    name: 'सीता देवी',
                    age: 35,
                    village: 'रामपुर',
                    phone: '9876543210',
                    bpSystolic: 140,
                    bpDiastolic: 90,
                    sugarLevel: 180,
                    pregnancyStatus: 'no',
                    symptoms: 'सिरदर्द, थकान',
                    lastVisit: '2026-02-10',
                    insurance: { hasCard: true, policyNumber: 'AB123456' }
                },
                {
                    id: 2,
                    name: 'राधा कुमारी',
                    age: 28,
                    village: 'श्यामपुर',
                    phone: '9876543211',
                    bpSystolic: 120,
                    bpDiastolic: 80,
                    sugarLevel: 95,
                    pregnancyStatus: 'yes',
                    symptoms: 'कोई नहीं',
                    lastVisit: '2026-02-12',
                    insurance: { hasCard: false }
                }
            ];
            this.saveData();
        }

        if (savedAppointments) {
            this.appointments = JSON.parse(savedAppointments);
        }
    }

    saveData() {
        localStorage.setItem('patients', JSON.stringify(this.patients));
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
    }

    // ===================================
    // Event Listeners
    // ===================================

    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                this.switchModule(module);
                sidebar.classList.remove('active');
            });
        });

        // Language toggle
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.voiceHandler.setLanguage(this.currentLanguage);
            });
        }

        // Patient form
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPatient();
            });
        }

        // Microphone button (Add Patient)
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.addEventListener('click', () => {
                this.toggleVoiceInput(micButton);
            });
        }

        // FAB microphone
        const fabMic = document.getElementById('fabMic');
        if (fabMic) {
            fabMic.addEventListener('click', () => {
                this.handleFABVoiceCommand();
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchPatients(e.target.value);
            });
        }

        // Voice search
        const voiceSearchBtn = document.getElementById('voiceSearchBtn');
        if (voiceSearchBtn) {
            voiceSearchBtn.addEventListener('click', () => {
                this.voiceSearch();
            });
        }

        // Add appointment
        const addAppointmentBtn = document.getElementById('addAppointmentBtn');
        if (addAppointmentBtn) {
            addAppointmentBtn.addEventListener('click', () => {
                this.openModal('appointmentModal');
            });
        }

        // Appointment form
        const appointmentForm = document.getElementById('appointmentForm');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAppointment();
            });
        }

        // Generate report
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // Report patient select
        const reportPatientSelect = document.getElementById('reportPatientSelect');
        if (reportPatientSelect) {
            reportPatientSelect.addEventListener('change', (e) => {
                this.previewReport(e.target.value);
            });
        }
    }

    // ===================================
    // Navigation
    // ===================================

    switchModule(moduleName) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-module="${moduleName}"]`)?.classList.add('active');

        // Update active module
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });
        document.getElementById(moduleName)?.classList.add('active');

        this.currentModule = moduleName;

        // Render module-specific content
        switch (moduleName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'search-patient':
                this.renderSearchResults();
                break;
            case 'high-risk':
                this.renderHighRiskPatients();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'reports':
                this.populateReportSelect();
                break;
        }
    }

    // ===================================
    // Dashboard
    // ===================================

    renderDashboard() {
        const totalPatients = this.patients.length;
        const highRiskPatients = this.patients.filter(p =>
            this.chartRenderer.assessRisk(p) === 'high'
        ).length;

        const today = new Date().toISOString().split('T')[0];
        const todayFollowups = this.appointments.filter(a =>
            a.date === today
        ).length;

        const upcomingVisits = this.appointments.filter(a =>
            new Date(a.date) > new Date()
        ).length;

        document.getElementById('totalPatients').textContent = totalPatients;
        document.getElementById('highRiskPatients').textContent = highRiskPatients;
        document.getElementById('todayFollowups').textContent = todayFollowups;
        document.getElementById('upcomingVisits').textContent = upcomingVisits;
    }

    updateCharts() {
        const { villageData, riskData } = this.chartRenderer.calculateStats(this.patients);
        this.chartRenderer.updateCharts(villageData, riskData);
    }

    // ===================================
    // Add Patient
    // ===================================

    toggleVoiceInput(button) {
        if (this.voiceHandler.isListening) {
            this.voiceHandler.stop();
            button.classList.remove('active');
            document.getElementById('transcriptionBox').classList.remove('active');
        } else {
            button.classList.add('active');
            document.getElementById('transcriptionBox').classList.add('active');

            this.voiceHandler.onTranscript = (text) => {
                document.getElementById('transcriptionText').textContent = text;
                const data = this.voiceHandler.parsePatientData(text);
                this.fillPatientForm(data);
            };

            this.voiceHandler.onEnd = () => {
                button.classList.remove('active');
            };

            this.voiceHandler.start();
        }
    }

    fillPatientForm(data) {
        if (data.name) document.getElementById('patientName').value = data.name;
        if (data.age) document.getElementById('patientAge').value = data.age;
        if (data.village) document.getElementById('patientVillage').value = data.village;
        if (data.bpSystolic) document.getElementById('bpSystolic').value = data.bpSystolic;
        if (data.bpDiastolic) document.getElementById('bpDiastolic').value = data.bpDiastolic;
        if (data.sugarLevel) document.getElementById('sugarLevel').value = data.sugarLevel;
    }

    addPatient() {
        const patient = {
            id: Date.now(),
            name: document.getElementById('patientName').value,
            age: parseInt(document.getElementById('patientAge').value),
            village: document.getElementById('patientVillage').value,
            phone: document.getElementById('patientPhone').value,
            bpSystolic: parseInt(document.getElementById('bpSystolic').value) || 0,
            bpDiastolic: parseInt(document.getElementById('bpDiastolic').value) || 0,
            sugarLevel: parseInt(document.getElementById('sugarLevel').value) || 0,
            pregnancyStatus: document.getElementById('pregnancyStatus').value,
            symptoms: document.getElementById('symptoms').value,
            lastVisit: new Date().toISOString().split('T')[0],
            insurance: { hasCard: false }
        };

        this.patients.push(patient);
        this.saveData();

        const risk = this.chartRenderer.assessRisk(patient);

        this.showAlert('success', 'मरीज सफलतापूर्वक जोड़ा गया');

        if (risk === 'high') {
            setTimeout(() => {
                this.showAlert('danger', 'उच्च जोखिम मरीज का पता चला!');
            }, 500);
        }

        document.getElementById('patientForm').reset();
        document.getElementById('transcriptionText').textContent = 'यहाँ आपकी आवाज़ दिखाई देगी...';

        this.renderDashboard();
        this.updateCharts();
    }

    // ===================================
    // Search Patients
    // ===================================

    searchPatients(query) {
        const results = this.patients.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.village.toLowerCase().includes(query.toLowerCase()) ||
            (p.phone && p.phone.includes(query))
        );

        this.renderSearchResults(results);
    }

    renderSearchResults(results = []) {
        const container = document.getElementById('searchResults');

        if (results.length === 0) {
            container.innerHTML = '<p class="empty-state">कोई परिणाम नहीं मिला</p>';
            return;
        }

        container.innerHTML = results.map(patient => {
            const risk = this.chartRenderer.assessRisk(patient);
            return `
                <div class="patient-card" onclick="app.viewPatientProfile(${patient.id})">
                    <div class="patient-card-header">
                        <div class="patient-name">${patient.name}</div>
                        <span class="risk-badge ${risk}">${risk === 'high' ? 'उच्च' : risk === 'medium' ? 'मध्यम' : 'कम'}</span>
                    </div>
                    <div class="patient-info">
                        <div>गाँव: ${patient.village}</div>
                        <div>उम्र: ${patient.age} वर्ष</div>
                        <div>BP: ${patient.bpSystolic}/${patient.bpDiastolic}</div>
                        <div>अंतिम विज़िट: ${patient.lastVisit}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    voiceSearch() {
        this.showAlert('warning', 'आवाज़ खोज सक्रिय...');
        // Implement voice search similar to voice input
    }

    // ===================================
    // Patient Profile
    // ===================================

    viewPatientProfile(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        const risk = this.chartRenderer.assessRisk(patient);
        const riskLabel = risk === 'high' ? 'उच्च जोखिम' : risk === 'medium' ? 'मध्यम जोखिम' : 'कम जोखिम';

        const profileContent = `
            <div class="patient-card">
                <div class="patient-card-header">
                    <div class="patient-name">${patient.name}</div>
                    <span class="risk-badge ${risk}">${riskLabel}</span>
                </div>
                <div class="patient-info">
                    <div><strong>उम्र:</strong> ${patient.age} वर्ष</div>
                    <div><strong>गाँव:</strong> ${patient.village}</div>
                    <div><strong>फ़ोन:</strong> ${patient.phone || 'N/A'}</div>
                    <div><strong>रक्तचाप:</strong> ${patient.bpSystolic}/${patient.bpDiastolic}</div>
                    <div><strong>शुगर:</strong> ${patient.sugarLevel}</div>
                    <div><strong>गर्भावस्था:</strong> ${patient.pregnancyStatus === 'yes' ? 'हाँ' : 'नहीं'}</div>
                    <div><strong>लक्षण:</strong> ${patient.symptoms}</div>
                    <div><strong>अंतिम विज़िट:</strong> ${patient.lastVisit}</div>
                    <div><strong>बीमा:</strong> ${patient.insurance.hasCard ? 'हाँ' : 'नहीं'}</div>
                </div>
            </div>
        `;

        document.getElementById('profileContent').innerHTML = profileContent;
        document.getElementById('profilePatientName').textContent = patient.name;
        this.switchModule('patient-profile');
    }

    // ===================================
    // High Risk Patients
    // ===================================

    renderHighRiskPatients() {
        const highRiskPatients = this.patients.filter(p =>
            this.chartRenderer.assessRisk(p) === 'high'
        );

        const container = document.getElementById('highRiskList');

        if (highRiskPatients.length === 0) {
            container.innerHTML = '<p class="empty-state">कोई उच्च जोखिम मरीज नहीं</p>';
            return;
        }

        container.innerHTML = highRiskPatients.map(patient => `
            <div class="patient-card" onclick="app.viewPatientProfile(${patient.id})">
                <div class="patient-card-header">
                    <div class="patient-name">${patient.name}</div>
                    <span class="risk-badge high">उच्च जोखिम</span>
                </div>
                <div class="patient-info">
                    <div>गाँव: ${patient.village}</div>
                    <div>BP: ${patient.bpSystolic}/${patient.bpDiastolic}</div>
                    <div>शुगर: ${patient.sugarLevel}</div>
                    <div>फ़ोन: ${patient.phone || 'N/A'}</div>
                </div>
            </div>
        `).join('');
    }

    // ===================================
    // Calendar & Appointments
    // ===================================

    renderCalendar() {
        const container = document.getElementById('upcomingAppointmentsList');
        const upcoming = this.appointments.filter(a =>
            new Date(a.date) >= new Date()
        ).sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">कोई आगामी अपॉइंटमेंट नहीं</p>';
            return;
        }

        container.innerHTML = upcoming.map(apt => {
            const patient = this.patients.find(p => p.id === apt.patientId);
            return `
                <div class="patient-card">
                    <div class="patient-name">${patient ? patient.name : 'Unknown'}</div>
                    <div class="patient-info">
                        <div>तारीख: ${apt.date}</div>
                        <div>समय: ${apt.time}</div>
                        <div>नोट्स: ${apt.notes || 'कोई नहीं'}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Populate appointment form dropdown
        const select = document.getElementById('appointmentPatient');
        if (select) {
            select.innerHTML = '<option value="">मरीज चुनें...</option>' +
                this.patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    }

    addAppointment() {
        const appointment = {
            id: Date.now(),
            patientId: parseInt(document.getElementById('appointmentPatient').value),
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            notes: document.getElementById('appointmentNotes').value
        };

        this.appointments.push(appointment);
        this.saveData();

        this.showAlert('success', 'अपॉइंटमेंट निर्धारित किया गया');
        this.closeModal('appointmentModal');
        this.renderCalendar();
        this.renderDashboard();
    }

    // ===================================
    // Reports
    // ===================================

    populateReportSelect() {
        const select = document.getElementById('reportPatientSelect');
        if (select) {
            select.innerHTML = '<option value="">मरीज चुनें...</option>' +
                this.patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    }

    previewReport(patientId) {
        if (!patientId) return;

        const patient = this.patients.find(p => p.id == patientId);
        if (!patient) return;

        const risk = this.chartRenderer.assessRisk(patient);
        const preview = document.getElementById('reportPreview');

        preview.innerHTML = `
            <div class="patient-card">
                <h3>${patient.name} - रिपोर्ट पूर्वावलोकन</h3>
                <div class="patient-info">
                    <div><strong>उम्र:</strong> ${patient.age}</div>
                    <div><strong>गाँव:</strong> ${patient.village}</div>
                    <div><strong>जोखिम स्तर:</strong> ${risk === 'high' ? 'उच्च' : risk === 'medium' ? 'मध्यम' : 'कम'}</div>
                    <div><strong>रक्तचाप:</strong> ${patient.bpSystolic}/${patient.bpDiastolic}</div>
                    <div><strong>शुगर:</strong> ${patient.sugarLevel}</div>
                    <div><strong>बीमा:</strong> ${patient.insurance.hasCard ? 'हाँ' : 'नहीं'}</div>
                </div>
            </div>
        `;
    }

    generateReport() {
        const patientId = document.getElementById('reportPatientSelect').value;
        if (!patientId) {
            this.showAlert('warning', 'कृपया मरीज चुनें');
            return;
        }

        this.showAlert('success', 'PDF डाउनलोड हो रहा है...');
        // In production, integrate jsPDF or server-side PDF generation
    }

    // ===================================
    // Modals
    // ===================================

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // ===================================
    // Alerts
    // ===================================

    showAlert(type, message) {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.innerHTML = `
            <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' :
                type === 'danger' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' :
                    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>'}
            </svg>
            <div class="alert-message">${message}</div>
        `;

        container.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // ===================================
    // FAB Voice Command
    // ===================================

    handleFABVoiceCommand() {
        this.showAlert('warning', 'आवाज़ कमांड सुन रहा हूँ...');
        // Implement global voice commands
    }
}

// Global function for onclick handlers
function switchModule(moduleName) {
    if (window.app) {
        window.app.switchModule(moduleName);
    }
}

function closeModal(modalId) {
    if (window.app) {
        window.app.closeModal(modalId);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SwasthyaSaathiApp();
});
