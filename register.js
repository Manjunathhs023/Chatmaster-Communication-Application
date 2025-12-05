function handleRegister(event) {
  event.preventDefault();
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (fullName && email && password) {
    const users = localStorage.getItem("users")
      ? JSON.parse(localStorage.getItem("users"))
      : [];

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      alert("User already exists");
      return;
    }

    const newUser = {
      fullName: fullName,
      email: email,
      password: password,
      registeredDate: new Date().toISOString(),
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("successModal").style.display = "flex";
  } else {
    alert("Please fill in all fields");
  }
}
