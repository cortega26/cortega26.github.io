$(document).ready(function() {
  $('a[href^="#"]').on('click', function(event) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 800);
    }
  });
});

const messagesEn = [
  "Analytics should feel calm and reliable—curious how I returned 420 hours to analysts?",
  "Bilingual partner here. Need a guide through compliance, fraud, or growth dashboards?",
  "FastAPI, SQL, and storytelling—pick two and I'll add the third.",
  "Serious about automation readiness? Let's co-design your next delivery playbook.",
  "Looking for algorithmic proof? My math lab is just a few scrolls away."
];

const messagesEs = [
  "La analítica debe sentirse segura y predecible—¿quieres saber cómo devolví 420 horas a los analistas?",
  "Compañero bilingüe disponible. ¿Necesitas guía en cumplimiento, fraude o dashboards de crecimiento?",
  "FastAPI, SQL y storytelling: elige dos y yo sumo el tercero.",
  "¿Listo para automatizar con solidez? Diseñemos juntos tu próximo playbook de entrega.",
  "¿Buscas evidencia algorítmica? Mi laboratorio matemático está unas secciones más abajo."
];

let clickCount = 0;

function showPiMessage() {
  const langAttribute = document.documentElement.getAttribute('lang');
  const isSpanish = langAttribute && langAttribute.startsWith('es');
  const messages = isSpanish ? messagesEs : messagesEn;

  if (clickCount >= messages.length) {
    const finalMessage = isSpanish
      ? '¿Listo para conversar? Agenda una llamada de descubrimiento y avancemos.'
      : 'Ready to talk? Book a discovery call and let’s move forward.';
    alert(finalMessage);
    clickCount = 0;
    return;
  }

  alert(messages[clickCount]);
  clickCount += 1;
}

function sendEmailFallback(event) {
  const contactForm = document.getElementById('contact-form');

  if (!contactForm) {
    return;
  }

  event.preventDefault();

  const langAttribute = document.documentElement.getAttribute('lang');
  const isSpanish = langAttribute && langAttribute.startsWith('es');

  const name = contactForm.elements['name'].value.trim();
  const email = contactForm.elements['email'].value.trim();
  const subject = contactForm.elements['subject'].value.trim();
  const message = contactForm.elements['message'].value.trim();

  const fallbackSubject = isSpanish ? 'Consulta de portafolio' : 'Portfolio Inquiry';
  const composedSubject = subject
    ? `${subject} — ${name || fallbackSubject}`
    : `${fallbackSubject} ${isSpanish ? 'de' : 'from'} ${name || (isSpanish ? 'Visita al sitio web' : 'Website Visitor')}`;

  const bodyLines = [
    `${isSpanish ? 'Nombre' : 'Name'}: ${name || (isSpanish ? 'No proporcionado' : 'Not provided')}`,
    `${isSpanish ? 'Correo' : 'Email'}: ${email || (isSpanish ? 'No proporcionado' : 'Not provided')}`,
    '',
    message || ''
  ];

  const mailtoLink = `mailto:carlosortega77@gmail.com?subject=${encodeURIComponent(composedSubject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

  window.location.href = mailtoLink;

  setTimeout(() => {
    contactForm.reset();
  }, 300);

  alert(isSpanish
    ? 'Tu mensaje está listo en tu cliente de correo. Revísalo y envíalo para completar el contacto.'
    : 'Your message draft is ready in your email client. Review and send it to complete your outreach.');
}

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', sendEmailFallback);
  }
});
