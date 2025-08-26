(()=>{var e={};e.id=120,e.ids=[120],e.modules={62849:e=>{function s(e){var s=Error("Cannot find module '"+e+"'");throw s.code="MODULE_NOT_FOUND",s}s.keys=()=>[],s.resolve=s,s.id=62849,e.exports=s},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},85433:(e,s,t)=>{"use strict";t.r(s),t.d(s,{originalPathname:()=>d,patchFetch:()=>p,requestAsyncStorage:()=>R,routeModule:()=>T,serverHooks:()=>N,staticGenerationAsyncStorage:()=>A});var r={};t.r(r),t.d(r,{GET:()=>c});var a=t(49303),n=t(88716),i=t(60670),o=t(87070),u=t(95456),E=t(38990);async function c(e){try{let s;let t=e.headers.get("authorization"),r=(0,u.oA)(t||void 0);if(!r)return o.NextResponse.json({success:!1,message:"توکن احراز هویت ارائه نشده است"},{status:401});try{s=(0,u.fS)(r)}catch(e){return o.NextResponse.json({success:!1,message:"توکن نامعتبر یا منقضی شده است"},{status:401})}let a=s.userId,n=new URL(e.url).searchParams.get("assessment_id"),i=await (0,E._3)();if(!i)throw Error("Failed to get database connection");try{let e="SELECT * FROM assessments WHERE user_id = ?",s=[a];n&&(e+=" AND id = ?",s.push(n)),e+=" ORDER BY created_at DESC LIMIT 1";let[t]=await i.execute(e,s);if(!Array.isArray(t)||0===t.length)return o.NextResponse.json({success:!1,message:"ارزیابی یافت نشد"},{status:404});let r=t[0],[u]=await i.execute("SELECT * FROM chat_messages WHERE assessment_id = ? ORDER BY created_at ASC",[r.id]);return o.NextResponse.json({success:!0,message:"نتایج ارزیابی با موفقیت دریافت شد",data:{assessment:r,messages:Array.isArray(u)?u:[]}})}finally{i.release()}}catch(e){return console.error("خطا در دریافت نتایج:",e),o.NextResponse.json({success:!1,message:"خطای سرور در دریافت نتایج"},{status:500})}}let T=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/assessment/results/route",pathname:"/api/assessment/results",filename:"route",bundlePath:"app/api/assessment/results/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/assessment/results/route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:R,staticGenerationAsyncStorage:A,serverHooks:N}=T,d="/api/assessment/results/route";function p(){return(0,i.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:A})}},95456:(e,s,t)=>{"use strict";t.d(s,{Gv:()=>c,RA:()=>u,c_:()=>E,fS:()=>R,oA:()=>T});var r=t(41482),a=t.n(r),n=t(42023),i=t.n(n);let o=process.env.JWT_SECRET||"your-super-secret-jwt-key-change-in-production";function u(e,s){let t={userId:e,username:s,iat:Math.floor(Date.now()/1e3)};return a().sign(t,o,{expiresIn:"7d"})}async function E(e){return i().hash(e,12)}async function c(e,s){return i().compare(e,s)}function T(e){return e&&e.startsWith("Bearer ")?e.substring(7):null}function R(e){let s=function(e){try{return a().verify(e,o)}catch(e){return null}}(e);if(!s)throw Error("توکن نامعتبر یا منقضی شده است");return s}},38990:(e,s,t)=>{"use strict";t.d(s,{M7:()=>o,ZP:()=>E,_3:()=>i,sA:()=>u});var r=t(73785);let a={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},n=r.createPool(a);async function i(e=3,s=1e3){for(let t=0;t<e;t++)try{return await n.getConnection()}catch(r){if(console.warn(`Connection attempt ${t+1} failed:`,r.message),t===e-1)throw r;await new Promise(e=>setTimeout(e,s))}}async function o(){try{let e=await n.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function u(){try{let e=await n.getConnection();return await e.execute(`
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
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let E=n}};var s=require("../../../../webpack-runtime.js");s.C(e);var t=e=>s(s.s=e),r=s.X(0,[276,240,482,23],()=>t(85433));module.exports=r})();