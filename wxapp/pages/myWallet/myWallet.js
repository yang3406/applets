const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    balance: 0.00, //用户余额
    active: 0,
    txtRecharge: '',
  },
  onLoad: function (options) {

  },
  onShow: function (options) {
    //获取用户余额
    this.getBalance();
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
  //选择快捷金额方式，切换样式
  chooseAmount: function (event) {
    this.setData({
      active: event.currentTarget.dataset.amount,
      txtRecharge: event.currentTarget.dataset.amount + '.00'
    });
  },
  inputToRecharge: function (e) {
    let theVal = e.detail.value;
    if (theVal.match(/\./ig) != null) {
      if (theVal != '.') {
        var dotLen = theVal.match(/\./ig).length;
        if (dotLen <= 1) {
          //有小数点的情况下：如果第一个数字是0，则去除小数点前多余的0，只留前一位，比如：0000.01 ，要的效果是0.01
          let str = theVal.substring(0, theVal.indexOf('.'));
          for (var i = 0; i < str.length; i++) {
            if (str[i] == 0) {
              if (i != str.length - 1) {
                theVal = theVal.substr(1);
              }
            }
          }
          //保留两位小数
          let str2 = theVal.substring(theVal.indexOf('.') + 1, theVal.length);
          if (str2.length <= 2) {
            this.setData({
              txtRecharge: theVal.replace(/[^\d|\.]/g, '')
            });
          } else {
            this.setData({
              txtRecharge: theVal.substring(0, theVal.indexOf('.') + 3) //截取到小数点后两位
            });
          }
        } else {
          this.setData({
            txtRecharge: this.data.txtRecharge
          });
        }
      } else {
        this.setData({
          txtRecharge: ''
        });
      }
    } else {
      this.setData({
        txtRecharge: theVal.replace(/[^\d|\.]/g, '')
      });
    }
  },
  //充值
  tapToRecharge: function () {
    let that = this;
    if (that.data.txtRecharge != 0) { //比如0.00
      //先调接口，获取签名等信息
      var cmd = new fetch("newpayrecharge");
      cmd.parkuserid = that.data.parkuserid;
      cmd.type = 6;
      cmd.price = that.data.txtRecharge;
      cmd.mobileno = that.data.mobileno;
      cmd.openid = that.data.openid;
      cmd.success = function (data) {
        if (data.status == 0) {
          util.showModal(data.msg);
        }
        else if (data.status == 1) {
          var datas = data.data;
          //调起支付
          wx.requestPayment({
            'timeStamp': datas.timeStamp,
            'nonceStr': datas.nonceStr,
            'package': datas.package,
            'signType': 'MD5',
            'paySign': datas.paySign,
            'success': function (res) { //调用支付成功
              util.showToast("您已充值成功");
            },
            // 'fail': function (res) { //用户取消支付，complete事件里也会捕捉到取消状态，所以这里不使用fail事件
            //   if (res.errMsg == 'requestPayment:fail cancel') {
            //     util.showModal("您已取消充值");
            //   }
            // },
            'complete': function (res) {
              //6.5.2 及之前版本中，用户取消支付不会触发 fail 回调，只会触发 complete 回调，回调 errMsg 为 'requestPayment:cancel'
              if (res.errMsg == 'requestPayment:fail cancel') {
                util.showModal("您已取消充值");
              } else if (res.errMsg == 'requestPayment:ok') {
                util.showToast("您已充值成功");
              } else {
                util.showModal(res.errMsg);
              }              
            }
          });
        }
      };
      cmd.execute("memberapi");
    } else {
      util.showModal('充值金额最小是0.01');
    }
  },
})