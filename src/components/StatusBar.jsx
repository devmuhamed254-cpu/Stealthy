import React from 'react';
import { Mic } from './Icons';

function StatusBar({ transcript, isListening, confidence }) {
  const displayText = transcript.length > 200 
    ? '...' + transcript.slice(-200) 
    : transcript || (isListening ? 'Listening for speech...' : 'Click mic to start');

  return (
    <div className="w-full glass rounded-lg p-3 mb-2">
      <div className="flex items-center gap-2 mb-2">
        <Mic size={14} className={`${isListening ? 'text-green-400' : 'text-gray-500'}`} />
        <span className="text-xs text-gray-400">
          {isListening ? 'Live' : 'Ready'}
        </span>
        {confidence > 0 && (
          <span className="text-xs text-gray-600">
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">
        {displayText}
      </p>
    </div>
  );
}

export default StatusBar;