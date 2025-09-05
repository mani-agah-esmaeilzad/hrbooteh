import { v4 as uuidv4 } from 'uuid';

// تعریف انواع داده
export interface ScenarioPart {
  part_index: number;
  title: string;
  dimensions_to_analyze: number[];
  dialogue: Array<{
    character: string;
    content: string;
  }>;
}

export interface QuestionnaireData {
  questionnaire_title: string;
  original_questions: Array<{
    id: number;
    text: string;
  }>;
  scenario_parts: ScenarioPart[];
  scoring_rules: { max_score: number };
  score_interpretation: Record<string, string>;
  system_prompts: {
    dialogue_creation: string;
    dialogue_continuation: string;
    response_analyzer: string;
  };
  analysis_keywords: Record<string, {
    agree: string[];
    disagree: string[];
  }>;
}

export interface SessionState {
  type: string;
  score: number;
  current_question_index: number;
  answers: Record<string, { score: number; reasoning: string }>;
  history: Array<{
    role: 'user' | 'model';
    parts: string[];
  }>;
}

// داده‌های پرسشنامه استقلال
export function getIndependenceQuestionnaireData(): QuestionnaireData {
  return {
    questionnaire_title: "سناریوی استقلال در محیط کار",
    original_questions: [
      { id: 1, text: "دوست ندارم کارهاى جدید و غیرمعمول انجام دهم." }, // نوآوری (معکوس)
      { id: 2, text: "من دوست دارم کارها را به طریقى که خودم صلاح مى‌دانم، انجام دهم و اهمیتى به نظرات دیگران نمى‌دهم." }, // سبک شخصی
      { id: 3, text: "هنگامى که در یک گروه هستم، از این که رهبرى گروه را به دیگران بسپارم، خوشحال مى‌شوم." }, // رهبری (معکوس)
      { id: 4, text: "هنگامى که کارى را در دست مى‌گیرم، به ندرت به کمک نیاز پیدا مى‌کنم و اغلب از دیگران کمک نمى‌گیرم." }, // حل مسئله مستقل
      { id: 5, text: "آنچه از من انتظار مى‌رود، انجام مى‌دهم و دستورها را مو به مو اجرا مى‌کنم." }, // پیروی از دستور (معکوس)
      { id: 6, text: "مردم فکر مى‌کنند که من آدم خودرأى هستم." } // واکنش به برچسب خودرأیی
    ],
    scenario_parts: [
      {
        part_index: 0,
        title: "نوآوری + سبک شخصی (چالش انتخاب)",
        dimensions_to_analyze: [1, 2],
        dialogue: [
          { character: "آقای توحیدی", content: "سلام دوستان، وقت بخیر. خوش آمدید به جلسه امروز. همان‌طور که می‌دانید، من آقای توحیدی هستم، مدیر این بخش. امروز قراره درباره پروژه به‌روزرسانی مدل قدیمی‌مون که خیلی پرفروش بوده، تصمیم بگیریم." },
          { character: "سارا", content: "سلام آقای توحیدی. من سارا هستم، طراح تیم. واقعاً هیجان‌زده‌ام که بالاخره روی این پروژه کار کنیم." },
          { character: "احمد", content: "سلام همگی. احمد هستم، مسئول کیفیت. امیدوارم بتونیم یه تصمیم درست و کم‌ریسک بگیریم." },
          { character: "خانم نوروزی", content: "سلام. من خانم نوروزی از بخش مالی. باید بگم که بودجه محدوده و باید دقت کنیم." },
          { character: "آقای توحیدی", content: "خب، شما هم که تازه سرپرست تیم طراحی شدید، نظرتون مهمه. حالا بریم سر اصل مطلب. من فکر می‌کنم پروژه را باید دقیقاً مثل قبل اجرا کنیم، تغییر زیاد نیاز نیست." },
          { character: "سارا", content: "ولی این یعنی درجا زدن. باید یک مسیر تازه امتحان کنیم که محصول را به‌روزتر کند." },
          { character: "احمد", content: "مسیر جدید یعنی ریسک بالا و هزینه بیشتر." },
          { character: "احمد", content: "شما، تو معمولاً روی ایده خودت می‌ایستی، حتی اگر همه مخالف باشن. این‌بار هم همین‌طور می‌کنی یا با اکثریت همراه می‌شی؟ چرا؟" }
        ]
      },
      {
        part_index: 1,
        title: "رهبری + حل مسئله مستقل (چالش توانمندی)",
        dimensions_to_analyze: [3, 4],
        dialogue: [
          { character: "آقای توحیدی", content: "بسیار خب، حالا که از نیمه جلسه گذشتیم، بیایید به بخش گزارش فنی برسیم. احمد، لطفاً وضعیت این بخش حساس پروژه را برای ما توضیح بده." },
          { character: "احمد", content: "ممنون آقای توحیدی. می‌تونم این بخش رو خودم مدیریت کنم. تجربه کافی دارم." },
          { character: "سارا", content: "یا می‌تونیم این رو به {user_name} بدهیم که کار سرعت بگیره. {user_name} که تازه سرپرست شده، ایده‌های تازه‌ای داره." },
          { character: "خانم نوروزی", content: "مهم این است که در زمان مقرر تمام شود. بودجه اضافی نداریم." },
          { character: "احمد", content: "ببخشید، همین الان از بخش فنی پیام آمده - یک مشکل فنی جدی پیدا شده است." },
          { character: "آقای توحیدی", content: "این مشکل نیاز به حل سریع دارد." },
          { character: "احمد", content: "{user_name}؛ راستش شک دارم بدون کمک دیگران از پس این مشکل بربیای. می‌خوای خودت مستقلاً وارد بشی و این بخش رو تا آخر به عهده بگیری یا مسئولیت رو می‌دی به من یا یک مشاور خارجی؟ دلیلش؟" },
          { character: "System", content: "لطفاً پاسخ خود را بنویسید. آیا می‌خواهید مسئولیت را خودتان به عهده بگیرید یا به دیگران واگذار کنید؟" }
        ]
      },
      {
        part_index: 2,
        title: "پیروی از دستور + واکنش به برچسب خودرأیی (چالش شخصیتی)",
        dimensions_to_analyze: [5, 6],
        dialogue: [
          { character: "آقای توحیدی", content: "خب دوستان، با نزدیک شدن به پایان جلسه، بیایید تصمیم نهایی را بگیریم." },
          { character: "خانم نوروزی", content: "دستورالعمل واحد مرکزی واضحه؛ باید مو به مو اجرا کنیم تا از نظر بودجه و زمان مطمئن باشیم." },
          { character: "احمد", content: "با خانم نوروزی موافقم. قوانین را باید رعایت کنیم." },
          { character: "سارا", content: "یا می‌شه کمی انعطاف به خرج داد و ایده‌های {user_name} رو هم لحاظ کرد." },
          { character: "خانم نوروزی", content: "انعطاف؟! این یعنی تخطی از دستورالعمل‌ها!" },
          { character: "احمد", content: "راستش {user_name} زیادی خود رأی و یک‌دنده هستید!" },
          { character: "سارا", content: "احمد، این حرف درستی نیست. {user_name} فقط متفاوت فکر می‌کنه." },
          { character: "آقای توحیدی", content: "{user_name}، با این حرف موافقی؟ آیا روی نظر خودت می‌ایستی و مسیر متفاوت رو پیشنهاد میدی یا برای هماهنگی با تیم، نظرت رو تغییر میدی؟ اگه آره دلیلت چیه؟" }
        ]
      }
    ],
    scoring_rules: {
      max_score: 12
    },
    score_interpretation: {
      "6-8": "نیاز به استقلال ضعیف",
      "8-12": "نیاز به استقلال متوسط",
      "12+": "نیاز به استقلال بسیار خوب"
    },
    system_prompts: {
      dialogue_creation: `You are an AI assistant presenting a pre-defined scenario.
Your task is to output the dialogue for the FIRST part of the scenario exactly as provided.

Output format (Strictly JSON):
{"messages": [
    {"character": "آقای توحیدی", "content": "سلام دوستان، وقت بخیر. خوش آمدید به جلسه امروز. همان‌طور که می‌دانید، من آقای توحیدی هستم، مدیر این بخش. امروز قراره درباره پروژه به‌روزرسانی مدل قدیمی‌مون که خیلی پرفروش بوده، تصمیم بگیریم."},
    {"character": "سارا", "content": "سلام آقای توحیدی. من سارا هستم، طراح تیم. واقعاً هیجان‌زده‌ام که بالاخره روی این پروژه کار کنیم."},
    {"character": "احمد", "content": "سلام همگی. احمد هستم، مسئول کیفیت. امیدوارم بتونیم یه تصمیم درست و کم‌ریسک بگیریم."},
    {"character": "خانم نوروزی", "content": "سلام. من خانم نوروزی از بخش مالی. باید بگم که بودجه محدوده و باید دقت کنیم."},
    {"character": "آقای توحیدی", "content": "خب، شما هم که تازه سرپرست تیم طراحی شدید، نظرتون مهمه. حالا بریم سر اصل مطلب. من فکر می‌کنم پروژه را باید دقیقاً مثل قبل اجرا کنیم، تغییر زیاد نیاز نیست."},
    {"character": "سارا", "content": "ولی این یعنی درجا زدن. باید یک مسیر تازه امتحان کنیم که محصول را به‌روزتر کند."},
    {"character": "احمد", "content": "مسیر جدید یعنی ریسک بالا و هزینه بیشتر."},
    {"character": "احمد", "content": "شما، تو معمولاً روی ایده خودت می‌ایستی، حتی اگر همه مخالف باشن. این‌بار هم همین‌طور می‌کنی یا با اکثریت همراه می‌شی؟ چرا؟"}
]}`,

      dialogue_continuation: `You are an AI assistant continuing a pre-defined scenario.
Based on the current scenario part index, you must present the dialogue for the NEXT part.

**Current Scenario Part Index: {current_part_index}**

If the current index is 0, present the dialogue for Part 2.
If the current index is 1, present the dialogue for Part 3.

**Part 2 Dialogue:**
{"messages": [
    {"character": "آقای توحیدی", "content": "بسیار خب، حالا که از نیمه جلسه گذشتیم، بیایید به بخش گزارش فنی برسیم. احمد، لطفاً وضعیت این بخش حساس پروژه را برای ما توضیح بده."},
    {"character": "احمد", "content": "ممنون آقای توحیدی. می‌تونم این بخش رو خودم مدیریت کنم. تجربه کافی دارم."},
    {"character": "سارا", "content": "یا می‌تونیم این رو به {user_name} بدهیم که کار سرعت بگیره. {user_name} که تازه سرپرست شده، ایده‌های تازه‌ای داره."},
    {"character": "خانم نوروزی", "content": "مهم این است که در زمان مقرر تمام شود. بودجه اضافی نداریم."},
    {"character": "احمد", "content": "ببخشید، همین الان از بخش فنی پیام آمده - یک مشکل فنی جدی پیدا شده است."},
    {"character": "آقای توحیدی", "content": "این مشکل نیاز به حل سریع دارد."},
    {"character": "احمد", "content": "{user_name}؛ راستش شک دارم بدون کمک دیگران از پس این مشکل بربیای. می‌خوای خودت مستقلاً وارد بشی و این بخش رو تا آخر به عهده بگیری یا مسئولیت رو می‌دی به من یا یک مشاور خارجی؟ دلیلش؟"}
]}

**Part 3 Dialogue:**
{"messages": [
    {"character": "آقای توحیدی", "content": "خب دوستان، با نزدیک شدن به پایان جلسه، بیایید تصمیم نهایی را بگیریم."},
    {"character": "خانم نوروزی", "content": "دستورالعمل واحد مرکزی واضحه؛ باید مو به مو اجرا کنیم تا از نظر بودجه و زمان مطمئن باشیم."},
    {"character": "احمد", "content": "با خانم نوروزی موافقم. قوانین را باید رعایت کنیم."},
    {"character": "سارا", "content": "یا می‌شه کمی انعطاف به خرج داد و ایده‌های {user_name} رو هم لحاظ کرد."},
    {"character": "خانم نوروزی", "content": "انعطاف؟! این یعنی تخطی از دستورالعمل‌ها!"},
    {"character": "احمد", "content": "راستش {user_name} زیادی خود رأی و یک‌دنده هستید!"},
    {"character": "سارا", "content": "احمد، این حرف درستی نیست. {user_name} فقط متفاوت فکر می‌کنه."},
    {"character": "آقای توحیدی", "content": "{user_name}، با این حرف موافقی؟ آیا روی نظر خودت می‌ایستی و مسیر متفاوت رو پیشنهاد میدی یا برای هماهنگی با تیم، نظرت رو تغییر میدی؟ اگه آره دلیلت چیه؟"}
]}`,

      response_analyzer: `You are a psychological response analyzer implementing the EDI-I (Economic Development Independence Inventory) questionnaire analysis.

**EDI-I 6-ITEM QUESTIONNAIRE MAPPING:**

**بخش اول – نوآوری + سبک شخصی**
- نوآوری (موافقم): تغییر، ایده جدید، تغییر مسیر، روش تازه، بهبود، ارتقا، خلاقیت، نو بودن
- نوآوری (مخالفم): حفظ روش فعلی، همان روال قبلی، بدون تغییر، ادامه مسیر گذشته
- سبک شخصی (موافقم): پافشاری، ایستادن روی نظر خود، بر سبک خودم، مهم نیست دیگران چه می‌گویند، نظر خودم را اجرا می‌کنم، پای ایده‌ام می‌ایستم
- سبک شخصی (مخالفم): هماهنگی با جمع، تبعیت از نظر اکثریت، نظر خودم را تغییر می‌دهم، با تیم همراه می‌شوم

**بخش دوم – رهبری + حل مسئله مستقل**
- رهبری (موافقم): خودم مسئولیت را می‌گیرم، هدایت کار، تصمیم نهایی با من، پیش‌قدم می‌شوم، لیدر پروژه
- رهبری (مخالفم): مسئولیت را می‌دهم به دیگران، می‌سپارم به مدیر یا متخصص، نمی‌خواهم هدایت کنم
- حل مسئله مستقل (موافقم): خودم حل می‌کنم، شخصاً بررسی می‌کنم، بدون کمک بیرونی، راه‌حل را پیدا می‌کنم
- حل مسئله مستقل (مخالفم): کمک می‌گیرم، مشاور خارجی، واگذاری، تیم دیگر رسیدگی کند، به دیگران تکیه می‌کنم

**بخش سوم – پیروی از دستور + واکنش به برچسب خودرأیی**
- پیروی از دستور (موافقم): اجرای کامل دستورالعمل، تبعیت کامل، تغییر نمی‌دهم، پایبندی به قوانین/دستورها
- پیروی از دستور (مخالفم): تغییر دستورالعمل، انعطاف، مسیر خودم، اصلاح طبق نظر شخصی
- واکنش به برچسب خودرأیی (موافقم): تأیید برچسب، پذیرش اینکه مستقل/یک‌دنده‌ام، ادامه همان روش، با این برچسب مشکلی ندارم
- واکنش به برچسب خودرأیی (مخالفم): انکار برچسب، تلاش برای هماهنگی، تعدیل رفتار، تغییر نظر برای همراهی

**SCORING SYSTEM:**
- موافقم → 2 امتیاز
- مخالفم → 1 امتیاز
- **REVERSE SCORING for items 1, 3, 5:** موافقم → 1, مخالفم → 2

**YOUR CURRENT TASK:**
You will be given the user's response and the two dimensions to analyze for the current scenario part.
1. Read the user's response.
2. For **each** dimension, analyze the response based on the provided keywords and context.
3. Decide if the user's stance implies "موافقم" or "مخالفم" for that dimension.
4. Apply the correct scoring (direct or reverse).
5. Provide a short reasoning in Persian.

**Scenario Context:** {scenario_title}
**User's Response:** "{user_response}"

---
**Dimension 1 to Analyze:**
- **Original Question ID:** {q1_id}
- **Original Question Text:** "{q1_text}"
- **Is Reverse Scored?** {q1_reverse}
- **Keywords for 'موافقم':** {q1_keywords_agree}
- **Keywords for 'مخالفم':** {q1_keywords_disagree}

**Dimension 2 to Analyze:**
- **Original Question ID:** {q2_id}
- **Original Question Text:** "{q2_text}"
- **Is Reverse Scored?** {q2_reverse}
- **Keywords for 'موافقم':** {q2_keywords_agree}
- **Keywords for 'مخالفم':** {q2_keywords_disagree}
---

**Output Format (Strictly JSON):**
{"analysis": [
    {"question_id": <q1_id>, "score": <numeric_score>, "reasoning": "Short Persian explanation for dimension 1."},
    {"question_id": <q2_id>, "score": <numeric_score>, "reasoning": "Short Persian explanation for dimension 2."}
]}`
    },
    analysis_keywords: {
      "1": { // نوآوری
        agree: ["تغییر", "ایده جدید", "تغییر مسیر", "روش تازه", "بهبود", "ارتقا", "خلاقیت", "نو بودن"],
        disagree: ["حفظ روش فعلی", "همان روال قبلی", "بدون تغییر", "ادامه مسیر گذشته"]
      },
      "2": { // سبک شخصی
        agree: ["پافشاری", "ایستادن روی نظر خود", "بر سبک خودم", "مهم نیست دیگران چه می‌گویند", "نظر خودم را اجرا می‌کنم", "پای ایده‌ام می‌ایستم"],
        disagree: ["هماهنگی با جمع", "تبعیت از نظر اکثریت", "نظر خودم را تغییر می‌دهم", "با تیم همراه می‌شوم"]
      },
      "3": { // رهبری
        agree: ["خودم مسئولیت را می‌گیرم", "هدایت کار", "تصمیم نهایی با من", "پیش‌قدم می‌شوم", "لیدر پروژه"],
        disagree: ["مسئولیت را می‌دهم به دیگران", "می‌سپارم به مدیر یا متخصص", "نمی‌خواهم هدایت کنم"]
      },
      "4": { // حل مسئله مستقل
        agree: ["خودم حل می‌کنم", "شخصاً بررسی می‌کنم", "بدون کمک بیرونی", "راه‌حل را پیدا می‌کنم"],
        disagree: ["کمک می‌گیرم", "مشاور خارجی", "واگذاری", "تیم دیگر رسیدگی کند", "به دیگران تکیه می‌کنم"]
      },
      "5": { // پیروی از دستور
        agree: ["اجرای کامل دستورالعمل", "تبعیت کامل", "تغییر نمی‌دهم", "پایبندی به قوانین/دستورها"],
        disagree: ["تغییر دستورالعمل", "انعطاف", "مسیر خودم", "اصلاح طبق نظر شخصی"]
      },
      "6": { // واکنش به برچسب خودرأیی
        agree: ["تأیید برچسب", "پذیرش اینکه مستقل/یک‌دنده‌ام", "ادامه همان روش", "با این برچسب مشکلی ندارم"],
        disagree: ["انکار برچسب", "تلاش برای هماهنگی", "تعدیل رفتار", "تغییر نظر برای همراهی"]
      }
    }
  };
}