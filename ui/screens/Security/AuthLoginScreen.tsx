import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';

const defaultUser = { email: 'user@example.com', password: 'password123' };

interface AuthLoginScreenProps {
    onLogin?: () => void;
  }

const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const loginFunc = () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (email === defaultUser.email && password === defaultUser.password) {
        Alert.alert('Успешный вход');
        if (onLogin) {
          onLogin();
        }
      } else {
        Alert.alert('Неверный email или пароль');
      }
      setLoading(false);
    }, 1000);
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
      {/* <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
          loading && { backgroundColor: '#aaa' },
        ]}
        onPress={!loading ? loginFunc : undefined}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Загрузка...' : 'Войти'}
        </Text>
      </Pressable> */}
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
    </View>
  );
}

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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AuthLoginScreen;
