(()=>{var e={};e.id=829,e.ids=[829],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},29188:(e,t,s)=>{"use strict";s.r(t),s.d(t,{originalPathname:()=>R,patchFetch:()=>d,requestAsyncStorage:()=>c,routeModule:()=>u,serverHooks:()=>A,staticGenerationAsyncStorage:()=>N});var r={};s.r(r),s.d(r,{GET:()=>T});var a=s(49303),o=s(88716),i=s(60670),n=s(87070),E=s(38990);async function T(){try{let e=await (0,E.M7)();return n.NextResponse.json({status:"ok",timestamp:new Date().toISOString(),database:e?"connected":"disconnected",environment:"production"})}catch(e){return n.NextResponse.json({status:"error",timestamp:new Date().toISOString(),error:e instanceof Error?e.message:"Unknown error"},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/health/route",pathname:"/api/health",filename:"route",bundlePath:"app/api/health/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/health/route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:c,staticGenerationAsyncStorage:N,serverHooks:A}=u,R="/api/health/route";function d(){return(0,i.patchFetch)({serverHooks:A,staticGenerationAsyncStorage:N})}},38990:(e,t,s)=>{"use strict";s.d(t,{M7:()=>n,ZP:()=>T,_3:()=>i,sA:()=>E});var r=s(73785);let a={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},o=r.createPool(a);async function i(e=3,t=1e3){for(let s=0;s<e;s++)try{return await o.getConnection()}catch(r){if(console.warn(`Connection attempt ${s+1} failed:`,r.message),s===e-1)throw r;await new Promise(e=>setTimeout(e,t))}}async function n(){try{let e=await o.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function E(){try{let e=await o.getConnection();return await e.execute(`
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
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let T=o}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[276,240],()=>s(29188));module.exports=r})();