let currentUser = null;
let confirmCallback = null;

document.addEventListener("DOMContentLoaded", function () {
  currentUser = localStorage.getItem("currentUser");

  const currentUserNameElement = document.getElementById("currentUserName");
  if (currentUserNameElement) {
    const userName = localStorage.getItem("userName");
    if (userName) {
      currentUserNameElement.textContent = userName;
    }
  }

  if (document.getElementById("chatMessages")) {
    displayMessages();
  }

  if (document.getElementById("usersTableBody")) {
    loadUsers();
  }

  if (document.getElementById("myUploadsTableBody")) {
    loadDocuments();
  }

  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const fileDisplay = document.getElementById("fileDisplay");
      if (e.target.files.length > 0) {
        fileDisplay.textContent = e.target.files[0].name;
      }
    });
  }
});

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userName");
  window.location.href = "index.html?logout=true";
}

function showSection(sectionName) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.remove("active"));

  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((btn) => btn.classList.remove("active"));

  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  event.target.classList.add("active");

  const urlBar = document.getElementById("currentUrl");
  if (urlBar) {
    const urls = {
      groupchat: "http://localhost:8080/public/groupchat",
      users: "http://localhost:8080/public/users/usermgmt",
      documents: "http://localhost:8080/public/docmgmt",
    };
    urlBar.textContent =
      urls[sectionName] || "http://localhost:8080/public/groupchat";
  }
}

function showDocumentTab(tabName) {
  const tabs = document.querySelectorAll(".document-tab");
  tabs.forEach((tab) => tab.classList.remove("active"));

  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => btn.classList.remove("active"));

  const targetTab = document.getElementById(tabName);
  if (targetTab) {
    targetTab.classList.add("active");
  }

  event.target.classList.add("active");
}

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const message = messageInput.value.trim();

  if (message) {
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const userName = localStorage.getItem("userName") || "Current User";

    const messages = localStorage.getItem("chatMessages")
      ? JSON.parse(localStorage.getItem("chatMessages"))
      : [];

    const newMessage = {
      timestamp: timestamp,
      userName: userName,
      text: message,
    };

    messages.push(newMessage);

    localStorage.setItem("chatMessages", JSON.stringify(messages));

    displayMessages();

    messageInput.value = "";
  }
}

function displayMessages() {
  const chatMessages = document.getElementById("chatMessages");

  const messages = localStorage.getItem("chatMessages")
    ? JSON.parse(localStorage.getItem("chatMessages"))
    : [];

  chatMessages.innerHTML = "";

  messages.forEach((msg) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.innerHTML = `
            <span class="timestamp">[${msg.timestamp}]</span>
            <span class="username">${msg.userName}:</span>
            <span class="text">${msg.text}</span>
        `;
    chatMessages.appendChild(messageDiv);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function refreshChat() {
  displayMessages();
}

function editUser(email) {
  const modal = document.getElementById("editUserModal");
  const fullNameInput = document.getElementById("editFullName");
  const emailInput = document.getElementById("editEmail");

  const users = localStorage.getItem("users")
    ? JSON.parse(localStorage.getItem("users"))
    : [];

  const user = users.find((u) => u.email === email);

  fullNameInput.value = user ? user.fullName : "";
  emailInput.value = email;

  modal.style.display = "block";

  const form = document.getElementById("editUserForm");
  form.onsubmit = function (e) {
    e.preventDefault();

    const userIndex = users.findIndex((u) => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].fullName = fullNameInput.value;
      users[userIndex].email = emailInput.value;

      localStorage.setItem("users", JSON.stringify(users));

      alert("User updated successfully");
      loadUsers();
      closeModal("editUserModal");
    }
  };
}

function deleteUser(email) {
  confirmCallback = function () {
    const users = localStorage.getItem("users")
      ? JSON.parse(localStorage.getItem("users"))
      : [];

    const updatedUsers = users.filter((u) => u.email !== email);

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    loadUsers();

    closeModal("confirmModal");
  };

  showConfirmModal();
}

function editDocument(fileName) {
  alert(`Editing document: ${fileName}`);
}

function deleteDocument(fileName) {
  confirmCallback = function () {
    const documents = localStorage.getItem("documents")
      ? JSON.parse(localStorage.getItem("documents"))
      : [];

    const updatedDocuments = documents.filter((d) => d.fileName !== fileName);

    localStorage.setItem("documents", JSON.stringify(updatedDocuments));

    loadDocuments();

    closeModal("confirmModal");
  };

  showConfirmModal();
}

function shareDocument(fileName) {
  const modal = document.getElementById("shareModal");
  const shareList = document.getElementById("shareList");

  shareList.innerHTML = `
        <div class="share-item">
            <span>Anne Hunter</span>
            <button class="btn btn-small btn-danger" onclick="removeShare(this)">Remove</button>
        </div>
        <div class="share-item">
            <span>Text User</span>
            <button class="btn btn-small btn-danger" onclick="removeShare(this)">Remove</button>
        </div>
    `;

  modal.style.display = "block";
}

function addShare() {
  const userSelect = document.getElementById("userSelect");
  const shareList = document.getElementById("shareList");
  const selectedUser = userSelect.value;

  if (selectedUser) {
    const shareItem = document.createElement("div");
    shareItem.className = "share-item";
    shareItem.innerHTML = `
            <span>${getUserNameFromEmail(selectedUser)}</span>
            <button class="btn btn-small btn-danger" onclick="removeShare(this)">Remove</button>
        `;

    shareList.appendChild(shareItem);
    userSelect.value = "";
  }
}

function removeShare(button) {
  confirmCallback = function () {
    button.parentElement.remove();
    closeModal("confirmModal");
  };

  showConfirmModal();
}

function showUploadForm() {
  const modal = document.getElementById("uploadModal");
  modal.style.display = "block";

  const form = document.getElementById("uploadForm");
  form.onsubmit = function (e) {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");

    if (fileInput.files.length > 0) {
      const documents = localStorage.getItem("documents")
        ? JSON.parse(localStorage.getItem("documents"))
        : [];

      const newDocument = {
        fileName: fileInput.files[0].name,
        uploadedBy: localStorage.getItem("userName") || "Current User",
        uploadDate: new Date().toISOString(),
        size: fileInput.files[0].size,
      };

      documents.push(newDocument);

      localStorage.setItem("documents", JSON.stringify(documents));

      alert("File uploaded successfully");
      loadDocuments();
      closeModal("uploadModal");
    } else {
      alert("Please select a file");
    }
  };
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

function showConfirmModal() {
  const modal = document.getElementById("confirmModal");
  modal.style.display = "block";
}

function confirmAction() {
  if (confirmCallback) {
    confirmCallback();
    confirmCallback = null;
  }
}

function getUserNameFromEmail(email) {
  const userMap = {
    "anne.hunter@mail.com": "Anne Hunter",
    "textuser@gmail.com": "Text User",
    "jale@yahoo.com": "Jalé Boser",
    "hr@office.com": "HR Harsh Zaveri",
  };

  return userMap[email] || email.split("@")[0];
}

function loadUsers() {
  const users = localStorage.getItem("users")
    ? JSON.parse(localStorage.getItem("users"))
    : [];

  const userTableBody = document.getElementById("usersTableBody");
  if (userTableBody) {
    userTableBody.innerHTML = "";
    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-small" onclick="editUser('${user.email}')">Edit</button>
                </td>
                <td>
                    <button class="btn btn-small btn-danger" onclick="deleteUser('${user.email}')">Delete</button>
                </td>
            `;
      userTableBody.appendChild(row);
    });
  }
}

function loadDocuments() {
  const documents = localStorage.getItem("documents")
    ? JSON.parse(localStorage.getItem("documents"))
    : [];

  const docTableBody = document.getElementById("myUploadsTableBody");
  if (docTableBody) {
    docTableBody.innerHTML = "";
    documents.forEach((doc) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${doc.fileName}</td>
                <td>${doc.uploadedBy}</td>   
                <td>
                    <button class="btn btn-small" onclick="editDocument('${doc.fileName}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteDocument('${doc.fileName}')">Delete</button>
                    <button class="btn btn-small" onclick="shareDocument('${doc.fileName}')">Share</button>
                </td>
            `;
      docTableBody.appendChild(row);
    });
  }
}

window.onclick = function (event) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};

document.addEventListener("keypress", function (e) {
  if (e.target.id === "messageInput" && e.key === "Enter") {
    sendMessage();
  }
});
