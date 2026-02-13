// ===================================
// FIREBASE IMPORTS
// ===================================
import {
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getAllPatients,
    onPatientsChange,
    addVisit,
    getVisitsByPatient,
    getAllVisits,
    onVisitsChange,
    addAlert,
    getActiveAlerts,
    acknowledgeAlert,
    onAlertsChange,
    addAppointment,
    getUpcomingAppointments,
    updateAppointment,
    deleteAppointment
} from './firebase-service.js';

// ===================================
// GLOBAL DATA ARRAYS (Firebase-backed)
// ===================================
let patients = [];
let visits = [];
let alerts = [];
let appointments = [];

// ===================================
// Main Application Logic
// ===================================
class SwasthyaSaathiApp {
    constructor() {
        this.currentLanguage = 'hi';
        this.currentModule = 'dashboard';
        this.voiceHandler = new VoiceHandler();
        this.chartRenderer = new ChartRenderer();
        this.isInitialized = false;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Swasthya Saathi with Firebase...');
        await this.initializeApp();
        this.setupEventListeners();
    }

    // ===================================
    // FIREBASE INITIALIZATION (REPLACED localStorage)
    // ===================================

    async initializeApp() {
        console.log('📡 Loading data from Firebase...');

        // Show loading overlay
        this.showLoadingOverlay('डेटा लोड हो रहा है...');

        try {
            // Load all data from Firebase in parallel
            const [patientsResult, visitsResult, alertsResult, appointmentsResult] = await Promise.all([
                getAllPatients(),
                getAllVisits(),
                getActiveAlerts(),
                getUpcomingAppointments()
            ]);

            // Update global arrays
            if (patientsResult.success) {
                patients = patientsResult.data;
                console.log(`✅ Loaded ${patients.length} patients`);
            } else {
                console.error('❌ Error loading patients:', patientsResult.error);
            }

            if (visitsResult.success) {
                visits = visitsResult.data;
                console.log(`✅ Loaded ${visits.length} visits`);
            } else {
                console.error('❌ Error loading visits:', visitsResult.error);
            }

            if (alertsResult.success) {
                alerts = alertsResult.data;
                console.log(`✅ Loaded ${alerts.length} alerts`);
            } else {
                console.error('❌ Error loading alerts:', alertsResult.error);
            }

            if (appointmentsResult.success) {
                appointments = appointmentsResult.data;
                console.log(`✅ Loaded ${appointments.length} appointments`);
            } else {
                console.error('❌ Error loading appointments:', appointmentsResult.error);
            }

            // Setup real-time listeners
            this.setupRealtimeListeners();

            // Initialize UI
            this.renderDashboard();
            this.updateCharts();

            // Hide loading
            this.hideLoadingOverlay();

            this.isInitialized = true;
            console.log('✅ App initialized successfully with Firebase!');

        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.hideLoadingOverlay();
            this.showErrorNotification('डेटा लोड करने में त्रुटि: ' + error.message);
        }
    }

    // ===================================
    // REAL-TIME LISTENERS (NEW)
    // ===================================

    setupRealtimeListeners() {
        console.log('👂 Setting up real-time Firebase listeners...');

        // Listen to patient changes
        onPatientsChange((result) => {
            if (result.success) {
                console.log('🔄 Patients updated:', result.data.length);
                const oldCount = patients.length;
                patients = result.data;

                // Update UI
                this.renderDashboard();
                this.updateCharts();

                // Show notification if new patient added
                if (patients.length > oldCount) {
                    this.showSuccessNotification('✅ नया मरीज जोड़ा गया!');
                }
            }
        });

        // Listen to visit changes (WhatsApp recordings)
        onVisitsChange((result) => {
            if (result.success) {
                console.log('🔄 Visits updated:', result.data.length);
                const oldCount = visits.length;
                visits = result.data;

                // If new visit added, show notification
                if (visits.length > oldCount) {
                    this.showSuccessNotification('🎤 नई रिकॉर्डिंग प्राप्त हुई!');
                }
            }
        });

        // Listen to alert changes
        onAlertsChange((result) => {
            if (result.success) {
                console.log('🔄 Alerts updated:', result.data.length);

                const newAlerts = result.data;
                const oldUnacknowledged = alerts.filter(a => !a.acknowledged).length;
                const newUnacknowledged = newAlerts.filter(a => !a.acknowledged).length;

                alerts = newAlerts;

                // If new unacknowledged alert, play sound and show notification
                if (newUnacknowledged > oldUnacknowledged) {
                    this.playAlertSound();
                    this.showWarningNotification('⚠️ नया आपातकालीन अलर्ट!');
                }

                // Update dashboard
                this.renderDashboard();
            }
        });

        console.log('✅ Real-time listeners active');
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
                this.savePatient();
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
                this.saveAppointment();
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
        const totalPatients = patients.length;
        const highRiskPatients = patients.filter(p =>
            this.assessRisk(p) === 'HIGH'
        ).length;

        const today = new Date().toISOString().split('T')[0];
        const todayFollowups = appointments.filter(a => {
            if (!a.date) return false;
            const aptDate = a.date.toDate ? a.date.toDate().toISOString().split('T')[0] : a.date;
            return aptDate === today;
        }).length;

        const upcomingVisits = appointments.filter(a => {
            if (!a.date) return false;
            const aptDate = a.date.toDate ? a.date.toDate() : new Date(a.date);
            return aptDate > new Date();
        }).length;

        document.getElementById('totalPatients').textContent = totalPatients;
        document.getElementById('highRiskPatients').textContent = highRiskPatients;
        document.getElementById('todayFollowups').textContent = todayFollowups;
        document.getElementById('upcomingVisits').textContent = upcomingVisits;
    }

    updateCharts() {
        const { villageData, riskData } = this.chartRenderer.calculateStats(patients);
        this.chartRenderer.updateCharts(villageData, riskData);
    }

    // ===================================
    // Add Patient (FIREBASE VERSION)
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

    async savePatient() {
        console.log('💾 Saving patient to Firebase...');

        // Get form data
        const bpSystolic = parseInt(document.getElementById('bpSystolic').value) || 0;
        const bpDiastolic = parseInt(document.getElementById('bpDiastolic').value) || 0;
        const sugarLevel = parseInt(document.getElementById('sugarLevel').value) || 0;
        const isPregnant = document.getElementById('pregnancyStatus').value === 'yes';

        const patientData = {
            name: document.getElementById('patientName').value,
            age: parseInt(document.getElementById('patientAge').value),
            village: document.getElementById('patientVillage').value,
            phone: document.getElementById('patientPhone').value,
            bpSystolic,
            bpDiastolic,
            sugarLevel,
            pregnancyStatus: document.getElementById('pregnancyStatus').value,
            symptoms: document.getElementById('symptoms').value,
            insurance: { hasCard: false }
        };

        // Calculate risk level
        patientData.riskLevel = this.calculateRiskLevel(bpSystolic, bpDiastolic, sugarLevel, isPregnant);

        // Show loading state
        const submitBtn = document.querySelector('#patientForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> सहेज रहे हैं...';

        try {
            // Save to Firebase
            const result = await addPatient(patientData);

            if (result.success) {
                console.log('✅ Patient saved:', result.data.id);

                // Success notification
                this.showSuccessNotification('✅ मरीज सफलतापूर्वक जोड़ा गया!');

                // If high risk, show warning
                if (patientData.riskLevel === 'HIGH') {
                    setTimeout(() => {
                        this.showWarningNotification('⚠️ यह उच्च जोखिम मरीज है!');
                    }, 500);
                }

                // Reset form
                document.getElementById('patientForm').reset();
                document.getElementById('transcriptionText').textContent = 'यहाँ आपकी आवाज़ दिखाई देगी...';

                // Navigate back to dashboard after delay
                setTimeout(() => {
                    this.switchModule('dashboard');
                }, 1500);

            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('❌ Error saving patient:', error);
            this.showErrorNotification('❌ त्रुटि: मरीज सहेजने में समस्या');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // ===================================
    // Search Patients
    // ===================================

    searchPatients(query) {
        const results = patients.filter(p =>
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
            const risk = this.assessRisk(patient);
            const riskLabel = risk === 'HIGH' ? 'उच्च' : risk === 'MEDIUM' ? 'मध्यम' : 'कम';
            const lastVisit = patient.updated_at ?
                new Date(patient.updated_at.seconds * 1000).toLocaleDateString('hi-IN') :
                'N/A';

            return `
                <div class="patient-card" onclick="app.viewPatientProfile('${patient.id}')">
                    <div class="patient-card-header">
                        <div class="patient-name">${patient.name}</div>
                        <span class="risk-badge ${risk.toLowerCase()}">${riskLabel}</span>
                    </div>
                    <div class="patient-info">
                        <div>गाँव: ${patient.village}</div>
                        <div>उम्र: ${patient.age} वर्ष</div>
                        <div>BP: ${patient.blood_pressure?.systolic || patient.bpSystolic}/${patient.blood_pressure?.diastolic || patient.bpDiastolic}</div>
                        <div>अंतिम विज़िट: ${lastVisit}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    voiceSearch() {
        this.showWarningNotification('आवाज़ खोज सक्रिय...');
        // Implement voice search similar to voice input
    }

    // ===================================
    // Patient Profile
    // ===================================

    viewPatientProfile(patientId) {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        const risk = this.assessRisk(patient);
        const riskLabel = risk === 'HIGH' ? 'उच्च जोखिम' : risk === 'MEDIUM' ? 'मध्यम जोखिम' : 'कम जोखिम';
        const lastVisit = patient.updated_at ?
            new Date(patient.updated_at.seconds * 1000).toLocaleDateString('hi-IN') :
            'N/A';

        const profileContent = `
            <div class="patient-card">
                <div class="patient-card-header">
                    <div class="patient-name">${patient.name}</div>
                    <span class="risk-badge ${risk.toLowerCase()}">${riskLabel}</span>
                </div>
                <div class="patient-info">
                    <div><strong>उम्र:</strong> ${patient.age} वर्ष</div>
                    <div><strong>गाँव:</strong> ${patient.village}</div>
                    <div><strong>फ़ोन:</strong> ${patient.phone || 'N/A'}</div>
                    <div><strong>रक्तचाप:</strong> ${patient.blood_pressure?.systolic || patient.bpSystolic}/${patient.blood_pressure?.diastolic || patient.bpDiastolic}</div>
                    <div><strong>शुगर:</strong> ${patient.sugar_level || patient.sugarLevel}</div>
                    <div><strong>गर्भावस्था:</strong> ${patient.is_pregnant || patient.pregnancyStatus === 'yes' ? 'हाँ' : 'नहीं'}</div>
                    <div><strong>लक्षण:</strong> ${patient.symptoms}</div>
                    <div><strong>अंतिम विज़िट:</strong> ${lastVisit}</div>
                    <div><strong>बीमा:</strong> ${patient.insurance_status !== 'NONE' ? 'हाँ' : 'नहीं'}</div>
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
        const highRiskPatients = patients.filter(p =>
            this.assessRisk(p) === 'HIGH'
        );

        const container = document.getElementById('highRiskList');

        if (highRiskPatients.length === 0) {
            container.innerHTML = '<p class="empty-state">कोई उच्च जोखिम मरीज नहीं</p>';
            return;
        }

        container.innerHTML = highRiskPatients.map(patient => `
            <div class="patient-card" onclick="app.viewPatientProfile('${patient.id}')">
                <div class="patient-card-header">
                    <div class="patient-name">${patient.name}</div>
                    <span class="risk-badge high">उच्च जोखिम</span>
                </div>
                <div class="patient-info">
                    <div>गाँव: ${patient.village}</div>
                    <div>BP: ${patient.blood_pressure?.systolic || patient.bpSystolic}/${patient.blood_pressure?.diastolic || patient.bpDiastolic}</div>
                    <div>शुगर: ${patient.sugar_level || patient.sugarLevel}</div>
                    <div>फ़ोन: ${patient.phone || 'N/A'}</div>
                </div>
            </div>
        `).join('');
    }

    // ===================================
    // Calendar & Appointments (FIREBASE VERSION)
    // ===================================

    renderCalendar() {
        const container = document.getElementById('upcomingAppointmentsList');
        const upcoming = appointments.filter(a => {
            if (!a.date) return false;
            const aptDate = a.date.toDate ? a.date.toDate() : new Date(a.date);
            return aptDate >= new Date();
        }).sort((a, b) => {
            const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
            return dateA - dateB;
        });

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">कोई आगामी अपॉइंटमेंट नहीं</p>';
            return;
        }

        container.innerHTML = upcoming.map(apt => {
            const patient = patients.find(p => p.id === apt.patient_id);
            const aptDate = apt.date.toDate ? apt.date.toDate().toLocaleDateString('hi-IN') : apt.date;

            return `
                <div class="patient-card">
                    <div class="patient-name">${patient ? patient.name : apt.patient_name || 'Unknown'}</div>
                    <div class="patient-info">
                        <div>तारीख: ${aptDate}</div>
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
                patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    }

    async saveAppointment() {
        console.log('💾 Saving appointment to Firebase...');

        const appointmentData = {
            patient_id: document.getElementById('appointmentPatient').value,
            patient_name: patients.find(p => p.id === document.getElementById('appointmentPatient').value)?.name || '',
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            notes: document.getElementById('appointmentNotes').value
        };

        try {
            const result = await addAppointment(appointmentData);

            if (result.success) {
                console.log('✅ Appointment saved:', result.data.id);
                this.showSuccessNotification('✅ अपॉइंटमेंट निर्धारित किया गया');
                this.closeModal('appointmentModal');
                document.getElementById('appointmentForm').reset();
                this.renderCalendar();
                this.renderDashboard();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('❌ Error saving appointment:', error);
            this.showErrorNotification('❌ अपॉइंटमेंट सहेजने में समस्या');
        }
    }

    // ===================================
    // Reports
    // ===================================

    populateReportSelect() {
        const select = document.getElementById('reportPatientSelect');
        if (select) {
            select.innerHTML = '<option value="">मरीज चुनें...</option>' +
                patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    }

    previewReport(patientId) {
        if (!patientId) return;

        const patient = patients.find(p => p.id === patientId);
        if (!patient) return;

        const risk = this.assessRisk(patient);
        const riskLabel = risk === 'HIGH' ? 'उच्च' : risk === 'MEDIUM' ? 'मध्यम' : 'कम';
        const preview = document.getElementById('reportPreview');

        preview.innerHTML = `
            <div class="patient-card">
                <h3>${patient.name} - रिपोर्ट पूर्वावलोकन</h3>
                <div class="patient-info">
                    <div><strong>उम्र:</strong> ${patient.age}</div>
                    <div><strong>गाँव:</strong> ${patient.village}</div>
                    <div><strong>जोखिम स्तर:</strong> ${riskLabel}</div>
                    <div><strong>रक्तचाप:</strong> ${patient.blood_pressure?.systolic || patient.bpSystolic}/${patient.blood_pressure?.diastolic || patient.bpDiastolic}</div>
                    <div><strong>शुगर:</strong> ${patient.sugar_level || patient.sugarLevel}</div>
                    <div><strong>बीमा:</strong> ${patient.insurance_status !== 'NONE' ? 'हाँ' : 'नहीं'}</div>
                </div>
            </div>
        `;
    }

    generateReport() {
        const patientId = document.getElementById('reportPatientSelect').value;
        if (!patientId) {
            this.showWarningNotification('कृपया मरीज चुनें');
            return;
        }

        this.showSuccessNotification('PDF डाउनलोड हो रहा है...');
        // In production, integrate jsPDF or server-side PDF generation
    }

    // ===================================
    // Risk Assessment (Updated for Firebase schema)
    // ===================================

    assessRisk(patient) {
        // Handle both Firebase and old schema
        const bpSystolic = patient.blood_pressure?.systolic || patient.bpSystolic || 0;
        const bpDiastolic = patient.blood_pressure?.diastolic || patient.bpDiastolic || 0;
        const sugar = patient.sugar_level || patient.sugarLevel || 0;
        const isPregnant = patient.is_pregnant || patient.pregnancyStatus === 'yes';

        // Use Firebase risk_level if available
        if (patient.risk_level) {
            return patient.risk_level;
        }

        // Otherwise calculate
        return this.calculateRiskLevel(bpSystolic, bpDiastolic, sugar, isPregnant);
    }

    calculateRiskLevel(bpSystolic, bpDiastolic, sugar, isPregnant) {
        let score = 0;

        if (bpSystolic > 140 || bpDiastolic > 90) score += 2;
        else if (bpSystolic > 130 || bpDiastolic > 85) score += 1;

        if (sugar > 200) score += 2;
        else if (sugar > 140) score += 1;

        if (isPregnant) score += 1;

        if (score >= 3) return 'HIGH';
        if (score >= 1) return 'MEDIUM';
        return 'LOW';
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
    // UI Helper Functions (NEW)
    // ===================================

    showLoadingOverlay(message = 'लोड हो रहा है...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
        `;
        overlay.innerHTML = `
            <div class="spinner" style="
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="margin-top: 20px; font-size: 18px;">${message}</p>
        `;
        document.body.appendChild(overlay);

        // Add spinner animation
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showWarningNotification(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification notification-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            font-family: 'Noto Sans Devanagari', sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    playAlertSound() {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Could not play sound:', err));
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    // ===================================
    // Alerts (Keep existing system)
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
        this.showWarningNotification('आवाज़ कमांड सुन रहा हूँ...');
        // Implement global voice commands
    }
}

// ===================================
// Global functions for onclick handlers
// ===================================
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

// ===================================
// Initialize app when DOM is ready
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, initializing app...');
    window.app = new SwasthyaSaathiApp();
});

console.log('📦 App.js module loaded (Firebase version)');
