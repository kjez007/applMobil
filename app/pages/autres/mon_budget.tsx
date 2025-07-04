import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, increment, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../../services/firebase";
import styles from "../../css/autrescss/budget";

export default function BudgetForm() {
  const [typeRaison, setTypeRaison] = useState("caisse");
  const [montant, setMontant] = useState("");
  const [duree, setDuree] = useState("");
  const [frequence, setFrequence] = useState("jour");
  const [projetNom, setProjetNom] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [userName, setUserName] = useState("Utilisateur");
  const [activities, setActivities] = useState<string[]>([]); // Liste des noms d'activités
  const [newActivity, setNewActivity] = useState(""); // Champ pour le nom de la nouvelle activité
  const [showNewActivityInput, setShowNewActivityInput] = useState(false); // Contrôle l'affichage du champ
  const [activityToRemove, setActivityToRemove] = useState(""); // Pour sélectionner l'activité à supprimer
  const [priorityActivity, setPriorityActivity] = useState(""); // Activité prioritaire

  const screenWidth = Dimensions.get("window").width;
  const isLargeScreen = screenWidth > 700;
  const router = useRouter();

  const raisonLabel = typeRaison === "caisse" ? "Caisse" : "Gestion budgétaire";

  useEffect(() => {
    const fetchUserInfo = async () => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const userDoc = await getDoc(doc(db, "clients", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data?.name || "Utilisateur");
          setPhotoURL(data?.photoURL || "");
        }
      }
    };
    fetchUserInfo();
  }, []);

  const handleAddActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()]);
      setNewActivity(""); // Réinitialiser le champ
      setShowNewActivityInput(false); // Masquer le champ après ajout
    }
  };

  const handleRemoveActivity = () => {
    if (activityToRemove) {
      const updatedActivities = activities.filter((act) => act !== activityToRemove);
      setActivities(updatedActivities);
      // Désélectionner l'activité prioritaire si elle est supprimée
      if (priorityActivity === activityToRemove) setPriorityActivity("");
      setActivityToRemove(""); // Réinitialiser la sélection
    }
  };

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.log("Utilisateur non connecté");
      return;
    }

    try {
      const montantActuel = montant ? parseFloat(montant) : 0; // Montant actuel = montant saisi
      const projetData = {
        uid,
        typeRaison,
        montant: montantActuel,
        montantActuel: montantActuel, // Ajout explicite de montantActuel dans projets
        frequence,
        duree: duree ? parseInt(duree) : 0,
        activities: activities.length > 0 ? activities : null,
        priorityActivity: activities.length > 0 && priorityActivity ? priorityActivity : null, // Activité prioritaire
        createdAt: new Date().toISOString(),
        nom: projetNom || `Projet ${new Date().toISOString().substring(0, 10)}`,
      };
      const projetRef = await addDoc(collection(db, "projets"), projetData);

      const userDocRef = doc(db, "clients", uid);
      await updateDoc(userDocRef, {
        projets: increment(1),
      });

      // Ajout dans la collection historique avec montant = montantActuel
      await addDoc(collection(db, "historique"), {
        uid,
        nom: projetData.nom,
        operation: "création",
        montant: montantActuel, // Stocke montantActuel comme montant
        date: projetData.createdAt,
        projetId: projetRef.id,
      });

      setMontant("");
      setDuree("");
      setFrequence("jour");
      setProjetNom("");
      setActivities([]);
      setNewActivity("");
      setShowNewActivityInput(false);
      setPriorityActivity("");

      router.push("/pages/autres/suivi");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
    }
  };

  const calculateFinalAmount = () => {
    if (!montant) return 0;
    const amount = parseFloat(montant);
    const durationMonths = duree ? parseInt(duree) : 1;
    const hoursPerFrequency = {
      heure: 1,
      jour: 24,
      semaine: 168,
      mois: 504,
    }[frequence] ?? 24;
    const totalHours = durationMonths * (504 / hoursPerFrequency);
    return amount * totalHours;
  };

  const finalAmount = calculateFinalAmount().toFixed(2);

  const handlePhotoPress = () => {
    router.push("/pages/profil");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6fafd", flexDirection: "row" }}>
      {/* Section à gauche pour la photo et le nom */}
      <View style={{ width: 100, padding: 10, alignItems: "center" }}>
        <TouchableOpacity onPress={handlePhotoPress}>
          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                marginBottom: 5,
              }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 14, marginBottom: 5 }}>Pas de photo</Text>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: "#000", textAlign: "center" }}>{userName}</Text>
      </View>

      {/* Contenu principal décalé à droite */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        style={{ flex: 1, marginLeft: 10 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={{ flexDirection: isLargeScreen ? "row" : "column", padding: 24 }}>
          <View style={{ width: isLargeScreen ? "60%" : "100%" }}>
            <Text style={styles.sectionTitle}>Fais un projet {userName}</Text>

            <Text style={styles.label}>Nom du projet</Text>
            <TextInput
              placeholder="Entrez un nom pour le projet"
              value={projetNom}
              onChangeText={setProjetNom}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.sectionTitle}>Partie obligatoire</Text>
            <Text style={styles.label}>Raison du dépôt</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={typeRaison}
                onValueChange={setTypeRaison}
                style={styles.picker}
                dropdownIconColor="#1A9EAA"
              >
                <Picker.Item label="Caisse" value="caisse" />
                <Picker.Item label="Gestion budgétaire" value="gestion" />
              </Picker>
            </View>
            <TextInput
              placeholder="Montant à verser"
              keyboardType="numeric"
              value={montant}
              onChangeText={setMontant}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.label}>Fréquence des versements</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={frequence}
                onValueChange={setFrequence}
                style={styles.picker}
                dropdownIconColor="#1A9EAA"
              >
                <Picker.Item label="Par heure" value="heure" />
                <Picker.Item label="Par jour" value="jour" />
                <Picker.Item label="Par semaine" value="semaine" />
                <Picker.Item label="Par mois" value="mois" />
              </Picker>
            </View>
            <Text style={styles.sectionTitle}>Partie facultative</Text>
            <Text style={styles.label}>Durée d'épargne (en mois)</Text>
            <TextInput
              placeholder="Combien de temps ?"
              keyboardType="numeric"
              value={duree}
              onChangeText={setDuree}
              style={styles.input}
              placeholderTextColor="#aaa"
            />

            {typeRaison === "gestion" && (
              <>
                <TouchableOpacity
                  style={[styles.button, { marginTop: 10, width: "50%" }]}
                  onPress={() => setShowNewActivityInput(true)}
                >
                  <Text style={styles.buttonText}>Ajouter une activité</Text>
                </TouchableOpacity>

                {showNewActivityInput && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>Nom de l'activité</Text>
                    <TextInput
                      placeholder="Entrez le nom de l'activité"
                      value={newActivity}
                      onChangeText={setNewActivity}
                      style={styles.input}
                      placeholderTextColor="#aaa"
                    />
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10, width: "50%" }]}
                      onPress={handleAddActivity}
                      disabled={!newActivity.trim()}
                    >
                      <Text style={styles.buttonText}>Valider l'ajout</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activities.length > 0 && (
                  <>
                    <Text style={[styles.label, { marginTop: 10 }]}>Choisir une activité prioritaire</Text>
                    <View style={styles.pickerBox}>
                      <Picker
                        selectedValue={priorityActivity}
                        onValueChange={setPriorityActivity}
                        style={styles.picker}
                        dropdownIconColor="#1A9EAA"
                      >
                        <Picker.Item label="Aucune priorité" value="" />
                        {activities.map((act, index) => (
                          <Picker.Item key={index} label={act} value={act} />
                        ))}
                      </Picker>
                    </View>

                    <Text style={[styles.label, { marginTop: 10 }]}>Supprimer une activité</Text>
                    <View style={styles.pickerBox}>
                      <Picker
                        selectedValue={activityToRemove}
                        onValueChange={setActivityToRemove}
                        style={styles.picker}
                        dropdownIconColor="#1A9EAA"
                      >
                        <Picker.Item label="Sélectionner une activité à supprimer" value="" />
                        {activities.map((act, index) => (
                          <Picker.Item key={index} label={act} value={act} />
                        ))}
                      </Picker>
                    </View>
                    <TouchableOpacity
                      style={[styles.button, { marginTop: 10, width: "50%" }]}
                      onPress={handleRemoveActivity}
                      disabled={!activityToRemove}
                    >
                      <Text style={styles.buttonText}>Supprimer l'activité</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Valider</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: isLargeScreen ? "33%" : "100%",
              marginTop: isLargeScreen ? 60 : 24,
              marginLeft: isLargeScreen ? 32 : 0,
              alignSelf: isLargeScreen ? "flex-start" : "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.10,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1A9EAA", marginBottom: 16 }}>Récapitulatif</Text>
              <Text style={{ fontSize: 15, color: "#0A6C74", marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Raison : </Text>
                {raisonLabel}
              </Text>
              <Text style={{ fontSize: 15, color: "#0A6C74", marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Montant : </Text>
                {montant ? montant + " FCFA" : "-"}
              </Text>
              <Text style={{ fontSize: 15, color: "#0A6C74", marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Fréquence : </Text>
                {frequence.charAt(0).toUpperCase() + frequence.slice(1)}
              </Text>
              <Text style={{ fontSize: 15, color: "#0A6C74", marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Durée : </Text>
                {duree ? duree + " mois" : "1 mois"}
              </Text>
              {typeRaison === "gestion" && activities.length > 0 && (
                <>
                  {activities.map((activity, index) => (
                    <Text key={index} style={{ fontSize: 15, color: "#0A6C74", marginBottom: 8 }}>
                      <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Activité {index + 1} : </Text>
                      {activity} {priorityActivity === activity ? "(Prioritaire)" : ""}
                    </Text>
                  ))}
                </>
              )}
              <Text style={{ fontSize: 15, color: "#0A6C74", marginBottom: 8 }}>
                <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Somme finale : </Text>
                {finalAmount !== "0.00" ? `${finalAmount} FCFA` : "-"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}