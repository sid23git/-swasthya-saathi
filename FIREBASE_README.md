# Firebase Integration Guide

## 🔥 Firebase Setup Complete!

Your Swasthya Saathi app now has full Firebase Firestore integration.

## Files Created

1. **firebase-config.js** - Firebase initialization
2. **firebase-service.js** - All database operations
3. **firebase-test.js** - Integration tests
4. **index.html** - Updated with Firebase SDK

## Firestore Collections

### 1. Patients Collection (`/patients`)
```javascript
{
  name: string,
  age: number,
  village: string,
  phone: string,
  blood_pressure: { systolic: number, diastolic: number },
  sugar_level: number,
  is_pregnant: boolean,
  symptoms: string,
  risk_level: "HIGH" | "MEDIUM" | "LOW",
  insurance_status: string,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### 2. Visits Collection (`/visits`)
For WhatsApp voice recordings:
```javascript
{
  patient_id: string,
  patient_name: string,
  asha_worker: string,
  asha_phone: string,
  transcription: string,
  audio_url: string,
  extracted_data: object,
  risk_level: string,
  is_emergency: boolean,
  timestamp: Timestamp
}
```

### 3. Alerts Collection (`/alerts`)
Emergency notifications:
```javascript
{
  visit_id: string,
  patient_id: string,
  patient_name: string,
  village: string,
  severity: "HIGH" | "MEDIUM" | "LOW",
  risk_factors: array,
  recommended_action: string,
  acknowledged: boolean,
  created_at: Timestamp
}
```

### 4. Appointments Collection (`/appointments`)
```javascript
{
  patient_id: string,
  patient_name: string,
  date: Timestamp,
  time: string,
  notes: string,
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED",
  created_at: Timestamp
}
```

## Available Functions

### Patient Operations
```javascript
import { 
  addPatient, 
  updatePatient, 
  deletePatient, 
  getPatient, 
  getAllPatients,
  onPatientsChange 
} from './firebase-service.js';

// Add patient
const result = await addPatient(patientData);

// Get all patients
const patients = await getAllPatients();

// Real-time updates
const unsubscribe = onPatientsChange((result) => {
  console.log('Patients updated:', result.data);
});
```

### Visit Operations
```javascript
import { 
  addVisit, 
  getVisitsByPatient, 
  getAllVisits,
  onVisitsChange 
} from './firebase-service.js';

// Add visit (from WhatsApp voice)
const result = await addVisit(visitData);

// Get patient's visit history
const visits = await getVisitsByPatient(patientId);
```

### Alert Operations
```javascript
import { 
  addAlert, 
  getActiveAlerts, 
  acknowledgeAlert,
  onAlertsChange 
} from './firebase-service.js';

// Create emergency alert
const result = await addAlert(alertData);

// Get unacknowledged alerts
const alerts = await getActiveAlerts();

// Acknowledge alert
await acknowledgeAlert(alertId);
```

### Appointment Operations
```javascript
import { 
  addAppointment, 
  getUpcomingAppointments, 
  updateAppointment,
  deleteAppointment 
} from './firebase-service.js';

// Schedule appointment
const result = await addAppointment(appointmentData);

// Get upcoming appointments
const appointments = await getUpcomingAppointments();
```

## Testing

### Option 1: Automated Tests
1. Open `index.html` in your browser
2. Add this script tag temporarily:
```html
<script type="module" src="firebase-test.js"></script>
```
3. Open browser console (F12)
4. Tests will run automatically
5. Check Firebase Console to verify data

### Option 2: Manual Testing
Open browser console and run:
```javascript
// Test adding a patient
const result = await window.firebaseTests.testAddPatient();

// Test getting all patients
await window.firebaseTests.testGetAllPatients();

// Run all tests
await window.firebaseTests.runAllTests();
```

## Firebase Console

View your data at:
https://console.firebase.google.com/project/swasthya-saathi-asha/firestore

## Security Rules (Important!)

⚠️ **Before production**, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For development (current setup):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // WARNING: Allow all for development only
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Error Handling

All functions return:
```javascript
{
  success: true,
  data: {...}
}
// OR
{
  success: false,
  error: "error message"
}
```

Example usage:
```javascript
const result = await addPatient(patientData);
if (result.success) {
  console.log('Patient added:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Next Steps

1. ✅ Test Firebase connection
2. ✅ Verify CRUD operations
3. ✅ Test real-time listeners
4. 🔄 Integrate with existing app.js
5. 🔄 Migrate from localStorage to Firebase
6. 🔄 Build Node.js backend for WhatsApp integration

## Troubleshooting

### Firebase not loading
- Check browser console for errors
- Verify internet connection
- Check Firebase config in `firebase-config.js`

### Permission denied errors
- Update Firestore security rules in Firebase Console
- Go to: Firestore Database → Rules

### Module import errors
- Ensure you're using a local server (http-server, not file://)
- Check that all script tags have `type="module"`

## Support

- Firebase Documentation: https://firebase.google.com/docs/firestore
- Firebase Console: https://console.firebase.google.com/
- Project ID: swasthya-saathi-asha
