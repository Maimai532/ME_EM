let navigator;

export const setNavigator = (nav) => {
  navigator = nav;
};

export const navigateTo = (path, options) => {
  if (navigator) {
    navigator(path, options);
  } else {
    console.warn("Navigator chưa sẵn sàng");
  }
};