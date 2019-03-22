const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    item:{}
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.getarrearslist();
  },
  //获取欠费单
  getarrearslist: function () {
    let that = this;
    let cmd = new fetch('getarrearslist');
    cmd.parkuserid = wx.getStorageSync('wxapp_parkuserid');
    cmd.success = function (data) {
      if (data.status == 1) {
        var res = data.data;
        if (res.count > 0) {
          that.setData({item:res.items[0]});
        } else {
          //没有欠费单，显示无记录

        }
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("memberapi");
  },
})