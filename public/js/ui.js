/* ------------------------------------------------------------------
 * ui.js — คอมโพเนนต์ที่ใช้ร่วมกันทุกหน้า
 * ------------------------------------------------------------------ */
window.UI = (function () {

  var Icon = {
    props: { name: String, cls: { type: String, default: 'w-5 h-5' } },
    computed: {
      path: function () {
        return {
          home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5',
          school: 'M12 3 2 8l10 5 10-5-10-5Zm-6 8v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M20 9v6',
          note: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 5h6M9 12h6M9 16h4',
          plan: 'M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm11-2v5h5M8 13h8M8 17h5',
          research: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4.5 4.5',
          photo: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm2 11 5-5 4 4 3-3 4 4M8.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
          board: 'M4 4h16v12H4zM9 20h6M12 16v4M8 8h8M8 12h5',
          summary: 'M6 3h9l5 5v13H6zM15 3v5h5M9 13h7M9 17h5',
          plus: 'M12 5v14M5 12h14',
          trash: 'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7',
          edit: 'M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4Z',
          upload: 'M12 16V4m0 0L8 8m4-4 4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2',
          share: 'M8.6 13.5 15.4 17M15.4 7 8.6 10.5M18 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
          google: 'M21 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.1a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.7-4.2 2.7-7.1Z',
          logout: 'M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5',
          check: 'm5 13 4 4L19 7',
          x: 'M6 6l12 12M18 6 6 18',
          cloud: 'M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 8H7Z',
          download: 'M12 4v12m0 0 4-4m-4 4-4-4M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1',
          print: 'M7 8V4h10v4M7 18H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 15h10v6H7z',
          settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.2-1.6l2-1.5-2-3.4-2.3 1a8 8 0 0 0-2.8-1.6L14.4 2H9.6l-.3 2.4A8 8 0 0 0 6.5 6l-2.3-1-2 3.4 2 1.5a8.2 8.2 0 0 0 0 3.2l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 2.8 1.6l.3 2.4h4.8l.3-2.4a8 8 0 0 0 2.8-1.6l2.3 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6Z',
          link: 'M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1',
          eye: 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Zm10 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
          file: 'M6 3h8l4 4v14H6zM14 3v4h4',
          menu: 'M4 7h16M4 12h16M4 17h16',
          calendar: 'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6Zm4-3v4m8-4v4M4 10h16'
        }[this.name] || '';
      }
    },
    template: '<svg :class="cls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path :d="path"/></svg>'
  };

  var PageHead = {
    props: { title: String, subtitle: String, icon: String },
    template: [
      '<div class="flex flex-wrap items-start justify-between gap-4 mb-6">',
      '  <div class="flex items-start gap-3">',
      '    <div v-if="icon" class="shrink-0 w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-soft">',
      '      <ui-icon :name="icon" cls="w-6 h-6"/></div>',
      '    <div>',
      '      <h1 class="text-2xl sm:text-[27px] font-semibold tracking-tight text-ink-900">{{ title }}</h1>',
      '      <p v-if="subtitle" class="text-ink-500 mt-1 text-sm">{{ subtitle }}</p>',
      '    </div>',
      '  </div>',
      '  <div class="flex items-center gap-2 no-print"><slot name="actions"/></div>',
      '</div>'
    ].join('')
  };

  var Card = {
    props: { title: String, subtitle: String, pad: { type: Boolean, default: true } },
    template: [
      '<section class="bg-white rounded-2xl shadow-card border border-ink-100/60 overflow-hidden">',
      '  <header v-if="title || $slots.actions" class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-ink-100/70">',
      '    <div><h2 class="font-semibold text-ink-900">{{ title }}</h2>',
      '      <p v-if="subtitle" class="text-xs text-ink-500 mt-.5">{{ subtitle }}</p></div>',
      '    <div class="flex items-center gap-2 no-print"><slot name="actions"/></div>',
      '  </header>',
      '  <div :class="pad ? \'p-5\' : \'\'"><slot/></div>',
      '</section>'
    ].join('')
  };

  var Field = {
    props: {
      label: String, modelValue: [String, Number], type: { type: String, default: 'text' },
      placeholder: String, rows: { type: Number, default: 4 }, hint: String,
      readonly: Boolean, options: Array
    },
    emits: ['update:modelValue'],
    computed: {
      shown: function () {
        var v = this.modelValue;
        return (v === '' || v === null || v === undefined) ? '—' : v;
      }
    },
    template: [
      '<label class="block">',
      '  <span v-if="label" class="block text-[13px] font-medium text-ink-700 mb-1.5">{{ label }}</span>',
      '  <template v-if="readonly">',
      '    <p class="text-ink-900 whitespace-pre-line leading-relaxed min-h-[1.5rem]">{{ shown }}</p>',
      '  </template>',
      '  <textarea v-else-if="type===\'textarea\'" :rows="rows" :placeholder="placeholder"',
      '    :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"',
      '    class="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 placeholder:text-ink-300"></textarea>',
      '  <select v-else-if="type===\'select\'" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"',
      '    class="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100">',
      '    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>',
      '  </select>',
      '  <input v-else :type="type" :placeholder="placeholder" :value="modelValue"',
      '    @input="$emit(\'update:modelValue\', $event.target.value)"',
      '    class="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 placeholder:text-ink-300">',
      '  <span v-if="hint" class="block text-xs text-ink-400 mt-1">{{ hint }}</span>',
      '</label>'
    ].join('')
  };

  /** แสดงข้อมูลแบบอ่านอย่างเดียว (หัวข้อ + ค่า) */
  var Row = {
    props: { label: String, value: [String, Number], pre: Boolean },
    computed: {
      empty: function () {
        return this.value === '' || this.value === null || this.value === undefined;
      }
    },
    template: [
      '<div>',
      '  <dt class="text-[13px] text-ink-500 mb-1">{{ label }}</dt>',
      '  <dd :class="[\'text-[15px] leading-relaxed\', empty ? \'text-ink-300\' : \'text-ink-900\', pre ? \'whitespace-pre-line\' : \'\']">',
      '    {{ empty ? "—" : value }}</dd>',
      '</div>'
    ].join('')
  };

  var Modal = {
    props: { show: Boolean, title: String, wide: Boolean },
    emits: ['close'],
    template: [
      '<transition name="fade"><div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 no-print">',
      '  <div class="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" @click="$emit(\'close\')"></div>',
      '  <div :class="[\'relative bg-white w-full rounded-t-3xl sm:rounded-3xl shadow-2xl pop max-h-[92vh] flex flex-col\', wide ? \'sm:max-w-3xl\' : \'sm:max-w-xl\']">',
      '    <header class="flex items-center justify-between px-5 py-4 border-b border-ink-100">',
      '      <h3 class="font-semibold text-ink-900">{{ title }}</h3>',
      '      <button @click="$emit(\'close\')" class="w-9 h-9 rounded-xl hover:bg-ink-50 flex items-center justify-center text-ink-500"><ui-icon name="x"/></button>',
      '    </header>',
      '    <div class="p-5 overflow-y-auto"><slot/></div>',
      '    <footer v-if="$slots.footer" class="px-5 py-4 border-t border-ink-100 flex justify-end gap-2 bg-ink-50/50"><slot name="footer"/></footer>',
      '  </div>',
      '</div></transition>'
    ].join('')
  };

  var Empty = {
    props: { text: String, icon: { type: String, default: 'file' } },
    template: [
      '<div class="text-center py-12 px-6">',
      '  <div class="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-3"><ui-icon :name="icon" cls="w-7 h-7"/></div>',
      '  <p class="text-ink-500 text-sm">{{ text }}</p>',
      '  <div class="mt-4 flex justify-center"><slot/></div>',
      '</div>'
    ].join('')
  };

  /** ปุ่มอัปโหลดไฟล์ (รองรับลากมาวาง) */
  var FileDrop = {
    props: {
      multiple: Boolean,
      accept: { type: String, default: '' },
      label: { type: String, default: 'อัปโหลดไฟล์' },
      hint: String,
      compact: Boolean
    },
    emits: ['uploaded'],
    data: function () { return { busy: false, over: false, done: 0, total: 0 }; },
    methods: {
      pick: function () { if (!this.busy) this.$refs.input.click(); },
      onDrop: function (e) {
        this.over = false;
        if (e.dataTransfer && e.dataTransfer.files.length) this.handle(e.dataTransfer.files);
      },
      onChange: function (e) {
        this.handle(e.target.files);
        e.target.value = '';
      },
      handle: function (fileList) {
        var self = this;
        var files = Array.prototype.slice.call(fileList);
        if (!files.length) return;
        if (!this.multiple) files = files.slice(0, 1);
        self.busy = true; self.done = 0; self.total = files.length;
        var out = [];
        var chain = files.reduce(function (p, f) {
          return p.then(function () {
            return Store.uploadAsset(f).then(function (a) {
              out.push(a); self.done++;
            }).catch(function (e) {
              Store.toast(f.name + ': ' + (e.message || e), 'error');
            });
          });
        }, Promise.resolve());
        chain.then(function () {
          self.busy = false;
          if (out.length) self.$emit('uploaded', out);
        });
      }
    },
    template: [
      '<div class="no-print">',
      '  <input ref="input" type="file" class="hidden" :accept="accept" :multiple="multiple" @change="onChange">',
      '  <button v-if="compact" type="button" @click="pick" :disabled="busy"',
      '    class="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 transition disabled:opacity-60">',
      '    <ui-icon :name="busy ? \'cloud\' : \'upload\'" cls="w-4 h-4"/>',
      '    <span>{{ busy ? "กำลังอัปโหลด " + done + "/" + total : label }}</span></button>',
      '  <div v-else @click="pick" @dragover.prevent="over=true" @dragleave="over=false" @drop.prevent="onDrop"',
      '    :class="[\'cursor-pointer rounded-2xl border-2 border-dashed px-5 py-8 text-center transition\',',
      '      over ? \'border-brand-400 bg-brand-50/70\' : \'border-ink-200 hover:border-brand-300 hover:bg-brand-50/40\']">',
      '    <div class="w-11 h-11 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-2">',
      '      <ui-icon :name="busy ? \'cloud\' : \'upload\'" cls="w-5 h-5"/></div>',
      '    <p class="font-medium text-ink-800 text-sm">{{ busy ? "กำลังอัปโหลด " + done + "/" + total + " ..." : label }}</p>',
      '    <p v-if="hint && !busy" class="text-xs text-ink-400 mt-1">{{ hint }}</p>',
      '  </div>',
      '</div>'
    ].join('')
  };

  /** แสดงไฟล์แนบ 1 ไฟล์ (รูปภาพ = พรีวิว, ไฟล์อื่น = การ์ด) */
    /** แสดงไฟล์แนบ 1 ไฟล์ (รูปภาพ = พรีวิว + Lightbox, ไฟล์อื่น = การ์ด) */
  var Asset = {
    props: {
      asset: Object,
      removable: Boolean,
      ratio: { type: String, default: 'aspect-[4/3]' }
    },

    emits: ['remove'],

    data: function () {
      return {
        preview: false
      };
    },

    methods: {
      openPreview: function () {
        if (this.isImage) {
          this.preview = true;
        }
      },

      closePreview: function () {
        this.preview = false;
      },

      keyClose: function (e) {
        if (e.key === 'Escape') {
          this.closePreview();
        }
      }
    },

    mounted: function () {
      window.addEventListener('keydown', this.keyClose);
    },

    beforeUnmount: function () {
      window.removeEventListener('keydown', this.keyClose);
    },

    computed: {
      isImage: function () {
        return this.asset && /^image\//.test(this.asset.mimeType || '');
      },

      sizeText: function () {
        var s = this.asset && this.asset.size;
        if (!s) return '';

        return s > 1048576
          ? (s / 1048576).toFixed(1) + ' MB'
          : Math.max(1, Math.round(s / 1024)) + ' KB';
      }
    },

    template: [
      '<div v-if="asset" class="group relative rounded-2xl overflow-hidden border border-ink-100 bg-white">',

      '  <div v-if="isImage" @click="openPreview" class="cursor-pointer">',
      '    <div :class="[ratio, \'bg-ink-50 overflow-hidden\']">',
      '      <img :src="asset.thumb || asset.url || asset.download"',
      '        :alt="asset.name || \'\'"',
      '        loading="lazy"',
      '        class="w-full h-full object-cover transition duration-300 hover:scale-105"',
      '        referrerpolicy="no-referrer">',
      '    </div>',
      '  </div>',

      '  <div v-else class="flex items-center gap-3 p-3.5">',
      '    <div class="w-10 h-10 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">',
      '      <ui-icon name="file" cls="w-5 h-5"/>',
      '    </div>',
      '    <div class="min-w-0">',
      '      <p class="text-sm font-medium text-ink-800 truncate">{{ asset.name || "ไฟล์" }}</p>',
      '      <p class="text-xs text-ink-400">{{ sizeText }}</p>',
      '    </div>',
      '  </div>',

      '  <p v-if="isImage && asset.name" class="px-3 py-2 text-xs text-ink-500 truncate">',
      '    {{ asset.name }}',
      '  </p>',

      '  <button v-if="removable" type="button" @click.stop.prevent="$emit(\'remove\')"',
      '    class="no-print absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/95 text-ink-600 shadow-soft opacity-0 group-hover:opacity-100 focus:opacity-100 transition flex items-center justify-center hover:text-red-600">',
      '    <ui-icon name="trash" cls="w-4 h-4"/>',
      '  </button>',


      /* ===== Lightbox ===== */
      '  <div v-if="preview"',
      '    @click="closePreview"',
      '    class="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">',

      '    <button',
      '      @click.stop="closePreview"',
      '      class="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/90 text-gray-700 text-3xl shadow-xl flex items-center justify-center hover:bg-white">',
      '      ×',
      '    </button>',

'    <img',
'      @click.stop',
'      :src="asset.thumb || asset.url || asset.download"',
'      @error="$event.target.src = asset.url || asset.download"',
'      class="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl">',
      
      '  </div>',

      '</div>'
    ].join('')
  };

  return {
    install: function (app) {
      app.component('ui-icon', Icon);
      app.component('page-head', PageHead);
      app.component('ui-card', Card);
      app.component('ui-field', Field);
      app.component('ui-row', Row);
      app.component('ui-modal', Modal);
      app.component('ui-empty', Empty);
      app.component('file-drop', FileDrop);
      app.component('ui-asset', Asset);
    }
  };
})();
