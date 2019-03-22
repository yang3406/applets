const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    unionid: wx.getStorageSync('wxapp_unionid'),
    sessionid: wx.getStorageSync('wxapp_sessionkey'),
    isHideContainer: true, //是否隐藏整个页面元素，用来判断是否绑定了宜停车账号，已绑则跳地图页，未绑则显示首页去绑定。
    currentStep: 1, //当前进行的步骤：绑定账户、开通免密支付、扫码停车。
    beforeGetPhoneNum: true, //点击【立即绑定】按钮之前，用来决定手动注册页面是否显示
    currentTel: '', // 当前用户的手机号
    /*这块的变量是手动注册用到的 begin*/
    btnGetCodeText: '发送验证码', //获取验证码按钮的文字
    errTips: '', //验证用的，页面顶部错误消息提示
    txtTel: '',
    lastTel: '', //最近一次输入的手机号
    txtCode: '',
    canGetCode: false, //决定发送验证码按钮的字体色，是否可获取验证码
    canRegist: false, //决定提交按钮的背景色，是否可注册
    isHideTelIconClear: true,
    isHideCodeIconClear: true,
    reg: "^1[3|4|5|7|8|9]{1}[0-9]{9}$", //验证手机号
    countdown: 60,  //倒计时60s
    timeoutobj: null,
    txtTelAutoFocus: false,
    txtCodeAutoFocus: false
    /*这块的变量是手动注册用到的 end*/
  },
  onLoad: function (options) {
    var that = this;
    if (util.isNull(that.data.openid)) {
      theApp.wxLoginCallback = function () {
        that.setData({
          parkuserid: wx.getStorageSync('wxapp_parkuserid'),
          openid: wx.getStorageSync('wxapp_openid'),
          mobileno: wx.getStorageSync('wxapp_mobileno'),
          unionid: wx.getStorageSync('wxapp_unionid'),
          sessionid: wx.getStorageSync('wxapp_sessionkey')
        });
        //检查当前用户是否注册了宜停车账号
        that.checkIsRegist();
      };
    } else {
      //检查当前用户是否注册了宜停车账号
      that.checkIsRegist();
    }
  },
  //检查当前用户是否注册了宜停车账号
  checkIsRegist: function () {
    let that = this;
    let parkuserid = that.data.parkuserid;
    if (util.isNull(parkuserid)) { //未注册
      //显示第一步的绑定界面
      that.setData({
        isHideContainer: false,
        currentStep: 1
      });
    } else { //已注册
      //到第二步
      that.setData({
        isHideContainer: false,
        currentStep: 2
      });
      //判断是否开通免密支付
      that.checkWXAutoPay();
    }
  },
  //调起获取手机号的授权
  getPhoneNumber: function (e) {
    let that = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') { //未授权
      //显示手动注册界面，并自动聚焦手机号文本框
      that.setData({
        beforeGetPhoneNum: false,
        txtTelAutoFocus: true,
        txtTel: '', //每次进入手动注册要清空文本框
        txtCode: ''
      });
    } else { //同意了授权
      //encryptedData 解密
      that.decrypt(e.detail.encryptedData, e.detail.iv);
    }
  },
  //encryptedData 解密
  decrypt: function (encryptedData, iv) {
    let that = this;
    let cmd = new fetch('decrypt');
    cmd.dataStr = encryptedData;
    cmd.key = that.data.sessionid;
    cmd.iv = iv;
    cmd.success = function (data) {
      if (data.status == 1) {
        var result = data.data;
        //存下手机号、appid、timestamp
        that.setData({
          mobileno: result.purePhoneNumber
          //现在用不到下面两个返回参数
          // watermark_appid: result.watermark.appid,
          // watermark_timestamp: result.watermark.timestamp
        });
        //检测用户手机号是否已注册、已注销、未注册等状态
        that.checkTel(result.purePhoneNumber).then((res) => {
          //1、自动注册（自动和手动注册接口都是register）
          that.register(1, res);
        });
      }
      else if (data.code == 'error') {
        util.showModal(data.msg);
        wx.clearStorageSync();
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("otherapi");
  },
  //是否开通免密支付
  checkWXAutoPay: function () {
    let that = this;
    let cmd = new fetch('checkwxautopay');
    cmd.openid = that.data.openid;
    cmd.success = function (data) {
      if (data.status == 1) {
        let isautopay = data.data.isautopay; //是否开启签约
        if (isautopay == "True") { //已开通          
          //前进到第三步
          that.setData({
            currentStep: 3
          });
          wx.redirectTo({
            url: '../roadList/roadList',
          })
        } else if (isautopay == "False") { //未开通
          //前进到第二步
          that.setData({
            currentStep: 2
          });
        }
      }
      else if (data.code == "error") {
        util.showModal(data.msg);
        wx.clearStorageSync();
      } else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("otherapi");
  },
  //开通免密支付
  openautopay: function () {
    let that = this;
    let cmd = new fetch('openautopay');
    cmd.openid = that.data.openid;
    cmd.mobile = that.data.mobileno;
    cmd.parkuserid = that.data.parkuserid;
    cmd.success = function (data) {
      wx.hideLoading();
      if (data.status == 1) {
        var res = data.data;
        wx.navigateToMiniProgram({
          appId: 'wxbd687630cd02ce1d',
          path: 'pages/index/index',
          extraData: {
            appid: res.appid,
            contract_code: res.contract_code,
            contract_display_account: res.contract_display_account,
            mch_id: res.mch_id,
            notify_url: res.notify_url,
            plan_id: res.plan_id,
            request_serial: res.request_serial,
            timestamp: res.timestamp,
            sign: res.sign
          },
          // envVersion: 'trial',
          success(res) {
            // 成功跳转到签约小程序 
            wx.redirectTo({
              url: '../roadList/roadList',
            });
          },
          fail(res) {
            // 未成功跳转到签约小程序
            util.showModal(res.errMsg);
          }
        });
      }
      else if (data.status == 0) {
        util.showModal(data.msg);
      } else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("otherapi");
  },
  //手机号的输入事件
  telInput: function (e) {
    this.setData({
      txtTel: e.detail.value.replace(/[^\d]/g, '')
    });
    let txtTelVal = this.data.txtTel;
    let lastTel = this.data.lastTel;
    let countdown = this.data.countdown;
    if (txtTelVal.length > 0) {
      this.setData({
        isHideTelIconClear: false
      });
    }
    if (txtTelVal.length == 11) {
      if (!util.isNull(lastTel)) {
        if (lastTel != txtTelVal) {
          //如果发送验证码之后修改了手机号，验证码发送之后，就算换成了其他手机号，也要等倒计时自己倒完才能重新获取验证码。
          /*clearTimeout(timeoutobj);
          this.setData({
            countdown: 60,
            btnGetCodeText: '重新获取'
          });*/
        }
      }
      if (!this.checkTelPattern()) {
        this.setData({
          errTips: '手机号码格式不正确'
        });
      }
      else {
        if (this.data.txtCode.length == 6) {
          this.setData({
            canRegist: true
          });
        }
        //设置验证码按钮样式
        if (countdown == 0 || countdown == 60) {
          this.setData({
            canGetCode: true
          });
        }
        else {
          this.setData({
            canGetCode: false
          });
        }
      }
      //存储最近一次输入的手机号
      this.setData({
        lastTel: txtTelVal
      });
    } else {
      this.setData({
        canGetCode: false,
        canRegist: false
      });
    }
  },
  //手机号文本框的失焦事件
  telBlur: function (e) {
    this.setData({
      isHideTelIconClear: true
    });
  },
  //获取验证码的点击事件
  tabGetCode: function (e) {
    let that = this;
    let txtTel = this.data.txtTel;
    let countdown = this.data.countdown;
    if (countdown == 0 || countdown == 60) {
      if (this.checkTelPattern()) {
        this.checkTel(txtTel).then((res) => {
          that.getSafeCode(res);
        });
      }
    }
  },
  //验证码的输入事件
  codeInput: function (e) {
    this.setData({
      txtCode: e.detail.value.replace(/[^\d]/g, '')
    });
    let txtTel = this.data.txtTel;
    let txtCode = this.data.txtCode;
    if (txtCode.length > 0) {
      this.setData({
        isHideCodeIconClear: false
      });
    }
    if (txtTel.length == 11) {
      if (this.checkTelPattern()) {
        if (txtCode.length == 6) {
          this.setData({
            canRegist: true
          });
        }
        else {
          this.setData({
            canRegist: false
          });
        }
      }
      else {
        this.setData({
          canRegist: false
        });
      }
    }
  },
  //验证码的失焦事件
  codeBlur: function (e) {
    this.setData({
      isHideCodeIconClear: true
    });
  },
  //手动注册的点击事件
  tapToRegister: function (e) {
    let that = this;
    if (this.data.canRegist) {
      if (this.data.txtTel.length == 11 && this.data.txtCode.length == 6) {
        if (this.checkTelPattern()) {
          this.checkTel(that.data.txtTel).then((res) => {
            //校验验证码
            that.compareSafeCode(res);
          });
        }
        else {
          this.setData({
            errTips: "请输入有效的11位手机号码！"
          });
        }
      }
    }
  },
  //检查手机号格式
  checkTelPattern: function () {
    if (this.data.txtTel.match(this.data.reg) == null) {
      return false;
    }
    else {
      return true;
    }
  },
  //获取验证码
  getSafeCode: function (theMobileno) {
    let that = this;
    let cmd = new fetch('getsafecode');
    cmd.mobileno = theMobileno;
    cmd.success = function (data) {
      if (data.status == 1) {
        wx.setStorageSync('wxapp_safeno', data.data.safecode);
        that.setData({
          txtCodeAutoFocus: true
        });
        that.countdown();
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("memberapi");
  },
  // 获取验证码倒计时
  countdown: function () {
    let that = this;
    let countdown = this.data.countdown;
    if (countdown == 0) {
      countdown = 60;
      this.setData({
        btnGetCodeText: '重新获取',
        canGetCode: true
      });
      if (that.checkTelPattern()) {
        that.setData({
          canGetCode: true
        });
      } else {
        that.setData({
          canGetCode: false
        });
      }
    }
    else {
      this.setData({
        canGetCode: false,
        btnGetCodeText: countdown + " s"
      });
      countdown--;
      this.setData({
        countdown: countdown,
        timeoutobj: setTimeout(function () {
          that.countdown();
        }, 1000)
      });
    }
  },
  //比对验证码
  compareSafeCode: function (theMobileno) {
    let that = this;
    let safeno = wx.getStorageSync('wxapp_safeno');
    let cmd = new fetch("checksafecode");
    cmd.safeno = safeno;
    cmd.safecode = that.data.txtCode;
    cmd.mobilenumber = theMobileno;
    cmd.success = function (data) {
      if (data.status == 0) {
        util.showModal(data.msg);
      }
      else if (data.status == 1) {
        /**去设置支付密码
         wx.navigateTo({
          url: "setpaypw.html?tel=" + that.data.txtTel + "&safeno=" + safeno + "&safecode=" + that.data.txtCode,
        });*/

        that.checkTel(that.data.txtTel).then((res) => {
          //手动注册
          that.register(0, that.data.txtTel);
        });
      }
    };
    cmd.execute("memberapi");
  },
  //注册前，检查当前手机号是否已经被他人注册
  checkTel: function (theMobileno) {
    return new Promise((resolve, reject) => {
      let that = this;
      let cmd = new fetch("checkmemberno");
      cmd.mobileno = theMobileno;
      cmd.openid = that.data.openid;
      cmd.unionid = that.data.unionid;
      cmd.success = function (data) {
        if (data.status == 1) {
          resolve(theMobileno);
        } else if (data.status == 0) {
          if (data.code == 'is_pass') { //跳过注册，返回parkuserid和userstatus，可以直接使用小程序
            util.showToast(data.msg, function () {
              wx.setStorageSync('wxapp_parkuserid', data.data.parkuserid);
              that.setData({
                parkuserid: data.data.parkuserid
              });
              //此处判断是否开通免密支付
              that.checkWXAutoPay();
            });
          } else if (data.code == 'is_lock') { //终止流程，手机号被锁定不能注册
            util.showModal(data.msg);
          } else { //接口访问出错
            util.showModal("抱歉，服务器异常！");
          }
        }
        else {
          util.showModal(data.msg);
        }
      };
      cmd.execute("memberapi");
    });
  },
  //注册：自动和手动共用一个接口。
  register: function (isAuto, theMobileno) {
    let that = this;
    let cmd = new fetch("register");
    if (isAuto == 1) { //isauto=1为小程序自动注册类型
      cmd.mobileno = theMobileno;
    } else { //手动注册
      cmd.mobileno = that.data.txtTel;
      cmd.safeno = wx.getStorageSync('wxapp_safeno');
      cmd.safecode = that.data.txtCode;
    }
    cmd.openid = that.data.openid;
    cmd.paypwd = '';
    cmd.success = function (data) {
      if (data.status == 1) {
        var res = data.data;
        wx.setStorageSync('wxapp_parkuserid', res.ParkUserId);
        wx.setStorageSync('wxapp_mobileno', res.MobileNumber);
        that.setData({
          parkuserid: res.ParkUserId,
          mobileno: res.MobileNumber
        });
        util.showToast('恭喜您，绑定成功!', function () {
          //此处判断是否开通免密支付
          that.checkWXAutoPay();
        });
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("memberapi");
  },
  //事件：开通免密支付
  tapOpenPay: function () {
    let that = this;
    util.showLoading(function () {
      that.openautopay();
    });
  },

})