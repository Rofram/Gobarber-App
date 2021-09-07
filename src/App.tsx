import 'react-native-gesture-handler';

import React from "react";
import { View, StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';

import { AppProvider } from './hooks';

import { KeyboardContextProvider } from './contexts/KeyboardContext';

import Routes from "./routes";

const App = () => (
  <NavigationContainer>
    <StatusBar barStyle="light-content" backgroundColor="#312e38" />
    <View style={{ flex: 1, backgroundColor: "#312e38" }}>
      <KeyboardContextProvider>
        <AppProvider>
          <Routes />
        </AppProvider>
      </KeyboardContextProvider>
    </View>
  </NavigationContainer>
);

export default App;