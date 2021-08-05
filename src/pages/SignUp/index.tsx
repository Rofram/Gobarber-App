import React, { useCallback, useRef, useContext } from "react";
import Icon from 'react-native-vector-icons/Feather';
import { 
  Image, 
  KeyboardAvoidingView, 
  ScrollView, 
  TextInput, 
  View, 
  Platform, 
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import api from '../../services/api';

import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';

import { KeyboardContext } from '../../contexts/KeyboardContext';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

import LogoImg from "../../assets/images/logo.png";

import * as S from './styles';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();
  const { keyboardIsOpen } = useContext(KeyboardContext);

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string().required('E-mail obrigatório').email('Digite um email valido'),
          password: Yup.string().min(6, 'No minimo 6 dígitos'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/users', data);

        Alert.alert('Cadastro realizado com sucesso', 'Você já pode logar com seu email e senha');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }
        Alert.alert('Erro na autenticação', 'Ocorreu um erro ao fazer login, cheque as credencias.');
      }
    },
    [ formRef ],
  );

  return (
    <>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding': undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <S.Container>
            <Image source={LogoImg} />

            <View>
              <S.Title>Preencha os campos abaixo</S.Title> 
            </View>

            <Form
              onSubmit={handleSignUp}
              ref={formRef}
              style={{ width: '100%' }}
            >
              <Input 
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />
              <Input 
                ref={emailInputRef}
                keyboardType="email-address"
                autoCompleteType="email"
                name="email"
                icon="mail"
                placeholder="Email"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
              <Input 
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm()
                }}
              />

              <Button onPress={() => {
                formRef.current?.submitForm()
                }}>Criar conta</Button>
            </Form>

          </S.Container>
        </ScrollView>
      </KeyboardAvoidingView>

      {!keyboardIsOpen && (
        <S.BackToSignIn onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#fff" />
          <S.BackToSignInText>Voltar para logon</S.BackToSignInText>
        </S.BackToSignIn>
      )}
    </>
  );
};

export default SignUp;