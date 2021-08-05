import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Keyboard } from 'react-native';

type KeyboardContextType = {
  keyboardIsOpen: boolean,
}

type KeyboardProviderProps = {
  children: ReactNode,
}

export const KeyboardContext = createContext({} as KeyboardContextType);

export const KeyboardContextProvider = ({children }: KeyboardProviderProps) => {
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", () => setKeyboardIsOpen(true));
    Keyboard.addListener("keyboardDidHide", () => setKeyboardIsOpen(false));

    // cleanup function
    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);


  return (
    <KeyboardContext.Provider value={{ keyboardIsOpen }}>
      {children}
    </KeyboardContext.Provider>
  );
};

