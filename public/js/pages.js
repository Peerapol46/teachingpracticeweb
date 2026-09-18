  /* ------------------------------------------------------------------
  * pages.js — หน้าต่าง ๆ ของเว็บรายงานการฝึกสอน
  * ------------------------------------------------------------------ */
  window.Pages = (function () {

    var base = {
      computed: {
        d: function () { return Store.state.data; },
        edit: function () { return Store.state.mode !== 'view'; }
      },
      methods: {
        save: function () { Store.save(); },
        uid: function () { return Store.uid(); },
        thaiDate: function (v, s) { return Store.thaiDate(v, s); },
        confirmDelete: function (msg) { return window.confirm(msg || 'ต้องการลบรายการนี้ใช่หรือไม่?'); }
      }
    };

    var btn = {
      primary: 'inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-60',
      ghost: 'inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700',
      danger: 'inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50'
    };

    /* ================= หน้าแรก ================= */
    var PROFILE_FIELDS = [
      { key: 'reportTitle', label: 'ชื่อรายงาน', placeholder: 'รายงานการฝึกประสบการณ์วิชาชีพครู', wide: true },
      { key: 'studentName', label: 'ชื่อ–สกุล นักศึกษา', placeholder: 'เช่น นางสาวสมหญิง ใจดี' },
      { key: 'studentId', label: 'รหัสนักศึกษา' },
      { key: 'major', label: 'สาขาวิชา' },
      { key: 'faculty', label: 'คณะ' },
      { key: 'university', label: 'มหาวิทยาลัย/สถาบัน' },
      { key: 'advisor', label: 'อาจารย์นิเทศก์' },
      { key: 'mentor', label: 'ครูพี่เลี้ยง' },
      { key: 'academicYear', label: 'ปีการศึกษา', placeholder: '2568' },
      { key: 'period', label: 'ช่วงเวลาฝึกสอน', placeholder: '16 พ.ค. 2568 – 30 ก.ย. 2568' }
    ];

    var Home = {
      mixins: [base],
      data: function () { return { show: false, form: {}, coverPopup: false }; },
      mounted: function () {
        var self = this;
        this._escHandler = function (e) {
          if (e.key === 'Escape' && self.coverPopup) self.coverPopup = false;
        };
        window.addEventListener('keydown', this._escHandler);
      },
      unmounted: function () {
        window.removeEventListener('keydown', this._escHandler);
      },
      methods: {
        openEdit: function () {
          this.form = JSON.parse(JSON.stringify(this.d.profile));
          this.show = true;
        },
        submit: function () {
          Object.assign(this.d.profile, this.form);
          this.save();
          this.show = false;
        }
      },
      computed: {
        fields: function () { return PROFILE_FIELDS; },
        filled: function () {
          var p = this.d.profile;
          return PROFILE_FIELDS.some(function (f) { return f.key !== 'reportTitle' && p[f.key]; }) || !!p.photo;
        },
        stats: function () {
          var d = this.d;
          var weeks = {};
          d.logs.forEach(function (l) { if (l.week) weeks[l.week] = 1; });
          return [
            { label: 'บันทึกรายวัน', value: d.logs.length, unit: 'รายการ', icon: 'note', page: 'log' },
            { label: 'สัปดาห์ที่บันทึก', value: Object.keys(weeks).length, unit: 'สัปดาห์', icon: 'calendar', page: 'log' },
            { label: 'แผนการสอน', value: d.plans.length, unit: 'แผน', icon: 'plan', page: 'plan' },
            { label: 'วิจัยในชั้นเรียน', value: d.research.length, unit: 'เรื่อง', icon: 'research', page: 'research' },
            { label: 'รูปกิจกรรม', value: d.activityPhotos.length, unit: 'รูป', icon: 'photo', page: 'activity' },
            { label: 'รูปฝึกสอน', value: d.teachingPhotos.length, unit: 'รูป', icon: 'board', page: 'teaching' }
          ];
        },
        recent: function () {
          return this.d.logs.slice().sort(function (a, b) {
            return String(b.date || '').localeCompare(String(a.date || ''));
          }).slice(0, 5);
        },
        cover: function () {
          var d = this.d;
          return (d.profile.photo && (d.profile.photo.thumb || d.profile.photo.download || d.profile.photo.url)) ||
                 (d.school.logo && (d.school.logo.thumb || d.school.logo.download || d.school.logo.url)) || null;
        }
      },
      template: [
        '<div>',
        '  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 text-white p-7 sm:p-10 mb-7 shadow-card">',
        '    <div class="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-white/10"></div>',
        '    <div class="absolute -right-24 top-24 w-72 h-72 rounded-full bg-white/5"></div>',
        '    <div class="relative flex flex-col sm:flex-row sm:items-center gap-6">',
        '      <div v-if="cover" class="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white/30 bg-white/20 cursor-zoom-in group relative" @click="coverPopup=true">',
        '        <img :src="cover" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="">',
        '        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"><ui-icon name="eye" cls="w-6 h-6 drop-shadow"/></div>',
        '      </div>',
        '      <div class="min-w-0">',
        '        <p class="text-white/80 text-sm mb-1">{{ d.school.name || "ยังไม่ได้ระบุสถานศึกษา" }}</p>',
        '        <h1 class="text-2xl sm:text-4xl font-semibold leading-tight">{{ d.profile.reportTitle || "รายงานการฝึกประสบการณ์วิชาชีพครู" }}</h1>',
        '        <p class="mt-3 text-white/90">',
        '          <span v-if="d.profile.studentName">{{ d.profile.studentName }}</span>',
        '          <span v-if="d.profile.major"> · {{ d.profile.major }}</span>',
        '          <span v-if="d.profile.academicYear"> · ปีการศึกษา {{ d.profile.academicYear }}</span>',
        '        </p>',
        '      </div>',
        '    </div>',
        '  </section>',
        '',
        '  <teleport to="body">',
        '    <transition name="fade">',
        '      <div v-if="coverPopup && cover" class="fixed inset-0 z-[80] bg-ink-900/85 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 no-print" @click="coverPopup=false">',
        '        <button type="button" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10" @click.stop="coverPopup=false" title="ปิด (Esc)">',
        '          <ui-icon name="x" cls="w-6 h-6"/>',
        '        </button>',
        '        <figure class="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" @click.stop>',
        '          <img :src="cover" class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl pop" referrerpolicy="no-referrer" alt="">',
        '        </figure>',
        '      </div>',
        '    </transition>',
        '  </teleport>',

        '  <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">',
        '    <button v-for="s in stats" :key="s.label" @click="$emit(\'go\', s.page)"',
        '      class="text-left bg-white rounded-2xl border border-ink-100 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">',
        '      <div class="flex items-center justify-between mb-3">',
        '        <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><ui-icon :name="s.icon"/></div>',
        '      </div>',
        '      <p class="text-3xl font-semibold text-ink-900 leading-none ">{{ s.value }}<span class="text-sm font-normal text-ink-400 ml-1.5">{{ s.unit }}</span></p>',
        '      <p class="text-sm text-ink-500 mt-1.5">{{ s.label }}</p>',
        '    </button>',
        '  </div>',

        '  <div class="grid lg:grid-cols-3 gap-5">',
        '    <ui-card title="ข้อมูลผู้ฝึกสอน" class="lg:col-span-2">',
        '      <template #actions>',
        '        <button v-if="edit && filled" class="' + btn.ghost + ' !py-2" @click="openEdit"><ui-icon name="edit" cls="w-4 h-4"/>แก้ไขข้อมูล</button>',
        '      </template>',
        '      <ui-empty v-if="!filled" icon="edit" text="ยังไม่ได้กรอกข้อมูลผู้ฝึกสอน">',
        '        <button v-if="edit" class="' + btn.primary + '" @click="openEdit"><ui-icon name="plus" cls="w-4 h-4"/>กรอกข้อมูลผู้ฝึกสอน</button>',
        '      </ui-empty>',
'      <div v-else class="flex flex-col sm:flex-row gap-6">',

'        <div class="flex gap-4 shrink-0">',

'          <div class="w-28 text-center">',
'            <div v-if="d.profile.photo">',
'              <ui-asset :asset="d.profile.photo" ratio="aspect-[3/4]"/>',
'            </div>',
'            <p class="mt-2 text-xs text-ink-500">รูปครูฝึกสอน</p>',
'          </div>',

'          <div class="w-28 text-center">',
'            <div v-if="d.profile.mentorPhoto">',
'              <ui-asset :asset="d.profile.mentorPhoto" ratio="aspect-[3/4]"/>',
'            </div>',
'            <p class="mt-2 text-xs text-ink-500">รูปครูพี่เลี้ยง</p>',
'          </div>',

'        </div>',

'        <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">',
'          <ui-row v-for="f in fields" :key="f.key" :label="f.label" :value="d.profile[f.key]"/>',
'        </dl>',

'      </div>',
        '    </ui-card>',

        '    <ui-card title="บันทึกล่าสุด">',
        '      <ui-empty v-if="!recent.length" icon="note" text="ยังไม่มีบันทึกรายวัน"/>',
        '      <ul v-else class="space-y-3">',
        '        <li v-for="l in recent" :key="l.id" class="flex gap-3">',
        '          <div class="shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex flex-col items-center justify-center leading-none">',
        '            <span class="text-[10px]">สัปดาห์</span><span class="text-sm font-semibold">{{ l.week || "-" }}</span></div>',
        '          <div class="min-w-0">',
        '            <p class="text-sm font-medium text-ink-800 truncate">{{ l.topic || "(ไม่ระบุหัวข้อ)" }}</p>',
        '            <p class="text-xs text-ink-400">{{ thaiDate(l.date, "short") }} · {{ l.period || "-" }}</p>',
        '          </div>',
        '        </li>',
        '      </ul>',
        '      <button class="mt-4 w-full ' + btn.ghost + ' justify-center" @click="$emit(\'go\', \'log\')">ดูบันทึกทั้งหมด</button>',
        '    </ui-card>',
        '  </div>',

        '  <ui-modal :show="show" title="ข้อมูลผู้ฝึกสอน" wide @close="show=false">',
        '    <div class="grid sm:grid-cols-2 gap-4">',
        '      <div v-for="f in fields" :key="f.key" :class="f.wide ? \'sm:col-span-2\' : \'\'">',
        '        <ui-field :label="f.label" :placeholder="f.placeholder" v-model="form[f.key]"/>',
        '      </div>',
        '    </div>',
'    <div class="mt-5 pt-5 border-t border-ink-100">',
'      <div class="grid sm:grid-cols-2 gap-6">',

'        <div>',
'          <p class="text-[13px] font-medium text-ink-700 mb-2">รูปครูฝึกสอน</p>',
'          <div class="flex items-end gap-4">',
'            <div v-if="form.photo" class="w-28">',
'              <ui-asset :asset="form.photo" removable ratio="aspect-[3/4]" @remove="form.photo=null"/>',
'            </div>',
'            <file-drop compact accept="image/*" label="เลือกรูปครูฝึกสอน" @uploaded="form.photo=$event[0]"/>',
'          </div>',
'        </div>',

'        <div>',
'          <p class="text-[13px] font-medium text-ink-700 mb-2">รูปครูพี่เลี้ยง</p>',
'          <div class="flex items-end gap-4">',
'            <div v-if="form.mentorPhoto" class="w-28">',
'              <ui-asset :asset="form.mentorPhoto" removable ratio="aspect-[3/4]" @remove="form.mentorPhoto=null"/>',
'            </div>',
'            <file-drop compact accept="image/*" label="เลือกรูปครูพี่เลี้ยง" @uploaded="form.mentorPhoto=$event[0]"/>',
'          </div>',
'        </div>',

'      </div>',
'    </div>',
        '    <template #footer>',
        '      <button class="' + btn.ghost + '" @click="show=false">ยกเลิก</button>',
        '      <button class="' + btn.primary + '" @click="submit"><ui-icon name="check" cls="w-4 h-4"/>บันทึก</button>',
        '    </template>',
        '  </ui-modal>',
        '</div>'
      ].join('')
    };

    /* ================= ข้อมูลสถานศึกษา ================= */
    var SCHOOL_FIELDS = [
      { key: 'name', label: 'ชื่อสถานศึกษา' },
      { key: 'affiliation', label: 'สังกัด', placeholder: 'เช่น สพป. / สพม. / อปท.' },
      { key: 'director', label: 'ผู้อำนวยการ' },
      { key: 'size', label: 'ขนาดสถานศึกษา', placeholder: 'เช่น ขนาดกลาง / นักเรียน 480 คน' },
      { key: 'phone', label: 'โทรศัพท์' },
      { key: 'website', label: 'เว็บไซต์' },
      { key: 'address', label: 'ที่ตั้ง', type: 'textarea', rows: 2, wide: true },
      { key: 'vision', label: 'วิสัยทัศน์ / ปรัชญา', type: 'textarea', rows: 3, wide: true },
      { key: 'history', label: 'ประวัติโดยสังเขป', type: 'textarea', rows: 4, wide: true }
    ];

    var School = {
      mixins: [base],
      data: function () { return { show: false, form: {} }; },
      computed: {
        fields: function () { return SCHOOL_FIELDS; },
        filled: function () {
          var s = this.d.school;
          return SCHOOL_FIELDS.some(function (f) { return s[f.key]; });
        }
      },
      methods: {
        openEdit: function () {
          var s = this.d.school, form = {};
          SCHOOL_FIELDS.forEach(function (f) { form[f.key] = s[f.key] || ''; });
          this.form = form;
          this.show = true;
        },
        submit: function () {
          Object.assign(this.d.school, this.form);
          this.save();
          this.show = false;
        }
      },
      template: [
        '<div>',
        '  <page-head icon="school" title="ข้อมูลสถานศึกษา" subtitle="ข้อมูลทั่วไปของโรงเรียนที่ไปฝึกประสบการณ์"/>',
        '  <div class="grid lg:grid-cols-3 gap-5 mb-6">',
        '    <ui-card title="ข้อมูลทั่วไป" class="lg:col-span-2">',
        '      <template #actions>',
        '        <button v-if="edit && filled" class="' + btn.ghost + ' !py-2" @click="openEdit"><ui-icon name="edit" cls="w-4 h-4"/>แก้ไข</button>',
        '      </template>',
        '      <ui-empty v-if="!filled" icon="edit" text="ยังไม่ได้กรอกข้อมูลสถานศึกษา">',
        '        <button v-if="edit" class="' + btn.primary + '" @click="openEdit"><ui-icon name="plus" cls="w-4 h-4"/>กรอกข้อมูลสถานศึกษา</button>',
        '      </ui-empty>',
        '      <dl v-else class="grid sm:grid-cols-2 gap-x-6 gap-y-4">',
        '        <ui-row v-for="f in fields" :key="f.key" :label="f.label" :value="d.school[f.key]" :pre="f.type===\'textarea\'"',
        '          :class="f.wide ? \'sm:col-span-2\' : \'\'"/>',
        '      </dl>',
        '    </ui-card>',
'    <div class="space-y-5">',

// ตราสัญลักษณ์
'      <ui-card title="ตราสัญลักษณ์">',
'        <div v-if="d.school.logo" class="w-32 mx-auto mb-3">',
'          <ui-asset',
'            :asset="d.school.logo"',
'            :removable="edit"',
'            ratio="aspect-square"',
'            @remove="d.school.logo=null; save()"',
'          />',
'        </div>',
'        <file-drop',
'          v-if="edit"',
'          accept="image/*"',
'          label="อัปโหลดตราโรงเรียน"',
'          hint="ไฟล์รูปภาพ (PNG/JPG)"',
'          @uploaded="d.school.logo=$event[0]; save()"',
'        />',
'        <ui-empty',
'          v-else-if="!d.school.logo"',
'          icon="photo"',
'          text="ยังไม่มีรูป"',
'        />',
'      </ui-card>',


// รูปผู้อำนวยการ
'      <ui-card title="รูปผู้อำนวยการ">',
'        <div v-if="d.school.directorPhoto" class="w-32 mx-auto mb-3">',
'          <ui-asset',
'            :asset="d.school.directorPhoto"',
'            :removable="edit"',
'            ratio="aspect-[3/4]"',
'            @remove="d.school.directorPhoto=null; save()"',
'          />',
'        </div>',
'        <file-drop',
'          v-if="edit"',
'          accept="image/*"',
'          label="อัปโหลดรูปผู้อำนวยการ"',
'          hint="ไฟล์รูปภาพ (PNG/JPG)"',
'          @uploaded="d.school.directorPhoto=$event[0]; save()"',
'        />',
'        <ui-empty',
'          v-else-if="!d.school.directorPhoto"',
'          icon="photo"',
'          text="ยังไม่มีรูป"',
'        />',
'      </ui-card>',


// ภาพสถานศึกษา อยู่ล่างสุด
'      <ui-card title="ภาพสถานศึกษา">',
'        <div v-if="d.school.photos.length" class="grid grid-cols-2 gap-3 mb-3">',
'          <ui-asset',
'            v-for="(p,i) in d.school.photos"',
'            :key="p.id"',
'            :asset="p"',
'            :removable="edit"',
'            @remove="d.school.photos.splice(i,1); save()"',
'          />',
'        </div>',
'        <file-drop',
'          v-if="edit"',
'          compact',
'          multiple',
'          accept="image/*"',
'          label="เพิ่มรูป"',
'          @uploaded="d.school.photos.push(...$event); save()"',
'        />',
'        <ui-empty',
'          v-else-if="!d.school.photos.length"',
'          icon="photo"',
'          text="ยังไม่มีรูป"',
'        />',
'      </ui-card>',

'    </div>',

        '  <ui-modal :show="show" title="ข้อมูลสถานศึกษา" wide @close="show=false">',
        '    <div class="grid sm:grid-cols-2 gap-4">',
        '      <div v-for="f in fields" :key="f.key" :class="f.wide ? \'sm:col-span-2\' : \'\'">',
        '        <ui-field :label="f.label" :type="f.type || \'text\'" :rows="f.rows || 3" :placeholder="f.placeholder" v-model="form[f.key]"/>',
        '      </div>',
        '    </div>',
        '    <template #footer>',
        '      <button class="' + btn.ghost + '" @click="show=false">ยกเลิก</button>',
        '      <button class="' + btn.primary + '" @click="submit"><ui-icon name="check" cls="w-4 h-4"/>บันทึก</button>',
        '    </template>',
        '  </ui-modal>',
        '</div>'
      ].join('')
    };

     /* ================= ตารางสอน (แยกเป็นหน้าของตัวเอง) ================= */

  var Schedule = {
    mixins: [base],

    data: function () {
      return {
        term: 0,

        noteShow: false,

        noteForm: "",
      };
    },

    computed: {
      current: function () {
        return this.d.schedules[this.term] || this.d.schedules[0];
      },
    },

    methods: {
      openNote: function () {
        this.noteForm = this.current.note || "";

        this.noteShow = true;
      },

      submitNote: function () {
        this.current.note = this.noteForm;

        this.save();

        this.noteShow = false;
      },

      saveCaption: function () {
        this.save();
      },
    },

    template: [
      "<div>",

      '  <page-head icon="calendar" title="ตารางสอน" subtitle="อัปโหลดรูปตารางสอน แยกตามภาคเรียน">',

      "    <template #actions>",

      '      <button v-if="edit" class="' + btn.ghost + '" @click="openNote">',

      '        <ui-icon name="edit" cls="w-4 h-4"/>แก้ไขหมายเหตุ',

      "      </button>",

      "    </template>",

      "  </page-head>",

      // เลือกภาคเรียน

      '  <div class="flex gap-2 mb-5 no-print">',

      '    <button v-for="(t,i) in d.schedules" :key="t.id" @click="term=i"',

      "      :class=\"['px-4 py-2.5 rounded-xl text-sm font-medium transition', term===i ? 'bg-brand-600 text-white shadow-soft' : 'bg-white border border-ink-200 text-ink-600 hover:border-brand-300']\">",

      "      {{ t.label }}",

      '      <span class="ml-1.5 opacity-70">({{ t.images.length }})</span>',

      "    </button>",

      "  </div>",

      // เนื้อหาตารางสอน

      '  <ui-card v-for="(t,i) in d.schedules" :key="t.id" v-show="term===i" :title="t.label">',

      '    <p v-if="t.note" class="text-sm text-ink-600 whitespace-pre-line leading-relaxed mb-5 pb-5 border-b border-ink-100">',

      "      {{ t.note }}",

      "    </p>",

      // รูปเรียงลง

      '    <div v-if="t.images.length" class="space-y-6 mb-5">',

      '      <div v-for="(img,j) in t.images" :key="img.id">',

      "        <ui-asset",

      '          :asset="img"',

      '          :removable="edit"',

      '          ratio="aspect-[16/9]"',

      '          @remove="t.images.splice(j,1); save()"/>',

      // คำอธิบาย

      '        <div class="mt-3">',

      '          <label class="text-xs font-medium text-ink-500">',

      "            คำอธิบายตารางสอน",

      "          </label>",

      '          <textarea v-if="edit"',

      '            v-model="img.caption"',

      '            @change="saveCaption"',

      '            rows="3"',

      '            placeholder="เช่น ตารางสอนภาคเรียนที่ 1 วิชาคณิตศาสตร์ ป.4 ห้อง 1"',

      '            class="mt-2 w-full rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-brand-300">',

      "          </textarea>",

      '          <p v-else class="mt-2 text-sm text-ink-600 whitespace-pre-line">',

      '            {{ img.caption || "— ไม่มีคำอธิบาย —" }}',

      "          </p>",

      "        </div>",

      "      </div>",

      "    </div>",

      // Upload

      '    <file-drop v-if="edit" multiple accept="image/*,application/pdf"',

      "      :label=\"'อัปโหลดรูปตารางสอน ' + t.label\"",

      '      hint="ลากไฟล์มาวางได้ · รองรับหลายไฟล์"',

      "      @uploaded=\"t.images.push(...$event.map(x => ({...x, caption:''}))); save()\"/>",

      '    <ui-empty v-else-if="!t.images.length"',

      '      icon="calendar"',

      '      text="ยังไม่มีตารางสอนของภาคเรียนนี้"/>',

      "  </ui-card>",

      // Modal หมายเหตุ

      '  <ui-modal :show="noteShow" :title="\'หมายเหตุ — \' + current.label" @close="noteShow=false">',

      '    <ui-field label="หมายเหตุ" type="textarea" :rows="4" v-model="noteForm"',

      '      placeholder="เช่น สอนวิชาคณิตศาสตร์ ป.4–ป.6 รวม 18 คาบ/สัปดาห์"/>',

      "    <template #footer>",

      '      <button class="' + btn.ghost + '" @click="noteShow=false">',

      "        ยกเลิก",

      "      </button>",

      '      <button class="' + btn.primary + '" @click="submitNote">',

      '        <ui-icon name="check" cls="w-4 h-4"/>บันทึก',

      "      </button>",

      "    </template>",

      "  </ui-modal>",

      "</div>",
    ].join(""),
  };

    /* ================= บันทึกรายวัน ================= */
    var emptyLog = function () {
      return { id: '', date: '', day: 1, week: '', topic: '', period: '', activity: '', problem: '' };
    };

    var Log = {
      mixins: [base],
      data: function () {
        return { show: false, form: emptyLog(), editingId: null, filterWeek: 'all', view: 'week', dateKey: 0 };
      },
      computed: {
        dayOptions: function () {
          return Store.WORK_DAYS.map(function (i) { return { value: i, label: 'วัน' + Store.THAI_DAYS[i] }; });
        },
        weekList: function () {
          var set = {};
          this.d.logs.forEach(function (l) { set[l.week || '-'] = 1; });
          return Object.keys(set).sort(function (a, b) { return (Number(a) || 0) - (Number(b) || 0); });
        },
        groups: function () {
          var map = {};
          this.d.logs.forEach(function (l) {
            var k = l.week || '-';
            (map[k] = map[k] || []).push(l);
          });
          var self = this;
          return Object.keys(map).sort(function (a, b) { return (Number(a) || 0) - (Number(b) || 0); })
            .filter(function (w) { return self.filterWeek === 'all' || self.filterWeek === w; })
            .map(function (w) {
              var items = map[w];
              var monday = self.mondayOf(items);
              return {
                week: w,
                count: items.length,
                range: self.rangeOf(items),
                days: Store.WORK_DAYS.map(function (di) {
                  var cell = items.filter(function (l) { return Number(l.day) === di; })
                    .sort(function (a, b) { return String(a.period).localeCompare(String(b.period), 'th', { numeric: true }); });
                  var dated = cell.filter(function (l) { return l.date; })[0];
                  return {
                    index: di,
                    name: Store.THAI_DAYS[di],
                    date: dated ? dated.date : self.addDays(monday, di - 1),
                    items: cell
                  };
                })
              };
            });
        },
        sorted: function () {
          return this.d.logs.slice().sort(function (a, b) {
            return (Number(a.week) || 0) - (Number(b.week) || 0) ||
              String(a.date || '').localeCompare(String(b.date || '')) ||
              String(a.period || '').localeCompare(String(b.period || ''), 'th', { numeric: true });
          });
        }
      },
      methods: {
        dayName: function (i) { return 'วัน' + (Store.THAI_DAYS[Number(i)] || '-'); },
        /** หาวันจันทร์ของสัปดาห์นั้น จากบันทึกใบแรกที่มีวันที่ */
        mondayOf: function (items) {
          var anchor = items.filter(function (i) { return i.date; })[0];
          if (!anchor) return null;
          var dt = new Date(anchor.date + 'T00:00:00');
          if (isNaN(dt)) return null;
          dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
          return dt;
        },
        addDays: function (monday, n) {
          if (!monday) return '';
          var dt = new Date(monday.getTime());
          dt.setDate(dt.getDate() + n);
          return dt.getFullYear() + '-' +
            String(dt.getMonth() + 1).padStart(2, '0') + '-' +
            String(dt.getDate()).padStart(2, '0');
        },
        rangeOf: function (items) {
          var dates = items.map(function (i) { return i.date; }).filter(Boolean).sort();
          if (!dates.length) return '';
          return dates[0] === dates[dates.length - 1]
            ? Store.thaiDate(dates[0], 'short')
            : Store.thaiDate(dates[0], 'short') + ' – ' + Store.thaiDate(dates[dates.length - 1], 'short');
        },
        openNew: function (week, day, date) {
          this.form = emptyLog();
          this.form.week = week && week !== '-' ? week : (this.weekList.filter(function (w) { return w !== '-'; }).pop() || '1');
          if (day) this.form.day = day;
          if (date) this.form.date = date;
          this.editingId = null;
          this.show = true;
        },
        openEdit: function (item) {
          this.form = Object.assign(emptyLog(), item);
          this.editingId = item.id;
          this.show = true;
        },
        onDateChange: function (val) {
          var dateVal = val || this.form.date;
          var di = Store.dayIndex(dateVal);
          if (di === null) return;
          if (di === 0 || di === 6) {
            Store.toast('ตารางบันทึกมีเฉพาะวันจันทร์–ศุกร์ (ไม่รวมวันหยุดเสาร์–อาทิตย์)', 'error');
            this.form.date = '';
            this.dateKey++; // บังคับให้ช่องวันที่ล้างค่าบนหน้าจอจริง ๆ
            return;
          }
          this.form.day = di;
        },
        submit: function () {
          if (!this.form.topic && !this.form.activity) {
            Store.toast('กรุณากรอกหัวข้อหรือกิจกรรมอย่างน้อย 1 ช่อง', 'error');
            return;
          }
          var f = JSON.parse(JSON.stringify(this.form));
          f.day = Number(f.day) || 1;
          if (this.editingId) {
            var i = this.d.logs.findIndex(function (l) { return l.id === f.id; });
            if (i > -1) this.d.logs.splice(i, 1, f);
          } else {
            f.id = this.uid();
            this.d.logs.push(f);
          }
          this.save();
          this.show = false;
        },
        remove: function (item) {
          if (!this.confirmDelete('ลบบันทึกวันที่ ' + (Store.thaiDate(item.date, 'short') || '-') + ' ?')) return;
          var i = this.d.logs.findIndex(function (l) { return l.id === item.id; });
          if (i > -1) this.d.logs.splice(i, 1);
          this.save();
          this.show = false;
        }
      },
      template: [
        '<div>',
        '  <page-head icon="note" title="บันทึกรายวัน" subtitle="บันทึกการปฏิบัติงานรายวัน แยกตามสัปดาห์ (จันทร์–ศุกร์)">',
        '    <template #actions>',
        '      <div class="flex rounded-xl bg-ink-100 p-1">',
        '        <button @click="view=\'week\'" :class="[\'px-3 py-1.5 rounded-lg text-sm font-medium transition\', view===\'week\'?\'bg-white shadow-soft text-ink-900\':\'text-ink-500\']">ตาราง</button>',
        '        <button @click="view=\'list\'" :class="[\'px-3 py-1.5 rounded-lg text-sm font-medium transition\', view===\'list\'?\'bg-white shadow-soft text-ink-900\':\'text-ink-500\']">รายการ</button>',
        '      </div>',
        '      <select v-model="filterWeek" class="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm">',
        '        <option value="all">ทุกสัปดาห์</option>',
        '        <option v-for="w in weekList" :key="w" :value="w">สัปดาห์ที่ {{ w }}</option>',
        '      </select>',
        '      <button v-if="edit" class="' + btn.primary + '" @click="openNew()"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มบันทึก</button>',
        '    </template>',
        '  </page-head>',

        '  <ui-empty v-if="!d.logs.length" icon="note" text="ยังไม่มีบันทึกรายวัน เริ่มจากการเพิ่มบันทึกแรกของสัปดาห์ที่ 1">',
        '    <button v-if="edit" class="' + btn.primary + '" @click="openNew(\'1\')"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มบันทึกแรก</button>',
        '  </ui-empty>',

        /* ---- มุมมองตารางสัปดาห์ ---- */
        '  <div v-else-if="view===\'week\'" class="space-y-6">',
        '    <ui-card v-for="g in groups" :key="g.week" :title="\'สัปดาห์ที่ \' + g.week" :subtitle="g.range" :pad="false">',
        '      <template #actions>',
        '        <span class="text-xs text-ink-400">{{ g.count }} รายการ</span>',
        '        <button v-if="edit" class="' + btn.ghost + ' !py-1.5 !px-3" @click="openNew(g.week)"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่ม</button>',
        '      </template>',
        '      <div class="overflow-x-auto">',
        '        <div class="grid grid-cols-5 min-w-[900px] divide-x divide-ink-100">',
        '          <div v-for="col in g.days" :key="col.index" class="flex flex-col">',
        '            <div class="px-3 py-2.5 bg-brand-50/70 border-b border-ink-100 text-center">',
        '              <p class="font-semibold text-brand-800 text-sm">วัน{{ col.name }}</p>',
        '              <p class="text-[11px] text-brand-600/80 h-4">{{ col.date ? thaiDate(col.date, "short") : "" }}</p>',
        '            </div>',
        '            <div class="p-2.5 space-y-2.5 flex-1 min-h-[150px] bg-white">',
        '              <article v-for="l in col.items" :key="l.id" @click="edit && openEdit(l)"',
        '                :class="[\'rounded-xl border border-ink-100 p-3 transition\', edit ? \'cursor-pointer hover:border-brand-300 hover:bg-brand-50/40\' : \'\']">',
        '                <div v-if="l.period" class="flex items-center gap-2 mb-1.5">',
        '                  <span class="inline-flex items-center rounded-lg bg-brand-100 text-brand-700 px-2 py-0.5 text-[11px] font-medium">{{ l.period }}</span>',
        '                </div>',
        '                <p class="text-sm font-medium text-ink-900 leading-snug">{{ l.topic || "(ไม่ระบุหัวข้อ)" }}</p>',
        '                <p v-if="l.activity" class="text-xs text-ink-600 mt-1.5 whitespace-pre-line line-clamp-4">{{ l.activity }}</p>',
        '                <p v-if="l.problem" class="text-xs text-amber-700 mt-2 pt-2 border-t border-dashed border-amber-200 whitespace-pre-line line-clamp-3">',
        '                  <span class="font-medium">ปัญหา/ข้อเสนอแนะ:</span> {{ l.problem }}</p>',
        '              </article>',
        '              <button v-if="edit" @click="openNew(g.week, col.index, col.date)"',
        '                class="no-print w-full rounded-xl border border-dashed border-ink-200 py-2 text-xs text-ink-400 hover:border-brand-300 hover:text-brand-600 transition">+ เพิ่ม</button>',
        '            </div>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </ui-card>',
        '  </div>',

        /* ---- มุมมองรายการ ---- */
        '  <ui-card v-else :pad="false" title="บันทึกทั้งหมด">',
        '    <div class="overflow-x-auto">',
        '      <table class="w-full text-sm min-w-[880px]">',
        '        <thead class="bg-ink-50 text-ink-600 text-left">',
        '          <tr><th class="px-4 py-3 font-medium">สัปดาห์</th><th class="px-4 py-3 font-medium">วันที่</th>',
        '            <th class="px-4 py-3 font-medium">วัน</th><th class="px-4 py-3 font-medium">คาบ</th>',
        '            <th class="px-4 py-3 font-medium">หัวข้อ</th><th class="px-4 py-3 font-medium">กิจกรรม</th>',
        '            <th class="px-4 py-3 font-medium">ปัญหา/ข้อเสนอแนะ</th><th class="no-print"></th></tr>',
        '        </thead>',
        '        <tbody class="divide-y divide-ink-100">',
        '          <tr v-for="l in sorted" :key="l.id" class="align-top hover:bg-brand-50/30">',
        '            <td class="px-4 py-3 whitespace-nowrap">{{ l.week || "-" }}</td>',
        '            <td class="px-4 py-3 whitespace-nowrap">{{ thaiDate(l.date, "short") }}</td>',
        '            <td class="px-4 py-3 whitespace-nowrap">{{ dayName(l.day) }}</td>',
        '            <td class="px-4 py-3 whitespace-nowrap">{{ l.period }}</td>',
        '            <td class="px-4 py-3 font-medium text-ink-900">{{ l.topic }}</td>',
        '            <td class="px-4 py-3 text-ink-600 whitespace-pre-line max-w-xs">{{ l.activity }}</td>',
        '            <td class="px-4 py-3 text-amber-700 whitespace-pre-line max-w-xs">{{ l.problem }}</td>',
        '            <td class="px-3 py-3 no-print"><button v-if="edit" @click="openEdit(l)" class="text-ink-400 hover:text-brand-600"><ui-icon name="edit" cls="w-4 h-4"/></button></td>',
        '          </tr>',
        '        </tbody>',
        '      </table>',
        '    </div>',
        '  </ui-card>',

        /* ---- ฟอร์ม ---- */
        '  <ui-modal :show="show" :title="editingId ? \'แก้ไขบันทึก\' : \'เพิ่มบันทึกรายวัน\'" wide @close="show=false">',
        '    <div class="grid sm:grid-cols-3 gap-4">',
        '      <ui-field :key="dateKey" label="วันที่" type="date" v-model="form.date" @update:modelValue="onDateChange"/>',
        '      <ui-field label="เลือกวัน" type="select" v-model="form.day" :options="dayOptions" hint="มีเฉพาะจันทร์–ศุกร์"/>',
        '      <ui-field label="สัปดาห์ที่" v-model="form.week" placeholder="1"/>',
        '      <div class="sm:col-span-2"><ui-field label="หัวข้อ" v-model="form.topic" placeholder="เช่น การบวกเลขสองหลัก"/></div>',
        '      <ui-field label="คาบ" v-model="form.period" placeholder="เช่น คาบ 3–4"/>',
        '      <div class="sm:col-span-3"><ui-field label="กิจกรรม" type="textarea" :rows="5" v-model="form.activity" placeholder="สรุปกิจกรรมการเรียนการสอนในคาบนี้"/></div>',
        '      <div class="sm:col-span-3"><ui-field label="ปัญหา / ข้อเสนอแนะ" type="textarea" :rows="4" v-model="form.problem"/></div>',
        '    </div>',
        '    <template #footer>',
        '      <button v-if="editingId" class="' + btn.danger + ' mr-auto" @click="remove(form)"><ui-icon name="trash" cls="w-4 h-4"/>ลบ</button>',
        '      <button class="' + btn.ghost + '" @click="show=false">ยกเลิก</button>',
        '      <button class="' + btn.primary + '" @click="submit"><ui-icon name="check" cls="w-4 h-4"/>บันทึก</button>',
        '    </template>',
        '  </ui-modal>',
        '</div>'
      ].join('')
    };

    /* ================= แผนการสอน ================= */
    var emptyPlan = function () {
      return { id: '', name: '', level: '', subject: '', detail: '', slide: null, file: null };
    };

    var Plan = {
      mixins: [base],
      data: function () { return { show: false, form: emptyPlan(), editingId: null }; },
      methods: {
        openNew: function () { this.form = emptyPlan(); this.editingId = null; this.show = true; },
        openEdit: function (p) { this.form = JSON.parse(JSON.stringify(p)); this.editingId = p.id; this.show = true; },
        submit: function () {
          if (!this.form.name) { Store.toast('กรุณากรอกชื่อแผนการสอน', 'error'); return; }
          var f = JSON.parse(JSON.stringify(this.form));
          if (this.editingId) {
            var i = this.d.plans.findIndex(function (p) { return p.id === f.id; });
            if (i > -1) this.d.plans.splice(i, 1, f);
          } else { f.id = this.uid(); this.d.plans.push(f); }
          this.save(); this.show = false;
        },
        remove: function (p) {
          if (!this.confirmDelete('ลบแผนการสอน "' + (p.name || '') + '" ?')) return;
          var i = this.d.plans.findIndex(function (x) { return x.id === p.id; });
          if (i > -1) this.d.plans.splice(i, 1);
          this.save(); this.show = false;
        }
      },
      template: [
        '<div>',
        '  <page-head icon="plan" title="แผนการสอน" subtitle="ชื่อแผน ระดับชั้น รายวิชา รายละเอียด พร้อมไฟล์สไลด์และไฟล์แผน">',
        '    <template #actions><button v-if="edit" class="' + btn.primary + '" @click="openNew"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มแผนการสอน</button></template>',
        '  </page-head>',
        '  <ui-empty v-if="!d.plans.length" icon="plan" text="ยังไม่มีแผนการสอน">',
        '    <button v-if="edit" class="' + btn.primary + '" @click="openNew"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มแผนแรก</button>',
        '  </ui-empty>',
        '  <div v-else class="grid md:grid-cols-2 gap-5">',
        '    <ui-card v-for="p in d.plans" :key="p.id" :title="p.name" :subtitle="[p.level, p.subject].filter(Boolean).join(\' · \')">',
        '      <template #actions><button v-if="edit" @click="openEdit(p)" class="text-ink-400 hover:text-brand-600 p-1"><ui-icon name="edit" cls="w-4 h-4"/></button></template>',
        '      <p v-if="p.detail" class="text-sm text-ink-600 whitespace-pre-line leading-relaxed">{{ p.detail }}</p>',
        '      <p v-else class="text-sm text-ink-400">— ไม่มีรายละเอียด —</p>',
        '      <div class="grid sm:grid-cols-2 gap-3 mt-4">',
        '        <div>',
        '          <p class="text-xs font-medium text-ink-500 mb-1.5">ไฟล์สไลด์</p>',
        '          <ui-asset v-if="p.slide" :asset="p.slide" :removable="edit" @remove="p.slide=null; save()"/>',
        '          <p v-else class="text-xs text-ink-300 py-2">ยังไม่มีไฟล์</p>',
        '        </div>',
        '        <div>',
        '          <p class="text-xs font-medium text-ink-500 mb-1.5">ไฟล์แผนการสอน</p>',
        '          <ui-asset v-if="p.file" :asset="p.file" :removable="edit" @remove="p.file=null; save()"/>',
        '          <p v-else class="text-xs text-ink-300 py-2">ยังไม่มีไฟล์</p>',
        '        </div>',
        '      </div>',
        '    </ui-card>',
        '  </div>',

        '  <ui-modal :show="show" :title="editingId ? \'แก้ไขแผนการสอน\' : \'เพิ่มแผนการสอน\'" wide @close="show=false">',
        '    <div class="grid sm:grid-cols-2 gap-4">',
        '      <div class="sm:col-span-2"><ui-field label="ชื่อแผน" v-model="form.name" placeholder="เช่น แผนการจัดการเรียนรู้ที่ 1 เรื่อง จำนวนนับ"/></div>',
        '      <ui-field label="ระดับชั้น" v-model="form.level" placeholder="เช่น ประถมศึกษาปีที่ 4"/>',
        '      <ui-field label="รายวิชา" v-model="form.subject" placeholder="เช่น คณิตศาสตร์ (ค14101)"/>',
        '      <div class="sm:col-span-2"><ui-field label="รายละเอียด" type="textarea" :rows="5" v-model="form.detail" placeholder="สาระสำคัญ จุดประสงค์ กิจกรรม สื่อ การวัดผล ฯลฯ"/></div>',
        '    </div>',
        '    <div class="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-ink-100">',
        '      <div>',
        '        <p class="text-[13px] font-medium text-ink-700 mb-2">ไฟล์สไลด์</p>',
        '        <div v-if="form.slide" class="mb-2"><ui-asset :asset="form.slide" removable @remove="form.slide=null"/></div>',
        '        <file-drop compact accept=".ppt,.pptx,.pdf,.key,image/*,application/*" label="เลือกไฟล์สไลด์" @uploaded="form.slide=$event[0]"/>',
        '      </div>',
        '      <div>',
        '        <p class="text-[13px] font-medium text-ink-700 mb-2">ไฟล์แผนการสอน</p>',
        '        <div v-if="form.file" class="mb-2"><ui-asset :asset="form.file" removable @remove="form.file=null"/></div>',
        '        <file-drop compact accept=".doc,.docx,.pdf,application/*,image/*" label="เลือกไฟล์แผน" @uploaded="form.file=$event[0]"/>',
        '      </div>',
        '    </div>',
        '    <template #footer>',
        '      <button v-if="editingId" class="' + btn.danger + ' mr-auto" @click="remove(form)"><ui-icon name="trash" cls="w-4 h-4"/>ลบ</button>',
        '      <button class="' + btn.ghost + '" @click="show=false">ยกเลิก</button>',
        '      <button class="' + btn.primary + '" @click="submit"><ui-icon name="check" cls="w-4 h-4"/>บันทึก</button>',
        '    </template>',
        '  </ui-modal>',
        '</div>'
      ].join('')
    };
/* ================= นิเทศการสอน ================= */
  var emptySupervision = function () {
    return {
      id: "",
      round: "",
      date: "",
      supervisor: "",
      detail: "",
      problem: "",
      feedback: "",
      files: [],
    };
  };

  var Supervision = {
    mixins: [base],
    data: function () {
      return { show: false, form: emptySupervision(), editingId: null };
    },
    computed: {
      items: function () {
        return (this.d.supervisions || []).slice().sort(function (a, b) {
          var rA =
            parseFloat(String(a.round || "").replace(/[^\d.]/g, "")) || 0;
          var rB =
            parseFloat(String(b.round || "").replace(/[^\d.]/g, "")) || 0;
          return (
            rA - rB || String(b.date || "").localeCompare(String(a.date || ""))
          );
        });
      },
    },
    methods: {
      openNew: function () {
        this.form = emptySupervision();
        var lastRound = (this.d.supervisions || []).length + 1;
        this.form.round = String(lastRound);
        this.editingId = null;
        this.show = true;
      },
      openEdit: function (item) {
        this.form = JSON.parse(JSON.stringify(item));
        if (!Array.isArray(this.form.files)) this.form.files = [];
        this.editingId = item.id;
        this.show = true;
      },
      submit: function () {
        if (!this.form.round && !this.form.detail && !this.form.feedback) {
          Store.toast("กรุณากรอกข้อมูลการนิเทศ", "error");
          return;
        }
        var f = JSON.parse(JSON.stringify(this.form));
        if (!Array.isArray(f.files)) f.files = [];
        if (this.editingId) {
          var idToFind = this.editingId;
          var i = this.d.supervisions.findIndex(function (s) {
            return s.id === idToFind;
          });
          if (i > -1) {
            f.id = idToFind;
            this.d.supervisions.splice(i, 1, f);
          }
        } else {
          f.id = this.uid();
          this.d.supervisions.push(f);
        }
        this.save();
        this.show = false;
      },
      remove: function (item) {
        var title =
          (item.round ? "นิเทศครั้งที่ " + item.round : "") ||
          item.supervisor ||
          Store.thaiDate(item.date, "short") ||
          "รายการนี้";
        if (!this.confirmDelete('ลบข้อมูลการนิเทศ "' + title + '" ?')) return;
        var i = this.d.supervisions.findIndex(function (s) {
          return s.id === item.id;
        });
        if (i > -1) this.d.supervisions.splice(i, 1);
        this.save();
        this.show = false;
      },
    },
    template: [
      "<div>",
      '  <page-head icon="eye" title="นิเทศการสอน" subtitle="บันทึกผลการนิเทศการสอน รายละเอียด ปัญหาที่เกิดขึ้น และสิ่งที่อาจารย์แนะนำ">',
      '    <template #actions><button v-if="edit" class="' +
        btn.primary +
        '" @click="openNew"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มการนิเทศ</button></template>',
      "  </page-head>",
      '  <ui-empty v-if="!d.supervisions || !d.supervisions.length" icon="eye" text="ยังไม่มีบันทึกการนิเทศการสอน">',
      '    <button v-if="edit" class="' +
        btn.primary +
        '" @click="openNew"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มการนิเทศครั้งแรก</button>',
      "  </ui-empty>",
      '  <div v-else class="space-y-5">',
      "    <ui-card v-for=\"item in items\" :key=\"item.id\" :title=\"item.round ? 'นิเทศครั้งที่ ' + item.round : 'การนิเทศการสอน'\" :subtitle=\"[item.date ? thaiDate(item.date, 'short') : '', item.supervisor ? 'ผู้นิเทศ: ' + item.supervisor : ''].filter(Boolean).join(' · ')\">",
      '      <template #actions><button v-if="edit" @click="openEdit(item)" class="text-ink-400 hover:text-brand-600 p-1"><ui-icon name="edit" cls="w-4 h-4"/></button></template>',
      "      ",
      "      <!-- รายละเอียดนิเทศ -->",
      '      <div v-if="item.detail" class="mb-4">',
      '        <h4 class="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">',
      '          <ui-icon name="note" cls="w-4 h-4 text-brand-600"/>รายละเอียดการนิเทศ</h4>',
      '        <p class="text-[15px] text-ink-800 whitespace-pre-line leading-relaxed pl-5">{{ item.detail }}</p>',
      "      </div>",
      "      ",
      "      <!-- ปัญหาที่เกิดขึ้น -->",
      '      <div v-if="item.problem" class="mb-4 p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 text-rose-950">',
      '        <h4 class="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">',
      '          <ui-icon name="x" cls="w-4 h-4 text-rose-600"/>ปัญหาที่เกิดขึ้น</h4>',
      '        <p class="text-[14.5px] whitespace-pre-line leading-relaxed text-rose-900">{{ item.problem }}</p>',
      "      </div>",
      "      ",
      "      <!-- สิ่งที่อาจารย์แนะนำ -->",
      '      <div v-if="item.feedback" class="mb-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950">',
      '        <h4 class="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">',
      '          <ui-icon name="check" cls="w-4 h-4 text-emerald-600"/>สิ่งที่อาจารย์แนะนำ</h4>',
      '        <p class="text-[14.5px] whitespace-pre-line leading-relaxed text-emerald-900">{{ item.feedback }}</p>',
      "      </div>",
      "      ",
      "      <!-- ไฟล์แนบ / รูปภาพ -->",
      '      <div v-if="item.files && item.files.length" class="mt-4 pt-4 border-t border-ink-100">',
      '        <h4 class="text-xs font-semibold text-ink-500 mb-2 flex items-center gap-1.5">',
      '          <ui-icon name="file" cls="w-4 h-4 text-brand-600"/>ไฟล์แนบ / แบบประเมิน / รูปภาพ</h4>',
      '        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">',
      '          <ui-asset v-for="(f,i) in item.files" :key="f.id" :asset="f" :removable="edit" @remove="item.files.splice(i,1); save()"/>',
      "        </div>",
      "      </div>",
      "    </ui-card>",
      "  </div>",

      '  <ui-modal :show="show" :title="editingId ? \'แก้ไขการนิเทศการสอน\' : \'เพิ่มการนิเทศการสอน\'" wide @close="show=false">',
      '    <div class="grid sm:grid-cols-3 gap-4">',
      '      <ui-field label="นิเทศครั้งที่" v-model="form.round" placeholder="เช่น 1"/>',
      '      <ui-field label="วันที่" type="date" v-model="form.date"/>',
      '      <ui-field label="อาจารย์ผู้นิเทศ" v-model="form.supervisor" placeholder="เช่น อ.ดร.สมศรี / ครูพี่เลี้ยง"/>',
      '      <div class="sm:col-span-3"><ui-field label="รายละเอียดการนิเทศ" type="textarea" :rows="4" v-model="form.detail" placeholder="ระบุวิชา ระดับชั้น แผนการสอน หัวข้อกิจกรรมการเรียนรู้ ฯลฯ"/></div>',
      '      <div class="sm:col-span-3"><ui-field label="ปัญหาที่เกิดขึ้น" type="textarea" :rows="3" v-model="form.problem" placeholder="ปัญหาและอุปสรรคที่พบระหว่างการจัดกิจกรรมการเรียนการสอน"/></div>',
      '      <div class="sm:col-span-3"><ui-field label="สิ่งที่อาจารย์แนะนำ" type="textarea" :rows="4" v-model="form.feedback" placeholder="คำแนะนำ ข้อเสนอแนะ แนวทางพัฒนาจากอาจารย์นิเทศก์"/></div>',
      "    </div>",
      '    <div class="mt-5 pt-5 border-t border-ink-100">',
      '      <p class="text-[13px] font-medium text-ink-700 mb-2">ไฟล์แนบ / แบบประเมิน / ภาพถ่ายการนิเทศ</p>',
      '      <div v-if="form.files && form.files.length" class="grid sm:grid-cols-2 gap-3 mb-3">',
      '        <ui-asset v-for="(f,i) in form.files" :key="f.id" :asset="f" removable @remove="form.files.splice(i,1)"/>',
      "      </div>",
      '      <file-drop multiple label="อัปโหลดไฟล์/รูปภาพการนิเทศ" hint="PDF / Word / รูปภาพ (เลือกได้หลายไฟล์)" @uploaded="form.files.push(...$event)"/>',
      "    </div>",
      "    <template #footer>",
      '      <button v-if="editingId" class="' +
        btn.danger +
        ' mr-auto" @click="remove(form)"><ui-icon name="trash" cls="w-4 h-4"/>ลบ</button>',
      '      <button class="' +
        btn.ghost +
        '" @click="show=false">ยกเลิก</button>',
      '      <button class="' +
        btn.primary +
        '" @click="submit"><ui-icon name="check" cls="w-4 h-4"/>บันทึก</button>',
      "    </template>",
      "  </ui-modal>",
      "</div>",
    ].join(""),
  };
    /* ================= วิจัยในชั้นเรียน ================= */
    var Research = {
      mixins: [base],
      data: function () { return { show: false, form: { id: '', title: '', detail: '', files: [] }, editingId: null }; },
      methods: {
        openNew: function () { this.form = { id: '', title: '', detail: '', files: [] }; this.editingId = null; this.show = true; },
        openEdit: function (r) { this.form = JSON.parse(JSON.stringify(r)); this.editingId = r.id; this.show = true; },
        submit: function () {
          if (!this.form.title) { Store.toast('กรุณากรอกชื่อวิจัยในชั้นเรียน', 'error'); return; }
          var f = JSON.parse(JSON.stringify(this.form));
          if (this.editingId) {
            var i = this.d.research.findIndex(function (r) { return r.id === f.id; });
            if (i > -1) this.d.research.splice(i, 1, f);
          } else { f.id = this.uid(); this.d.research.push(f); }
          this.save(); this.show = false;
        },
        remove: function (r) {
          if (!this.confirmDelete('ลบงานวิจัย "' + (r.title || '') + '" ?')) return;
          var i = this.d.research.findIndex(function (x) { return x.id === r.id; });
          if (i > -1) this.d.research.splice(i, 1);
          this.save(); this.show = false;
        }
      },
      template: [
        '<div>',
        '  <page-head icon="research" title="วิจัยในชั้นเรียน" subtitle="ชื่อเรื่องวิจัย พร้อมไฟล์รายงานวิจัย">',
        '    <template #actions><button v-if="edit" class="' + btn.primary + '" @click="openNew"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มงานวิจัย</button></template>',
        '  </page-head>',
        '  <ui-empty v-if="!d.research.length" icon="research" text="ยังไม่มีงานวิจัยในชั้นเรียน">',
        '    <button v-if="edit" class="' + btn.primary + '" @click="openNew"><ui-icon name="plus" cls="w-4 h-4"/>เพิ่มงานวิจัย</button>',
        '  </ui-empty>',
        '  <div v-else class="space-y-5">',
        '    <ui-card v-for="r in d.research" :key="r.id" :title="r.title">',
        '      <template #actions><button v-if="edit" @click="openEdit(r)" class="text-ink-400 hover:text-brand-600 p-1"><ui-icon name="edit" cls="w-4 h-4"/></button></template>',
        '      <p v-if="r.detail" class="text-sm text-ink-600 whitespace-pre-line leading-relaxed mb-4">{{ r.detail }}</p>',
        '      <div v-if="r.files.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">',
        '        <ui-asset v-for="(f,i) in r.files" :key="f.id" :asset="f" :removable="edit" @remove="r.files.splice(i,1); save()"/>',
        '      </div>',
        '      <p v-else class="text-xs text-ink-300">ยังไม่มีไฟล์แนบ</p>',
        '    </ui-card>',
        '  </div>',

        '  <ui-modal :show="show" :title="editingId ? \'แก้ไขงานวิจัย\' : \'เพิ่มงานวิจัยในชั้นเรียน\'" wide @close="show=false">',
        '    <div class="space-y-4">',
        '      <ui-field label="ชื่อวิจัยในชั้นเรียน" v-model="form.title" placeholder="เช่น การพัฒนาทักษะการอ่านออกเสียงโดยใช้บัตรคำ"/>',
        '      <ui-field label="รายละเอียด (ถ้ามี)" type="textarea" :rows="4" v-model="form.detail"/>',
        '      <div>',
        '        <p class="text-[13px] font-medium text-ink-700 mb-2">ไฟล์วิจัย</p>',
        '        <div v-if="form.files.length" class="grid sm:grid-cols-2 gap-3 mb-3">',
        '          <ui-asset v-for="(f,i) in form.files" :key="f.id" :asset="f" removable @remove="form.files.splice(i,1)"/>',
        '        </div>',
        '        <file-drop multiple label="อัปโหลดไฟล์วิจัย" hint="PDF / Word / รูปภาพ" @uploaded="form.files.push(...$event)"/>',
        '      </div>',
        '    </div>',
        '    <template #footer>',
        '      <button v-if="editingId" class="' + btn.danger + ' mr-auto" @click="remove(form)"><ui-icon name="trash" cls="w-4 h-4"/>ลบ</button>',
        '      <button class="' + btn.ghost + '" @click="show=false">ยกเลิก</button>',
        '      <button class="' + btn.primary + '" @click="submit"><ui-icon name="check" cls="w-4 h-4"/>บันทึก</button>',
        '    </template>',
        '  </ui-modal>',
        '</div>'
      ].join('')
    };

    /* ================= แกลเลอรีรูป (กิจกรรม / ฝึกสอน) ================= */
    var Gallery = {
      mixins: [base],
      props: { field: String, title: String, subtitle: String, icon: String },
      data: function () { return { lightbox: null }; },
      computed: {
        items: function () { return this.d[this.field]; }
      },
      mounted: function () {
        var self = this;
        this._escHandler = function (e) {
          if (e.key === 'Escape' && self.lightbox) self.lightbox = null;
        };
        window.addEventListener('keydown', this._escHandler);
      },
      unmounted: function () {
        window.removeEventListener('keydown', this._escHandler);
      },
      methods: {
        add: function (assets) {
          var self = this;
          assets.forEach(function (a) {
            self.items.push({ id: Store.uid(), file: a, caption: '', date: '' });
          });
          this.save();
        },
        remove: function (i) {
          if (!this.confirmDelete('ลบรูปนี้?')) return;
          var it = this.items[i];
          this.items.splice(i, 1);
          if (it) Store.removeAsset(it.file);
          this.save();
        },
        downloadLightbox: function () {
          if (!this.lightbox || !this.lightbox.file) return;
          var f = this.lightbox.file;
          if (f.download) {
            window.open(f.download, '_blank');
          } else if (f.url) {
            var link = document.createElement('a');
            link.href = f.url;
            link.download = f.name || 'image';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      },
      template: [
        '<div>',
        '  <page-head :icon="icon" :title="title" :subtitle="subtitle">',
        '    <template #actions><file-drop v-if="edit" compact multiple accept="image/*" label="อัปโหลดรูป" @uploaded="add"/></template>',
        '  </page-head>',
        '  <ui-empty v-if="!items.length" icon="photo" text="ยังไม่มีรูปในหน้านี้">',
        '    <file-drop v-if="edit" multiple accept="image/*" label="อัปโหลดรูป" hint="เลือกได้หลายรูปพร้อมกัน" @uploaded="add"/>',
        '  </ui-empty>',
        '  <div v-else>',
        '    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">',
        '      <figure v-for="(p,i) in items" :key="p.id" class="group bg-white rounded-2xl border border-ink-100 overflow-hidden shadow-soft">',
        '        <div class="relative aspect-[4/3] bg-ink-50 cursor-zoom-in" @click="lightbox=p">',
        '          <img :src="p.file.thumb || p.file.url" class="w-full h-full object-cover" loading="lazy" referrerpolicy="no-referrer" :alt="p.caption">',
        '          <button v-if="edit" @click.stop="remove(i)" class="no-print absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/95 text-ink-600 shadow-soft opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:text-red-600">',
        '            <ui-icon name="trash" cls="w-4 h-4"/></button>',
        '        </div>',
        '        <figcaption class="p-3 space-y-2">',
        '          <input v-if="edit" v-model="p.caption" placeholder="คำบรรยายภาพ" class="w-full text-sm bg-transparent outline-none placeholder:text-ink-300 border-b border-transparent focus:border-brand-300 pb-1">',
        '          <p v-else class="text-sm text-ink-700">{{ p.caption || "—" }}</p>',
        '          <input v-if="edit" type="date" v-model="p.date" class="w-full text-xs text-ink-500 bg-transparent outline-none">',
        '          <p v-else-if="p.date" class="text-xs text-ink-400">{{ thaiDate(p.date, "short") }}</p>',
        '        </figcaption>',
        '      </figure>',
        '    </div>',
        '    <div v-if="edit" class="mt-5"><file-drop multiple accept="image/*" label="เพิ่มรูปอีก" hint="ลากไฟล์มาวางได้" @uploaded="add"/></div>',
        '  </div>',

        '',
        '  <teleport to="body">',
        '    <transition name="fade"><div v-if="lightbox" class="fixed inset-0 z-[80] bg-ink-900/85 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 no-print" @click="lightbox=null">',
        '      <button type="button" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10" @click.stop="lightbox=null" title="ปิด (Esc)">',
        '        <ui-icon name="x" cls="w-6 h-6"/>',
        '      </button>',
        '      <figure class="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" @click.stop>',
        '        <img :src="lightbox.file.thumb || lightbox.file.download || lightbox.file.url" class="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl pop" referrerpolicy="no-referrer" alt="">',
        '        <figcaption class="mt-3.5 flex flex-wrap items-center justify-center gap-3 text-white/90 text-sm text-center">',
        '          <span v-if="lightbox.caption" class="font-medium">{{ lightbox.caption }}</span>',
        '          <span v-if="lightbox.date" class="text-white/60"> · {{ thaiDate(lightbox.date, "short") }}</span>',
        '          <button type="button" @click="downloadLightbox" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-xs text-white transition">',
        '            <ui-icon name="download" cls="w-3.5 h-3.5"/> ดาวน์โหลด',
        '          </button>',
        '        </figcaption>',
        '      </figure>',
        '    </div></transition>',
        '  </teleport>',
        '</div>'
      ].join('')
    };

    /* ================= สรุปรายงาน ================= */
    var Summary = {
      mixins: [base],
      computed: {
        fields: function () {
          return [
            { key: 'overview', label: 'สรุปภาพรวมการฝึกประสบการณ์', rows: 5 },
            { key: 'strengths', label: 'จุดเด่น / สิ่งที่ทำได้ดี', rows: 4 },
            { key: 'problems', label: 'ปัญหาและอุปสรรค', rows: 4 },
            { key: 'solutions', label: 'แนวทางการแก้ไข', rows: 4 },
            { key: 'learned', label: 'สิ่งที่ได้เรียนรู้', rows: 4 },
            { key: 'suggestions', label: 'ข้อเสนอแนะ', rows: 4 },
            { key: 'thanks', label: 'กิตติกรรมประกาศ / คำขอบคุณ', rows: 3 }
          ];
        },
        counts: function () {
          var d = this.d;
          return [
            ['บันทึกรายวัน', d.logs.length + ' รายการ'],
            ['แผนการสอน', d.plans.length + ' แผน'],
            ['วิจัยในชั้นเรียน', d.research.length + ' เรื่อง'],
            ['รูปกิจกรรม', d.activityPhotos.length + ' รูป'],
            ['รูปฝึกสอน', d.teachingPhotos.length + ' รูป']
          ];
        }
      },
      methods: { print: function () { window.print(); } },
      template: [
        '<div>',
        '  <page-head icon="summary" title="สรุปรายงาน" subtitle="สรุปผลการฝึกประสบการณ์วิชาชีพครูตลอดช่วงเวลาฝึกสอน">',
        '    <template #actions><button class="' + btn.ghost + '" @click="print"><ui-icon name="print" cls="w-4 h-4"/>พิมพ์ / บันทึก PDF</button></template>',
        '  </page-head>',
        '  <div class="grid lg:grid-cols-3 gap-5">',
        '    <div class="lg:col-span-2 space-y-5">',
        '      <ui-card v-for="f in fields" :key="f.key" :title="f.label">',
        '        <ui-field type="textarea" :rows="f.rows" v-model="d.summary[f.key]" :readonly="!edit"/>',
        '      </ui-card>',
        '    </div>',
        '    <div class="space-y-5">',
        '      <ui-card title="สรุปจำนวน">',
        '        <dl class="space-y-3">',
        '          <div v-for="c in counts" :key="c[0]" class="flex items-center justify-between text-sm">',
        '            <dt class="text-ink-500">{{ c[0] }}</dt><dd class="font-medium text-ink-900">{{ c[1] }}</dd></div>',
        '        </dl>',
        '      </ui-card>',
        '      <ui-card title="ไฟล์แนบรายงาน">',
        '        <div v-if="d.summary.files.length" class="space-y-3 mb-3">',
        '          <ui-asset v-for="(f,i) in d.summary.files" :key="f.id" :asset="f" :removable="edit" @remove="d.summary.files.splice(i,1); save()"/>',
        '        </div>',
        '        <file-drop v-if="edit" compact multiple label="แนบไฟล์รายงาน" @uploaded="d.summary.files.push(...$event); save()"/>',
        '        <ui-empty v-else-if="!d.summary.files.length" icon="file" text="ยังไม่มีไฟล์แนบ"/>',
        '      </ui-card>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('')
    };

    /* ================= ตั้งค่า ================= */
    var Settings = {
      mixins: [base],
      data: function () {
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem('tp.config') || '{}'); } catch (e) { /* ignore */ }
        return {
          clientId: saved.googleClientId || window.APP_CONFIG.googleClientId || '',
          apiKey: saved.googleApiKey || window.APP_CONFIG.googleApiKey || '',
          // เปิดส่วน "ตั้งค่าขั้นสูง" อัตโนมัติเมื่อยังเชื่อมต่อ Google ไม่ได้
          advanced: !Drive.isConfigured()
        };
      },
      computed: {
        s: function () { return Store.state; },
        folderUrl: function () { return Drive.folderUrl(); },
        configured: function () { return Drive.isConfigured(); },
        /** ค่าที่เว็บกำลังใช้จริง มาจากไหน — ไฟล์ config.js หรือที่กรอกไว้ในเครื่องนี้ */
        configSource: function () {
          var saved = {};
          try { saved = JSON.parse(localStorage.getItem('tp.config') || '{}'); } catch (e) { /* ignore */ }
          if (saved.googleClientId) return 'local';
          return window.APP_CONFIG.googleClientId ? 'file' : 'none';
        },
        clientIdInUse: function () { return window.APP_CONFIG.googleClientId || ''; },
        clientIdLooksWrong: function () {
          var v = (this.clientId || '').trim();
          return !!v && !/\.apps\.googleusercontent\.com$/.test(v);
        },
        apiKeyLooksWrong: function () {
          var v = (this.apiKey || '').trim();
          return !!v && !/^AIza[0-9A-Za-z_-]{20,}$/.test(v);
        }
      },
      methods: {
        signIn: function () { Store.signIn().catch(function () { /* แสดง toast แล้ว */ }); },
        signOut: function () { Store.signOut(); },
        clean: function (v) {
          return String(v || '').trim().replace(/^["'\s]+|["'\s,]+$/g, '');
        },
        saveConfig: function () {
          var id = this.clean(this.clientId);
          var key = this.clean(this.apiKey);
          if (id && !/\.apps\.googleusercontent\.com$/.test(id)) {
            Store.toast('Client ID ไม่ถูกต้อง — ต้องลงท้ายด้วย .apps.googleusercontent.com', 'error');
            return;
          }
          if (key && !/^AIza[0-9A-Za-z_-]{20,}$/.test(key)) {
            Store.toast('API key ไม่ถูกต้อง — ต้องเป็นค่าที่ขึ้นต้นด้วย AIza ไม่ใช่ลิงก์หรือค่าอื่น', 'error');
            return;
          }
          this.clientId = id;
          this.apiKey = key;
          localStorage.setItem('tp.config', JSON.stringify({ googleClientId: id, googleApiKey: key }));
          Store.toast('บันทึกค่าเชื่อมต่อแล้ว กำลังโหลดหน้าใหม่...', 'success');
          setTimeout(function () { location.reload(); }, 800);
        },
        /** ลบค่าที่กรอกไว้ในเครื่องนี้ กลับไปใช้ค่าจากไฟล์ config.js */
        clearConfig: function () {
          if (!window.confirm('ลบค่าเชื่อมต่อที่บันทึกไว้ในเครื่องนี้ แล้วกลับไปใช้ค่าจากไฟล์ config.js?')) return;
          localStorage.removeItem('tp.config');
          location.reload();
        },
        exportJson: function () { Store.exportJson(); },
        importJson: function (e) {
          var f = e.target.files[0];
          if (f) Store.importJson(f).catch(function (err) { Store.toast(err.message, 'error'); });
          e.target.value = '';
        },
        resetAll: function () {
          if (!window.confirm('ล้างข้อมูลทั้งหมดในเครื่องนี้? (ไฟล์ที่อยู่ใน Google Drive จะไม่ถูกลบ)')) return;
          localStorage.removeItem('tp.data');
          location.reload();
        }
      },
      template: [
        '<div>',
        '  <page-head icon="settings" title="ตั้งค่า" subtitle="การเชื่อมต่อ Google Drive และการจัดการข้อมูล"/>',
        '  <div class="grid lg:grid-cols-2 gap-5">',
        '    <ui-card title="บัญชี Google" subtitle="ล็อกอินเพื่อเก็บข้อมูลและไฟล์ไว้ใน Google Drive ของคุณ">',
        /* ล็อกอินแล้ว */
        '      <div v-if="s.user" class="flex items-center gap-4">',
        '        <img v-if="s.user.picture" :src="s.user.picture" class="w-12 h-12 rounded-full" referrerpolicy="no-referrer" alt="">',
        '        <div class="min-w-0 flex-1">',
        '          <p class="font-medium text-ink-900 truncate">{{ s.user.name }}</p>',
        '          <p class="text-sm text-ink-500 truncate">{{ s.user.email }}</p>',
        '        </div>',
        '        <button class="' + btn.ghost + '" @click="signOut"><ui-icon name="logout" cls="w-4 h-4"/>ออกจากระบบ</button>',
        '      </div>',
        /* ยังไม่ล็อกอิน */
        '      <div v-else>',
        '        <p class="text-sm text-ink-500 mb-4 leading-relaxed">ตอนนี้ใช้งานแบบ guest — ข้อมูลถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น',
        '          ล็อกอินแล้วข้อมูลที่ทำไว้จะถูกอัปโหลดขึ้น Google Drive ให้อัตโนมัติ และสร้างลิงก์แชร์ได้</p>',
        '        <button class="' + btn.primary + '" @click="signIn" :disabled="s.signingIn">',
        '          <ui-icon name="cloud" cls="w-4 h-4"/>{{ s.signingIn ? "กำลังล็อกอิน..." : "ล็อกอินด้วย Google" }}</button>',
        '        <p v-if="!configured" class="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2.5 mt-4 leading-relaxed">',
        '          ยังเชื่อมต่อ Google ไม่ได้ — ผู้ดูแลต้องใส่ค่าเชื่อมต่อในหัวข้อ “ตั้งค่าขั้นสูง” ด้านล่างก่อน (ทำครั้งเดียว)</p>',
        '      </div>',
        '      <a v-if="folderUrl" :href="folderUrl" target="_blank" rel="noopener" class="' + btn.ghost + ' mt-4">',
        '        <ui-icon name="link" cls="w-4 h-4"/>เปิดโฟลเดอร์ใน Google Drive</a>',
        '    </ui-card>',
        '    <ui-card title="สถานะการเก็บข้อมูล">',
        '      <dl class="space-y-3 text-sm">',
        '        <div class="flex justify-between"><dt class="text-ink-500">โหมด</dt>',
        '          <dd class="font-medium">{{ s.mode === "drive" ? "Google Drive" : (s.mode === "view" ? "โหมดดูอย่างเดียว" : "เก็บในเครื่องนี้") }}</dd></div>',
        '        <div class="flex justify-between"><dt class="text-ink-500">บัญชี</dt><dd class="font-medium">{{ s.user ? s.user.email : "ยังไม่ได้ล็อกอิน" }}</dd></div>',
        '        <div class="flex justify-between"><dt class="text-ink-500">บันทึกล่าสุด</dt>',
        '          <dd class="font-medium">{{ s.lastSaved ? s.lastSaved.toLocaleString("th-TH") : "—" }}</dd></div>',
        '      </dl>',
        '      <p v-if="s.error" class="mt-4 text-sm text-red-600">{{ s.error }}</p>',
        '    </ui-card>',
        '    <ui-card title="สำรอง / กู้คืนข้อมูล">',
        '      <div class="flex flex-wrap gap-2">',
        '        <button class="' + btn.ghost + '" @click="exportJson"><ui-icon name="download" cls="w-4 h-4"/>ดาวน์โหลดไฟล์ข้อมูล</button>',
        '        <label class="' + btn.ghost + ' cursor-pointer"><ui-icon name="upload" cls="w-4 h-4"/>นำเข้าไฟล์ข้อมูล',
        '          <input type="file" accept="application/json" class="hidden" @change="importJson"></label>',
        '      </div>',
        '      <p class="text-xs text-ink-400 mt-3">ไฟล์ข้อมูลเป็น JSON ที่รวมทุกหน้าไว้ในไฟล์เดียว</p>',
        '    </ui-card>',
        '    <ui-card title="ล้างข้อมูล">',
        '      <p class="text-sm text-ink-500 mb-3">ลบข้อมูลที่เก็บไว้ในเบราว์เซอร์นี้ ไฟล์ใน Google Drive จะยังอยู่ครบ</p>',
        '      <button class="' + btn.danger + '" @click="resetAll"><ui-icon name="trash" cls="w-4 h-4"/>ล้างข้อมูลในเครื่องนี้</button>',
        '    </ui-card>',
        '  </div>',

        /* ---------- ตั้งค่าขั้นสูง (สำหรับผู้ดูแล ทำครั้งเดียว) ---------- */
        '  <section class="mt-5 bg-white rounded-2xl shadow-card border border-ink-100/60 overflow-hidden">',
        '    <button class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-ink-50/60 transition" @click="advanced=!advanced">',
        '      <div>',
        '        <h2 class="font-semibold text-ink-900">ตั้งค่าขั้นสูง (สำหรับผู้ดูแล — ทำครั้งเดียว)</h2>',
        '        <p class="text-xs text-ink-500 mt-0.5">ค่าเชื่อมต่อ Google ปกติใส่ไว้ในไฟล์ js/config.js แล้ว ผู้ใช้ทั่วไปไม่ต้องยุ่งกับส่วนนี้</p>',
        '      </div>',
        '      <span class="text-ink-400 text-sm shrink-0">{{ advanced ? "ซ่อน" : "แสดง" }}</span>',
        '    </button>',
        '    <div v-if="advanced" class="px-5 pb-5 pt-1 border-t border-ink-100">',
        '      <dl class="mt-4 rounded-xl bg-ink-50 px-4 py-3 text-sm space-y-2">',
        '        <div class="flex flex-wrap justify-between gap-2"><dt class="text-ink-500">Client ID ที่เว็บใช้อยู่</dt>',
        '          <dd class="font-mono text-xs text-ink-800 break-all">{{ clientIdInUse || "— ยังไม่มี —" }}</dd></div>',
        '        <div class="flex justify-between gap-2"><dt class="text-ink-500">ค่ามาจาก</dt>',
        '          <dd class="font-medium text-ink-800">{{ configSource === "file" ? "ไฟล์ js/config.js" : (configSource === "local" ? "ที่กรอกไว้ในเครื่องนี้" : "ยังไม่ได้ตั้งค่า") }}</dd></div>',
        '      </dl>',
        '      <div class="grid sm:grid-cols-2 gap-4 mt-4">',
        '        <ui-field label="OAuth Client ID" v-model="clientId" placeholder="000000000000-xxxxxxxx.apps.googleusercontent.com"',
        '          hint="Google Cloud Console → Credentials → OAuth client ID (ชนิด Web application)"/>',
        '        <ui-field label="API key (สำหรับลิงก์แชร์)" v-model="apiKey" placeholder="AIza..."',
        '          hint="ใช้ให้คนที่ไม่ได้ล็อกอินเปิดดูลิงก์แชร์ได้"/>',
        '      </div>',
        '      <p v-if="clientIdLooksWrong" class="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2.5 mt-3 leading-relaxed">',
        '        ค่านี้ไม่ใช่ Client ID — Client ID ต้องลงท้ายด้วย <b>.apps.googleusercontent.com</b>',
        '        (ถ้าเป็นค่าที่ขึ้นต้นด้วย GOCSPX- คือ Client secret ซึ่งเว็บนี้ไม่ได้ใช้)</p>',
        '      <p v-if="apiKeyLooksWrong" class="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2.5 mt-3 leading-relaxed">',
        '        ค่านี้ไม่ใช่ API key — API key ต้องขึ้นต้นด้วย <b>AIza</b> และเป็นข้อความยาวชุดเดียว',
        '        ไม่ใช่ลิงก์แชร์หรือ URL ใด ๆ</p>',
        '      <div class="flex flex-wrap gap-2 mt-4">',
        '        <button class="' + btn.primary + '" @click="saveConfig"><ui-icon name="check" cls="w-4 h-4"/>บันทึกค่าเชื่อมต่อ</button>',
        '        <button v-if="configSource === \'local\'" class="' + btn.ghost + '" @click="clearConfig"><ui-icon name="trash" cls="w-4 h-4"/>ล้างค่าที่กรอกในเครื่องนี้</button>',
        '      </div>',
        '    </div>',
        '  </section>',
        '</div>'
      ].join('')
    };

    return { Home: Home, School: School, Schedule: Schedule, Log: Log, Plan: Plan, Supervision: Supervision,Research: Research, Gallery: Gallery, Summary: Summary, Settings: Settings };
  })();
