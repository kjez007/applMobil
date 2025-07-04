import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ImageBackground, Text, TouchableOpacity } from "react-native";
import styles from "../css/style";

//{ uri: "https://example.com/professional-background.jpg" }} utilise pour l'image 
export default function WelcomePage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <ImageBackground
      source={require("../../assets/images/adaptive-icon.png")} // Remplacez par l'URL de votre image
      style={styles.container}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>wallflow</Text>
        <Text style={styles.subtitle}>
          Simplifiez la gestion de vos finances avec des outils puissants et intuitifs.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/pages/inscription")} // Redirige vers la page d'inscription
        >
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );}