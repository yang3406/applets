Page({
  data: {

  },
  onLoad: function (options) {

  },
  onShow: function () {

  },
  //扫码
  tapToScanCode: function () {
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        wx.navigateTo({
          url: res.path,
        });
      }
    });
  },
  //手动输入泊位去停车
  tapToInput: function () {
    wx.navigateTo({
      url: '../gotopark/gotopark',
    })
  }
})