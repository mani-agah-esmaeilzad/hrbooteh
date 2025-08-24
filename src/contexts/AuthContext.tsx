'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  selectedSkillId: number | null;
  setSelectedSkillId: (skillId: number | null) => void;
  currentAssessmentId: number | null;
  setCurrentAssessmentId: (assessmentId: number | null) => void;
  currentQuestionnaire: number;
  setCurrentQuestionnaire: (questionnaire: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<number | null>(null);
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<number>(1);

  useEffect(() => {
    // Load user from localStorage on mount (only on client side)
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      }
    }
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      try {
        if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser: updateUser,
      selectedSkillId,
      setSelectedSkillId,
      currentAssessmentId,
      setCurrentAssessmentId,
      currentQuestionnaire,
      setCurrentQuestionnaire
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};