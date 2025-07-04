import { useRouter } from "expo-router";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Animated, Easing, FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../../services/firebase";
import styles from "../../css/autrescss/budget";

const numColumns = 3;

export default function Suivi() {
  const [projets, setProjets] = useState<any[]>([]);
  const [bourse, setBourse] = useState(0);
  const [bourseInput, setBourseInput] = useState("");
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);
  const [userName, setUserName] = useState("Utilisateur");
  const [photoURL, setPhotoURL] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const progressAnim = useState(new Animated.Value(1))[0];
  const router = useRouter(); // Ajout du hook router

  useEffect(() => {
    const fetchProjets = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const q = query(collection(db, "projets"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        const projetsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          montantActuel: parseFloat(doc.data().montantActuel) || parseFloat(doc.data().montant) || 0,
          versement: "",
          retrait: "",
        }));
        setProjets(projetsData);

        const userDoc = await getDoc(doc(db, "clients", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data?.name || "Utilisateur");
          setPhotoURL(data?.photoURL || "");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
      }
    };

    const listenBourse = () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const clientRef = doc(db, "clients", uid);
      return onSnapshot(clientRef, (docSnapshot) => {
        const data = docSnapshot.data();
        if (data?.bourse !== undefined) {
          setBourse(parseFloat(data.bourse));
        }
      });
    };

    fetchProjets();
    const unsubscribe = listenBourse();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showNotification = (message: string, isError: boolean) => {
    setNotification({ message, isError });
    fadeAnim.setValue(0);
    progressAnim.setValue(1);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setNotification(null);
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.log("Utilisateur non connecté");
        return;
      }

      // Récupérer le montantActuel et le nom du projet avant suppression
      const projetRef = doc(db, "projets", id);
      const projetDoc = await getDoc(projetRef);
      const montantActuel = projetDoc.exists() ? parseFloat(projetDoc.data().montantActuel) || 0 : 0;
      const nomProjet = projetDoc.data()?.nom || `Projet ${id.substring(0, 8)}`;

      const userDocRef = doc(db, "clients", uid);
      await updateDoc(userDocRef, {
        projets: increment(-1),
      });

      await deleteDoc(projetRef);
      setProjets(projets.filter((projet) => projet.id !== id));

      // Ajouter le montantActuel à la bourse
      const newBourse = bourse + montantActuel;
      await updateDoc(userDocRef, { bourse: newBourse });
      setBourse(newBourse);

      // Enregistrer dans l'historique avec un message personnalisé
      await addDoc(collection(db, "historique"), {
        uid,
        nom: "Projet supprimé", // Nom remplacé par un message
        operation: "suppression",
        montant: montantActuel,
        date: new Date().toISOString(), // Date de suppression
        message: `${nomProjet} a été supprimé`, // Message indiquant la suppression
      });

      showNotification(`Projet supprimé avec succès ! ${montantActuel.toFixed(2)} FCFA ajoutés à la bourse. Nouveau total : ${newBourse.toFixed(2)} FCFA`, false);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      showNotification("Erreur lors de la suppression du projet.", true);
    }
  };

  const handleVersement = async (id: string, montant: string) => {
    const nouveauMontant = parseFloat(montant) || 0;
    try {
      if (nouveauMontant > bourse) {
        showNotification("Le versement dépasse la bourse actuelle (" + bourse.toFixed(2) + " FCFA).", true);
        return;
      }

      const projetRef = doc(db, "projets", id);
      const projet = projets.find((p) => p.id === id);
      const nouveauMontantActuel = (projet?.montantActuel || 0) + nouveauMontant;
      await updateDoc(projetRef, { montantActuel: nouveauMontantActuel });
      setProjets(projets.map((projet) =>
        projet.id === id ? { ...projet, montantActuel: nouveauMontantActuel, versement: "" } : projet
      ));

      const uid = auth.currentUser?.uid;
      if (uid) {
        const clientDocRef = doc(db, "clients", uid);
        const newBourse = Math.max(0, bourse - nouveauMontant);
        await updateDoc(clientDocRef, { bourse: newBourse });
        setBourse(newBourse);

        await addDoc(collection(db, "historique"), {
          uid,
          nom: projet?.nom || `Projet ${id.substring(0, 8)}`,
          operation: "versement",
          montant: nouveauMontant,
          date: new Date().toISOString(),
        });
      }
      showNotification("Versement de " + nouveauMontant.toFixed(2) + " FCFA effectué avec succès !", false);
    } catch (error) {
      console.error("Erreur lors du versement :", error);
      showNotification("Erreur lors du versement.", true);
    }
  };

  const handleRetrait = async (id: string, montant: string) => {
    const nouveauMontant = parseFloat(montant) || 0;
    try {
      const projet = projets.find((p) => p.id === id);
      const montantActuel = projet?.montantActuel || 0;
      if (nouveauMontant > montantActuel) {
        showNotification("Le retrait dépasse le montant actuel (" + montantActuel.toFixed(2) + " FCFA).", true);
        return;
      }

      const projetRef = doc(db, "projets", id);
      const nouveauMontantActuel = Math.max(0, montantActuel - nouveauMontant);
      await updateDoc(projetRef, { montantActuel: nouveauMontantActuel });
      setProjets(projets.map((projet) =>
        projet.id === id ? { ...projet, montantActuel: nouveauMontantActuel, retrait: "" } : projet
      ));

      const uid = auth.currentUser?.uid;
      if (uid) {
        const clientDocRef = doc(db, "clients", uid);
        const newBourse = bourse + nouveauMontant;
        await updateDoc(clientDocRef, { bourse: newBourse });
        setBourse(newBourse);

        await addDoc(collection(db, "historique"), {
          uid,
          nom: projet?.nom || `Projet ${id.substring(0, 8)}`,
          operation: "retrait",
          montant: nouveauMontant,
          date: new Date().toISOString(),
        });
      }
      showNotification("Retrait de " + nouveauMontant.toFixed(2) + " FCFA effectué avec succès !", false);
    } catch (error) {
      console.error("Erreur lors du retrait :", error);
      showNotification("Erreur lors du retrait.", true);
    }
  };

  const handleBourseUpdate = async () => {
    const ajout = parseFloat(bourseInput) || 0;
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const clientDocRef = doc(db, "clients", uid);
        const nouvelleBourse = bourse + ajout;
        await updateDoc(clientDocRef, { bourse: nouvelleBourse });
        setBourse(nouvelleBourse);
        setBourseInput("");

        await addDoc(collection(db, "historique"), {
          uid,
          nom: "Bourse générale",
          operation: "modification",
          montant: ajout,
          date: new Date().toISOString(),
        });

        showNotification("Bourse augmentée de " + ajout.toFixed(2) + " FCFA. Nouveau total : " + nouvelleBourse.toFixed(2) + " FCFA !", false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la bourse :", error);
      showNotification("Erreur lors de la mise à jour de la bourse.", true);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const calculateFinalAmount = () => {
      if (!item.montant) return 0;
      const amount = parseFloat(item.montant);
      const durationMonths = item.duree || 1;
      const frequencyMap: Record<string, number> = {
        heure: 1,
        jour: 24,
        semaine: 168,
        mois: 504,
      };
      const hoursPerFrequency = frequencyMap[item.frequence as string] || 24;
      const totalHours = durationMonths * (504 / hoursPerFrequency);
      return (amount * totalHours).toFixed(2);
    };

    const priorityAmount = item.typeRaison === "gestion" && item.priorityActivity && item.montantActuel
      ? (item.montantActuel * 0.4).toFixed(2)
      : "0.00";
    const remainingAmount = item.typeRaison === "gestion" && item.priorityActivity && item.montantActuel && item.activities
      ? ((item.montantActuel * 0.6) / (item.activities.length - 1)).toFixed(2)
      : "0.00";

    return (
      <View
        style={{
          flex: 1,
          margin: 8,
          backgroundColor: "#fff",
          borderRadius: 8,
          padding: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          minHeight: 400,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Colonne gauche : Informations principales */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1A9EAA", marginBottom: 6 }}>
              {item.nom || `Projet ${item.id.substring(0, 8)}...`}
            </Text>
            <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Raison : </Text>
              {item.typeRaison === "caisse" ? "Caisse" : "Gestion"}
            </Text>
            <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Montant initial : </Text>
              {item.montant ? `${item.montant} FCFA` : "-"}
            </Text>
            <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Montant actuel : </Text>
              {item.montantActuel ? `${item.montantActuel.toFixed(2)} FCFA` : "0.00 FCFA"}
            </Text>
            <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
              <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Somme : </Text>
              {item.montant ? `${calculateFinalAmount()} FCFA` : "-"}
            </Text>
            {item.typeRaison === "gestion" && (
              <>
                <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Montant minimum : </Text>
                  {item.minAmount !== null && item.minAmount !== undefined ? `${item.minAmount} FCFA` : "-"}
                </Text>
                <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
                  <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Montant maximum : </Text>
                  {item.maxAmount !== null && item.maxAmount !== undefined ? `${item.maxAmount} FCFA` : "-"}
                </Text>
                {item.priorityActivity && (
                  <Text style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2, textAlign: "center" }}>
                    <Text style={{ fontWeight: "bold", color: "#1A9EAA" }}>Activité prioritaire : </Text>
                    {item.priorityActivity} : {priorityAmount} FCFA
                  </Text>
                )}
              </>
            )}
            <Text style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
              Créé le : {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {/* Colonne droite : Activités avec montant */}
          {item.typeRaison === "gestion" && item.activities && item.activities.length > 0 && (
            <View style={{ flex: 1, marginLeft: 12 }}>
              {item.activities.map((activity: string, index: number) => (
                <Text key={index} style={{ fontSize: 12, color: "#0A6C74", marginBottom: 2 }}>
                  - {activity} : {activity === item.priorityActivity ? priorityAmount : remainingAmount} FCFA
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={{ marginTop: 12 }}>
          <TextInput
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 6, marginBottom: 6 }}
            keyboardType="numeric"
            placeholder="Versement (FCFA)"
            value={item.versement}
            onChangeText={(text) => setProjets(projets.map((p) => (p.id === item.id ? { ...p, versement: text } : p)))}
          />
          <TouchableOpacity
            style={{ backgroundColor: "#4CAF50", padding: 6, borderRadius: 4, alignItems: "center", marginBottom: 6 }}
            onPress={() => handleVersement(item.id, item.versement)}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>Ajouter Versement</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TextInput
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 6, marginBottom: 6 }}
            keyboardType="numeric"
            placeholder="Retrait (FCFA)"
            value={item.retrait}
            onChangeText={(text) => setProjets(projets.map((p) => (p.id === item.id ? { ...p, retrait: text } : p)))}
          />
          <TouchableOpacity
            style={{ backgroundColor: "#F44336", padding: 6, borderRadius: 4, alignItems: "center" }}
            onPress={() => handleRetrait(item.id, item.retrait)}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>Effectuer Retrait</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: "#FF4444", padding: 6, borderRadius: 4, alignItems: "center", marginTop: 12 }}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={{ color: "#fff", fontSize: 12 }}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6fafd", flexDirection: "row" }}>
      {/* Section à gauche pour la photo et le nom */}
      <View style={{ width: 100, padding: 10, alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.push("/pages/profil")}>
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
        {/* Bouton retour accueil */}
        <TouchableOpacity
          style={{
            marginTop: 18,
            backgroundColor: "#1A9EAA",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
          onPress={() => router.push("/pages/accueil")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Accueil</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal à droite */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "center" }}>
          <Text style={styles.sectionTitle}>Suivi de vos projets</Text>
        </View>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1A9EAA", marginRight: 10 }}>
            Bourse totale : {bourse.toFixed(2)} FCFA
          </Text>
          <TextInput
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 18,
              borderWidth: 1,
              borderColor: "#1A9EAA",
              color: "#0A6C74",
              fontWeight: "bold",
              fontSize: 16,
              textAlign: "center",
              width: 180,
            }}
            keyboardType="numeric"
            placeholder="Modifier Bourse (FCFA)"
            value={bourseInput}
            onChangeText={setBourseInput}
          />
          <TouchableOpacity
            style={{ backgroundColor: "#4CAF50", padding: 8, borderRadius: 4, alignItems: "center", marginTop: 8 }}
            onPress={handleBourseUpdate}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>Mettre à jour</Text>
          </TouchableOpacity>
        </View>
        {notification && (
          <Animated.View
            style={{
              position: "absolute",
              bottom: 20,
              width: 450,
              height: 70,
              backgroundColor: notification.isError ? "#F44336" : "#4CAF50",
              padding: 5,
              borderRadius: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: "#fff", fontSize: 15, textAlign: "center", paddingBottom: 5, maxWidth: "90%" }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {notification.message}
            </Text>
            <View style={{ width: "100%", height: 10, backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: 1, overflow: "hidden" }}>
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: "#fff",
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>
          </Animated.View>
        )}
        <FlatList
          data={projets}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={
            <Text style={{ fontSize: 16, color: "#0A6C74", textAlign: "center", marginTop: 20 }}>
              Aucun projet trouvé.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}