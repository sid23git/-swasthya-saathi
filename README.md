# Swasthya Saathi (स्वास्थ्य साथी)

**Vernacular Voice Assistant for ASHA Workers**

A comprehensive, mobile-first web application designed to empower ASHA (Accredited Social Health Activist) workers in rural India with tools for patient management, risk assessment, and healthcare coordination.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Hindi](https://img.shields.io/badge/language-Hindi-orange.svg)

## 🌟 Features

### Core Modules
- **📊 Dashboard** - Real-time statistics and visualizations
- **👤 Add Patient** - Voice-enabled patient registration
- **🔍 Search Patient** - Multi-field search with voice support
- **📅 Calendar** - Appointment scheduling and follow-ups
- **⚠️ High Risk Patients** - Automatic risk assessment and alerts
- **🏥 Insurance** - Ayushman Bharat integration
- **💬 Communication** - Patient and worker messaging
- **🚌 Transport** - Route planning for field visits
- **📚 Health Coach** - Gamified learning for ASHA workers
- **📄 Reports** - PDF export of patient data

### Key Capabilities
- ✅ **Hindi-First Interface** - Complete vernacular language support
- ✅ **Voice Input** - Hands-free data entry with speech recognition
- ✅ **Mobile Optimized** - Responsive design for field work
- ✅ **Risk Detection** - Automatic identification of high-risk patients
- ✅ **Offline Ready** - LocalStorage for data persistence
- ✅ **Accessible** - WCAG compliant with dark mode support

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Node.js (for development server) - optional

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ramanaykarwa/swasthya-saathi.git
cd swasthya-saathi
```

2. **Start the application**

**Option A: Using npx (recommended)**
```bash
npx -y http-server -p 8080 -o
```

**Option B: Using Python**
```bash
python -m http.server 8080
```

**Option C: Open directly**
- Simply open `index.html` in your browser

3. **Access the app**
- Navigate to `http://localhost:8080`
- The app will open automatically

## 📱 Usage

### Adding a Patient
1. Click "मरीज जोड़ें" (Add Patient) in the sidebar
2. Click the microphone button for voice input (demo mode)
3. Or manually fill the form with patient details
4. System automatically assesses risk level
5. High-risk patients trigger alerts

### Searching Patients
1. Navigate to "मरीज खोजें" (Search Patient)
2. Type name, village, or phone number
3. Or use voice search button
4. Click patient card to view full profile

### Managing Appointments
1. Go to "कैलेंडर" (Calendar)
2. Click "अपॉइंटमेंट जोड़ें" (Add Appointment)
3. Select patient, date, and time
4. View upcoming appointments in the list

## 🎨 Design System

### Color Palette
- **Primary Green**: `#2E7D32` - Healthcare theme
- **Secondary Blue**: `#0288D1` - Medical accent
- **Danger Red**: `#D32F2F` - High risk alerts
- **Warning Orange**: `#F57C00` - Medium risk
- **Success Green**: `#388E3C` - Confirmations

### Typography
- **Hindi**: Noto Sans Devanagari (Google Fonts)
- **English**: Inter (Google Fonts)

## 🏗️ Project Structure

```
swasthya-saathi/
├── index.html          # Main HTML structure
├── styles.css          # Complete design system
├── app.js              # Main application logic
├── translations.js     # Hindi/English translations
├── voice-handler.js    # Voice recognition handler
├── charts.js           # Chart rendering engine
└── README.md           # This file
```

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charts**: Canvas API
- **Voice**: Web Speech API (browser-based)
- **Storage**: LocalStorage
- **Fonts**: Google Fonts
- **Icons**: SVG

## 📊 Risk Assessment Algorithm

```javascript
Risk Score Calculation:
- BP > 140/90: +2 points
- BP > 130/85: +1 point
- Sugar > 200: +2 points
- Sugar > 140: +1 point
- Pregnancy: +1 point

Risk Levels:
- High: Score >= 3
- Medium: Score >= 1
- Low: Score < 1
```

## 🌐 Browser Support

- ✅ Chrome/Edge 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ❌ IE11 (Not supported)

## 📦 Deployment

### Static Hosting (Current Version)
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)
- **Vercel**: One-click deployment
- **GitHub Pages**: Free static hosting
- **Firebase Hosting**: Google Cloud integration

### Production Requirements
For production deployment with real patient data:
- Backend API (Node.js/Python/PHP)
- Database (PostgreSQL/MongoDB)
- Authentication system
- HTTPS/SSL certificate
- Data encryption (HIPAA compliance)
- Cloud speech service (Google/Azure)

## 🔐 Security Considerations

⚠️ **Important**: Current version uses LocalStorage for demo purposes only.

For production:
- Implement user authentication
- Use secure backend API
- Encrypt sensitive patient data
- Follow healthcare data regulations (HIPAA/GDPR)
- Regular security audits
- HTTPS only

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Siddharth** - Initial work - [ramanaykarwa](https://github.com/ramanaykarwa)

## 🙏 Acknowledgments

- Designed for ASHA workers in rural India
- Inspired by the need for accessible healthcare technology
- Built with modern web standards
- Google Fonts for typography
- Open source community

## 📞 Support

For support, questions, or feedback:
- Open an issue on GitHub
- Contact: [Your Email]

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Real backend integration
- [ ] Multi-user authentication
- [ ] Real-time data sync
- [ ] Advanced analytics
- [ ] Telemedicine integration
- [ ] Offline-first with Service Worker
- [ ] Mobile app (React Native)

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Add Patient
![Add Patient](screenshots/add-patient.png)

### Mobile View
![Mobile View](screenshots/mobile.png)

---

**Built with ❤️ for ASHA Workers and Rural Healthcare**

**Made in India 🇮🇳**
