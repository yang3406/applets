const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    ordercode: '',
    item: {},
  },
  onLoad: function (options) {
    this.setData({
      ordercode: options.ordercode
    });
  },
  onShow: function () {
    let that = this;
    //获取详情
    util.showLoading(function () {
      that.getOrderConsumeDetail();
    });
  },
  //获取订单详情
  getOrderConsumeDetail: function (ordercode) {
    let that = this;
    var cmd = new fetch('OrderDetail');
    cmd.ordercode = that.data.ordercode;
    cmd.success = function (data) {
      if (data.status == 1) {
        var result = data.data;
        if (!util.isNull(result.dtOrderDetail)) {
          var item = result.dtOrderDetail[0];
          //订单状态
          switch (item.OrderStatus) {
            case "1":
              item.OrderStatus = '进行中';
              break;
            case "2":
              item.OrderStatus = '退费订单';
              break;
            case "3":
              item.OrderStatus = '欠费订单';
              break;
            case "4":
              item.OrderStatus = '已完成';
              break;
            case "5":
              item.OrderStatus = '未缴费';
              break;
            default:
              break;
          }
          var theEnd = item.EndParkingTime.split(' ')[1];
          item.chargeDuration = item.StartParkingTime +'至'+ theEnd;
          //停车时长
          var theApply = item.ActualDuration;
          if (theApply < 60) {
            // if (theApply>0){
            item.ActualDuration = theApply + '分钟';
            // }
          }
          else {
            var theHours = Math.floor(theApply / 60);
            var theMinutes = theApply - theHours * 60;
            if (theHours > 0) {
              if (theMinutes > 0) {
                item.ActualDuration = theHours + '小时' + theMinutes + '分钟';
              }
              else {
                item.ActualDuration = theHours + '小时';
              }
            }
            else {
              if (theMinutes > 0) {
                item.ActualDuration = theMinutes + '分钟';
              }
              else {
                item.ActualDuration = '0';
              }
            }
          }
          that.setData({
            item: item
          });
        }
        else {
          util.showModal(data.msg);
        }
      }
      else if (data.status == 0) {
        util.showModal(data.msg);
      }
      wx.hideLoading();
    };
    cmd.execute("transactionapi");
  },
})