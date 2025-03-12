import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { register } from '../../components/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthRegisterScreenProps {
  onRegister?: () => void;
  navigation: any;
}

const AuthRegisterScreen: React.FC<AuthRegisterScreenProps> = ({ onRegister, navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const registerFunc = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, username, password);
      console.log('Ответ сервера:', response);
      Alert.alert('Успешная регистрация');
      if (onRegister) {
        onRegister();
      }
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
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
      <Text style={styles.label}>Никнейм</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите никнейм"
        value={username}
        onChangeText={setUsername}
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
      <Text style={styles.label}>Подтвердите пароль</Text>
      <TextInput
        style={styles.input}
        placeholder="Подтвердите пароль"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.7 },
        ]}
        onPress={!loading ? registerFunc : undefined}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Зарегистрироваться</Text>
        )}
      </Pressable>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.navigate('Auth')}
      >
        <Text style={styles.backButtonText}>Назад</Text>
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
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default AuthRegisterScreen;
