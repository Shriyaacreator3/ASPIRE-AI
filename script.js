function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  if (email === "test@aspirai.com" && password === "1234") {
    window.location.href = "dashboard.html"; // redirect
  } else {
    message.textContent = "❌ Invalid email or password!";
  }
}
