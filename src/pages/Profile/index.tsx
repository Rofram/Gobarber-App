import React, { useCallback, useRef } from "react";
import Icon from 'react-native-vector-icons/Feather';
import {
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  View,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';

import api from '../../services/api';

import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import { useAuth } from '../../hooks/Auth';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

import * as S from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  passwordConfirmation: string;
}

const Profile = () => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string(),
          email: Yup.string().email('Digite um email valido'),
          oldPassword: Yup.string(),
          newPassword: Yup.string().when('oldPassword', {
            is: (val: string) => !!val.length,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          passwordConfirmation: Yup.string()
            .when('oldPassword', {
              is: (val: string) => !!val.length,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('newPassword'), null], 'Senha não confere'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { name, email, oldPassword, newPassword, passwordConfirmation } = data;

        const formData = {
          name,
          email,
          ...(oldPassword ? { oldPassword, newPassword, passwordConfirmation } : {}),
        };

        console.log(formData);

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na atualização do perfil',
          'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.5,
      // maxHeight: 600,
      // maxWidth: 600,
    }, response => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Erro ao atualizar seu avatar.');
        return;
      }

      const photo = response.assets ? response.assets[0].uri : undefined;

      if (photo) {
        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: photo,
        });

        api.patch('users/avatar', data).then(apiResponse => {
          updateUser(apiResponse.data);
        });
      }
    })
  }, [updateUser, user.id]);



  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
            <S.BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </S.BackButton>

            <S.UserAvatarButton onPress={handleUpdateAvatar}>
              <S.UserAvatar source={{ uri: user.avatar_url }} />
            </S.UserAvatarButton>

            <View>
              <S.Title>Meu Perfil</S.Title>
            </View>

            <Form
              initialData={{ name: user.name, email: user.email }}
              onSubmit={handleSubmit}
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
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Senha atual"
                containerStyle={{ marginTop: 16 }}
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  newPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={newPasswordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova senha"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Confirmar senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm()
                }}
              />

              <Button onPress={() => {
                formRef.current?.submitForm()
              }}>Confirmar Mudanças</Button>
            </Form>

          </S.Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;