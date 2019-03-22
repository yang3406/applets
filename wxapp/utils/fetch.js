//你的域名  
let Md5 = require("./md5");
let appHost = "183.62.162.254:8899";
// let appHost = "192.168.9.130:192";
let appPort = '';
let approot = "";
let comid = "200000002";
let appkey = "201801131";
let arr_key = [50, 49, 70, 65, 54, 70, 57, 70, 69, 55, 52, 66, 70, 70, 57, 57, 66, 52, 66, 52, 55, 56, 50, 56, 52, 48, 65, 65, 70, 51, 57, 66];


/**
 * @主函数
 * @param {any} url 
 * @param {any} data 
 * @param {any} cb 
 */
function Fetch(method) {
  this.method = method || "";
  this.appkey = appkey;
  this.versontype = 1; //ve
  var newArr = [];
  var intArr = arr_key;
  for (var i = 0; i < intArr.length; i++) {
    newArr.push(String.fromCharCode(intArr[i]));
  }
  this.security = Md5(newArr.join("") + this.method.toLowerCase()); //安全码  
  this.ms = new Date().getTime();
  this.clientType = "html";
}

/**
 * @默认参数设置
 * @export
 */
Fetch.prototype._configParam = function () {
  var defConfig = {};
  defConfig.protocol = "http://"; //协议 默认http
  defConfig.appHost = appHost; //服务器地址
  defConfig.appPort = appPort; //端口
  defConfig.type = "POST"; //请求方式,默认post请求
  return defConfig;
};

/**
 * @请求数据
 * @param {any} obj //请求类型
 * @export
 */
Fetch.prototype._dataRender = function (obj) {
  var cmdObj = this;
  var dataObj = {};
  for (var key in cmdObj) {
    let keyType = typeof cmdObj[key];
    //值为是函数？跳过
    if (keyType === "function") {
      continue;
    }
    //值为undefined默认为空
    if (keyType === "undefined") {
      dataObj[key] = "";
      continue;
    }
    dataObj[key] = cmdObj[key];
  }
  dataObj["sign"] = this._sign(obj);
  return dataObj;
};

/**
 * @加密数组
 * @export
 */
/*Fetch.prototype._getArray = function () {
  var spiltStr = [];
  spiltStr.push(38, 114, 101, 113, 117, 101, 115, 116, 75, 101, 121, 61);
  spiltStr.push(68, 51, 48, 50, 57, 67, 55, 51, 52, 48, 54, 50);
  spiltStr.push(50, 49, 66, 48, 50, 48, 50, 54, 66, 54, 56);
  spiltStr.push(52, 66, 66, 48, 48, 53, 55, 57, 67);
  return spiltStr;
};*/

/**
 * @拼接请求地址
 * @export
 * @param {any} obj //请求类型
 */
Fetch.prototype._sortUrl = function (obj) {
  var cmdObj = this;
  var arr1 = [];
  for (var pro in cmdObj) {
    if (cmdObj.hasOwnProperty(pro)){
      arr1.push(pro);
    }    
  }
  arr1.sort(function (a, b) {
    return a.split("=")[0] > b.split("=")[0] ? 1 : -1;
  });
  var arr2 = [];
  for (var i = 0; i < arr1.length; i++) {
    var key = arr1[i];
    var value = cmdObj[key];
    if (typeof (value) != 'function') {
      if (!this.isNullorEmpty(value)) {
        arr2.push(key + "=" + value);
      }
    }
  }
  return arr2.join("&");
};

/**
 * @参数加密
 * @export
 * @param {any} obj //请求类型
 */
Fetch.prototype._sign = function (obj) {
  var content = this._sortUrl(obj);
  var newArr = [];
  var intArr = arr_key;
  for (var i = 0; i < intArr.length; i++) {
    newArr.push(String.fromCharCode(intArr[i]));
  }
  content += newArr.join("");
  var sign = Md5(content);
  return sign;
};

/**
 * @成功回调
 * @export
 * @param {any} res //返回数据
 */
Fetch.prototype._success = function (res) {
  var cmdObj = this;
  if (typeof cmdObj.success === "function") {
    cmdObj.success(res.data);
  }
  // }
};

/**
 * @去登陆
 */
let debounce = true; //防止多次弹出登录
Fetch.prototype._goLogin = function () {

};

/**
 * @失败
 * @param {any} res //返回数据
 */
Fetch.prototype._error = function (res) {
  var cmdObj = this;
  if (typeof cmdObj.error === "function") {
    cmdObj.error(res);
  }
  console.dir('wx.request的_error回调:',res); //用于打印错误信息
  throw res; //抛出错误
};

/**
 * @获取url
 */
Fetch.prototype._getUrl = function (obj) {
  var defConfig = this._configParam();
  var url =
    defConfig.protocol +
    defConfig.appHost + '/' +
    obj.interfaceName + '/index.aspx';
  return url;
};
Fetch.prototype.isNullorEmpty = function (str) {
  if ((str == null || str == "null" || str == "" || str == " " || str == undefined || str == "undefined") && (str != 0 || str != "0")) {
    return true;
  } else {
    return false;
  }
};
/**
 * @网络请求
 */
Fetch.prototype._request = function (obj) {
  var _this = this;
  var defConfig = _this._configParam();
  var dataObj = _this._dataRender(obj);
  var url = this._getUrl(obj);
  var type = obj.type || defConfig.type;
  console.log('parkuserid:',wx.getStorageSync('wxapp_parkuserid'));
  console.log('wx.request--dataObj',dataObj);
  wx.request({
    url: url,
    data: dataObj,
    method: type,
    header: { 'Content-Type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log('wx.request--success:',res);
      _this._success(res);
    },
    fail: function (res) {
      console.log('wx.request--fail:', res);
      _this._error(res);
    },
    complete: function (res) {
      console.log('wx.request--complete：',res);
    }
  })
};

/**
 * @同步请求
 */
Fetch.prototype.execute = function (interfaceName) {
  this._request({
    interfaceName: interfaceName,
    async: false
  });
};

/**
 * @异步请求
 */
Fetch.prototype.executeAsync = function (interfaceName) {
  this._request({
    interfaceName: interfaceName,
    async: true
  });
};

module.exports = Fetch;