import OpenAI from 'openai';

class TranscriptionService {
    constructor() {
        this.openaiClient = null;
        this.groqClient = null;
        this.speechRecognition = null;
        this.isInitialized = false;
        this.activeProvider = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.model = 'whisper-large-v3-turbo';
    }

    setModel(model) {
        this.model = model || 'whisper-large-v3-turbo';
    }

    initialize({ openaiApiKey, groqApiKey, transcriptionProvider = 'auto' } = {}) {
        if (openaiApiKey) {
            this.openaiClient = new OpenAI({
                apiKey: openaiApiKey,
                dangerouslyAllowBrowser: true,
            });
        }

        if (groqApiKey) {
            this.groqClient = new OpenAI({
                apiKey: groqApiKey,
                baseURL: 'https://api.groq.com/openai/v1',
                dangerouslyAllowBrowser: true,
            });
        }

        if (transcriptionProvider === 'auto') {
            if (groqApiKey) this.activeProvider = 'groq';
            else if (openaiApiKey) this.activeProvider = 'openai';
            else this.activeProvider = 'browser';
        } else if (transcriptionProvider === 'groq' && groqApiKey) {
            this.activeProvider = 'groq';
        } else if (transcriptionProvider === 'openai' && openaiApiKey) {
            this.activeProvider = 'openai';
        } else {
            if (groqApiKey) this.activeProvider = 'groq';
            else if (openaiApiKey) this.activeProvider = 'openai';
            else this.activeProvider = 'browser';
        }

        this.isInitialized = true;
        console.log(`[Transcription] Active provider: ${this.activeProvider}`);
    }

    async startCapture(onTranscription) {
        if (!this.isInitialized) {
            this.initialize({});
        }

        if (this.activeProvider === 'browser') {
            return this._startBrowserSpeechRecognition(onTranscription);
        } else {
            return this._startWhisperCapture(onTranscription);
        }
    }

    async _startWhisperCapture(onTranscription) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm',
            });

            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                if (this.audioChunks.length > 0) {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    this.audioChunks = [];

                    try {
                        const transcription = await this._transcribeWithWhisper(audioBlob);
                        if (transcription && onTranscription) {
                            onTranscription(transcription);
                        }
                    } catch (error) {
                        console.error('Transcription error:', error);
                    }

                    if (this.mediaRecorder && this.mediaRecorder.state !== 'recording') {
                        this.audioChunks = [];
                        this.mediaRecorder.start();
                        setTimeout(() => {
                            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                                this.mediaRecorder.stop();
                            }
                        }, 3000);
                    }
                }
            };

            this.mediaRecorder.start();
            setInterval(() => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop();
                }
            }, 3000);

            return true;
        } catch (error) {
            console.error('Failed to start Whisper audio capture:', error);
            throw error;
        }
    }

    async _transcribeWithWhisper(audioBlob) {
        const client = this.activeProvider === 'groq' ? this.groqClient : this.openaiClient;
        if (!client) throw new Error('No transcription client available');

        const model = this.activeProvider === 'groq'
            ? (this.model || 'whisper-large-v3-turbo')
            : 'whisper-1';

        const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

        const response = await client.audio.transcriptions.create({
            file: audioFile,
            model: model,
            language: 'en',
            response_format: 'verbose_json',
        });

        return {
            text: response.text,
            confidence: response.confidence || 0.8,
            timestamp: new Date(),
        };
    }

    _startBrowserSpeechRecognition(onTranscription) {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            throw new Error(
                'Browser speech recognition not supported. ' +
                'Please add an OpenAI or Groq API key for transcription.'
            );
        }

        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = 'en-US';
        this.speechRecognition.maxAlternatives = 1;

        this.speechRecognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    const text = event.results[i][0].transcript.trim();
                    if (text && onTranscription) {
                        onTranscription({
                            text,
                            confidence: event.results[i][0].confidence || 0.8,
                            timestamp: new Date(),
                        });
                    }
                }
            }
        };

        this.speechRecognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                console.error('Speech recognition error:', event.error);
            }
        };

        this.speechRecognition.onend = () => {
            if (this.speechRecognition) {
                try { this.speechRecognition.start(); } catch (_) { /* noop */ }
            }
        };

        this.speechRecognition.start();
        return true;
    }

    stopCapture() {
        if (this.speechRecognition) {
            this.speechRecognition.onend = null;
            this.speechRecognition.stop();
            this.speechRecognition = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    isQuestion(text) {
        const lowerText = text.toLowerCase().trim();
        if (lowerText.endsWith('?')) return true;

        const explicitMarkers = [
            'what', 'why', 'how', 'when', 'where', 'who', 'which',
            'can you', 'could you', 'would you', 'will you', 'do you',
            'did you', 'have you', 'are you', 'is there', 'was there',
            'tell me', 'explain', 'describe', 'walk me through', 'help me',
        ];
        if (explicitMarkers.some(m => lowerText.includes(m))) return true;

        const impliedMarkers = [
            "what's your", "what's the", "how do you", "how did you",
            "how does", "what about", "tell me about", "talk me through",
            "i'm curious", "i'd love to hear", "your thoughts on",
            "your approach to", "your experience with",
            'so the ', 'and the ', 'scaling', 'performance', 'challenge',
            'struggle', 'difficulty', 'biggest', 'favorite', 'opinion',
        ];
        if (impliedMarkers.some(m => lowerText.includes(m))) return true;

        return false;
    }

    getActiveProvider() {
        return this.activeProvider;
    }
}

export default new TranscriptionService();