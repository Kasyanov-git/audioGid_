import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LogoutButton from './Security/LogoutButton';

interface ProfileScreenProps {
  navigation: any;
  onLogout: () => void;
}

function ProfileScreen({ navigation, onLogout }: ProfileScreenProps): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={styles.textStyle}>Hello, World!</Text>
        </View>
      </View>
      <LogoutButton navigation={navigation} onLogout={onLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 26,
    color: 'black',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 20,
    left: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default ProfileScreen;