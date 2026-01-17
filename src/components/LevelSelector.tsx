'use client';

import { motion } from 'framer-motion';
import { CEFRLevel, LevelInfo, LEVELS } from '@/types';

interface LevelSelectorProps {
  selectedLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
}

export function LevelSelector({ selectedLevel, onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-center text-lg text-slate-400 mb-6 font-medium">
        Selecciona tu nivel de inglés
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {LEVELS.map((levelInfo, index) => (
          <LevelCard
            key={levelInfo.level}
            levelInfo={levelInfo}
            isSelected={selectedLevel === levelInfo.level}
            onClick={() => onSelectLevel(levelInfo.level)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface LevelCardProps {
  levelInfo: LevelInfo;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function LevelCard({ levelInfo, isSelected, onClick, index }: LevelCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl border-2 transition-all duration-300
        ${isSelected 
          ? `${levelInfo.bgColor} border-current ${levelInfo.color} shadow-lg shadow-current/20` 
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
        }
      `}
    >
      <div className={`text-2xl font-bold mb-1 ${isSelected ? levelInfo.color : 'text-white'}`}>
        {levelInfo.level}
      </div>
      <div className={`text-xs font-medium ${isSelected ? levelInfo.color : 'text-slate-400'}`}>
        {levelInfo.name}
      </div>
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-current"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
