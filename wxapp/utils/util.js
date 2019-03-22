const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/********* 以下方法为自定义 **********/
/**
 * 判断是否为空
 */
const isNull = str => {
  if ((str == null || str == "null" || str == "" || str == " " || str == undefined || str == "undefined") && (str != 0 || str != "0")) {
    return true;
  } else {
    return false;
  }
}

/**
 * 模式框（alert、confirm）
 */
const showModal = (content, isShowCancel, successCallback, cancelCallback, title) => {
  wx.showModal({
    title: isNull(title) ? '温馨提示' : title,
    content: isNull(content) ? '服务器异常' : content,
    showCancel: isNull(isShowCancel) ? false : isShowCancel, //因业务需求，单个按钮的弹框使用居多，故这里默认是false
    success: function (res) {
      if (res.confirm) { //如果只有一个按钮，点确定会触发res.confirm
        if (!isNull(successCallback)) {
          successCallback();
        }
      } else {
        if (!isNull(cancelCallback)) {
          cancelCallback();
        }
      }
    }, fail: function (err) {
      console.log('showModal--err:',err);
    }
  });
}

/**
 * showToast ，弹出后n秒就自动消失
 */
const showToast = (title, callback, duration, icon) => {
  wx.showToast({
    title: isNull(title) ? '操作成功!' : title,
    icon: isNull(icon) ? 'success' : icon,
    duration: isNull(duration) ? 2000 : duration,
    success: function () {
      if (!isNull(callback)) {
        callback();
      }
    }
  });
}

/**
 * showLoading
 */
const showLoading = (successCallback, completeCallback, title, failCallback) => {
  wx.showLoading({
    title: isNull(title) ? '加载中...' : '',
    mask: true,
    success: function (res) {
      if (!isNull(successCallback)) {
        successCallback(res);
      }
    },
    fail: function (res) {
      if (!isNull(failCallback)) {
        failCallback(res);
      }
    },
    complete: function (res) {
      if (!isNull(completeCallback)) {
        completeCallback(res);
      }
    },
  })
}

/**
 * 格式化成 天时分
 */
const formatToDHMS=function (subtime) {
  var result = "";
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  if (subtime < 0) {
    result += "-";
    subtime = 0 - subtime;
  }
  var dayC = Math.floor(subtime / day);
  if (dayC > 0) {
    result += dayC + "天";
    subtime = subtime % day;
  }
  var hourC = Math.floor(subtime / hour);
  if (hourC > 0) {
    result += hourC + "小时";
    subtime = subtime % hour;
  }
  var minuteC = Math.floor(subtime / minute);
  if (minuteC > 0) {
    result += minuteC + "分钟";
    subtime = subtime % minute;
  } else if (dayC == 0 && hourC == 0) {
    result += "<1分钟";
  }
  return result;
}

module.exports = {
  formatTime: formatTime,
  isNull: isNull,
  showModal: showModal,
  showToast: showToast,
  showLoading: showLoading,
  formatToDHMS: formatToDHMS
}
