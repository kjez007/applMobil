import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../services/firebase";
import styles from "../css/conmexionCsS";

// Fonction simple pour valider un email
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function conne() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide (ex. exemple@domaine.com).");
      return;
    }

    try {
      // Connexion avec Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      Alert.alert("Succès", `Connexion réussie pour ${email} !`);
      router.push("/pages/accueil"); // Redirige vers la page d'accueil après connexion
    } catch (error: any) {
      switch (error.code) {
        case "auth/wrong-password":
          Alert.alert("Erreur", "Mot de passe incorrect.");
          break;
        case "auth/user-not-found":
          Alert.alert("Erreur", "Aucun utilisateur trouvé avec cet email.");
          break;
        case "auth/invalid-email":
          Alert.alert("Erreur", "Email invalide.");
          break;
        default:
          Alert.alert("Erreur", "Échec de la connexion : " + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}> Connexion</Text>
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
        {/* Champ Mot de passe avec icône */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => passwordRef.current?.focus()}>
            <Ionicons name="lock-closed-outline" size={22} color="#1A9EAA" style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            ref={passwordRef}
            style={[styles.input, { flex: 1 }]}
            placeholder="Mot de passe"
            placeholderTextColor="#D3D3D3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/pages/inscription")}>
          <Text style={styles.linkText}>
            Pas encore inscrit ?<Text style={styles.no}>{"\n  "}</Text>Créez un compte
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
          <Text style={styles.linkText}>Appros de l'application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}