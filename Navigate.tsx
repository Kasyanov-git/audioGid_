import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, Route, useTheme } from '@react-navigation/native';
import { Text } from '@react-navigation/elements';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './ui/screens/HomeScreen';
import MapScreen from './ui/screens/MapScreen';
import NavigatorScreen from './ui/screens/NavigatorScreen';
import ProfileScreen from './ui/screens/ProfileScreen';
import AuthLoginScreen from './ui/screens/Security/AuthLoginScreen';
import AuthRegisterScreen from './ui/screens/Security/AuthRegisterScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MyTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {state.routes.map((route: Route<string>, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={route.key}
            style={styles.button}
            onTouchStart={onPress}
          >
            <Text style={{ color: isFocused ? colors.primary : colors.text }}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export const MainApp = () => (
  <Tab.Navigator
    tabBar={(props) => <MyTabBar {...props} />}
    screenOptions={{ headerShown: false }}
    >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Navigator" component={NavigatorScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const Navigate: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthLoginScreen {...props} onLogin={() => setIsAuthenticated(true)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="AuthRegister">
              {(props) => (
                <AuthRegisterScreen
                  {...props}
                  onRegister={() => props.navigation.navigate('Auth')}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="MainApp" component={MainApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
});

export default Navigate;
