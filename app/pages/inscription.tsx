import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState, useRef } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ajout des icônes
import { auth, db } from "../../services/firebase";
import styles from "../css/inscriptionCSS"; // Ajusté le chemin, vérifie selon ta structure

// Fonction simple pour valider un email
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Inscription() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Références pour chaque champ
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const inscription = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide (ex. exemple@domaine.com).");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "clients", user.uid), {
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Succès", "Inscription réussie ! Redirection...");
      router.push("/pages/accueil"); // Redirige vers la page d'accueil après inscription
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Erreur", "Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter.", [
          { text: "OK", onPress: () => router.push("/pages/connexion") },
        ]);
      } else {
        Alert.alert("Erreur", "Échec de l'inscription : " + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Inscription</Text>
        {/* Champ Nom avec icône */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => nameRef.current?.focus()}>
            <Ionicons name="person-outline" size={22} color="#1A9EAA" style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            ref={nameRef}
            style={[styles.input, { flex: 1 }]}
            placeholder="Nom"
            placeholderTextColor="#D3D3D3"
            value={name}
            onChangeText={setName}
          />
        </View>
        {/* Champ Email avec icône */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => emailRef.current?.focus()}>
            <Ionicons name="mail-outline" size={22} color="#1A9EAA" style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            ref={emailRef}
            style={[styles.input, { flex: 1 }]}
            placeholder="Email"
            placeholderTextColor="#D3D3D3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* Champ Téléphone avec icône */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => phoneRef.current?.focus()}>
            <Ionicons name="call-outline" size={22} color="#1A9EAA" style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            ref={phoneRef}
            style={[styles.input, { flex: 1 }]}
            placeholder="Téléphone"
            placeholderTextColor="#D3D3D3"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        {/* Champ Mot de passe avec icône */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => passwordRef.current?.focus()}>
            <Ionicons name="lock-closed-outline" size={22} color="#1A9EAA" style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            ref={passwordRef}
            style={[styles.input, { flex: 1 }]}
            placeholder="Mot de passe (8 caractères minimum)"
            placeholderTextColor="#D3D3D3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={inscription}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/pages/connexion")}>
          <Text style={styles.linkText}>Déjà inscrit ? Connectez-vous</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}