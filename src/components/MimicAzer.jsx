import React, { useState } from 'react';
import { generateText } from '../services/writingService';
import { auth } from '../firebase';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function MimicAzer() {
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMimic = async () => {
    setError('');
    setOutputValue('');
    if (!inputValue.trim()) return;
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        // Prompt: Rewrite this text as if you wrote it yourself, using your style
        const prompt = `Rewrite the following text as if you wrote it yourself, using your unique style. Keep the meaning, but make it sound like you.\n\nText:\n${inputValue}`;
        const result = await generateText(prompt, auth.currentUser.uid);
        setOutputValue(result);
      } else {
        setError('You must be logged in to use this feature.');
      }
    } catch (e) {
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-white mb-2">Mimic Azer</h2>
      <p className="text-white/70 mb-4">Paste any text below and Mimic Azer will rewrite it as if you wrote it yourself, using your unique style.</p>
      <textarea
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Paste or write your text here..."
        className="w-full h-32 bg-white/5 border border-neon-purple/20 rounded-2xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-neon-purple/40 resize-none"
      />
      <button
        onClick={handleMimic}
        disabled={!inputValue.trim() || isLoading}
        className={`flex items-center gap-2 self-end px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${inputValue.trim() && !isLoading ? 'bg-neon-purple text-white hover:bg-neon-purple/90' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
      >
        Mimic!
        <ArrowRightIcon className="w-5 h-5" />
      </button>
      {isLoading && <div className="text-white/70">Mimicking your style...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {outputValue && (
        <div className="bg-white/10 border border-neon-purple/20 rounded-2xl p-4 text-white mt-4 whitespace-pre-line">
          {outputValue}
        </div>
      )}
    </div>
  );
} 