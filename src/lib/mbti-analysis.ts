// MBTI Personality Type Analysis System
// Based on Myers-Briggs Type Indicator with 4 dimensions: E/I, S/N, T/F, P/J

export interface MBTIAnalysisResult {
  E_I_score: number; // Extraversion vs Introversion (-4 to +4)
  S_N_score: number; // Sensing vs Intuition (-4 to +4)
  T_F_score: number; // Thinking vs Feeling (-4 to +4)
  P_J_score: number; // Perceiving vs Judging (-4 to +4)
  personality_type: string; // e.g., "ENFP"
  type_name: string; // Persian name
  description: string;
  strengths: string[];
  challenges: string[];
  development_areas?: string[];
  career_suggestions: string[];
  famous_people: string[];
  dimensions?: {
    E_I: number;
    S_N: number;
    T_F: number;
    P_J: number;
  };
  detailedAnalysis: {
    part1: { E_I: number; reasoning: string };
    part2: { S_N: number; reasoning: string };
    part3: { T_F: number; reasoning: string };
    part4: { P_J: number; reasoning: string };
  };
}

interface MBTIKeywordAnalysis {
  dimension: string;
  keywords: {
    positive: string[]; // +1 point towards second letter (I, N, F, J)
    negative: string[]; // +1 point towards first letter (E, S, T, P)
  };
}

// کلیدواژه‌های تحلیل MBTI
const MBTI_KEYWORDS: Record<string, MBTIKeywordAnalysis> = {
  E_I: {
    dimension: 'برون‌گرایی/درون‌گرایی',
    keywords: {
      negative: ['جمع', 'گروه', 'با دیگران', 'اجتماعی', 'صحبت کردن', 'ارتباط', 'تیم', 'همکاری', 'بحث', 'جلسه', 'انرژی از دیگران', 'فعال در جمع'],
      positive: ['تنها', 'خودم', 'آرام', 'فکر کردن', 'تأمل', 'خلوت', 'شخصی', 'درونی', 'ساکت', 'تمرکز', 'انرژی درونی', 'کتاب خواندن']
    }
  },
  S_N: {
    dimension: 'حسی/شهودی',
    keywords: {
      negative: ['عملی', 'واقعی', 'جزئیات', 'مشخص', 'تجربه', 'حقایق', 'گام به گام', 'روتین', 'سنتی', 'ملموس', 'دقیق', 'آمار'],
      positive: ['ایده', 'خلاقیت', 'آینده', 'امکانات', 'تصور', 'نوآوری', 'الهام', 'رؤیا', 'انتزاعی', 'نظریه', 'تغییر', 'احتمال']
    }
  },
  T_F: {
    dimension: 'تفکری/احساسی',
    keywords: {
      negative: ['منطق', 'تحلیل', 'عقلانی', 'بی‌طرف', 'عدالت', 'کارآمد', 'نتیجه', 'سیستم', 'قانون', 'دلیل', 'علمی', 'روش'],
      positive: ['احساس', 'همدلی', 'مهربانی', 'ارزش‌ها', 'انسانی', 'قلب', 'مراقبت', 'هماهنگی', 'روابط', 'عشق', 'درک', 'حمایت']
    }
  },
  P_J: {
    dimension: 'ادراکی/قضاوتی',
    keywords: {
      negative: ['انعطاف', 'باز', 'خودجوش', 'تطبیق', 'کشف', 'گزینه‌ها', 'آزاد', 'بداهه', 'تغییر', 'جریان', 'کنجکاوی', 'تجربه'],
      positive: ['برنامه', 'سازمان', 'نظم', 'تصمیم', 'کنترل', 'زمان‌بندی', 'هدف', 'پایان', 'ساختار', 'قطعی', 'مسئولیت', 'منظم']
    }
  }
};

// 16 نوع شخصیت MBTI
const MBTI_TYPES: Record<string, {
  name: string;
  description: string;
  strengths: string[];
  challenges: string[];
  careers: string[];
  famous: string[];
}> = {
  INTJ: {
    name: 'معمار (Architect)',
    description: 'تفکر استراتژیک، مستقل و قاطع. دارای بینش عمیق و توانایی پیاده‌سازی ایده‌های پیچیده.',
    strengths: ['تفکر استراتژیک', 'مستقل', 'قاطع', 'خلاق', 'تحلیلگر'],
    challenges: ['انتقادی بودن', 'بی‌صبری', 'تنهایی', 'سختگیری'],
    careers: ['مهندس نرم‌افزار', 'محقق', 'مشاور مدیریت', 'معمار', 'دانشمند'],
    famous: ['ایلان ماسک', 'استیو جابز', 'نیکولا تسلا']
  },
  INTP: {
    name: 'متفکر (Thinker)',
    description: 'کنجکاو و نوآور، دارای عطش دانش و درک عمیق از سیستم‌ها و نظریه‌ها.',
    strengths: ['تحلیلی', 'منطقی', 'مستقل', 'خلاق', 'انعطاف‌پذیر'],
    challenges: ['عدم تمرکز', 'تأخیر', 'انزوا', 'عدم صبر با جزئیات'],
    careers: ['دانشمند', 'فیلسوف', 'ریاضی‌دان', 'برنامه‌نویس', 'محقق'],
    famous: ['آلبرت انیشتین', 'بیل گیتس', 'چارلز داروین']
  },
  ENTJ: {
    name: 'فرمانده (Commander)',
    description: 'رهبر طبیعی، جسور و قاطع. توانایی تشخیص مشکلات و حل آن‌ها با راه‌حل‌های خلاقانه.',
    strengths: ['رهبری', 'استراتژیک', 'کارآمد', 'اعتماد به نفس', 'قاطع'],
    challenges: ['بی‌صبری', 'سلطه‌جو', 'سرسخت', 'عدم توجه به احساسات'],
    careers: ['مدیر اجرایی', 'کارآفرین', 'وکیل', 'مشاور', 'سیاستمدار'],
    famous: ['استیو جابز', 'ناپلئون بناپارت', 'مارگارت تاچر']
  },
  ENTP: {
    name: 'مناظره‌کننده (Debater)',
    description: 'هوشمند و کنجکاو، قادر به الهام بخشیدن و چالش کردن وضع موجود.',
    strengths: ['خلاق', 'انعطاف‌پذیر', 'پرانرژی', 'مناظره‌کننده', 'نوآور'],
    challenges: ['عدم تمرکز', 'بی‌نظمی', 'بحث‌طلبی', 'عدم صبر'],
    careers: ['کارآفرین', 'مشاور', 'روزنامه‌نگار', 'وکیل', 'مخترع'],
    famous: ['والت دیزنی', 'تام هنکس', 'رابرت داونی جونیور']
  },
  INFJ: {
    name: 'وکیل (Advocate)',
    description: 'خلاق و بصیر، دارای اصول محکم و تمایل به کمک به دیگران برای تحقق پتانسیل‌شان.',
    strengths: ['بصیرت', 'ایده‌آلیست', 'سازمان‌یافته', 'مراقب', 'خلاق'],
    challenges: ['حساس', 'کمال‌طلب', 'خصوصی', 'فرسودگی'],
    careers: ['مشاور', 'نویسنده', 'روان‌شناس', 'معلم', 'هنرمند'],
    famous: ['مارتین لوتر کینگ', 'نلسون ماندلا', 'مادر ترزا']
  },
  INFP: {
    name: 'میانجی (Mediator)',
    description: 'ایده‌آلیست و وفادار، همیشه به دنبال راه‌هایی برای انجام کار خوب در دنیا.',
    strengths: ['ایده‌آلیست', 'وفادار', 'انعطاف‌پذیر', 'مراقب', 'خلاق'],
    challenges: ['حساس', 'عملی نبودن', 'سخت‌گیری از خود', 'انزوا'],
    careers: ['نویسنده', 'هنرمند', 'مشاور', 'روان‌شناس', 'معلم'],
    famous: ['ویلیام شکسپیر', 'جانی دپ', 'پرنسس دایانا']
  },
  ENFJ: {
    name: 'قهرمان (Protagonist)',
    description: 'کاریزماتیک و الهام‌بخش، قادر به تشویق دیگران برای رسیدن به اهدافشان.',
    strengths: ['رهبری', 'کاریزما', 'مراقب', 'الهام‌بخش', 'سازمان‌یافته'],
    challenges: ['حساس', 'ایده‌آلیست', 'خودانتقادی', 'فرسودگی'],
    careers: ['معلم', 'مشاور', 'مربی', 'سیاستمدار', 'روان‌شناس'],
    famous: ['اپرا وینفری', 'باراک اوباما', 'مایا آنجلو']
  },
  ENFP: {
    name: 'کمپین‌ساز (Campaigner)',
    description: 'مشتاق و خلاق، دارای زندگی اجتماعی قوی و همیشه مملو از ایده‌های جدید.',
    strengths: ['مشتاق', 'خلاق', 'اجتماعی', 'انعطاف‌پذیر', 'مراقب'],
    challenges: ['عدم تمرکز', 'بی‌نظمی', 'حساس', 'استرس'],
    careers: ['روزنامه‌نگار', 'هنرمند', 'مشاور', 'بازاریاب', 'معلم'],
    famous: ['رابین ویلیامز', 'ویل اسمیت', 'الن دی‌جنرس']
  },
  ISTJ: {
    name: 'لجستیک (Logistician)',
    description: 'عملی و واقع‌گرا، قابل اعتماد و مسئولیت‌پذیر در تمام کارها.',
    strengths: ['قابل اعتماد', 'مسئولیت‌پذیر', 'عملی', 'صبور', 'وفادار'],
    challenges: ['سرسخت', 'انتقادی', 'مقاوم در برابر تغییر', 'خودانتقادی'],
    careers: ['حسابدار', 'مدیر', 'وکیل', 'دکتر', 'مهندس'],
    famous: ['جرج واشنگتن', 'وارن بافت', 'آنگلا مرکل']
  },
  ISFJ: {
    name: 'محافظ (Protector)',
    description: 'گرم و مراقب، همیشه آماده دفاع از عزیزانشان.',
    strengths: ['مراقب', 'قابل اعتماد', 'سخت‌کوش', 'مهربان', 'عملی'],
    challenges: ['خودگذشته', 'حساس', 'مقاوم در برابر تغییر', 'کمال‌طلب'],
    careers: ['پرستار', 'معلم', 'مشاور', 'پزشک', 'اداری'],
    famous: ['مادر ترزا', 'کیت میدلتون', 'رزا پارکس']
  },
  ESTJ: {
    name: 'اجرایی (Executive)',
    description: 'سازمان‌یافته و قاطع، قادر به مدیریت کردن افراد و پروژه‌ها.',
    strengths: ['سازمان‌یافته', 'قاطع', 'عملی', 'مسئولیت‌پذیر', 'رهبر'],
    challenges: ['سرسخت', 'انتقادی', 'بی‌صبر', 'سلطه‌جو'],
    careers: ['مدیر', 'قاضی', 'پلیس', 'نظامی', 'مدیر اجرایی'],
    famous: ['هیلاری کلینتون', 'جان راکفلر', 'فرانک سیناترا']
  },
  ESFJ: {
    name: 'کنسول (Consul)',
    description: 'مراقب و مردم‌دوست، همیشه آماده کمک و ایجاد هماهنگی.',
    strengths: ['مراقب', 'مسئولیت‌پذیر', 'گرم', 'همکار', 'سازمان‌یافته'],
    challenges: ['حساس', 'نیازمند تأیید', 'مقاوم در برابر تغییر', 'فداکار'],
    careers: ['معلم', 'پرستار', 'مدیر منابع انسانی', 'مشاور', 'فروشنده'],
    famous: ['تیلور سویفت', 'هیو جکمن', 'دنی واشنگتن']
  },
  ISTP: {
    name: 'مجرب (Virtuoso)',
    description: 'جسور و عملی، استاد ابزارها و تکنیک‌های مختلف.',
    strengths: ['عملی', 'انعطاف‌پذیر', 'آرام', 'منطقی', 'خلاق'],
    challenges: ['خصوصی', 'حساس', 'سرسخت', 'کم صبر'],
    careers: ['مهندس', 'مکانیک', 'پایلوت', 'ورزشکار', 'هنرمند'],
    famous: ['مایکل جردن', 'تام کروز', 'بروس لی']
  },
  ISFP: {
    name: 'ماجراجو (Adventurer)',
    description: 'هنرمند و انعطاف‌پذیر، همیشه آماده کشف امکانات جدید.',
    strengths: ['هنرمند', 'انعطاف‌پذیر', 'گرم', 'کنجکاو', 'مراقب'],
    challenges: ['حساس', 'خصوصی', 'سخت‌گیر', 'کم اعتماد به نفس'],
    careers: ['هنرمند', 'موسیقی‌دان', 'طراح', 'عکاس', 'مشاور'],
    famous: ['مایکل جکسون', 'فریدا کالو', 'آدل']
  },
  ESTP: {
    name: 'کارآفرین (Entrepreneur)',
    description: 'پرانرژی و ادراک‌کننده، واقعاً از زندگی لذت می‌برند.',
    strengths: ['پرانرژی', 'عملی', 'انعطاف‌پذیر', 'اجتماعی', 'خودجوش'],
    challenges: ['بی‌صبر', 'ریسک‌پذیر', 'حواس‌پرت', 'حساس'],
    careers: ['فروشنده', 'ورزشکار', 'کارآفرین', 'پلیس', 'بازیگر'],
    famous: ['دونالد ترامپ', 'مدونا', 'ارنست همینگوی']
  },
  ESFP: {
    name: 'سرگرم‌کننده (Entertainer)',
    description: 'خودجوش و مشتاق، هرگز فرصت خوبی را از دست نمی‌دهند.',
    strengths: ['مشتاق', 'گرم', 'اجتماعی', 'عملی', 'خودجوش'],
    challenges: ['حساس', 'تضاد گریز', 'بی‌نظم', 'تمرکز ضعیف'],
    careers: ['بازیگر', 'موسیقی‌دان', 'مشاور', 'معلم', 'فروشنده'],
    famous: ['الویس پریسلی', 'مریلین مونرو', 'جیمی فاکس']
  }
};

// تحلیل متن برای هر بعد MBTI
function analyzeTextForMBTIDimension(text: string, dimension: string): { score: number; reasoning: string } {
  const analysis = MBTI_KEYWORDS[dimension];
  if (!analysis) {
    return { score: 0, reasoning: 'بعد تحلیل یافت نشد' };
  }

  const textLower = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let foundKeywords: string[] = [];

  // جستجوی کلیدواژه‌های منفی (حرف اول)
  analysis.keywords.negative.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      negativeCount++;
      foundKeywords.push(`-${keyword}`);
    }
  });

  // جستجوی کلیدواژه‌های مثبت (حرف دوم)
  analysis.keywords.positive.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      positiveCount++;
      foundKeywords.push(`+${keyword}`);
    }
  });

  // محاسبه امتیاز (-2 تا +2 برای هر پاسخ)
  const score = Math.max(-2, Math.min(2, positiveCount - negativeCount));
  const reasoning = `${analysis.dimension}: ${score > 0 ? 'گرایش به حرف دوم' : score < 0 ? 'گرایش به حرف اول' : 'متعادل'} (${foundKeywords.join(', ') || 'تحلیل کلی'})`;

  return { score, reasoning };
}

// تعیین نوع شخصیت بر اساس امتیازات
function determinePersonalityType(E_I: number, S_N: number, T_F: number, P_J: number): string {
  const type = 
    (E_I <= 0 ? 'E' : 'I') +
    (S_N <= 0 ? 'S' : 'N') +
    (T_F <= 0 ? 'T' : 'F') +
    (P_J <= 0 ? 'P' : 'J');
  
  return type;
}

// تحلیل کامل MBTI
export function analyzeMBTIResponses(responses: string[]): MBTIAnalysisResult {
  if (responses.length !== 12) {
    throw new Error('باید دقیقاً 12 پاسخ برای تحلیل MBTI ارائه شود');
  }

  // تحلیل هر بعد با چندین سؤال
  // E/I: سؤالات 1, 2, 3
  const EI_scores = [
    analyzeTextForMBTIDimension(responses[0], 'E_I'),
    analyzeTextForMBTIDimension(responses[1], 'E_I'),
    analyzeTextForMBTIDimension(responses[2], 'E_I')
  ];
  const avgEI = Math.round(EI_scores.reduce((sum, item) => sum + item.score, 0) / 3);

  // S/N: سؤالات 4, 5, 6
  const SN_scores = [
    analyzeTextForMBTIDimension(responses[3], 'S_N'),
    analyzeTextForMBTIDimension(responses[4], 'S_N'),
    analyzeTextForMBTIDimension(responses[5], 'S_N')
  ];
  const avgSN = Math.round(SN_scores.reduce((sum, item) => sum + item.score, 0) / 3);

  // T/F: سؤالات 7, 8, 9
  const TF_scores = [
    analyzeTextForMBTIDimension(responses[6], 'T_F'),
    analyzeTextForMBTIDimension(responses[7], 'T_F'),
    analyzeTextForMBTIDimension(responses[8], 'T_F')
  ];
  const avgTF = Math.round(TF_scores.reduce((sum, item) => sum + item.score, 0) / 3);

  // J/P: سؤالات 10, 11, 12
  const JP_scores = [
    analyzeTextForMBTIDimension(responses[9], 'P_J'),
    analyzeTextForMBTIDimension(responses[10], 'P_J'),
    analyzeTextForMBTIDimension(responses[11], 'P_J')
  ];
  const avgJP = Math.round(JP_scores.reduce((sum, item) => sum + item.score, 0) / 3);

  // تعیین نوع شخصیت
  const personalityType = determinePersonalityType(avgEI, avgSN, avgTF, avgJP);
  const typeInfo = MBTI_TYPES[personalityType];

  return {
    E_I_score: avgEI,
    S_N_score: avgSN,
    T_F_score: avgTF,
    P_J_score: avgJP,
    personality_type: personalityType,
    type_name: typeInfo.name,
    description: typeInfo.description,
    strengths: typeInfo.strengths,
    challenges: typeInfo.challenges,
    career_suggestions: typeInfo.careers,
    famous_people: typeInfo.famous,
    detailedAnalysis: {
      part1: { E_I: avgEI, reasoning: EI_scores.map(s => s.reasoning).join(' | ') },
      part2: { S_N: avgSN, reasoning: SN_scores.map(s => s.reasoning).join(' | ') },
      part3: { T_F: avgTF, reasoning: TF_scores.map(s => s.reasoning).join(' | ') },
      part4: { P_J: avgJP, reasoning: JP_scores.map(s => s.reasoning).join(' | ') }
    }
  };
}

// تحلیل نمونه برای تست
export function analyzeSampleMBTIResponses(): MBTIAnalysisResult {
  const sampleResponses = [
    // E/I questions (3 responses)
    "دوست دارم در جمع باشم و با دیگران صحبت کنم. انرژی من از ارتباط با افراد می‌آید.",
    "در جلسات فعالانه شرکت می‌کنم و نظراتم را بیان می‌کنم.",
    "پس از روز سخت، با دوستان وقت گذراندن انرژی‌ام را برمی‌گرداند.",
    // S/N questions (3 responses)
    "معمولاً به جزئیات توجه می‌کنم و روی حقایق تمرکز دارم. تجربه عملی برایم مهم است.",
    "از تجربیات گذشته و راه‌حل‌های آزمایش‌شده استفاده می‌کنم.",
    "روی اهداف مشخص و قابل دستیابی تمرکز می‌کنم.",
    // T/F questions (3 responses)
    "تصمیمات را بر اساس منطق و تحلیل می‌گیرم. عدالت و کارآمدی برایم اولویت دارد.",
    "در تعارضات تلاش می‌کنم حقیقت را پیدا کنم و عادلانه قضاوت کنم.",
    "بازخورد مستقیم و صریح می‌دهم.",
    // J/P questions (3 responses)
    "دوست دارم برنامه داشته باشم و کارها را سازمان‌یافته انجام دهم. نظم برایم مهم است.",
    "پروژه‌ها را از ابتدا شروع می‌کنم و مرحله به مرحله پیش می‌روم.",
    "تغییرات غیرمنتظره برایم مشکل‌ساز است و ترجیح می‌دهم برنامه‌ام ثابت باشد."
  ];

  return analyzeMBTIResponses(sampleResponses);
}
