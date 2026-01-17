'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, RotateCcw, Send, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  audioUrl: string | null;
  isAnalyzing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onResetRecording: () => void;
  onSubmit: () => void;
}

export function AudioRecorder({
  isRecording,
  audioUrl,
  isAnalyzing,
  onStartRecording,
  onStopRecording,
  onResetRecording,
  onSubmit,
}: AudioRecorderProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Record Button */}
      <div className="relative">
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isAnalyzing || !!audioUrl}
          className={`
            relative z-10 w-24 h-24 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-2xl
            ${isRecording
              ? 'bg-red-500 shadow-red-500/40'
              : audioUrl
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50'
            }
          `}
        >
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="stop"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
              >
                <Square className="w-8 h-8 text-white fill-current" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status Text */}
      <motion.p
        key={isRecording ? 'recording' : audioUrl ? 'recorded' : 'ready'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-slate-400 text-sm font-medium"
      >
        {isRecording
          ? '🔴 Grabando... Habla en inglés'
          : audioUrl
            ? '✅ Audio grabado'
            : 'Presiona para grabar'}
      </motion.p>

      {/* Audio Preview & Actions */}
      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="flex flex-col items-center gap-4 w-full max-w-md"
          >
            <audio
              src={audioUrl}
              controls
              className="w-full h-12 rounded-lg"
              style={{
                filter: 'invert(1) hue-rotate(180deg)',
              }}
            />
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onResetRecording}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Repetir
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSubmit}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Analizar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
