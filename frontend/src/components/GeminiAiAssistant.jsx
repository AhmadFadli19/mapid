import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, User, RefreshCw, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import { askGeminiAi } from '../services/api';

export default function GeminiAiAssistant({ selectedStation = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: ' Halo! Saya **MAPID Transit Intelligence AI** (Powered by Gemini). Ada yang bisa saya bantu untuk kenyamanan perjalanan Anda?'
    }
  ]);

  const quickQuestions = [
    '🚪 Rekomendasi Pintu Exit terbaik?',
    '🚆 Gerbong paling senggang saat jam sibuk?',
    '🏢 Fasilitas & Toilet di stasiun ini?',
    '🔄 Panduan transit ke moda lain?'
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    // Append user message
    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await askGeminiAi(query, selectedStation?.id);
      const aiReply = res?.reply || 'Maaf, belum ada tanggapan dari sistem AI.';
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, source: res?.source }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Maaf, terjadi gangguan server AI. Silakan coba lagi.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-3 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/40 backdrop-blur-md group"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-black tracking-wide flex items-center gap-1">
              Gemini AI <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded-md font-mono">1.5</span>
            </span>
            <span className="text-[10px] text-indigo-200">Asisten Perjalanan Smart</span>
          </div>
        </button>
      )}

      {/* AI Assistant Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-slate-900/95 border border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white tracking-wide">MAPID AI Assistant</h3>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {selectedStation ? `Konteks: ${selectedStation.name}` : 'Asisten Transit Spasial'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 bg-slate-800/80 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Banner */}
          {selectedStation && (
            <div className="bg-indigo-950/60 border-b border-indigo-800/40 px-3 py-1.5 flex items-center justify-between text-[10px]">
              <span className="text-indigo-200 truncate flex items-center gap-1 font-semibold">
                <span>📍</span> {selectedStation.name} ({selectedStation.operator})
              </span>
              <span className="text-indigo-400 font-mono text-[9px] flex-shrink-0">PROFIL AKTIF</span>
            </div>
          )}

          {/* Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none border border-indigo-400/30'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                  {msg.source && (
                    <div className="mt-1.5 pt-1 border-t border-slate-700/50 text-[9px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified by {msg.source}</span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/40 p-2.5 rounded-2xl border border-indigo-800/40 w-fit">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Gemini AI sedang berpikir...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[10px] font-semibold bg-slate-800/80 text-indigo-300 border border-slate-700/60 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded-xl transition flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Tanyakan ke Gemini AI Transit..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
