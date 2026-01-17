'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Loader2, 
  Volume2, 
  VolumeX,
  User,
  Bot,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { CEFRLevel, ConversationMessage, ConversationResponse, LEVELS } from '@/types';

interface ConversationChatProps {
  level: CEFRLevel;
}

export function ConversationChat({ level }: ConversationChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isRecording,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const currentLevel = LEVELS.find((l) => l.level === level);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-submit when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleSubmit();
    }
  }, [audioBlob, isRecording]);

  const handleSubmit = async () => {
    if (!audioBlob || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('level', level);
      
      // Only send text content, not audio URLs (they're too large)
      const historyForAPI = messages.slice(-10).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
      formData.append('history', JSON.stringify(historyForAPI));

      const response = await fetch('/api/conversation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar');
      }

      const data: ConversationResponse = await response.json();

      // Add user message
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: data.transcription,
        timestamp: new Date(),
      };

      // Create audio URL for assistant response
      const audioUrl = `data:audio/mp3;base64,${data.audioBase64}`;
      
      // Add assistant message
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        audioUrl: audioUrl,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Auto-play response
      playAudio(audioUrl, assistantMessage.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsProcessing(false);
      resetRecording();
    }
  };

  const playAudio = (audioUrl: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentPlayingId(messageId);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
    stopAudio();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentLevel?.bgColor} border mb-4`}>
          <Sparkles className={`w-4 h-4 ${currentLevel?.color}`} />
          <span className={`font-medium ${currentLevel?.color}`}>
            Conversación nivel {level}
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          Habla en inglés y la IA te responderá corrigiendo tus errores de forma natural
        </p>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl glass overflow-hidden">
        {/* Messages Area */}
        <div className="h-[450px] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <MessageCircleIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-medium mb-2">¡Comienza la conversación!</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-4">
                Presiona el micrófono y di algo en inglés. La IA te responderá y corregirá tus errores de forma natural.
              </p>
              <div className="text-left bg-slate-800/50 rounded-xl p-4 max-w-sm">
                <p className="text-slate-300 text-sm font-medium mb-2">💡 Ideas para empezar:</p>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• "Hello! How are you today?"</li>
                  <li>• "My name is... and I want to practice English"</li>
                  <li>• "What do you like to do for fun?"</li>
                  <li>• "Can you help me improve my English?"</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onPlayAudio={(url) => playAudio(url, message.id)}
                  isPlaying={isPlaying && currentPlayingId === message.id}
                  onStopAudio={stopAudio}
                  index={index}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
          
          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-slate-400"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm">El profesor está escuchando...</span>
                <span className="text-xs text-slate-500">Preparando respuesta con correcciones</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {(error || recorderError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/20"
            >
              <p className="text-rose-300 text-sm">{error || recorderError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
          <div className="flex items-center justify-center gap-4">
            {/* Clear Button */}
            {messages.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearConversation}
                className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-slate-300 transition-colors"
                title="Nueva conversación"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            )}

            {/* Record Button */}
            <div className="relative">
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/30"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.2,
                    }}
                  />
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
                  relative z-10 w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-300 shadow-xl
                  ${isRecording
                    ? 'bg-red-500 shadow-red-500/40'
                    : isProcessing
                      ? 'bg-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50'
                  }
                `}
              >
                {isRecording ? (
                  <Square className="w-7 h-7 text-white fill-current" />
                ) : isProcessing ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </motion.button>
            </div>

            {/* Status Text */}
            <div className="w-36 text-left">
              <p className="text-slate-300 text-sm font-medium">
                {isRecording
                  ? '🔴 Escuchando...'
                  : isProcessing
                    ? '⏳ Procesando...'
                    : '🎤 Toca para hablar'}
              </p>
              <p className="text-slate-500 text-xs">
                {isRecording
                  ? 'Habla en inglés'
                  : isProcessing
                    ? 'Analizando tu inglés'
                    : 'Mantén presionado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }}
        onPause={() => {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }}
        className="hidden"
      />
    </div>
  );
}

interface MessageBubbleProps {
  message: ConversationMessage;
  onPlayAudio: (url: string) => void;
  isPlaying: boolean;
  onStopAudio: () => void;
  index: number;
}

function MessageBubble({ message, onPlayAudio, isPlaying, onStopAudio, index }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser 
          ? 'bg-violet-500/20 text-violet-400' 
          : 'bg-emerald-500/20 text-emerald-400'
        }
      `}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className={`
        max-w-[80%] p-4 rounded-2xl
        ${isUser 
          ? 'bg-violet-500/10 border border-violet-500/20 rounded-tr-sm' 
          : 'bg-slate-700/50 border border-slate-600/30 rounded-tl-sm'
        }
      `}>
        {/* Label */}
        <div className={`text-xs font-medium mb-1 ${isUser ? 'text-violet-400' : 'text-emerald-400'}`}>
          {isUser ? 'Tú dijiste:' : '👨‍🏫 Profesor:'}
        </div>
        
        <p className={`text-sm leading-relaxed ${isUser ? 'text-violet-100' : 'text-slate-200'}`}>
          {message.content}
        </p>
        
        {/* Play button for assistant messages */}
        {!isUser && message.audioUrl && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => isPlaying ? onStopAudio() : onPlayAudio(message.audioUrl!)}
            className={`
              mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
              ${isPlaying 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600 hover:text-white'
              }
            `}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="text-xs font-medium">Detener</span>
                <motion.div
                  className="flex gap-0.5"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="w-1 h-3 bg-emerald-400 rounded-full" />
                  <div className="w-1 h-2 bg-emerald-400 rounded-full" />
                  <div className="w-1 h-4 bg-emerald-400 rounded-full" />
                </motion.div>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-medium">Escuchar</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
