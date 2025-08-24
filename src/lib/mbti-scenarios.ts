// MBTI Personality Test Scenarios - Simple System-to-User Questions

export interface MBTIScenario {
  id: string;
  title: string;
  systemMessage: string;
  question: string;
  dimensions_to_analyze: string[];
}

export const getMBTIQuestionnaireData = () => {
  return {
    questionnaire_id: 2,
    title: "آزمون شخصیت MBTI",
    description: "تست شخصیت‌شناسی مایرز-بریگز برای شناخت نوع شخصیت شما",
    scenario_parts: [
      // بخش اول: برون‌گرایی در مقابل درون‌گرایی (E/I)
      {
        id: "mbti_part1_social_energy",
        title: "انرژی اجتماعی",
        systemMessage: "سلام {user_name}، برای شناخت بهتر شخصیت شما، سؤالاتی درباره ترجیحات شما خواهم پرسید. لطفاً به صورت کامل و صادقانه پاسخ دهید.",
        question: "در محیط کاری، آیا بیشتر انرژی خود را از تعامل با دیگران می‌گیرید یا از کار انفرادی و تمرکز روی وظایف؟ دلیل خود را شرح دهید و مثالی از تجربه‌تان بزنید.",
        dimensions_to_analyze: ["E_I"]
      },
      {
        id: "mbti_part2_social_interaction",
        title: "تعامل اجتماعی",
        systemMessage: "درباره نحوه تعامل شما با دیگران می‌پرسم.",
        question: "در جلسات کاری یا اجتماعی، آیا ترجیح می‌دهید فعالانه در بحث شرکت کنید و نظراتتان را بیان کنید، یا بیشتر گوش می‌دهید و قبل از صحبت فکر می‌کنید؟ چرا؟",
        dimensions_to_analyze: ["E_I"]
      },
      {
        id: "mbti_part3_recharge_method",
        title: "روش شارژ انرژی",
        systemMessage: "حالا درباره نحوه بازیابی انرژی‌تان می‌پرسم.",
        question: "پس از یک روز پرتنش، برای بازیابی انرژی بیشتر ترجیح می‌دهید با دوستان وقت بگذرانید یا تنها باشید؟ توضیح دهید که چه کارهایی انرژی‌تان را برمی‌گرداند.",
        dimensions_to_analyze: ["E_I"]
      },
      
      // بخش دوم: حسی در مقابل شهودی (S/N)
      {
        id: "mbti_part4_information_focus",
        title: "تمرکز بر اطلاعات",
        systemMessage: "حالا درباره نحوه پردازش اطلاعات شما می‌پرسم.",
        question: "هنگام یادگیری چیز جدید، بیشتر به جزئیات عملی و مراحل مشخص توجه می‌کنید یا به تصویر کلی و امکانات آن؟ مثالی از نحوه یادگیری‌تان بزنید.",
        dimensions_to_analyze: ["S_N"]
      },
      {
        id: "mbti_part5_problem_approach",
        title: "رویکرد به مسائل",
        systemMessage: "درباره نحوه برخورد شما با مسائل می‌پرسم.",
        question: "وقتی با مشکلی مواجه می‌شوید، بیشتر از تجربیات گذشته و راه‌حل‌های آزمایش‌شده استفاده می‌کنید یا به دنبال روش‌های نوآورانه و خلاقانه هستید؟ مثال بزنید.",
        dimensions_to_analyze: ["S_N"]
      },
      {
        id: "mbti_part6_future_planning",
        title: "برنامه‌ریزی آینده",
        systemMessage: "درباره نگاه شما به آینده می‌پرسم.",
        question: "در برنامه‌ریزی برای آینده، بیشتر روی اهداف مشخص و قابل دستیابی تمرکز می‌کنید یا روی رؤیاها و امکانات بزرگ؟ چگونه آینده‌تان را تصور می‌کنید؟",
        dimensions_to_analyze: ["S_N"]
      },
      
      // بخش سوم: تفکری در مقابل احساسی (T/F)
      {
        id: "mbti_part7_decision_criteria",
        title: "معیارهای تصمیم‌گیری",
        systemMessage: "حالا درباره نحوه تصمیم‌گیری شما می‌پرسم.",
        question: "وقتی باید تصمیم مهمی بگیرید، بیشتر بر اساس تحلیل منطقی و داده‌ها عمل می‌کنید یا احساسات و تأثیر روی دیگران را در نظر می‌گیرید؟ مثالی از تصمیم مهم‌تان بزنید.",
        dimensions_to_analyze: ["T_F"]
      },
      {
        id: "mbti_part8_conflict_resolution",
        title: "حل تعارض",
        systemMessage: "درباره نحوه برخورد شما با تعارضات می‌پرسم.",
        question: "در مواجهه با اختلاف نظر یا تعارض، بیشتر تلاش می‌کنید حقیقت را پیدا کنید و عادلانه قضاوت کنید، یا روابط را حفظ کنید و همه راضی باشند؟ چرا؟",
        dimensions_to_analyze: ["T_F"]
      },
      {
        id: "mbti_part9_feedback_style",
        title: "سبک بازخورد",
        systemMessage: "درباره نحوه ارائه بازخورد شما می‌پرسم.",
        question: "وقتی باید به کسی بازخورد بدهید، بیشتر مستقیم و صریح صحبت می‌کنید یا سعی می‌کنید ملایم و با در نظر گیری احساسات طرف مقابل باشید؟ توضیح دهید.",
        dimensions_to_analyze: ["T_F"]
      },
      
      // بخش چهارم: قضاوتی در مقابل ادراکی (J/P)
      {
        id: "mbti_part10_organization_style",
        title: "سبک سازماندهی",
        systemMessage: "درباره سبک کاری و زندگی شما می‌پرسم.",
        question: "آیا ترجیح می‌دهید برنامه‌ریزی دقیق داشته باشید و طبق آن عمل کنید، یا انعطاف‌پذیر باشید و با شرایط تطبیق پیدا کنید؟ محیط کار یا زندگی‌تان چگونه سازماندهی شده؟",
        dimensions_to_analyze: ["P_J"]
      },
      {
        id: "mbti_part11_deadline_approach",
        title: "رویکرد به ضرب‌الاجل",
        systemMessage: "درباره نحوه کار شما با ضرب‌الاجل‌ها می‌پرسم.",
        question: "وقتی پروژه‌ای با ضرب‌الاجل دارید، معمولاً از ابتدا شروع می‌کنید و مرحله به مرحله پیش می‌روید، یا تا آخرین لحظه صبر می‌کنید و با فشار کار می‌کنید؟ چرا؟",
        dimensions_to_analyze: ["P_J"]
      },
      {
        id: "mbti_part12_change_adaptation",
        title: "سازگاری با تغییر",
        systemMessage: "سؤال آخر درباره نحوه برخورد شما با تغییرات است.",
        question: "وقتی برنامه‌هایتان ناگهان تغییر می‌کند، چه احساسی دارید و چگونه واکنش نشان می‌دهید؟ آیا تغییرات غیرمنتظره را فرصت می‌بینید یا مشکل؟ مثال بزنید.",
        dimensions_to_analyze: ["P_J"]
      }
    ],
    scoring_rules: {
      max_score: 16, // 4 dimensions × 4 points each
      dimensions: [
        {
          name: "E_I",
          description: "برون‌گرایی در مقابل درون‌گرایی",
          range: "E (-4) تا I (+4)"
        },
        {
          name: "S_N", 
          description: "حسی در مقابل شهودی",
          range: "S (-4) تا N (+4)"
        },
        {
          name: "T_F",
          description: "تفکری در مقابل احساسی", 
          range: "T (-4) تا F (+4)"
        },
        {
          name: "P_J",
          description: "ادراکی در مقابل قضاوتی",
          range: "P (-4) تا J (+4)"
        }
      ]
    }
  };
};

// تحلیل پاسخ کاربر برای MBTI
export function analyzeMBTIUserResponse(userResponse: string, dimensionsToAnalyze: string[]) {
  // این تابع در API استفاده می‌شود
  const results = [];
  
  for (const dimension of dimensionsToAnalyze) {
    // تحلیل ساده بر اساس کلیدواژه - در عمل از AI استفاده می‌شود
    let score = 0;
    let reasoning = `تحلیل ${dimension} بر اساس پاسخ کاربر`;
    
    // تحلیل موقت - باید با AI جایگزین شود
    const response = userResponse.toLowerCase();
    
    if (dimension === 'E_I') {
      if (response.includes('جمع') || response.includes('گروه') || response.includes('بحث')) {
        score = -1; // E
        reasoning = 'گرایش به برون‌گرایی: استفاده از کلمات مرتبط با تعامل اجتماعی';
      } else if (response.includes('تنها') || response.includes('فکر') || response.includes('آرام')) {
        score = 1; // I
        reasoning = 'گرایش به درون‌گرایی: استفاده از کلمات مرتبط با تفکر انفرادی';
      }
    }
    
    results.push({
      dimension,
      score,
      reasoning
    });
  }
  
  return results;
}
