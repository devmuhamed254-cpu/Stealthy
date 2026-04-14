import React, { useState } from 'react';
import { X, Key, Globe, Bot, Save, Eye, EyeOff, Check, Shield } from './Icons';
import useAppStore from '../store/useAppStore';
import { PROVIDERS } from '../services/aiService';

function SettingsPanel({ onClose }) {
  const { settings, saveSetting, setSettings, knowledgeBase, setResume } = useAppStore();
  const [activeTab, setActiveTab] = useState('providers');
  const [showKeys, setShowKeys] = useState({});
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'providers', label: 'API Keys', icon: Key },
    { id: 'transcription', label: 'Transcription', icon: Globe },
    { id: 'ai', label: 'AI Model', icon: Bot },
    { id: 'knowledge', label: 'Knowledge', icon: Globe },
    { id: 'stealth', label: 'Stealth', icon: Shield },
  ];

  const handleSave = async (key, value) => {
    await saveSetting(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full h-full glass rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'providers' && (
          <div className="space-y-3 text-xs text-gray-500 mb-3">
            Add API keys. All stored locally.
            
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white">OpenRouter</label>
                <span className="text-xs text-green-400">Free tier</span>
              </div>
              <div className="relative">
                <input
                  type={showKeys.openrouterApiKey ? 'text' : 'password'}
                  value={settings.openrouterApiKey}
                  onChange={(e) => setSettings({ openrouterApiKey: e.target.value })}
                  placeholder="sk-or-..."
                  className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
                />
                <button type="button" onClick={() => toggleShowKey('openrouterApiKey')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  {showKeys.openrouterApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button onClick={() => handleSave('openrouterApiKey', settings.openrouterApiKey)} className="mt-1.5 text-xs text-blue-400">Save</button>
            </div>

            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white">Groq</label>
                <span className="text-xs text-green-400">Free tier</span>
              </div>
              <input
                type={showKeys.groqApiKey ? 'text' : 'password'}
                value={settings.groqApiKey}
                onChange={(e) => setSettings({ groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
              />
              <button onClick={() => handleSave('groqApiKey', settings.groqApiKey)} className="mt-1.5 text-xs text-blue-400">Save</button>
            </div>

            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white">OpenAI</label>
                <span className="text-xs text-yellow-400">Paid</span>
              </div>
              <input
                type={showKeys.openaiApiKey ? 'text' : 'password'}
                value={settings.openaiApiKey}
                onChange={(e) => setSettings({ openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
              />
              <button onClick={() => handleSave('openaiApiKey', settings.openaiApiKey)} className="mt-1.5 text-xs text-blue-400">Save</button>
            </div>
          </div>
        )}

        {activeTab === 'transcription' && (
          <div className="space-y-3">
            <div className="glass rounded-lg p-3">
              <label className="text-sm font-medium text-white block mb-2">Provider</label>
              <select
                value={settings.transcriptionProvider}
                onChange={(e) => handleSave('transcriptionProvider', e.target.value)}
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
              >
                <option value="auto">Auto (Groq → OpenAI → Browser)</option>
                <option value="groq">Groq Whisper</option>
                <option value="openai">OpenAI Whisper</option>
                <option value="browser">Browser Speech API</option>
              </select>
            </div>

            <div className="glass rounded-lg p-3">
              <label className="text-sm font-medium text-white block mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleSave('language', e.target.value)}
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-3">
            <div className="glass rounded-lg p-3">
              <label className="text-sm font-medium text-white block mb-2">AI Provider</label>
              <select
                value={settings.selectedProvider}
                onChange={(e) => {
                  handleSave('selectedProvider', e.target.value);
                  const firstModel = PROVIDERS[e.target.value]?.models?.[0];
                  if (firstModel) handleSave('selectedModel', firstModel);
                }}
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
              >
                {Object.entries(PROVIDERS).map(([key, provider]) => (
                  <option key={key} value={key}>{provider.name}</option>
                ))}
              </select>
            </div>

            <div className="glass rounded-lg p-3">
              <label className="text-sm font-medium text-white block mb-2">Model</label>
              <select
                value={settings.selectedModel}
                onChange={(e) => handleSave('selectedModel', e.target.value)}
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white"
              >
                {(PROVIDERS[settings.selectedProvider]?.models || []).map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="glass rounded-lg p-3 flex items-center justify-between">
              <label className="text-sm font-medium text-white">Auto-generate answers</label>
              <button
                onClick={() => handleSave('autoGenerateAnswers', !settings.autoGenerateAnswers)}
                className={`w-10 h-5 rounded-full transition-colors ${settings.autoGenerateAnswers ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoGenerateAnswers ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-3">
            <div className="glass rounded-lg p-3">
              <label className="text-sm font-medium text-white block mb-2">Resume / Background</label>
              <textarea
                value={knowledgeBase.resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume..."
                rows={8}
                className="w-full bg-black/30 border border-border rounded px-2 py-1.5 text-xs text-white resize-none"
              />
              <button onClick={() => handleSave('resumeData', knowledgeBase.resume)} className="mt-1.5 text-xs text-blue-400">Save</button>
            </div>
          </div>
        )}

        {activeTab === 'stealth' && (
          <div className="space-y-3">
            <div className="glass rounded-lg p-3 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white block">Stealth Mode</label>
                <p className="text-xs text-gray-500 mt-1">Hide from screen share</p>
              </div>
              <button
                onClick={() => handleSave('stealthMode', !settings.stealthMode)}
                className={`w-10 h-5 rounded-full transition-colors ${settings.stealthMode ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.stealthMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="glass rounded-lg p-3 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-white block">Show Transcript</label>
                <p className="text-xs text-gray-500 mt-1">{Math.round(settings.overlayOpacity * 100)}%</p>
              </div>
              <button
                onClick={() => handleSave('showTranscript', !settings.showTranscript)}
                className={`w-10 h-5 rounded-full transition-colors ${settings.showTranscript ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.showTranscript ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border flex items-center justify-between text-xs text-gray-500">
        <span>Ctrl+Shift+S to toggle</span>
        {saved && <span className="text-green-400 flex items-center gap-1"><Check size={12} /> Saved</span>}
      </div>
    </div>
  );
}

export default SettingsPanel;