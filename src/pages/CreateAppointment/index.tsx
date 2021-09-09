import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";

import GetAvatarImage from "../../utils/getAvatarImage";

import api from "../../services/api";

import * as S from "./styles";
import { useAuth } from "../../hooks/Auth";

interface RouteParams {
  providerId: string;
  providerAvatar: string | null;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const CreateAppointment = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { goBack } = useNavigation();

  const routeParams = route.params as RouteParams;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </S.BackButton>

        <S.HeaderTitle>Cabeleireiros</S.HeaderTitle>

        <S.UserAvatar source={{ uri: GetAvatarImage(user.avatar_url) }} />
      </S.Header>

      <S.ProvidersListContainer>
        <S.ProvidersList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={provider => provider.id}
          renderItem={({ item: provider }) => (
            <S.ProviderContainer
              selected={provider.id === selectedProvider}
              onPress={() => handleSelectProvider(provider.id)}
            >
              <S.ProviderAvatar source={{ uri: provider.avatar_url }} />
              <S.ProviderName
                selected={provider.id === selectedProvider}
              >
                {provider.name}
              </S.ProviderName>
            </S.ProviderContainer>
          )}
        />
      </S.ProvidersListContainer>

    </S.Container>
  );
}

export default CreateAppointment;