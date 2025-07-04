import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
//import {createNativeStackNavigator} from "@react-navigation/native-stack"
import Page from "./app/index";
import Accueil from "./app/pages/accueil";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Finance" component={Page} />
        <Stack.Screen name="Accueil" component={Accueil} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}