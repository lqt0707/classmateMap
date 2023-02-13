import Taro from "@tarojs/taro";

const getLevel = async () => {
  const { result } = await Taro.cloud.callFunction({
    name: 'level',
    data: {
      $url: 'get',
    },
  });
  return result
};

const quitClass=async (classId:string)=>{
  const { result } = await Taro.cloud.callFunction({
    name: 'class',
    data: {
      $url: 'quitClass',
      classId
    }
  })
  return result
}

export {getLevel,quitClass}
