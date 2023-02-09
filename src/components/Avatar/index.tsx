import { memo } from 'react';
import { Image, View } from '@tarojs/components';

interface IAvatarProps {
  image: string; // 传入头像url
  radius: number; // 半径
  border?: number; // 边框宽度
}

const Avatar = (props: IAvatarProps) => {
  const { image, radius, border = 1 } = props;

  return (
    <View
      className={'avatar_container'}
      style={{ width: `${radius}rpx`, height: `${radius}rpx` }}
    >
      <Image
        src={image}
        mode={'scaleToFill'}
        className={'avatar_image'}
        style={{
          width: `${radius}rpx`,
          height: `${radius}rpx`,
          border: `${border}px solid #fff`,
        }}
      />
    </View>
  );
};
export default memo(Avatar);
