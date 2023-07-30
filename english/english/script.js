
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


// Define an array of engaging messages
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
  }
  

// Initialize EmailJS with your user ID and service ID
emailjs.init("FR00XbHCNqyr4xeQy");

// Function to send the form data to your email template
function sendEmail() {
  const contactForm = document.getElementById("contact-form");
  const formData = {
    name: contactForm.name.value,
    email: contactForm.email.value,
    subject: contactForm.subject.value,
    message: contactForm.message.value
  };

  // Use the emailjs.send() function to send the email
  emailjs.send("service_ta54kdn", "template_uq1sv2c", formData)
    .then(function(response) {
      console.log("Email sent successfully:", response);
      // Show a success message or redirect to a thank-you page
      alert("Your message has been sent successfully!");
      contactForm.reset();
    }, function(error) {
      console.log("Failed to send email:", error);
      // Show an error message
      alert("Failed to send message. Please try again later.");
    });
}

// Add event listener to the form submission
document.getElementById("contact-form").addEventListener("submit", function(event) {
  event.preventDefault();
  sendEmail();
});
