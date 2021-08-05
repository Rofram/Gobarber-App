import React from "react";
import { RectButtonProperties } from 'react-native-gesture-handler';

import * as S from './styles';

type BtnProps = RectButtonProperties & {
  children: string;
};

export const Button = ({ children,...rest }:BtnProps) => (
  <S.Container {...rest}>
    <S.ButtonText>{children}</S.ButtonText>
  </S.Container>
);