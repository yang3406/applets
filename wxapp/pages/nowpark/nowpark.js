const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    theHours: 0, //计时的 小时
    theMinutes: 0, //计时的 分钟
    theSeconds: 0, //计时的 秒
    orderObj: {},
    zjs: '', //正计时
    zjsTime: 0, //记录正计时秒数,
    waveSrcBase:'http://183.62.162.254:8899/Files/wxappImg/'
  },
  onShow: function (options) {
    //获取进行中订单
    this.getMebParking();
  },
  //获取进行中订单
  getMebParking: function () {
    let that = this;
    let cmd = new fetch('parking');
    cmd.parkuserid = that.data.parkuserid;
    cmd.success = function (data) {
      if (data.status == 1) {
        if (data.code == "no_park") {
          that.setData({
            theHours: '00',
            theMinutes: '00',
            theSeconds: '00'
          });
          setTimeout(function(){
            //返回首页
            wx.navigateTo({
              url: '../roadList/roadList',
            })
          },100);          
        }
        else {
          var result = data.data;
          that.setData({
            orderObj: result
          });
          /*if (result.OrderType == 1) { //预付费类型
            if (result.RemainTime > 0) {
              $('.headline').text("停车倒计时");
              // 停止倒计时
              clearTimeout(djs);
              i = 1;
              clearTimeout(zjs);
              djsTime = result.RemainTime;
              // 开始倒计时
              htmlObj.clockDown($('.clockdown_panel'));
              // 点击续费按钮，跳转到我要停车页面
              $('.btn_renew').removeClass('disable_click_bgc');
              $('.btn_renew').on('click', function () {
                window.location.href = "gotopark.html?renewapply=" + "true" + "&version=" + (new Date()).getTime();
              });
              // 如果页面上剩余的倒计时数跟数据库的剩余倒计时之间的误差大于5秒，则重新赋值重新开始倒计时
              if (djsTime - result.RemainTime > 5) {
                clearTimeout(djs);
                djsTime = result.RemainTime;
                i = 1;
                // 重新倒计时
                htmlObj.clockDown($('.clockdown_panel'));
              }
            }
            else if (result.RemainTime <= 0) {
              // 超时则停止倒计时，开始正计时
              $('.headline').text("您已超时");
              $('.clockdown_panel').css({ 'animation': 'runit 1s infinite ease-out' });
              // 停止倒计时
              clearTimeout(djs);
              i = 1;
              clearTimeout(zjs);
              // 当剩余秒数为负，表示这是超时时间
              zjsTime = Math.abs(result.RemainTime);
              // 开始正计时
              htmlObj.clockUp($('.clockdown_panel'));
              if (result.RemainTime - zjsTime > 5) {
                clearTimeout(zjs);
                zjsTime = result.RemainTime;
                // 重新正计时
                htmlObj.clockUp($('.clockdown_panel'));
              }
              // 续费按钮变灰，点击之后弹框提示
              $('.btn_renew').addClass('disable_click_bgc');
              $('.btn_renew').on('click', function () {
                Weixin.showAlert("提示：您已超时，无法续费，请尽快驶离！")
              });
            }
            $('#paidCount').text(result.ApplyPrice);
          }
          else if (result.OrderType == 2) {  //后付费类型 */
          //后付费是正计时
          clearTimeout(that.data.zjs);
          that.setData({
            zjsTime: Math.abs(result.RemainTime)
          });
          // 开始正计时
          that.clockUp();
          if (result.RemainTime - that.data.zjsTime > 5) {
            clearTimeout(that.data.zjs);
            that.setData({
              zjsTime: result.RemainTime
            });
            // 重新正计时
            that.clockUp();
          }
          // }
        }
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("transactionapi");
  },
  clockUp: function () {
    let that = this;
    that.setData({
      zjsTime: that.data.zjsTime + 1
    });
    var timeUp = that.data.zjsTime;
    var theHour = Math.floor(timeUp / (24 * 60 * 60));
    timeUp -= theHour * (24 * 60 * 60);
    var theMinute = Math.floor(timeUp / (60 * 60));
    timeUp -= theMinute * (60 * 60);
    var theSecond = Math.floor(timeUp / 60);
    timeUp -= theSecond * 60;
    // 小时
    if (theMinute < 10) {
      that.setData({
        theHours: '0' + theMinute
      });
    }
    else if (theMinute >= 10) {
      that.setData({
        theHours: theMinute
      });
    }
    else if (theMinute == 0) {
      that.setData({
        theHours: '00'
      });
    }
    // 分钟
    if (theSecond < 10) {
      that.setData({
        theMinutes: '0' + theSecond
      });
    }
    else if (theSecond >= 10) {
      that.setData({
        theMinutes: theSecond
      });
    }
    else if (theSecond == 0) {
      that.setData({
        theMinutes: '00'
      });
    }
    // 秒
    if (timeUp < 10) {
      that.setData({
        theSeconds: '0' + timeUp
      });
    }
    else if (timeUp >= 10) {
      that.setData({
        theSeconds: timeUp
      });
    }
    else if (timeUp == 0) {
      that.setData({
        theSeconds: '00'
      });
    }
    that.setData({
      zjs: setTimeout(function () {
        that.clockUp();
      }, 1000)
    });
  }
})