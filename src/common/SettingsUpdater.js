import {CURRENT_SETTING_VERSION} from './Constants';
import {getDefaultDataSourcesList} from './datasource/DefaultDataSources';

async function updateLegacyToV1(oldSettings) {
  console.log("从旧配置升级：");
  console.log(oldSettings);
  const newSettings = {
    dun: {},
    display: {},
    san: {}
  };
  if (oldSettings.hasOwnProperty('time')) newSettings.dun.intervalTime = oldSettings.time;
  if (oldSettings.hasOwnProperty('source')) {
    const list = await getDefaultDataSourcesList();
    newSettings.enableDataSources = oldSettings.source.map(idx => list[idx].dataName);
  }
  if (oldSettings.hasOwnProperty('fontsize')) newSettings.display.fontSize = oldSettings.fontsize;
  if (oldSettings.hasOwnProperty('imgshow')) newSettings.display.showImage = oldSettings.imgshow;
  if (oldSettings.hasOwnProperty('isTag')) newSettings.display.showByTag = oldSettings.isTag;
  if (oldSettings.hasOwnProperty('tagActiveName')) newSettings.display.defaultTag = oldSettings.tagActiveName;
  if (oldSettings.hasOwnProperty('isTop')) newSettings.dun.sortModeForOnlyDate = oldSettings.isTop ? 1 : 2;
  if (oldSettings.hasOwnProperty('isPush')) newSettings.dun.enableNotice = oldSettings.isPush;
  if (oldSettings.hasOwnProperty('darkshow')) newSettings.display.darkMode = oldSettings.darkshow;
  if (oldSettings.hasOwnProperty('lowfrequency')) newSettings.dun.autoLowFrequency = oldSettings.lowfrequency;
  if (oldSettings.hasOwnProperty('lowfrequencyTime')) newSettings.dun.lowFrequencyTime = oldSettings.lowfrequencyTime;
  if (oldSettings.hasOwnProperty('retweeted')) newSettings.dun.showRetweet = oldSettings.retweeted;
  if (oldSettings.hasOwnProperty('sanShow')) newSettings.san.noticeWhenFull = oldSettings.sanShow;
  if (oldSettings.hasOwnProperty('saneMax')) newSettings.san.maxValue = oldSettings.saneMax;
  if (oldSettings.hasOwnProperty('isWindow')) newSettings.display.windowMode = oldSettings.isWindow;
  console.log("升级完毕，新配置：");
  console.log(newSettings);
  return newSettings;
}

async function updateSettings(oldSettings) {
  // 版本号一致直接返回
  if (parseInt(oldSettings.version) === CURRENT_SETTING_VERSION) {
    return oldSettings;
  }
  // 无版本号的旧配置文件升级
  if (!oldSettings.version) {
    return await updateLegacyToV1(oldSettings);
  }
}

export {updateSettings}
