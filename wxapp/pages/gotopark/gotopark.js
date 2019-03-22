const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    whichBox: 0, //泊位区里，当前选中的是哪个格子，0代表没选中任何格子。
    codeArr: ['', '', '', '', '', ''], //用户输入的泊位
    isHideKeyBoardNum: true, //是否隐藏键盘
    berthCanUse: false, //泊位是否可用
    berthcode: '', //检测可用之后存储泊位
    needpaytimespan: '请输入地面上标记的6位泊位号', //泊位状态接口返回的泊位下的提示语
    balance: 0, //泊位状态接口返回的余额
    isShowKeyBgcolor: false,
  },
  onLoad: function (options) {
    //进入停车页面就选中第一个格子并显示键盘
    this.setData({
      whichBox: 1,
      isHideKeyBoardNum: false //显示键盘
    });
  },
  //点击泊位格子
  clickBox: function (e) {
    this.setData({
      whichBox: e.currentTarget.dataset.whichBox
    });
    if (this.data.isHideKeyBoardNum) {
      this.setData({
        isHideKeyBoardNum: !this.data.isHideKeyBoardNum
      });
    }
  },
  //点击数字键盘的按键
  tapKey: function (event) {
    let that = this;
    let whichKey = event.currentTarget.dataset.whichKey;
    //设置按键的点击态样式
    that.setData({
      isShowKeyBgcolor: whichKey
    });
    setTimeout(function () {
      that.setData({
        isShowKeyBgcolor: ''
      });
    }, 50);
    //收集点击的按键组成泊位数
    this.setData({
      ['codeArr[' + (that.data.whichBox - 1) + ']']: whichKey,
    });
    if (this.data.whichBox < 6) {
      this.setData({
        whichBox: this.data.whichBox + 1
      });
    }
    //如果格子的内容已完整，则请求接口
    let count = 0;
    for (let i = 0; i < this.data.codeArr.length; i++) {
      if (!util.isNull(this.data.codeArr[i])) {
        count++;
      }
    }
    if (count == 6) {
      //请求泊位状态接口
      util.showLoading(function () {
        that.getBerthNowstatus();
      });
    }

  },
  //点击数字键盘的删除
  tapDel: function (event) {
    let that = this;
    let whichKey = event.currentTarget.dataset.whichKey;
    //设置按键的点击态样式
    that.setData({
      isShowKeyBgcolor: whichKey
    });
    setTimeout(function () {
      that.setData({
        isShowKeyBgcolor: ''
      });
    }, 50);

    if (this.data.whichBox <= 6) {
      //如果格子里的内容为空，选中后一个格子
      if (util.isNull(this.data.codeArr[this.data.whichBox - 1])) {
        this.setData({
          whichBox: this.data.whichBox - 1
        });
      }
      else { //否则只清空格子的内容，选中框位置不变
        this.setData({
          ['codeArr[' + (that.data.whichBox - 1) + ']']: '',
        });
      }
    }

  },
  //关闭数字键盘
  tapClose: function () {
    this.setData({
      isHideKeyBoardNum: true,
      whichBox: 0
    });
  },
  //获取泊位状态
  getBerthNowstatus: function () {
    let that = this;
    var cmd = new fetch('berthstatus');
    cmd.berthcode = that.data.codeArr.join('');
    cmd.success = function (data) {
      if (data.status == 1) {
        if (data.code == 'no_parking') {
          // 可用，且无人停
          var result = data.data;
          that.setData({
            berthcode: that.data.codeArr.join(''),
            berthCanUse: true,
            needpaytimespan: result.needpaytimespan
          });
        }
        else if (data.code == 'is_parking') {
          that.setData({
            berthCanUse: false
          });
          util.showModal(data.msg);
        }
        else {
          that.setData({
            berthCanUse: false
          });
          util.showModal(data.msg);
        }
      }
      else {
        that.setData({
          berthCanUse: false
        });
        util.showModal(data.msg);
      }
      wx.hideLoading();
    };
    cmd.execute("transactionapi");
  },
  tapToPark: function (e) {
    if (this.data.berthCanUse == true && !util.isNull(this.data.berthcode)) {
      wx.navigateTo({
        url: '../parkWaiting/parkWaiting?berthcode=' + this.data.berthcode + '&formid=' + e.detail.formId,
      });
    }
  },
})