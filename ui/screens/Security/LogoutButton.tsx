import React from 'react';
import { Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';

interface LogoutButtonProps {
  navigation: NavigationProp<any>;
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
    const logoutFunc = async () => {
      try {
        await AsyncStorage.removeItem('token');
        onLogout();
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
      }
    };
  
    return <Button title="Выйти" onPress={logoutFunc} />;
  };
  

export default LogoutButton;