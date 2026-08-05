/* ------------------------------------------------------------------
 * ตั้งค่าเว็บรายงานการฝึกสอน
 *
 * แก้ค่า 2 ค่านี้ให้เป็นของโปรเจกต์ตัวเอง (ดูวิธีทำใน README.md)
 *   googleClientId : OAuth 2.0 Client ID (ใช้สำหรับล็อกอิน Google + เก็บไฟล์ใน Google Drive)
 *   googleApiKey   : API key ของ Google Cloud (ใช้ให้คนที่ "ไม่ได้ล็อกอิน" เปิดดูลิงก์แชร์ได้)
 *
 * ถ้ายังไม่ใส่ เว็บก็ใช้งานได้ปกติ แต่จะเก็บข้อมูลไว้ในเครื่อง (this browser) เท่านั้น
 * และจะยังแชร์ให้คนอื่นดูไม่ได้
 * ------------------------------------------------------------------ */
window.APP_CONFIG = {
  googleClientId: '262199057074-kctgao1p3ijg6js5tg77chnug55f0kom.apps.googleusercontent.com',
  googleApiKey: 'AIzaSyAzkTv64d7FHJDhG_6ZOmR2j_p31H0jTdo',

  // ชื่อโฟลเดอร์ที่จะถูกสร้างใน Google Drive ของผู้ใช้
  driveFolderName: 'รายงานการฝึกสอน (Teaching Practice)',

  // ชื่อไฟล์ข้อมูลหลักในโฟลเดอร์นั้น
  dataFileName: 'teaching-practice-data.json',

  // ขนาดไฟล์สูงสุดตอนยังไม่ล็อกอิน (เก็บลงเครื่อง) — 2.5 MB
  localMaxFileSize: 2.5 * 1024 * 1024
};

/* ผู้ใช้สามารถกรอกค่าผ่านหน้า "ตั้งค่า" ในเว็บได้ด้วย ค่าที่กรอกจะถูกเก็บใน localStorage
   และถูกนำมาใช้แทนค่าด้านบน */
try {
  var saved = JSON.parse(localStorage.getItem('tp.config') || '{}');
  if (saved.googleClientId) window.APP_CONFIG.googleClientId = saved.googleClientId;
  if (saved.googleApiKey) window.APP_CONFIG.googleApiKey = saved.googleApiKey;
} catch (e) { /* ignore */ }
