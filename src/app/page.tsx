'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { LevelSelector } from '@/components/LevelSelector';
import { AudioRecorder } from '@/components/AudioRecorder';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import { ModeSelector } from '@/components/ModeSelector';
import { ConversationChat } from '@/components/ConversationChat';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { AppMode, CEFRLevel, FeedbackResponse, LEVELS } from '@/types';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('conversation');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    isRecording,
    audioBlob,
    audioUrl,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleSubmit = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('level', selectedLevel);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al analizar el audio');
      }

      const data: FeedbackResponse = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewRecording = () => {
    setFeedback(null);
    resetRecording();
    setError(null);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setFeedback(null);
    resetRecording();
    setError(null);
  };

  const currentLevel = LEVELS.find((l) => l.level === selectedLevel);

  return (
    <main className="min-h-screen py-8 px-4 md:px-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Smart Teacher
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Tu profesor de inglés personal con IA. Habla, practica y mejora tu inglés con feedback instantáneo.
        </p>
      </motion.header>

      {/* Mode Selector */}
      <ModeSelector mode={mode} onModeChange={handleModeChange} />

      <div className="max-w-6xl mx-auto">
        {/* Level Selector - Always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <LevelSelector
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'conversation' ? (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ConversationChat level={selectedLevel} />
            </motion.div>
          ) : (
            <>
              {!feedback ? (
                <motion.div
                  key="practice-recorder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Current Level Info */}
                  <motion.div
                    key={selectedLevel}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentLevel?.bgColor} border`}>
                      <Sparkles className={`w-4 h-4 ${currentLevel?.color}`} />
                      <span className={`font-medium ${currentLevel?.color}`}>
                        Nivel {selectedLevel}: {currentLevel?.description}
                      </span>
                    </div>
                  </motion.div>

                  {/* Recording Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 md:p-12 rounded-3xl glass max-w-3xl mx-auto"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        ¡Habla en inglés!
                      </h2>
                      <p className="text-slate-400">
                        Graba tu voz y recibe correcciones personalizadas para tu nivel
                      </p>
                    </div>

                    <AudioRecorder
                      isRecording={isRecording}
                      audioUrl={audioUrl}
                      isAnalyzing={isAnalyzing}
                      onStartRecording={startRecording}
                      onStopRecording={stopRecording}
                      onResetRecording={resetRecording}
                      onSubmit={handleSubmit}
                    />

                    {/* Error Messages */}
                    <AnimatePresence>
                      {(error || recorderError) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center"
                        >
                          {error || recorderError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tips */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
                    >
                      <h3 className="font-medium text-white mb-2">💡 Consejos para practicar:</h3>
                      <ul className="text-slate-400 text-sm space-y-1">
                        <li>• Habla de forma clara y a un ritmo natural</li>
                        <li>• Describe tu día, tus hobbies o cuenta una historia</li>
                        <li>• No te preocupes por cometer errores, ¡es parte del aprendizaje!</li>
                        <li>• Intenta grabar al menos 10-15 segundos para un mejor análisis</li>
                      </ul>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="practice-feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <FeedbackDisplay
                    feedback={feedback}
                    onNewRecording={handleNewRecording}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16 pb-8"
      >
        <p className="text-slate-500 text-sm">
          Potenciado por OpenAI • Niveles CEFR (A1-C2) • Sin registro necesario
        </p>
      </motion.footer>
    </main>
  );
}
