function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const users = localStorage.getItem("users")
    ? JSON.parse(localStorage.getItem("users"))
    : [];

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", email);
    localStorage.setItem("userName", user.fullName);
    document.getElementById("successModal").style.display = "flex";
  } else {
    alert("Invalid email or password");
  }
}
