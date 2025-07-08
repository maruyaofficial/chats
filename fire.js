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

  function sendMessage() {
    const message = document.getElementById("message").value.trim();
    if (!message) return;

    db.collection("messages").add({
      username: "Anonymous",
      avatar: "",
      message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById("message").value = '';
  }

  function loadMessages() {
    db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
      const chat = document.getElementById("chat");
      chat.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const time = data.timestamp?.toDate().toLocaleTimeString() || '';
        chat.innerHTML += `
          <p>
            <strong>${data.username}</strong>: ${data.message}
            <span style="font-size:0.8em; color:#888;">${time}</span>
          </p>`;
      });
      chat.scrollTop = chat.scrollHeight;
    });
  }

  window.sendMessage = sendMessage;
  loadMessages();
});
