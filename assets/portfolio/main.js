(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    document.body.classList.add('motion-enabled');
  }
  const art = document.querySelector('.hero-art');
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.header');
  const shapes = [
    { element: art.querySelector('.orb-one'), x: 180, y: 330, scale: 0.22, turn: -14 },
    { element: art.querySelector('.orb-two'), x: -150, y: 100, scale: -0.16, turn: 18 },
    { element: art.querySelector('.orb-three'), x: 220, y: -280, scale: 0.4, turn: -24 },
    { element: art.querySelector('.orbit'), x: -100, y: -210, scale: 0.16, turn: 65 }
  ];
  let framePending = false;
  function updateShapes() {
    framePending = false;
    if (reducedMotion.matches) {
      art.style.opacity = '';
      shapes.forEach(({ element }) => {
        ['translate', 'scale', 'rotate'].forEach(property => element.style.removeProperty(property));
      });
      return;
    }
    const progress = Math.max(0, Math.min(1,
      (header.offsetHeight - hero.getBoundingClientRect().top) / hero.offsetHeight));
    const horizontalRange = Math.min(1, hero.clientWidth / 1000);
    shapes.forEach(({ element, x, y, scale, turn }) => {
      element.style.translate = `${(x * progress * horizontalRange).toFixed(2)}px ${(y * progress).toFixed(2)}px`;
      element.style.scale = String(1 + scale * progress);
      element.style.rotate = `${(turn * progress).toFixed(2)}deg`;
    });
    art.style.opacity = String(1 - progress * 0.65);
  }
  function scheduleShapes() {
    if (!framePending) { framePending = true; requestAnimationFrame(updateShapes); }
  }
  window.addEventListener('scroll', scheduleShapes, { passive: true });
  window.addEventListener('resize', scheduleShapes);
  window.addEventListener('pageshow', scheduleShapes);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) document.body.classList.remove('motion-enabled');
    updateShapes();
  });
  updateShapes();

  const dialog = document.getElementById('assistant');
  const trigger = document.getElementById('ask-trigger');
  const question = document.getElementById('question');
  const log = document.getElementById('chat-log');
  const preparedAnswers = {
    research: 'Negar’s research interests include graph neural networks, accelerated MRI reconstruction, image super-resolution and denoising, robotics, and deep learning in finance. Her completed B.Sc. thesis explored a dynamic attentive graph neural network for cardiac MRI reconstruction.\n\nSource: CV, Research Experience and Projects; personal website, Research Interests.',
    experience: 'Since September 2026, Negar has worked at Salamt Binesh Farda, collaborating closely with dentists to develop AI models for dental assistants. She previously worked as an AI Engineer at Amoot from January to September 2026, working on phishing detection and a Farsi AI assistant. Previously, she was a Network Security Assistant at Dotin (June–October 2023) and an intern at Dotin School (January–June 2023).\n\nSource: CV and updated work experience supplied by Negar.',
    education: 'Negar earned a B.Sc. in Computer Engineering at Shahid Beheshti University (September 2020–February 2025). Her cumulative GPA is 17.49/20 (3.68/4), and her GPA for the final two years is 18.32/20 (3.79/4). Before university, she attended Farzanegan 1 High School in Mashhad, earned a Mathematics diploma with a GPA of 19.95/20 (4/4), and ranked first in the SAMPAD high-school entrance exam in Khorasan Razavi Province in 2017.\n\nSource: CV and education details supplied by Negar; high-school GPA updated by Negar.',
    languages: 'Negar has advanced English proficiency (CEFR C1), with a TOEFL iBT score of 108/120. Her French is at intermediate level (CEFR B1), and she continues studying to strengthen her communication skills. She is also developing her Spanish proficiency.\n\nSource: Language qualifications supplied by Negar.',
    contact: 'You can contact Negar at negarhonarvar.se@gmail.com, find her work on github.com/negarhonarvar, or connect on LinkedIn at linkedin.com/in/negar-honarvar-sedighian.\n\nSource: CV, contact links.'
  };
  trigger.addEventListener('click', () => { dialog.showModal(); question.focus(); });
  document.getElementById('close-assistant').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger.focus());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
  function message(text, user = false) {
    const paragraph = document.createElement('p');
    paragraph.className = 'chat-message' + (user ? ' user' : '');
    paragraph.textContent = text;
    log.append(paragraph);
    while (log.children.length > 24) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  document.querySelectorAll('[data-topic]').forEach(button => {
    button.addEventListener('click', () => {
      message(button.textContent, true);
      message(preparedAnswers[button.dataset.topic]);
    });
  });
  document.getElementById('ask-form').addEventListener('submit', event => {
    event.preventDefault();
    const text = question.value.trim();
    if (!text) return;
    message(text, true);
    question.value = '';
    message('Live AI isn’t connected yet, so I can’t answer free-form questions. Choose one of the topics below for a prepared answer, or email Negar at negarhonarvar.se@gmail.com.');
    question.focus();
  });
})();
