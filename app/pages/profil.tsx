import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, getClients, updateClientData, updateClientPassword } from "../../services/firebase";
import profilStyles from "../css/profilCss";

export default function Profil() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const client = await getClients(uid);
        setName(client.name);
        setEmail(client.email);
        setPhoto(client.photoURL);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Erreur", "Utilisateur non connecté.");
      setSaving(false);
      return;
    }

    try {
      const updates: { name?: string; email?: string; photoURL?: string } = {};
      if (name.trim() !== (await getClients(uid)).name) updates.name = name.trim();
      if (email.trim() !== (await getClients(uid)).email) updates.email = email.trim();
      if (photo && photo !== (await getClients(uid)).photoURL) updates.photoURL = photo;

      if (Object.keys(updates).length > 0) {
        await updateClientData(uid, updates);
      }

      if (password && password.length >= 8) {
        await updateClientPassword(password);
      }

      Alert.alert("Succès", "Profil mis à jour avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde :", error.message);
      Alert.alert("Erreur", "Échec de la mise à jour : " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={profilStyles.body}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={profilStyles.header}>
        <Text style={profilStyles.title}>Modifier mon profil</Text>
      </View>
      <View style={profilStyles.formContainer}>
        <TouchableOpacity onPress={pickImage} style={profilStyles.avatarContainer}>
          {photo ? (
            <Image
              source={{ uri: photo }}
              style={profilStyles.avatar}
            />
          ) : (
            <View style={profilStyles.avatar}>
              <Ionicons name="camera-outline" size={40} color="#fff" />
            </View>
          )}
          <Text style={profilStyles.avatarLabel}>
            {photo ? "Changer la photo" : "Ajouter une photo"}
          </Text>
        </TouchableOpacity>

        <View style={{ width: "100%" }}>
          <Text style={profilStyles.label}>Nom</Text>
          <View style={profilStyles.inputRow}>
            <TextInput
              ref={nameRef}
              style={profilStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom"
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity onPress={() => nameRef.current?.focus()}>
              <Ionicons name="pencil-outline" style={profilStyles.editIcon} />
            </TouchableOpacity>
          </View>

          <Text style={profilStyles.label}>Email</Text>
          <View style={profilStyles.inputRow}>
            <TextInput
              ref={emailRef}
              style={profilStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Votre email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => emailRef.current?.focus()}>
              <Ionicons name="pencil-outline" style={profilStyles.editIcon} />
            </TouchableOpacity>
          </View>

          <Text style={profilStyles.label}>Nouveau mot de passe</Text>
          <View style={profilStyles.inputRow}>
            <TextInput
              ref={passwordRef}
              style={profilStyles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Laisser vide pour ne pas changer"
              placeholderTextColor="#ccc"
              secureTextEntry
            />
            <TouchableOpacity onPress={() => passwordRef.current?.focus()}>
              <Ionicons name="pencil-outline" style={profilStyles.editIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={profilStyles.button} onPress={handleSave} disabled={saving}>
            <Text style={profilStyles.buttonText}>{saving ? "Sauvegarde..." : "Enregistrer"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}