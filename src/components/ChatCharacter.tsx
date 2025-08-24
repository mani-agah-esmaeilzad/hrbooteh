'use client';

import React from 'react';
import { motion } from 'framer-motion';
import aiCharacter from '@/assets/ai-character.png';
import userCharacter from '@/assets/user-character.png';

interface ChatCharacterProps {
  type: 'ai' | 'user';
  isTyping?: boolean;
  isSpeaking?: boolean;
}

const ChatCharacter: React.FC<ChatCharacterProps> = ({
  type,
  isTyping = false,
  isSpeaking = false
}) => {
  const characterImage = type === 'ai' ? aiCharacter : userCharacter;

  const speakingAnimation = {
    y: [0, -10, 0],
    scale: [1, 1.05, 1],
    rotateZ: [0, 2, -2, 0],
  };

  const breathingAnimation = {
    scale: [1, 1.01, 1],
    y: [0, -1, 0],
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Avatar */}
      <motion.div
        className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-white to-executive-pearl shadow-xl border-2 border-white"
        animate={isSpeaking ? speakingAnimation : breathingAnimation}
        transition={
          isSpeaking
            ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          filter: 'drop-shadow(0 6px 15px rgba(0,0,0,0.15))',
        }}
      >
        {/* Character Image */}
        <motion.img
          src={characterImage.src}
          alt={`${type} character`}
          className="w-full h-full object-cover"
          animate={isSpeaking ? { scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Typing Bubbles */}
        {isTyping && (
          <motion.div
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-executive-navy rounded-full flex items-center justify-center shadow-md"
            animate={{
              scale: [1, 1.2, 1],
              rotateZ: [0, 8, -8, 0]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="flex space-x-0.5">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-white rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -1.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Glow Effect */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-executive-gold/20 to-executive-navy/20 rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Name Label */}
      <motion.div
        className={`mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow text-center ${
          type === 'ai'
            ? 'bg-gradient-to-r from-executive-navy to-executive-navy-light text-white'
            : 'bg-gradient-to-r from-executive-gold to-executive-gold-light text-executive-charcoal'
        }`}
        animate={isSpeaking ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 2px 10px rgba(0,0,0,0.15)',
            '0 4px 15px rgba(0,0,0,0.25)',
            '0 2px 10px rgba(0,0,0,0.15)'
          ]
        } : {}}
        transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
      >
        {type === 'ai' ? '🤖 مشاور' : '👤 شما'}
      </motion.div>

      {/* Sound Waves */}
      {isSpeaking && (
        <div className="absolute -z-10">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 sm:w-24 sm:h-24 border-2 border-executive-gold/30 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-2rem',
                marginTop: '-2rem',
              }}
              animate={{
                scale: [1, 2.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatCharacter;
