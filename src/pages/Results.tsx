'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Brain, BarChart3, Frown, Smile, Meh, Star, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, Bar, XAxis, YAxis, CartesianGrid, ComposedChart } from 'recharts';

const softSkillsQuestions = {
  "ارتباطات": [1, 2, 3, 4],
  "کار تیمی": [5, 6, 7, 8],
  "حل مسئله": [9, 10, 11, 12],
  "رهبری": [13, 14, 15, 16],
  "اخلاق کاری": [17, 18, 19, 20],
  "توانایی‌های شناختی": [21, 22],
};

// کامپوننت نمایش نتایج مهارت‌های نرم
const SoftSkillsResults = ({ data }) => {
  if (!data) return null;

  const chartData = Object.entries(softSkillsQuestions).map(([section, indices]) => {
    const scores = indices.map(index => data[`q${index}`] || 0);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { name: section, score: parseFloat(average.toFixed(2)) };
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Star className="w-6 h-6 mr-3 text-amber-500" />
        نتایج پرسشنامه خودارزیابی مهارت‌های نرم
      </h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid stroke='#f5f5f5' />
            <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip wrapperStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '10px' }}/>
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="score" name="میانگین امتیاز" barSize={30} fill="#22c55e" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// کامپوننت اصلی
const Results = () => {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [softSkillsData, setSoftSkillsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      // Fetch independence assessment results from localStorage
      const independenceResultsData = localStorage.getItem('independence_results');
      if (independenceResultsData) {
        try {
          const parsedData = JSON.parse(independenceResultsData);
          if (parsedData.questionAnalysis) {
              setAnalysisData(parsedData);
          } else if (parsedData.final_analysis?.analysis?.questionAnalysis) {
              setAnalysisData(parsedData.final_analysis.analysis);
          } else if (parsedData.final_analysis?.questionAnalysis) {
              setAnalysisData(parsedData.final_analysis);
          }
        } catch (error) {
          console.error("Error parsing independence results data:", error);
        }
      }

      // Fetch soft skills assessment results from API
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/self-assessment/results', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const result = await response.json();
            setSoftSkillsData(result.data);
          }
        } catch (error) {
          console.error("Error fetching soft skills results:", error);
        }
      }
      
      setLoading(false);
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p>در حال بارگذاری نتایج...</p>
        </div>
    );
  }

  if (!analysisData && !softSkillsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6">
        <Frown className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">نتیجه‌ای یافت نشد</h2>
        <p className="text-gray-600 mb-6">به نظر می‌رسد شما هنوز هیچ ارزیابی را تکمیل نکرده‌اید.</p>
        <Button onClick={() => router.push('/')}>بازگشت به صفحه اصلی</Button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 2) return 'text-green-600';
    if (score >= -2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score > 2) return <Smile className="w-5 h-5 text-green-500" />;
    if (score >= -2) return <Meh className="w-5 h-5 text-yellow-500" />;
    return <Frown className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">نتایج ارزیابی‌ها</h1>
            <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                بازگشت به خانه
            </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Soft Skills Results */}
        {softSkillsData && <SoftSkillsResults data={softSkillsData} />}

        {/* Independence Assessment Results */}
        {analysisData && (
          <>
            {analysisData.total_score && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
                        نمره نهایی آزمون استقلال
                    </h2>
                    <p className="text-4xl font-bold text-center text-indigo-600">{analysisData.total_score}</p>
                    <p className="text-center text-gray-500 mt-2">نمره شما بین ۶ (وابسته) تا ۱۲ (مستقل) می‌باشد.</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
                    نمودار تحلیل ابعاد شخصیتی (آزمون استقلال)
                </h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysisData.questionAnalysis}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 14 }} />
                            <PolarRadiusAxis angle={30} domain={[-5, 5]} tickCount={5} />
                            <Radar name="امتیاز شما" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '10px' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Brain className="w-6 h-6 mr-3 text-indigo-600" />
                    تحلیل دقیق هر بُعد (آزمون استقلال)
                </h2>
                <div className="space-y-4">
                    {analysisData.questionAnalysis.map((item: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800 text-lg">{item.subject}</p>
                                <span className={`font-bold text-2xl ${getScoreColor(item.score)}`}>
                                    {item.score > 0 ? `+${item.score}` : item.score}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-3 flex items-center">
                               {getScoreIcon(item.score)} <span className="mr-2">{item.reasoning}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}
         <div className="text-center pt-4">
            <Button size="lg" onClick={() => router.push('/independence')}>انجام مجدد ارزیابی استقلال</Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
