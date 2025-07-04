import { useRouter } from "expo-router"; // Ajout pour la navigation
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../../services/firebase";
import historiqueStyles from "../../css/autrescss/historiqueCss";

// Exportation par défaut du composant
export default function Historique() {
  const [historique, setHistorique] = useState<any[]>([]);
  const [userName, setUserName] = useState("Utilisateur");
  const [photoURL, setPhotoURL] = useState("");
  const router = useRouter(); // Ajout du hook router

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Récupérer les infos utilisateur
    const fetchUserInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, "clients", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data?.name || "Utilisateur");
          setPhotoURL(data?.photoURL || "");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des infos utilisateur :", error);
      }
    };
    fetchUserInfo();

    // Écouter les changements dans la collection historique
    const q = query(collection(db, "historique"), where("uid", "==", uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const historiqueData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistorique(historiqueData);
      },
      (error) => {
        console.error("Erreur lors de la récupération de l'historique :", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Grouper les opérations par nom de projet
  const groupedHistorique = historique.reduce((acc, item) => {
    (acc[item.nom] = acc[item.nom] || []).push(item);
    return acc;
  }, {} as { [key: string]: any[] });

  const renderItem = ({ item }: { item: any }) => {
    const isSuppression = item.message && item.message.includes("a été supprimé");
    const displayMontant =
      item.montant !== undefined && item.montant !== null
        ? parseFloat(item.montant).toFixed(2)
        : "0.00";
    return (
      <View style={historiqueStyles.historyItem}>
        <Text style={historiqueStyles.historyText}>
          {item.operation} - {displayMontant} FCFA
          {isSuppression && (
            <>
              {" (Montant restituer a la bourse) "}
              {"  Date de suppression: "}
              {new Date(item.date).toLocaleDateString()}
            </>
          )}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6fafd", padding: 12 }}>
      {/* Section à gauche pour la photo et le nom */}
      <View style={{ alignItems: "center", marginBottom: 18 }}>
        <TouchableOpacity onPress={() => router.push("/pages/profil")}>
          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              style={{ width: 70, height: 70, borderRadius: 35, marginBottom: 5 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={historiqueStyles.noDataText}>Pas de photo</Text>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: "#0A6C74", fontWeight: "bold" }}>{userName}</Text>
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <View>
          <Text style={historiqueStyles.sectionTitle}>Votre Historique </Text>
          {Object.keys(groupedHistorique).map((projetNom) => (
            <View key={projetNom} style={historiqueStyles.projectSection}>
              <Text style={historiqueStyles.projectTitle}>{projetNom}</Text>
              <FlatList
                data={groupedHistorique[projetNom]}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={historiqueStyles.historyItem}
              />
            </View>
          ))}
          {Object.keys(groupedHistorique).length === 0 && (
            <Text style={historiqueStyles.noDataText}>Aucun historique trouvé.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}