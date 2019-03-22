//app.js
var fetch = require('./utils/fetch');
var util = require('./utils/util.js');

App({
  onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    let that = this;
    //获得的用户登录态
    wx.checkSession({
      success() { //session 未过期，并且在本生命周期一直有效
        //获取openid等缓存，如果没有，则重新获取登录态
        var wxapp_openid = wx.getStorageSync('wxapp_openid');
        var wxapp_unionid = wx.getStorageSync('wxapp_unionid');
        if (util.isNull(wxapp_openid) || util.isNull(wxapp_unionid)) {
          // 登录
          that.toWXLogin();
        }
      },
      fail() { //登录态过期
        // 登录
        that.toWXLogin();
      }
    })

    // 获取用户的当前设置
    wx.getSetting({
      success: res => {
        //检查用户是否授权了 "scope.userInfo" 这个 scope
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }

      }
    })

  },
  //wx登录
  toWXLogin: function () {
    wx.login({
      success: res => {
        if (res.code) {
          let that = this;
          //发送 res.code 到后台换取 openId, sessionKey, unionId
          var cmd = new fetch('getwxappopenid');
          cmd.code = res.code;
          cmd.success = function (data) {
            if (data.status == 1) {
              let res = data.data;
              wx.setStorageSync('wxapp_openid', res.openid);
              wx.setStorageSync('wxapp_sessionkey', res.sessionkey);
              wx.setStorageSync('wxapp_unionid', res.unionid);
              if (!util.isNull(res.parkuserid) && !util.isNull(res.mobileno)) { //已注册宜停车才会有
                wx.setStorageSync('wxapp_parkuserid', res.parkuserid);
                wx.setStorageSync('wxapp_mobileno', res.mobileno);
              }

              // 由于 wx.login 是网络请求，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
              if (that.wxLoginCallback) {
                that.wxLoginCallback();
              }

            }
            else if (data.status == 0 || data.status == 2) {
              util.showModal(data.msg);
            }
          };
          cmd.execute("otherapi");
        } else {
          util.showModal('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  onShow: function () {
    wx.showShareMenu({
      withShareTicket: true,
      success: function () {

      }
    })
  },
  globalData: {
    userInfo: null
  },
  util: util
})