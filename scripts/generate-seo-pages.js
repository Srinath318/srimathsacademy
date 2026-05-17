const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const modal = fs.readFileSync(path.join(root, 'online-maths-tuition.html'), 'utf8')
  .split('<motion></motion>')
  .join('')
  .match(/<div class="modal"[\s\S]*?<\/div>\s*<script/)[0]
  .replace(/\s*<script$/, '');

const waSvg = fs.readFileSync(path.join(root, 'online-maths-tuition.html'), 'utf8')
  .match(/<a href="https:\/\/wa\.me[^"]*" class="whatsapp-float"[\s\S]*?<\/a>/)[0];

function footer(current) {
  const programs = [
    ['online-maths-tuition.html', 'Online maths tuition'],
    ['cbse-maths-tuition-classes-6-12.html', 'CBSE tuition'],
    ['icse-maths-tuition.html', 'ICSE tuition'],
    ['maths-tuition-tamil.html', 'தமிழ்', true],
  ];
  const programLinks = programs
    .map(([href, label, ta]) => {
      const cur = href === current ? ' aria-current="page"' : '';
      const hl = ta ? ' hreflang="ta"' : '';
      return `            <li><a href="${href}"${cur}${hl}>${label}</a></li>`;
    })
    .join('\n');
  const classLinks = [6, 7, 8, 9, 10, 11, 12]
    .map((n) => {
      const href = `class-${n}-maths-tuition.html`;
      const cur = href === current ? ' aria-current="page"' : '';
      return `            <li><a href="${href}"${cur}>Class ${n}</a></li>`;
    })
    .join('\n');
  return `  <footer class="footer">
    <div class="container footer__inner">
      <motion></motion>
      <div class="footer__brand">
        <p class="footer__brand-name">Sri Maths Academy</p>
        <p class="footer__brand-tagline">Online maths tuition · Classes 6–12</p>
      </div>
      <nav class="footer__grid" aria-label="Footer navigation">
        <div class="footer__col">
          <p class="footer__col-title">Programs</p>
          <ul class="footer__links">
${programLinks}
          </ul>
        </div>
        <div class="footer__col footer__col--classes">
          <p class="footer__col-title">Classes</p>
          <ul class="footer__class-list">
${classLinks}
          </ul>
        </div>
      </nav>
      <p class="footer__contact">
        <a href="index.html#contact">Contact us</a>
        <span class="footer__contact-sep" aria-hidden="true">·</span>
        <a href="https://srimathsacademy.in/">srimathsacademy.in</a>
      </p>
      <p class="footer__copy">&copy; <span id="year"></span> Sri Maths Academy · Maths Tuition Classes 6–12</p>
    </div>
  </footer>`.replace(/<motion><\/motion>\n      /, '');
}

function header() {
  return `  <header class="header is-scrolled">
    <motion></motion>
    <div class="container header__inner">
      <button type="button" class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="navMenu">
        <span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
      </button>
      <a href="index.html" class="logo" aria-label="Sri Maths Academy home">
        <span class="logo__symbol" aria-hidden="true">π</span>
        <span class="logo__wordmark"><span class="logo__sri">Sri</span><span class="logo__maths">Maths</span><span class="logo__academy">Academy</span></span>
      </a>
      <nav class="nav" id="navMenu" aria-label="Main navigation">
        <ul class="nav__list">
          <li><a href="index.html" class="nav__link">Home</a></li>
          <li><a href="index.html#faq" class="nav__link">FAQ</a></li>
          <li><a href="index.html#contact" class="nav__link">Contact</a></li>
        </ul>
        <button type="button" class="btn btn--primary btn--nav nav__cta" data-open-modal>Book a Demo</button>
      </nav>
    </div>
  </header>`.replace(/<motion><\/motion>\n    /, '');
}

const pages = [
  {
    file: 'cbse-maths-tuition-classes-6-12.html',
    lang: 'en',
    title: 'CBSE Maths Tuition Online Classes 6–12 | Sri Maths Academy',
    desc: 'Online 1-on-1 CBSE maths tuition for Class 6 to 12. Board-aligned teaching, free demo, expert tutor. India & worldwide.',
    canonical: 'https://srimathsacademy.in/cbse-maths-tuition-classes-6-12.html',
    ogTitle: 'CBSE Maths Tuition Online | Sri Maths Academy',
    eyebrow: 'CBSE · Online',
    h1: 'CBSE Maths Tuition Online — Classes 6 to 12',
    lead: 'Board-aligned <strong>1-on-1 CBSE maths classes</strong> with a tutor who explains concepts clearly.',
    body: `<p>If your child follows the <strong>CBSE syllabus</strong>, they need teaching that matches their NCERT chapters and exam pattern — not a generic batch. Sri Maths Academy offers live online maths tuition with full attention on one student.</p>
<h2>What we cover</h2>
<ul><li>Classes 6–12 CBSE mathematics</li><li>Concept building before exam shortcuts</li><li>Homework help and revision plans</li><li>Parent updates on progress</li></ul>
<h2>Online classes that fit your schedule</h2>
<p>Students join from across India and abroad. Timings are flexible. Start with a free demo — book below or <a href="index.html#contact">contact us</a>.</p>`,
    links: `<a href="online-maths-tuition.html">Online maths tuition</a><a href="icse-maths-tuition.html">ICSE tuition</a><a href="class-10-maths-tuition.html">Class 10 CBSE</a><a href="index.html">Home</a>`,
    wa: 'CBSE%20maths%20tuition',
  },
  {
    file: 'icse-maths-tuition.html',
    lang: 'en',
    title: 'ICSE Maths Tuition Online | Classes 6–12 | Sri Maths Academy',
    desc: 'Expert online ICSE maths tutor for Classes 6–12. 1-on-1 live classes, syllabus-aligned, free demo on WhatsApp.',
    canonical: 'https://srimathsacademy.in/icse-maths-tuition.html',
    ogTitle: 'ICSE Maths Tuition Online | Sri Maths Academy',
    eyebrow: 'ICSE · Online',
    h1: 'ICSE Maths Tuition Online',
    lead: 'Dedicated <strong>ICSE maths tutoring</strong> online — one student, one expert teacher.',
    body: `<p>ICSE mathematics needs depth and clear explanations. Our <strong>online ICSE maths tuition</strong> gives your child space to ask every doubt without embarrassment.</p>
<h2>Why parents choose us for ICSE</h2>
<ul><li>Syllabus matched to your school</li><li>Strong foundation for board years</li><li>Regular practice and assessments</li><li>30+ years teaching experience</li></ul>
<p>Book a free demo to see how 1-on-1 teaching works for your child's class.</p>`,
    links: `<a href="cbse-maths-tuition-classes-6-12.html">CBSE tuition</a><a href="online-maths-tuition.html">Online maths</a><a href="class-10-maths-tuition.html">Class 10</a><a href="index.html">Home</a>`,
    wa: 'ICSE%20maths%20tuition',
  },
  {
    file: 'class-6-maths-tuition.html',
    lang: 'en',
    title: 'Class 6 Maths Tuition Online | 1-on-1 Tutor | Sri Maths Academy',
    desc: 'Online Class 6 maths tuition — build strong basics with a personal tutor. CBSE, ICSE, State Board. Free demo class.',
    canonical: 'https://srimathsacademy.in/class-6-maths-tuition.html',
    ogTitle: 'Class 6 Maths Tuition Online',
    eyebrow: 'Class 6',
    h1: 'Class 6 Maths Tuition Online',
    lead: 'Build a strong maths foundation in <strong>Class 6</strong> with patient 1-on-1 teaching.',
    body: `<p>Class 6 is where many students either gain confidence or start fearing maths. Our <strong>Class 6 maths tuition online</strong> focuses on understanding numbers, algebra basics, and geometry step by step.</p>
<h2>Early support matters</h2>
<p>With one dedicated tutor, your child can ask questions freely and practise at the right pace. We support CBSE, ICSE, and State Board Class 6 syllabi.</p>`,
    links: `<a href="class-10-maths-tuition.html">Class 10</a><a href="class-12-maths-tuition.html">Class 12</a><a href="online-maths-tuition.html">All classes</a><a href="index.html">Home</a>`,
    wa: 'Class%206%20maths%20tuition',
  },
  {
    file: 'class-7-maths-tuition.html',
    lang: 'en',
    title: 'Class 7 Maths Tuition Online | 1-on-1 Tutor | Sri Maths Academy',
    desc: 'Online Class 7 maths tuition — strengthen fundamentals with a personal tutor. CBSE, ICSE, State Board. Free demo class.',
    canonical: 'https://srimathsacademy.in/class-7-maths-tuition.html',
    ogTitle: 'Class 7 Maths Tuition Online',
    eyebrow: 'Class 7',
    h1: 'Class 7 Maths Tuition Online',
    lead: 'Build confidence in <strong>Class 7 maths</strong> with clear 1-on-1 teaching.',
    body: `<p>Class 7 introduces tougher algebra and geometry. Our <strong>Class 7 maths tuition online</strong> helps students understand each topic before moving on — no rushing through the syllabus.</p>
<h2>Steady progress</h2>
<p>One dedicated tutor tracks your child's pace across CBSE, ICSE, or State Board Class 7. Doubts are cleared in every session.</p>`,
    links: `<a href="class-6-maths-tuition.html">Class 6</a><a href="class-10-maths-tuition.html">Class 10</a><a href="online-maths-tuition.html">All classes</a><a href="index.html">Home</a>`,
    wa: 'Class%207%20maths%20tuition',
  },
  {
    file: 'class-8-maths-tuition.html',
    lang: 'en',
    title: 'Class 8 Maths Tuition Online | 1-on-1 Tutor | Sri Maths Academy',
    desc: 'Online Class 8 maths tuition — algebra, geometry & exam readiness. CBSE, ICSE, State Board. Free demo.',
    canonical: 'https://srimathsacademy.in/class-8-maths-tuition.html',
    ogTitle: 'Class 8 Maths Tuition Online',
    eyebrow: 'Class 8',
    h1: 'Class 8 Maths Tuition Online',
    lead: 'Strong <strong>Class 8 maths</strong> skills prepare students for board years ahead.',
    body: `<p>Class 8 maths bridges middle school and higher topics. Our <strong>online Class 8 maths tuition</strong> focuses on concepts, problem-solving, and regular practice — taught 1-on-1.</p>
<h2>Ready for Class 9 and 10</h2>
<p>We align lessons with your child's school syllabus (CBSE, ICSE, or State Board) so they stay confident in class and at home.</p>`,
    links: `<a href="class-9-maths-tuition.html">Class 9</a><a href="class-10-maths-tuition.html">Class 10</a><a href="online-maths-tuition.html">Online maths</a><a href="index.html">Home</a>`,
    wa: 'Class%208%20maths%20tuition',
  },
  {
    file: 'class-9-maths-tuition.html',
    lang: 'en',
    title: 'Class 9 Maths Tuition Online | 1-on-1 Tutor | Sri Maths Academy',
    desc: 'Class 9 maths tuition online — foundation for board exams. CBSE, ICSE, State Board. Book a free demo.',
    canonical: 'https://srimathsacademy.in/class-9-maths-tuition.html',
    ogTitle: 'Class 9 Maths Tuition Online',
    eyebrow: 'Class 9',
    h1: 'Class 9 Maths Tuition Online',
    lead: '<strong>Class 9 maths tuition</strong> that builds a solid base before Class 10 boards.',
    body: `<p>Class 9 is critical for long-term success in maths. Our <strong>Class 9 maths tuition online</strong> gives full attention to one student — every chapter explained clearly.</p>
<h2>Concept-first teaching</h2>
<ul><li>CBSE, ICSE, and State Board Class 9</li><li>Homework and school test support</li><li>Regular revision and practice</li></ul>`,
    links: `<a href="class-8-maths-tuition.html">Class 8</a><a href="class-10-maths-tuition.html">Class 10</a><a href="cbse-maths-tuition-classes-6-12.html">CBSE</a><a href="index.html">Home</a>`,
    wa: 'Class%209%20maths%20tuition',
  },
  {
    file: 'class-10-maths-tuition.html',
    lang: 'en',
    title: 'Class 10 Maths Tuition Online | Board Exam Prep | Sri Maths Academy',
    desc: 'Class 10 maths tuition online for CBSE, ICSE & State Board. 1-on-1 board exam preparation. Book a free demo.',
    canonical: 'https://srimathsacademy.in/class-10-maths-tuition.html',
    ogTitle: 'Class 10 Maths Tuition Online',
    eyebrow: 'Class 10 · Boards',
    h1: 'Class 10 Maths Tuition Online',
    lead: 'Focused <strong>Class 10 board exam preparation</strong> with personal attention.',
    body: `<p>Class 10 maths is a turning point. Our <strong>online Class 10 maths tuition</strong> covers the full syllabus, past-paper practice, and time management — taught 1-on-1 so nothing is skipped.</p>
<h2>Board-ready teaching</h2>
<ul><li>CBSE, ICSE, and State Board Class 10</li><li>Chapter-wise revision</li><li>Exam-style problem practice</li><li>Confidence before the final paper</li></ul>`,
    links: `<a href="cbse-maths-tuition-classes-6-12.html">CBSE tuition</a><a href="class-12-maths-tuition.html">Class 12</a><a href="online-maths-tuition.html">Online maths</a><a href="index.html">Home</a>`,
    wa: 'Class%2010%20maths%20tuition',
  },
  {
    file: 'class-11-maths-tuition.html',
    lang: 'en',
    title: 'Class 11 Maths Tuition Online | CBSE ICSE | Sri Maths Academy',
    desc: 'Class 11 maths tuition online — calculus prep, algebra, 1-on-1 tutor. CBSE & ICSE. Free demo class.',
    canonical: 'https://srimathsacademy.in/class-11-maths-tuition.html',
    ogTitle: 'Class 11 Maths Tuition Online',
    eyebrow: 'Class 11',
    h1: 'Class 11 Maths Tuition Online',
    lead: 'Expert <strong>Class 11 maths tutoring</strong> for higher secondary success.',
    body: `<p>Class 11 maths introduces advanced topics that matter for Class 12 boards. Our <strong>online Class 11 maths tuition</strong> helps students master each unit with a patient, experienced tutor.</p>
<h2>Personal attention</h2>
<p>CBSE and ICSE Class 11 syllabi are covered at your child's school pace — with time for doubts, revision, and exam-style practice.</p>`,
    links: `<a href="class-10-maths-tuition.html">Class 10</a><a href="class-12-maths-tuition.html">Class 12</a><a href="online-maths-tuition.html">Online tuition</a><a href="index.html">Home</a>`,
    wa: 'Class%2011%20maths%20tuition',
  },
  {
    file: 'class-12-maths-tuition.html',
    lang: 'en',
    title: 'Class 12 Maths Tuition Online | CBSE ICSE | Sri Maths Academy',
    desc: 'Class 12 maths tuition online — calculus, algebra, exam prep. 1-on-1 tutor for CBSE & ICSE. Free demo.',
    canonical: 'https://srimathsacademy.in/class-12-maths-tuition.html',
    ogTitle: 'Class 12 Maths Tuition Online',
    eyebrow: 'Class 12',
    h1: 'Class 12 Maths Tuition Online',
    lead: 'Expert <strong>Class 12 maths tutoring</strong> for board exams and strong concepts.',
    body: `<p>Class 12 maths needs clarity and consistent practice. Our <strong>online Class 12 maths tuition</strong> helps students master difficult topics with a tutor who adapts to their school's pace.</p>
<h2>Support through the final year</h2>
<p>Whether CBSE or ICSE, we focus on understanding first, then scoring. Book a free demo to discuss your child's needs.</p>`,
    links: `<a href="class-10-maths-tuition.html">Class 10</a><a href="cbse-maths-tuition-classes-6-12.html">CBSE</a><a href="online-maths-tuition.html">Online tuition</a><a href="index.html">Home</a>`,
    wa: 'Class%2012%20maths%20tuition',
  },
  {
    file: 'maths-tuition-tamil.html',
    lang: 'ta',
    title: 'ஆன்லைன் கணிதம் டியூஷன் வகுப்பு 6–12 | ஸ்ரீ மேட்ஸ் அகாடமி',
    desc: 'வகுப்பு 6 முதல் 12 வரை ஆன்லைன் ஒன்-ஒன் கணிதம் டியூஷன். CBSE, ICSE, மாநில பாடத்திட்டம். இலவச டெமோ வகுப்பு.',
    canonical: 'https://srimathsacademy.in/maths-tuition-tamil.html',
    ogTitle: 'ஆன்லைன் கணிதம் டியூஷன் | ஸ்ரீ மேட்ஸ் அகாடமி',
    eyebrow: 'தமிழ் · ஆன்லைன்',
    h1: 'ஆன்லைன் கணிதம் டியூஷன் (வகுப்பு 6–12)',
    lead: 'தமிழ்நாடு மற்றும் இந்தியா முழுவதும் <strong>ஆன்லைன் 1-on-1 கணிதம் வகுப்புகள்</strong>.',
    body: `<p><strong>ஸ்ரீ மேட்ஸ் அகாடமி</strong> வழங்கும் ஆன்லைன் கணிதம் டியூஷன் — ஒரு மாணவருக்கு ஒரு ஆசிரியர். CBSE, ICSE, மாநில பாடத்திட்டம் அனைத்தும்.</p>
<h2>ஏன் எங்களை தேர்வு செய்ய வேண்டும்?</h2>
<ul><li>30+ வருட கற்பித்தல் அனுபவம்</li><li>கருத்தியல் வழியில் கற்பித்தல்</li><li>வீட்டிலிருந்தே பாடம் — நேரம் சேமிப்பு</li><li>WhatsApp மூலம் இலவச டெமோ</li></ul>
<p><a href="index.html" hreflang="en">English website</a></p>`,
    links: `<a href="index.html" hreflang="en">English</a><a href="online-maths-tuition.html" hreflang="en">Online maths (EN)</a><a href="class-10-maths-tuition.html">Class 10</a>`,
    wa: 'maths%20tuition%20Tamil',
    hreflangEn: true,
  },
];

pages.forEach((p) => {
  const hreflang =
    p.lang === 'ta'
      ? `<link rel="alternate" hreflang="ta" href="${p.canonical}">
  <link rel="alternate" hreflang="en" href="https://srimathsacademy.in/">
  <link rel="alternate" hreflang="x-default" href="https://srimathsacademy.in/">`
      : `<link rel="alternate" hreflang="en" href="${p.canonical}">
  <link rel="alternate" hreflang="ta" href="https://srimathsacademy.in/maths-tuition-tamil.html">
  <link rel="alternate" hreflang="x-default" href="https://srimathsacademy.in/">`;

  const html = `<!DOCTYPE html>
<html lang="${p.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title}</title>
  <meta name="description" content="${p.desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${p.canonical}">
  ${hreflang}
  <meta property="og:type" content="website">
  <meta property="og:url" content="${p.canonical}">
  <meta property="og:title" content="${p.ogTitle}">
  <meta property="og:description" content="${p.desc.replace(/"/g, '&quot;')}">
  <meta property="og:image" content="https://srimathsacademy.in/og-image.svg">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body class="seo-landing">
${header()}
  <main>
    <section class="section seo-page section--white">
      <div class="container">
        <header class="section__header">
          <p class="section__eyebrow">${p.eyebrow}</p>
          <h1 class="section__title">${p.h1}</h1>
          <p class="section__lead">${p.lead}</p>
        </header>
        <div class="seo-page__content">
          ${p.body}
          <p><button type="button" class="btn btn--primary btn--lg" data-open-modal>Book Free Demo</button></p>
          <nav class="seo-page__links" aria-label="Related pages">${p.links}</nav>
        </div>
      </div>
    </section>
  </main>
${footer(p.file)}
  ${waSvg.replace(/text=[^"]+/, 'text=Hello%2C%20I%27m%20interested%20in%20' + p.wa)}
  ${modal}
  <script src="js/main.js" defer></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(root, p.file), html);
  console.log('Wrote', p.file);
});
