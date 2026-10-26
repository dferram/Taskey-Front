export const avatarImages = {
  capicons: require('../assets/images/capicons.png'),
  capifer: require('../assets/images/capifer.png'),
  capiangel: require('../assets/images/capiangel.png'),
  capihijo: require('../assets/images/capihijo.png'),
};
export const avatarImage = id => avatarImages[id] || avatarImages.capicons;
