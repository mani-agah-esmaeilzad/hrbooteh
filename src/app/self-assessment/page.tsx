'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const questions = [
  {
    section: "ارتباطات (Communication)",
    items: [
      "من می‌توانم ایده‌های پیچیده را به صورت واضح و قابل فهم برای دیگران بیان کنم.",
      "در گفتگوها، با دقت به صحبت‌های دیگران گوش می‌دهم تا دیدگاه آن‌ها را کاملاً درک کنم.",
      "من در درک احساسات و دیدگاه‌های دیگران، حتی زمانی که با من متفاوت هستند، مهارت دارم.",
      "می‌توانم دیگران را به طور مؤثر متقاعد کنم تا از ایده‌های من حمایت کنند.",
    ],
  },
  {
    section: "کار تیمی (Teamwork)",
    items: [
      "من از همکاری با اعضای تیم برای رسیدن به اهداف مشترک لذت می‌برم و در آن مؤثر هستم.",
      "هنگام بروز اختلاف نظر در تیم، می‌توانم به یافتن راه حلی سازنده که مورد قبول همه باشد، کمک کنم.",
      "من در هماهنگ کردن وظایف خود با دیگر اعضای تیم برای جلوگیری از تداخل کاری، مهارت دارم.",
      "من به طور فعال در بحث‌های تیمی شرکت می‌کنم و به موفقیت کلی تیم کمک می‌کنم.",
    ],
  },
  {
    section: "حل مسئله (Problem-Solving)",
    items: [
      "من توانایی تجزیه و تحلیل مسائل پیچیده و شناسایی اجزای اصلی آن‌ها را دارم.",
      "وقتی با یک چالش روبرو می‌شوم، می‌توانم راه‌حل‌های خلاقانه و غیرمتعارف ارائه دهم.",
      "من می‌توانم اطلاعات را به صورت انتقادی ارزیابی کنم و فرضیات موجود را زیر سؤال ببرم.",
      "من در تصمیم‌گیری‌های سریع و قاطع، به خصوص در شرایط تحت فشار، توانمند هستم.",
    ],
  },
  {
    section: "رهبری (Leadership)",
    items: [
      "من اغلب بدون اینکه از من خواسته شود، برای بهبود فرآیندها یا حل مشکلات پیش‌قدم می‌شوم.",
      "من می‌توانم دیگران را برای دستیابی به یک هدف مشترک، تشویق و باانگیزه کنم.",
      "من مسئولیت کامل نتایج کارها و تصمیمات خود را بر عهده می‌گیرم.",
      "من در هدایت یک گروه برای رسیدن به یک نتیجه موفق، احساس راحتی می‌کنم.",
    ],
  },
  {
    section: "اخلاق کاری (Work Ethic)",
    items: [
      "من به راحتی با تغییرات ناگهانی در محیط کار یا پروژه‌ها سازگار می‌شوم.",
      "من در مدیریت زمان و اولویت‌بندی وظایف برای رسیدن به مهلت‌های مقرر، مهارت دارم.",
      "پس از مواجهه با یک شکست یا مانع، می‌توانم به سرعت روحیه خود را بازیابم و به کار ادامه دهم.",
      "همکارانم مرا فردی قابل اعتماد و مسئولیت‌پذیر می‌دانند.",
    ],
  },
  {
    section: "توانایی‌های شناختی (Cognitive Abilities)",
    items: [
      "من به طور مداوم به دنبال یادگیری مهارت‌ها و دانش جدید برای رشد شخصی و حرفه‌ای هستم.",
      "من می‌توانم اطلاعات جدید را به سرعت یاد بگیرم و آن‌ها را در موقعیت‌های عملی به کار ببندم.",
    ],
  },
];

const totalQuestions = questions.reduce((acc, q) => acc + q.items.length, 0);

export default function SelfAssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValueChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: parseInt(value, 10) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length !== totalQuestions) {
      toast.error("لطفاً به تمام سوالات پاسخ دهید.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/self-assessment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("پرسشنامه با موفقیت ثبت شد. به داشبورد منتقل می‌شوید.");
        router.push('/'); // Redirect to dashboard or another appropriate page
      } else {
        throw new Error(result.message || 'خطا در ثبت پرسشنامه');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  let questionCounter = 0;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">پرسشنامه خودارزیابی مهارت‌های نرم</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">به سامانه (HRBOOTEH.COM) خوش آمدید! قبل از شروع سفر خود در شبیه‌سازی‌های تعاملی، لطفاً به مهارت‌های خود امتیاز دهید.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {questions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-6 rounded-lg border border-gray-200 bg-gray-50/50">
              <h2 className="text-xl font-bold text-right text-gray-800 mb-6">{section.section}</h2>
              <div className="space-y-6">
                {section.items.map((question, itemIndex) => {
                  const questionIndex = questionCounter++;
                  return (
                    <div key={questionIndex} className="p-4 rounded-md bg-white border border-gray-100 text-right">
                      <p className="font-semibold text-gray-700 mb-3">{questionIndex + 1}. {question}</p>
                      <RadioGroup
                        dir="ltr"
                        className="flex justify-center gap-4 sm:gap-6 pt-2"
                        onValueChange={(value) => handleValueChange(questionIndex, value)}
                        value={answers[questionIndex]?.toString()}
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div key={value} className="flex flex-col items-center space-y-2">
                            <RadioGroupItem value={value.toString()} id={`q${questionIndex}-v${value}`} className="w-6 h-6" />
                            <Label htmlFor={`q${questionIndex}-v${value}`} className="text-sm text-gray-600 cursor-pointer">
                              {value === 1 && "کاملاً مخالفم"}
                              {value === 2 && "مخالفم"}
                              {value === 3 && "نظری ندارم"}
                              {value === 4 && "موافقم"}
                              {value === 5 && "کاملاً موافقم"}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="text-center pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-1/2 lg:w-1/3 bg-blue-600 text-white hover:bg-blue-700 text-lg py-6 rounded-full">
              {isSubmitting ? 'در حال ثبت...' : 'ثبت و ادامه'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
