// EDI-I (Economic Development Independence Inventory) Analysis System
// Based on the 6-item questionnaire mapping methodology

export interface EDIAnalysisResult {
  item1_innovation: number;
  item2_personal_style: number;
  item3_leadership: number;
  item4_independent_problem_solving: number;
  item5_instruction_compliance: number;
  item6_reaction_to_self_reliance_label: number;
  totalScore: number;
  maxScore: number;
  level: string;
  description: string;
  detailedAnalysis: {
    part1: { innovation: number; personalStyle: number; reasoning: string };
    part2: { leadership: number; problemSolving: number; reasoning: string };
    part3: { compliance: number; labelReaction: number; reasoning: string };
  };
}

interface KeywordAnalysis {
  dimension: string;
  keywords: {
    agree: string[];
    disagree: string[];
  };
}

// کلیدواژه‌های تحلیل برای هر بعد
const ANALYSIS_KEYWORDS: Record<string, KeywordAnalysis> = {
  innovation: {
    dimension: 'نوآوری',
    keywords: {
      agree: ['تغییر', 'ایده جدید', 'تغییر مسیر', 'روش تازه', 'بهبود', 'ارتقا', 'خلاقیت', 'نو بودن', 'نوآوری', 'ابتکار', 'جدید'],
      disagree: ['حفظ روش فعلی', 'همان روال قبلی', 'بدون تغییر', 'ادامه مسیر گذشته', 'روال عادی', 'همیشگی', 'سنتی']
    }
  },
  personalStyle: {
    dimension: 'سبک شخصی',
    keywords: {
      agree: ['پافشاری', 'ایستادن روی نظر خود', 'بر سبک خودم', 'مهم نیست دیگران چه می‌گویند', 'نظر خودم را اجرا می‌کنم', 'پای ایده‌ام می‌ایستم', 'مستقل', 'خودم تصمیم', 'روی نظرم'],
      disagree: ['هماهنگی با جمع', 'تبعیت از نظر اکثریت', 'نظر خودم را تغییر می‌دهم', 'با تیم همراه می‌شوم', 'گروه', 'جمعی', 'همراهی']
    }
  },
  leadership: {
    dimension: 'رهبری',
    keywords: {
      agree: ['خودم مسئولیت را می‌گیرم', 'هدایت کار', 'تصمیم نهایی با من', 'پیش‌قدم می‌شوم', 'لیدر پروژه', 'رهبری', 'مدیریت', 'هدایت', 'سرپرستی'],
      disagree: ['مسئولیت را می‌دهم به دیگران', 'می‌سپارم به مدیر', 'متخصص', 'نمی‌خواهم هدایت کنم', 'واگذار', 'دیگران مسئول']
    }
  },
  problemSolving: {
    dimension: 'حل مسئله مستقل',
    keywords: {
      agree: ['خودم حل می‌کنم', 'شخصاً بررسی می‌کنم', 'بدون کمک بیرونی', 'راه‌حل را پیدا می‌کنم', 'مستقلاً', 'خودم', 'شخصی'],
      disagree: ['کمک می‌گیرم', 'مشاور خارجی', 'واگذاری', 'تیم دیگر رسیدگی کند', 'به دیگران تکیه می‌کنم', 'کمک خارجی', 'مشاوره']
    }
  },
  compliance: {
    dimension: 'پیروی از دستور',
    keywords: {
      agree: ['اجرای کامل دستورالعمل', 'تبعیت کامل', 'تغییر نمی‌دهم', 'پایبندی به قوانین', 'دستورها', 'قانون', 'مقررات', 'دستورالعمل'],
      disagree: ['تغییر دستورالعمل', 'انعطاف', 'مسیر خودم', 'اصلاح طبق نظر شخصی', 'تغییر', 'اصلاح', 'انعطاف‌پذیری']
    }
  },
  labelReaction: {
    dimension: 'واکنش به برچسب خودرأیی',
    keywords: {
      agree: ['تأیید برچسب', 'پذیرش اینکه مستقل', 'یک‌دنده‌ام', 'ادامه همان روش', 'با این برچسب مشکلی ندارم', 'موافقم', 'درسته', 'قبول دارم'],
      disagree: ['انکار برچسب', 'تلاش برای هماهنگی', 'تعدیل رفتار', 'تغییر نظر برای همراهی', 'مخالفم', 'اشتباه', 'تغییر می‌کنم']
    }
  }
};

// تحلیل متن بر اساس کلیدواژه‌ها
function analyzeTextForDimension(text: string, dimension: string): { score: number; reasoning: string } {
  const analysis = ANALYSIS_KEYWORDS[dimension];
  if (!analysis) {
    return { score: 1, reasoning: 'بعد تحلیل یافت نشد' };
  }

  const textLower = text.toLowerCase();
  let agreeCount = 0;
  let disagreeCount = 0;
  let foundKeywords: string[] = [];

  // جستجوی کلیدواژه‌های موافق
  analysis.keywords.agree.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      agreeCount++;
      foundKeywords.push(`+${keyword}`);
    }
  });

  // جستجوی کلیدواژه‌های مخالف
  analysis.keywords.disagree.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      disagreeCount++;
      foundKeywords.push(`-${keyword}`);
    }
  });

  // تصمیم‌گیری بر اساس تعداد کلیدواژه‌ها
  let isAgree = agreeCount > disagreeCount;
  
  // اگر هیچ کلیدواژه‌ای پیدا نشد، تحلیل کلی متن
  if (agreeCount === 0 && disagreeCount === 0) {
    // تحلیل کلی بر اساس لحن متن
    const independentWords = ['خودم', 'مستقل', 'شخصی', 'خود', 'تنها'];
    const cooperativeWords = ['تیم', 'گروه', 'همکاری', 'مشترک', 'جمعی'];
    
    const independentCount = independentWords.filter(word => textLower.includes(word)).length;
    const cooperativeCount = cooperativeWords.filter(word => textLower.includes(word)).length;
    
    isAgree = independentCount > cooperativeCount;
    foundKeywords.push(isAgree ? 'تحلیل کلی: مستقل' : 'تحلیل کلی: همکاری‌جو');
  }

  const score = isAgree ? 2 : 1;
  const reasoning = `${analysis.dimension}: ${isAgree ? 'موافق' : 'مخالف'} (${foundKeywords.join(', ')})`;

  return { score, reasoning };
}

// تحلیل کامل پاسخ‌های کاربر
export function analyzeEDIResponses(responses: string[]): EDIAnalysisResult {
  if (responses.length !== 3) {
    throw new Error('باید دقیقاً 3 پاسخ برای تحلیل ارائه شود');
  }

  // تحلیل بخش اول: نوآوری + سبک شخصی
  const part1Innovation = analyzeTextForDimension(responses[0], 'innovation');
  const part1PersonalStyle = analyzeTextForDimension(responses[0], 'personalStyle');

  // تحلیل بخش دوم: رهبری + حل مسئله مستقل
  const part2Leadership = analyzeTextForDimension(responses[1], 'leadership');
  const part2ProblemSolving = analyzeTextForDimension(responses[1], 'problemSolving');

  // تحلیل بخش سوم: پیروی از دستور + واکنش به برچسب
  const part3Compliance = analyzeTextForDimension(responses[2], 'compliance');
  const part3LabelReaction = analyzeTextForDimension(responses[2], 'labelReaction');

  // اعمال Reverse Scoring برای آیتم‌های 1، 3، 5
  const item1_innovation = part1Innovation.score === 2 ? 1 : 2; // Reverse
  const item2_personal_style = part1PersonalStyle.score; // Direct
  const item3_leadership = part2Leadership.score === 2 ? 1 : 2; // Reverse
  const item4_independent_problem_solving = part2ProblemSolving.score; // Direct
  const item5_instruction_compliance = part3Compliance.score === 2 ? 1 : 2; // Reverse
  const item6_reaction_to_self_reliance_label = part3LabelReaction.score; // Direct

  // محاسبه امتیاز کل
  const totalScore = item1_innovation + item2_personal_style + item3_leadership + 
                    item4_independent_problem_solving + item5_instruction_compliance + 
                    item6_reaction_to_self_reliance_label;
  const maxScore = 12;

  // تعیین سطح استقلال
  let level: string;
  let description: string;

  if (totalScore >= 10) {
    level = 'استقلال بالا';
    description = 'شما دارای سطح بالایی از استقلال اقتصادی هستید. تمایل قوی به نوآوری، رهبری و تصمیم‌گیری مستقل دارید.';
  } else if (totalScore >= 8) {
    level = 'استقلال متوسط به بالا';
    description = 'شما دارای سطح خوبی از استقلال هستید اما در برخی موارد به همکاری و راهنمایی نیاز دارید.';
  } else if (totalScore >= 6) {
    level = 'استقلال متوسط';
    description = 'شما تعادل مناسبی بین استقلال و همکاری دارید. در موقعیت‌های مختلف رویکرد متفاوتی اتخاذ می‌کنید.';
  } else {
    level = 'استقلال پایین';
    description = 'شما بیشتر به همکاری گروهی و راهنمایی دیگران تمایل دارید. ترجیح می‌دهید در چارچوب تیم کار کنید.';
  }

  return {
    item1_innovation,
    item2_personal_style,
    item3_leadership,
    item4_independent_problem_solving,
    item5_instruction_compliance,
    item6_reaction_to_self_reliance_label,
    totalScore,
    maxScore,
    level,
    description,
    detailedAnalysis: {
      part1: {
        innovation: item1_innovation,
        personalStyle: item2_personal_style,
        reasoning: `${part1Innovation.reasoning} | ${part1PersonalStyle.reasoning}`
      },
      part2: {
        leadership: item3_leadership,
        problemSolving: item4_independent_problem_solving,
        reasoning: `${part2Leadership.reasoning} | ${part2ProblemSolving.reasoning}`
      },
      part3: {
        compliance: item5_instruction_compliance,
        labelReaction: item6_reaction_to_self_reliance_label,
        reasoning: `${part3Compliance.reasoning} | ${part3LabelReaction.reasoning}`
      }
    }
  };
}

// تحلیل پاسخ‌های نمونه که کاربر ارائه داده
export function analyzeSampleResponses(): EDIAnalysisResult {
  const sampleResponses = [
    "دوست ندارم کارهای جدید و غیرمعمول انجام دهم. من دوست دارم کارها را به طریقی که خودم صلاح می‌دانم، انجام دهم و اهمیتی به نظرات دیگران نمی‌دهم.",
    "هنگامی که در یک گروه هستم، از این که رهبری گروه را به دیگران بسپارم، خوشحال می‌شوم. هنگامی که کاری را در دست می‌گیرم، به ندرت به کمک نیاز پیدا می‌کنم و اغلب از دیگران کمک نمی‌گیرم.",
    "آنچه از من انتظار می‌رود، انجام می‌دهم و دستورها را مو به مو اجرا می‌کنم. مردم فکر می‌کنند که من آدم خودرأی هستم."
  ];

  return analyzeEDIResponses(sampleResponses);
}
