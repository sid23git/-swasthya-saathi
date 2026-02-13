// Firebase Integration Test
// Open browser console to see test results

import { db } from './firebase-config.js';
import {
    addPatient,
    getAllPatients,
    updatePatient,
    deletePatient,
    addVisit,
    getAllVisits,
    addAlert,
    getActiveAlerts,
    addAppointment,
    getUpcomingAppointments,
    onPatientsChange
} from './firebase-service.js';

console.log('🧪 Starting Firebase Integration Tests...\n');

// Test 1: Add a test patient
async function testAddPatient() {
    console.log('Test 1: Adding test patient...');
    const testPatient = {
        name: 'राधा देवी',
        age: 35,
        village: 'रामपुर',
        phone: '9876543210',
        bpSystolic: 150,
        bpDiastolic: 95,
        sugarLevel: 210,
        pregnancyStatus: 'no',
        symptoms: 'सिरदर्द, चक्कर आना',
        riskLevel: 'HIGH',
        insurance: { hasCard: true }
    };

    const result = await addPatient(testPatient);
    console.log('Result:', result);
    return result;
}

// Test 2: Get all patients
async function testGetAllPatients() {
    console.log('\nTest 2: Getting all patients...');
    const result = await getAllPatients();
    console.log('Result:', result);
    console.log(`Found ${result.data?.length || 0} patients`);
    return result;
}

// Test 3: Add a visit
async function testAddVisit(patientId) {
    console.log('\nTest 3: Adding test visit...');
    const testVisit = {
        patient_id: patientId || 'test-patient-id',
        patient_name: 'राधा देवी',
        asha_worker: 'सुनीता शर्मा',
        asha_phone: '9123456789',
        transcription: 'मरीज को सिरदर्द और चक्कर आ रहे हैं। रक्तचाप 150/95 है।',
        audio_url: 'https://example.com/audio.mp3',
        extracted_data: {
            name: 'राधा देवी',
            age: 35,
            village: 'रामपुर',
            vitals: { bp: '150/95', sugar: 210 },
            symptoms: 'सिरदर्द, चक्कर आना'
        },
        risk_level: 'HIGH'
    };

    const result = await addVisit(testVisit);
    console.log('Result:', result);
    return result;
}

// Test 4: Add an alert
async function testAddAlert(patientId, visitId) {
    console.log('\nTest 4: Adding emergency alert...');
    const testAlert = {
        visit_id: visitId || 'test-visit-id',
        patient_id: patientId || 'test-patient-id',
        patient_name: 'राधा देवी',
        village: 'रामपुर',
        asha_worker: 'सुनीता शर्मा',
        severity: 'HIGH',
        risk_factors: ['उच्च रक्तचाप', 'उच्च शुगर'],
        recommended_action: 'तुरंत डॉक्टर से संपर्क करें'
    };

    const result = await addAlert(testAlert);
    console.log('Result:', result);
    return result;
}

// Test 5: Add an appointment
async function testAddAppointment(patientId) {
    console.log('\nTest 5: Adding test appointment...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testAppointment = {
        patient_id: patientId || 'test-patient-id',
        patient_name: 'राधा देवी',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        notes: 'फॉलो-अप चेकअप'
    };

    const result = await addAppointment(testAppointment);
    console.log('Result:', result);
    return result;
}

// Test 6: Real-time listener
function testRealtimeListener() {
    console.log('\nTest 6: Setting up real-time listener...');
    const unsubscribe = onPatientsChange((result) => {
        console.log('🔄 Real-time update received:');
        console.log(`Patients count: ${result.data?.length || 0}`);
    });

    console.log('✅ Real-time listener active');
    console.log('To stop listening, call: unsubscribe()');

    // Store unsubscribe function globally
    window.unsubscribePatients = unsubscribe;
    return unsubscribe;
}

// Run all tests
async function runAllTests() {
    try {
        console.log('═══════════════════════════════════════');
        console.log('🔥 FIREBASE INTEGRATION TEST SUITE');
        console.log('═══════════════════════════════════════\n');

        // Test 1: Add patient
        const addResult = await testAddPatient();
        const patientId = addResult.data?.id;

        // Wait a bit for Firestore to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 2: Get all patients
        await testGetAllPatients();

        // Test 3: Add visit
        const visitResult = await testAddVisit(patientId);
        const visitId = visitResult.data?.id;

        // Test 4: Add alert
        await testAddAlert(patientId, visitId);

        // Test 5: Add appointment
        await testAddAppointment(patientId);

        // Test 6: Real-time listener
        testRealtimeListener();

        console.log('\n═══════════════════════════════════════');
        console.log('✅ ALL TESTS COMPLETED');
        console.log('═══════════════════════════════════════');
        console.log('\nCheck your Firebase Console to verify data:');
        console.log('https://console.firebase.google.com/project/swasthya-saathi-asha/firestore');
        console.log('\nTo clean up test data, delete the documents from Firestore Console');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        console.error('Error details:', error.message);
    }
}

// Auto-run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.firebaseTests = {
    runAllTests,
    testAddPatient,
    testGetAllPatients,
    testAddVisit,
    testAddAlert,
    testAddAppointment,
    testRealtimeListener
};

console.log('\n💡 Manual testing available via: window.firebaseTests');
