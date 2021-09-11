import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/Feather";

import DateTimePicker from "@react-native-community/datetimepicker";

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

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment = () => {
  const route = useRoute();
  const { user } = useAuth();
  const { goBack, navigate } = useNavigation();

  const routeParams = route.params as RouteParams;

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleDatePicker = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  }, []);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api.get(`providers/${selectedProvider}/day-availability`, {
      params: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate()
      }
    }).then(response => {
      setAvailability(response.data);
    }
    );
  }, [selectedProvider, selectedDate]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), "HH:00")
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), "HH:00")
        };
      });
  }, [availability]);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, [selectedDate]);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente.'
      );
    }
  }, [navigate, selectedDate, selectedHour, selectedProvider]);

  return (
    <S.Container>
      <S.Header>
        <S.BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </S.BackButton>

        <S.HeaderTitle>Cabeleireiros</S.HeaderTitle>

        <S.UserAvatar source={{ uri: GetAvatarImage(user.avatar_url) }} />
      </S.Header>

      <S.Content>
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

        <S.Calendar>
          <S.Title>Escolha a data</S.Title>

          <S.OpenDatePickerButton onPress={handleToggleDatePicker}>
            <S.OpenDatePickerButtonText>
              Selecionar outra data
            </S.OpenDatePickerButtonText>
          </S.OpenDatePickerButton>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              onChange={handleDatePicker}
              mode="date"
              display="calendar"
            />
          )}
        </S.Calendar>

        <S.Schedule>
          <S.Title>Escolha o horário</S.Title>

          <S.Section>
            <S.SectionTitle>Manhã</S.SectionTitle>

            <S.SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <S.Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <S.HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </S.HourText>
                </S.Hour>
              ))}
            </S.SectionContent>
          </S.Section>

          <S.Section>
            <S.SectionTitle>Tarde</S.SectionTitle>

            <S.SectionContent>
              {afternoonAvailability.map(({ hourFormatted, hour, available }) => (
                <S.Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <S.HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </S.HourText>
                </S.Hour>
              ))}
            </S.SectionContent>
          </S.Section>
        </S.Schedule>

        {morningAvailability.length === 0 && afternoonAvailability.length === 0 && (
          <S.NoAvailability>
            <S.NoAvailabilityText>
              Nenhum horário disponível.
            </S.NoAvailabilityText>
          </S.NoAvailability>
        )}

        <S.CreateAppointmentButton
          onPress={handleCreateAppointment}
        >
          <S.CreateAppointmentButtonText>Agendar</S.CreateAppointmentButtonText>
        </S.CreateAppointmentButton>
      </S.Content>
    </S.Container>
  );
}

export default CreateAppointment;