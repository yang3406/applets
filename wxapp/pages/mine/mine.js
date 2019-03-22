const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    balance: 0, //用户余额
    userInfo: {},
    hasUserInfo: false,
    orderCount: 0, //订单数
  },
  onLoad: function (options) {
    let that = this;
    if (theApp.globalData.userInfo) {
      that.setData({
        userInfo: theApp.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      wx.getUserInfo({
        success: res => {
          // 可以将 res 发送给后台解码出 unionId
          theApp.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }, fail(err) { //errMsg: "getUserInfo:fail auth deny"  用户拒绝授权获取用户信息
          console.dir('wx.getUserInfo--fail:',err);
        }
      });
    }
  },
  onShow: function () {
    let that = this;
    if (util.isNull(wx.getStorageSync('wxapp_openid'))) { //这个页面不知道为什么明明在data里赋值了，却还是空的。只好用这种写法代替，其他页面的，仍然用data里的openid变量来判断。
      theApp.wxLoginCallback = function () {
        that.setData({
          parkuserid: wx.getStorageSync('wxapp_parkuserid'),
          openid: wx.getStorageSync('wxapp_openid'),
          mobileno: wx.getStorageSync('wxapp_mobileno')
        });
        //获取用户余额
        that.getBalance();
        //获取订单数
        that.getOrderList();
      };
    } else {
      that.setData({
        parkuserid: wx.getStorageSync('wxapp_parkuserid'),
        openid: wx.getStorageSync('wxapp_openid'),
        mobileno: wx.getStorageSync('wxapp_mobileno')
      });
      //获取用户余额
      that.getBalance();
      //获取订单数
      that.getOrderList();
    }
  },
  //获取账户余额信息
  getBalance: function () {
    let that = this;
    var cmd = new fetch("balanceinquiry");
    cmd.parkuserid = that.data.parkuserid;
    cmd.mobileno = that.data.mobileno;
    cmd.success = function (data) {
      if (data.status == 1) {
        that.setData({
          balance: data.data.price
        });
      }
      else {
        if (data.code == "member_not_exist") {
          wx.clearStorageSync();
          wx.redirectTo({
            url: '../index/index',
          });
        }
        else {
          util.showModal(data.msg);
        }
      }
    };
    cmd.execute("memberapi");
  },
  //获取订单数
  getOrderList: function () {
    let that = this;
    var cmd = new fetch('getorderlist');
    cmd.parkuserid = that.data.parkuserid;
    cmd.success = function (data) {
      if (data.status == 1) {
        let result = data.data;
        that.setData({
          orderCount: result.count
        });
      }
      else if (data.status == 0) {
        util.showModal(data.msg);
      }
    };
    cmd.execute("transactionapi");
  },
})