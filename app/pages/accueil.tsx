import { Ionicons } from "@expo/vector-icons"; // Ajout de l'icône
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { auth, getClients } from "../../services/firebase";
import styles from "../css/accueilCss";

export default function Suivant() {
  const router = useRouter();
  const [Clients, setClients] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const client = await getClients(uid);
        setClients(client);
      }
    };
    fetchUserData();
  }, []);
  return (
    <View style={styles.body}>
      <View style={styles.header}>
        {/* Icône profil en haut à droite */}
        <TouchableOpacity
          style={{ position: "absolute", top: 0, right: -60, padding: 8, zIndex: 10 }}
          onPress={() => router.push("/pages/profil")}
        >
          <Ionicons name="person-circle-outline" size={40} color="#fff" />
        </TouchableOpacity>
        {Clients && (
          <View style={styles.clientInfoBox}>
            <TouchableOpacity onPress={() => router.push("/pages/profil")}>
              <Text style={styles.clientInfoText}>
                Bienvenue, {Clients.name} ({Clients.email}) !
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.title}>Découvrez nos fonctionnalités</Text>
        <Text style={styles.subtitle}>
          Des outils puissants pour simplifier votre gestion financière.
        </Text>
      </View>
      <View style={styles.features}>
        <TouchableOpacity
          style={styles.featureItem}
          activeOpacity={0.8} // Réduit l'opacité au clic
          onPress={() =>  router.push("/pages/autres/mon_budget")}
        >
          <Text style={styles.featureTitle}>Budgeting intelligent</Text>
          <Text style={styles.featureDescription}>
            Créez et suivez votre budget facilement avec des recommandations personnalisées.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureItem}
          activeOpacity={0.8}
          onPress={() =>  router.push("/pages/autres/suivi")}
        >
          <Text style={styles.featureTitle}>Suivi des dépenses et Retrait</Text>
          <Text style={styles.featureDescription}>
            Analysez vos dépenses et identifiez les opportunités d'économies.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.featureItem}
          activeOpacity={0.8}
          onPress={() => router.push("/pages/autres/historique")} // Ajout de la navigation vers historique
        >
          <Text style={styles.featureTitle}>Mes Activites</Text>
          <Text style={styles.featureDescription}>
            Consultez l'historique de vos épargnes et versements pour une meilleure gestion.
          </Text>
        </TouchableOpacity>
        
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={() =>  router.push("/(tabs)/explore")}>En savoir plus</Text>
      </TouchableOpacity>
    </View>
  );
}