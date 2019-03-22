const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    pageindex: 1,
    items: []
  },
  onLoad: function (options) {

  },
  onShow: function () {
    let that = this;
    if (util.isNull(that.data.openid)) {
      theApp.wxLoginCallback = function () {
        that.setData({
          parkuserid: wx.getStorageSync('wxapp_parkuserid'),
          openid: wx.getStorageSync('wxapp_openid'),
          mobileno: wx.getStorageSync('wxapp_mobileno')
        });
        //获取订单列表
        that.setData({
          pageindex: 1
        });
        that.getorderlist();
      };
    } else {
      //获取订单列表
      that.setData({
        pageindex: 1
      });
      that.getorderlist();
    }
  },
  //获取订单列表
  getorderlist: function () {
    let that = this;
    let cmd = new fetch('getorderlist');
    cmd.parkuserid = wx.getStorageSync('wxapp_parkuserid');
    cmd.pageindex = that.data.pageindex;
    cmd.success = function (data) {
      if (data.status == 1) {
        var res = data.data;
        if (res.count > 0) {
          //隐藏无记录
          that.setData({
            isHasData: true
          });
          let items = res.items;
          for (let i = 0; i < items.length; i++) {
            //订单状态
            switch (items[i].OrderStatus) {
              case "1":
                items[i].OrderStatus = '进行中';
                break;
              case "2":
                items[i].OrderStatus = '退费订单';
                break;
              case "3":
                items[i].OrderStatus = '欠费订单';
                break;
              case "4":
                items[i].OrderStatus = '已完成';
                break;
              case "5":
                items[i].OrderStatus = '未缴费';
                break;
              default:
                break;
            }
            //停车时长
            var theApply = items[i].ActualDuration;
            if (theApply < 60) {
              // if (theApply>0){
              items[i].ActualDuration = theApply + '分钟';
              // }
            }
            else {
              var theHours = Math.floor(theApply / 60);
              var theMinutes = theApply - theHours * 60;
              if (theHours > 0) {
                if (theMinutes > 0) {
                  items[i].ActualDuration = theHours + '小时' + theMinutes + '分钟';
                }
                else {
                  items[i].ActualDuration = theHours + '小时';
                }
              }
              else {
                if (theMinutes > 0) {
                  items[i].ActualDuration = theMinutes + '分钟';
                }
                else {
                  items[i].ActualDuration = '0';
                }
              }
            }
          }
          that.setData({
            items: items
          });
        } else {
          //无记录
          that.setData({
            isHasData: false
          });
        }
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("transactionapi");
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    this.setData({
      pageindex: this.data.pageindex++
    });
    this.getorderlist();
  },

})