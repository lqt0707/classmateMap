const getLevel = async () => {
  const { result } = await Taro.cloud.callFunction({
    name: 'level',
    data: {
      $url: 'get',
    },
  });
  return result
};
