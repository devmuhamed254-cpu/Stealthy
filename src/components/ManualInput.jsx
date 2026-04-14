import React, { useState } from 'react';
import { Send, Loader2 } from './Icons';

function ManualInput({ onSubmit, isGenerating }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full glass rounded-lg p-2 flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question or type manually..."
        disabled={isGenerating}
        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
      />
      <button
        type="submit"
        disabled={!input.trim() || isGenerating}
        className={`p-2 rounded-lg transition-all ${
          input.trim() && !isGenerating
            ? 'bg-primary text-white hover:bg-primaryHover'
            : 'bg-white/10 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </form>
  );
}

export default ManualInput;