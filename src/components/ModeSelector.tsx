'use client';

import { motion } from 'framer-motion';
import { BookOpen, MessageCircle } from 'lucide-react';
import { AppMode } from '@/types';

interface ModeSelectorProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex p-1 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        <ModeButton
          isActive={mode === 'practice'}
          onClick={() => onModeChange('practice')}
          icon={<BookOpen className="w-4 h-4" />}
          label="Práctica"
          description="Análisis detallado"
        />
        <ModeButton
          isActive={mode === 'conversation'}
          onClick={() => onModeChange('conversation')}
          icon={<MessageCircle className="w-4 h-4" />}
          label="Conversación"
          description="Habla con IA"
        />
      </div>
    </div>
  );
}

interface ModeButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function ModeButton({ isActive, onClick, icon, label, description }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-xl transition-all duration-300 ${
        isActive ? 'text-white' : 'text-slate-400 hover:text-slate-300'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeMode"
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <div className="relative flex items-center gap-2">
        {icon}
        <div className="text-left">
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs opacity-70">{description}</div>
        </div>
      </div>
    </button>
  );
}
