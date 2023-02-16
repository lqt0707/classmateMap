import { memo } from 'react';
import { CommonEventFunction, Input, View, Image } from '@tarojs/components';
import searchIcon from '../../assets/icon_search.png';
import './index.scss'
/**
 * 输入框
 *
 */
interface ISearchProps {
  hint: string;
  onSearch?: CommonEventFunction;
  autoFocus: boolean;
}
const Search = (props: ISearchProps) => {
  const { hint, onSearch, autoFocus } = props;

  return (
    <View className="search_container">
      <Image className="search_icon" src={searchIcon} />
      <Input
        cursor-spacing={5}
        className="input"
        placeholder={hint}
        placeholderClass="input_hint"
        confirm-type="search"
        autoFocus={autoFocus}
        onConfirm={onSearch ? onSearch : () => {}}
      />
    </View>
  );
};
export default memo(Search);
