import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import Icon from "react-native-vector-icons/Feather";

import * as S from "./styles";

interface RouteParams {
  date: number;
}

const AppointmentCreated = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    reset({
      routes: [{ name: "Dashboard" }],
      index: 0,
    });
  }, [reset]);

  const formattedDate = useMemo(() => {
    const date = new Date(routeParams.date);

    return format(
      date,
      "EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:mm'hrs'",
      { locale: ptBR }
    );

    // return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }, [routeParams.date]);

  return (
    <S.Container>
      <Icon name="check" size={80} color="#04d361" />
      <S.Title>Agendamento concluído</S.Title>
      <S.Description>
        {formattedDate}
      </S.Description>

      <S.OkButton
        onPress={handleOkPressed}
      >
        <S.OkButtonText>Ok</S.OkButtonText>
      </S.OkButton>
    </S.Container>
  );
}

export default AppointmentCreated;