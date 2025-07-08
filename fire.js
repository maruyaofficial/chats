rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /messages/{message} {
      allow read: if true;
      allow create: if request.resource.data.sessionId.size() > 10;
      allow delete: if exists(/databases/$(database)/documents/admins/$(request.auth.uid ?? request.resource.data.sessionId));
    }

    match /admins/{sessionId} {
      allow read: if true;
      allow write: if true; // ✅ You can restrict this later if needed
    }

    match /users/{sessionId} {
      allow read, write: if true;
    }
  }
}
