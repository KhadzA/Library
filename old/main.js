import socket from './socket.js';

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

document.getElementById("goToLogin").addEventListener("click", function () {
  window.location.href = "src/auth/login.html"; // Adjust path as needed
});

document.getElementById("goToSignup").addEventListener("click", function () {
  window.location.href = "src/auth/signup.html"; // Adjust path as needed
});

