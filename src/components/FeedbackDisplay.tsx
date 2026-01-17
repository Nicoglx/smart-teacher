'use client';

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  MessageCircle, 
  Lightbulb, 
  Target, 
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { FeedbackResponse } from '@/types';

interface FeedbackDisplayProps {
  feedback: FeedbackResponse;
  onNewRecording: () => void;
}

export function FeedbackDisplay({ feedback, onNewRecording }: FeedbackDisplayProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Transcription */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-sky-500/20">
            <MessageCircle className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Lo que dijiste</h3>
        </div>
        <p className="text-slate-300 text-lg italic leading-relaxed">
          "{feedback.transcription}"
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Puntuación General</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-emerald-400">{feedback.overallScore}</span>
            <span className="text-slate-400">/100</span>
          </div>
        </div>
        <ScoreBar score={feedback.overallScore} />
      </motion.div>

      {/* Detailed Scores Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pronunciation */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-violet-400" />
              <span className="font-medium text-white">Pronunciación</span>
            </div>
            <ScoreBadge score={feedback.pronunciation.score} />
          </div>
          <p className="text-slate-400 text-sm">{feedback.pronunciation.feedback}</p>
        </motion.div>

        {/* Fluency */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-white">Fluidez</span>
            </div>
            <ScoreBadge score={feedback.fluency.score} />
          </div>
          <p className="text-slate-400 text-sm">{feedback.fluency.feedback}</p>
        </motion.div>
      </div>

      {/* Grammar Corrections */}
      {feedback.grammar.corrections.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20">
                <BookOpen className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Correcciones Gramaticales</h3>
            </div>
            <ScoreBadge score={feedback.grammar.score} />
          </div>
          <div className="space-y-4">
            {feedback.grammar.corrections.map((correction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30"
              >
                <div className="flex items-start gap-3 mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-rose-400 line-through">{correction.original}</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <span className="text-emerald-400 font-medium">{correction.corrected}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm ml-7">{correction.explanation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Vocabulary */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Vocabulario</h3>
          </div>
          <ScoreBadge score={feedback.vocabulary.score} />
        </div>
        <p className="text-slate-300 mb-4">{feedback.vocabulary.feedback}</p>
        {feedback.vocabulary.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {feedback.vocabulary.suggestions.map((suggestion, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm"
              >
                {suggestion}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Encouragement */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-500/20">
            <CheckCircle2 className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">¡Mensaje de tu profesor!</h3>
            <p className="text-slate-300 leading-relaxed">{feedback.encouragement}</p>
          </div>
        </div>
      </motion.div>

      {/* Practice Topics */}
      {feedback.practiceTopics.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">📚 Temas sugeridos para practicar</h3>
          <div className="flex flex-wrap gap-2">
            {feedback.practiceTopics.map((topic, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* New Recording Button */}
      <motion.div variants={itemVariants} className="flex justify-center pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewRecording}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-lg shadow-xl shadow-emerald-500/25 transition-all"
        >
          🎤 Grabar de nuevo
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-4 h-3 bg-slate-700/50 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full rounded-full ${
          score >= 80
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
            : score >= 60
              ? 'bg-gradient-to-r from-amber-500 to-orange-400'
              : 'bg-gradient-to-r from-rose-500 to-red-400'
        }`}
      />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getColor()}`}>
      {score}
    </span>
  );
}
