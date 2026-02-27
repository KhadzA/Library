import socket from '../socket.js';

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("goToLogin");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "./login.html"; // Adjust if needed
    });
  } else {
    console.error("goToLogin button not found");
  }
});
