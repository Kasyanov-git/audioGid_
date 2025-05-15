import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { login } from '../../components/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../../theme';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import LockIcon from '../../../assets/images/icons/lock-icon.svg';
import EmailIcon from '../../../assets/images/icons/email-icon.svg';
import GoogleIcon from '../../../assets/images/icons/google-icon.svg';

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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#2196F3', '#13578D']} style={styles.containerBackground}>
        {/* <View style={styles.mainTitleContainer}>
          <Text style={styles.mainTitle}>Привет!</Text>
          <Text style={styles.mainSubTitle}>Добро пожаловать в AI Guide</Text>
        </View> */}
      </LinearGradient>
      <View style={styles.containerLogin}>
        <Text style={styles.titleLogin}>Вход</Text>
        <View style={styles.inputEmailContainer}>
          <EmailIcon width={24} height={24} />
          <TextInput
            style={styles.input}
            placeholder="Введите email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputPasswordContainer}>
          <LockIcon width={24} height={24} />
          <TextInput
            style={styles.input}
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Не помню пароль</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={!loading ? loginFunc : undefined}>
          <LinearGradient colors={['#2196F3', '#13578D']} style={styles.buttonLogin}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonLoginText}>Войти</Text>
          )}
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.altLoginTitleContainer}>
          <Text style={styles.altLoginTitle}>Или войдите через</Text>
        </View>
        <View style={styles.altLoginContainer}>
          <TouchableOpacity>
            <View style={styles.googleLoginContainer}>
              <GoogleIcon width={32} height={32} />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.registerTextContainer} onPress={() => navigation.navigate('AuthRegister')}>
          <Text style={styles.registerText1}>Еще нет аккаунта?</Text>
          <Text style={styles.registerText2}>Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  mainTitleContainer: {
    position: 'absolute',
    top: 144,
    left: 16,
    flexDirection: 'column',
  },
  mainTitle: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: 600,
  },
  mainSubTitle: {
    fontSize: 20,
    color: '#EBEFEE',
  },
  containerLogin: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 34,
    backgroundColor: '#EBEFEE',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleLogin: {
    color: theme.colors.primary,
    fontSize: 32,
    // fontFamily: theme.fonts.bold,
    fontWeight: 600,
    lineHeight: 32,
    marginTop: 40,
  },
  inputEmailContainer: {
    marginTop: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    // paddingTop: 8,
    // paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputPasswordContainer: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    // paddingTop: 8,
    // paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 52,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text2,
  },
  forgotPasswordContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 600,
  },
  buttonLogin: { 
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    height: 52,
  },
  buttonLoginText: {
    color: '#fff',
    fontFamily: theme.fonts.bold,
    fontSize: 20,
  },
  registerText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  altLoginTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  altLoginTitle: {
    color: theme.colors.text2,
    fontSize: 14,
  },
  altLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  googleLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  registerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 4,
    marginBottom: 10,
  },
  registerText1: {
    color: theme.colors.text2,
    // fontFamily: theme.fonts.bold,
    fontWeight: 600,
    fontSize: 14,
  },
  registerText2: {
    color: theme.colors.primary,
    // fontFamily: theme.fonts.bold,
    fontWeight: 600,
    fontSize: 14,
  },
});

export default AuthLoginScreen;
