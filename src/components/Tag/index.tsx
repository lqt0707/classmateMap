import { memo } from 'react';
import './index.sass';
import { PRIMARY_BG_COLOR, PRIMARY_COLOR } from '@/constants/theme';
import { View } from '@tarojs/components';
interface ITagProps {
  label: string; // 标签文字
  bgColor?: string; // 标签背景颜色
  labelColor: string; // 字体颜色，默认主题色
  width?: number;
  height?: number;
}

const Tag = (props: ITagProps) => {
  const {
    label,
    bgColor = PRIMARY_BG_COLOR,
    labelColor = PRIMARY_COLOR,
    width = 110,
    height = 48,
  } = props;
  return (
    <View
      className={'tag_container'}
      style={{
        background: bgColor,
        width: `${width}rpx`,
        height: `${height}rpx`,
      }}
    >
      <View className={'label'} style={{ color: labelColor }}>
        {label}
      </View>
    </View>
  );
};
export default memo(Tag);
