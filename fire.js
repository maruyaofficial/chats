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
  const auth = firebase.auth();
  const db = firebase.firestore();

  const ui = new firebaseui.auth.AuthUI(auth);
  ui.start('#firebaseui-auth-container', {
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    callbacks: { signInSuccessWithAuthResult: () => false }
  });

  function showChat() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('chatbox').style.display = 'block';
    loadMessages();
  }

  function sendMessage() {
    const message = document.getElementById("message").value.trim();
    const user = auth.currentUser;
    if (!message || !user) return;

    db.collection("users").doc(user.uid).get().then(doc => {
      const profile = doc.data();
      db.collection("messages").add({
        uid: user.uid,
        username: profile?.name || user.displayName || "User",
        avatar: profile?.avatar || user.photoURL || "",
        message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById("message").value = '';
    });
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
            <img src="${data.avatar}" width="30" height="30" style="border-radius:50%; vertical-align:middle;" />
            <strong>${data.username}</strong>: ${data.message}
            <span style="font-size:0.8em; color:#888;">${time}</span>
          </p>`;
      });
      chat.scrollTop = chat.scrollHeight;
    });
  }

  function logout() {
    auth.signOut().then(() => location.reload());
  }

  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).set({
        name: user.displayName,
        avatar: user.photoURL
      }, { merge: true }).then(showChat);
    } else {
      document.getElementById('login-container').style.display = 'block';
      document.getElementById('chatbox').style.display = 'none';
    }
  });

  window.sendMessage = sendMessage;
  window.logout = logout;
});
