/* =====================================================
   SubtitleAI – app.js
   Simulates AWS Amplify + Transcribe + Translate flow
===================================================== */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Speaker toggle text ── */
const speakerToggle = document.getElementById('speaker-detect');
const speakerText   = document.getElementById('speaker-text');
speakerToggle.addEventListener('change', () => {
  speakerText.textContent = speakerToggle.checked ? 'Enabled' : 'Disabled';
});

/* ── Steps animation on scroll ── */
const allSteps = document.querySelectorAll('.step-item');
const stepsFill = document.getElementById('steps-line-fill');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.4 });
allSteps.forEach(s => observer.observe(s));

const stepsSection = document.getElementById('how-it-works');
const stepsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && stepsFill) stepsFill.style.height = '100%';
  });
}, { threshold: 0.2 });
if (stepsSection) stepsObs.observe(stepsSection);

/* ── Hero subtitle demo cycle ── */
const subtitleDemos = [
  ['Hello,', 'welcome', 'to', 'SubtitleAI'],
  ['Hola,', 'bienvenido', 'a', 'SubtitleAI'],
  ['Bonjour,', 'bienvenue', 'sur', 'SubtitleAI'],
  ['こんにちは、', 'SubtitleAI', 'へ', 'ようこそ'],
  ['您好，', '欢迎', '使用', 'SubtitleAI'],
  ['مرحباً،', 'مرحباً', 'في', 'SubtitleAI'],
];
let demoIdx = 0;
const subDemoEl = document.getElementById('subtitle-demo');
if (subDemoEl) {
  setInterval(() => {
    demoIdx = (demoIdx + 1) % subtitleDemos.length;
    const words = subtitleDemos[demoIdx];
    subDemoEl.innerHTML = words.map(w => `<span class="sub-word">${w}</span>`).join('');
  }, 4000);
}

/* ── File Upload ── */
const uploadZone   = document.getElementById('upload-zone');
const fileInput    = document.getElementById('file-input');
const uploadContent = document.getElementById('upload-content');
const uploadPreview = document.getElementById('upload-preview');
const previewName  = document.getElementById('preview-name');
const previewSize  = document.getElementById('preview-size');
const previewRemove = document.getElementById('preview-remove');
const btnGenerate  = document.getElementById('btn-generate');

let selectedFile = null;

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function showFilePreview(file) {
  selectedFile = file;
  previewName.textContent = file.name;
  previewSize.textContent = formatBytes(file.size);
  uploadContent.classList.add('hidden');
  uploadPreview.classList.remove('hidden');
  btnGenerate.disabled = false;
}

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  uploadContent.classList.remove('hidden');
  uploadPreview.classList.add('hidden');
  btnGenerate.disabled = true;
}

uploadZone.addEventListener('click', e => {
  if (!e.target.closest('#preview-remove')) fileInput.click();
});
uploadZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) showFilePreview(fileInput.files[0]);
});
previewRemove.addEventListener('click', e => { e.stopPropagation(); clearFile(); });

/* Drag & drop */
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('video/')) showFilePreview(file);
});

/* ── Simulation Engine ── */
const panelStatus  = document.getElementById('panel-status');
const progressView = document.getElementById('progress-view');
const idleState    = document.getElementById('idle-state');
const subtitleOutput = document.getElementById('subtitle-output');
const subtitleEditor = document.getElementById('subtitle-editor');
const mainProgressFill = document.getElementById('main-progress-fill');
const progressPct  = document.getElementById('progress-pct');
const statLines    = document.getElementById('stat-lines');
const statWords    = document.getElementById('stat-words');
const statLang     = document.getElementById('stat-lang');
const btnCopy      = document.getElementById('btn-copy');
const btnDownload  = document.getElementById('btn-download');

function setProgress(pct) {
  mainProgressFill.style.width = pct + '%';
  progressPct.textContent = pct + '%';
}

function setStageStatus(id, status) {
  const el = document.getElementById(`stage-${id}-status`);
  const stage = document.getElementById(`stage-${id}`);
  if (!el) return;
  el.className = 'stage-status ' + status;
  el.textContent = status === 'active' ? 'processing' : status === 'done' ? '✓ done' : 'pending';
  if (stage) {
    stage.classList.toggle('active', status === 'active');
    stage.classList.toggle('done', status === 'done');
  }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* Sample subtitle data (simulated Transcribe output) */
function generateSampleSubtitles(filename, sourceLang, targetLang, format) {
  const samples = {
    'en': [
      { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: 'Welcome to our presentation on artificial intelligence.' },
      { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: 'Today, we\'ll explore how machine learning transforms industries.' },
      { id: 3, start: '00:00:09,000', end: '00:00:13,000', text: 'From healthcare to finance, AI is revolutionizing the world.' },
      { id: 4, start: '00:00:13,500', end: '00:00:16,800', text: 'Let\'s begin with the fundamentals of neural networks.' },
      { id: 5, start: '00:00:17,200', end: '00:00:21,000', text: 'A neural network is inspired by the human brain.' },
      { id: 6, start: '00:00:22,000', end: '00:00:25,500', text: 'It consists of layers of interconnected nodes.' },
      { id: 7, start: '00:00:26,000', end: '00:00:29,200', text: 'Each node processes and passes information forward.' },
      { id: 8, start: '00:00:30,000', end: '00:00:34,000', text: 'Training involves adjusting weights through backpropagation.' },
    ],
    'es': [
      { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: 'Bienvenidos a nuestra presentación sobre inteligencia artificial.' },
      { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: 'Hoy exploraremos cómo el aprendizaje automático transforma industrias.' },
      { id: 3, start: '00:00:09,000', end: '00:00:13,000', text: 'Desde la salud hasta las finanzas, la IA está revolucionando el mundo.' },
      { id: 4, start: '00:00:13,500', end: '00:00:16,800', text: 'Empecemos con los fundamentos de las redes neuronales.' },
      { id: 5, start: '00:00:17,200', end: '00:00:21,000', text: 'Una red neuronal está inspirada en el cerebro humano.' },
      { id: 6, start: '00:00:22,000', end: '00:00:25,500', text: 'Consiste en capas de nodos interconectados.' },
      { id: 7, start: '00:00:26,000', end: '00:00:29,200', text: 'Cada nodo procesa y pasa información hacia adelante.' },
      { id: 8, start: '00:00:30,000', end: '00:00:34,000', text: 'El entrenamiento implica ajustar pesos mediante retropropagación.' },
    ],
    'fr': [
      { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: 'Bienvenue dans notre présentation sur l\'intelligence artificielle.' },
      { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: 'Nous allons explorer comment l\'apprentissage automatique transforme les industries.' },
      { id: 3, start: '00:00:09,000', end: '00:00:13,000', text: 'De la santé à la finance, l\'IA révolutionne le monde.' },
      { id: 4, start: '00:00:13,500', end: '00:00:16,800', text: 'Commençons par les fondamentaux des réseaux de neurones.' },
    ],
    'de': [
      { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: 'Willkommen zu unserer Präsentation über künstliche Intelligenz.' },
      { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: 'Wir werden erkunden, wie maschinelles Lernen Branchen transformiert.' },
      { id: 3, start: '00:00:09,000', end: '00:00:13,000', text: 'Von Gesundheit bis Finanzen revolutioniert KI die Welt.' },
    ],
    'ja': [
      { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: '人工知能に関するプレゼンテーションへようこそ。' },
      { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: '今日は機械学習が産業を変革する仕組みを探ります。' },
      { id: 3, start: '00:00:09,000', end: '00:00:13,000', text: 'ヘルスケアから金融まで、AIは世界に革命を起こしています。' },
    ],
    'zh': [
      { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: '欢迎来到我们的人工智能演讲。' },
      { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: '今天我们将探索机器学习如何改变行业。' },
      { id: 3, start: '00:00:09,000', end: '00:00:13,000', text: '从医疗到金融，人工智能正在革命性地改变世界。' },
    ],
  };

  const key = targetLang && targetLang !== 'none' ? targetLang : 'en';
  const data = samples[key] || samples['en'];

  if (format === 'vtt') {
    return 'WEBVTT\n\n' + data.map(s =>
      `${s.start.replace(',','.')} --> ${s.end.replace(',','.')}\n${s.text}\n`
    ).join('\n');
  } else if (format === 'ass') {
    return `[Script Info]
Title: SubtitleAI Generated
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, Alignment
Style: Default,Arial,48,&H00FFFFFF,2

[Events]
Format: Layer, Start, End, Style, Text
${data.map(s => `Dialogue: 0,${s.start.replace(',','.')},${s.end.replace(',','.')},Default,,${s.text}`).join('\n')}`;
  } else if (format === 'txt') {
    return data.map(s => s.text).join('\n');
  } else {
    // SRT default
    return data.map(s =>
      `${s.id}\n${s.start} --> ${s.end}\n${s.text}\n`
    ).join('\n');
  }
}

const langNames = {
  'auto':'Auto-Detect','en-US':'English (US)','en-GB':'English (UK)',
  'es-ES':'Spanish','fr-FR':'French','de-DE':'German','ja-JP':'Japanese',
  'ko-KR':'Korean','zh-CN':'Chinese','hi-IN':'Hindi','ar-SA':'Arabic',
  'pt-BR':'Portuguese','it-IT':'Italian','ru-RU':'Russian',
  'es':'Spanish','fr':'French','de':'German','ja':'Japanese','ko':'Korean',
  'zh':'Chinese','hi':'Hindi','ar':'Arabic','pt':'Portuguese','it':'Italian',
  'ru':'Russian','nl':'Dutch','pl':'Polish','tr':'Turkish','sv':'Swedish',
  'th':'Thai','vi':'Vietnamese','none':'English'
};

async function runSimulation() {
  const sourceLang = document.getElementById('source-lang').value;
  const targetLang = document.getElementById('target-lang').value;
  const exportFormat = document.getElementById('export-format').value;

  // UI: switch to processing
  btnGenerate.disabled = true;
  btnGenerate.classList.add('loading');
  btnGenerate.textContent = 'Processing…';
  idleState.classList.add('hidden');
  subtitleOutput.classList.add('hidden');
  progressView.classList.add('visible');
  panelStatus.textContent = 'Processing…';
  setProgress(0);

  // Reset stages
  ['upload','transcribe','translate','format'].forEach(id => setStageStatus(id, 'pending'));

  // --- Stage 1: Upload to S3 ---
  setStageStatus('upload', 'active');
  panelStatus.textContent = 'Uploading to S3…';
  await sleep(1200);
  for (let p = 0; p <= 25; p += 5) { setProgress(p); await sleep(80); }
  setStageStatus('upload', 'done');

  // --- Stage 2: AWS Transcribe ---
  setStageStatus('transcribe', 'active');
  panelStatus.textContent = 'Transcribing speech…';
  await sleep(2000);
  for (let p = 25; p <= 65; p += 3) { setProgress(p); await sleep(60); }
  setStageStatus('transcribe', 'done');

  // --- Stage 3: AWS Translate (conditional) ---
  if (targetLang !== 'none') {
    setStageStatus('translate', 'active');
    panelStatus.textContent = `Translating to ${langNames[targetLang] || targetLang}…`;
    await sleep(1500);
    for (let p = 65; p <= 88; p += 3) { setProgress(p); await sleep(70); }
    setStageStatus('translate', 'done');
  } else {
    setStageStatus('translate', 'done');
    setProgress(88);
  }

  // --- Stage 4: Format & Export ---
  setStageStatus('format', 'active');
  panelStatus.textContent = `Exporting ${exportFormat.toUpperCase()}…`;
  await sleep(900);
  for (let p = 88; p <= 100; p += 2) { setProgress(p); await sleep(50); }
  setStageStatus('format', 'done');

  // --- Show Output ---
  const subtitleContent = generateSampleSubtitles(
    selectedFile ? selectedFile.name : 'video.mp4',
    sourceLang, targetLang, exportFormat
  );

  const lines = subtitleContent.split('\n').filter(Boolean);
  const words = subtitleContent.split(/\s+/).filter(Boolean).length;
  const dispLang = targetLang !== 'none' ? (langNames[targetLang] || targetLang) : (langNames[sourceLang] || 'English');

  statLines.textContent = lines.length + ' lines';
  statWords.textContent = words + ' words';
  statLang.textContent  = dispLang;

  progressView.classList.remove('visible');
  subtitleOutput.classList.remove('hidden');
  panelStatus.textContent = '✓ Complete';

  // Animate text in
  subtitleEditor.textContent = '';
  const chars = subtitleContent.split('');
  let i = 0;
  const typeInterval = setInterval(() => {
    if (i >= chars.length) { clearInterval(typeInterval); return; }
    subtitleEditor.textContent += chars[i++];
    subtitleEditor.scrollTop = subtitleEditor.scrollHeight;
  }, 4);

  // Store for download
  btnDownload.dataset.content  = subtitleContent;
  btnDownload.dataset.filename = `subtitles.${exportFormat}`;

  // Reset button
  btnGenerate.classList.remove('loading');
  btnGenerate.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="currentColor" opacity="0.3"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Generate Subtitles`;
  btnGenerate.disabled = false;
}

/* ── Generate button ── */
document.getElementById('btn-generate').addEventListener('click', () => {
  if (!selectedFile) return;
  runSimulation();
});

/* ── Copy button ── */
btnCopy.addEventListener('click', async () => {
  const text = subtitleEditor.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    btnCopy.classList.add('copied');
    btnCopy.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied!`;
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      btnCopy.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Copy`;
    }, 2500);
  } catch { /* clipboard fallback */ }
});

/* ── Download button ── */
btnDownload.addEventListener('click', () => {
  const content  = btnDownload.dataset.content;
  const filename = btnDownload.dataset.filename;
  if (!content) return;
  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

/* ── Smooth scroll for nav links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ── Entrance animations via IntersectionObserver ── */
const fadeEls = document.querySelectorAll('.feature-card, .gen-panel, .arch-node, .step-item');
fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => fadeObs.observe(el));
