/* ------------------------------------------------------------------
 * app.js — โครงหลักของเว็บ (เมนู, หัวเรื่อง, ล็อกอิน, ปุ่มแชร์)
 * ------------------------------------------------------------------ */
(function () {
  /* ถ้าไฟล์ js ตัวใดตัวหนึ่งเป็นเวอร์ชันเก่าค้างในแคช (หรืออัปโหลดไม่ครบ)
     ให้แสดงคำอธิบายแทนหน้าจอว่าง ๆ */
  var missing = ["Vue", "APP_CONFIG", "Drive", "Store", "UI", "Pages"].filter(
    function (k) {
      return !window[k];
    },
  );
  if (missing.length) {
    document.getElementById("app").innerHTML =
      '<div style="max-width:640px;margin:14vh auto;padding:0 24px;font-family:sans-serif;color:#282d34">' +
      '<h1 style="font-size:20px;margin:0 0 12px">โหลดไฟล์ของเว็บไม่ครบ</h1>' +
      '<p style="line-height:1.8;color:#4d5560;margin:0 0 12px">ไฟล์ที่ยังขาดหรือเป็นเวอร์ชันเก่า: <b>' +
      missing.join(", ") +
      "</b></p>" +
      '<p style="line-height:1.8;color:#4d5560;margin:0">วิธีแก้: กด <b>Ctrl+Shift+R</b> (Mac: <b>Cmd+Shift+R</b>) เพื่อรีเฟรชแบบล้างแคช ' +
      "ถ้ายังไม่หาย ให้ตรวจว่าไฟล์ในโฟลเดอร์ <code>public/js/</code> ถูกอัปโหลดครบและทับของเดิมทั้งหมดแล้ว</p></div>";
    document.getElementById("app").removeAttribute("v-cloak");
    console.error("[teaching-practice] missing globals:", missing.join(", "));
    return;
  }

  var NAV = [
    { key: "home", label: "หน้าแรก", icon: "home" },
    { key: "school", label: "ข้อมูลสถานศึกษา", icon: "school" },
    { key: "schedule", label: "ตารางสอน", icon: "calendar" },
    { key: "log", label: "บันทึกรายวัน", icon: "note" },
    { key: "plan", label: "แผนการสอน", icon: "plan" },
    { key: "research", label: "วิจัยในชั้นเรียน", icon: "research" },
    { key: "activity", label: "รูปกิจกรรม", icon: "photo" },
    { key: "teaching", label: "รูปฝึกสอน", icon: "board" },
    { key: "summary", label: "สรุปรายงาน", icon: "summary" },
    { key: "settings", label: "ตั้งค่า", icon: "settings", hideInView: true },
  ];

  var btn = {
    primary:
      "inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60",
    ghost:
      "inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60",
  };

  var Root = {
    data: function () {
      return {
        nav: NAV,
        page: "home",
        menuOpen: false,
        shareOpen: false,
        shareUrl: "",
        sharing: false,
        shareError: "",
        copied: false,
      };
    },
    computed: {
      s: function () {
        return Store.state;
      },
      d: function () {
        return Store.state.data;
      },
      view: function () {
        return Store.state.mode === "view";
      },
      googleReady: function () {
        return Drive.isConfigured();
      },
      navItems: function () {
        var v = this.view;
        return NAV.filter(function (n) {
          return !(v && n.hideInView);
        });
      },
      current: function () {
        var p = this.page;
        var found = NAV.filter(function (n) {
          return n.key === p;
        })[0];
        return found || NAV[0];
      },
      saveText: function () {
        var s = this.s;
        if (s.mode === "view") return "โหมดดูอย่างเดียว";
        if (s.saving) return "กำลังบันทึก...";
        if (s.dirty) return "มีการแก้ไข";
        if (s.mode === "drive") return "บันทึกลง Google Drive แล้ว";
        return "บันทึกในเครื่องนี้แล้ว";
      },
    },
    methods: {
      go: function (key) {
        this.page = key;
        this.menuOpen = false;
        location.hash = "#/" + key;
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      syncHash: function () {
        var k = (location.hash || "").replace(/^#\/?/, "");
        var ok = NAV.some(function (n) {
          return n.key === k;
        });
        this.page = ok ? k : "home";
      },
      signIn: function () {
        Store.signIn().catch(function () {
          /* แสดง toast แล้ว */
        });
      },
      signOut: function () {
        Store.signOut();
      },
      chooseGoogle: function () {
        var self = this;
        Store.signIn()
          .then(function () {
            self.go("home");
          })
          .catch(function () {
            /* แสดง toast แล้ว */
          });
      },
      chooseGuest: function () {
        Store.continueAsGuest();
        this.go("home");
      },
      gotoSettings: function () {
        Store.continueAsGuest();
        this.go("settings");
      },
      saveNow: function () {
        Store.save(true);
      },
      retrySave: function () {
        Store.save(true).then(function () {
          if (!Store.state.enableUrl)
            Store.toast("บันทึกขึ้น Google Drive สำเร็จแล้ว", "success");
        });
      },
      openShare: function () {
        this.shareOpen = true;
        this.shareUrl = "";
        this.shareError = "";
        this.copied = false;
        if (this.s.mode === "view") {
          this.shareUrl = location.href;
          return;
        }
        var self = this;
        this.sharing = true;
        Store.share()
          .then(function (url) {
            self.shareUrl = url;
          })
          .catch(function (e) {
            self.shareError = e.message || String(e);
          })
          .then(function () {
            self.sharing = false;
          });
      },
      copyLink: function () {
        var self = this;
        var done = function () {
          self.copied = true;
          setTimeout(function () {
            self.copied = false;
          }, 2500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(this.shareUrl).then(done, function () {
            self.$refs.shareInput.select();
            document.execCommand("copy");
            done();
          });
        } else {
          this.$refs.shareInput.select();
          document.execCommand("copy");
          done();
        }
      },
    },
    mounted: function () {
      var self = this;
      this.syncHash();
      window.addEventListener("hashchange", this.syncHash);
      Store.init().then(function () {
        if (Store.state.mode === "view") self.page = self.page || "home";
      });
      Vue.watch(
        function () {
          return Store.state.data;
        },
        function () {
          if (!Store.state.loading && Store.state.mode !== "view")
            Store.scheduleSave();
        },
        { deep: true },
      );
      window.addEventListener("beforeunload", function (e) {
        if (Store.state.dirty && Store.state.mode !== "view") {
          e.preventDefault();
          e.returnValue = "";
        }
      });
    },
    template: [
      "<div>",

      /* ---------- กำลังโหลด ---------- */
      '  <div v-if="s.loading" class="min-h-screen flex flex-col items-center justify-center text-ink-400">',
      '    <div class="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin mb-3"></div>กำลังโหลด...</div>',

      /* ---------- หน้าเลือกวิธีเข้าใช้งาน ---------- */
      '  <div v-else-if="s.gate" class="min-h-screen flex items-center justify-center px-5 py-10 bg-gradient-to-br from-brand-50 via-page to-brand-100/60">',
      '    <div class="w-full max-w-lg">',
      '      <div class="text-center mb-8">',
      '        <div class="w-16 h-16 rounded-3xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-4 shadow-card"><ui-icon name="school" cls="w-8 h-8"/></div>',
      '        <h1 class="text-2xl sm:text-3xl font-semibold text-ink-900 leading-tight">รายงานการฝึกประสบการณ์วิชาชีพครู</h1>',
      '        <p class="text-ink-500 mt-2">เลือกวิธีเริ่มใช้งาน</p>',
      "      </div>",

      '      <div class="space-y-3">',
      '        <button @click="chooseGoogle" :disabled="s.signingIn"',
      '          class="w-full text-left bg-white rounded-2xl border-2 border-brand-500 p-5 shadow-card transition hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0">',
      '          <div class="flex items-start gap-4">',
      '            <div class="shrink-0 w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center">',
      '              <div v-if="s.signingIn" class="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>',
      '              <ui-icon v-else name="cloud" cls="w-5 h-5"/></div>',
      '            <div class="min-w-0">',
      '              <p class="font-semibold text-ink-900">{{ s.signingIn ? "กำลังล็อกอิน..." : "ล็อกอินด้วย Google" }}</p>',
      '              <p class="text-sm text-ink-500 mt-1 leading-relaxed">เก็บข้อมูลและไฟล์ไว้ใน Google Drive ของคุณ เปิดแก้ไขได้จากทุกเครื่อง และสร้างลิงก์แชร์ให้คนอื่นดูได้</p>',
      "            </div>",
      "          </div>",
      "        </button>",

      '        <button @click="chooseGuest" :disabled="s.signingIn"',
      '          class="w-full text-left bg-white rounded-2xl border border-ink-200 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 disabled:opacity-70">',
      '          <div class="flex items-start gap-4">',
      '            <div class="shrink-0 w-11 h-11 rounded-2xl bg-ink-100 text-ink-600 flex items-center justify-center"><ui-icon name="eye" cls="w-5 h-5"/></div>',
      '            <div class="min-w-0">',
      '              <p class="font-semibold text-ink-900">ใช้งานแบบ guest (ไม่ต้องล็อกอิน)</p>',
      '              <p class="text-sm text-ink-500 mt-1 leading-relaxed">ใช้ได้ครบทุกหน้า แต่ข้อมูลจะถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น และยังสร้างลิงก์แชร์ไม่ได้</p>',
      "            </div>",
      "          </div>",
      "        </button>",
      "      </div>",

      '      <p v-if="s.error" class="mt-4 text-sm text-red-600 text-center">{{ s.error }}</p>',
      '      <p v-if="!googleReady" class="mt-4 text-xs text-ink-400 text-center leading-relaxed">',
      "        ปุ่มล็อกอินยังใช้ไม่ได้ เพราะผู้ดูแลยังไม่ได้ตั้งค่าเชื่อมต่อ Google",
      '        <button class="text-brand-600 underline underline-offset-2" @click="gotoSettings">เปิดหน้าตั้งค่า</button></p>',
      '      <p class="mt-6 text-xs text-ink-400 text-center leading-relaxed">',
      "        เปลี่ยนทีหลังได้ — ถ้าเริ่มแบบ guest ไว้ก่อน แล้วค่อยกดล็อกอินที่แถบด้านซ้าย ข้อมูลที่ทำไว้จะถูกอัปโหลดขึ้น Google Drive ให้อัตโนมัติ</p>",
      "    </div>",
      "  </div>",

      /* ---------- ตัวเว็บ ---------- */
      '  <div v-else class="min-h-screen lg:flex">',

      /* ---------- เมนูด้านข้าง ---------- */
      "  <aside :class=\"['no-print fixed lg:sticky top-0 z-40 h-screen w-[270px] shrink-0 bg-white border-r border-ink-100 flex flex-col transition-transform lg:translate-x-0', menuOpen ? 'translate-x-0' : '-translate-x-full']\">",
      '    <div class="px-5 py-5 border-b border-ink-100">',
      '      <div class="flex items-center gap-3">',
      '        <div class="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-soft"><ui-icon name="school" cls="w-5 h-5"/></div>',
      '        <div class="min-w-0">',
      '          <p class="font-semibold text-ink-900 leading-tight truncate">รายงานการฝึกสอน</p>',
      '          <p class="text-xs text-ink-400 truncate">{{ d.school.name || "Teaching Practice Report" }}</p>',
      "        </div>",
      "      </div>",
      "    </div>",
      '    <nav class="flex-1 overflow-y-auto p-3 space-y-1">',
      '      <button v-for="n in navItems" :key="n.key" @click="go(n.key)"',
      "        :class=\"['w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition',",
      "          page===n.key ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50']\">",
      '        <ui-icon :name="n.icon" cls="w-5 h-5 shrink-0"/><span class="truncate">{{ n.label }}</span></button>',
      "    </nav>",
      '    <div class="p-3 border-t border-ink-100">',
      '      <div v-if="s.user" class="flex items-center gap-3 px-2 py-2">',
      '        <img v-if="s.user.picture" :src="s.user.picture" class="w-9 h-9 rounded-full" referrerpolicy="no-referrer" alt="">',
      '        <div class="min-w-0 flex-1"><p class="text-sm font-medium text-ink-800 truncate">{{ s.user.name }}</p>',
      '          <p class="text-xs text-ink-400 truncate">{{ s.user.email }}</p></div>',
      '        <button @click="signOut" title="ออกจากระบบ" class="w-9 h-9 rounded-xl hover:bg-ink-50 text-ink-400 flex items-center justify-center"><ui-icon name="logout" cls="w-4 h-4"/></button>',
      "      </div>",
      '      <button v-else-if="!view" class="w-full ' +
        btn.ghost +
        ' justify-center" @click="signIn">',
      '        <ui-icon name="cloud" cls="w-4 h-4"/>ล็อกอินด้วย Google</button>',
      '      <p v-if="!s.user && !view" class="text-[11px] leading-relaxed text-ink-400 mt-2 px-1">ไม่ล็อกอินก็ใช้งานได้ ข้อมูลจะถูกเก็บไว้ในเบราว์เซอร์นี้</p>',
      "    </div>",
      "  </aside>",
      '  <div v-if="menuOpen" class="no-print fixed inset-0 z-30 bg-ink-900/30 lg:hidden" @click="menuOpen=false"></div>',

      /* ---------- เนื้อหา ---------- */
      '  <div class="flex-1 min-w-0">',
      '    <header class="no-print sticky top-0 z-20 bg-page/90 backdrop-blur border-b border-ink-100">',
      '      <div class="flex items-center gap-3 px-4 sm:px-7 py-3">',
      '        <button class="lg:hidden w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center text-ink-600" @click="menuOpen=true"><ui-icon name="menu"/></button>',
      '        <p class="font-medium text-ink-800 truncate flex-1">{{ current.label }}</p>',
      "        <span :class=\"['hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg',",
      "          s.saving ? 'bg-amber-50 text-amber-700' : (s.dirty ? 'bg-ink-100 text-ink-500' : 'bg-emerald-50 text-emerald-700')]\">",
      "          <ui-icon :name=\"s.mode==='drive' ? 'cloud' : (view ? 'eye' : 'check')\" cls=\"w-3.5 h-3.5\"/>{{ saveText }}</span>",
      '        <button v-if="!view" class="' +
        btn.ghost +
        ' !py-2" @click="saveNow" :disabled="s.saving"><ui-icon name="check" cls="w-4 h-4"/><span class="hidden sm:inline">บันทึก</span></button>',
      '        <button class="' +
        btn.primary +
        ' !py-2" @click="openShare"><ui-icon name="share" cls="w-4 h-4"/><span class="hidden sm:inline">แชร์</span></button>',
      "      </div>",
      '      <div v-if="s.enableUrl" class="px-4 sm:px-7 pb-3">',
      '        <div class="rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">',
      '          <p class="leading-relaxed">{{ s.error }}</p>',
      '          <div class="flex flex-wrap gap-2 mt-3">',
      '            <a :href="s.enableUrl" target="_blank" rel="noopener" class="' +
        btn.primary +
        ' !py-2 !bg-red-600 hover:!bg-red-700">',
      '              <ui-icon name="link" cls="w-4 h-4"/>เปิด Google Drive API</a>',
      '            <button class="' +
        btn.ghost +
        ' !py-2" @click="retrySave" :disabled="s.saving">',
      '              <ui-icon name="check" cls="w-4 h-4"/>{{ s.saving ? "กำลังลอง..." : "เปิดแล้ว — ลองบันทึกอีกครั้ง" }}</button>',
      "          </div>",
      "        </div>",
      "      </div>",
      '      <div v-if="view" class="px-4 sm:px-7 pb-3">',
      '        <div class="rounded-xl bg-brand-50 text-brand-800 text-sm px-4 py-2.5 flex items-center gap-2">',
      '          <ui-icon name="eye" cls="w-4 h-4 shrink-0"/><span>คุณกำลังดูรายงานที่ถูกแชร์มา (อ่านอย่างเดียว ไม่ต้องล็อกอิน)</span></div>',
      "      </div>",
      "    </header>",

      '    <main class="px-4 sm:px-7 py-6 sm:py-8 max-w-[1400px] mx-auto">',
      '      <div v-if="s.loading" class="py-24 text-center text-ink-400">',
      '        <div class="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-3"></div>กำลังโหลดข้อมูล...</div>',
      '      <div v-else-if="view && s.error" class="py-20 text-center">',
      '        <p class="text-lg font-medium text-ink-800 mb-2">เปิดรายงานที่แชร์ไม่สำเร็จ</p>',
      '        <p class="text-sm text-ink-500 max-w-md mx-auto">{{ s.error }}</p></div>',
      "      <template v-else>",
      '        <page-home v-if="page===\'home\'" @go="go"/>',
      "        <page-school v-else-if=\"page==='school'\"/>",
      "        <page-schedule v-else-if=\"page==='schedule'\"/>",
      "        <page-log v-else-if=\"page==='log'\"/>",
      "        <page-plan v-else-if=\"page==='plan'\"/>",
      "        <page-research v-else-if=\"page==='research'\"/>",
      '        <page-gallery v-else-if="page===\'activity\'" field="activityPhotos" title="รูปกิจกรรม" subtitle="ภาพกิจกรรมต่าง ๆ ของสถานศึกษาที่ได้เข้าร่วม" icon="photo" key="activity"/>',
      '        <page-gallery v-else-if="page===\'teaching\'" field="teachingPhotos" title="รูปฝึกสอน" subtitle="ภาพบรรยากาศการจัดการเรียนการสอนในชั้นเรียน" icon="board" key="teaching"/>',
      "        <page-summary v-else-if=\"page==='summary'\"/>",
      "        <page-settings v-else-if=\"page==='settings'\"/>",
      "      </template>",
      "    </main>",
      '    <footer class="no-print px-4 sm:px-7 py-6 text-center text-xs text-ink-400">',
      '      {{ d.profile.studentName || "รายงานการฝึกประสบการณ์วิชาชีพครู" }} · ข้อมูลถูกเก็บไว้ใน Google Drive ของเจ้าของรายงาน',
      "    </footer>",
      "  </div>",

      /* ---------- กล่องแชร์ ---------- */
      '  <ui-modal :show="shareOpen" title="แชร์รายงานนี้" @close="shareOpen=false">',
      '    <div v-if="sharing" class="py-8 text-center text-ink-500">',
      '      <div class="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-3"></div>กำลังเตรียมลิงก์แชร์...</div>',
      '    <div v-else-if="shareError">',
      '      <p class="text-sm text-red-600 mb-4">{{ shareError }}</p>',
      '      <button v-if="!s.user" class="' +
        btn.primary +
        '" @click="shareOpen=false; signIn()"><ui-icon name="cloud" cls="w-4 h-4"/>ล็อกอินด้วย Google</button>',
      "    </div>",
      "    <div v-else>",
      '      <p class="text-sm text-ink-600 mb-3">ส่งลิงก์นี้ให้ใครก็ได้ — เปิดดูได้ทันทีโดย<b>ไม่ต้องล็อกอิน Google</b></p>',
      '      <div class="flex gap-2">',
      '        <input ref="shareInput" :value="shareUrl" readonly class="flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm outline-none">',
      '        <button class="' +
        btn.primary +
        '" @click="copyLink"><ui-icon :name="copied ? \'check\' : \'link\'" cls="w-4 h-4"/>{{ copied ? "คัดลอกแล้ว" : "คัดลอก" }}</button>',
      "      </div>",
      '      <div class="flex flex-wrap gap-2 mt-4">',
      '        <a :href="shareUrl" target="_blank" rel="noopener" class="' +
        btn.ghost +
        '"><ui-icon name="eye" cls="w-4 h-4"/>เปิดดูตัวอย่าง</a>',
      '        <a :href="\'https://line.me/R/msg/text/?\' + encodeURIComponent(shareUrl)" target="_blank" rel="noopener" class="' +
        btn.ghost +
        '">ส่งทาง LINE</a>',
      "      </div>",
      '      <p class="text-xs text-ink-400 mt-4 leading-relaxed">หมายเหตุ: ไฟล์และรูปที่อยู่ในรายงานจะถูกตั้งค่าเป็น “ผู้ที่มีลิงก์เปิดดูได้” บน Google Drive เพื่อให้ผู้รับเปิดดูได้</p>',
      "    </div>",
      "  </ui-modal>",
      "  </div>",

      /* ---------- แจ้งเตือน (แสดงได้ทั้งหน้าเลือกวิธีเข้าใช้งานและในเว็บ) ---------- */
      '  <transition name="fade"><div v-if="s.toast" class="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] max-w-[92vw]">',
      "    <div :class=\"['rounded-2xl px-4 py-3 text-sm shadow-2xl flex items-start gap-2',",
      "      s.toast.kind==='error' ? 'bg-red-600 text-white' : (s.toast.kind==='success' ? 'bg-emerald-600 text-white' : 'bg-ink-900 text-white')]\">",
      "      <ui-icon :name=\"s.toast.kind==='error' ? 'x' : 'check'\" cls=\"w-4 h-4 mt-0.5 shrink-0\"/><span>{{ s.toast.message }}</span></div>",
      "  </div></transition>",
      "</div>",
    ].join(""),
  };

  var app = Vue.createApp(Root);
  UI.install(app);
  app.component("page-home", Pages.Home);
  app.component("page-school", Pages.School);
  app.component("page-schedule", Pages.Schedule);
  app.component("page-log", Pages.Log);
  app.component("page-plan", Pages.Plan);
  app.component("page-research", Pages.Research);
  app.component("page-gallery", Pages.Gallery);
  app.component("page-summary", Pages.Summary);
  app.component("page-settings", Pages.Settings);
  app.mount("#app");
})();
