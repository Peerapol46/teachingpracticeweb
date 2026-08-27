/* ------------------------------------------------------------------
 * Drive.js — ล็อกอิน Google + อ่าน/เขียนไฟล์บน Google Drive
 * ใช้ Google Identity Services (GIS) เพื่อขอ access token แบบ implicit
 * scope = drive.file → เข้าถึงได้เฉพาะไฟล์ที่เว็บนี้สร้างเท่านั้น
 * ------------------------------------------------------------------ */
window.Drive = (function () {
  var SCOPE = 'https://www.googleapis.com/auth/drive.file openid email profile';
  var TOKEN_KEY = 'tp.token';

  var tokenClient = null;
  var accessToken = null;
  var tokenExpiry = 0;
  var profile = null;
  var folderId = null;
  var dataFileId = null;
  var pendingResolve = null;
  var pendingReject = null;

  function cfg() { return window.APP_CONFIG; }

  function restoreToken() {
    try {
      var t = JSON.parse(
        localStorage.getItem(TOKEN_KEY) || 'null'
      );

      if (t && t.token) {
        accessToken = t.token;
        tokenExpiry = t.expiry || 0;
        profile = t.profile || null;
        folderId = t.folderId || null;
        dataFileId = t.dataFileId || null;

        return true;
      }
    } catch (e) {
      console.warn('restoreToken error', e);
    }

    return false;
  }

  function persistToken() {
    try {
      localStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({
          token: accessToken,
          expiry: tokenExpiry,
          profile: profile,
          folderId: folderId,
          dataFileId: dataFileId
        })
      );
    } catch (e) {
      console.warn('persistToken error', e);
    }
  }

  function isConfigured() { return !!(cfg().googleClientId); }

  function ensureClient() {
    if (tokenClient) return true;
    if (!isConfigured()) throw new Error('ยังไม่ได้ตั้งค่า Google Client ID (ไปที่หน้า "ตั้งค่า")');
    if (!window.google || !google.accounts || !google.accounts.oauth2) {
      throw new Error('โหลดไลบรารีของ Google ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรชหน้า');
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: cfg().googleClientId,
      scope: SCOPE,
      callback: function (resp) {
        if (resp && resp.access_token) {
          accessToken = resp.access_token;
          tokenExpiry =
            Date.now() +
            ((resp.expires_in || 3600) - 120) * 1000;
          persistToken();
          if (pendingResolve) pendingResolve(accessToken);
        } else if (pendingReject) {
          pendingReject(new Error('ไม่ได้รับสิทธิ์เข้าถึง Google Drive'));
        }
        pendingResolve = pendingReject = null;
      },
      error_callback: function (err) {
        if (pendingReject) {
          var msg = (err && err.type === 'popup_closed')
            ? 'ปิดหน้าต่างล็อกอินก่อนเสร็จสิ้น'
            : 'ล็อกอินไม่สำเร็จ' + (err && err.type ? ' (' + err.type + ')' : '');
          pendingReject(new Error(msg));
        }
        pendingResolve = pendingReject = null;
      }
    });
    return true;
  }

  /** สคริปต์ของ Google โหลดแบบ async — รอให้พร้อมก่อน (สูงสุด 10 วินาที) */
  function waitForGis(timeoutMs) {
    var deadline = Date.now() + (timeoutMs || 10000);
    return new Promise(function (resolve, reject) {
      (function poll() {
        if (window.google && google.accounts && google.accounts.oauth2) return resolve();
        if (Date.now() > deadline) {
          return reject(new Error('โหลดไลบรารีล็อกอินของ Google ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่'));
        }
        setTimeout(poll, 150);
      })();
    });
  }

  function requestToken(interactive) {
    if (!isConfigured()) {
      return Promise.reject(new Error(
        'ยังเชื่อมต่อ Google ไม่ได้ — ผู้ดูแลต้องใส่ค่าเชื่อมต่อในไฟล์ js/config.js หรือที่หน้า "ตั้งค่า → ตั้งค่าขั้นสูง" ก่อน (ทำครั้งเดียว)'
      ));
    }
    return waitForGis().then(function () {
      ensureClient();
      return new Promise(function (resolve, reject) {
        pendingResolve = resolve;
        pendingReject = reject;
        try {
          tokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
        } catch (e) {
          pendingResolve = pendingReject = null;
          reject(e);
        }
      });
    });
  }

  /** คืน access token ที่ยังไม่หมดอายุ (ต่ออายุเงียบ ๆ ถ้าทำได้) */
  function withToken() {
    // Token ยังใช้ได้
    if (
      accessToken &&
      tokenExpiry > Date.now() + 120000
    ) {
      return Promise.resolve(accessToken);
    }

    // Token ใกล้หมดอายุ
    // ขอใหม่แบบไม่เด้งหน้า Login
    return requestToken(false);
  }

  function api(url, options) {
    options = options || {};
    var retried = false;
    function run(token) {
      var headers = Object.assign({}, options.headers || {}, { Authorization: 'Bearer ' + token });
      return fetch(url, Object.assign({}, options, { headers: headers })).then(function (r) {
        if (r.status === 401 && !retried) {
          retried = true;
          accessToken = null;
          return requestToken(false).then(run);
        }
        if (!r.ok) {
          return r.text().then(function (t) {
            var msg = t;
            try { msg = JSON.parse(t).error.message; } catch (e) { /* ignore */ }
            // กรณีที่เจอบ่อยที่สุด: ยังไม่ได้เปิด Google Drive API ในโปรเจกต์
            if (/has not been used in project|is disabled/i.test(msg)) {
              var m = msg.match(/project (\d+)/);
              var proj = m ? m[1] : '';
              var err = new Error(
                'ยังไม่ได้เปิด Google Drive API ในโปรเจกต์' + (proj ? ' ' + proj : '') +
                ' — ต้องกด Enable ที่ Google Cloud Console ก่อน แล้วรอประมาณ 1–2 นาที'
              );
              err.code = 'drive_api_disabled';
              err.enableUrl = 'https://console.cloud.google.com/apis/library/drive.googleapis.com' +
                (proj ? '?project=' + proj : '');
              throw err;
            }
            throw new Error('Google Drive: ' + msg);
          });
        }
        return r.status === 204 ? null : r.json();
      });
    }
    return withToken().then(run);
  }

  function fetchProfile() {
    return withToken().then(function (token) {
      return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: 'Bearer ' + token }
      });
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (p) {
      if (p) {
        profile = { name: p.name, email: p.email, picture: p.picture };
        persistToken();
      }
      return profile;
    });
  }

  /** หา (หรือสร้าง) โฟลเดอร์เก็บข้อมูลใน Drive */
  function ensureFolder() {
    if (folderId) return Promise.resolve(folderId);
    var name = cfg().driveFolderName.replace(/'/g, "\\'");
    var q = encodeURIComponent(
      "mimeType='application/vnd.google-apps.folder' and trashed=false and name='" + name + "'"
    );
    return api('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name)&pageSize=1')
      .then(function (res) {
        if (res.files && res.files.length) return res.files[0].id;
        return api('https://www.googleapis.com/drive/v3/files?fields=id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cfg().driveFolderName,
            mimeType: 'application/vnd.google-apps.folder'
          })
        }).then(function (f) { return f.id; });
      }).then(function (id) {
        folderId = id;
        persistToken();
        return id;
      });
  }

  function findDataFile() {
    if (dataFileId) return Promise.resolve(dataFileId);
    return ensureFolder().then(function (fid) {
      var q = encodeURIComponent(
        "name='" + cfg().dataFileName + "' and trashed=false and '" + fid + "' in parents"
      );
      return api('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name)&pageSize=1');
    }).then(function (res) {
      dataFileId = (res.files && res.files.length) ? res.files[0].id : null;
      persistToken();
      return dataFileId;
    });
  }

  function multipartUpload(metadata, blob, fileId) {
    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    var url = 'https://www.googleapis.com/upload/drive/v3/files' +
      (fileId ? '/' + fileId : '') +
      '?uploadType=multipart&fields=id,name,mimeType,size,webViewLink';
    return api(url, { method: fileId ? 'PATCH' : 'POST', body: form });
  }

  /** ตั้งค่าไฟล์ให้ "ใครมีลิงก์ก็เปิดดูได้" (จำเป็นสำหรับปุ่มแชร์) */
  function makePublic(fileId) {
    return api('https://www.googleapis.com/drive/v3/files/' + fileId + '/permissions?fields=id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    }).catch(function (e) {
      // ถ้าตั้งไว้อยู่แล้วจะ error ได้ — ไม่ถือว่าล้มเหลว
      console.warn('makePublic', e);
      return null;
    });
  }

  /** อัปโหลดไฟล์แนบ (รูป/สไลด์/แผน) เข้าโฟลเดอร์ */
  function uploadFile(file, opts) {
    opts = opts || {};
    return ensureFolder().then(function (fid) {
      return multipartUpload({
        name: opts.name || file.name,
        parents: [fid],
        description: opts.description || ''
      }, file);
    }).then(function (f) {
      return makePublic(f.id).then(function () { return f; });
    }).then(function (f) {
      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType || file.type,
        size: Number(f.size || file.size || 0),
        url: 'https://drive.google.com/file/d/' + f.id + '/view',
        download: 'https://drive.google.com/uc?export=download&id=' + f.id,
        thumb: 'https://drive.google.com/thumbnail?id=' + f.id + '&sz=w1200',
        storage: 'drive'
      };
    });
  }

  function deleteFile(fileId) {
    return api('https://www.googleapis.com/drive/v3/files/' + fileId, { method: 'DELETE' })
      .catch(function (e) { console.warn('deleteFile', e); });
  }

  /** บันทึกข้อมูลทั้งหมดเป็น JSON ไฟล์เดียวใน Drive */
  function saveJson(obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    return findDataFile().then(function (id) {
      if (id) return multipartUpload({ name: cfg().dataFileName }, blob, id);
      return ensureFolder().then(function (fid) {
        return multipartUpload({ name: cfg().dataFileName, parents: [fid] }, blob);
      });
    }).then(function (f) {
      dataFileId = f.id;
      persistToken();
      return f.id;
    });
  }

  function loadJson() {
    return findDataFile().then(function (id) {
      if (!id) return null;
      return withToken().then(function (token) {
        return fetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', {
          headers: { Authorization: 'Bearer ' + token }
        });
      }).then(function (r) { return r.ok ? r.json() : null; });
    });
  }

  /** ทำให้ไฟล์ข้อมูล + ไฟล์แนบทั้งหมดเปิดดูได้แบบสาธารณะ แล้วคืน fileId ของข้อมูล */
  function publish(assetIds) {
    return findDataFile().then(function (id) {
      if (!id) throw new Error('ยังไม่มีข้อมูลใน Google Drive กรุณากด "บันทึก" ก่อน');
      return makePublic(id).then(function () { return id; });
    }).then(function (id) {
      var jobs = (assetIds || []).map(function (a) { return makePublic(a); });
      return Promise.all(jobs).then(function () { return id; });
    });
  }

  function signIn() {
    return requestToken(true).then(fetchProfile).then(function (p) {
      return ensureFolder().then(function () { return p; });
    });
  }

  function signOut() {
    if (
      accessToken &&
      window.google &&
      google.accounts &&
      google.accounts.oauth2
    ) {
      try {
        google.accounts.oauth2.revoke(
          accessToken,
          function(){}
        );
      } catch(e){}
    }

    accessToken = null;
    tokenExpiry = 0;
    profile = null;
    folderId = null;
    dataFileId = null;

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch(e){}
  }

  /** โหลดข้อมูลจากลิงก์แชร์ (ไม่ต้องล็อกอิน) — ต้องมี API key */
  function loadShared(fileId) {
    var key = String(cfg().googleApiKey || '').trim();
    if (!key) {
      return Promise.reject(new Error('ลิงก์แชร์นี้ต้องตั้งค่า Google API key ในไฟล์ js/config.js ก่อน'));
    }
    if (!/^AIza[0-9A-Za-z_-]{20,}$/.test(key)) {
      return Promise.reject(new Error(
        'ค่า Google API key ที่ตั้งไว้ไม่ถูกต้อง — ต้องขึ้นต้นด้วย AIza ไม่ใช่ลิงก์หรือค่าอื่น ' +
        '(แก้ได้ที่ ตั้งค่า → ตั้งค่าขั้นสูง หรือในไฟล์ js/config.js)'
      ));
    }
    return fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
      '?alt=media&key=' + encodeURIComponent(key)).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) {
          var msg = '';
          try { msg = JSON.parse(t).error.message; } catch (e) { /* ignore */ }
          if (r.status === 400 || r.status === 403) {
            throw new Error('เปิดลิงก์แชร์ไม่สำเร็จ — API key ใช้ไม่ได้กับ Google Drive API' +
              (msg ? ' (' + msg + ')' : '') + ' ตรวจสอบว่าคีย์ถูกต้อง เปิดใช้ Drive API แล้ว และอนุญาตโดเมนนี้');
          }
          if (r.status === 404) {
            throw new Error('ไม่พบไฟล์รายงานที่แชร์ — เจ้าของอาจลบไฟล์ หรือยังไม่ได้ตั้งเป็น "ผู้ที่มีลิงก์เปิดดูได้"');
          }
          throw new Error('เปิดลิงก์แชร์ไม่สำเร็จ (' + r.status + ')' + (msg ? ' — ' + msg : ''));
        });
      }
      return r.json();
    });
  }

  restoreToken();

  return {
    isConfigured: isConfigured,

    isSignedIn: function () {
      return !!accessToken;
    },

    profile: function () {
      return profile;
    },

    dataFileId: function () {
      return dataFileId;
    },

    folderId: function () {
      return folderId;
    },

    folderUrl: function () {
      return folderId
        ? 'https://drive.google.com/drive/folders/' + folderId
        : null;
    },

    restore: function () {
      // โหลด Token ที่จำไว้
      if (!restoreToken()) {
        return Promise.resolve(null);
      }

      // ตรวจ Token ก่อนใช้งาน
      return withToken()
        .then(function () {
          return fetchProfile();
        })
        .catch(function () {
          // ถ้า Token ใช้ไม่ได้ ให้ล้าง Session
          accessToken = null;
          tokenExpiry = 0;
          profile = null;

          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch(e){}

          return null;
        });
    },

    signIn: signIn,
    signOut: signOut,
    uploadFile: uploadFile,
    deleteFile: deleteFile,
    saveJson: saveJson,
    loadJson: loadJson,
    makePublic: makePublic,
    publish: publish,
    loadShared: loadShared
  };
})();
