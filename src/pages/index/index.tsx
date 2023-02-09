import { Text, View } from '@tarojs/components';
import NavBar from 'taro-navigationbar';
import { useState } from 'react';
import './index.scss';
import defaulAvatar from '../../assets/default_avatar.png';
import joinClass from '../../assets/illustration_join_class.png';
import createClass from '../../assets/illustration_create_class.png';
import empty from '../../assets/illustration_empty.png';
import shareImage from '../../assets/illustration_share.png';
import Tooltip from '@/components/Tooltip';
import { COLLECT_TOOLTIP_STORAGE, USERSTORAGE } from '@/constants/storage';
import Taro, { navigateTo, showActionSheet } from '@tarojs/taro';
import AuthModal from '@/components/AuthModal';
import { INDEX_ACTION_SHEET, IndexActionSheet } from '@/constants/data';
import { CHARGE, CLASS_MANAGE, JOIN_INFO } from '@/constants/page';
import Avatar from '@/components/Avatar';
import Tag from '@/components/Tag';
import { PRO_BG_COLOR, PRO_TEXT_COLOR } from '@/constants/theme';

const Index = () => {
  const [navHeight, setNavHeight] = useState(0);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showToolip, setShowToolTip] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaulAvatar);
  const [nickname, setNickname] = useState('未授权');
  const [isAuth, setIsAuth] = useState(false);
  const [joinClasses, setJoinClsses] = useState([]);
  const [userLevel, setUserLevel] = useState('normal');

  const closeTooltip = () => {
    setShowToolTip(false);
    // 缓存设置w为false
    Taro.setStorage({
      key: COLLECT_TOOLTIP_STORAGE,
      data: false,
    });
  };

  const onAuthSuccess = () => {
    setUserInfo();
  };

  const setUserInfo = () => {
    const userInfo = Taro.getStorageSync(USERSTORAGE);
    if (!userInfo) {
      Taro.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            setIsAuth(true);
            // 已经授权，可以直接调用getUserInfo获取头像昵称，不会弹框
            Taro.getUserInfo({
              success: (res) => {
                setAvatarUrl(res.userInfo.avatarUrl);
                setNickname(res.userInfo.nickName);
              },
            });
          }
        },
      });
      return;
    }
    setIsAuth(true);
    setAvatarUrl(userInfo.avatarUrl);
    setNickname(userInfo.nickname);
  };

  const handleActionSheetClick = async () => {
    try {
      const { tapIndex } = await showActionSheet({
        itemList: INDEX_ACTION_SHEET,
      });
      switch (tapIndex) {
        case IndexActionSheet.CLASS:
          navigateTo(CLASS_MANAGE);
          break;
        case IndexActionSheet.INFO:
          navigateTo(JOIN_INFO);
          break;
        case IndexActionSheet.ACCOUNT:
          navigateTo(CHARGE);
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View className={'index'}>
      <NavBar />
      {showToolip ? (
        <Tooltip
          content={'添加到我的小程序'}
          top={navHeight + statusBarHeight}
          onClose={closeTooltip}
        />
      ) : null}
      {showAuthModal ? (
        <AuthModal
          onSuccess={onAuthSuccess}
          onClose={() => {
            setShowAuthModal(false);
          }}
        />
      ) : null}
      <View
        className={'user_info'}
        style={{ height: `${navHeight}px`, top: `${statusBarHeight}px` }}
        onClick={() =>
          isAuth ? handleActionSheetClick() : setShowAuthModal(true)
        }
      >
        <Avatar radius={64} image={avatarUrl} border={2} />
        <Text className={'nickname'}>{nickname}</Text>
        {userLevel === 'normal' ? null : (
          <View style={{ marginLeft: '15rpx' }}>
            <Tag
              label={userLevel}
              labelColor={PRO_TEXT_COLOR}
              bgColor={PRO_BG_COLOR}
              height={40}
              width={60}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Index;
