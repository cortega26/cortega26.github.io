
// For example, smooth scrolling to sections on clicking nav links

$(document).ready(function() {
  $(".nav-link").on("click", function(event) {
    event.preventDefault();
    const target = $(this).attr("href");
    $("html, body").animate({
      scrollTop: $(target).offset().top
    }, 800);
  });
});


/* // Define an array of engaging messages
const messages = [
    "It's about 3.1416 \nThis is not a Sandra Bullock movie",
    "Congratulations! You've unlocked the power of π. But beware, secrets come with a price...",
    "Spiders crawl, secrets beckon. How deep will you venture into the digital abyss?",
    "The cosmos whisper, the code calls. A universe of mysteries awaits...",
    "A portal to the unknown has been opened. The ancient symbol of π reveals hidden truths...",
    "Illuminating the shadows of the digital realm, you've embarked on a thrilling quest...",
    "Binary whispers echo through the cyberspace. The enigma of π holds untold wonders...",
    "Decoding the language of numbers, you've awakened a dormant power within...",
    "The world of possibilities unfolds before you. The journey has just begun...",
  ];
  
  // Initialize click count
  let clickCount = 0;
  
  function showPiMessage() {
    // Check if all messages have been displayed
    if (clickCount === messages.length) {
      // Last message with the call to action
      const finalMessage = "I hope you had enough fun, now it's time to hire me. Let's create something extraordinary together!";
      alert(finalMessage);
    } else {
      // Get the current message based on the click count
      const message = messages[clickCount % messages.length];
  
      // Increment click count for the next click
      clickCount++;
  
      alert(message);
    }
  } */


// Define messages for English
const messagesEn = [
  "It's about 3.1416 \nThis is not a Sandra Bullock movie",
    "Congratulations! You've unlocked the power of π. But beware, secrets come with a price...",
    "Spiders crawl, secrets beckon. How deep will you venture into the digital abyss?",
    "The cosmos whisper, the code calls. A universe of mysteries awaits...",
    "A portal to the unknown has been opened. The ancient symbol of π reveals hidden truths...",
    "Illuminating the shadows of the digital realm, you've embarked on a thrilling quest...",
    "Binary whispers echo through the cyberspace. The enigma of π holds untold wonders...",
    "Decoding the language of numbers, you've awakened a dormant power within...",
    "The world of possibilities unfolds before you. The journey has just begun...",
];

// Define messages for Spanish
const messagesEs = [
  "¡Es sobre 3.1416! \nEsto no es una película de Sandra Bullock",
  "¡Felicidades! Has desbloqueado el poder de π. Pero cuidado, los secretos tienen un precio...",
  "Las arañas se deslizan, los secretos llaman. ¿Qué tan profundo te atreves a ir en el abismo digital?",
  "El cosmos susurra y el código llama. Un universo de misterios te espera...",
  "Se ha abierto un portal a lo desconocido. El símbolo ancestral de π revela verdades ocultas...",
  "Iluminaste las sombras del reino digital; te embarcaste en una aventura emocionante...",
  "Susurros binarios recorren el ciberespacio. El enigma de π guarda maravillas indescriptibles...",
  "Al descifrar el lenguaje de los números despertaste un poder latente...",
  "El mundo de posibilidades se despliega ante ti. El viaje apenas comienza...",
];

// Initialize click count
let clickCount = 0;

function showPiMessage() {
  // Check the value of the lang attribute
  const langAttribute = document.documentElement.getAttribute("lang");
  
  // Determine the messages based on the language
  const isSpanish = langAttribute && langAttribute.startsWith("es");

  let messages;
  if (isSpanish) {
      messages = messagesEs;
  } else {
      messages = messagesEn;
  }

  // Check if all messages have been displayed
  if (clickCount === messages.length) {
      // Last message with the call to action
      const finalMessage = isSpanish
        ? "Espero que te hayas divertido, ahora es momento de contratarme. ¡Creemos algo extraordinario juntos!"
        : "I hope you had enough fun, now it's time to hire me. Let's create something extraordinary together!";
      alert(finalMessage);
  } else {
      // Get the current message based on the click count
      const message = messages[clickCount % messages.length];

      // Increment click count for the next click
      clickCount++;

      alert(message);
  }
}







function sendEmailFallback(event) {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  event.preventDefault();

  const langAttribute = document.documentElement.getAttribute("lang");
  const isSpanish = langAttribute && langAttribute.startsWith("es");

  const name = contactForm.elements["name"].value.trim();
  const email = contactForm.elements["email"].value.trim();
  const subject = contactForm.elements["subject"].value.trim();
  const message = contactForm.elements["message"].value.trim();

  const fallbackSubject = isSpanish ? "Consulta de portafolio" : "Portfolio Inquiry";
  const composedSubject = subject
    ? `${subject} — ${name || fallbackSubject}`
    : `${fallbackSubject} ${isSpanish ? "de" : "from"} ${name || (isSpanish ? "Visita al sitio web" : "Website Visitor")}`;
  const bodyLines = [
    `${isSpanish ? "Nombre" : "Name"}: ${name || (isSpanish ? "No proporcionado" : "Not provided")}`,
    `${isSpanish ? "Correo" : "Email"}: ${email || (isSpanish ? "No proporcionado" : "Not provided")}`,
    "",
    message || "",
  ];

  const mailtoLink = `mailto:carlosortega77@gmail.com?subject=${encodeURIComponent(composedSubject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

  window.location.href = mailtoLink;

  setTimeout(() => {
    contactForm.reset();
  }, 300);

  alert(isSpanish
    ? "Los detalles de tu mensaje se prepararon en tu cliente de correo. Revísalos y envíalos para completar el contacto."
    : "Your message details have been prepared in your email client. Please review and send it to complete your outreach.");
}

document.addEventListener("DOMContentLoaded", function() {
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", sendEmailFallback);
  }
});
