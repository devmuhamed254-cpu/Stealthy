import { create } from 'zustand';

const useAppStore = create((set) => ({
  settings: {
    openaiApiKey: '',
    groqApiKey: '',
    openrouterApiKey: '',
    selectedProvider: 'openrouter',
    selectedModel: 'openai/gpt-4o-mini',
    transcriptionProvider: 'auto',
    language: 'en',
    overlayOpacity: 1,
    showTranscript: true,
    autoGenerateAnswers: true,
    stealthMode: false,
  },

  interview: {
    isActive: false,
    startTime: null,
    currentQuestion: '',
    detectedQuestions: [],
  },

  transcription: {
    isListening: false,
    currentText: '',
    transcriptHistory: [],
    confidence: 0,
  },

  responses: {
    isGenerating: false,
    current: null,
    history: [],
    error: null,
  },

  knowledgeBase: {
    resume: '',
    documents: [],
    customQA: [],
  },

  ui: {
    isPanelOpen: false,
    isSettingsOpen: false,
    isStealthMode: false,
  },

  setSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),

  loadSettings: async () => {
    if (!window.electronAPI) return;
    const keys = ['openaiApiKey', 'groqApiKey', 'openrouterApiKey', 'selectedProvider', 'selectedModel', 'transcriptionProvider', 'language', 'overlayOpacity', 'showTranscript', 'autoGenerateAnswers'];
    const loaded = {};
    for (const key of keys) {
      const value = await window.electronAPI.getSetting(key);
      if (value !== undefined && value !== null) loaded[key] = value;
    }
    set((state) => ({ settings: { ...state.settings, ...loaded } }));
  },

  saveSetting: async (key, value) => {
    if (window.electronAPI) await window.electronAPI.saveSetting(key, value);
    set((state) => ({ settings: { ...state.settings, [key]: value } }));
  },

  startInterview: () => set((state) => ({
    interview: { ...state.interview, isActive: true, startTime: new Date() },
    ui: { ...state.ui, isPanelOpen: true }
  })),

  stopInterview: () => set((state) => ({
    interview: { isActive: false, startTime: null, currentQuestion: '', detectedQuestions: [] },
    transcription: { ...state.transcription, isListening: false }
  })),

  setTranscription: (text) => set((state) => ({
    transcription: { ...state.transcription, currentText: text }
  })),

  addTranscriptEntry: (speaker, text) => set((state) => ({
    transcription: {
      ...state.transcription,
      transcriptHistory: [...state.transcription.transcriptHistory, { speaker, text, timestamp: new Date() }]
    }
  })),

  addDetectedQuestion: (question) => set((state) => ({
    interview: {
      ...state.interview,
      currentQuestion: question,
      detectedQuestions: [...state.interview.detectedQuestions, question]
    }
  })),

  setResponses: (responses) => set((state) => ({
    responses: { ...state.responses, current: responses, history: [...state.responses.history, responses] }
  })),

  setIsGenerating: (isGenerating) => set((state) => ({
    responses: { ...state.responses, isGenerating }
  })),

  setResponseError: (error) => set((state) => ({
    responses: { ...state.responses, error }
  })),

  setListening: (isListening) => set((state) => ({
    transcription: { ...state.transcription, isListening }
  })),

  toggleSettingsPanel: () => set((state) => ({
    ui: { ...state.ui, isSettingsOpen: !state.ui.isSettingsOpen }
  })),

  setStealthMode: (isStealth) => set((state) => ({
    ui: { ...state.ui, isStealthMode: isStealth },
    settings: { ...state.settings, stealthMode: isStealth }
  })),

  setResume: (resume) => set((state) => ({
    knowledgeBase: { ...state.knowledgeBase, resume }
  })),

  clearTranscript: () => set((state) => ({
    transcription: { currentText: '', transcriptHistory: [], isListening: false }
  })),
}));

export default useAppStore;