import React from 'react';
import { Lightbulb, MessageCircle, Loader2 } from './Icons';
import useAppStore from '../store/useAppStore';

function ResponseCards() {
  const { responses, interview, settings } = useAppStore();
  
  if (responses.isGenerating) {
    return (
      <div className="w-full glass rounded-lg p-4 flex items-center justify-center gap-3">
        <Loader2 size={20} className="text-primary animate-spin" />
        <span className="text-sm text-gray-400">Generating response...</span>
      </div>
    );
  }

  if (responses.error) {
    return (
      <div className="w-full glass rounded-lg p-4 flex items-center gap-3 bg-red-500/10">
        <AlertCircle size={20} className="text-red-400" />
        <span className="text-sm text-red-300">{responses.error}</span>
      </div>
    );
  }

  if (!responses.current) {
    return (
      <div className="w-full glass rounded-lg p-4 text-center">
        <Lightbulb size={24} className="mx-auto text-gray-600 mb-2" />
        <p className="text-sm text-gray-500">
          {settings.autoGenerateAnswers 
            ? 'AI will automatically generate answers when questions are detected'
            : 'Type a question or click mic to get AI assistance'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Question that was asked */}
      {responses.current?.question && (
        <div className="glass rounded-lg p-3 bg-blue-500/10">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={16} className="text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Question asked</span>
          </div>
          <p className="text-sm text-gray-300 italic">
            "{responses.current.question}"
          </p>
        </div>
      )}

      {/* Answer Card */}
      <div className="glass rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-primary" />
          <span className="text-xs font-medium text-primary">Suggested answer</span>
        </div>
        <p className="text-sm text-gray-200 whitespace-pre-wrap">
          {responses.current?.answer || 'No response generated'}
        </p>
      </div>

      {/* Model/Provider info */}
      <div className="flex items-center gap-2 text-xs text-gray-600 px-1">
        <span>{responses.current?.provider}</span>
        <span>•</span>
        <span>{responses.current?.model}</span>
      </div>
    </div>
  );
}

export default ResponseCards;