export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    navigationStyle:'custom'
  },
  plugins: {
    // "routePlan": {
    //   "version": "1.0.8",
    //   "provider": "wx50b5593e81dd937a"
    // }
  },
  cloud:true,
  permission:{
    "scope.userLocation": {
      "desc": "你的位置信息将用于在地图中展示"
    }
  },
  // navigateToMiniProgramAppIdList: [
  //   "wx1e694bf8683bde93"
  // ]
})
