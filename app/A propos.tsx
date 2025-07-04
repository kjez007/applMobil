import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">A propos de l'application</ThemedText>
      </ThemedView>
      <ThemedText>  Presentation de l'application</ThemedText>
      <Collapsible title="I.	  CONTEXTE ET OBJECTIFS">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Il s’agit d’une application de gestion du budget personnel. Elle s’adresse a tout le monde (étudiants, salaries, entrepreneurs, etc.).</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">Cette application permettra aux utilisateurs de suivre leurs dépenses et revenus, de mieux gérer leur argent au quotidien, d’épargner, et de personnaliser leur expérience en fonction de leur mode de vie. </ThemedText>
        </ThemedText>
      </Collapsible>
      <Collapsible title="II.	DESCRIPTION FONCTIONNELLE">
          <ThemedText type="defaultSemiBold">
            1.	Inscription / Connexion : Authentification des utilisateurs avec email /téléphone et mot de passe
          </ThemedText>
        <ThemedText> 
          2.	Profil utilisateur : Gestion et mise a jour du profil
        </ThemedText>
        <ThemedText> 
          3.	Tableau de bord : Vue d’ensemble des revenus, dépenses et solde actuell
        </ThemedText>
        <ThemedText> 
          4.	Ajout de revenus : Enregistrer facilement toutes les sources de revenus
        </ThemedText>
      </Collapsible>
      <Collapsible title="III.	Spécifications techniques ">
        <ThemedText type="defaultSemiBold">•	Plateformes cibles : Android et iOS</ThemedText>
        <ThemedText type="defaultSemiBold">•	Technologies recommandées : {"\n"}
            🗡	Frontend : React Native {"\n"}
            🗡	Backend : Node.js {"\n"}
            🗡	Base de données : PostgreSQL {"\n"}
        </ThemedText>
      </Collapsible>
      <Collapsible title="IV.	CONTRAINTES ET PREREQUIS">
      <ThemedText type="defaultSemiBold">
        •	Respect des réglementations en matière de protection des données personnelles (RGPD) {"\n"}
        •	Tests utilisateurs pour valider l’ergonomie et l’expérience utilisateur {"\n"}
        •	Intégration d’un système de sécurité robuste pour protéger les données financières {"\n"}
      </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
