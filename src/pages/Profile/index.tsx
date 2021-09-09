import React from "react";
import { View } from "react-native";

import { useAuth } from '../../hooks/Auth';

const Profile = () => {
  const { user } = useAuth();

  return <View />;
}

export default Profile;