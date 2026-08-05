/* ------------------------------------------------------------------
 * Store.js — ข้อมูลทั้งหมดของเว็บ + การบันทึก (Google Drive / เครื่องนี้)
 * ------------------------------------------------------------------ */
window.Store = (function () {
  var LOCAL_KEY = 'tp.data';
  var ENTRY_KEY = 'tp.entry';   // 'google' | 'guest' — วิธีเข้าใช้งานที่ผู้ใช้เลือกไว้ครั้งก่อน
  var reactive = Vue.reactive;

  var THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  var WORK_DAYS = [1, 2, 3, 4, 5]; // จันทร์–ศุกร์ (ไม่เอาเสาร์–อาทิตย์)

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function emptyData() {
    return {
      version: 1,
      updatedAt: null,
      profile: {
        reportTitle: 'รายงานการฝึกประสบการณ์วิชาชีพครู',
        studentName: '',
        studentId: '',
        major: '',
        faculty: '',
        university: '',
        advisor: '',
        mentor: '',
        academicYear: '',
        period: '',
        photo: null
      },
      school: {
        name: '',
        address: '',
        director: '',
        phone: '',
        website: '',
        affiliation: '',
        size: '',
        vision: '',
        history: '',
        logo: null,
        photos: []
      },
      schedules: [
        { id: 'term1', label: 'ภาคเรียนที่ 1', note: '', images: [] },
        { id: 'term2', label: 'ภาคเรียนที่ 2', note: '', images: [] }
      ],
      logs: [],
      plans: [],
      research: [],
      activityPhotos: [],
      teachingPhotos: [],
      summary: {
        overview: '',
        strengths: '',
        problems: '',
        solutions: '',
        learned: '',
        suggestions: '',
        thanks: '',
        files: []
      }
    };
  }

  /* ทำให้ข้อมูลเก่า/ข้อมูลจากลิงก์แชร์ มีครบทุกคีย์เสมอ */
  function normalize(raw) {
    var base = emptyData();
    if (!raw || typeof raw !== 'object') return base;
    var d = Object.assign({}, base, raw);
    d.profile = Object.assign({}, base.profile, raw.profile || {});
    d.school = Object.assign({}, base.school, raw.school || {});
    d.summary = Object.assign({}, base.summary, raw.summary || {});
    ['logs', 'plans', 'research', 'activityPhotos', 'teachingPhotos'].forEach(function (k) {
      if (!Array.isArray(d[k])) d[k] = [];
    });
    if (!Array.isArray(d.school.photos)) d.school.photos = [];
    if (!Array.isArray(d.summary.files)) d.summary.files = [];
    if (!Array.isArray(d.schedules) || !d.schedules.length) d.schedules = emptyData().schedules;
    d.schedules.forEach(function (t) { if (!Array.isArray(t.images)) t.images = []; });
    return d;
  }

  var state = reactive({
    data: emptyData(),
    mode: 'local',          // 'local' = เก็บในเครื่อง, 'drive' = เก็บใน Google Drive, 'view' = โหมดดูอย่างเดียว
    user: null,
    loading: true,
    gate: false,            // แสดงหน้าเลือกวิธีเข้าใช้งาน (ล็อกอิน Google / guest)
    signingIn: false,
    saving: false,
    dirty: false,
    lastSaved: null,
    error: '',
    enableUrl: '',        // ลิงก์ไปเปิด Google Drive API เมื่อโปรเจกต์ยังไม่ได้เปิดไว้
    toast: null,
    shareId: null
  });

  var toastTimer = null;
  function toast(message, kind) {
    state.toast = { message: message, kind: kind || 'info' };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { state.toast = null; }, 4200);
  }

  var canEdit = Vue.computed(function () { return state.mode !== 'view'; });

  /** เก็บ error พร้อมลิงก์แก้ไข (ถ้ามี) ไว้แสดงบนหน้าเว็บ */
  function noteError(e) {
    state.error = (e && e.message) || String(e);
    state.enableUrl = (e && e.enableUrl) || '';
    return state.error;
  }

  /* ---------------- เก็บลงเครื่อง ---------------- */
  function saveLocal() {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state.data));
      return true;
    } catch (e) {
      toast('พื้นที่เก็บข้อมูลในเครื่องเต็ม — แนะนำให้ล็อกอิน Google เพื่อเก็บไฟล์ใน Drive', 'error');
      return false;
    }
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return null;
  }

  /* ---------------- บันทึก (auto-save) ---------------- */
  var saveTimer = null;
  function scheduleSave() {
    if (state.mode === 'view') return;
    state.dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { save(); }, 1200);
  }

  function save(force) {
    if (state.mode === 'view') return Promise.resolve();
    state.data.updatedAt = new Date().toISOString();
    saveLocal();
    if (state.mode !== 'drive') {
      state.dirty = false;
      state.lastSaved = new Date();
      return Promise.resolve();
    }
    if (state.saving && !force) { scheduleSave(); return Promise.resolve(); }
    state.saving = true;
    state.error = '';
    return Drive.saveJson(JSON.parse(JSON.stringify(state.data))).then(function () {
      state.saving = false;
      state.dirty = false;
      state.lastSaved = new Date();
      state.enableUrl = '';
    }).catch(function (e) {
      state.saving = false;
      toast('บันทึกขึ้น Google Drive ไม่สำเร็จ: ' + noteError(e), 'error');
    });
  }

  /* ---------------- ไฟล์แนบ ---------------- */
  function readAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = function () { reject(new Error('อ่านไฟล์ไม่สำเร็จ')); };
      fr.readAsDataURL(file);
    });
  }

  /** อัปโหลดไฟล์ → คืน object ไฟล์แนบ (ทั้งโหมด Drive และโหมดเก็บในเครื่อง) */
  function uploadAsset(file) {
    if (state.mode === 'drive') {
      return Drive.uploadFile(file).then(function (asset) {
        asset.uploadedAt = new Date().toISOString();
        return asset;
      });
    }
    if (file.size > window.APP_CONFIG.localMaxFileSize) {
      return Promise.reject(new Error(
        'ไฟล์ใหญ่เกิน ' + Math.round(window.APP_CONFIG.localMaxFileSize / 1024 / 1024 * 10) / 10 +
        ' MB สำหรับการเก็บในเครื่อง — กรุณาล็อกอิน Google เพื่อเก็บลง Drive'
      ));
    }
    return readAsDataUrl(file).then(function (dataUrl) {
      return {
        id: uid(),
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url: dataUrl,
        thumb: dataUrl,
        download: dataUrl,
        storage: 'local',
        uploadedAt: new Date().toISOString()
      };
    });
  }

  function removeAsset(asset) {
    if (asset && asset.storage === 'drive' && Drive.isSignedIn()) Drive.deleteFile(asset.id);
  }

  /** รวม id ของไฟล์แนบทั้งหมดที่อยู่บน Drive (ใช้ตอนกดแชร์) */
  function collectAssetIds() {
    var ids = [];
    function add(a) { if (a && a.storage === 'drive' && a.id) ids.push(a.id); }
    var d = state.data;
    add(d.profile.photo);
    add(d.school.logo);
    (d.school.photos || []).forEach(add);
    (d.schedules || []).forEach(function (t) { (t.images || []).forEach(add); });
    (d.plans || []).forEach(function (p) { add(p.slide); add(p.file); (p.extra || []).forEach(add); });
    (d.research || []).forEach(function (r) { (r.files || []).forEach(add); });
    (d.activityPhotos || []).forEach(function (p) { add(p.file); });
    (d.teachingPhotos || []).forEach(function (p) { add(p.file); });
    (d.summary.files || []).forEach(add);
    return ids;
  }

  /* ---------------- ล็อกอิน / ออกจากระบบ ---------------- */
  function mergeAfterSignIn(driveData) {
    var local = state.data;
    var localEmpty = !local.updatedAt;
    if (!driveData) return local;                 // Drive ยังว่าง → ใช้ของในเครื่อง
    if (localEmpty) return normalize(driveData);  // เครื่องว่าง → ใช้ของ Drive
    var driveNewer = new Date(driveData.updatedAt || 0) > new Date(local.updatedAt || 0);
    return driveNewer ? normalize(driveData) : local;
  }

  function setEntry(kind) {
    try { localStorage.setItem(ENTRY_KEY, kind); } catch (e) { /* ignore */ }
  }

  function signIn() {
    state.error = '';
    state.signingIn = true;
    // ห่อด้วย Promise.resolve เพื่อให้ error ที่ throw แบบ sync กลายเป็น rejection
    return Promise.resolve().then(function () { return Drive.signIn(); }).then(function (p) {
      state.user = p;
      state.mode = 'drive';
      return Drive.loadJson();
    }).then(function (driveData) {
      state.data = mergeAfterSignIn(driveData);
      setEntry('google');
      state.gate = false;
      state.signingIn = false;
      toast('ล็อกอินสำเร็จ — ข้อมูลจะถูกเก็บไว้ใน Google Drive ของคุณ', 'success');
      return save(true);
    }).catch(function (e) {
      state.signingIn = false;
      state.mode = Drive.isSignedIn() ? 'drive' : 'local';
      toast(noteError(e), 'error');
      throw e;
    });
  }

  /** เข้าใช้งานแบบ guest — เก็บข้อมูลไว้ในเบราว์เซอร์เครื่องนี้ */
  function continueAsGuest() {
    setEntry('guest');
    state.mode = 'local';
    state.gate = false;
    state.error = '';
  }

  function signOut() {
    Drive.signOut();
    state.user = null;
    state.mode = 'local';
    try { localStorage.removeItem(ENTRY_KEY); } catch (e) { /* ignore */ }
    state.gate = true;   // กลับไปหน้าเลือกวิธีเข้าใช้งาน
    toast('ออกจากระบบแล้ว', 'info');
  }

  /* ---------------- แชร์ ---------------- */
  function share() {
    if (state.mode !== 'drive') {
      return Promise.reject(new Error('ต้องล็อกอิน Google ก่อน จึงจะสร้างลิงก์แชร์ได้'));
    }
    return save(true).then(function () {
      return Drive.publish(collectAssetIds());
    }).then(function (fileId) {
      return location.origin + location.pathname + '?share=' + fileId;
    });
  }

  /* ---------------- เริ่มต้น ---------------- */
  function init() {
    var params = new URLSearchParams(location.search);
    var shareId = params.get('share');

    if (shareId) {
      state.mode = 'view';
      state.shareId = shareId;
      return Drive.loadShared(shareId).then(function (d) {
        state.data = normalize(d);
        state.loading = false;
      }).catch(function (e) {
        state.error = e.message || String(e);
        state.loading = false;
      });
    }

    var local = loadLocal();
    if (local) state.data = local;

    var entry = null;
    try { entry = localStorage.getItem(ENTRY_KEY); } catch (e) { /* ignore */ }
    // ผู้ใช้เดิมที่มีข้อมูลอยู่แล้วแต่ยังไม่เคยเลือก ถือว่าใช้งานแบบ guest อยู่
    if (!entry && local && local.updatedAt) { entry = 'guest'; setEntry('guest'); }

    return Drive.restore().then(function (p) {
      if (p && Drive.isSignedIn()) {
        state.user = p;
        state.mode = 'drive';
        setEntry('google');
        return Drive.loadJson().then(function (d) {
          state.data = mergeAfterSignIn(d);
        }).catch(noteError);
      }
    }).catch(function () { /* ไม่มี session เดิม */ })
      .then(function () {
        // ยังไม่ได้ล็อกอิน และยังไม่เคยเลือกแบบ guest → ให้เลือกก่อนเข้าใช้งาน
        state.gate = !state.user && entry !== 'guest';
        state.loading = false;
      });
  }

  /* ---------------- ตัวช่วยเรื่องวัน/สัปดาห์ ---------------- */
  function thaiDate(iso, opts) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    var fmt = { day: 'numeric', month: opts === 'short' ? 'short' : 'long', year: 'numeric' };
    return d.toLocaleDateString('th-TH', fmt);
  }

  function dayIndex(iso) {
    if (!iso) return null;
    var d = new Date(iso + 'T00:00:00');
    return isNaN(d) ? null : d.getDay();
  }

  function exportJson() {
    var blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'teaching-practice-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importJson(file) {
    return file.text().then(function (t) {
      state.data = normalize(JSON.parse(t));
      return save(true);
    }).then(function () { toast('นำเข้าข้อมูลเรียบร้อย', 'success'); });
  }

  return {
    state: state,
    canEdit: canEdit,
    THAI_DAYS: THAI_DAYS,
    WORK_DAYS: WORK_DAYS,
    uid: uid,
    toast: toast,
    save: save,
    scheduleSave: scheduleSave,
    uploadAsset: uploadAsset,
    removeAsset: removeAsset,
    signIn: signIn,
    signOut: signOut,
    continueAsGuest: continueAsGuest,
    share: share,
    init: init,
    thaiDate: thaiDate,
    dayIndex: dayIndex,
    exportJson: exportJson,
    importJson: importJson,
    emptyData: emptyData
  };
})();
