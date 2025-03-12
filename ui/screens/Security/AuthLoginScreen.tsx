import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { login } from '../../components/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthLoginScreenProps {
  onLogin?: (token: string) => void;
    navigation?: any;
  }

const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loginFunc = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      await AsyncStorage.setItem('token', response.token);
      if (onLogin) {
        onLogin(response.token);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Электронная почта</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Пароль</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
        onPress={!loading ? loginFunc : undefined}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Войти</Text>
        )}
      </Pressable>
      <Pressable style={styles.buttonRegister}>
        <Text style={styles.registerText} onPress={() => navigation.navigate('AuthRegister')}>Зарегистрироваться</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonRegister: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default AuthLoginScreen;
