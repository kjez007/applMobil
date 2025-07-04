import { initializeApp } from "firebase/app";
import { initializeAuth, updatePassword } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVec_GFpZGiuC9g8c6B_Np7bRMJu9sAPc",
  authDomain: "gestionfinace.firebaseapp.com",
  projectId: "gestionfinace",
  storageBucket: "gestionfinace.firebasestorage.app",
  messagingSenderId: "79969026301",
  appId: "1:79969026301:web:9c5de9dff6e6abf763fe94",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app);
export const db = getFirestore(app);

// Méthode pour récupérer les données de l'utilisateur
export const getClients = async (uid: string) => {
  try {
    const infoClient = await getDoc(doc(db, "clients", uid));
    if (infoClient.exists()) {
      const client = infoClient.data();
      return {
        name: client?.name || "Nom non trouvé",
        email: client?.email || "Email non trouvé",
        photoURL: client?.photoURL || null,
      };
    } else {
      return {
        name: "Utilisateur non trouvé",
        email: "Email non trouvé",
        photoURL: null,
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    return {
      name: "Erreur",
      email: "Erreur",
      photoURL: null,
    };
  }
};

// Méthode pour mettre à jour les données de l'utilisateur
export const updateClientData = async (uid: string, data: { name?: string; email?: string; photoURL?: string }) => {
  try {
    await updateDoc(doc(db, "clients", uid), data);
    console.log("Données mises à jour avec succès");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des données :", error);
    throw error;
  }
};

// Méthode pour mettre à jour le mot de passe
export const updateClientPassword = async (newPassword: string) => {
  try {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPassword);
      console.log("Mot de passe mis à jour avec succès");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    throw error;
  }
};