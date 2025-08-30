(()=>{var e={};e.id=4243,e.ids=[4243],e.modules={62849:e=>{function t(e){var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=()=>[],t.resolve=t,t.id=62849,e.exports=t},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{"use strict";e.exports=require("buffer")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},98216:e=>{"use strict";e.exports=require("net")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},95346:e=>{"use strict";e.exports=require("timers")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},7978:(e,t,s)=>{"use strict";s.r(t),s.d(t,{originalPathname:()=>A,patchFetch:()=>_,requestAsyncStorage:()=>d,routeModule:()=>T,serverHooks:()=>N,staticGenerationAsyncStorage:()=>R});var r={};s.r(r),s.d(r,{GET:()=>E});var a=s(49303),n=s(88716),i=s(60670),o=s(87070),c=s(38990),u=s(95456);async function E(e){try{let t=e.headers.get("authorization"),s=(0,u.oA)(t);if(!s)return o.NextResponse.json({error:"Authentication required"},{status:401});let r=(0,u.WX)(s);if(!r)return o.NextResponse.json({error:"Invalid or expired token"},{status:401});let[a]=await (0,c.query)("SELECT role FROM users WHERE id = ?",[r.userId]);if(0===a.length||"admin"!==a[0].role)return o.NextResponse.json({error:"Forbidden: Access is restricted to administrators"},{status:403});let n=e.nextUrl.searchParams.get("userId");if(!n)return o.NextResponse.json({error:"userId query parameter is required"},{status:400});let i=(await (0,c.query)(`
      SELECT
        cs.id as session_db_id,
        cs.assessment_type,
        cs.session_id as session_uuid,
        cs.created_at as session_created_at,
        cm.sender_type,
        cm.sender_name,
        cm.message,
        cm.created_at as message_created_at
      FROM chat_sessions cs
      JOIN chat_messages cm ON cs.id = cm.session_id
      WHERE cs.user_id = ?
      ORDER BY cs.created_at DESC, cm.created_at ASC;
    `,[n])).reduce((e,t)=>{let{session_uuid:s,assessment_type:r,session_created_at:a,...n}=t;return e[s]||(e[s]={assessment_type:r,created_at:a,messages:[]}),e[s].messages.push({sender_type:n.sender_type,sender_name:n.sender_name,message:n.message,created_at:n.message_created_at}),e},{});return o.NextResponse.json({success:!0,data:i},{status:200})}catch(e){return console.error("[API_ADMIN_CHATS_ERROR]",e),o.NextResponse.json({error:"Internal Server Error",details:e.message},{status:500})}}let T=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/admin/chats/route",pathname:"/api/admin/chats",filename:"route",bundlePath:"app/api/admin/chats/route"},resolvedPagePath:"/root/hrbooteh/src/app/api/admin/chats/route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:R,serverHooks:N}=T,A="/api/admin/chats/route";function _(){return(0,i.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:R})}},95456:(e,t,s)=>{"use strict";s.d(t,{Gv:()=>T,RA:()=>c,WX:()=>u,c_:()=>E,fS:()=>R,oA:()=>d});var r=s(41482),a=s.n(r),n=s(42023),i=s.n(n);let o=process.env.JWT_SECRET||"your-super-secret-jwt-key-change-in-production";function c(e,t){let s={userId:e,username:t,iat:Math.floor(Date.now()/1e3)};return a().sign(s,o,{expiresIn:"7d"})}function u(e){try{return a().verify(e,o)}catch(e){return null}}async function E(e){return i().hash(e,12)}async function T(e,t){return i().compare(e,t)}function d(e){return e&&e.startsWith("Bearer ")?e.substring(7):null}function R(e){let t=u(e);if(!t)throw Error("توکن نامعتبر یا منقضی شده است");return t}},38990:(e,t,s)=>{"use strict";s.d(t,{M7:()=>o,ZP:()=>u,_3:()=>i,sA:()=>c});var r=s(73785);let a={host:process.env.DB_HOST||"localhost",user:process.env.DB_USER||"root",password:process.env.DB_PASSWORD||"",database:process.env.DB_NAME||"arta_persia_db",port:parseInt(process.env.DB_PORT||"3306"),waitForConnections:!0,connectionLimit:10,queueLimit:0,timeout:6e4,charset:"utf8mb4"},n=r.createPool(a);async function i(e=3,t=1e3){for(let s=0;s<e;s++)try{return await n.getConnection()}catch(r){if(console.warn(`Connection attempt ${s+1} failed:`,r.message),s===e-1)throw r;await new Promise(e=>setTimeout(e,t))}}async function o(){try{let e=await n.getConnection();return console.log("✅ اتصال به دیتابیس MySQL برقرار شد"),e.release(),!0}catch(e){return console.error("❌ خطا در اتصال به دیتابیس:",e),!1}}async function c(){try{let e=await n.getConnection();return await e.execute(`
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
    `),console.log("✅ جداول دیتابیس با موفقیت ایجاد شدند"),e.release(),!0}catch(e){return console.error("❌ خطا در ایجاد جداول:",e),!1}}let u=n}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[9276,7240,1482,2023],()=>s(7978));module.exports=r})();