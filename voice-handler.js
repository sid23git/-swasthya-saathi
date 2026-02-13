// Voice Handler Module
class VoiceHandler {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.initializeWebSpeech();
    }

    initializeWebSpeech() {
        // Check if Web Speech API is available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'hi-IN'; // Hindi language

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.onTranscript(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.onError(event.error);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.onEnd();
            };
        } else {
            console.warn('Web Speech API not supported');
        }
    }

    start(callback) {
        if (this.recognition && !this.isListening) {
            this.isListening = true;
            this.recognition.start();
            if (callback) callback();
        } else {
            // Simulate voice input for demo purposes
            this.simulateVoiceInput(callback);
        }
    }

    stop(callback) {
        if (this.recognition && this.isListening) {
            this.isListening = false;
            this.recognition.stop();
            if (callback) callback();
        }
    }

    simulateVoiceInput(callback) {
        // Demo simulation
        this.isListening = true;
        if (callback) callback();

        const demoTexts = [
            'नाम सीता देवी',
            'उम्र 35 साल',
            'गाँव रामपुर',
            'रक्तचाप 140 बटा 90',
            'शुगर 180'
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < demoTexts.length && this.isListening) {
                this.onTranscript(demoTexts.slice(0, index + 1).join(', '));
                index++;
            } else {
                clearInterval(interval);
                this.isListening = false;
                this.onEnd();
            }
        }, 1000);
    }

    onTranscript(text) {
        // Override this method
        console.log('Transcript:', text);
    }

    onError(error) {
        // Override this method
        console.error('Voice error:', error);
    }

    onEnd() {
        // Override this method
        console.log('Voice input ended');
    }

    parsePatientData(transcript) {
        // Simple parsing logic for demo
        const data = {
            name: '',
            age: '',
            village: '',
            bpSystolic: '',
            bpDiastolic: '',
            sugarLevel: '',
            symptoms: transcript
        };

        // Extract name
        const nameMatch = transcript.match(/नाम\s+([^\s,]+(?:\s+[^\s,]+)?)/i);
        if (nameMatch) data.name = nameMatch[1];

        // Extract age
        const ageMatch = transcript.match(/उम्र\s+(\d+)/i);
        if (ageMatch) data.age = ageMatch[1];

        // Extract village
        const villageMatch = transcript.match(/गाँव\s+([^\s,]+)/i);
        if (villageMatch) data.village = villageMatch[1];

        // Extract BP
        const bpMatch = transcript.match(/रक्तचाप\s+(\d+)\s*(?:बटा|\/)\s*(\d+)/i);
        if (bpMatch) {
            data.bpSystolic = bpMatch[1];
            data.bpDiastolic = bpMatch[2];
        }

        // Extract sugar
        const sugarMatch = transcript.match(/शुगर\s+(\d+)/i);
        if (sugarMatch) data.sugarLevel = sugarMatch[1];

        return data;
    }

    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceHandler;
}
