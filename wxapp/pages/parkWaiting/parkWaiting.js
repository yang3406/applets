const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    isHideContainer: true,
    total: 3,
    currentPercent: 1,
    sto: '',
    berthcode: '',
    src: 'http://183.62.162.254:8899/Files/SelectMusic/ding.mp3',
    parkSuccess: false, //标识是否停车成功
  },
  onLoad: function (options) {
    let that = this;
    that.setData({
      berthcode: options.berthcode,
      formid: options.formid
    });
    console.log('onLoad事件里的formid：',options.formid);
    //判断是否有进行中订单
    that.getMebParking();
  },
  //百分比进度条
  go: function () {
    let that = this;
    that.setData({
      currentPercent: that.data.currentPercent + 1
    });
    if (that.data.currentPercent > 50) {
      clearInterval(that.data.sto);
      that.setData({
        sto: setInterval(function () {
          that.go();
        }, 15 * that.data.total)
      });
    }
    //判断接口是否返回停车成功
    if (that.data.parkSuccess) { //是
      // if (that.data.currentPercent <= 100) {
      clearInterval(that.data.sto);
      // }
    } else { //否
      if (that.data.currentPercent == 98) { //请求接口中，在等待接口返回，百分比是98%
        clearInterval(that.data.sto);
      }
    }
  },
  //用于页面初始化就判断是否有订单，有直接去当前停车页，没有就执行停车
  getMebParking: function () {
    console.log('进入getMebParking');
    let that = this;
    var cmd = new fetch('parking');
    cmd.parkuserid = that.data.parkuserid;
    cmd.success = function (data) {
      console.log('getMebParking执行完毕');
      if (data.status == 1) {
        if (data.code == "is_parking") {
          wx.redirectTo({
            url: '../nowpark/nowpark',
          });
        } else { //没有订单
          //初始化百分比
          that.setData({
            // isHideContainer: false,
            sto: setInterval(function () {
              that.go();
            }, 5 * that.data.total)
          });
          that.data.sto; //调用更新百分比进度

          //执行停车
          that.newParkApply();
        }
      }
      else {
        wx.hideLoading(function () {
          util.showModal(data.msg);
        });
      }
    }
    cmd.execute("transactionapi");
  },
  //停车
  newParkApply: function () {
    console.log('进入newParkApply');
    let that = this;
    var cmd = new fetch('newparkapply');
    cmd.parkuserid = that.data.parkuserid;
    cmd.mobileno = that.data.mobileno;
    cmd.openid = that.data.openid;
    cmd.berthcode = that.data.berthcode;
    console.log('newParkApply接口中的formi:',that.data.formid);
    cmd.formid = that.data.formid;
    /*//预后付费都处理
     if (payMethod == 1) {
      cmd.time = chooseDuration; // 停车时长
      cmd.paypwd = paypwd; // 支付密码
    }
    else if (payMethod == 3) {
      cmd.time = '';
      cmd.paypwd = '';
    }    
    */
    cmd.ordertype = 3; //  1 预付费  3后付费
    cmd.time = '';
    cmd.paypwd = '';
    // cmd.ifnewenergycar = ifnewenergycar; // 是否新能源车
    // cmd.platenumber = choosedCarCode; // 新能源车牌号
    cmd.success = function (data) {
      console.log('newParkApply执行完毕');
      if (data.status == 1) {
        //停车成功之后接口如果请求时间太长，那么在此循环查询进行中订单数据是否回传。
        util.showLoading(function () {
          that.getMebParkingjump(that.data.parkuserid);
        });
      }
      else {
        if (data.code == "free_time") {
          util.showModal(data.msg, true, function () {
            // that.morrowBuyTime(parkuserid, tel, chooseDuration, berthcode, paypwd, ifnewenergycar, choosedCarCode, payMethod);
          });
        }
        else if (data.code == "bind_credit") {
          util.showModal(data.msg, true, function () {
            // window.location.href = "addCard.html" + "?version=" + (new Date()).getTime();
          }, '取消', '去绑卡');
        } else if (data.code == "default_credit") {
          util.showModal(data.msg, true, function () {
            // window.location.href = "paymentCard.html" + "?version=" + (new Date()).getTime();
          }, "取消", "设置默认卡");
        }
        else if (data.code == "Over_TimeArrears") {
          util.showModal(data.msg, true, function () {
            // window.location.href = "parkrecord.html?showtab=1" + "&version=" + (new Date()).getTime();
          }, '取消', '去补缴');
        }
        else if (data.code == "check_userstatus") {
          util.showModal(data.msg);
        }
        else if (data.code == "pwd_lock") {
          util.showModal(data.msg, function () {
            // window.location.href = "retrievePassword.html" + "?version=" + (new Date()).getTime();
          });
        }
        else {
          util.showModal(data.msg, false, function () {
            //后退到上一页
            wx.navigateBack({
              delta: 1
            })
          });
        }
      }
    };
    cmd.execute("transactionapi");
  },
  //用于轮询用户是否有进行中订单
  getMebParkingjump: function () {
    let that = this;
    var cmd = new fetch('parking');
    cmd.parkuserid = that.data.parkuserid;
    console.log('getMebParkingjump接口参数parkuserid：', that.data.parkuserid);
    cmd.success = function (data) {
      if (data.status == 1) {
        if (data.code == "is_parking") {
          //标识停车成功了
          that.setData({
            parkSuccess: true
          });

          //播放成功音
          wx.playBackgroundAudio({
            dataUrl: that.data.src,
            title: '成功-叮ing',
            coverImgUrl: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
            success: function (res) {
              wx.redirectTo({
                url: '../nowpark/nowpark',
              });
            },
            fail: function (err) {
              util.showModal(err);
            }
          });
        }
        else {
          setTimeout(function () {
            util.showLoading(function () {
              that.getMebParkingjump();
            });
          }, 1500);
        }
      }
      else {
        wx.hideLoading(function () {
          util.showModal(data.msg);
        });
      }
    }
    cmd.execute("transactionapi");
  },
})