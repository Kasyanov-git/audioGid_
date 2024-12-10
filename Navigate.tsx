import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from './ui/screens/HomeScreen';
import MapScreen from './ui/screens/MapScreen';
import NavigatorScreen from './ui/screens/NavigatorScreen';
import ProfileScreen from './ui/screens/ProfileScreen';

const MyTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title ?? route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.button}
          >
            <Text style={{ color: isFocused ? colors.primary : colors.text }}>
                {typeof label === 'function'
                    ? label({ focused: isFocused, color: colors.text, position: 'below-icon', children: '' })
                    : label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
};

const Tab = createBottomTabNavigator();

const Navigate: React.FC = () => {
  return (
    <NavigationContainer>
        <Tab.Navigator tabBar={(props) => <MyTabBar {...props} />}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Navigator" component={NavigatorScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
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
