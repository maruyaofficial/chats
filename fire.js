document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCCD_QsMrIw-EVscSwSqm0-ygFhuW1o8Q8",
  authDomain: "chat-b1c07.firebaseapp.com",
  projectId: "chat-b1c07",
  storageBucket: "chat-b1c07.firebasestorage.app",
  messagingSenderId: "15222959483",
  appId: "1:15222959483:web:315a0d26ebd14a6874a1de",
  measurementId: "G-M4VL4VKX04"
};

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  let sessionId = localStorage.getItem("chatSessionId");
  if (!sessionId) {
    sessionId = Date.now().toString() + "-" + Math.random().toString(36).substring(2);
    localStorage.setItem("chatSessionId", sessionId);
  }

  let isAdmin = false;
  let displayName = "Anonymous";

  // ✅ Prompt name on first use
  function askNameIfNew() {
    db.collection("users").doc(sessionId).get().then(doc => {
      if (doc.exists) {
        displayName = doc.data().name || "Anonymous";
        checkAdmin();
      } else {
        const name = prompt("Enter your display name:");
        displayName = name?.trim() || "Anonymous";

        db.collection("users").doc(sessionId).set({
          name: displayName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          checkAdmin();
        });
      }
    });
  }

  // 🛡️ Check admin status
  function checkAdmin() {
    db.collection("admin").doc(sessionId).get().then(doc => {
      if (doc.exists && doc.data().isAdmin) {
        isAdmin = true;
        displayName = doc.data().name || "ADMINMARUYA"
        console.log("🔐 Admin mode enabled:", displayName);
      }
      loadMessages();
    });
  }

  // ✉️ Send message
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

  // 🗑️ Delete (admin only)
  function deleteMessage(id) {
    if (isAdmin && confirm("Delete this message?")) {
      db.collection("messages").doc(id).delete();
    }
  }

  // 🖼️ Render chat
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

  // 🔃 Load all messages
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

  // ⏯️ Start
  window.sendMessage = sendMessage;
  window.deleteMessage = deleteMessage;
  askNameIfNew(); // kick off name setup
});
