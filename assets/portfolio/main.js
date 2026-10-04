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
  let framePending = false;
  function updateShapes() {
    framePending = false;
    if (reducedMotion.matches) {
      art.style.transform = '';
      art.style.opacity = '';
      return;
    }
    const progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
    art.style.transform = `translateY(${progress * 160}px) scale(${1 + progress * 0.18}) rotate(${progress * 8}deg)`;
    art.style.opacity = String(1 - progress * 0.95);
  }
  window.addEventListener('scroll', () => {
    if (!framePending) { framePending = true; requestAnimationFrame(updateShapes); }
  }, { passive: true });
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
    research: 'Negar’s research interests include graph neural networks, accelerated MRI reconstruction, image super-resolution and denoising, robotics, and deep learning in finance. Her B.Sc. thesis explores a dynamic attentive graph neural network for cardiac MRI reconstruction. The CV lists this research as in preparation.\n\nSource: CV, Research Experience and Projects; personal website, Research Interests.',
    experience: 'Negar has been an AI Engineer at Amoot since January 2026, working on phishing detection and a Farsi AI assistant. She was a Network Security Assistant at Dotin (June–October 2023) and a Network Security Intern at Dotin School (January–June 2023).\n\nSource: CV, Work Experience.',
    education: 'Negar earned a B.Sc. in Computer Engineering at Shahid Beheshti University (September 2020–February 2025). Her cumulative GPA is 17.49/20 (3.68/4), and her GPA for the final two years is 18.32/20 (3.79/4). Her certificates include courses from DeepLearning.AI, the University of Michigan, IBM, and Meta.\n\nSource: CV, Education and Certificates.',
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
