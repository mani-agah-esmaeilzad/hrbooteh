(()=>{var e={};e.id=2,e.ids=[2],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},64706:(e,t,s)=>{"use strict";s.r(t),s.d(t,{originalPathname:()=>R,patchFetch:()=>d,requestAsyncStorage:()=>A,routeModule:()=>l,serverHooks:()=>p,staticGenerationAsyncStorage:()=>N});var r={};s.r(r),s.d(r,{POST:()=>T});var a=s(49303),n=s(88716),i=s(60670),o=s(87070),u=s(84235),c=s(95456),E=s(38990);async function T(e){try{let t=await e.json(),s=u.gY.safeParse(t);if(!s.success)return o.NextResponse.json({success:!1,message:"داده‌های ورودی نامعتبر است",error:s.error.errors[0]?.message},{status:400});let{username:r,email:a,password:n,first_name:i,last_name:T,phone_number:l,age:A,education_level:N,work_experience:p}=s.data,R=await (0,c.c_)(n),d=await E.ZP.getConnection();try{let[e]=await d.execute("SELECT id FROM users WHERE username = ? OR email = ?",[r,a]);if(Array.isArray(e)&&e.length>0)return o.NextResponse.json({success:!1,message:"نام کاربری یا ایمیل قبلاً استفاده شده است"},{status:409});let[t]=await d.execute(`INSERT INTO users (
          username, email, password_hash, first_name, last_name, 
          phone_number, age, education_level, work_experience
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,[r,a,R,i,T,l||null,A&&parseInt(A)||null,N||null,p||null]),s=t.insertId,[n]=await d.execute("SELECT id, username, email, first_name, last_name, phone_number, age, education_level, work_experience, created_at FROM users WHERE id = ?",[s]);if(Array.isArray(n)&&n.length>0){let e=n[0];return o.NextResponse.json({success:!0,message:"حساب کاربری با موفقیت ایجاد شد",data:{user:e}},{status:201})}throw Error("خطا در ایجاد کاربر")}finally{d.release()}}catch(e){return console.error("خطا در ثبت‌نام:",e),o.NextResponse.json({success:!1,message:"خطای سرور. لطفاً دوباره تلاش کنید"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/auth/register/route",pathname:"/api/auth/register",filename:"route",bundlePath:"app/api/auth/register/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/auth/register/route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:A,staticGenerationAsyncStorage:N,serverHooks:p}=l,R="/api/auth/register/route";function d(){return(0,i.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:N})}},95456:(e,t,s)=>{"use strict";s.d(t,{Gv:()=>E,RA:()=>u,c_:()=>c,fS:()=>l,oA:()=>T});var r=s(41482),a=s.n(r),n=s(42023),i=s.n(n);let o=process.env.JWT_SECRET||"your-super-secret-jwt-key-change-in-production";function u(e,t){let s={userId:e,username:t,iat:Math.floor(Date.now()/1e3)};return a().sign(s,o,{expiresIn:"7d"})}async function c(e){return i().hash(e,12)}async function E(e,t){return i().compare(e,t)}function T(e){return e&&e.startsWith("Bearer ")?e.substring(7):null}function l(e){let t=function(e){try{return a().verify(e,o)}catch(e){return null}}(e);if(!t)throw Error("توکن نامعتبر یا منقضی شده است");return t}},38990:(e,t,s)=>{"use strict";s.d(t,{M7:()=>o,ZP:()=>c,_3:()=>i,sA:()=>u});var r=s(73785);let a={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},n=r.createPool(a);async function i(e=3,t=1e3){for(let s=0;s<e;s++)try{return await n.getConnection()}catch(r){if(console.warn(`Connection attempt ${s+1} failed:`,r.message),s===e-1)throw r;await new Promise(e=>setTimeout(e,t))}}async function o(){try{let e=await n.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function u(){try{let e=await n.getConnection();return await e.execute(`
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
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let c=n},84235:(e,t,s)=>{"use strict";s.d(t,{$G:()=>i,dm:()=>a,gY:()=>n});var r=s(7410);let a=r.z.object({username:r.z.string().min(3,"نام کاربری باید حداقل ۳ کاراکتر باشد"),password:r.z.string().min(6,"رمز عبور باید حداقل ۶ کاراکتر باشد")}),n=r.z.object({username:r.z.string().min(3,"نام کاربری باید حداقل ۳ کاراکتر باشد"),email:r.z.string().email("ایمیل معتبر نیست"),password:r.z.string().min(6,"رمز عبور باید حداقل ۶ کاراکتر باشد"),password_confirmation:r.z.string(),first_name:r.z.string().min(2,"نام باید حداقل ۲ کاراکتر باشد"),last_name:r.z.string().min(2,"نام خانوادگی باید حداقل ۲ کاراکتر باشد"),phone_number:r.z.string().optional().nullable(),age:r.z.string().optional().nullable().or(r.z.number().min(1).max(120).optional().nullable()),education_level:r.z.string().optional().nullable(),work_experience:r.z.string().optional().nullable()}).refine(e=>e.password===e.password_confirmation,{message:"رمزهای عبور یکسان نیستند",path:["password_confirmation"]}),i=r.z.object({message:r.z.string().min(1,"پیام نمی‌تواند خالی باشد"),session_id:r.z.string().min(1,"شناسه جلسه معتبر نیست")});r.z.object({success:r.z.boolean(),message:r.z.string(),data:r.z.any().optional(),error:r.z.string().optional()})}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[276,240,482,23,410],()=>s(64706));module.exports=r})();