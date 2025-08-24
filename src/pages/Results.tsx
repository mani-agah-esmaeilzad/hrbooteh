'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Download, Star, TrendingUp, Award, Brain, LucideIcon, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeSampleResponses, EDIAnalysisResult } from '@/lib/edi-analysis';

const iconMap: { [key: string]: LucideIcon } = {
  Award,
  TrendingUp,
  Star,
};

interface Analysis {
  totalScore: number;
  maxScore: number;
  questionAnalysis: Array<{
    question: string;
    score: number;
    reasoning: string;
  }>;
  assessment: {
    level: string;
    description: string;
    color?: string;
    bgColor?: string;
    icon?: string;
  };
}

interface LocationState {
  analysis: Analysis;
  fromQuestionnaire: number;
}

const Results = () => {
  const router = useRouter();
  const { setCurrentQuestionnaire } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // تحلیل EDI-I بر اساس پاسخ‌های نمونه کاربر
  const ediAnalysis: EDIAnalysisResult = analyzeSampleResponses();
  
  const analysis: Analysis = {
    totalScore: ediAnalysis.totalScore,
    maxScore: ediAnalysis.maxScore,
    questionAnalysis: [
      {
        question: "بخش اول: نوآوری و سبک شخصی",
        score: ediAnalysis.detailedAnalysis.part1.innovation + ediAnalysis.detailedAnalysis.part1.personalStyle,
        reasoning: ediAnalysis.detailedAnalysis.part1.reasoning
      },
      {
        question: "بخش دوم: رهبری و حل مسئله مستقل",
        score: ediAnalysis.detailedAnalysis.part2.leadership + ediAnalysis.detailedAnalysis.part2.problemSolving,
        reasoning: ediAnalysis.detailedAnalysis.part2.reasoning
      },
      {
        question: "بخش سوم: پیروی از دستور و واکنش به برچسب",
        score: ediAnalysis.detailedAnalysis.part3.compliance + ediAnalysis.detailedAnalysis.part3.labelReaction,
        reasoning: ediAnalysis.detailedAnalysis.part3.reasoning
      }
    ],
    assessment: {
      level: ediAnalysis.level,
      description: ediAnalysis.description,
      color: ediAnalysis.totalScore >= 10 ? "text-green-600" : ediAnalysis.totalScore >= 8 ? "text-blue-600" : ediAnalysis.totalScore >= 6 ? "text-yellow-600" : "text-red-600",
      bgColor: ediAnalysis.totalScore >= 10 ? "bg-green-100" : ediAnalysis.totalScore >= 8 ? "bg-blue-100" : ediAnalysis.totalScore >= 6 ? "bg-yellow-100" : "bg-red-100",
      icon: ediAnalysis.totalScore >= 10 ? "Award" : ediAnalysis.totalScore >= 8 ? "TrendingUp" : "Star"
    }
  };
  const fromQuestionnaire = 1;
  
  const TOTAL_QUESTIONNAIRES = 3; // تعداد کل پرسشنامه‌ها
  const nextQuestionnaire = fromQuestionnaire + 1;

  useEffect(() => {
    if (!analysis) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setTimeout(() => setShowResults(true), 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [analysis, router]);
  
  const handleNextQuestionnaire = () => {
    if (nextQuestionnaire <= TOTAL_QUESTIONNAIRES) {
      setCurrentQuestionnaire(nextQuestionnaire);
      router.push('/assessment');
    }
  };


  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center px-6 space-y-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center animate-pulse">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-300 to-blue-300 rounded-3xl blur opacity-50 animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                در حال تحلیل پاسخ‌ها...
              </h2>
              <p className="text-gray-600">
                هوش مصنوعی در حال بررسی دقیق پاسخ‌های شماست
              </p>
            </div>
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const { totalScore, maxScore, questionAnalysis, assessment } = analysis;
  const assessmentWithDefaults = {
    ...assessment,
    color: assessment.color || 'from-purple-600 to-blue-600',
    bgColor: assessment.bgColor || 'from-purple-50 to-blue-50',
    icon: assessment.icon || 'Star'
  };
  const AssessmentIcon = iconMap[assessmentWithDefaults.icon] || Star;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className={`h-6 bg-gradient-to-r ${assessmentWithDefaults.color}`}></div>
      <div className="px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center btn-press"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">نتایج ارزیابی</h1>
              <p className="text-xs text-gray-500">گزارش کامل</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center btn-press">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center btn-press">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className={`text-center space-y-4 ${showResults ? 'animate-scale-in' : 'opacity-0'}`}>
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">تبریک! ارزیابی تکمیل شد</h2>
            <p className="text-gray-600 text-sm">نتایج کامل شما آماده است</p>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${assessmentWithDefaults.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${assessmentWithDefaults.color} rounded-2xl flex items-center justify-center`}>
              <AssessmentIcon className="w-8 h-8 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {assessmentWithDefaults.level}
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {assessmentWithDefaults.description}
              </p>
            </div>

            <div className="bg-white/50 rounded-xl p-4">
              <div className="text-3xl font-bold text-gray-900">{totalScore}</div>
              <div className="text-sm text-gray-600">از {maxScore || 100} امتیاز کل</div>
            </div>
          </div>
        </div>

        {/* EDI-I تحلیل تفصیلی */}
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            تحلیل EDI-I (پرسشنامه استقلال اقتصادی)
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-sm text-blue-600 font-medium mb-1">آیتم ۱: نوآوری</div>
              <div className="text-2xl font-bold text-blue-700">{ediAnalysis.item1_innovation}</div>
              <div className="text-xs text-blue-500">معکوس</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-sm text-green-600 font-medium mb-1">آیتم ۲: سبک شخصی</div>
              <div className="text-2xl font-bold text-green-700">{ediAnalysis.item2_personal_style}</div>
              <div className="text-xs text-green-500">مستقیم</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-sm text-red-600 font-medium mb-1">آیتم ۳: رهبری</div>
              <div className="text-2xl font-bold text-red-700">{ediAnalysis.item3_leadership}</div>
              <div className="text-xs text-red-500">معکوس</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-sm text-yellow-600 font-medium mb-1">آیتم ۴: حل مسئله</div>
              <div className="text-2xl font-bold text-yellow-700">{ediAnalysis.item4_independent_problem_solving}</div>
              <div className="text-xs text-yellow-500">مستقیم</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-sm text-purple-600 font-medium mb-1">آیتم ۵: پیروی</div>
              <div className="text-2xl font-bold text-purple-700">{ediAnalysis.item5_instruction_compliance}</div>
              <div className="text-xs text-purple-500">معکوس</div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="text-sm text-indigo-600 font-medium mb-1">آیتم ۶: برچسب</div>
              <div className="text-2xl font-bold text-indigo-700">{ediAnalysis.item6_reaction_to_self_reliance_label}</div>
              <div className="text-xs text-indigo-500">مستقیم</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">فرمول محاسبه</div>
              <div className="text-lg font-mono text-gray-800">
                {ediAnalysis.item1_innovation} + {ediAnalysis.item2_personal_style} + {ediAnalysis.item3_leadership} + {ediAnalysis.item4_independent_problem_solving} + {ediAnalysis.item5_instruction_compliance} + {ediAnalysis.item6_reaction_to_self_reliance_label} = {ediAnalysis.totalScore}
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            تحلیل تفصیلی بخش‌ها
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questionAnalysis.map((item, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 pr-4">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {item.question}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.reasoning}
                  </div>
                </div>
                <div className={`text-lg font-bold ${item.score > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`space-y-3 ${showResults ? 'animate-slide-up' : 'opacity-0'}`}>
          {nextQuestionnaire <= TOTAL_QUESTIONNAIRES && (
            <Button
              onClick={handleNextQuestionnaire}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium rounded-xl btn-press"
            >
              شروع پرسشنامه بعدی ({nextQuestionnaire})
            </Button>
          )}

          <Button
            onClick={() => {
                setCurrentQuestionnaire(1);
                router.push('/assessment');
            }}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl btn-press"
          >
            شروع مجدد از ابتدا
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium btn-press"
          >
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
      <div className="h-8"></div>
    </div>
  );
};
export default Results;
