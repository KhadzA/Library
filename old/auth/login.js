import socket from '../socket.js';

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("goToSignup");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "./signup.html"; // Adjust if needed
    });
  } else {
    console.error("goToSignup button not found");
  }
});
