import { Image, Text, View } from "@tarojs/components";
import NavBar from "taro-navigationbar";
import { useEffect, useState } from "react";
import "./index.scss";
import defaulAvatar from "../../assets/default_avatar.png";
import joinClass from "../../assets/illustration_join_class.png";
import createClass from "../../assets/illustration_create_class.png";
import empty from "../../assets/illustration_empty.png";
import shareImage from "../../assets/illustration_share.png";
import Tooltip from "@/components/Tooltip";
import {
  COLLECT_TOOLTIP_STORAGE,
  LIMITSTORAGE,
  USERSTORAGE,
} from "@/constants/storage";
import Taro, {
  showActionSheet,
  useDidShow,
  usePullDownRefresh,
  useShareAppMessage,
} from "@tarojs/taro";
import AuthModal from "@/components/AuthModal";
import {
  ActionType,
  AD_HIDDEN,
  INDEX_ACTION_SHEET,
  IndexActionSheet,
} from "@/constants/data";
import {
  CHARGE,
  CLASS_MANAGE,
  CREATE_CLASS,
  INDEX,
  JOIN_INFO,
  SEARCH_CLASS,
} from "@/constants/page";
import Avatar from "@/components/Avatar";
import Tag from "@/components/Tag";
import {
  PRIMARY_COLOR,
  PRO_BG_COLOR,
  PRO_TEXT_COLOR,
  WARING_COLOR,
} from "@/constants/theme";
import { EXPECTION, LOADING, QUIT_SUCCESS } from "@/constants/toast";
import {
  navigateTo,
  showLimitModal,
  showModal,
  showToast,
} from "@/utils/utils";
import { get } from "@/utils/globaldata";
import ClassItem from "@/components/ClassItem";
import { getLevel, quitClass } from "@/utils/callcloudfunctions";
import { AtNavBar } from "taro-ui";

let createClasses;
const Index = () => {
  const [navHeight, setNavHeight] = useState(0);
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showToolip, setShowToolTip] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(defaulAvatar);
  const [nickname, setNickname] = useState("未授权");
  const [isAuth, setIsAuth] = useState(false);
  const [joinClasses, setJoinClsses] = useState([]);
  const [userLevel, setUserLevel] = useState("normal");

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
          if (res.authSetting["scope.userInfo"]) {
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

  const bindCreateClass = () => {
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    const limitInfo = Taro.getStorageSync(LIMITSTORAGE) || {};
    if (!limitInfo["createLimit"]) {
      showToast(EXPECTION);
      return;
    }

    if (limitInfo["createLimit"] > createClasses.length) {
      navigateTo(`${CREATE_CLASS}?action=${ActionType.CREATE}`);
    } else {
      showLimitModal("提示", "创建班级数已满，您需要升级账号", "升级 Pro");
    }
  };

  const fetchIndexData = async () => {
    try {
      await Taro.showToast({ title: LOADING });
      const { result } = await Taro.cloud.callFunction({
        name: "index",
      });
      if (result) {
        const data = result["joinClasses"];
        setJoinClsses(data);
        createClasses = result["createClasses"];
      }
      Taro.hideLoading();
    } catch (e) {
      showToast(EXPECTION);
    }
  };

  const handleQuitClass = async (classId: string) => {
    try {
      const { tapIndex } = await showActionSheet({
        itemList: ["退出班级"],
        itemColor: WARING_COLOR,
      });
      if (tapIndex === 0) {
        const confirm = await showModal("是否确认退出班级", PRIMARY_COLOR);
        if (!confirm) return;
        await Taro.showLoading({ title: LOADING });
        const result = await quitClass(classId);
        if (result && result["code"] === 200) {
          await Taro.showToast({ title: QUIT_SUCCESS });
          await fetchIndexData();
        } else {
          showToast(EXPECTION);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const classItemsDom = joinClasses.map((item, index) => {
    if (index === 0) {
      return (
        <View>
          <ClassItem
            onClick={() => {
              navigateTo(`${CLASS_MANAGE}?_id=${item["_id"]}`);
            }}
            onLongPress={() => handleQuitClass(item["_id"])}
            classname={item["className"]}
            joinNum={item["joinUsers"]["length"]}
            totalNum={item["count"]}
            coverImage={item["classImage"]}
            isJoin={true}
          />
          <View className={"ad_unit"} hidden={get(AD_HIDDEN)}></View>
        </View>
      );
    }
  });

  useShareAppMessage(() => {
    return {
      title: `查看班级同学分布地图，多联(蹭)系(饭)。`,
      path: INDEX,
      imageUrl: shareImage,
    };
  });

  const handleTooltip = async () => {
    // 获取是否关闭过Tooltip的缓存
    try {
      await Taro.getStorage({
        key: COLLECT_TOOLTIP_STORAGE,
        success: (res) => {
          setShowToolTip(res.data);
        },
        fail: () => {
          Taro.setStorageSync(COLLECT_TOOLTIP_STORAGE, true);
          setShowToolTip(true);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchLimitInfo = async () => {
    const limitInfo = await getLevel();
    if (limitInfo && limitInfo["level"]) {
      Taro.setStorageSync(LIMITSTORAGE, limitInfo["limitData"]);
      setUserLevel(limitInfo["level"]);
    }
  };

  useDidShow(() => {
    setUserInfo();
  });

  usePullDownRefresh(() => {
    fetchIndexData();
  });

  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync();
    const { statusBarHeight } = systemInfo;
    const isiOS = systemInfo.system.indexOf("iOS") > -1;
    let navHeight = 0;
    if (isiOS) {
      navHeight = 44;
    } else {
      navHeight = 48;
    }
    setStatusBarHeight(statusBarHeight);
    setNavHeight(navHeight);
    handleTooltip();
    fetchIndexData();
    fetchLimitInfo();
  }, []);

  return (
    <View className={"index"}>
      {/*<NavBar />*/}
      <AtNavBar />
      {showToolip ? (
        <Tooltip
          content={"添加到我的小程序"}
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
        className={"user_info"}
        style={{ height: `${navHeight}px`, top: `${statusBarHeight}px` }}
        onClick={() =>
          isAuth ? handleActionSheetClick() : setShowAuthModal(true)
        }
      >
        <Avatar radius={64} image={avatarUrl} border={2} />
        <Text className={"nickname"}>{nickname}</Text>
        {userLevel === "normal" ? null : (
          <View style={{ marginLeft: "15rpx" }}>
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
      <View className={"page"}>
        <View className={"action_container"}>
          <View
            className={"action_item"}
            onClick={() => navigateTo(SEARCH_CLASS)}
          >
            <View className={"action_txt"}>
              <View className={"action_title"}>加入班级</View>
              <View className={"action_hint"}>查看同学去向</View>
            </View>
            <Image src={joinClass} className={"action_image"} />
          </View>
          <View className={"action_item"} onClick={bindCreateClass}>
            <Image src={createClass} className={"action_image"} />
            <View className={"action_txt txt_right"}>
              <View className={"action_title"}>创建班级</View>
              <View className={"action_hint"}>邀请同学加入</View>
            </View>
          </View>
        </View>
        <View className={"join_container"}>
          <Text className={"title"}>我加入的</Text>
          {joinClasses.length === 0 ? (
            <View className={"empty_container"}>
              <Image src={empty} className={"image"} />

              <View className={"empty_hint"}>
                <Text>您还没加入任何班级</Text>
                <View>
                  <Text>你可以选择</Text>
                  <Text className={"action"}>加入班级</Text>
                  <Text>或者</Text>
                  <Text className={"action"}>创建班级</Text>
                </View>
              </View>
            </View>
          ) : (
            classItemsDom
          )}
        </View>
      </View>
      <View className={"custom_small_ad"} hidden={get(AD_HIDDEN)} />
    </View>
  );
};

export default Index;
