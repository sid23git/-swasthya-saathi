// Firebase Service Layer
// All Firestore operations for Swasthya Saathi

import { db } from './firebase-config.js';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ===================================
// PATIENTS OPERATIONS
// ===================================

/**
 * Add a new patient to Firestore
 * @param {Object} patientData - Patient information
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function addPatient(patientData) {
    try {
        console.log('📝 Adding new patient:', patientData.name);

        const patientsRef = collection(db, 'patients');
        const docRef = await addDoc(patientsRef, {
            name: patientData.name || '',
            age: parseInt(patientData.age) || 0,
            village: patientData.village || '',
            phone: patientData.phone || '',
            blood_pressure: {
                systolic: parseInt(patientData.bpSystolic) || 0,
                diastolic: parseInt(patientData.bpDiastolic) || 0
            },
            sugar_level: parseInt(patientData.sugarLevel) || 0,
            is_pregnant: patientData.pregnancyStatus === 'yes',
            symptoms: patientData.symptoms || '',
            risk_level: patientData.riskLevel || 'LOW',
            insurance_status: patientData.insurance?.hasCard ? 'ACTIVE' : 'NONE',
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: 'web_app' // Can be updated to actual ASHA worker ID
        });

        console.log('✅ Patient added successfully with ID:', docRef.id);
        return {
            success: true,
            data: { id: docRef.id, ...patientData }
        };
    } catch (error) {
        console.error('❌ Error adding patient:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update an existing patient
 * @param {string} patientId - Patient document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function updatePatient(patientId, updates) {
    try {
        console.log('📝 Updating patient:', patientId);

        const patientRef = doc(db, 'patients', patientId);

        // Prepare update data
        const updateData = {
            ...updates,
            updated_at: serverTimestamp()
        };

        // Convert nested fields if present
        if (updates.bpSystolic || updates.bpDiastolic) {
            updateData.blood_pressure = {
                systolic: parseInt(updates.bpSystolic) || 0,
                diastolic: parseInt(updates.bpDiastolic) || 0
            };
            delete updateData.bpSystolic;
            delete updateData.bpDiastolic;
        }

        if (updates.pregnancyStatus) {
            updateData.is_pregnant = updates.pregnancyStatus === 'yes';
            delete updateData.pregnancyStatus;
        }

        await updateDoc(patientRef, updateData);

        console.log('✅ Patient updated successfully');
        return {
            success: true,
            data: { id: patientId, ...updates }
        };
    } catch (error) {
        console.error('❌ Error updating patient:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete a patient
 * @param {string} patientId - Patient document ID
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function deletePatient(patientId) {
    try {
        console.log('🗑️ Deleting patient:', patientId);

        const patientRef = doc(db, 'patients', patientId);
        await deleteDoc(patientRef);

        console.log('✅ Patient deleted successfully');
        return {
            success: true,
            data: { id: patientId }
        };
    } catch (error) {
        console.error('❌ Error deleting patient:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get a single patient by ID
 * @param {string} patientId - Patient document ID
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function getPatient(patientId) {
    try {
        console.log('📖 Fetching patient:', patientId);

        const patientRef = doc(db, 'patients', patientId);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
            console.log('✅ Patient found');
            return {
                success: true,
                data: {
                    id: patientSnap.id,
                    ...patientSnap.data()
                }
            };
        } else {
            console.warn('⚠️ Patient not found');
            return {
                success: false,
                error: 'Patient not found'
            };
        }
    } catch (error) {
        console.error('❌ Error fetching patient:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all patients
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function getAllPatients() {
    try {
        console.log('📖 Fetching all patients...');

        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);

        const patients = [];
        querySnapshot.forEach((doc) => {
            patients.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Found ${patients.length} patients`);
        return {
            success: true,
            data: patients
        };
    } catch (error) {
        console.error('❌ Error fetching patients:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Real-time listener for patients collection
 * @param {Function} callback - Function to call when data changes
 * @returns {Function} - Unsubscribe function
 */
export function onPatientsChange(callback) {
    console.log('👂 Setting up real-time listener for patients');

    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q,
        (snapshot) => {
            const patients = [];
            snapshot.forEach((doc) => {
                patients.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`🔄 Patients updated: ${patients.length} total`);
            callback({ success: true, data: patients });
        },
        (error) => {
            console.error('❌ Real-time listener error:', error);
            callback({ success: false, error: error.message });
        }
    );

    return unsubscribe;
}

// ===================================
// VISITS OPERATIONS
// ===================================

/**
 * Add a new visit (voice recording)
 * @param {Object} visitData - Visit information
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function addVisit(visitData) {
    try {
        console.log('📝 Adding new visit for patient:', visitData.patient_name);

        const visitsRef = collection(db, 'visits');
        const docRef = await addDoc(visitsRef, {
            patient_id: visitData.patient_id || '',
            patient_name: visitData.patient_name || '',
            asha_worker: visitData.asha_worker || 'Unknown',
            asha_phone: visitData.asha_phone || '',
            transcription: visitData.transcription || '',
            audio_url: visitData.audio_url || '',
            extracted_data: visitData.extracted_data || {},
            risk_level: visitData.risk_level || 'LOW',
            is_emergency: visitData.risk_level === 'HIGH',
            timestamp: serverTimestamp()
        });

        console.log('✅ Visit added successfully with ID:', docRef.id);
        return {
            success: true,
            data: { id: docRef.id, ...visitData }
        };
    } catch (error) {
        console.error('❌ Error adding visit:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all visits for a specific patient
 * @param {string} patientId - Patient document ID
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function getVisitsByPatient(patientId) {
    try {
        console.log('📖 Fetching visits for patient:', patientId);

        const visitsRef = collection(db, 'visits');
        const q = query(
            visitsRef,
            where('patient_id', '==', patientId),
            orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const visits = [];
        querySnapshot.forEach((doc) => {
            visits.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Found ${visits.length} visits`);
        return {
            success: true,
            data: visits
        };
    } catch (error) {
        console.error('❌ Error fetching visits:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all visits
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function getAllVisits() {
    try {
        console.log('📖 Fetching all visits...');

        const visitsRef = collection(db, 'visits');
        const q = query(visitsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        const visits = [];
        querySnapshot.forEach((doc) => {
            visits.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Found ${visits.length} visits`);
        return {
            success: true,
            data: visits
        };
    } catch (error) {
        console.error('❌ Error fetching visits:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Real-time listener for visits collection
 * @param {Function} callback - Function to call when data changes
 * @returns {Function} - Unsubscribe function
 */
export function onVisitsChange(callback) {
    console.log('👂 Setting up real-time listener for visits');

    const visitsRef = collection(db, 'visits');
    const q = query(visitsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q,
        (snapshot) => {
            const visits = [];
            snapshot.forEach((doc) => {
                visits.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`🔄 Visits updated: ${visits.length} total`);
            callback({ success: true, data: visits });
        },
        (error) => {
            console.error('❌ Real-time listener error:', error);
            callback({ success: false, error: error.message });
        }
    );

    return unsubscribe;
}

// ===================================
// ALERTS OPERATIONS
// ===================================

/**
 * Add a new emergency alert
 * @param {Object} alertData - Alert information
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function addAlert(alertData) {
    try {
        console.log('🚨 Creating emergency alert for:', alertData.patient_name);

        const alertsRef = collection(db, 'alerts');
        const docRef = await addDoc(alertsRef, {
            visit_id: alertData.visit_id || '',
            patient_id: alertData.patient_id || '',
            patient_name: alertData.patient_name || '',
            village: alertData.village || '',
            asha_worker: alertData.asha_worker || '',
            severity: alertData.severity || 'HIGH',
            risk_factors: alertData.risk_factors || [],
            recommended_action: alertData.recommended_action || '',
            acknowledged: false,
            acknowledged_at: null,
            acknowledged_by: null,
            created_at: serverTimestamp()
        });

        console.log('✅ Alert created successfully with ID:', docRef.id);
        return {
            success: true,
            data: { id: docRef.id, ...alertData }
        };
    } catch (error) {
        console.error('❌ Error creating alert:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all active (unacknowledged) alerts
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function getActiveAlerts() {
    try {
        console.log('📖 Fetching active alerts...');

        const alertsRef = collection(db, 'alerts');
        const q = query(
            alertsRef,
            where('acknowledged', '==', false),
            orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const alerts = [];
        querySnapshot.forEach((doc) => {
            alerts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Found ${alerts.length} active alerts`);
        return {
            success: true,
            data: alerts
        };
    } catch (error) {
        console.error('❌ Error fetching alerts:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Acknowledge an alert
 * @param {string} alertId - Alert document ID
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function acknowledgeAlert(alertId) {
    try {
        console.log('✅ Acknowledging alert:', alertId);

        const alertRef = doc(db, 'alerts', alertId);
        await updateDoc(alertRef, {
            acknowledged: true,
            acknowledged_at: serverTimestamp(),
            acknowledged_by: 'web_app' // Can be updated to actual user ID
        });

        console.log('✅ Alert acknowledged successfully');
        return {
            success: true,
            data: { id: alertId }
        };
    } catch (error) {
        console.error('❌ Error acknowledging alert:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Real-time listener for alerts collection
 * @param {Function} callback - Function to call when data changes
 * @returns {Function} - Unsubscribe function
 */
export function onAlertsChange(callback) {
    console.log('👂 Setting up real-time listener for alerts');

    const alertsRef = collection(db, 'alerts');
    const q = query(
        alertsRef,
        where('acknowledged', '==', false),
        orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q,
        (snapshot) => {
            const alerts = [];
            snapshot.forEach((doc) => {
                alerts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`🔄 Alerts updated: ${alerts.length} active`);
            callback({ success: true, data: alerts });
        },
        (error) => {
            console.error('❌ Real-time listener error:', error);
            callback({ success: false, error: error.message });
        }
    );

    return unsubscribe;
}

// ===================================
// APPOINTMENTS OPERATIONS
// ===================================

/**
 * Add a new appointment
 * @param {Object} appointmentData - Appointment information
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function addAppointment(appointmentData) {
    try {
        console.log('📝 Adding new appointment for:', appointmentData.patient_name);

        const appointmentsRef = collection(db, 'appointments');

        // Convert date string to Timestamp
        const appointmentDate = appointmentData.date
            ? Timestamp.fromDate(new Date(appointmentData.date))
            : serverTimestamp();

        const docRef = await addDoc(appointmentsRef, {
            patient_id: appointmentData.patient_id || '',
            patient_name: appointmentData.patient_name || '',
            date: appointmentDate,
            time: appointmentData.time || '',
            notes: appointmentData.notes || '',
            status: 'SCHEDULED',
            created_at: serverTimestamp()
        });

        console.log('✅ Appointment added successfully with ID:', docRef.id);
        return {
            success: true,
            data: { id: docRef.id, ...appointmentData }
        };
    } catch (error) {
        console.error('❌ Error adding appointment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get upcoming appointments
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function getUpcomingAppointments() {
    try {
        console.log('📖 Fetching upcoming appointments...');

        const appointmentsRef = collection(db, 'appointments');
        const now = Timestamp.now();
        const q = query(
            appointmentsRef,
            where('date', '>=', now),
            where('status', '==', 'SCHEDULED'),
            orderBy('date', 'asc')
        );
        const querySnapshot = await getDocs(q);

        const appointments = [];
        querySnapshot.forEach((doc) => {
            appointments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ Found ${appointments.length} upcoming appointments`);
        return {
            success: true,
            data: appointments
        };
    } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update an appointment
 * @param {string} appointmentId - Appointment document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function updateAppointment(appointmentId, updates) {
    try {
        console.log('📝 Updating appointment:', appointmentId);

        const appointmentRef = doc(db, 'appointments', appointmentId);

        // Convert date if present
        if (updates.date) {
            updates.date = Timestamp.fromDate(new Date(updates.date));
        }

        await updateDoc(appointmentRef, updates);

        console.log('✅ Appointment updated successfully');
        return {
            success: true,
            data: { id: appointmentId, ...updates }
        };
    } catch (error) {
        console.error('❌ Error updating appointment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete an appointment
 * @param {string} appointmentId - Appointment document ID
 * @returns {Promise<Object>} - { success: boolean, data/error }
 */
export async function deleteAppointment(appointmentId) {
    try {
        console.log('🗑️ Deleting appointment:', appointmentId);

        const appointmentRef = doc(db, 'appointments', appointmentId);
        await deleteDoc(appointmentRef);

        console.log('✅ Appointment deleted successfully');
        return {
            success: true,
            data: { id: appointmentId }
        };
    } catch (error) {
        console.error('❌ Error deleting appointment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Check if Firebase is connected
 * @returns {boolean}
 */
export function isFirebaseConnected() {
    return db !== null && db !== undefined;
}

console.log('📦 Firebase service module loaded successfully');
