import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AboutScreen() {
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
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">À propos</ThemedText>
      </ThemedView>

      <ThemedText type="defaultSemiBold">
        Votre allié au quotidien pour mieux gérer vos finances personnelles.
      </ThemedText>

      <Collapsible title="🎯 Notre mission">
        <ThemedText>
          Chez <ThemedText style={styles.bold}>BudgetMaster</ThemedText>, nous croyons que chaque centime compte.
          C’est pourquoi nous avons créé une application simple, intuitive et puissante pour vous aider à :
        </ThemedText>
        <ThemedText>• Suivre vos revenus et vos dépenses</ThemedText>
        <ThemedText>• Planifier vos budgets mensuels</ThemedText>
        <ThemedText>• Analyser vos habitudes de consommation</ThemedText>
        <ThemedText>• Atteindre vos objectifs d’épargne</ThemedText>
      </Collapsible>

      <Collapsible title="📱 Pourquoi choisir BudgetMaster ?">
        <ThemedText>• Interface intuitive et facile à utiliser</ThemedText>
        <ThemedText>• Notifications intelligentes pour vous alerter</ThemedText>
        <ThemedText>• Sécurité de vos données garantie</ThemedText>
        <ThemedText>• Graphiques clairs pour une meilleure visualisation</ThemedText>
      </Collapsible>

      <Collapsible title="🔒 Vie privée">
        <ThemedText>
          Nous attachons une grande importance à la confidentialité de vos données. Aucune information personnelle
          n’est vendue ni partagée sans votre consentement.
        </ThemedText>
      </Collapsible>

      <Collapsible title="🛠 En constante évolution">
        <ThemedText>
          Votre retour compte ! Nous travaillons activement à l’amélioration de l’application avec de nouvelles
          fonctionnalités à venir :
        </ThemedText>
        <ThemedText>• Synchronisation multi-appareils</ThemedText>
        <ThemedText>• Export des données en PDF/Excel</ThemedText>
        <ThemedText>• Conseils budgétaires intelligents grâce à l’IA</ThemedText>
      </Collapsible>

      <Collapsible title="🤝 Contact">
        <ThemedText>Une question, une suggestion ou un bug ?</ThemedText>
        <ThemedText>📧 Email : elvinzozo007@gmail.com</ThemedText>
        <ThemedText>📧 Email : brayanduchiwa123@gmail.com</ThemedText>
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
  bold: {
    fontWeight: 'bold',
  },
});