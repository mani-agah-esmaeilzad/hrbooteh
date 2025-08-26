(()=>{var e={};e.id=11,e.ids=[11],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},36165:(e,t,s)=>{"use strict";s.r(t),s.d(t,{originalPathname:()=>l,patchFetch:()=>A,requestAsyncStorage:()=>d,routeModule:()=>m,serverHooks:()=>N,staticGenerationAsyncStorage:()=>p});var a={};s.r(a),s.d(a,{POST:()=>T});var r=s(49303),i=s(88716),n=s(60670),o=s(87070),_=s(41482),c=s.n(_),u=s(74462),E=s(38990);async function T(e){try{let t;let s=e.headers.get("authorization");if(!s||!s.startsWith("Bearer "))return o.NextResponse.json({success:!1,message:"توکن احراز هویت یافت نشد"},{status:401});let a=s.substring(7);try{t=c().verify(a,process.env.JWT_SECRET).userId}catch(e){return o.NextResponse.json({success:!1,message:"توکن نامعتبر است"},{status:401})}let r=await (0,E._3)();if(!r)throw Error("Failed to get database connection");try{let[e]=await r.execute("SELECT first_name, last_name FROM users WHERE id = ?",[t]),s=Array.isArray(e)&&e.length>0?e[0]:null,a=s?`${s.first_name} ${s.last_name}`.trim():"کاربر",i=(0,u.p)(),n=`mbti_${t}_${Date.now()}_${Math.random().toString(36).substring(2,15)}`;i.scenario_parts[0];let[_]=await r.execute("INSERT INTO assessments (user_id, questionnaire_id, score, max_score) VALUES (?, ?, ?, ?)",[t,2,0,i.scoring_rules.max_score]),c=_.insertId;await r.execute("INSERT INTO assessment_states (session_id, state_data, created_at) VALUES (?, ?, NOW())",[n,JSON.stringify({type:"mbti_scenario",score:0,current_part:0,answers:{},history:[],mbti_scores:{E_I:0,S_N:0,T_F:0,P_J:0}})]);let E=(0,u.p)().scenario_parts[0],T=[],m=E.systemMessage.replace(/{user_name}/g,a),d={assessment_id:c,message_type:"system",content:m,character:"System",created_at:new Date};await r.execute("INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)",[d.assessment_id,t,d.message_type,d.content,d.character,d.created_at]),T.push({type:d.message_type,content:d.content,character:d.character,timestamp:d.created_at});let p={assessment_id:c,message_type:"system",content:E.question,character:"System",created_at:new Date};return await r.execute("INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)",[p.assessment_id,t,p.message_type,p.content,p.character,p.created_at]),T.push({type:p.message_type,content:p.content,character:p.character,timestamp:p.created_at}),o.NextResponse.json({success:!0,message:"آزمون شخصیت MBTI شروع شد",data:{type:"ai_turn",messages:T,session_id:n,current_score:0,assessment_id:c,current_part:0}})}finally{r.release()}}catch(e){return console.error("خطا در شروع آزمون MBTI:",e),o.NextResponse.json({success:!1,message:"خطای سرور. لطفاً دوباره تلاش کنید"},{status:500})}}let m=new r.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/assessment/start-mbti/route",pathname:"/api/assessment/start-mbti",filename:"route",bundlePath:"app/api/assessment/start-mbti/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/assessment/start-mbti/route.ts",nextConfigOutput:"standalone",userland:a}),{requestAsyncStorage:d,staticGenerationAsyncStorage:p,serverHooks:N}=m,l="/api/assessment/start-mbti/route";function A(){return(0,n.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:p})}},38990:(e,t,s)=>{"use strict";s.d(t,{M7:()=>o,ZP:()=>c,_3:()=>n,sA:()=>_});var a=s(73785);let r={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},i=a.createPool(r);async function n(e=3,t=1e3){for(let s=0;s<e;s++)try{return await i.getConnection()}catch(a){if(console.warn(`Connection attempt ${s+1} failed:`,a.message),s===e-1)throw a;await new Promise(e=>setTimeout(e,t))}}async function o(){try{let e=await i.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function _(){try{let e=await i.getConnection();return await e.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone_number VARCHAR(20),
        age INT,
        education_level VARCHAR(100),
        work_experience VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `),await e.execute(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `),await e.execute(`
      DROP TABLE IF EXISTS chat_messages
    `),await e.execute(`
      DROP TABLE IF EXISTS assessment_states
    `),await e.execute(`
      DROP TABLE IF EXISTS assessments
    `),await e.execute(`
      CREATE TABLE assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        questionnaire_id INT NOT NULL,
        score INT,
        max_score INT DEFAULT 100,
        level VARCHAR(50),
        description TEXT,
        analysis_result JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `),await e.execute(`
      CREATE TABLE chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        user_id INT NOT NULL,
        message_type ENUM('user', 'ai1', 'ai2', 'system') NOT NULL,
        content TEXT NOT NULL,
        character_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `),await e.execute(`
      CREATE TABLE IF NOT EXISTS assessment_states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        state_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let c=i},74462:(e,t,s)=>{"use strict";s.d(t,{p:()=>a});let a=()=>({questionnaire_id:2,title:"آزمون شخصیت MBTI",description:"تست شخصیت‌شناسی مایرز-بریگز برای شناخت نوع شخصیت شما",scenario_parts:[{id:"mbti_part1_social_energy",title:"انرژی اجتماعی",systemMessage:"سلام {user_name}، برای شناخت بهتر شخصیت شما، سؤالاتی درباره ترجیحات شما خواهم پرسید. لطفاً به صورت کامل و صادقانه پاسخ دهید.",question:"در محیط کاری، آیا بیشتر انرژی خود را از تعامل با دیگران می‌گیرید یا از کار انفرادی و تمرکز روی وظایف؟ دلیل خود را شرح دهید و مثالی از تجربه‌تان بزنید.",dimensions_to_analyze:["E_I"]},{id:"mbti_part2_social_interaction",title:"تعامل اجتماعی",systemMessage:"درباره نحوه تعامل شما با دیگران می‌پرسم.",question:"در جلسات کاری یا اجتماعی، آیا ترجیح می‌دهید فعالانه در بحث شرکت کنید و نظراتتان را بیان کنید، یا بیشتر گوش می‌دهید و قبل از صحبت فکر می‌کنید؟ چرا؟",dimensions_to_analyze:["E_I"]},{id:"mbti_part3_recharge_method",title:"روش شارژ انرژی",systemMessage:"حالا درباره نحوه بازیابی انرژی‌تان می‌پرسم.",question:"پس از یک روز پرتنش، برای بازیابی انرژی بیشتر ترجیح می‌دهید با دوستان وقت بگذرانید یا تنها باشید؟ توضیح دهید که چه کارهایی انرژی‌تان را برمی‌گرداند.",dimensions_to_analyze:["E_I"]},{id:"mbti_part4_information_focus",title:"تمرکز بر اطلاعات",systemMessage:"حالا درباره نحوه پردازش اطلاعات شما می‌پرسم.",question:"هنگام یادگیری چیز جدید، بیشتر به جزئیات عملی و مراحل مشخص توجه می‌کنید یا به تصویر کلی و امکانات آن؟ مثالی از نحوه یادگیری‌تان بزنید.",dimensions_to_analyze:["S_N"]},{id:"mbti_part5_problem_approach",title:"رویکرد به مسائل",systemMessage:"درباره نحوه برخورد شما با مسائل می‌پرسم.",question:"وقتی با مشکلی مواجه می‌شوید، بیشتر از تجربیات گذشته و راه‌حل‌های آزمایش‌شده استفاده می‌کنید یا به دنبال روش‌های نوآورانه و خلاقانه هستید؟ مثال بزنید.",dimensions_to_analyze:["S_N"]},{id:"mbti_part6_future_planning",title:"برنامه‌ریزی آینده",systemMessage:"درباره نگاه شما به آینده می‌پرسم.",question:"در برنامه‌ریزی برای آینده، بیشتر روی اهداف مشخص و قابل دستیابی تمرکز می‌کنید یا روی رؤیاها و امکانات بزرگ؟ چگونه آینده‌تان را تصور می‌کنید؟",dimensions_to_analyze:["S_N"]},{id:"mbti_part7_decision_criteria",title:"معیارهای تصمیم‌گیری",systemMessage:"حالا درباره نحوه تصمیم‌گیری شما می‌پرسم.",question:"وقتی باید تصمیم مهمی بگیرید، بیشتر بر اساس تحلیل منطقی و داده‌ها عمل می‌کنید یا احساسات و تأثیر روی دیگران را در نظر می‌گیرید؟ مثالی از تصمیم مهم‌تان بزنید.",dimensions_to_analyze:["T_F"]},{id:"mbti_part8_conflict_resolution",title:"حل تعارض",systemMessage:"درباره نحوه برخورد شما با تعارضات می‌پرسم.",question:"در مواجهه با اختلاف نظر یا تعارض، بیشتر تلاش می‌کنید حقیقت را پیدا کنید و عادلانه قضاوت کنید، یا روابط را حفظ کنید و همه راضی باشند؟ چرا؟",dimensions_to_analyze:["T_F"]},{id:"mbti_part9_feedback_style",title:"سبک بازخورد",systemMessage:"درباره نحوه ارائه بازخورد شما می‌پرسم.",question:"وقتی باید به کسی بازخورد بدهید، بیشتر مستقیم و صریح صحبت می‌کنید یا سعی می‌کنید ملایم و با در نظر گیری احساسات طرف مقابل باشید؟ توضیح دهید.",dimensions_to_analyze:["T_F"]},{id:"mbti_part10_organization_style",title:"سبک سازماندهی",systemMessage:"درباره سبک کاری و زندگی شما می‌پرسم.",question:"آیا ترجیح می‌دهید برنامه‌ریزی دقیق داشته باشید و طبق آن عمل کنید، یا انعطاف‌پذیر باشید و با شرایط تطبیق پیدا کنید؟ محیط کار یا زندگی‌تان چگونه سازماندهی شده؟",dimensions_to_analyze:["P_J"]},{id:"mbti_part11_deadline_approach",title:"رویکرد به ضرب‌الاجل",systemMessage:"درباره نحوه کار شما با ضرب‌الاجل‌ها می‌پرسم.",question:"وقتی پروژه‌ای با ضرب‌الاجل دارید، معمولاً از ابتدا شروع می‌کنید و مرحله به مرحله پیش می‌روید، یا تا آخرین لحظه صبر می‌کنید و با فشار کار می‌کنید؟ چرا؟",dimensions_to_analyze:["P_J"]},{id:"mbti_part12_change_adaptation",title:"سازگاری با تغییر",systemMessage:"سؤال آخر درباره نحوه برخورد شما با تغییرات است.",question:"وقتی برنامه‌هایتان ناگهان تغییر می‌کند، چه احساسی دارید و چگونه واکنش نشان می‌دهید؟ آیا تغییرات غیرمنتظره را فرصت می‌بینید یا مشکل؟ مثال بزنید.",dimensions_to_analyze:["P_J"]}],scoring_rules:{max_score:16,dimensions:[{name:"E_I",description:"برون‌گرایی در مقابل درون‌گرایی",range:"E (-4) تا I (+4)"},{name:"S_N",description:"حسی در مقابل شهودی",range:"S (-4) تا N (+4)"},{name:"T_F",description:"تفکری در مقابل احساسی",range:"T (-4) تا F (+4)"},{name:"P_J",description:"ادراکی در مقابل قضاوتی",range:"P (-4) تا J (+4)"}]}})}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[276,240,482],()=>s(36165));module.exports=a})();