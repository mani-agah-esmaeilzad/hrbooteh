(()=>{var e={};e.id=2628,e.ids=[2628],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},11871:(e,t,r)=>{"use strict";r.r(t),r.d(t,{originalPathname:()=>d,patchFetch:()=>p,requestAsyncStorage:()=>R,routeModule:()=>c,serverHooks:()=>N,staticGenerationAsyncStorage:()=>A});var s={};r.r(s),r.d(s,{GET:()=>T});var a=r(49303),n=r(88716),i=r(60670),o=r(87070),u=r(38990),E=r(95456);async function T(e){try{let t=e.headers.get("authorization"),r=(0,E.oA)(t);if(!r)return o.NextResponse.json({error:"Authentication required"},{status:401});let s=(0,E.WX)(r);if(!s)return o.NextResponse.json({error:"Invalid or expired token"},{status:401});let[a]=await (0,u.query)("SELECT role FROM users WHERE id = ?",[s.userId]);if(0===a.length||"admin"!==a[0].role)return o.NextResponse.json({error:"Forbidden: Access is restricted to administrators"},{status:403});let n=await (0,u.query)("SELECT id, username, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC");return o.NextResponse.json({success:!0,data:n},{status:200})}catch(e){return console.error("[API_ADMIN_USERS_ERROR]",e),o.NextResponse.json({error:"Internal Server Error",details:e.message},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/admin/users/route",pathname:"/api/admin/users",filename:"route",bundlePath:"app/api/admin/users/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/admin/users/route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:R,staticGenerationAsyncStorage:A,serverHooks:N}=c,d="/api/admin/users/route";function p(){return(0,i.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:A})}},95456:(e,t,r)=>{"use strict";r.d(t,{Gv:()=>c,RA:()=>u,WX:()=>E,c_:()=>T,fS:()=>A,oA:()=>R});var s=r(41482),a=r.n(s),n=r(42023),i=r.n(n);let o=process.env.JWT_SECRET||"your-super-secret-jwt-key-change-in-production";function u(e,t){let r={userId:e,username:t,iat:Math.floor(Date.now()/1e3)};return a().sign(r,o,{expiresIn:"7d"})}function E(e){try{return a().verify(e,o)}catch(e){return null}}async function T(e){return i().hash(e,12)}async function c(e,t){return i().compare(e,t)}function R(e){return e&&e.startsWith("Bearer ")?e.substring(7):null}function A(e){let t=E(e);if(!t)throw Error("توکن نامعتبر یا منقضی شده است");return t}},38990:(e,t,r)=>{"use strict";r.d(t,{M7:()=>o,ZP:()=>E,_3:()=>i,sA:()=>u});var s=r(73785);let a={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},n=s.createPool(a);async function i(e=3,t=1e3){for(let r=0;r<e;r++)try{return await n.getConnection()}catch(s){if(console.warn(`Connection attempt ${r+1} failed:`,s.message),r===e-1)throw s;await new Promise(e=>setTimeout(e,t))}}async function o(){try{let e=await n.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function u(){try{let e=await n.getConnection();return await e.execute(`
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
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let E=n}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[9276,7240,1482,2023],()=>r(11871));module.exports=s})();