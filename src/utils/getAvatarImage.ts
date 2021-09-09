import { useCallback } from 'react';

import DefaultAvatar from '../assets/images/avatar.png';

type AvatarImage = string | null;

const GetAvatarImage = (avatar: AvatarImage) => {
  if (avatar) {
    return avatar;
  }

  return DefaultAvatar;
};

export default GetAvatarImage;