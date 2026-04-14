import React from 'react';
import { Mic, MicOff, Settings, Shield } from './Icons';
import useAppStore from '../store/useAppStore';

function WidgetBar({ onStart, onStop, isListening, isActive }) {
  const { toggleSettingsPanel, settings, ui, setStealthMode } = useAppStore();
  
  const handleToggle = () => {
    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  };

  const handleStealthToggle = async () => {
    const newStealthMode = !ui.isStealthMode;
    setStealthMode(newStealthMode);
    if (window.electronAPI) {
      await window.electronAPI.setStealthMode(newStealthMode);
    }
  };

  return (
    <div className="w-full glass rounded-2xl px-3 py-2 flex items-center justify-between gap-2">
      {/* Left: Status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-green-500 animate-pulse-subtle' : 'bg-gray-500'}`} />
        <span className="text-xs text-gray-300 font-medium">
          {isListening ? 'Listening...' : 'Stealthy'}
        </span>
      </div>

      {/* Center: Main controls */}
      <div className="flex items-center gap-1">
        {/* Mic toggle */}
        <button
          onClick={handleToggle}
          className={`p-2 rounded-lg transition-all ${
            isActive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
          title={isActive ? 'Stop listening' : 'Start listening'}
        >
          {isActive ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Stealth mode */}
        <button
          onClick={handleStealthToggle}
          className={`p-2 rounded-lg transition-all ${
            ui.isStealthMode
              ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
          title="Stealth mode - hide from screen share"
        >
          <Shield size={18} />
        </button>
      </div>

      {/* Right: Settings */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSettingsClick}
          className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}

export default WidgetBar;