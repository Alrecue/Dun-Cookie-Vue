import store from './store';


//数据下来后都定位固定格式 没有不用管
var date = {
  time: '时间 【必填】',
  id: '弹窗id 微博B站用时间戳，其他的内容用他们自己的ID 【必填】',
  judgment: '判定字段 微博B站用时间 鹰角用id 【必填】',
  dynamicInfo: '处理后内容 用于展示 微博把<br / >替换成 /r/n 后期统一处理 【必填】',
  html: '处理前内容 原始字段',
  image: '获取到的图片',
  imagelist: '获取到的图片list',
  type: '当前条目的类型',
  source: '条目来源 【必填】',
  url: '跳转后连接 【必填】',
  detail: '详情列表，以后进入二级页面使用',
  isTop: '在列表中是否为置顶内容 仅限微博'
}

var Kaze = {
  isTest: false,
  testIntervalTime: 1,

  // 第一次蹲的时间
  dunFristTime: new Date(),
  // 循环的标识
  setIntervalindex: 0,

  setting: {},
  //判断是否为最新
  JudgmentNew(oldList, newList, title) {
    //判断方法 取每条的第一个判定字段  如果新的字段不等于旧的且大于旧的 判定为新条目
    if (oldList && (oldList.length > 0 && oldList[0].judgment != newList[0].judgment && newList[0].judgment > oldList[0].judgment)) {
      let newInfo = newList[0];
      let timeNow = new Date()
      let notice = newInfo.dynamicInfo.replace(/\n/g, "");
      console.log(title, `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}-${timeNow.getDate()} ${timeNow.getHours()}：${timeNow.getMinutes()}：${timeNow.getSeconds()}`, newInfo, oldList[0]);
      Kaze.SendNotice(`【${title}】喂公子吃饼!`, notice, newInfo.image, newInfo.id)
    }
  },
  // 发送推送核心方法
  SendNotice(title, message, imageUrl, id) {
    if (imageUrl) {
      chrome.notifications.create(id + '_', {
        iconUrl: '../assets/image/icon.png',
        message: message,
        title: title,
        imageUrl: imageUrl,
        type: "image"
      });
    } else {
      chrome.notifications.create(id + '_', {
        iconUrl: '../assets/image/icon.png',
        message: message,
        title: title,
        type: "basic"
      });
    }
  },
  // 蹲饼入口
  GetData() {
    store.commit('dunDate')
    // this.GetAndProcessData(getSourceInfoList['weibo']);
    // 哔哩哔哩 微博 通讯组 朝陇山 一拾山 任塞 官网
    // this.setting.source.includes(0) ? this.GetAndProcessData(getSourceInfoList['bili']) : store.getters.clearList('bili');
    // this.setting.source.includes(1) ? this.GetAndProcessData(getSourceInfoList['weibo']) : store.getters.clearList('weibo');
    // this.setting.source.includes(2) ? this.GetAndProcessData(getSourceInfoList['yj']) : store.getters.clearList('yj');
    // this.setting.source.includes(3) ? this.GetAndProcessData(getSourceInfoList['cho3']) : store.getters.clearList('cho3');
    // this.setting.source.includes(4) ? this.GetAndProcessData(getSourceInfoList['ys3']) : store.getters.clearList('ys3');
    // this.setting.source.includes(5) ? this.GetAndProcessData(getSourceInfoList['sr']) : store.getters.clearList('sr');

    // this.setting.source.includes(6) ? getGw.Getdynamic() : store.getters.clearList('gw');
  },
  //请求
  GetAndProcessData(opt) {
    let defopt = {
      url: '',//网址
      title: '',//弹窗标题
      dataName: '',//数据源对象名称
      success: {},//回调方法
      source: 1,//来源
    };
    opt = Object.assign({}, defopt, opt);
    var oldCardList = store.state.cardListDM[opt.dataName];
    store.dispatch('Get', opt).then((res) => {
      Kaze.JudgmentNew(oldCardList, res[opt.dataName], opt.title)
    });
  },
  //蹲饼间隔时间
  SetInterval(time) {
    this.setIntervalindex = setInterval(() => {
      this.GetData();
    }, parseInt(time) * 1000);
  },

  // 初始化
  Init() {
    chrome.browserAction.setBadgeText({ text: 'Store' });
    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    this.setting = store.state.setting;
    this.GetData();
    this.SetInterval(this.setting.time);
    // 监听前台事件
    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.info == 'reload') {
        this.GetData();
      }
      if (request.reloadInterval) {
        // 重启定时器
        clearInterval(request.clearInterval);
        this.GetData();
        this.setting = store.state.setting;
        this.SetInterval(this.setting.time);
      }
     
      // console.log('Hello from the background', request, sender, sendResponse)
    })

    // 监听标签
    chrome.notifications.onClicked.addListener(id => {
      let cardlist = Object.values(store.state.cardListDM).reduce((acc, cur) => [...acc, ...cur], []).filter(x => x.id + "_" == id);
      if (cardlist != null && cardlist.length > 0) {
        chrome.tabs.create({ url: cardlist[0].url });
      } else {
        alert('o(╥﹏╥)o 时间过于久远...最近列表内没有找到该网站');
      }
    });

    chrome.runtime.onInstalled.addListener(details => {
      if (details.reason === 'install') {
        var urlToOpen = chrome.extension.getURL("welcome.html");
        chrome.tabs.create({
          url: urlToOpen,
        });
      }
      if (details.reason === 'update') {
        // 更新
      }
    });

    this.feedbackInfo = `<div>
      <span>
        如果有意见或建议或者是反馈问题或者是发现程序出现bug，可以添加<a
          href="https://jq.qq.com/?_wv=1027&k=Vod1uO13"
          >【蹲饼测试群】</a
        >反馈或<a href="Mailto:kaze.liu@qq.com.com">给我发邮件</a>反馈<br />
        也可以去github上查看<a
          href="https://github.com/Enraged-Dun-Cookie-Development-Team/Dun-Cookie-Vue"
          >Dun-Cookie-Vue</a
        ><br />
        也可以去Chrome应用商店查看更新，但是因为审核机制，更新速度会慢于QQ群和github
        <br />
        <br />
        <div style="color: #aaa">
          获取更新机制因为没钱买服务器，现在正在想办法
        </div>
      </span>
    </div>`;

    if (this.isTest) {
      store.commit('changeToTest');
      clearInterval(this.setIntervalindex);
      let testIntervalTime = store.state.testIntervalTime;
      this.SetInterval(testIntervalTime);
      getSourceInfoList.bili.url = `test/bJson.json?host_uid=161775300`;
      getSourceInfoList.weibo.url = `test/wJson.json?type=uid&value=6279793937&containerid=1076036279793937`;
      getSourceInfoList.yj.url = `test/yJson.json`;
      getSourceInfoList.cho3.url = `test/cJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
      getSourceInfoList.ys3.url = `test/ysJson.json?type=uid&value=6441489862&containerid=1076036441489862`;
      getSourceInfoList.sr.url = `test/srJson.json`;
    }
  }
}


let getSourceInfoList = {
  bili: {
    url: 'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=161775300&offset_dynamic_id=0&need_top=0&platform=web',
    title: 'B站',
    dataName: 'bili',
    source: 0,
  },
  weibo: {
    url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6279793937&containerid=1076036279793937',
    title: '官方微博',
    dataName: 'weibo',
    source: 1,
  },
  yj: {
    url: 'https://ak-fs.hypergryph.com/announce/IOS/announcement.meta.json',
    title: '通讯组',
    dataName: 'yj',
    source: 2,
  },
  cho3: {
    url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=6441489862&containerid=1076036441489862',
    title: '朝陇山',
    dataName: 'cho3',
    source: 3,
  },
  ys3: {
    url: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=7506039414&containerid=1076037506039414',
    title: '一拾山',
    dataName: 'ys3',
    source: 4,
  },
  sr: {
    url: 'https://monster-siren.hypergryph.com/api/news',
    title: '塞壬唱片',
    dataName: 'sr',
    source: 5,
  }
}

Kaze.Init();