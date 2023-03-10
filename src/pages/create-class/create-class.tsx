import {memo, useEffect, useState} from 'react';
import {
  ActionType, AD_HIDDEN,
  CLASS_CANVAS_ID,
  GLOBAL_KEY_COMPRESS_CLASS_IMAGE,
} from '@/constants/data';
import { CREATE_TEMPLATE_MSG_ID } from '@/constants/template';
import Taro, {
  getCurrentInstance,
  useDidShow,
} from '@tarojs/taro';
import {checkAddForm, checkUpdateForm} from '@/utils/checkform';
import {
  CHECK_CONTENT,
  CHECK_IMAGE,
  CREATE_SUCCESS,
  CREATING,
  EXPECTION,
  IMG_UPLOADING,
  LOADING,
  UPDATING,
} from '@/constants/toast';
import {
  checkContentSecurity,
  checkImageSecurity,
} from '@/utils/callcloudfunctions';
import {getFileName, showSecurityModal, showToast} from '@/utils/utils';
import { get, set } from '@/utils/globaldata';
import {CREATE_ATTENTION, CREATE_SUCCESS_PAGE } from '@/constants/page';
import { classDetail, updateClass } from '@/utils/request/manageClass';
import { LIMITSTORAGE } from '@/constants/storage';
import {Button, Form, Input, View, Text, Image, Canvas} from "@tarojs/components";
import {AtNavBar, AtSwitch} from "taro-ui";
import {PRIMARY_COLOR} from "@/constants/theme";
import illustrate from '../../assets/illustration_create_class_form.png'
import selectArrow from '../../assets/icon_select_arrow.png'
import './create-clsss.scss'


let isChangeImage = false;
let minlimit = 1;
let classId;

const CreateClass = () => {
  const [imagePath, setImagePath] = useState('');
  const [imageName, setImageName] = useState('default');
  const [countLimit, setCountLimt] = useState(50);
  const [searchConfirm, setSearchConfirm] = useState(true);
  const [canvasWidth, setCanvasWitdh] = useState(100);
  const [actionType, setActionType] = useState(ActionType.CREATE);
  const [updateInfo, setUpdateInfo] = useState({});

  const onCreateSubmit = async (e) => {
    await Taro.requestSubscribeMessage({
      tmplIds: [CREATE_TEMPLATE_MSG_ID],
      success: (res) => {
        console.log(res);
      },
    });

    const formData = e.detail.value;
    try {
      // 校验数据
      if (!(await checkAddForm({ ...formData, imagePath }))) {
        return;
      }
      const { creator, className, count, token } = formData;
      // TODO:对小程序进行内容检测
      Taro.showLoading({ title: CHECK_CONTENT });
      const check_content_res = await checkContentSecurity(
        `${creator}${className}`,
      );
      if (check_content_res && check_content_res['code'] === 300) {
        Taro.hideLoading();
        showSecurityModal('内容');
        return;
      }

      Taro.showLoading({ title: CHECK_IMAGE });
      const check_image_res = await checkImageSecurity(
        get(GLOBAL_KEY_COMPRESS_CLASS_IMAGE),
      );
      console.log(check_image_res);
      if (!check_image_res) return;
      if (check_image_res && check_image_res['code'] === 300) {
        Taro.hideLoading();
        showSecurityModal('图片');
        return;
      }
      Taro.showLoading({ title: IMG_UPLOADING });

      //  先上传图片
      const { fileID } = await Taro.cloud.uploadFile({
        cloudPath: `class-image/${imageName}`,
        filePath: imagePath, // 文件路径
      });

      Taro.showLoading({ title: CREATING });

      // 调用创建班级的云函数
      const { result } = await Taro.cloud.callFunction({
        name: 'class',
        data: {
          $url: 'create',
          createData: {
            creator,
            className,
            token,
            count: Number(count),
            classImage: fileID,
            createTime: Date.now(),
            canSearch: searchConfirm,
          },
        },
      });
      Taro.hideLoading();

      if (result) {
        Taro.showToast({ title: CREATE_SUCCESS });
        Taro.redirectTo({
          url: `${CREATE_SUCCESS_PAGE}?creator=${creator}&className=${className}&token=${token}&_id=${result['data']['id']}`,
        });
        Taro.cloud.callFunction({
          name: 'msg',
          data: {
            $url: 'createMsg',
            classInfo: formData,
            classId: result['data']['_id'],
          },
        });
      }
    } catch (e) {
      console.log(e);
      Taro.hideLoading();
      Taro.showToast({ title: EXPECTION, icon: 'none' });
    }
  };

  const onUpdateSubmit = async (e) => {
    const formData = e.detail.value;
    let file = imagePath;
    try {
      // 校验数据
      if (!checkUpdateForm({ ...formData, imagePath, countLimit, minLimit })) {
        return;
      }
      const { creator, className, count } = formData;
      // TODO: 对小程序进行内容检测
      Taro.showLoading({ title: CHECK_CONTENT });
      const check_content_res = await checkContentSecurity(
        `${creator}${className}`,
      );
      if (check_content_res && check_content_res['code'] == 300) {
        Taro.hideLoading();
        showSecurityModal('内容');
        return;
      }
      if (isChangeImage) {
        Taro.showLoading({ title: CHECK_IMAGE });
        const check_image_res = await checkImageSecurity(
          get(GLOBAL_KEY_COMPRESS_CLASS_IMAGE),
        );
        console.log(check_image_res);

        if (!check_image_res) {
          return;
        }

        if (check_image_res && check_image_res['code'] == 300) {
          Taro.hideLoading();
          showSecurityModal('图片');
          return;
        }
        Taro.showLoading({ title: IMG_UPLOADING });
        // 先上传图片
        const { fileID } = await Taro.cloud.uploadFile({
          cloudPath: `class-image/${imageName}`,
          filePath: imagePath, // 文件路径
        });
        file = fileID;
      }
      Taro.showLoading({ title: UPDATING });
      const result = await updateClass(classId, {
        count,
        classImage: file,
        className,
        creator,
        canSearch: searchConfirm,
      });
      if (result && result['resCode'] === 200) {
        Taro.showToast({ title: '信息已修改' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 2000);
      }
    } catch (e) {
      console.log(e);
      Taro.hideLoading();
      Taro.showToast({ title: EXPECTION, icon: 'none' });
    }
  };

  const chooseImage = async () => {
    try {
      const image = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
      });
      const path = image.tempFilePaths[0];
      const format = path.split('.').pop();
      setImagePath(path);
      setImageName(`${getFileName()}.${format}`);
      isChangeImage = true;
      // 压缩图片
      await compressImage(path, canvasWidth, CLASS_CANVAS_ID);
    } catch (e) {
      Taro.showToast({ title: '取消选择', icon: 'none' });
    }
  };
  const compressImage = async (
    path: string,
    drawWidth: number,
    canvasId: string,
  ) => {
    if (!path) return;
    const info = await Taro.getImageInfo({ src: path });
    const { width, height } = info;
    const maxSide = Math.max(width, height);
    let scale = 1;
    if (maxSide > drawWidth) {
      scale = drawWidth / maxSide;
    }
    const imageW = Math.floor(width * scale * 0.1);
    const imageH = Math.floor(height * scale * 0.1);
    const canvasCtx = Taro.createCanvasContext(canvasId);
    canvasCtx.drawImage(path, 0, 0, imageW, imageH);
    canvasCtx.draw(false, async () => {
      const { tempFilePath } = await Taro.canvasToTempFilePath({
        canvasId: canvasId,
        x: 0,
        y: 0,
        width: imageW,
        height: imageH,
        quality: 1,
      });
      set(GLOBAL_KEY_COMPRESS_CLASS_IMAGE, tempFilePath);
    });
  };

  const onSearchConfirm = (e) => {
    setSearchConfirm(e);
  };

  const fetchClassInfo = async () => {
    try {
      Taro.showLoading({ title: LOADING });
      const result = await classDetail(classId);
      if (result && result['classData']) {
        setUpdateInfo(result['classData']);
        setImagePath(result['classData']['classImage']);
        setSearchConfirm(result['classData']['canSearch']);
        minlimit = result['classData']['joinUsers'].length;
      }
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
    }
  };

  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync();
    const { windowWidth } = systemInfo;
    setCanvasWitdh(windowWidth);
    const { _id, action } = getCurrentInstance().router?.params;
    classId = _id;
    setActionType(Number(action));
    if (Number(action) === ActionType.UPDATE) {
      fetchClassInfo();
    }
  }, []);

  useDidShow(() => {
    // 获取加入班级人数限制
    const limitInfo = Taro.getStorageSync(LIMITSTORAGE).countLimit;
    setCountLimt(limitInfo);
  });

  return (
    <View className='create_page'>
      <Canvas
        canvasId={CLASS_CANVAS_ID}
        className='press-canvas'
        style={{ width: `${canvasWidth}px`, height: `${canvasWidth}px` }} />
      <AtNavBar title={actionType === ActionType.CREATE ? '创建班级' : '修改信息'}  />
      <Image className='image' src={illustrate} />
      <Form onSubmit={actionType === ActionType.CREATE ? onCreateSubmit : onUpdateSubmit} className='form_container'>
        <View className='form_item'>
          <View className='form_label'>创建人</View>
          <Input cursor-spacing={5}
                 name='creator'
                 className='form_input'
                 placeholder='您的姓名或昵称'
                 placeholderClass='placeholder'
                 value={actionType === ActionType.UPDATE ? updateInfo['creator'] : ''} />
        </View>
        <View className='form_item' >
          <View className='form_label'>创建口令</View>
          <Input cursor-spacing={5}
                 name='token'
                 className='form_input'
                 placeholder='至少6位字母和数字'
                 placeholderClass='placeholder'
                 value={actionType === ActionType.UPDATE ? updateInfo['token'] : ''}
                 disabled={actionType === ActionType.UPDATE}
                 onClick={actionType === ActionType.UPDATE ? () => {showToast('不能修改口令')} : () => {}} />
        </View>
        <View className='form_item'>
          <View className='form_label'>班级名称</View>
          <Input cursor-spacing={5}
                 name='className'
                 className='form_input'
                 placeholder='请输入班级名称'
                 placeholderClass='placeholder'
                 value={actionType === ActionType.UPDATE ? updateInfo['className'] : ''} />
        </View>
        <View className='form_item'>
          <View className='form_label'>班级人数</View>
          <Input cursor-spacing={5}
                 name='count'
                 type='number'
                 className='form_input'
                 placeholder={`班级人数需≤${countLimit}`}
                 placeholderClass='placeholder'
                 value={actionType === ActionType.UPDATE ? updateInfo['count'] : ''} />
        </View>
        <View className='form_item' onClick={chooseImage}>
          <View className='form_label'>班级照片</View>
          {imagePath.length !== 0
            ? <Image mode='aspectFill' className='selected_image' src={imagePath} />
            : <View className='placeholder'>选择一张班级合照</View>
          }
          <Image className='select_arrow' src={selectArrow} />
        </View>
        <View className='form_item'>
          <View className='form_label'>允许被搜索</View>
          <AtSwitch checked={searchConfirm} border={false} onChange={onSearchConfirm} color={PRIMARY_COLOR} />
        </View>
        <Button formType='submit' className='form_btn' hoverClass='form_btn_hover'>{actionType === ActionType.CREATE ? '创建班级' : '保存信息'}</Button>
      </Form>
      <View className='notice'>
        * {actionType === ActionType.CREATE ? '创建' : '信息修改'}前请先阅读
        <Text
          className='attention_txt'
          onClick={() => Taro.navigateTo({ url: CREATE_ATTENTION })}>
          《班级信息规范》
        </Text>
      </View>
      <View className="custom_small_ad" hidden={get(AD_HIDDEN)}>
        {/*<ad-custom unit-id="adunit-0d7af8f6497b81fd"></ad-custom>*/}
      </View>
    </View>
  )
};
export default memo(CreateClass)
