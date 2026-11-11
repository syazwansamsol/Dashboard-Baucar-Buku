import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, RotateCcw } from 'lucide-react';
import { answerQuickDataQuery } from '../utils/analytics';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface FloatingChatbotProps {
  externalPrompt: string | null;
  onClearExternalPrompt: () => void;
}

const QUICK_QUESTIONS = [
  'Sekolah manakah paling kritikal belum guna?',
  'Bandingkan prestasi mengikut PKG',
  'Analisis kategori SBP & Sains vs SMK Harian',
  'Cadangkan intervensi strategik pengurusan',
  'Senarai sekolah yang capai 100% selesai',
];

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Selamat datang ke Pembantu Pantas Data Baucar Buku PPD Seremban 2027. Tanya saya mengenai statistik mana-mana daripada 49 sekolah, pecahan PKG, atau cadangan intervensi pengurusan.',
      timestamp: 'Sedia',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Instant deterministic answer from the official PPD Seremban dataset
    const instantReply = answerQuickDataQuery(trimmed);
    const botMsgId = `bot-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: 'bot',
        text: instantReply,
        timestamp,
      },
    ]);

    // If question is open-ended and not a direct preset, also check server endpoint
    const isPreset = QUICK_QUESTIONS.includes(trimmed);
    if (!isPreset) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply && data.source === 'gemini') {
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, text: data.reply } : m))
            );
          }
        }
      } catch (_err) {
        // Keep instant deterministic reply
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      sendQuery(externalPrompt);
      onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: 'Sejarah perbualan telah ditetapkan semula. Sila pilih soalan pantas atau taip nama sekolah (contoh: SDAR, SMK Seremban Jaya, TKC).',
        timestamp: 'Baharu',
      },
    ]);
  };

  // Render simple bold formatting for **text**
  const renderFormattedText = (raw: string) => {
    return raw.split('\n').map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Chat Drawer Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Pembantu Pantas Data Baucar Buku PPD Seremban"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[540px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        >
          {/* Drawer Header */}
          <div className="px-4 py-3.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold">Pembantu Data Baucar PPD Seremban</h3>
              <p className="text-[11px] text-slate-300">
                Jawapan pantas 49 sekolah &amp; intervensi 2027
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                aria-label="Tetapkan semula perbualan"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup Tetingkap Pembantu Data"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-72 bg-slate-50/60 dark:bg-slate-900">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400">
                  Menyemak pangkalan data PPD Seremban...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Prompts */}
          <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-800/70 border-t border-slate-200/70 dark:border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendQuery(q)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Taip soalan mengenai data Baucar Buku PPD Seremban
            </label>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sekolah, PKG, atau intervensi..."
              className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Hantar soalan"
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Tutup Pembantu Data' : 'Buka Pembantu Pantas Data'}
        className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-full shadow-lg transition-transform duration-150 active:scale-95"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="whitespace-nowrap">
          {isOpen ? 'Tutup Pembantu' : 'Tanya Data Pantas'}
        </span>
      </button>
    </div>
  );
};
