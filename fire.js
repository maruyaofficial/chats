document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBivT9zXL_2v3VqPOquynR1hCmOeJIuBus",
    authDomain: "chatapp-3f107.firebaseapp.com",
    projectId: "chatapp-3f107",
    storageBucket: "chatapp-3f107.firebasestorage.app",
    messagingSenderId: "822555988221",
    appId: "1:822555988221:web:bb67cbd33b6eb3fca4ee94",
    measurementId: "G-N3RYWVW8LB"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // 🔐 Session ID per user
  let sessionId = localStorage.getItem("chatSessionId");
  if (!sessionId) {
    sessionId = Date.now().toString() + "-" + Math.random().toString(36).substring(2);
    localStorage.setItem("chatSessionId", sessionId);
  }

  // 🛡️ Admin detection
  let isAdmin = false;
  let displayName = "Anonymous";

  function checkAdmin() {
    db.collection("admin").doc(sessionId).get().then(doc => {
      if (doc.exists && doc.data().isAdmin) {
        isAdmin = true;
        displayName = doc.data().name || "Admin";
        console.log("🔐 Admin mode enabled:", displayName);
      } else {
        displayName = "User";
      }
      loadMessages();
    });
  }

  // ✏️ Send a message
  function sendMessage() {
    const message = document.getElementById("message").value.trim();
    if (!message) return;

    db.collection("messages").add({
      username: displayName,
      message,
      sessionId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("message").value = '';
  }

  // 🧹 Delete message (if admin)
  function deleteMessage(id) {
    if (isAdmin && confirm("Delete this message?")) {
      db.collection("messages").doc(id).delete();
    }
  }

  // 🖼️ Render chat messages
  function renderMessage(doc) {
    const data = doc.data();
    const time = data.timestamp?.toDate().toLocaleTimeString() || '';
    return `
      <p data-id="${doc.id}">
        <strong>${data.username}</strong>: ${data.message}
        <span style="font-size:0.8em; color:#888;">${time}</span>
        ${isAdmin ? `<button onclick="deleteMessage('${doc.id}')">🗑️</button>` : ''}
      </p>`;
  }

  // 🔃 Load and show chat messages
  function loadMessages() {
    db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
      const chat = document.getElementById("chat");
      chat.innerHTML = '';
      snapshot.forEach(doc => {
        chat.innerHTML += renderMessage(doc);
      });
      chat.scrollTop = chat.scrollHeight;
    });
  }

  // 👇 Expose to HTML
  window.sendMessage = sendMessage;
  window.deleteMessage = deleteMessage;

  // ✅ Start by checking if user is admin
  checkAdmin();
});
