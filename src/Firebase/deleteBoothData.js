import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

// 🔐 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCc4myqMX5RwFJfdD7jHhzoYb65w0S_KpE",
  authDomain: "prabhag14vanchitnew.firebaseapp.com",
  projectId: "prabhag14vanchitnew",
  storageBucket: "prabhag14vanchitnew.firebasestorage.app",
  messagingSenderId: "612396105898",
  appId: "1:612396105898:web:3acc0d0ae34d89884750d3"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🗑️ Booth to delete
const targetBooth = "299 Akola Kaulkhed"; // match exactly what is in DB

async function deleteBoothVoters() {
  console.log(`🔍 Checking voters for booth: ${targetBooth}`);
  const votersCol = collection(db, 'voters');
  const q = query(votersCol, where('boothNumber', '==', targetBooth));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("❌ No voters found in the database for the specified booth.");
    return;
  }

  let deletedCount = 0;
  let totalCount = snapshot.size;

  for (const docSnap of snapshot.docs) {
    try {
      await deleteDoc(doc(db, 'voters', docSnap.id));
      deletedCount++;
      console.log(`🗑️ Deleted voter: ${docSnap.id}`);
    } catch (e) {
      console.error('Failed to delete', docSnap.id, e);
    }
  }

  console.log(`✅ Deleted ${deletedCount} out of ${totalCount} voters from booth "${targetBooth}"`);
}

deleteBoothVoters().catch(console.error);
