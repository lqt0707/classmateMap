import { memo, useState } from 'react';
import Taro from '@tarojs/taro';
import { SEARCH_CLASS } from '@/constants/page';
import { EXPECTION, SEARCH_EMPTY } from '@/constants/toast';
import { View, Text, Image } from '@tarojs/components';
import { get } from '@/utils/globaldata';
import { AD_HIDDEN } from '@/constants/data';
import ClassItem from '@/components/ClassItem';
import empty from '../../assets/illustration_empty.png';
import { AtNavBar } from 'taro-ui';
import Search from '@/components/Search';
import './search-classs.scss';
const SearchClass = () => {
  const [classInfo, setClassInfo] = useState({});
  const [isJoin, setIsJoin] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const openClassDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/class-detail/class-detail?_id=${id}` });
  };

  const bindOnSearch = async (e) => {
    try {
      // 清空搜索逻辑
      setClassInfo({});
      setIsSearching(false);
      Taro.showLoading({ title: SEARCH_CLASS });
      const { value } = e.detail;
      // 调用查询函数
      const { result } = await Taro.cloud.callFunction({
        name: 'class',
        data: {
          $url: 'search',
          queryData: {
            token: value,
          },
        },
      });
      setIsSearching(true);
      // 如果查询结果在
      if (result && result['data'].length > 0) {
        setClassInfo(result['data'][0]);
        setIsJoin(result['isJoin']);
      }
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
      Taro.showToast({ title: EXPECTION });
    }
  };
  return (
    <View className="search-class">
      <View className="page_search">
        <AtNavBar title="搜索班级" />
        <View className="search_wrap">
          <Search
            autoFocus={true}
            hint="输入口令加入班级"
            onSearch={bindOnSearch}
          />
        </View>
        {isSearching && (
          <View>
            {classInfo['_id'] ? (
              <View className="search_result">
                <Text className="title">为你找到</Text>
                <ClassItem
                  classname={classInfo['className']}
                  totalNum={classInfo['count']}
                  joinNum={classInfo['joinUsers'].length}
                  coverImage={classInfo['classImage']}
                  isJoin={isJoin}
                  onClick={() => {
                    openClassDetail(classInfo['_id']);
                  }}
                />
              </View>
            ) : (
              <View className="empty_container">
                <Image className="image" src={empty} />
                <View className="empty_hint">
                  <Text>{SEARCH_EMPTY}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
      <View className="custom_small_ad" hidden={get(AD_HIDDEN)}>
        {/*<ad-custom unit-id="adunit-dd6051faa5b6ef48"></ad-custom>*/}
      </View>
    </View>
  );
};

export default memo(SearchClass);
