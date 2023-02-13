import { Component, PropsWithChildren } from 'react';
import Taro, {Current, showLoading} from '@tarojs/taro';
import './app.scss';
import { set as setGlobalData } from './utils/globaldata';
import {
  AD_HIDDEN,
  GLOBAL_KEY_MSG,
  GLOBAL_KEY_PAYJSORDERID,
  GLOBAL_KEY_PAYSUCCESS,
  GLOBAL_KEY_RESULTCODE,
} from './constants/data';
import { LOADING } from './constants/toast';
import { LIMITSTORAGE } from './constants/storage';
import { getLevel } from './utils/callcloudfunctions';
import 'taro-ui/dist/style/index.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({ env: 'cloud1-2gyag5419d472bf2' });
    }
  }

  async componentDidShow() {
    console.log('this------',this)
    const { referrerInfo } = Current.router?.params;;

    if (referrerInfo && referrerInfo['appId'] === 'wx1e694bf8683bde93') {
      let extraData = referrerInfo['extraData'];
      setGlobalData(GLOBAL_KEY_PAYSUCCESS, extraData['success']);
      setGlobalData(GLOBAL_KEY_RESULTCODE, extraData['resultCode']);
      setGlobalData(GLOBAL_KEY_MSG, extraData['msg']);
      setGlobalData(GLOBAL_KEY_PAYJSORDERID, extraData['payjsOrderId']);
    }
    // 获取用户等级
    await this.fetchLimitInfo();
  }

  componentDidHide() {}

  async fetchLimitInfo() {
    showLoading({ title: LOADING });
    try {
      const limitInfo = await getLevel();
      if (limitInfo && limitInfo['level']) {
        Taro.setStorageSync(LIMITSTORAGE, limitInfo['limitData']);
        setGlobalData(AD_HIDDEN, limitInfo['level'] !== 'normal');
      }
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
    }
  }

  render() {
    // this.props.children 是将要会渲染的页面
    return this.props.children;
  }
}

export default App;
