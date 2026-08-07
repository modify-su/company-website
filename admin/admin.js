'use strict';
/* ============================================================
   NexGen Admin Panel — admin.js
   All sections: Dashboard, Logo, Hero, About, Services,
   Categories, Portfolio, Team, Testimonials, Columns, Contact
   ============================================================ */

const STORAGE_KEY = 'nxg_site_data';
let modalSaveCallback = null;
let confirmCallback = null;
let toastTimer = null;
let tempLogoImage = null;
let tempPortfolioImage = null;
let tempTeamImage = null;
let tempAboutImage = null;

// --- IndexedDB Media Storage for Large Video Files (No 5MB quota limit) ---
const MEDIA_DB_NAME = 'AwarinSiteMediaDB';
const MEDIA_DB_STORE = 'videos';

function openMediaDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MEDIA_DB_NAME, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if(!db.objectStoreNames.contains(MEDIA_DB_STORE)) {
        db.createObjectStore(MEDIA_DB_STORE);
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

async function saveVideoBlob(key, blob) {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_DB_STORE, 'readwrite');
      const store = tx.objectStore(MEDIA_DB_STORE);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve(true);
      req.onerror = e => reject(e.target.error);
    });
  } catch(e) { console.error('IndexedDB Save Error:', e); }
}

async function getVideoBlob(key) {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_DB_STORE, 'readonly');
      const store = tx.objectStore(MEDIA_DB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = e => reject(e.target.error);
    });
  } catch(e) { return null; }
}

/* ============================================================
   DEFAULT DATA
   ============================================================ */
const DEFAULT_DATA = {
  logo:{ text:'AWARIN ING', accent:'.', image:null },
  hero:{
    badge:'นวัตกรรมเพื่ออนาคต',
    title1:'สร้างอนาคต', title2:'ทางการเกษตร และอาหารสัตว์', title3:'ไปกับเรา',
    subtitle:'เราคือพาร์ทเนอร์ด้านเทคโนโลยีที่ไว้ใจได้ พัฒนาซอฟต์แวร์ วางกลยุทธ์ดิจิทัล\nและสร้างโซลูชันที่ขับเคลื่อนธุรกิจของคุณสู่ความสำเร็จ',
    cta1:'ข่าวสาร และผลงาน', cta2:'ดูผลงาน',
    stats:[
      {num:150,unit:'+',label:'ลูกค้า'},{num:300,unit:'+',label:'โปรเจค'},
      {num:8,unit:'+',label:'ปีประสบการณ์'},{num:99,unit:'%',label:'ความพึงพอใจ'}
    ]
  },
  about:{
    title:'เราคือผู้สร้างนวัตกรรมดิจิทัล ทางการเกษตร และอาหารสัตว์',
    desc:'NexGen Solutions ก่อตั้งขึ้นในปี 2016 ด้วยพันธกิจในการช่วยให้ธุรกิจไทยและภูมิภาค สามารถแข่งขันในยุคดิจิทัลได้อย่างมั่นใจ เราผสมผสานความเชี่ยวชาญด้านเทคโนโลยี กับความเข้าใจธุรกิจอย่างลึกซึ้ง',
    award:'Best Tech Startup 2024', card2Title:'ให้บริการทั่วไทย', countries:'77', regionUnit:'จังหวัด', customUnit:'',
    textAlign:'center',
    layout:'horizontal',
    containerWidth:'standard',
    fontSize:'normal',
    colRatio:'img-wide',
    features:[
      {title:'ทีมผู้เชี่ยวชาญระดับโลก',desc:'นักพัฒนาและนักออกแบบที่มีประสบการณ์จากบริษัทชั้นนำ'},
      {title:'กระบวนการที่โปร่งใส',desc:'ติดตามความคืบหน้าของโปรเจคได้แบบ Real-time ตลอดเวลา'},
      {title:'ส่งงานตรงเวลา',desc:'ไม่มีค่าใช้จ่ายซ่อนเร้น และส่งมอบงานตามกำหนดการ'}
    ],
    image:null
  },
  categories:[
    {id:'cat_all',name:'ทั้งหมด',value:'all'},
    {id:'cat_web',name:'เว็บไซต์',value:'web'},
    {id:'cat_app',name:'แอปมือถือ',value:'app'},
    {id:'cat_ai',name:'AI',value:'ai'}
  ],
  services:[
    {id:'s1',icon:'🖥️',color:'#7c3aed',title:'พัฒนาเว็บไซต์',desc:'ออกแบบและพัฒนาเว็บไซต์ที่สวยงาม รวดเร็ว และใช้งานง่าย ด้วยเทคโนโลยีสมัยใหม่',features:['Landing Page / Corporate Website','E-Commerce Platform','Web Application'],featured:false},
    {id:'s2',icon:'📱',color:'#3b82f6',title:'แอปพลิเคชันมือถือ',desc:'พัฒนาแอปบน iOS และ Android ที่มอบประสบการณ์ผู้ใช้ที่ยอดเยี่ยมและน่าประทับใจ',features:['iOS & Android Native','Cross-Platform (Flutter/React Native)','UI/UX Design'],featured:true},
    {id:'s3',icon:'☁️',color:'#10b981',title:'Cloud & DevOps',desc:'บริหารจัดการโครงสร้างพื้นฐานบนคลาวด์ให้ระบบมีความเสถียรและพร้อมรองรับการเติบโต',features:['AWS / Google Cloud / Azure','CI/CD Pipeline','Microservices Architecture'],featured:false},
    {id:'s4',icon:'🤖',color:'#f59e0b',title:'AI & Machine Learning',desc:'นำ AI มาช่วยยกระดับธุรกิจ ตั้งแต่ Chatbot อัจฉริยะไปจนถึงการวิเคราะห์ข้อมูลเชิงลึก',features:['AI Chatbot & Virtual Assistant','Predictive Analytics','Computer Vision'],featured:false},
    {id:'s5',icon:'📊',color:'#ec4899',title:'Digital Marketing',desc:'วางกลยุทธ์การตลาดดิจิทัลที่ขับเคลื่อนด้วยข้อมูล เพิ่ม Traffic และ Conversion ได้จริง',features:['SEO & SEM','Social Media Marketing','Content Strategy'],featured:false},
    {id:'s6',icon:'🔒',color:'#06b6d4',title:'Cybersecurity',desc:'ปกป้องธุรกิจจากภัยคุกคามไซเบอร์ด้วยระบบรักษาความปลอดภัยระดับองค์กร',features:['Security Audit & Penetration Testing','Data Encryption','Compliance & Governance'],featured:false}
  ],
  portfolio:[
    {id:'p1',title:'E-Commerce Platform',tech:'React · Node.js · MongoDB',category:'web',gradStart:'#667eea',gradEnd:'#764ba2',icon:'🛒',image:null,large:false},
    {id:'p2',title:'Food Delivery App',tech:'Flutter · Firebase · Google Maps',category:'app',gradStart:'#f093fb',gradEnd:'#f5576c',icon:'🍔',image:null,large:false},
    {id:'p3',title:'AI Analytics Dashboard',tech:'Python · TensorFlow · React',category:'ai',gradStart:'#4facfe',gradEnd:'#00f2fe',icon:'🤖',image:null,large:true},
    {id:'p4',title:'Healthcare Portal',tech:'Vue.js · Laravel · MySQL',category:'web',gradStart:'#43e97b',gradEnd:'#38f9d7',icon:'🏥',image:null,large:false},
    {id:'p5',title:'Finance Mobile App',tech:'React Native · Node.js · PostgreSQL',category:'app',gradStart:'#fa709a',gradEnd:'#fee140',icon:'💰',image:null,large:false}
  ],
  team:[
    {id:'t1',name:'สมชาย วิภาวดี',role:'CEO & Co-Founder',bio:'อดีต CTO จาก SCB TechX ผู้มีประสบการณ์ด้าน FinTech กว่า 15 ปี',avatar:'ส',gradStart:'#667eea',gradEnd:'#764ba2',image:null},
    {id:'t2',name:'นภาพร รักษ์สุข',role:'CTO & Lead Developer',bio:'Full Stack Developer ที่มีความเชี่ยวชาญด้าน Cloud Architecture และ AI',avatar:'น',gradStart:'#f093fb',gradEnd:'#f5576c',image:null},
    {id:'t3',name:'กมลวรรณ สุทธิพงษ์',role:'Head of Design',bio:'UX/UI Designer ที่ได้รับรางวัลระดับ Asia ด้านการออกแบบประสบการณ์ผู้ใช้',avatar:'ก',gradStart:'#4facfe',gradEnd:'#00f2fe',image:null},
    {id:'t4',name:'วิชาญ เดชเดชา',role:'Head of Marketing',bio:'Digital Marketing Strategist ที่เคยช่วยแบรนด์กว่า 50 รายเพิ่ม ROI ได้มากกว่า 300%',avatar:'ว',gradStart:'#43e97b',gradEnd:'#38f9d7',image:null}
  ],
  testimonials:[
    {id:'tm1',text:'NexGen Solutions เปลี่ยนธุรกิจของเราไปอย่างสิ้นเชิง แอปที่พวกเขาพัฒนาทำให้ยอดขายเพิ่มขึ้น 200% ภายใน 6 เดือน',author:'พัชรินทร์ สมิทธ์',position:'CEO, FreshMart Thailand',rating:5,initial:'P',gradStart:'#667eea',gradEnd:'#764ba2'},
    {id:'tm2',text:'ทีมงานมืออาชีพ เข้าใจความต้องการ ส่งงานตรงเวลา และคุณภาพเกินความคาดหมาย จะกลับมาใช้บริการอีกแน่นอน',author:'ธนพล วงศ์สกุล',position:'Director, TrueMove H Partner',rating:5,initial:'ธ',gradStart:'#4facfe',gradEnd:'#00f2fe'},
    {id:'tm3',text:'AI System ที่ NexGen ออกแบบให้ช่วยลดต้นทุนการดำเนินงานได้ถึง 40% ผลลัพธ์เกินความคาดหมายมาก',author:'อรุณรัตน์ ชมพูนุท',position:'COO, MediCare Plus',rating:5,initial:'อ',gradStart:'#43e97b',gradEnd:'#38f9d7'}
  ],
  columns:[],
  contact:{
    address:'388 อาคาร Exchange Tower ชั้น 20\nถนนสุขุมวิท แขวงคลองเตย\nกรุงเทพมหานคร 10110',
    phone:'02-123-4567\n082-345-6789',
    email:'hello@nexgensolutions.co.th\nsupport@nexgensolutions.co.th',
    hours:'จันทร์ – ศุกร์: 9:00 – 18:00 น.\nเสาร์: 9:00 – 13:00 น.'
  },
  slider:[
    {
      id:'sl1',
      badge:'⚡ Highlight Solution',
      title:'โซลูชันระบบ AI & Cloud สำหรับองค์กร',
      desc:'ยกระดับการทำงานและเพิ่มประสิทธิภาพธุรกิจยุคใหม่ ด้วยนวัตกรรมเทคโนโลยีที่เหนือกว่า',
      btnText:'ดูข้อมูลเพิ่มเติม →',
      link:'#services',
      image:'tech_banner_1.jpg'
    },
    {
      id:'sl2',
      badge:'🚀 Next-Gen Technology',
      title:'พัฒนา Web & Mobile App ครบวงจร',
      desc:'ตอบโจทย์ทุกอุตสาหกรรม ส่งมอบงานตรงเวลา ปลอดภัย และรองรับผู้ใช้งานจำนวนมาก',
      btnText:'ดูผลงานของเรา →',
      link:'#portfolio',
      image:'tech_banner_2.jpg'
    }
  ],
  theme:{
    primaryColor:'#7c3aed',
    gradStart:'#7c3aed',
    gradMiddle:'#3b82f6',
    gradEnd:'#059669',
    bgTheme:'light',
    bgColor:'#ffffff',
    textColor:'#0f0a1e',
    preset:'purple'
  }
};

/* ============================================================
   DATA HELPERS
   ============================================================ */
function getData(){
  try{
    const s=localStorage.getItem(STORAGE_KEY);
    if(!s) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    const d=JSON.parse(s);
    const def=JSON.parse(JSON.stringify(DEFAULT_DATA));
    for(let k in def){
      if(d[k] === undefined){
        d[k] = def[k];
      }
    }
    return d;
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
}
function saveData(d){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(d));
    return true;
  }catch(e){
    console.error(e);
    toast('ไม่สามารถบันทึกได้: รูปภาพมีขนาดเกินโควตาของเบราว์เซอร์ (5MB) กรุณาใช้นำเข้ารูปภาพใหม่หรือย่อขนาดภาพลง','error');
    return false;
  }
}
function uid(){ return 'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).substr(2,5); }
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function grad(s,e){ return `linear-gradient(135deg,${s} 0%,${e} 100%)`; }

/* ============================================================
   AUTH
   ============================================================ */
function checkAuth(){
  if(sessionStorage.getItem('nxg_admin_auth')!=='true'){
    location.href='login.html'; return false;
  }
  return true;
}
function logout(){
  sessionStorage.clear();
  location.href='login.html';
}

/* ============================================================
   NAVIGATION
   ============================================================ */
let currentSection='dashboard';
const sectionTitles={dashboard:'Dashboard',logo:'โลโก้และแบรนด์',hero:'Hero Section',slider:'สไลด์ภาพ Banner',about:'เกี่ยวกับเรา',services:'ข่าวสารประชาสัมพันธ์',gallery:'รวมภาพผลงาน',team:'ทีมงาน',testimonials:'รีวิวลูกค้า',columns:'คอลัมน์เนื้อหา',theme:'ธีมและสีเว็บไซต์',contact:'ข้อมูลติดต่อ'};

function showSection(id){
  currentSection=id;
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('section-'+id);
  if(sec) sec.classList.add('active');
  document.getElementById('headerTitle').textContent=sectionTitles[id]||id;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const nav=document.querySelector(`[data-section="${id}"]`);
  if(nav) nav.classList.add('active');
  const renders={dashboard:renderDashboard,logo:renderLogo,hero:renderHero,slider:renderSlider,about:renderAbout,services:renderServices,gallery:renderGallery,team:renderTeam,testimonials:renderTestimonials,columns:renderColumns,theme:renderTheme,contact:renderContact};
  if(renders[id]) renders[id]();
}

/* ============================================================
   MODAL
   ============================================================ */
function showModal(title,bodyHTML,onSave,saveLabel){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=bodyHTML;
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('modalSaveBtn').textContent=saveLabel||'💾 บันทึก';
  modalSaveCallback=onSave;
  setTimeout(()=>{ const f=document.querySelector('#modalBody input,#modalBody select,#modalBody textarea'); if(f)f.focus(); },120);
}
function closeModal(){ document.getElementById('modalOverlay').classList.remove('show'); modalSaveCallback=null; }
function modalSave(){ if(modalSaveCallback) modalSaveCallback(); }
function handleOverlayClick(e){ if(e.target===document.getElementById('modalOverlay')) closeModal(); }

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
function showConfirm(text,cb){
  document.getElementById('confirmText').textContent=text||'คุณแน่ใจหรือไม่?';
  document.getElementById('confirmOverlay').classList.add('show');
  confirmCallback=cb;
}
function closeConfirm(){ document.getElementById('confirmOverlay').classList.remove('show'); confirmCallback=null; }

/* ============================================================
   TOAST
   ============================================================ */
function toast(msg,type='success'){
  const el=document.getElementById('toast');
  const icons={success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  el.className='toast '+type;
  el.innerHTML=`<span>${icons[type]||'•'}</span><span>${msg}</span>`;
  el.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),3200);
}

/* ============================================================
   IMAGE COMPRESSION & UPLOAD HELPER
   ============================================================ */
function compressImage(dataUrl, maxDim, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    callback(compressedDataUrl);
  };
  img.onerror = () => callback(dataUrl);
  img.src = dataUrl;
}

function setupImageUpload(inputId, previewId, onLoad) {
  const inp = document.getElementById(inputId);
  const prev = document.getElementById(previewId);
  if (!inp) return;
  inp.addEventListener('change', () => {
    const file = inp.files[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      toast('ไฟล์ใหญ่เกินไป (สูงสุด 12MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      compressImage(e.target.result, 1200, 0.78, compressed => {
        if (prev) {
          prev.src = compressed;
          prev.classList.add('show');
        }
        if (onLoad) onLoad(compressed);
      });
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   SECTION: DASHBOARD
   ============================================================ */
function renderDashboard(){
  const d=getData();
  document.getElementById('section-dashboard').innerHTML=`
    <div class="section-header">
      <div><h2>Dashboard</h2><div class="sub">ยินดีต้อนรับสู่ระบบจัดการ NexGen Solutions</div></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card" style="--grad:linear-gradient(135deg,#7c3aed,#3b82f6)"><span class="icon-bg">🛠</span><div class="num">${d.services.length}</div><div class="label">บริการทั้งหมด</div></div>
      <div class="stat-card" style="--grad:linear-gradient(135deg,#ec4899,#f59e0b)"><span class="icon-bg">🖼</span><div class="num">${d.portfolio.length}</div><div class="label">ผลงาน</div></div>
      <div class="stat-card" style="--grad:linear-gradient(135deg,#10b981,#06b6d4)"><span class="icon-bg">👥</span><div class="num">${d.team.length}</div><div class="label">ทีมงาน</div></div>
      <div class="stat-card" style="--grad:linear-gradient(135deg,#f59e0b,#ef4444)"><span class="icon-bg">⭐</span><div class="num">${d.testimonials.length}</div><div class="label">รีวิวลูกค้า</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">⚡</span>การดำเนินการด่วน</div></div>
      <div class="quick-grid">
        ${[['theme','🎨','ปรับแก้ธีมและสี'],['logo','🏷️','โลโก้และแบรนด์'],['slider','🖼️','สไลด์ภาพ Banner'],['services','🛠','เพิ่ม/แก้ไขบริการ'],['portfolio','🖼','เพิ่มผลงาน'],['team','👥','จัดการทีมงาน'],['testimonials','⭐','เพิ่มรีวิว'],['contact','📞','แก้ไขข้อมูลติดต่อ']].map(([s,ic,lb])=>`
          <button class="quick-btn" onclick="showSection('${s}')">
            <div class="q-icon">${ic}</div><span>${lb}</span>
          </button>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">🔄</span>สำรองและซิงค์ข้อมูลเว็บไซต์ (Backup & Sync)</div></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="exportConfigFile()">🚀 ดาวน์โหลดไฟล์ config.js (สำหรับอัปเดต Vercel)</button>
        <button class="btn btn-secondary" onclick="exportConfigData()">📥 ดาวน์โหลดไฟล์สำรอง (JSON)</button>
        <button class="btn btn-secondary" onclick="document.getElementById('importConfigFile').click()">📤 นำเข้าไฟล์ข้อมูล (JSON)</button>
        <input type="file" id="importConfigFile" accept=".json" style="display:none" onchange="importConfigData(this)">
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">💡</span>วิธีใช้งาน</div></div>
      <div style="font-size:.85rem;color:#6b7280;line-height:2">
        <p>• เลือกเมนูด้านซ้ายเพื่อจัดการแต่ละส่วน</p>
        <p>• กดปุ่ม <strong>🚀 ดาวน์โหลดไฟล์ config.js</strong> แล้ววางทับในโฟลเดอร์ <code>Web Site</code> เพื่ออัปเดต Vercel</p>
        <p>• รองรับการอัปโหลดรูปภาพและการซิงค์แสดงผลเรียลไทม์</p>
      </div>
    </div>`;
}

function exportConfigFile(){
  const d = getData();
  const code = 'window.CONFIG_DATA = ' + JSON.stringify(d, null, 2) + ';\n';
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.js';
  a.click();
  URL.revokeObjectURL(url);
  toast('ดาวน์โหลดไฟล์ config.js เรียบร้อยแล้ว! นำไปวางทับในโฟลเดอร์ Web Site ได้เลย');
}

function exportConfigData(){
  const d = getData();
  const jsonStr = JSON.stringify(d, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `website_config_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว!');
}

function importConfigData(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      saveData(parsed);
      toast('นำเข้าข้อมูลสำเร็จ! 🎉');
      setTimeout(() => location.reload(), 1000);
    } catch(err) {
      toast('ไฟล์ JSON ไม่ถูกต้อง', 'error');
    }
  };
  reader.readAsText(file);
}

/* ============================================================
   SECTION: LOGO
   ============================================================ */
function renderLogo(){
  const d=getData(); const lg=d.logo;
  tempLogoImage=lg.image;
  document.getElementById('section-logo').innerHTML=`
    <div class="section-header"><div><h2>โลโก้และแบรนด์</h2><div class="sub">แก้ไขชื่อบริษัทและโลโก้</div></div></div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">👁</span>ตัวอย่างโลโก้ปัจจุบัน</div></div>
      <div class="logo-preview-box">
        <div class="logo-prev-content">
          ${lg.image?`<img src="${lg.image}" style="max-height:60px;max-width:160px;object-fit:contain">`:`<div class="logo-prev-icon">${esc(lg.text[0]||'N')}</div>`}
          <div class="logo-prev-text">${esc(lg.text)}<span style="color:#7c3aed">${esc(lg.accent)}</span></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">✏️</span>แก้ไขโลโก้</div></div>
      <div class="form-grid">
        <div class="form-group"><label>ชื่อแบรนด์ *</label><input type="text" id="logoText" value="${esc(lg.text)}" placeholder="ชื่อบริษัท"></div>
        <div class="form-group"><label>สัญลักษณ์ต่อท้าย</label><input type="text" id="logoAccent" value="${esc(lg.accent)}" placeholder="."></div>
        <div class="form-group full">
          <label>อัปโหลดรูปโลโก้ (ไม่บังคับ)</label>
          <div class="upload-area"><input type="file" id="logoFile" accept="image/*"><div class="up-icon">🖼️</div><div class="up-text">คลิกหรือลากไฟล์มาวาง</div><div class="up-hint">PNG, JPG, SVG — สูงสุด 3MB</div></div>
          <img id="logoImgPrev" class="img-preview ${lg.image?'show':''}" src="${lg.image||''}" alt="preview">
          ${lg.image?`<button class="btn btn-delete btn-sm" style="margin-top:8px" onclick="removeLogo()">🗑 ลบรูปโลโก้</button>`:''}
        </div>
      </div>
      <div style="margin-top:20px;display:flex;gap:12px">
        <button class="btn btn-primary" onclick="saveLogo()">💾 บันทึกโลโก้</button>
        <button class="btn btn-secondary" onclick="renderLogo()">↩ รีเซ็ต</button>
      </div>
    </div>`;
  setupImageUpload('logoFile','logoImgPrev',img=>{ tempLogoImage=img; });
}
function removeLogo(){ const d=getData(); d.logo.image=null; saveData(d); toast('ลบรูปโลโก้แล้ว'); renderLogo(); updateSidebarLogo(); }
function saveLogo(){
  const text=document.getElementById('logoText').value.trim();
  if(!text){ toast('กรุณากรอกชื่อแบรนด์','error'); return; }
  const accent=document.getElementById('logoAccent').value||'.';
  const d=getData();
  d.logo={text,accent,image:tempLogoImage};
  saveData(d); toast('บันทึกโลโก้สำเร็จ! 🎉'); renderLogo(); updateSidebarLogo();
}
function updateSidebarLogo(){
  const d=getData();
  document.getElementById('sidebarLogoName').textContent=d.logo.text+(d.logo.accent||'.');
  document.getElementById('sidebarLogoIcon').textContent=d.logo.text[0]||'N';
}

/* ============================================================
   SECTION: HERO
   ============================================================ */
function renderHero(){
  const d=getData(); const h=d.hero;
  document.getElementById('section-hero').innerHTML=`
    <div class="section-header"><div><h2>Hero Section</h2><div class="sub">แก้ไขส่วนหัวของเว็บไซต์</div></div></div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">✏️</span>เนื้อหา Hero</div></div>
      <div class="form-grid">
        <div class="form-group full"><label>Badge Text</label><input type="text" id="heroBadge" value="${esc(h.badge)}" placeholder="ข้อความ badge"></div>
        <div class="form-group"><label>ชื่อบรรทัด 1</label><input type="text" id="heroT1" value="${esc(h.title1)}"></div>
        <div class="form-group"><label>ชื่อบรรทัด 2 (Gradient)</label><input type="text" id="heroT2" value="${esc(h.title2)}"></div>
        <div class="form-group"><label>ชื่อบรรทัด 3</label><input type="text" id="heroT3" value="${esc(h.title3)}"></div>
        <div class="form-group full"><label>คำอธิบาย (Subtitle)</label><textarea id="heroSub" rows="3">${esc(h.subtitle)}</textarea></div>
        <div class="form-group"><label>CTA ปุ่ม 1</label><input type="text" id="heroCta1" value="${esc(h.cta1||'ข่าวสาร และผลงาน')}"></div>
        <div class="form-group"><label>CTA ปุ่ม 2</label><input type="text" id="heroCta2" value="${esc(h.cta2||'ดูผลงาน')}"></div>
        <div class="form-group full" style="background:#f8fafc;padding:16px;border-radius:10px;border:1px solid #e2e8f0;margin-top:10px">
          <label style="font-weight:700;color:#0f172a;font-size:0.95rem">🎬 วิดีโอป๊อปอัปเมื่อกดปุ่ม "ดูผลงาน" (เลือกแนบได้ 2 วิธี)</label>
          
          <div style="margin-top:10px">
            <label style="font-size:0.82rem;color:#64748b;display:block;margin-bottom:4px">🔗 วิธีที่ 1: วางลิงก์วิดีโอ (YouTube / Vimeo / MP4 URL)</label>
            <input type="text" id="heroVideoUrl" value="${esc(h.videoUrl||'')}" placeholder="https://www.youtube.com/watch?v=... หรือลิงก์ไฟล์ MP4">
          </div>

          <div style="margin-top:12px">
            <label style="font-size:0.82rem;color:#64748b;display:block;margin-bottom:4px">💻 วิธีที่ 2: อัปโหลด/แนบไฟล์วิดีโอจากเครื่องคอมพิวเตอร์ หรือ มือถือ (.mp4, .mov, .webm)</label>
            <input type="file" id="heroVideoFile" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" style="display:none">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('heroVideoFile').click()">🎥 เลือกแนบไฟล์วิดีโอจากเครื่อง (Local Video File)</button>
          </div>
          
          <div id="heroVideoInfo" style="margin-top:10px;display:${h.videoUrl ? 'block' : 'none'}">
            <span style="font-size:0.8rem;color:#0284c7;font-weight:600">✅ วิดีโอที่ใช้อยู่ในขณะนี้:</span>
            <div id="heroVideoPathText" style="font-size:0.78rem;color:#475569;word-break:break-all;background:#ffffff;padding:6px 10px;border-radius:6px;border:1px solid #cbd5e1;margin-top:4px">${esc(h.videoUrl||'')}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">📊</span>สถิติ (Stats)</div><button class="btn btn-primary btn-sm" onclick="addHeroStat()">+ เพิ่มสถิติ</button></div>
      <div id="statsContainer">
        ${(h.stats||[]).map((s,i)=>`
          <div class="feature-item-row" id="stat_${i}" style="margin-bottom:10px">
            <input type="number" value="${s.num}" placeholder="ตัวเลข" style="width:90px" id="sn_${i}">
            <input type="text" value="${esc(s.unit)}" placeholder="หน่วย" style="width:60px" id="su_${i}">
            <input type="text" value="${esc(s.label)}" placeholder="ชื่อ" style="flex:1" id="sl_${i}">
            <button class="btn-rm-feature" onclick="removeHeroStat(${i})">✕</button>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px"><button class="btn btn-primary" onclick="saveHero()">💾 บันทึก Hero Section</button></div>
    </div>`;

  setTimeout(() => {
    const heroVidInp = document.getElementById('heroVideoFile');
    if(heroVidInp){
      heroVidInp.addEventListener('change', async () => {
        const file = heroVidInp.files[0];
        if(!file) return;
        if(file.size > 200 * 1024 * 1024){ toast('ไฟล์วิดีโอใหญ่เกินไป (สูงสุด 200MB)', 'error'); return; }
        toast(`⏳ กำลังบันทึกไฟล์วิดีโอ ${file.name} เข้าสู่ระบบ...`, 'info');
        
        await saveVideoBlob('hero_video_file', file);
        
        const videoMarker = `idb://hero_video_file#${file.name}`;
        document.getElementById('heroVideoUrl').value = videoMarker;
        
        const infoBox = document.getElementById('heroVideoInfo');
        const pathText = document.getElementById('heroVideoPathText');
        if(infoBox) infoBox.style.display = 'block';
        if(pathText) pathText.textContent = `[ไฟล์วิดีโออัปโหลดจากเครื่อง] ${file.name} (${(file.size/(1024*1024)).toFixed(2)} MB)`;
        
        toast(`🎉 แนบและบันทึกไฟล์วิดีโอ ${file.name} สำเร็จแล้ว! อย่าลืมกดปุ่มบันทึกนะครับ`);
      });
    }
  }, 100);
}
function addHeroStat(){
  const d=getData(); d.hero.stats.push({num:0,unit:'+',label:'ชื่อสถิติ'}); saveData(d); renderHero();
}
function removeHeroStat(i){ const d=getData(); d.hero.stats.splice(i,1); saveData(d); renderHero(); }
function saveHero(){
  const d=getData();
  d.hero.badge=document.getElementById('heroBadge').value.trim();
  d.hero.title1=document.getElementById('heroT1').value.trim();
  d.hero.title2=document.getElementById('heroT2').value.trim();
  d.hero.title3=document.getElementById('heroT3').value.trim();
  d.hero.subtitle=document.getElementById('heroSub').value.trim();
  d.hero.cta1=document.getElementById('heroCta1').value.trim();
  d.hero.cta2=document.getElementById('heroCta2').value.trim();
  d.hero.videoUrl=document.getElementById('heroVideoUrl').value.trim();
  d.hero.stats=(d.hero.stats||[]).map((_,i)=>({num:parseInt(document.getElementById(`sn_${i}`).value)||0,unit:document.getElementById(`su_${i}`).value,label:document.getElementById(`sl_${i}`).value}));
  saveData(d); toast('บันทึก Hero Section สำเร็จ! 🎉');
}

/* ============================================================
   SECTION: SLIDER (สไลด์ภาพ Banner 1 คอลัมน์)
   ============================================================ */
let tempSliderImage = null;

function renderSlider(){
  const d=getData();
  const list=d.slider || [];
  
  document.getElementById('section-slider').innerHTML=`
    <div class="section-header">
      <div><h2>สไลด์ภาพ Banner (1 คอลัมน์)</h2><div class="sub">จัดการภาพสไลด์แบนเนอร์ขนาดใหญ่ใต้ Hero Section (${list.length} สไลด์)</div></div>
      <button class="btn btn-primary" onclick="editSliderItem(null)">+ เพิ่มแบนเนอร์สไลด์</button>
    </div>
    
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>#</th><th>ภาพ Banner</th><th>Badge</th><th>ชื่อหัวข้อแบนเนอร์</th><th>ปุ่ม & ลิงก์</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${list.length===0 ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🖼️</div><p>ยังไม่มีแบนเนอร์สไลด์ กดเพิ่มแบนเนอร์ได้เลย!</p></div></td></tr>` :
              list.map((item, i)=>`
                <tr>
                  <td><span class="badge badge-gray">${i+1}</span></td>
                  <td>
                    <div class="item-preview">
                      <div class="item-thumb" style="width:70px;height:40px;border-radius:6px;background:#1e1b2e">
                        ${item.image ? `<img src="${item.image}" alt="" style="object-fit:cover;width:100%;height:100%">` : `<span style="font-size:1.2rem">🖼️</span>`}
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-purple">${esc(item.badge||'Banner')}</span></td>
                  <td><strong>${esc(item.title)}</strong><br><span style="font-size:.74rem;color:#9ca3af">${esc((item.desc||'').substring(0,40))}...</span></td>
                  <td style="font-size:.78rem;color:#6b7280"><code>${esc(item.btnText||'ดูข้อมูล')}</code><br>${esc(item.link||'#')}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn btn-edit btn-sm" onclick="editSliderItem('${item.id}')">✏️ แก้ไข</button>
                      <button class="btn btn-delete btn-sm" onclick="deleteSliderItem('${item.id}')">🗑 ลบ</button>
                    </div>
                  </td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function editSliderItem(id){
  const d=getData();
  const item=id ? (d.slider||[]).find(x=>x.id===id) : {id:null, badge:'⚡ Highlight', title:'', desc:'', btnText:'ดูข้อมูลเพิ่มเติม →', link:'#services', image:null};
  if(!item) return;
  tempSliderImage = item.image;

  showModal(id?'แก้ไขแบนเนอร์สไลด์':'เพิ่มแบนเนอร์สไลด์ใหม่', `
    <div class="form-grid">
      <div class="form-group"><label>ป้ายกำกับ (Badge)</label><input type="text" id="slBadge" value="${esc(item.badge||'⚡ Highlight')}" placeholder="เช่น ⚡ Highlight Solution"></div>
      <div class="form-group"><label>ข้อความบนปุ่ม CTA</label><input type="text" id="slBtnText" value="${esc(item.btnText||'ดูข้อมูลเพิ่มเติม →')}" placeholder="ดูข้อมูลเพิ่มเติม →"></div>
      <div class="form-group full"><label>ชื่อหัวข้อสไลด์ (Title) *</label><input type="text" id="slTitle" value="${esc(item.title)}" placeholder="เช่น โซลูชันระบบ AI & Cloud สำหรับองค์กร"></div>
      <div class="form-group full"><label>คำอธิบายสไลด์ (Description)</label><textarea id="slDesc" rows="3" placeholder="รายละเอียดแบนเนอร์...">${esc(item.desc||'')}</textarea></div>
      <div class="form-group full"><label>ลิงก์เมื่อคลิกปุ่ม (URL / Section Anchor)</label><input type="text" id="slLink" value="${esc(item.link||'#services')}" placeholder="#services หรือ https://..."></div>
      
      <div class="form-group full">
        <label>อัปโหลดรูปภาพ Banner ขนาดใหญ่ (แนะนำอัตราส่วน 16:9 / ความละเอียดสูง) *</label>
        <div class="upload-area">
          <input type="file" id="slFile" accept="image/*">
          <div class="up-icon">🖼️</div>
          <div class="up-text">คลิกเพื่อเลือกไฟล์รูปภาพ Banner</div>
          <div class="up-hint">PNG, JPG, WebP — สูงสุด 3MB</div>
        </div>
        <img id="slImgPrev" class="img-preview ${item.image?'show':''}" src="${item.image||''}" alt="preview">
      </div>
    </div>`,
    ()=>saveSliderItem(id));

  setupImageUpload('slFile', 'slImgPrev', img => { tempSliderImage = img; });
}

function saveSliderItem(id){
  const title = document.getElementById('slTitle').value.trim();
  if(!title){ toast('กรุณากรอกชื่อหัวข้อสไลด์', 'error'); return; }
  const d = getData();
  if(!d.slider) d.slider = [];
  
  const obj = {
    id: id || uid(),
    badge: document.getElementById('slBadge').value.trim(),
    title,
    desc: document.getElementById('slDesc').value.trim(),
    btnText: document.getElementById('slBtnText').value.trim() || 'ดูข้อมูลเพิ่มเติม →',
    link: document.getElementById('slLink').value.trim() || '#',
    image: tempSliderImage
  };

  if(id){
    const idx = d.slider.findIndex(x=>x.id===id);
    if(idx>-1) d.slider[idx] = obj;
  } else {
    d.slider.push(obj);
  }

  if(saveData(d)){
    closeModal();
    renderSlider();
    toast(id?'แก้ไขแบนเนอร์เรียบร้อยแล้ว!':'เพิ่มแบนเนอร์เรียบร้อยแล้ว!');
  }
}

function deleteSliderItem(id){
  showConfirm('ต้องการลบแบนเนอร์สไลด์นี้?', ()=>{
    const d=getData();
    d.slider = (d.slider||[]).filter(x=>x.id!==id);
    saveData(d);
    closeConfirm();
    renderSlider();
    toast('ลบสไลด์แล้ว', 'warning');
  });
}

/* ============================================================
   SECTION: ABOUT
   ============================================================ */
function renderAbout(){
  const d=getData(); const a=d.about;
  tempAboutImage=a.image;
  document.getElementById('section-about').innerHTML=`
    <div class="section-header"><div><h2>เกี่ยวกับเรา</h2><div class="sub">แก้ไขเนื้อหาและการจัดวางส่วน About</div></div></div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">✏️</span>เนื้อหาหลัก</div></div>
      <div class="form-grid">
        <div class="form-group full"><label>หัวข้อ</label><input type="text" id="aboutTitle" value="${esc(a.title)}"></div>
        <div class="form-group full"><label>คำอธิบาย</label><textarea id="aboutDesc" rows="4">${esc(a.desc)}</textarea></div>
        <div class="form-group full"><label>รางวัล / ความสำเร็จ (Card 1)</label><input type="text" id="aboutAward" value="${esc(a.award||'')}"></div>
        <div class="form-group full">
          <label>รูปภาพทีมงาน</label>
          <div class="upload-area"><input type="file" id="aboutFile" accept="image/*"><div class="up-icon">📷</div><div class="up-text">อัปโหลดรูปทีมงาน</div><div class="up-hint">JPG, PNG — สูงสุด 3MB</div></div>
          <img id="aboutImgPrev" class="img-preview ${a.image?'show':''}" src="${a.image||a.image===null?'about_team.jpg':''}" alt="preview">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">📍</span>ข้อมูลพื้นที่ & ขอบเขตการให้บริการ (Card 2 Stats)</div></div>
      <div class="form-grid">
        <div class="form-group">
          <label>หัวข้อการ์ด (Card Title)</label>
          <input type="text" id="aboutCard2Title" value="${esc(a.card2Title||'ให้บริการทั่วไทย')}" placeholder="เช่น ให้บริการทั่วไทย, ขอบเขตการให้บริการ">
        </div>
        <div class="form-group">
          <label>จำนวน / ตัวเลข (Number / Stat)</label>
          <input type="text" id="aboutCountries" value="${esc(a.countries||'77')}" placeholder="เช่น 77, 15+, 100">
        </div>
        <div class="form-group">
          <label>เลือกหน่วยพื้นที่ / รูปแบบ (Unit Options)</label>
          <select id="aboutRegionUnit" onchange="toggleCustomUnitInput()">
            <option value="จังหวัด" ${(a.regionUnit==='จังหวัด'||!a.regionUnit)?'selected':''}>📍 จังหวัด (Provinces)</option>
            <option value="ประเทศ" ${a.regionUnit==='ประเทศ'?'selected':''}>🌏 ประเทศ (Countries)</option>
            <option value="ภูมิภาค" ${a.regionUnit==='ภูมิภาค'?'selected':''}>🗺️ ภูมิภาค (Regions)</option>
            <option value="สาขา" ${a.regionUnit==='สาขา'?'selected':''}>🏢 สาขา (Branches)</option>
            <option value="แห่ง" ${a.regionUnit==='แห่ง'?'selected':''}>🏬 แห่ง (Locations)</option>
            <option value="custom" ${(a.regionUnit==='custom'||a.regionUnit==='กำหนดเอง')?'selected':''}>✍️ กำหนดหน่วยเอง (Custom Unit)</option>
          </select>
        </div>
        <div class="form-group" id="customUnitGroup" style="display:${(a.regionUnit==='custom'||a.regionUnit==='กำหนดเอง')?'block':'none'}">
          <label>พิมพ์หน่วยของคุณเอง (Custom Unit Text)</label>
          <input type="text" id="aboutCustomUnit" value="${esc(a.customUnit||'')}" placeholder="เช่น โครงการ, ลูกค้า, ทั่วโลก">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">📐</span>ปรับแต่งเค้าโครง & ตัวหนังสือ (Layout & Typography)</div></div>
      <div class="form-grid">
        <div class="form-group">
          <label>การจัดตำแหน่งตัวหนังสือ (Text Alignment)</label>
          <select id="aboutAlign">
            <option value="left" ${a.textAlign==='left'||!a.textAlign?'selected':''}>⬅️ ชิดซ้าย (Left)</option>
            <option value="center" ${a.textAlign==='center'?'selected':''}>↔️ กึ่งกลาง (Center)</option>
            <option value="right" ${a.textAlign==='right'?'selected':''}>➡️ ชิดขวา (Right)</option>
          </select>
        </div>
        <div class="form-group">
          <label>สัดส่วนความกว้างช่อง (Column Ratio)</label>
          <select id="aboutColRatio">
            <option value="img-wide" ${a.colRatio==='img-wide'||!a.colRatio?'selected':''}>🖼️ ภาพกว้างใหญ่ (60% ภาพ / 40% ข้อความ)</option>
            <option value="wide" ${a.colRatio==='wide'?'selected':''}>↔️ ข้อความกว้างขึ้น (40% ภาพ / 60% ข้อความ)</option>
            <option value="extra-wide" ${a.colRatio==='extra-wide'?'selected':''}>🖥️ ข้อความกว้างพิเศษ (30% ภาพ / 70% ข้อความ)</option>
            <option value="equal" ${a.colRatio==='equal'?'selected':''}>📐 เท่ากัน (50% ภาพ / 50% ข้อความ)</option>
          </select>
        </div>
        <div class="form-group">
          <label>ทิศทางการจัดวาง (Layout Direction)</label>
          <select id="aboutLayout">
            <option value="horizontal" ${a.layout==='horizontal'||!a.layout?'selected':''}>↔️ แนวนอน (รูปคู่เนื้อหา 2 คอลัมน์)</option>
            <option value="vertical" ${a.layout==='vertical'?'selected':''}>↕️ แนวตั้ง (รูปอยู่บน / เนื้อหาอยู่ล่าง)</option>
          </select>
        </div>
        <div class="form-group">
          <label>ความกว้างช่องเนื้อหา (Container Width)</label>
          <select id="aboutWidth">
            <option value="standard" ${a.containerWidth==='standard'||!a.containerWidth?'selected':''}>📐 ช่องกว้างปกติ (Standard 1200px)</option>
            <option value="wide" ${a.containerWidth==='wide'?'selected':''}>↔️ ช่องกว้างพิเศษ (Wide 1400px)</option>
            <option value="full" ${a.containerWidth==='full'?'selected':''}>🖥️ ช่องกว้างเต็มจอ (Full Width 100%)</option>
          </select>
        </div>
        <div class="form-group">
          <label>ขนาดตัวหนังสือ (Font Size)</label>
          <select id="aboutFontSize">
            <option value="normal" ${a.fontSize==='normal'||!a.fontSize?'selected':''}>🔤 ขนาดปกติ (Standard)</option>
            <option value="large" ${a.fontSize==='large'?'selected':''}>🔠 ขนาดใหญ่ (Large)</option>
            <option value="xlarge" ${a.fontSize==='xlarge'?'selected':''}>🔠 ขนาดใหญ่พิเศษ (Extra Large)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">✅</span>จุดเด่น (Features)</div><button class="btn btn-primary btn-sm" onclick="addAboutFeature()">+ เพิ่ม</button></div>
      <div id="featuresContainer">
        ${(a.features||[]).map((f,i)=>`
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:10px" id="feat_${i}">
            <input type="text" value="${esc(f.title)}" placeholder="หัวข้อ" id="ft_${i}">
            <input type="text" value="${esc(f.desc)}" placeholder="คำอธิบาย" id="fd_${i}">
            <button class="btn-rm-feature" onclick="removeAboutFeature(${i})">✕</button>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px"><button class="btn btn-primary" onclick="saveAbout()">💾 บันทึก About</button></div>
    </div>`;
  setupImageUpload('aboutFile','aboutImgPrev',img=>{ tempAboutImage=img; });
}
function toggleCustomUnitInput() {
  const select = document.getElementById('aboutRegionUnit');
  const group = document.getElementById('customUnitGroup');
  if (select && group) {
    group.style.display = (select.value === 'custom' || select.value === 'กำหนดเอง') ? 'block' : 'none';
  }
}

function addAboutFeature(){ const d=getData(); d.about.features.push({title:'',desc:''}); saveData(d); renderAbout(); }
function removeAboutFeature(i){ const d=getData(); d.about.features.splice(i,1); saveData(d); renderAbout(); }
function saveAbout(){
  const d=getData();
  d.about.title=document.getElementById('aboutTitle').value.trim();
  d.about.desc=document.getElementById('aboutDesc').value.trim();
  d.about.award=document.getElementById('aboutAward').value.trim();
  d.about.card2Title=document.getElementById('aboutCard2Title')?document.getElementById('aboutCard2Title').value.trim():'ให้บริการทั่วไทย';
  d.about.countries=document.getElementById('aboutCountries').value.trim();
  d.about.regionUnit=document.getElementById('aboutRegionUnit')?document.getElementById('aboutRegionUnit').value:'จังหวัด';
  d.about.customUnit=document.getElementById('aboutCustomUnit')?document.getElementById('aboutCustomUnit').value.trim():'';
  d.about.textAlign=document.getElementById('aboutAlign').value;
  d.about.colRatio=document.getElementById('aboutColRatio').value;
  d.about.layout=document.getElementById('aboutLayout').value;
  d.about.containerWidth=document.getElementById('aboutWidth').value;
  d.about.fontSize=document.getElementById('aboutFontSize').value;
  d.about.features=(d.about.features||[]).map((_,i)=>({title:document.getElementById(`ft_${i}`).value,desc:document.getElementById(`fd_${i}`).value}));
  if(tempAboutImage!==undefined) d.about.image=tempAboutImage;
  saveData(d); toast('บันทึก About สำเร็จ! 🎉');
}

/* ============================================================
   SECTION: SERVICES
   ============================================================ */
function renderServices(){
  const d=getData();
  document.getElementById('section-services').innerHTML=`
    <div class="section-header">
      <div><h2>บริการ</h2><div class="sub">จัดการรายการบริการทั้งหมด (${d.services.length} รายการ)</div></div>
      <button class="btn btn-primary" onclick="editService(null)">+ เพิ่มบริการ</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>บริการ</th><th>สี</th><th>ยอดนิยม</th><th>Feature</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${d.services.length===0?`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🛠</div><p>ยังไม่มีบริการ กดเพิ่มบริการเลย!</p></div></td></tr>`:
              d.services.map(s=>`
                <tr>
                  <td><div class="item-preview"><div class="item-thumb" style="background:${esc(s.color)}20;color:${esc(s.color)}">${s.icon||'🛠'}</div><div class="item-info"><strong>${esc(s.title)}</strong><span>${esc(s.desc.substring(0,40))}...</span></div></div></td>
                  <td><span class="swatch" style="background:${esc(s.color)}"></span> ${esc(s.color)}</td>
                  <td>${s.featured?'<span class="badge badge-purple">ยอดนิยม</span>':'<span class="badge badge-gray">ปกติ</span>'}</td>
                  <td>${s.features.length} รายการ</td>
                  <td><div class="action-btns"><button class="btn btn-edit btn-sm" onclick="editService('${s.id}')">✏️ แก้ไข</button><button class="btn btn-delete btn-sm" onclick="deleteService('${s.id}')">🗑 ลบ</button></div></td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
let tempServiceImage = null;
function editService(id){
  const d=getData();
  const s=id?d.services.find(x=>x.id===id):{id:null,icon:'📰',color:'#7c3aed',title:'',desc:'',features:[''],featured:false,date:'',fullText:'',image:null,pdfUrl:'',pdfName:''};
  if(!s) return;
  tempServiceImage = s.image || null;
  showModal(id?'แก้ไขข่าวสาร / บริการ':'เพิ่มข่าวสาร / บริการใหม่',`
    <div class="form-grid">
      <div class="form-group full"><label>วันที่ประกาศข่าว</label><input type="text" id="sDate" value="${esc(s.date||'')}" placeholder="06 สิงหาคม 2569"></div>
      <div class="form-group full"><label>หัวข้อข่าวสาร / บริการ *</label><input type="text" id="sTitle" value="${esc(s.title)}" placeholder="กรอกหัวข้อข่าวสาร"></div>
      <div class="form-group full"><label>คำอธิบายย่อ (แสดงบนการ์ด) *</label><textarea id="sDesc" rows="2">${esc(s.desc)}</textarea></div>
      <div class="form-group full"><label>เนื้อหาข่าวฉบับเต็ม (แสดงเมื่อคลิกอ่านข่าว)</label><textarea id="sFullText" rows="6" placeholder="กรอกเนื้อหาข่าว รายงานข่าว หรือรายละเอียดฉบับเต็มที่นี่...">${esc(s.fullText||'')}</textarea></div>
      
      <div class="form-group full">
        <label>รูปภาพประกอบข่าว / รูปปก</label>
        <div class="image-upload-wrap">
          <input type="file" id="sFile" accept="image/*" style="display:none">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('sFile').click()">📷 เลือกรูปภาพประกอบ</button>
          <img id="sImgPrev" src="${s.image||''}" class="img-preview ${s.image?'show':''}">
        </div>
      </div>

      <div class="form-group full">
        <label>ไฟล์แนบ PDF / เอกสารดาวน์โหลด (PDF File Attachment)</label>
        <input type="file" id="sPdfFile" accept=".pdf" style="display:none">
        <div style="display:flex;gap:8px">
          <input type="text" id="sPdfUrl" value="${esc(s.pdfUrl||'')}" placeholder="ลิงก์ไฟล์ PDF หรือกดอัปโหลดข้างๆ" style="flex:1">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('sPdfFile').click()">📄 เลือกไฟล์ PDF</button>
        </div>
        <input type="text" id="sPdfName" value="${esc(s.pdfName||'')}" placeholder="ชื่อไฟล์แนบ e.g. รายงานข่าวสาร_ฉบับเต็ม.pdf" style="margin-top:6px">
      </div>

      <div class="form-group full">
        <label>จุดเด่น / รายละเอียดเพิ่มเติม (Features)</label>
        <div class="feature-list" id="featureList">
          ${(s.features||['']).map((f,i)=>`<div class="feature-item-row"><input type="text" class="feat-inp" value="${esc(f)}" placeholder="รายละเอียด ${i+1}"><button class="btn-rm-feature" onclick="rmFeat(this)">✕</button></div>`).join('')}
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addFeat()" style="margin-top:6px">+ เพิ่มรายการ</button>
      </div>
      <div class="form-group full">
        <div class="toggle-wrap"><label class="toggle"><input type="checkbox" id="sFeatured" ${s.featured?'checked':''}><span class="toggle-sl"></span></label><span class="toggle-label">แสดงป้าย "ข่าวสำคัญ / ยอดนิยม"</span></div>
      </div>
    </div>`,
    ()=>saveService(id));

  setupImageUpload('sFile','sImgPrev',img=>{ tempServiceImage=img; });

  const pdfInp = document.getElementById('sPdfFile');
  if(pdfInp){
    pdfInp.addEventListener('change', ()=>{
      const file = pdfInp.files[0];
      if(!file) return;
      if(file.size > 8 * 1024 * 1024){ toast('ไฟล์ PDF ใหญ่เกินไป (สูงสุด 8MB)','error'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('sPdfUrl').value = e.target.result;
        if(!document.getElementById('sPdfName').value) {
          document.getElementById('sPdfName').value = file.name;
        }
        toast('อัปโหลดไฟล์ PDF เรียบร้อยแล้ว!');
      };
      reader.readAsDataURL(file);
    });
  }
}
function addFeat(){ const fl=document.getElementById('featureList'); const div=document.createElement('div'); div.className='feature-item-row'; div.innerHTML=`<input type="text" class="feat-inp" placeholder="รายละเอียด"><button class="btn-rm-feature" onclick="rmFeat(this)">✕</button>`; fl.appendChild(div); }
function rmFeat(btn){ btn.parentElement.remove(); }
function saveService(id){
  const title=document.getElementById('sTitle').value.trim();
  if(!title){ toast('กรุณากรอกชื่อหัวข้อข่าว','error'); return; }
  const feats=[...document.querySelectorAll('.feat-inp')].map(i=>i.value.trim()).filter(Boolean);
  const d=getData();
  const index=id?d.services.findIndex(x=>x.id===id):-1;
  const oldItem=index>=0?d.services[index]:{};
  const obj={
    id:id||uid(),
    icon:document.getElementById('sIcon')?document.getElementById('sIcon').value:'📰',
    color:document.getElementById('sColor')?document.getElementById('sColor').value:'#7c3aed',
    title,
    desc:document.getElementById('sDesc').value.trim(),
    fullText:document.getElementById('sFullText').value.trim(),
    date:document.getElementById('sDate').value.trim(),
    image:tempServiceImage!==null?tempServiceImage:oldItem.image,
    pdfUrl:document.getElementById('sPdfUrl').value.trim(),
    pdfName:document.getElementById('sPdfName').value.trim(),
    features:feats,
    featured:document.getElementById('sFeatured').checked
  };
  if(index>=0) d.services[index]=obj;
  else d.services.push(obj);
  saveData(d); closeModal(); renderServices(); toast(id?'แก้ไขข่าวสารสำเร็จ!':'เพิ่มข่าวสารสำเร็จ!');
}
function deleteService(id){ showConfirm('ต้องการลบข่าวสารนี้?',()=>{ const d=getData(); d.services=d.services.filter(x=>x.id!==id); saveData(d); closeConfirm(); renderServices(); toast('ลบข่าวสารแล้ว','warning'); }); }

/* ============================================================
   SECTION: GALLERY (รวมภาพผลงาน & อัลบั้มกิจกรรม)
   ============================================================ */
let tempGalleryPhotos = [];
let tempGalleryCover = null;

function renderGallery(){
  const d = getData();
  if(!d.gallery) d.gallery = [];
  document.getElementById('section-gallery').innerHTML = `
    <div class="section-header">
      <div><h2>รวมภาพผลงาน & อัลบั้มกิจกรรม</h2><div class="sub">จัดการอัลบั้มภาพผลงานทั้งหมด (${d.gallery.length} อัลบั้ม)</div></div>
      <button class="btn btn-primary" onclick="editGalleryItem(null)">+ สร้างอัลบั้มใหม่</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>รูปปกอัลบั้ม</th><th>ชื่ออัลบั้ม / คำอธิบาย</th><th>จำนวนรูป</th><th>วันที่</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${d.gallery.length===0?`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📁</div><p>ยังไม่มีอัลบั้มผลงาน กดสร้างอัลบั้มใหม่เลย!</p></div></td></tr>`:
              d.gallery.map(g => {
                const photos = (g.photos && g.photos.length) ? g.photos : [g.image || 'tech_banner_1.jpg'];
                const cover = g.image || photos[0];
                return `
                <tr>
                  <td><div class="item-thumb" style="width:65px;height:48px;border-radius:6px;overflow:hidden"><img src="${cover}" style="width:100%;height:100%;object-fit:cover" alt=""></div></td>
                  <td><strong>${esc(g.title||'ไม่มีชื่ออัลบั้ม')}</strong><div style="font-size:0.78rem;color:#64748b">${esc((g.desc||'').substring(0,50))}</div></td>
                  <td><span class="badge badge-purple">📷 ${photos.length} รูป</span></td>
                  <td><span class="badge badge-gray">${esc(g.date||'-')}</span></td>
                  <td><div class="action-btns"><button class="btn btn-edit btn-sm" onclick="editGalleryItem('${g.id}')">✏️ แก้ไขอัลบั้ม</button><button class="btn btn-delete btn-sm" onclick="deleteGalleryItem('${g.id}')">🗑 ลบ</button></div></td>
                </tr>`;
              }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function editGalleryItem(id){
  const d = getData();
  if(!d.gallery) d.gallery = [];
  const g = id ? d.gallery.find(x => x.id === id) : { id: null, title: '', date: '', desc: '', image: '', externalUrl: '', photos: [] };
  if(!g) return;

  tempGalleryCover = g.image || null;
  tempGalleryPhotos = (g.photos && g.photos.length) ? [...g.photos] : (g.image ? [g.image] : []);

  showModal(id ? 'แก้ไขอัลบั้มภาพผลงาน' : 'สร้างอัลบั้มภาพผลงานใหม่', `
    <div class="form-grid">
      <div class="form-group full"><label>ชื่ออัลบั้มภาพผลงาน / กิจกรรม *</label><input type="text" id="gTitle" value="${esc(g.title||'')}" placeholder="เช่น ภาพกิจกรรมลงพื้นที่ส่งเสริมนวัตกรรมดิจิทัล"></div>
      <div class="form-group full"><label>วันที่กิจกรรม / ผลงาน</label><input type="text" id="gDate" value="${esc(g.date||'')}" placeholder="06 สิงหาคม 2569"></div>
      <div class="form-group full"><label>คำอธิบายอัลบั้ม</label><textarea id="gDesc" rows="3" placeholder="รายละเอียดภาพกิจกรรมฉบับย่อ...">${esc(g.desc||'')}</textarea></div>
      <div class="form-group full"><label>🔗 ลิงก์อัลบั้มเต็มภายนอก (Google Photos / Facebook Album Link)</label><input type="text" id="gExternalUrl" value="${esc(g.externalUrl||'')}" placeholder="https://photos.app.goo.gl/... (เมื่อกดดูเพิ่มเติม จะนำส่งไปที่นี่)"></div>
      
      <!-- Cover Photo -->
      <div class="form-group full" style="background:#f8fafc;padding:16px;border-radius:10px;border:1px solid #e2e8f0">
        <label style="font-weight:700;color:#0f172a">🖼️ รูปปกอัลบั้ม (Cover Photo)</label>
        <div style="margin-top:8px">
          <input type="text" id="gCoverUrl" value="${esc(g.image||'')}" placeholder="วางลิงก์รูปปก (Google Photos / Facebook URL)" oninput="updateGalleryCoverUrl(this.value)">
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <input type="file" id="gCoverFile" accept="image/*" style="display:none">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('gCoverFile').click()">💻 เลือกรูปปกจากเครื่อง (Local)</button>
          <img id="gCoverPrev" class="img-preview ${g.image?'show':''}" src="${g.image||''}" style="height:60px;width:90px;object-fit:cover;border-radius:6px">
        </div>
      </div>

      <!-- Album Photo Collection -->
      <div class="form-group full" style="background:#f0f9ff;padding:18px;border-radius:12px;border:1px solid #bae6fd;margin-top:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <label style="font-weight:700;color:#0369a1;font-size:1rem">📸 รูปภาพทั้งหมดในอัลบั้มนี้ (<span id="photoCountLabel">${tempGalleryPhotos.length}</span> รูป)</label>
        </div>

        <!-- Big Multi-File Upload Dropzone -->
        <div class="upload-area" onclick="document.getElementById('gAddPhotoFile').click()" style="cursor:pointer;background:#ffffff;border:2px dashed #0284c7;padding:22px;border-radius:10px;text-align:center;margin-bottom:14px;transition:all 0.2s">
          <input type="file" id="gAddPhotoFile" accept="image/*" multiple style="display:none">
          <div style="font-size:2.4rem">📁 ➕</div>
          <div style="font-size:1rem;font-weight:700;color:#0369a1;margin-top:6px">คลิกที่นี่เพื่อเลือกรูปภาพจากเครื่อง (เลือกพร้อมกันกี่รูปก็ได้)</div>
          <div style="font-size:0.82rem;color:#64748b;margin-top:4px">💡 สามารถกด Ctrl หรือ Shift บนคีย์บอร์ด เพื่อเลือกพร้อมกันได้ 10-50+ รูปในครั้งเดียว โดยไม่ต้องวางลิงก์!</div>
        </div>

        <div style="margin-bottom:10px;display:flex;gap:8px;align-items:center">
          <span style="font-size:0.82rem;color:#64748b;white-space:nowrap">หรือวางลิงก์ URL:</span>
          <input type="text" id="gNewPhotoUrl" placeholder="วางลิงก์ URL รูปภาพ หรือ ลิงก์ Google Photos Album" style="flex:1">
          <button type="button" class="btn btn-secondary btn-sm" onclick="addPhotoUrlToAlbum()">+ ดึงด้วย URL</button>
        </div>

        <div id="albumPhotosList" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px;max-height:280px;overflow-y:auto">
          ${renderAlbumPhotosAdmin()}
        </div>
      </div>
    </div>`,
    () => saveGalleryItem(id));

  setupImageUpload('gCoverFile', 'gCoverPrev', img => {
    tempGalleryCover = img;
    if(!tempGalleryPhotos.length) {
      tempGalleryPhotos.push(img);
      renderAlbumPhotosAdmin();
    }
  });

  const addPhotoFileInp = document.getElementById('gAddPhotoFile');
  if(addPhotoFileInp){
    addPhotoFileInp.addEventListener('change', () => {
      const files = Array.from(addPhotoFileInp.files || []);
      if(!files.length) return;
      
      toast(`⏳ กำลังโหลดรูปภาพ ${files.length} รูปเข้าอัลบั้ม...`, 'info');
      let loaded = 0;
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          tempGalleryPhotos.push(e.target.result);
          if(!tempGalleryCover) tempGalleryCover = e.target.result;
          loaded++;
          if(loaded === files.length) {
            renderAlbumPhotosAdmin();
            toast(`🎉 เพิ่มรูปภาพสำเร็จ ${files.length} รูปเข้าอัลบั้มเรียบร้อยแล้ว!`);
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }
}

function updateGalleryCoverUrl(val){
  const img = document.getElementById('gCoverPrev');
  if(img){
    if(val && val.trim()){
      img.src = val.trim();
      img.classList.add('show');
      tempGalleryCover = val.trim();
    }
  }
}

async function addPhotoUrlToAlbum(){
  const urlInp = document.getElementById('gNewPhotoUrl');
  if(!urlInp || !urlInp.value.trim()){ toast('กรุณาวางลิงก์ URL รูปภาพ', 'error'); return; }
  const rawText = urlInp.value.trim();

  // Automatic Google Photos Shared Album Extractor
  if(rawText.includes('photos.app.goo.gl') || rawText.includes('photos.google.com/share')){
    const extInp = document.getElementById('gExternalUrl');
    if(extInp && !extInp.value) extInp.value = rawText;

    toast('⏳ กำลังดึงรูปภาพทั้งหมดจาก Google Photos Album...', 'info');
    try {
      const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(rawText);
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents || '';
      
      const matches = html.match(/https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_\-]+/g) || 
                      html.match(/https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_\-]+/g);

      if(matches && matches.length) {
        const unique = Array.from(new Set(matches)).filter(u => u.length > 50 && !u.includes('photo.jpg'));
        let added = 0;
        unique.forEach(u => {
          const directUrl = u + '=w1200';
          if(!tempGalleryPhotos.includes(directUrl)){
            tempGalleryPhotos.push(directUrl);
            added++;
          }
        });
        if(!tempGalleryCover && tempGalleryPhotos.length) tempGalleryCover = tempGalleryPhotos[0];
        urlInp.value = '';
        renderAlbumPhotosAdmin();
        toast(`🎉 ดึงรูปภาพสำเร็จ ${added} รูปจาก Google Photos Album!`);
        return;
      }
    } catch(err) {
      console.warn('Google Photos fetch error:', err);
    }
  }

  // Split by newlines, commas, or spaces to support pasting multiple photo links at once
  const urls = rawText.split(/[\n,\s]+/).map(u => u.trim()).filter(u => u.length > 5 && (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image')));

  if(!urls.length){
    toast('กรุณาวางลิงก์ URL รูปภาพที่ถูกต้อง (เริ่มต้นด้วย http:// หรือ https://)', 'error');
    return;
  }

  let countAdded = 0;
  urls.forEach(url => {
    if(!tempGalleryPhotos.includes(url)){
      tempGalleryPhotos.push(url);
      countAdded++;
    }
  });

  if(!tempGalleryCover && tempGalleryPhotos.length) {
    tempGalleryCover = tempGalleryPhotos[0];
  }

  urlInp.value = '';
  renderAlbumPhotosAdmin();
  toast(`ดึงรูปภาพเข้าอัลบั้มสำเร็จเรียบร้อย (${countAdded} รูป)!`);
}

function removePhotoFromAlbum(idx){
  tempGalleryPhotos.splice(idx, 1);
  renderAlbumPhotosAdmin();
}

function renderAlbumPhotosAdmin(){
  const container = document.getElementById('albumPhotosList');
  const label = document.getElementById('photoCountLabel');
  if(label) label.textContent = tempGalleryPhotos.length;

  const html = tempGalleryPhotos.map((pUrl, i) => `
    <div style="position:relative;aspect-ratio:4/3;border-radius:6px;overflow:hidden;background:#cbd5e1">
      <img src="${pUrl}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover" alt="รูปที่ ${i+1}">
      <button type="button" onclick="removePhotoFromAlbum(${i})" style="position:absolute;top:4px;right:4px;background:rgba(239,68,68,0.9);color:white;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center" title="ลบรูปนี้">✕</button>
    </div>
  `).join('');

  if(container) container.innerHTML = html || `<div style="grid-column:span 4;color:#64748b;font-size:0.85rem;text-align:center;padding:20px">ยังไม่มีรูปในอัลบั้ม กดเพิ่มรูปด้านบนได้เลย</div>`;
  return html;
}

function saveGalleryItem(id){
  const title = document.getElementById('gTitle').value.trim();
  if(!title){ toast('กรุณากรอกชื่ออัลบั้ม', 'error'); return; }

  const coverUrlVal = document.getElementById('gCoverUrl') ? document.getElementById('gCoverUrl').value.trim() : '';
  const finalCover = tempGalleryCover || coverUrlVal || (tempGalleryPhotos[0] || 'tech_banner_1.jpg');

  const d = getData();
  if(!d.gallery) d.gallery = [];
  const index = id ? d.gallery.findIndex(x => x.id === id) : -1;

  const obj = {
    id: id || uid(),
    title,
    date: document.getElementById('gDate').value.trim(),
    desc: document.getElementById('gDesc').value.trim(),
    externalUrl: document.getElementById('gExternalUrl') ? document.getElementById('gExternalUrl').value.trim() : '',
    image: finalCover,
    photos: tempGalleryPhotos.length ? tempGalleryPhotos : [finalCover]
  };

  if(index >= 0) d.gallery[index] = obj;
  else d.gallery.push(obj);

  saveData(d);
  closeModal();
  renderGallery();
  toast(id ? 'แก้ไขอัลบั้มภาพสำเร็จ!' : 'สร้างอัลบั้มภาพใหม่สำเร็จ!');
}

function deleteGalleryItem(id){
  showConfirm('ต้องการลบภาพผลงานนี้?', () => {
    const d = getData();
    if(d.gallery) d.gallery = d.gallery.filter(x => x.id !== id);
    saveData(d);
    closeConfirm();
    renderGallery();
    toast('ลบภาพผลงานเรียบร้อยแล้ว', 'warning');
  });
}

/* ============================================================
   SECTION: CATEGORIES
   ============================================================ */
function renderCategories(){
  const d=getData();
  document.getElementById('section-categories').innerHTML=`
    <div class="section-header">
      <div><h2>หมวดหมู่</h2><div class="sub">ใช้กรองผลงานในหน้าเว็บไซต์</div></div>
      <button class="btn btn-primary" onclick="editCategory(null)">+ เพิ่มหมวดหมู่</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>#</th><th>ชื่อหมวดหมู่</th><th>Value (slug)</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${d.categories.map((c,i)=>`
              <tr>
                <td><span class="badge badge-gray">${i+1}</span></td>
                <td><strong>${esc(c.name)}</strong></td>
                <td><code style="background:#f3f4f6;padding:3px 8px;border-radius:6px;font-size:.78rem">${esc(c.value)}</code></td>
                <td><div class="action-btns"><button class="btn btn-edit btn-sm" onclick="editCategory('${c.id}')">✏️ แก้ไข</button><button class="btn btn-delete btn-sm" onclick="deleteCategory('${c.id}')">🗑 ลบ</button></div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
function editCategory(id){
  const d=getData();
  const c=id?d.categories.find(x=>x.id===id):{id:null,name:'',value:''};
  if(!c) return;
  showModal(id?'แก้ไขหมวดหมู่':'เพิ่มหมวดหมู่',`
    <div class="form-grid">
      <div class="form-group"><label>ชื่อหมวดหมู่ *</label><input type="text" id="catName" value="${esc(c.name)}" placeholder="เช่น เว็บไซต์"></div>
      <div class="form-group"><label>Value (slug) *</label><input type="text" id="catValue" value="${esc(c.value)}" placeholder="เช่น web"><div class="form-hint">ใช้ภาษาอังกฤษ ตัวพิมพ์เล็ก ไม่มีช่องว่าง</div></div>
    </div>`,()=>saveCategory(id));
}
function saveCategory(id){
  const name=document.getElementById('catName').value.trim();
  const value=document.getElementById('catValue').value.trim().toLowerCase().replace(/\s+/g,'-');
  if(!name||!value){ toast('กรุณากรอกข้อมูลให้ครบ','error'); return; }
  const d=getData();
  const obj={id:id||uid(),name,value};
  if(id){ const idx=d.categories.findIndex(x=>x.id===id); if(idx>-1) d.categories[idx]=obj; }
  else d.categories.push(obj);
  saveData(d); closeModal(); renderCategories(); toast(id?'แก้ไขหมวดหมู่แล้ว!':'เพิ่มหมวดหมู่แล้ว!');
}
function deleteCategory(id){ showConfirm('ต้องการลบหมวดหมู่นี้?',()=>{ const d=getData(); d.categories=d.categories.filter(x=>x.id!==id); saveData(d); closeConfirm(); renderCategories(); toast('ลบหมวดหมู่แล้ว','warning'); }); }

/* ============================================================
   SECTION: PORTFOLIO
   ============================================================ */
function renderPortfolio(){
  const d=getData();
  document.getElementById('section-portfolio').innerHTML=`
    <div class="section-header">
      <div><h2>ผลงาน</h2><div class="sub">จัดการ Portfolio (${d.portfolio.length} รายการ)</div></div>
      <button class="btn btn-primary" onclick="editPortfolio(null)">+ เพิ่มผลงาน</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>ผลงาน</th><th>Tech Stack</th><th>หมวดหมู่</th><th>ขนาด</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${d.portfolio.length===0?`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🖼</div><p>ยังไม่มีผลงาน กดเพิ่มผลงานเลย!</p></div></td></tr>`:
              d.portfolio.map(p=>`
                <tr>
                  <td><div class="item-preview">
                    <div class="item-thumb" style="background:${grad(p.gradStart,p.gradEnd)}">${p.image?`<img src="${p.image}" alt="">`:p.icon||'🖼'}</div>
                    <div class="item-info"><strong>${esc(p.title)}</strong><span>คลิกแก้ไขเพื่อดูรายละเอียด</span></div>
                  </div></td>
                  <td style="font-size:.78rem;color:#6b7280">${esc(p.tech)}</td>
                  <td><span class="badge badge-blue">${esc(p.category)}</span></td>
                  <td>${p.large?'<span class="badge badge-purple">กว้าง</span>':'<span class="badge badge-gray">ปกติ</span>'}</td>
                  <td><div class="action-btns"><button class="btn btn-edit btn-sm" onclick="editPortfolio('${p.id}')">✏️ แก้ไข</button><button class="btn btn-delete btn-sm" onclick="deletePortfolio('${p.id}')">🗑 ลบ</button></div></td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
function editPortfolio(id){
  const d=getData();
  const p=id?d.portfolio.find(x=>x.id===id):{id:null,title:'',tech:'',category:'web',gradStart:'#667eea',gradEnd:'#764ba2',icon:'🎯',image:null,large:false};
  if(!p) return;
  tempPortfolioImage=p.image;
  const catOpts=d.categories.map(c=>`<option value="${esc(c.value)}" ${p.category===c.value?'selected':''}>${esc(c.name)}</option>`).join('');
  const gradients=[['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb'],['#fbc2eb','#a6c1ee'],['#fddb92','#d1fdff'],['#30cfd0','#330867'],['#667eea','#3b82f6']];
  showModal(id?'แก้ไขผลงาน':'เพิ่มผลงาน',`
    <div class="form-grid">
      <div class="form-group"><label>ชื่อโปรเจค *</label><input type="text" id="pTitle" value="${esc(p.title)}" placeholder="ชื่อผลงาน"></div>
      <div class="form-group"><label>Tech Stack</label><input type="text" id="pTech" value="${esc(p.tech)}" placeholder="React · Node.js · MongoDB"></div>
      <div class="form-group"><label>หมวดหมู่</label><select id="pCat">${catOpts}</select></div>
      <div class="form-group"><label>ไอคอน (Emoji)</label><input type="text" id="pIcon" value="${esc(p.icon||'🎯')}" placeholder="🎯"></div>
      <div class="form-group"><label>สีเริ่มต้น Gradient</label><div style="display:flex;gap:8px"><input type="color" id="pGS" value="${p.gradStart}" onchange="previewPortGrad()"><input type="text" value="${esc(p.gradStart)}" id="pGST" style="flex:1" onchange="this.previousElementSibling.previousElementSibling.value=this.value;previewPortGrad()"></div></div>
      <div class="form-group"><label>สีปลาย Gradient</label><div style="display:flex;gap:8px"><input type="color" id="pGE" value="${p.gradEnd}" onchange="previewPortGrad()"><input type="text" value="${esc(p.gradEnd)}" id="pGET" style="flex:1" onchange="this.previousElementSibling.previousElementSibling.value=this.value;previewPortGrad()"></div></div>
      <div class="form-group full">
        <label>Gradient สำเร็จรูป</label>
        <div class="grad-presets">${gradients.map(([s,e])=>`<div class="grad-preset ${p.gradStart===s&&p.gradEnd===e?'active':''}" style="background:${grad(s,e)}" onclick="setPortGrad('${s}','${e}',this)" title="${s} → ${e}"></div>`).join('')}</div>
        <div id="gradPreview" style="height:50px;border-radius:10px;margin-top:10px;background:${grad(p.gradStart,p.gradEnd)};display:flex;align-items:center;justify-content:center;font-size:1.5rem">${p.icon||'🎯'}</div>
      </div>
      <div class="form-group full">
        <label>รูปภาพผลงาน / อัลบั้ม (เลือกได้ 2 วิธี)</label>
        
        <div style="margin-bottom:12px">
          <label style="font-size:0.82rem;color:var(--text-muted);display:block;margin-bottom:4px">🔗 วิธีที่ 1: วางลิงก์รูปภาพ (จาก Google Photos, Facebook Page หรือ URL รูปภาพ)</label>
          <input type="text" id="pImgUrl" value="${esc(p.image||'')}" placeholder="https://... (วางลิงก์รูปภาพที่นี่)" oninput="updatePortImgUrl(this.value)">
        </div>

        <div>
          <label style="font-size:0.82rem;color:var(--text-muted);display:block;margin-bottom:4px">💻 วิธีที่ 2: อัปโหลดรูปภาพจากเครื่องคอมพิวเตอร์ผู้ดูแลระบบ (Local Machine)</label>
          <div class="upload-area" onclick="document.getElementById('pFile').click()" style="cursor:pointer">
            <input type="file" id="pFile" accept="image/*" style="display:none">
            <div class="up-icon">🖼️</div>
            <div class="up-text">คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่องผู้ดูแลระบบ</div>
          </div>
        </div>

        <div style="margin-top:12px">
          <label style="font-size:0.82rem;color:var(--text-muted);display:block;margin-bottom:4px">🖼️ ตัวอย่างรูปภาพผลงานที่จะแสดง:</label>
          <img id="pImgPrev" class="img-preview ${p.image?'show':''}" src="${p.image||''}" alt="preview" style="max-height:220px;border-radius:8px;object-fit:cover">
        </div>
      </div>
      <div class="form-group full">
        <div class="toggle-wrap"><label class="toggle"><input type="checkbox" id="pLarge" ${p.large?'checked':''}><span class="toggle-sl"></span></label><span class="toggle-label">แสดงแบบกว้าง 2 คอลัมน์</span></div>
      </div>
    </div>`,()=>savePortfolio(id));
  setupImageUpload('pFile','pImgPrev',img=>{
    tempPortfolioImage=img;
    const urlInp = document.getElementById('pImgUrl');
    if(urlInp) urlInp.value = '';
  });
}
function updatePortImgUrl(val){
  const img = document.getElementById('pImgPrev');
  if(img){
    if(val && val.trim()){
      img.src = val.trim();
      img.classList.add('show');
      tempPortfolioImage = val.trim();
    } else {
      img.src = '';
      img.classList.remove('show');
      tempPortfolioImage = null;
    }
  }
}
function previewPortGrad(){
  const s=document.getElementById('pGS').value;
  const e=document.getElementById('pGE').value;
  document.getElementById('pGST').value=s;
  document.getElementById('pGET').value=e;
  const g=document.getElementById('gradPreview');
  if(g){ g.style.background=grad(s,e); }
}
function setPortGrad(s,e,el){
  document.getElementById('pGS').value=s;document.getElementById('pGE').value=e;
  document.getElementById('pGST').value=s;document.getElementById('pGET').value=e;
  document.querySelectorAll('.grad-preset').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  const g=document.getElementById('gradPreview'); if(g){ g.style.background=grad(s,e); }
}
function savePortfolio(id){
  const title=document.getElementById('pTitle').value.trim();
  if(!title){ toast('กรุณากรอกชื่อผลงาน','error'); return; }
  const urlVal = document.getElementById('pImgUrl') ? document.getElementById('pImgUrl').value.trim() : '';
  const finalImg = tempPortfolioImage || urlVal || null;

  const d=getData();
  const obj={
    id:id||uid(),title,
    tech:document.getElementById('pTech').value.trim(),
    category:document.getElementById('pCat').value,
    gradStart:document.getElementById('pGS').value,
    gradEnd:document.getElementById('pGE').value,
    icon:document.getElementById('pIcon').value||'🎯',
    image:finalImg,
    large:document.getElementById('pLarge').checked
  };
  if(id){ const idx=d.portfolio.findIndex(x=>x.id===id); if(idx>-1) d.portfolio[idx]=obj; }
  else d.portfolio.push(obj);
  saveData(d); closeModal(); renderPortfolio(); toast(id?'แก้ไขผลงานสำเร็จ!':'เพิ่มผลงานสำเร็จ!');
}
function deletePortfolio(id){ showConfirm('ต้องการลบผลงานนี้?',()=>{ const d=getData(); d.portfolio=d.portfolio.filter(x=>x.id!==id); saveData(d); closeConfirm(); renderPortfolio(); toast('ลบผลงานแล้ว','warning'); }); }

/* ============================================================
   SECTION: TEAM
   ============================================================ */
function renderTeam(){
  const d=getData();
  document.getElementById('section-team').innerHTML=`
    <div class="section-header">
      <div><h2>ทีมงาน</h2><div class="sub">จัดการสมาชิกในทีม (${d.team.length} คน)</div></div>
      <button class="btn btn-primary" onclick="editTeam(null)">+ เพิ่มสมาชิก</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>สมาชิก</th><th>ตำแหน่ง</th><th>ประวัติ</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${d.team.length===0?`<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">👥</div><p>ยังไม่มีสมาชิกทีม</p></div></td></tr>`:
              d.team.map(t=>`
                <tr>
                  <td><div class="item-preview">
                    <div class="item-thumb" style="background:${grad(t.gradStart,t.gradEnd)}">${t.image?`<img src="${t.image}" alt="">`:'<span style="color:white;font-weight:800;font-size:.9rem">'+esc(t.avatar)+'</span>'}</div>
                    <div class="item-info"><strong>${esc(t.name)}</strong></div>
                  </div></td>
                  <td><span class="badge badge-purple">${esc(t.role)}</span></td>
                  <td style="font-size:.78rem;color:#6b7280;max-width:200px">${esc(t.bio.substring(0,60))}...</td>
                  <td><div class="action-btns"><button class="btn btn-edit btn-sm" onclick="editTeam('${t.id}')">✏️ แก้ไข</button><button class="btn btn-delete btn-sm" onclick="deleteTeam('${t.id}')">🗑 ลบ</button></div></td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
function editTeam(id){
  const d=getData();
  const t=id?d.team.find(x=>x.id===id):{id:null,name:'',role:'',bio:'',avatar:'A',gradStart:'#667eea',gradEnd:'#764ba2',image:null};
  if(!t) return;
  tempTeamImage=t.image;
  const grads=[['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a8edea','#fed6e3'],['#d299c2','#fef9d7'],['#96fbc4','#f9f586']];
  showModal(id?'แก้ไขสมาชิกทีม':'เพิ่มสมาชิกทีม',`
    <div class="form-grid">
      <div class="form-group"><label>ชื่อ-นามสกุล *</label><input type="text" id="tName" value="${esc(t.name)}" placeholder="ชื่อเต็ม"></div>
      <div class="form-group"><label>ตำแหน่ง *</label><input type="text" id="tRole" value="${esc(t.role)}" placeholder="CEO & Co-Founder"></div>
      <div class="form-group full"><label>ประวัติโดยย่อ</label><textarea id="tBio" rows="3">${esc(t.bio)}</textarea></div>
      <div class="form-group"><label>ตัวอักษรอวาตาร์</label><input type="text" id="tAvatar" value="${esc(t.avatar)}" maxlength="2" placeholder="ส"></div>
      <div class="form-group full">
        <label>สี Gradient</label>
        <div class="grad-presets">${grads.map(([s,e])=>`<div class="grad-preset ${t.gradStart===s&&t.gradEnd===e?'active':''}" style="background:${grad(s,e)}" onclick="setTeamGrad('${s}','${e}',this)"></div>`).join('')}</div>
        <div id="teamGradPreview" style="height:50px;border-radius:10px;margin-top:10px;background:${grad(t.gradStart,t.gradEnd)};display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:1.5rem">${t.avatar||'A'}</div>
        <input type="hidden" id="tGS" value="${t.gradStart}"><input type="hidden" id="tGE" value="${t.gradEnd}">
      </div>
      <div class="form-group full">
        <label>รูปภาพ (ไม่บังคับ)</label>
        <div class="upload-area"><input type="file" id="tFile" accept="image/*"><div class="up-icon">👤</div><div class="up-text">อัปโหลดรูปสมาชิก</div></div>
        <img id="tImgPrev" class="img-preview ${t.image?'show':''}" src="${t.image||''}" alt="preview">
      </div>
    </div>`,()=>saveTeam(id));
  setupImageUpload('tFile','tImgPrev',img=>{ tempTeamImage=img; });
  document.getElementById('tAvatar').addEventListener('input',e=>{ const p=document.getElementById('teamGradPreview'); if(p) p.textContent=e.target.value||'A'; });
}
function setTeamGrad(s,e,el){
  document.getElementById('tGS').value=s; document.getElementById('tGE').value=e;
  document.querySelectorAll('.grad-preset').forEach(x=>x.classList.remove('active')); el.classList.add('active');
  const p=document.getElementById('teamGradPreview'); if(p) p.style.background=grad(s,e);
}
function saveTeam(id){
  const name=document.getElementById('tName').value.trim();
  const role=document.getElementById('tRole').value.trim();
  if(!name||!role){ toast('กรุณากรอกชื่อและตำแหน่ง','error'); return; }
  const d=getData();
  const obj={id:id||uid(),name,role,bio:document.getElementById('tBio').value.trim(),avatar:document.getElementById('tAvatar').value.trim()||name[0],gradStart:document.getElementById('tGS').value,gradEnd:document.getElementById('tGE').value,image:tempTeamImage};
  if(id){ const idx=d.team.findIndex(x=>x.id===id); if(idx>-1) d.team[idx]=obj; }
  else d.team.push(obj);
  saveData(d); closeModal(); renderTeam(); toast(id?'แก้ไขข้อมูลสำเร็จ!':'เพิ่มสมาชิกสำเร็จ!');
}
function deleteTeam(id){ showConfirm('ต้องการลบสมาชิกคนนี้?',()=>{ const d=getData(); d.team=d.team.filter(x=>x.id!==id); saveData(d); closeConfirm(); renderTeam(); toast('ลบสมาชิกแล้ว','warning'); }); }

/* ============================================================
   SECTION: TESTIMONIALS
   ============================================================ */
function renderTestimonials(){
  const d=getData();
  document.getElementById('section-testimonials').innerHTML=`
    <div class="section-header">
      <div><h2>รีวิวลูกค้า</h2><div class="sub">จัดการ Testimonials (${d.testimonials.length} รายการ)</div></div>
      <button class="btn btn-primary" onclick="editTestimonial(null)">+ เพิ่มรีวิว</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table class="admin-table">
          <thead><tr><th>ลูกค้า</th><th>ตำแหน่ง</th><th>รีวิว</th><th>ดาว</th><th>การจัดการ</th></tr></thead>
          <tbody>
            ${d.testimonials.length===0?`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">⭐</div><p>ยังไม่มีรีวิว</p></div></td></tr>`:
              d.testimonials.map(t=>`
                <tr>
                  <td><div class="item-preview"><div class="item-thumb" style="background:${grad(t.gradStart,t.gradEnd)};color:white;font-weight:900">${esc(t.initial)}</div><div class="item-info"><strong>${esc(t.author)}</strong></div></div></td>
                  <td style="font-size:.78rem;color:#6b7280">${esc(t.position)}</td>
                  <td style="font-size:.78rem;color:#6b7280;max-width:250px">${esc(t.text.substring(0,60))}...</td>
                  <td><span style="color:#fbbf24">{'★'.repeat(t.rating)}</span></td>
                  <td><div class="action-btns"><button class="btn btn-edit btn-sm" onclick="editTestimonial('${t.id}')">✏️ แก้ไข</button><button class="btn btn-delete btn-sm" onclick="deleteTestimonial('${t.id}')">🗑 ลบ</button></div></td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  // Fix stars rendering
  document.querySelectorAll('#section-testimonials td').forEach(td=>{
    if(td.innerHTML.includes("{'★'.repeat(")) td.innerHTML='<span style="color:#fbbf24">★★★★★</span>';
  });
}
function editTestimonial(id){
  const d=getData();
  const t=id?d.testimonials.find(x=>x.id===id):{id:null,text:'',author:'',position:'',rating:5,initial:'A',gradStart:'#667eea',gradEnd:'#764ba2'};
  if(!t) return;
  const grads=[['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb']];
  showModal(id?'แก้ไขรีวิว':'เพิ่มรีวิว',`
    <div class="form-grid">
      <div class="form-group full"><label>ข้อความรีวิว *</label><textarea id="tmText" rows="4">${esc(t.text)}</textarea></div>
      <div class="form-group"><label>ชื่อลูกค้า *</label><input type="text" id="tmAuthor" value="${esc(t.author)}"></div>
      <div class="form-group"><label>ตำแหน่ง/บริษัท</label><input type="text" id="tmPos" value="${esc(t.position)}"></div>
      <div class="form-group"><label>ตัวอักษรย่อ</label><input type="text" id="tmInit" value="${esc(t.initial)}" maxlength="2"></div>
      <div class="form-group"><label>จำนวนดาว (1-5)</label><input type="number" id="tmRating" value="${t.rating}" min="1" max="5"></div>
      <div class="form-group full">
        <label>สี Avatar</label>
        <div class="grad-presets">${grads.map(([s,e])=>`<div class="grad-preset ${t.gradStart===s&&t.gradEnd===e?'active':''}" style="background:${grad(s,e)}" onclick="setTmGrad('${s}','${e}',this)"></div>`).join('')}</div>
        <input type="hidden" id="tmGS" value="${t.gradStart}"><input type="hidden" id="tmGE" value="${t.gradEnd}">
      </div>
    </div>`,()=>saveTestimonial(id));
}
function setTmGrad(s,e,el){ document.getElementById('tmGS').value=s; document.getElementById('tmGE').value=e; document.querySelectorAll('.grad-preset').forEach(x=>x.classList.remove('active')); el.classList.add('active'); }
function saveTestimonial(id){
  const text=document.getElementById('tmText').value.trim();
  const author=document.getElementById('tmAuthor').value.trim();
  if(!text||!author){ toast('กรุณากรอกข้อความและชื่อลูกค้า','error'); return; }
  const d=getData();
  const obj={id:id||uid(),text,author,position:document.getElementById('tmPos').value.trim(),rating:Math.min(5,Math.max(1,parseInt(document.getElementById('tmRating').value)||5)),initial:document.getElementById('tmInit').value.trim()||author[0],gradStart:document.getElementById('tmGS').value,gradEnd:document.getElementById('tmGE').value};
  if(id){ const idx=d.testimonials.findIndex(x=>x.id===id); if(idx>-1) d.testimonials[idx]=obj; }
  else d.testimonials.push(obj);
  saveData(d); closeModal(); renderTestimonials(); toast(id?'แก้ไขรีวิวสำเร็จ!':'เพิ่มรีวิวสำเร็จ!');
}
function deleteTestimonial(id){ showConfirm('ต้องการลบรีวิวนี้?',()=>{ const d=getData(); d.testimonials=d.testimonials.filter(x=>x.id!==id); saveData(d); closeConfirm(); renderTestimonials(); toast('ลบรีวิวแล้ว','warning'); }); }

/* ============================================================
   SECTION: COLUMNS (Custom content sections)
   ============================================================ */
function renderColumns(){
  const d=getData();
  document.getElementById('section-columns').innerHTML=`
    <div class="section-header">
      <div><h2>คอลัมน์เนื้อหา</h2><div class="sub">เพิ่มส่วนเนื้อหาพิเศษในหน้าเว็บ (${d.columns.length} คอลัมน์)</div></div>
      <button class="btn btn-primary" onclick="editColumn(null)">+ เพิ่มคอลัมน์</button>
    </div>
    <div class="card">
      ${d.columns.length===0?`<div class="empty-state"><div class="empty-icon">📋</div><p>ยังไม่มีคอลัมน์เนื้อหา<br>กดเพิ่มเพื่อสร้างส่วนเนื้อหาใหม่ในเว็บไซต์</p></div>`:
        d.columns.map(c=>`
          <div class="column-card">
            <div class="column-info">
              <strong>${esc(c.title)}</strong>
              <p>${esc((c.content||'').substring(0,80))}...</p>
            </div>
            <div class="column-status">
              ${c.visible?'<span class="badge badge-green">แสดง</span>':'<span class="badge badge-red">ซ่อน</span>'}
              <button class="btn btn-edit btn-sm" onclick="editColumn('${c.id}')">✏️</button>
              <button class="btn btn-delete btn-sm" onclick="deleteColumn('${c.id}')">🗑</button>
              <button class="btn btn-secondary btn-sm" onclick="toggleColumn('${c.id}')">${c.visible?'🙈 ซ่อน':'👁 แสดง'}</button>
            </div>
          </div>`).join('')}
    </div>`;
}
function editColumn(id){
  const d=getData();
  const c=id?d.columns.find(x=>x.id===id):{id:null,title:'',content:'',image:null,visible:true,textAlign:'left',containerWidth:'standard'};
  if(!c) return;
  showModal(id?'แก้ไขคอลัมน์':'เพิ่มคอลัมน์เนื้อหา',`
    <div class="form-grid">
      <div class="form-group full"><label>ชื่อหัวข้อ *</label><input type="text" id="colTitle" value="${esc(c.title)}" placeholder="หัวข้อคอลัมน์"></div>
      <div class="form-group full"><label>เนื้อหา (รองรับ HTML พื้นฐาน)</label><textarea id="colContent" rows="6">${esc(c.content)}</textarea></div>
      <div class="form-group">
        <label>การจัดตำแหน่งตัวหนังสือ</label>
        <select id="colAlign">
          <option value="left" ${c.textAlign==='left'||!c.textAlign?'selected':''}>⬅️ ชิดซ้าย (Left)</option>
          <option value="center" ${c.textAlign==='center'?'selected':''}>↔️ กึ่งกลาง (Center)</option>
          <option value="right" ${c.textAlign==='right'?'selected':''}>➡️ ชิดขวา (Right)</option>
        </select>
      </div>
      <div class="form-group">
        <label>ความกว้างช่องเนื้อหา (Container Width)</label>
        <select id="colWidth">
          <option value="standard" ${c.containerWidth==='standard'||!c.containerWidth?'selected':''}>📐 ช่องกว้างปกติ (Standard 1200px)</option>
          <option value="wide" ${c.containerWidth==='wide'?'selected':''}>↔️ ช่องกว้างพิเศษ (Wide 1400px)</option>
          <option value="full" ${c.containerWidth==='full'?'selected':''}>🖥️ ช่องกว้างเต็มจอ (Full Width 100%)</option>
        </select>
      </div>
      <div class="form-group full">
        <label>รูปภาพประกอบ (ไม่บังคับ)</label>
        <div class="upload-area"><input type="file" id="colFile" accept="image/*"><div class="up-icon">🖼️</div><div class="up-text">อัปโหลดรูปประกอบ</div></div>
        <img id="colImgPrev" class="img-preview ${c.image?'show':''}" src="${c.image||''}" alt="preview">
      </div>
      <div class="form-group full">
        <div class="toggle-wrap"><label class="toggle"><input type="checkbox" id="colVisible" ${c.visible!==false?'checked':''}><span class="toggle-sl"></span></label><span class="toggle-label">แสดงในหน้าเว็บไซต์</span></div>
      </div>
    </div>`,()=>saveColumn(id));
  let colImg=c.image;
  setupImageUpload('colFile','colImgPrev',img=>{ colImg=img; });
  const origSave=modalSaveCallback;
  modalSaveCallback=()=>{ window._colImg=colImg; origSave(); };
}
function saveColumn(id){
  const title=document.getElementById('colTitle').value.trim();
  if(!title){ toast('กรุณากรอกชื่อหัวข้อ','error'); return; }
  const d=getData();
  const obj={
    id:id||uid(),
    title,
    content:document.getElementById('colContent').value.trim(),
    textAlign:document.getElementById('colAlign').value,
    containerWidth:document.getElementById('colWidth').value,
    image:window._colImg||null,
    visible:document.getElementById('colVisible').checked
  };
  if(id){ const idx=d.columns.findIndex(x=>x.id===id); if(idx>-1) d.columns[idx]=obj; }
  else d.columns.push(obj);
  if(saveData(d)){
    closeModal(); renderColumns(); toast(id?'แก้ไขคอลัมน์สำเร็จ!':'เพิ่มคอลัมน์สำเร็จ!');
  }
}
function toggleColumn(id){ const d=getData(); const c=d.columns.find(x=>x.id===id); if(c){ c.visible=!c.visible; saveData(d); renderColumns(); toast(c.visible?'แสดงคอลัมน์แล้ว':'ซ่อนคอลัมน์แล้ว'); } }
function deleteColumn(id){ showConfirm('ต้องการลบคอลัมน์นี้?',()=>{ const d=getData(); d.columns=d.columns.filter(x=>x.id!==id); saveData(d); closeConfirm(); renderColumns(); toast('ลบคอลัมน์แล้ว','warning'); }); }

/* ============================================================
   SECTION: CONTACT
   ============================================================ */
function renderContact(){
  const d=getData(); const c=d.contact;
  const defaultMap = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.7277259163273!2d100.53696531483017!3d13.734689990358482!2m3!1f0!1f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ed8b3687353%3A0xe541c49615a498b5!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2sth!4v1620000000000!5m2!1sen!2sth';
  document.getElementById('section-contact').innerHTML=`
    <div class="section-header"><div><h2>ข้อมูลติดต่อ & แผนที่ตั้ง</h2><div class="sub">แก้ไขที่อยู่ เบอร์โทร อีเมล และแผนที่ตั้ง Google Maps</div></div></div>
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">📞</span>ข้อมูลการติดต่อ</div></div>
      <div class="form-grid">
        <div class="form-group full"><label>ที่อยู่</label><textarea id="cAddr" rows="3">${esc(c.address)}</textarea></div>
        <div class="form-group"><label>เบอร์โทร (แต่ละเบอร์แยกด้วย Enter)</label><textarea id="cPhone" rows="3">${esc(c.phone)}</textarea></div>
        <div class="form-group"><label>อีเมล (แต่ละอีเมลแยกด้วย Enter)</label><textarea id="cEmail" rows="3">${esc(c.email)}</textarea></div>
        <div class="form-group full"><label>เวลาทำการ</label><textarea id="cHours" rows="3">${esc(c.hours)}</textarea></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">📍</span>แผนที่ตั้งบริษัท (Google Maps Location)</div></div>
      <div class="form-grid">
        <div class="form-group full">
          <label>ลิงก์แผนที่ฝัง Google Maps (Embed URL หรือโค้ด &lt;iframe&gt;)</label>
          <textarea id="cMapUrl" rows="3" placeholder="วางลิงก์ https://www.google.com/maps/embed?pb=... หรือโค้ด <iframe ...>">${esc(c.mapUrl||defaultMap)}</textarea>
          <div style="font-size:0.78rem;color:#64748b;margin-top:4px">
            💡 <strong>วิธีเอาโค้ดแผนที่:</strong> เปิด Google Maps -> ค้นหาสถานที่ตั้งบริษัท -> กดปุ่ม "แชร์" (Share) -> เลือกแท็บ "ฝังแผนที่" (Embed a map) -> คัดลอกลิงก์หรือ HTML มาวางในช่องนี้ได้เลยครับ
          </div>
        </div>
        <div class="form-group full">
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="cShowMap" ${c.showMap!==false?'checked':''}><span class="toggle-sl"></span></label>
            <span class="toggle-label">แสดงกล่องแผนที่ในส่วนการติดต่อของเว็บไซต์</span>
          </div>
        </div>
      </div>
      <div style="margin-top:20px"><button class="btn btn-primary" onclick="saveContact()">💾 บันทึกข้อมูลติดต่อ & แผนที่</button></div>
    </div>`;
}

function saveContact(){
  const d=getData();
  let mapUrlVal = document.getElementById('cMapUrl') ? document.getElementById('cMapUrl').value.trim() : '';
  if(mapUrlVal.includes('<iframe')) {
    const match = mapUrlVal.match(/src=["']([^"']+)["']/);
    if(match && match[1]) mapUrlVal = match[1];
  }
  d.contact={
    address:document.getElementById('cAddr').value.trim(),
    phone:document.getElementById('cPhone').value.trim(),
    email:document.getElementById('cEmail').value.trim(),
    hours:document.getElementById('cHours').value.trim(),
    mapUrl:mapUrlVal,
    showMap:document.getElementById('cShowMap') ? document.getElementById('cShowMap').checked : true
  };
  saveData(d); toast('บันทึกข้อมูลติดต่อ & แผนที่สำเร็จ! 🎉');
}

/* ============================================================
   SECTION: THEME (สีและธีมเว็บไซต์)
   ============================================================ */
const THEME_PRESETS = [
  { id:'purple', name:'💜 ม่วง-ฟ้า (Default)', desc:'NexGen Official Theme', primary:'#7c3aed', start:'#7c3aed', middle:'#3b82f6', end:'#059669', bgTheme:'light' },
  { id:'emerald', name:'🟢 เขียวมรกต (Emerald)', desc:'Green Tech & Sustainability', primary:'#059669', start:'#059669', middle:'#10b981', end:'#06b6d4', bgTheme:'light' },
  { id:'sunset', name:'💖 ชมพู-ม่วง (Sunset)', desc:'Vibrant Sunset Gradient', primary:'#db2777', start:'#ec4899', middle:'#8b5cf6', end:'#3b82f6', bgTheme:'light' },
  { id:'ocean', name:'🌊 น้ำเงินโอเชียน (Ocean)', desc:'Deep Ocean & Cyan Tech', primary:'#2563eb', start:'#1d4ed8', middle:'#0284c7', end:'#06b6d4', bgTheme:'light' },
  { id:'rose', name:'🌹 โรสด์-แอมเบอร์ (Rose)', desc:'Warm Luxury Corporate', primary:'#e11d48', start:'#f43f5e', middle:'#fb923c', end:'#f59e0b', bgTheme:'light' },
  { id:'dark', name:'🌙 ดาร์กโหมด (Dark)', desc:'Modern Sleek Dark Mode', primary:'#8b5cf6', start:'#a855f7', middle:'#3b82f6', end:'#06b6d4', bgTheme:'dark' },
  { id:'midnight', name:'🌌 มิดไนท์บลู (Midnight)', desc:'Deep Cyber Dark Blue', primary:'#38bdf8', start:'#38bdf8', middle:'#818cf8', end:'#c084fc', bgTheme:'midnight' }
];

function renderTheme(){
  const d=getData();
  const t=d.theme || DEFAULT_DATA.theme;
  
  document.getElementById('section-theme').innerHTML=`
    <div class="section-header">
      <div><h2>ธีมและสีเว็บไซต์</h2><div class="sub">ปรับแต่งพาเลทสี โทนแบรนด์ และโหมดแสดงผลของหน้าเว็บ</div></div>
    </div>

    <!-- PRESETS -->
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">🎨</span>ชุดสีสำเร็จรูป (Presets)</div></div>
      <div class="theme-presets-grid">
        ${THEME_PRESETS.map(p=>`
          <div class="theme-preset-card ${t.preset===p.id?'active':''}" onclick="selectThemePreset('${p.id}')">
            <div class="theme-preset-preview" style="background:${grad(p.start,p.end)}">${p.name.split(' ')[0]}</div>
            <div class="theme-preset-name">${esc(p.name)}</div>
            <div class="theme-preset-desc">${esc(p.desc)}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- CUSTOM COLOR PICKERS -->
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">🎛️</span>ปรับแต่งโทนสีเอง</div></div>
      <div class="form-grid">
        <div class="form-group">
          <label>สีหลัก (Primary Brand Color)</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="tPrimaryPick" value="${t.primaryColor}" onchange="updateThemeInput('tPrimary',this.value)">
            <input type="text" id="tPrimary" value="${esc(t.primaryColor)}" onchange="updateThemePick('tPrimaryPick',this.value)">
          </div>
        </div>
        <div class="form-group">
          <label>Gradient เริ่มต้น (Start Color)</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="tStartPick" value="${t.gradStart}" onchange="updateThemeInput('tStart',this.value)">
            <input type="text" id="tStart" value="${esc(t.gradStart)}" onchange="updateThemePick('tStartPick',this.value)">
          </div>
        </div>
        <div class="form-group">
          <label>Gradient ตรงกลาง (Middle Color)</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="tMiddlePick" value="${t.gradMiddle||t.gradEnd}" onchange="updateThemeInput('tMiddle',this.value)">
            <input type="text" id="tMiddle" value="${esc(t.gradMiddle||t.gradEnd)}" onchange="updateThemePick('tMiddlePick',this.value)">
          </div>
        </div>
        <div class="form-group">
          <label>Gradient ปลายทาง (End Color)</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="tEndPick" value="${t.gradEnd}" onchange="updateThemeInput('tEnd',this.value)">
            <input type="text" id="tEnd" value="${esc(t.gradEnd)}" onchange="updateThemePick('tEndPick',this.value)">
          </div>
        </div>

        <div class="form-group full">
          <label>โหมดพื้นหลังเว็บไซต์ (Background Style)</label>
          <select id="tBgTheme" onchange="toggleCustomBgFields(this.value);updateThemeLivePreview();">
            <option value="light" ${t.bgTheme==='light'?'selected':''}>⚪ ขาวสว่างสะอาด (Clean White Light Theme)</option>
            <option value="soft" ${t.bgTheme==='soft'?'selected':''}>📜 โทนอุ่นมินิมอล (Soft Warm Beige)</option>
            <option value="dark" ${t.bgTheme==='dark'?'selected':''}>🌙 ดาร์กโหมด (Modern Dark Mode)</option>
            <option value="midnight" ${t.bgTheme==='midnight'?'selected':''}>🌌 มิดไนท์บลู (Midnight Dark Blue)</option>
            <option value="custom" ${t.bgTheme==='custom'?'selected':''}>🎨 กำหนดสีพื้นหลัง & ข้อความเอง (Custom Color)</option>
          </select>
        </div>

        <div class="form-group" id="customBgGroup" style="display:${t.bgTheme==='custom'?'flex':'none'}">
          <label>สีพื้นหลัง (Background Color)</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="tBgPick" value="${t.bgColor||'#ffffff'}" onchange="updateThemeInput('tBg',this.value)">
            <input type="text" id="tBg" value="${esc(t.bgColor||'#ffffff')}" onchange="updateThemePick('tBgPick',this.value)">
          </div>
        </div>

        <div class="form-group" id="customTextGroup" style="display:${t.bgTheme==='custom'?'flex':'none'}">
          <label>สีตัวหนังสือ (Text Color)</label>
          <div style="display:flex;gap:8px">
            <input type="color" id="tTextPick" value="${t.textColor||'#0f0a1e'}" onchange="updateThemeInput('tText',this.value)">
            <input type="text" id="tText" value="${esc(t.textColor||'#0f0a1e')}" onchange="updateThemePick('tTextPick',this.value)">
          </div>
        </div>
      </div>
    </div>

    <!-- LIVE PREVIEW CARD -->
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="icon">👁️</span>ตัวอย่างสีสด (Live Preview)</div></div>
      <div id="themeLiveBox" class="theme-live-preview" style="background:#ffffff;border:1px solid rgba(0,0,0,0.1)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <span style="padding:4px 12px;border-radius:100px;background:rgba(124,58,237,0.1);color:#7c3aed;font-weight:800;font-size:0.75rem" id="prevBadge">นวัตกรรมดิจิทัล</span>
          <span style="font-size:0.8rem;color:#9ca3af" id="prevSub">ตัวอย่างส่วนหัวและปุ่ม</span>
        </div>
        <h3 id="prevTitle" style="font-size:1.6rem;font-weight:900;margin-bottom:12px;background:linear-gradient(135deg,#7c3aed,#3b82f6,#059669);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
          สร้างอนาคตดิจิทัลของคุณ
        </h3>
        <p id="prevBody" style="font-size:0.88rem;color:#4b5563;margin-bottom:20px;line-height:1.6">
          นี่คือตัวอย่างการแสดงผลข้อความ ปุ่ม และ Gradient เมื่อนำไปใช้ในหน้าเว็บไซต์จริงของคุณ
        </p>
        <div style="display:flex;gap:12px">
          <button id="prevBtn1" class="btn btn-primary">ข่าวสาร และผลงาน →</button>
          <button id="prevBtn2" class="btn btn-secondary">ติดต่อเรา</button>
        </div>
      </div>
      <div style="margin-top:24px;display:flex;gap:12px">
        <button class="btn btn-primary" onclick="saveTheme()">💾 บันทึกและใช้ธีมนี้</button>
        <button class="btn btn-secondary" onclick="renderTheme()">↩ รีเซ็ตค่าเดิม</button>
      </div>
    </div>`;

  updateThemeLivePreview();
}

function selectThemePreset(presetId){
  const p=THEME_PRESETS.find(x=>x.id===presetId);
  if(!p) return;
  document.getElementById('tPrimary').value=p.primary;
  document.getElementById('tPrimaryPick').value=p.primary;
  document.getElementById('tStart').value=p.start;
  document.getElementById('tStartPick').value=p.start;
  document.getElementById('tMiddle').value=p.middle;
  document.getElementById('tMiddlePick').value=p.middle;
  document.getElementById('tEnd').value=p.end;
  document.getElementById('tEndPick').value=p.end;
  
  const bgSel=document.getElementById('tBgTheme');
  if(bgSel){
    bgSel.value=p.bgTheme;
    toggleCustomBgFields(p.bgTheme);
  }

  document.querySelectorAll('.theme-preset-card').forEach(c=>c.classList.remove('active'));
  const activeCard=document.querySelector(`.theme-preset-card[onclick*="${presetId}"]`);
  if(activeCard) activeCard.classList.add('active');

  window._activePreset=presetId;
  updateThemeLivePreview();
}

function updateThemeInput(targetId, val){
  document.getElementById(targetId).value=val;
  updateThemeLivePreview();
}

function updateThemePick(pickId, val){
  if(/^#[0-9A-F]{6}$/i.test(val)){
    document.getElementById(pickId).value=val;
    updateThemeLivePreview();
  }
}

function toggleCustomBgFields(mode){
  const customBg=document.getElementById('customBgGroup');
  const customTxt=document.getElementById('customTextGroup');
  if(customBg && customTxt){
    const show=mode==='custom';
    customBg.style.display=show?'flex':'none';
    customTxt.style.display=show?'flex':'none';
  }
}

function updateThemeLivePreview(){
  const primary=document.getElementById('tPrimary').value||'#7c3aed';
  const start=document.getElementById('tStart').value||'#7c3aed';
  const middle=document.getElementById('tMiddle').value||'#3b82f6';
  const end=document.getElementById('tEnd').value||'#059669';
  const bgMode=document.getElementById('tBgTheme').value;
  const customBg=document.getElementById('tBg').value||'#ffffff';
  const customText=document.getElementById('tText').value||'#0f0a1e';

  const liveBox=document.getElementById('themeLiveBox');
  const prevTitle=document.getElementById('prevTitle');
  const prevBody=document.getElementById('prevBody');
  const prevBadge=document.getElementById('prevBadge');
  const prevBtn1=document.getElementById('prevBtn1');

  if(!liveBox) return;

  // Background & Text style
  if(bgMode==='dark'){
    liveBox.style.background='#0f0c1b';
    prevBody.style.color='#94a3b8';
  } else if(bgMode==='midnight'){
    liveBox.style.background='#0b1329';
    prevBody.style.color='#94a3b8';
  } else if(bgMode==='soft'){
    liveBox.style.background='#faf8f5';
    prevBody.style.color='#57534e';
  } else if(bgMode==='custom'){
    liveBox.style.background=customBg;
    prevBody.style.color=customText;
  } else {
    liveBox.style.background='#ffffff';
    prevBody.style.color='#4b5563';
  }

  // Title Gradient
  prevTitle.style.background=`linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
  prevTitle.style.webkitBackgroundClip='text';
  prevTitle.style.webkitTextFillColor='transparent';

  // Badge
  prevBadge.style.background=`${primary}1b`;
  prevBadge.style.color=primary;

  // Primary Button
  prevBtn1.style.background=`linear-gradient(135deg, ${start}, ${middle})`;
}

function saveTheme(){
  const d=getData();
  d.theme={
    primaryColor:document.getElementById('tPrimary').value.trim(),
    gradStart:document.getElementById('tStart').value.trim(),
    gradMiddle:document.getElementById('tMiddle').value.trim(),
    gradEnd:document.getElementById('tEnd').value.trim(),
    bgTheme:document.getElementById('tBgTheme').value,
    bgColor:document.getElementById('tBg').value.trim(),
    textColor:document.getElementById('tText').value.trim(),
    preset:window._activePreset||'custom'
  };
  saveData(d);
  toast('บันทึกธีมและสีเว็บไซต์เรียบร้อยแล้ว! 🎉');
}

/* ============================================================
   INIT
   ============================================================ */
function init(){
  if(!checkAuth()) return;
  const user=sessionStorage.getItem('nxg_admin_user')||'admin';
  document.getElementById('adminUser').textContent=user;
  document.getElementById('logoutBtn').addEventListener('click',logout);
  document.getElementById('confirmOkBtn').addEventListener('click',()=>{ if(confirmCallback) confirmCallback(); });
  document.querySelectorAll('.nav-item[data-section]').forEach(item=>{
    item.addEventListener('click',()=>showSection(item.dataset.section));
  });
  updateSidebarLogo();
  renderDashboard();
}

document.addEventListener('DOMContentLoaded',init);
