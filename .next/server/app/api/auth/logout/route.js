(()=>{var e={};e.id=716,e.ids=[716],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},76638:(e,t,s)=>{"use strict";s.r(t),s.d(t,{originalPathname:()=>p,patchFetch:()=>d,requestAsyncStorage:()=>N,routeModule:()=>c,serverHooks:()=>R,staticGenerationAsyncStorage:()=>A});var r={};s.r(r),s.d(r,{POST:()=>T});var a=s(49303),o=s(88716),n=s(60670),i=s(87070),u=s(95456),E=s(38990);async function T(e){try{let t=e.headers.get("authorization"),s=(0,u.oA)(t);if(!s)return i.NextResponse.json({success:!1,message:"توکن احراز هویت ارائه نشده است"},{status:401});try{(0,u.fS)(s)}catch(e){return i.NextResponse.json({success:!1,message:"توکن نامعتبر یا منقضی شده است"},{status:401})}let r=await E.ZP.getConnection();try{return await r.execute("DELETE FROM auth_tokens WHERE token = ?",[s]),i.NextResponse.json({success:!0,message:"خروج موفقیت‌آمیز بود"})}finally{r.release()}}catch(e){return console.error("خطا در خروج:",e),i.NextResponse.json({success:!1,message:"خطای سرور. لطفاً دوباره تلاش کنید"},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/auth/logout/route",pathname:"/api/auth/logout",filename:"route",bundlePath:"app/api/auth/logout/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/auth/logout/route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:N,staticGenerationAsyncStorage:A,serverHooks:R}=c,p="/api/auth/logout/route";function d(){return(0,n.patchFetch)({serverHooks:R,staticGenerationAsyncStorage:A})}},95456:(e,t,s)=>{"use strict";s.d(t,{Gv:()=>T,RA:()=>u,c_:()=>E,fS:()=>N,oA:()=>c});var r=s(41482),a=s.n(r),o=s(42023),n=s.n(o);let i=process.env.JWT_SECRET||"your-super-secret-jwt-key-change-in-production";function u(e,t){let s={userId:e,username:t,iat:Math.floor(Date.now()/1e3)};return a().sign(s,i,{expiresIn:"7d"})}async function E(e){return n().hash(e,12)}async function T(e,t){return n().compare(e,t)}function c(e){return e&&e.startsWith("Bearer ")?e.substring(7):null}function N(e){let t=function(e){try{return a().verify(e,i)}catch(e){return null}}(e);if(!t)throw Error("توکن نامعتبر یا منقضی شده است");return t}},38990:(e,t,s)=>{"use strict";s.d(t,{M7:()=>i,ZP:()=>E,_3:()=>n,sA:()=>u});var r=s(73785);let a={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},o=r.createPool(a);async function n(e=3,t=1e3){for(let s=0;s<e;s++)try{return await o.getConnection()}catch(r){if(console.warn(`Connection attempt ${s+1} failed:`,r.message),s===e-1)throw r;await new Promise(e=>setTimeout(e,t))}}async function i(){try{let e=await o.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function u(){try{let e=await o.getConnection();return await e.execute(`
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
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let E=o}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[276,240,482,23],()=>s(76638));module.exports=r})();