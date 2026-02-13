// Translations for Hindi and English
const translations = {
    hi: {
        // Header
        appName: 'स्वास्थ्य साथी',
        notifications: 'सूचनाएं',
        profile: 'प्रोफ़ाइल',
        
        // Navigation
        dashboard: 'डैशबोर्ड',
        addPatient: 'मरीज जोड़ें',
        searchPatient: 'मरीज खोजें',
        calendar: 'कैलेंडर',
        highRisk: 'उच्च जोखिम मरीज',
        insurance: 'बीमा',
        communication: 'संचार',
        transport: 'परिवहन',
        healthCoach: 'स्वास्थ्य कोच',
        reports: 'रिपोर्ट',
        
        // Dashboard
        totalPatients: 'कुल मरीज',
        highRiskPatients: 'उच्च जोखिम मरीज',
        todayFollowups: 'आज के फॉलो-अप',
        upcomingVisits: 'आगामी विज़िट',
        patientsByVillage: 'गाँव के अनुसार मरीज',
        riskDistribution: 'जोखिम वितरण',
        viewHighRisk: 'उच्च जोखिम देखें',
        openCalendar: 'कैलेंडर खोलें',
        
        // Forms
        name: 'नाम',
        age: 'उम्र',
        village: 'गाँव',
        phone: 'फ़ोन नंबर',
        bloodPressure: 'रक्तचाप',
        systolic: 'सिस्टोलिक',
        diastolic: 'डायस्टोलिक',
        sugarLevel: 'शुगर स्तर',
        pregnancyStatus: 'गर्भावस्था स्थिति',
        symptoms: 'लक्षण',
        save: 'सहेजें',
        reset: 'रीसेट करें',
        cancel: 'रद्द करें',
        
        // Voice
        voiceInstruction: 'माइक्रोफ़ोन पर क्लिक करें और मरीज की जानकारी बोलें',
        transcriptionPlaceholder: 'यहाँ आपकी आवाज़ दिखाई देगी...',
        voiceCommand: 'आवाज़ कमांड',
        
        // Search
        searchPlaceholder: 'नाम, गाँव या फ़ोन नंबर से खोजें...',
        voiceSearch: 'आवाज़ से खोजें',
        
        // Alerts
        patientAdded: 'मरीज सफलतापूर्वक जोड़ा गया',
        highRiskDetected: 'उच्च जोखिम मरीज का पता चला',
        appointmentScheduled: 'अपॉइंटमेंट निर्धारित किया गया',
        
        // Risk Levels
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'कम',
        
        // Empty States
        noPatients: 'कोई मरीज नहीं',
        noAppointments: 'कोई आगामी अपॉइंटमेंट नहीं',
        noResults: 'कोई परिणाम नहीं मिला',
        
        // Pregnancy
        yes: 'हाँ',
        no: 'नहीं',
        notApplicable: 'लागू नहीं'
    },
    en: {
        // Header
        appName: 'Swasthya Saathi',
        notifications: 'Notifications',
        profile: 'Profile',
        
        // Navigation
        dashboard: 'Dashboard',
        addPatient: 'Add Patient',
        searchPatient: 'Search Patient',
        calendar: 'Calendar',
        highRisk: 'High Risk Patients',
        insurance: 'Insurance',
        communication: 'Communication',
        transport: 'Transport',
        healthCoach: 'Health Coach',
        reports: 'Reports',
        
        // Dashboard
        totalPatients: 'Total Patients',
        highRiskPatients: 'High Risk Patients',
        todayFollowups: 'Today\'s Follow-ups',
        upcomingVisits: 'Upcoming Visits',
        patientsByVillage: 'Patients by Village',
        riskDistribution: 'Risk Distribution',
        viewHighRisk: 'View High Risk',
        openCalendar: 'Open Calendar',
        
        // Forms
        name: 'Name',
        age: 'Age',
        village: 'Village',
        phone: 'Phone Number',
        bloodPressure: 'Blood Pressure',
        systolic: 'Systolic',
        diastolic: 'Diastolic',
        sugarLevel: 'Sugar Level',
        pregnancyStatus: 'Pregnancy Status',
        symptoms: 'Symptoms',
        save: 'Save',
        reset: 'Reset',
        cancel: 'Cancel',
        
        // Voice
        voiceInstruction: 'Click the microphone and speak patient information',
        transcriptionPlaceholder: 'Your voice will appear here...',
        voiceCommand: 'Voice Command',
        
        // Search
        searchPlaceholder: 'Search by name, village or phone number...',
        voiceSearch: 'Voice Search',
        
        // Alerts
        patientAdded: 'Patient added successfully',
        highRiskDetected: 'High Risk Patient Detected',
        appointmentScheduled: 'Appointment scheduled',
        
        // Risk Levels
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        
        // Empty States
        noPatients: 'No patients',
        noAppointments: 'No upcoming appointments',
        noResults: 'No results found',
        
        // Pregnancy
        yes: 'Yes',
        no: 'No',
        notApplicable: 'Not Applicable'
    }
};

// Get translation
function t(key, lang = 'hi') {
    return translations[lang][key] || key;
}
