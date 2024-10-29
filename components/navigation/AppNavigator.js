// navigation/AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import ExploreScreen from '../tabs/Explore'; // Шлях до файлу Explore в папці tabs
import OtherScreen from '../screens/OtherScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Explore"> {/* Встановлюємо як початковий екран */}
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="OtherScreen" component={OtherScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
