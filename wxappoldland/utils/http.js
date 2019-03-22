import {
  BASEURL
} from "./config.js"; //不能用绝对路径

let errorcode = {
  "-1": "网络出现故障,请稍后检查",
  "1006": "后台出错了!",
  "1004": "禁止访问"
}

class HTTP {
  req(param) {
    wx.request({
      url: BASEURL + param.url,
      data: param.data || {},
      header: {
        'content-type': 'application/json'
      },
      method: param.method || 'GET',
      success: function(res) {
        //判断状态码以2开头是 2xx 是正确的 异常统一处理
        let statusCode = res.statusCode.toString();
        let code = statusCode.charAt(0);
        if (code == "2") {
          //有回调在执行
          param.success && param.success(res.data);
        } else {
          _tipusermess(statusCode);
        }
      },
      fail: function(err) {
        this._tipusermess(-1);
      },
      complete: function(res) {},
    })
  }
  _tipusermess(statuscode) {
    statuscode ? statuscode : -1;
    wx.showToast({
      "title": errorcode[statuscode],
    });
  }
}
export {
  HTTP
}