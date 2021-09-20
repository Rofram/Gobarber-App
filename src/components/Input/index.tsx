import React, { useState, useEffect, useRef, useImperativeHandle, useCallback, forwardRef } from "react";
import { TextInputProps } from "react-native";
import { useField } from '@unform/core';

import * as S from './styles';

type InputProps = TextInputProps & {
  name: string;
  icon: string;
  containerStyle?: {};
}

type InputValueReference = {
  value: string;
}

type InputRef = {
  focus: () => void;
}

export const Input = forwardRef<InputRef, InputProps>(({ name, icon, containerStyle = {}, ...props }, ref) => {
  const inputElementRef = useRef<any>(null);

  const { registerField, defaultValue = '', fieldName, error } = useField(name);
  const inputValueRef = useRef<InputValueReference>({ value: defaultValue });

  const [isFocused, setFocused] = useState(false);
  const [isFiled, setFiled] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);

    setFiled(!!inputValueRef.current.value);
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => inputElementRef.current.focus(),
  }));

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputValueRef.current,
      path: 'value',
      setValue(ref: any, value: string) {
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = '';
        inputElementRef.current.clear();
      },
    });
  }, [fieldName, inputValueRef, registerField]);

  return (
    <S.Container style={containerStyle} isFocused={isFocused} isErrored={!!error}>
      <S.Icon name={icon} size={20} color={isFocused || isFiled ? "#ff9000" : "#666360"} />

      <S.TextInput
        ref={inputElementRef}
        keyboardAppearance="dark"
        placeholderTextColor="#666360"
        defaultValue={defaultValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={(value) => {
          inputValueRef.current.value = value;
        }}
        {...props}
      />
    </S.Container>
  );
});