import React, { useEffect, useRef, useState, useCallback } from 'react';
import useAppStore from './store/useAppStore';
import transcriptionService from './services/transcription';
import aiService from './services/aiService';
import ResponseCards from './components/ResponseCards';
import SettingsPanel from './components/SettingsPanel';
import WidgetBar from './components/WidgetBar';
import ManualInput from './components/ManualInput';
import StatusBar from './components/StatusBar';

const WIDGET_H = 56;
const EXPANDED_H = 620;
const WIDGET_W = 560;

function App() {
  const { settings, interview, transcription, startInterview, stopInterview, setTranscription, addDetectedQuestion, addTranscriptEntry, setResponses, setIsGenerating, setResponseError, toggleSettingsPanel, loadSettings, setListening, clearTranscript } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const accumulatedTranscript = useRef('');
  const isPanelOpen = interview.isActive || transcription.isListening;

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.resizeWindow(WIDGET_W, isPanelOpen ? EXPANDED_H : WIDGET_H);
  }, [isPanelOpen]);

  const setInteractable = (interactable) => {
    if (window.electronAPI) window.electronAPI.setIgnoreMouseEvents(!interactable, { forward: true });
  };

  useEffect(() => { 
    loadSettings(); 
    if (window.electronAPI) {
      window.electronAPI.onStealthModeChanged((isStealth) => {
        useAppStore.getState().setStealthMode(isStealth);
      });
    }
  }, []);

  useEffect(() => {
    try {
      transcriptionService.initialize({
        openaiApiKey: settings.groqApiKey,
        groqApiKey: settings.groqApiKey,
        transcriptionProvider: settings.transcriptionProvider || 'auto',
      });
    } catch (err) { console.error('Transcription init error:', err); }

    const hasAnyProvider = settings.openaiApiKey || settings.groqApiKey || settings.openrouterApiKey;
    if (hasAnyProvider) {
      try {
        aiService.initialize({
          openai: { apiKey: settings.openaiApiKey },
          groq: { apiKey: settings.groqApiKey },
          openrouter: { apiKey: settings.openrouterApiKey },
        });
      } catch (err) { console.error('AI init error:', err); }
    }
    setIsInitialized(true);
  }, [settings.openaiApiKey, settings.groqApiKey, settings.openrouterApiKey, settings.transcriptionProvider]);

  const handleTranscriptionUpdate = (data) => {
    if (!data?.text) return;
    const newText = data.text.trim();
    if (!newText) return;
    accumulatedTranscript.current += ' ' + newText;
    setTranscription(accumulatedTranscript.current.trim());
    addTranscriptEntry('them', newText);
    if (transcriptionService.isQuestion(newText)) {
      addDetectedQuestion(newText);
      if (settings.autoGenerateAnswers) generateAIResponse();
    }
  };

  const generateAIResponse = async () => {
    setIsGenerating(true);
    setResponseError(null);
    try {
      const history = useAppStore.getState().transcription.transcriptHistory;
      const responses = await aiService.generateResponse(history, { provider: settings.selectedProvider, model: settings.selectedModel }, useAppStore.getState().knowledgeBase);
      setResponses(responses);
    } catch (err) {
      setResponseError(err.message || 'Failed');
    }
  };

  const handleStartInterview = async () => {
    accumulatedTranscript.current = '';
    clearTranscript();
    startInterview();
    try {
      await transcriptionService.startCapture(handleTranscriptionUpdate);
      setListening(true);
    } catch (err) {
      alert('Audio capture failed: ' + err.message);
      stopInterview();
    }
  };

  const handleStopInterview = () => {
    transcriptionService.stopCapture();
    setListening(false);
    stopInterview();
  };

  const handleDragStart = useCallback((e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    if (window.electronAPI) {
      window.electronAPI.windowGetPosition().then(([x, y]) => {
        dragStartPos.current = { x, y };
        setDragOffset({ x: e.screenX, y: e.screenY });
      });
    }
  }, []);

  const handleDrag = useCallback((e) => {
    if (!isDragging || !window.electronAPI) return;
    const dx = e.screenX - dragOffset.x;
    const dy = e.screenY - dragOffset.y;
    const [startX, startY] = [dragStartPos.current.x, dragStartPos.current.y];
    window.electronAPI.windowMove(startX + dx, startY + dy);
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div 
      style={{ pointerEvents: 'none' }} 
      className="fixed inset-0 flex flex-col items-center overflow-hidden bg-transparent"
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <div 
        style={{ pointerEvents: 'auto' }} 
        className={`w-full pt-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleDragStart}
        onMouseEnter={() => setInteractable(true)} 
        onMouseLeave={() => setInteractable(false)}
      >
        <WidgetBar onStart={handleStartInterview} onStop={handleStopInterview} isListening={transcription.isListening} isActive={interview.isActive} />
      </div>

      {isPanelOpen && (
        <div style={{ pointerEvents: 'auto' }} className="w-full max-w-[540px] flex flex-col px-2 pb-2 mt-1 animate-fade-in" onMouseEnter={() => setInteractable(true)} onMouseLeave={() => setInteractable(false)}>
          <StatusBar transcript={transcription.currentText} isListening={transcription.isListening} confidence={transcription.confidence} />
          <ManualInput onSubmit={(text) => { addTranscriptEntry('me', text); generateAIResponse(); }} isGenerating={useAppStore.getState().responses.isGenerating} />
          <div className="flex-1 mt-2 min-h-0"><ResponseCards /></div>
        </div>
      )}

      {useAppStore.getState().ui.isSettingsOpen && (
        <div style={{ pointerEvents: 'auto' }} className="fixed inset-0" onMouseEnter={() => setInteractable(true)} onMouseLeave={() => setInteractable(false)}>
          <SettingsPanel onClose={toggleSettingsPanel} />
        </div>
      )}
    </div>
  );
}

export default App;