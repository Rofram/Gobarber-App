import React, { useCallback, useRef, useContext } from "react";
import {
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Platform,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { KeyboardContext } from '../../contexts/KeyboardContext';

import { useAuth } from '../../hooks/Auth'

import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

import LogoImg from "../../assets/images/logo.png";

import * as S from './styles';
import api from "../../services/api";

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn = () => {
  const formRef = useRef<FormHandles>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { keyboardIsOpen } = useContext(KeyboardContext);

  const navigation = useNavigation();

  const { signIn } = useAuth();

  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string().required('E-mail obrigatório').email('Digite um email valido'),
          password: Yup.string().required('Senha obrigatória'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await signIn({
          email: data.email,
          password: data.password,
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }
        Alert.alert('Erro na autenticação', 'Ocorreu um erro ao fazer login, cheque as credencias.');
      }
    },
    [signIn],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <S.Container>
            <Image source={LogoImg} />

            <View>
              <S.Title>Faça seu logon</S.Title>
            </View>

            <Form
              onSubmit={handleSignIn}
              ref={formRef}
              style={{ width: '100%' }}
            >
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Senha"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button onPress={() => {
                formRef.current?.submitForm();
              }}>Entrar</Button>
            </Form>

            <S.ForgotPassword onPress={() => console.log('clicou em recuperar senha')}>
              <S.ForgotPasswordText>Esqueci minha senha</S.ForgotPasswordText>
            </S.ForgotPassword>
          </S.Container>
        </ScrollView>
      </KeyboardAvoidingView>

      {!keyboardIsOpen && (
        <S.CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
          <>
            <Icon name="log-in" size={20} color="#ff9000" />
            <S.CreateAccountButtonText>Criar conta</S.CreateAccountButtonText>
          </>
        </S.CreateAccountButton>
      )}
    </>
  );
};

export default SignIn;