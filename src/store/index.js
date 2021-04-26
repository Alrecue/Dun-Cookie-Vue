import Vue from 'vue'
import Vuex from 'vuex'
import VuexWebExtensions from 'vuex-webextensions';


Vue.use(Vuex)

let KazeFun = {
    // 判断微博状态
    weiboGetdynamicType(dynamic) {
        // 0为视频 1为动态
        let type = -1;
        if (dynamic.hasOwnProperty("page_info") && dynamic.page_info.hasOwnProperty('type') && dynamic.page_info.type == "video") {
            type = 0;
        }
        else {
            type = 1;
        }
        return type;
    },
    // 处理微博内容
    weiboRegexp(text) {
        return text.replace(/<\a.*?>|<\/a>|<\/span>|<\span.*>|<span class="surl-text">|<span class='url-icon'>|<\img.*?>|全文|网页链接/g, '').replace(/<br \/>/g, '\n')
    },
}

// mutations  同步修改 修改值
// actions 异步 请求接口方法
// getters 简单计算
// index 入口
const actions = {
    // 获取数据
    Get({ commit, state }, opt) {
        // 处理莫名其妙出现的payload
        if (opt.hasOwnProperty('payload')) {
            opt = opt.payload;
        }
        try {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", opt.url, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                        opt.responseText = xhr.responseText;
                        // source: ['bili', 'weibo', 'yj', 'cho3', 'ys3', 'sr', 'gw']
                        if (opt.source == 0) {
                            commit('processBiliBili', opt);
                        }
                        else if (opt.source == 1 || opt.source == 3 || opt.source == 4) {
                            commit('processWeibo', opt);
                        } else if (opt.source == 2) {
                            commit('processYj', opt);
                        }
                        else if (opt.source == 5) {
                            commit('processSr', opt);
                        }
                        resolve(state.cardListDM);
                    }
                }
                xhr.send();
            })

        } catch (error) {
            console.log(error);
        }
    },
}

const state = {
    setting: {
        time: 15,
        source: [0, 1, 2, 3, 4, 5],
        fontsize: 0,
        imgshow: true,
        isTop: true
    },
    cardListDM: {},
    feedbackInfo: `<div>
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
    </div>`,
    dunIndex: 0,
    dunTime: new Date(),
    dunFristTime: new Date(),
    version: '2.0.14 内测版',
    testIntervalTime: 1
};

const mutations = {
    processWeibo(state, opt) {
        state.cardListDM[opt.dataName] = [];
        let data = JSON.parse(opt.responseText);
        if (data.ok == 1 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
            data.data.cards.forEach(x => {
                if (x.hasOwnProperty('mblog') && !x.mblog.hasOwnProperty('retweeted_status') && !x.mblog.hasOwnProperty('retweeted_status')) {
                    let dynamicInfo = x.mblog;
                    let weiboId = data.data.cardlistInfo.containerid;
                    let time = Math.floor(new Date(dynamicInfo.created_at).getTime() / 1000);
                    let imageList = dynamicInfo.pic_ids && dynamicInfo.pic_ids.map(x => `https://wx1.sinaimg.cn/large/${x}`);
                    state.cardListDM[opt.dataName].push({
                        time: time,
                        id: time,
                        isTop: x.mblog.hasOwnProperty('isTop') && x.mblog.isTop == 1,
                        judgment: time,
                        dynamicInfo: KazeFun.weiboRegexp(dynamicInfo.text),
                        html: dynamicInfo.text,
                        image: dynamicInfo.bmiddle_pic || dynamicInfo.original_pic,
                        imageList: imageList,
                        type: KazeFun.weiboGetdynamicType(dynamicInfo),
                        source: opt.source,
                        url: "https://weibo.com/" + weiboId.substring((weiboId.length - 10), weiboId.length) + "/" + x.mblog.bid,
                        detail: []
                    })
                }

            });
            state.cardListDM[opt.dataName].sort((x, y) => y.judgment - x.judgment);
            // Kaze.JudgmentNew(Kaze.cardListDM[opt.dataName], this.cardlist[opt.dataName], opt.title, opt.source);
            // state.cardListDM[opt.dataName] = this.cardlist[opt.dataName];
        }
    },
    processBiliBili(state, opt) {
        state.cardListDM['bili'] = [];
        let data = JSON.parse(opt.responseText);
        if (data.code == 0 && data.data != null && data.data.cards != null && data.data.cards.length > 0) {
            data.data.cards.forEach(x => {
                if (x.desc.type == 2 || x.desc.type == 4 || x.desc.type == 8 || x.desc.type == 64) {
                    let dynamicInfo = JSON.parse(x.card);
                    let card = {
                        time: x.desc.timestamp,
                        id: x.desc.timestamp,
                        judgment: x.desc.timestamp,
                        imageList: dynamicInfo.item.pictures && dynamicInfo.item.pictures.map(x => x.img_src),
                        source: opt.source,
                    };
                    //  desc.type  8 是视频 64是专栏 2是动态 4是无图片动态
                    if (x.desc.type == 2) {
                        card.image = (dynamicInfo.item.pictures && dynamicInfo.item.pictures.length > 0) ? dynamicInfo.item.pictures[0].img_src : null;
                        card.dynamicInfo = dynamicInfo.item.description;
                        card.type = 2;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                    } else if (x.desc.type == 4) {
                        card.dynamicInfo = dynamicInfo.item.content;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                        card.type = 4;
                    } else if (x.desc.type == 8) {
                        card.image = dynamicInfo.pic;
                        card.dynamicInfo = dynamicInfo.dynamic;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                        card.type = 8;
                    } else if (x.desc.type == 64) {
                        card.image = (dynamicInfo.image_urls && dynamicInfo.image_urls.length > 0) ? dynamicInfo.image_urls[0] : null;
                        card.dynamicInfo = dynamicInfo.summary;
                        card.url = `https://t.bilibili.com/${x.desc.dynamic_id_str}`
                        card.type = 64;
                    }
                    state.cardListDM['bili'].push(card);
                }

            });
            state.cardListDM['bili'].sort((x, y) => y.judgment - x.judgment);

            // Kaze.JudgmentNew(Kaze.cardListDM.bili, this.cardlist, 'B站', 0);
            // Kaze.cardListDM.bili = this.cardlist;
        }
    },
    processYj(state, opt) {
        state.cardListDM['yj'] = [];
        let data = JSON.parse(opt.responseText);
        data.announceList.forEach(x => {
            if (x.announceId != 94 && x.announceId != 98 && x.announceId != 192 && x.announceId != 95 && x.announceId != 97) {
                let time = `${new Date().getFullYear()}/${x.month}/${x.day} ${state.setting.isTop ? '23:59:59' : '00:00:00'}`;
                state.cardListDM['yj'].push({
                    time: Math.floor(new Date(time).getTime() / 1000),
                    judgment: x.announceId,
                    id: x.announceId,
                    dynamicInfo: x.title,
                    source: opt.source,
                    url: x.webUrl,
                });
            }
        });
        state.cardListDM['yj'].sort((x, y) => y.judgment - x.judgment);
    },
    processSr(state, opt) {
        state.cardListDM['sr'] = [];
        let data = JSON.parse(opt.responseText);
        if (data && data.data && data.data.list) {
            data.data.list.forEach(x => {
                let time = Math.floor(new Date(`${x.date} ${state.setting.isTop ? '23:59:59' : '00:00:00'}`).getTime() / 1000);
                state.cardListDM['sr'].push({
                    time: time,
                    id: x.cid,
                    judgment: time,
                    dynamicInfo: x.title,
                    source: opt.source,
                    url: `https://monster-siren.hypergryph.com/info/${x.cid}`,
                })
            });
            state.cardListDM['sr'].sort((x, y) => y.judgment - x.judgment);
            // Kaze.JudgmentNew(Kaze.cardListDM.sr, this.cardlist, '塞壬唱片', 5);
            // Kaze.cardListDM.sr = this.cardlist;
        }
    },
    // 修改蹲饼次数和时间
    dunDate(state) {
        console.log(state.dunIndex);
        state.dunIndex++;
        state.dunTime = new Date();
    },
    // 清除内容
    clearList(state, listName) {
        state.cardListDM[listName] = [];
    },
    // 修改设置
    changeSetting(state, settingDM) {
        state.setting = Object.assign({},state.setting, settingDM);
    },

    // 更换为测试模式
    changeToTest(state) {
        state.version = `${state.version}【已启用调试模式】 刷新时间临时调整为${state.testIntervalTime}秒`;
        state.setting.time = state.testIntervalTime;
    }
};

export default new Vuex.Store({
    state,
    mutations,
    actions,
    plugins: [VuexWebExtensions()],
    modules: {
    }
})
