import Taro from '@tarojs/taro';
import { PRIMARY_COLOR } from '@/constants/theme';
import { CHARGE } from '@/constants/page';

const showToast = (title = '') => {
  Taro.showToast({ title, icon: 'none' });
};

const navigateTo = (url: string) => {
  Taro.navigateTo({ url });
};

const showLimitModal = (title: any, content: any, confirmText) => {
  Taro.showModal({
    title: title,
    content: content,
    confirmColor: PRIMARY_COLOR,
    confirmText: confirmText,
    success: (res) => {
      if (res.confirm) {
        Taro.navigateTo({ url: CHARGE });
      }
    },
  });
};

const showModal = async (
  content: string,
  confirmColor: string = PRIMARY_COLOR,
  confirmText: string = '确认',
  title: string = '提示',
) => {
  try {
    const { confirm } = await Taro.showModal({
      title: title,
      content: content,
      confirmColor: confirmColor,
      confirmText: confirmText,
    });
    return confirm;
  } catch (e) {
    console.log(e);
  }
};

export { showToast, navigateTo, showLimitModal,showModal };
