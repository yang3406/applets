import {
  ClassicModule
} from "../../modules/classic.js";
let classicModule = new ClassicModule();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classic: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    classicModule.getLatest((res) => {
      this.setData({
        classic: res
      });
    })
  },
  onclick: function () {
    classicModule.getLatest((res) => {
      this.setData({
        classic: res
      });
    })
  },
  preview: function () {
    console.log("点击 preview");
  },
  next: function () {
    console.log("点击next");
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("我点击了");
  },
  onLike: function (e) {
    console.log(e.detail);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})