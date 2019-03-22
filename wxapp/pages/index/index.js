const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    parkuserid: wx.getStorageSync('wxapp_parkuserid'),
    openid: wx.getStorageSync('wxapp_openid'),
    mobileno: wx.getStorageSync('wxapp_mobileno'),
    //屏幕上标签及地图控件的设计高度如下：begin
    iconTingHeight: 44,//我要停车按钮44px
    iconRoadDetailHeight: 85,//路段详情区85px
    iconUserHeight: 40,//用户图标的高度40px
    iconMapbbtHeight: 28,//地图中心点图标(长的似棒棒糖的图标)的高度28px
    //屏幕上标签及地图控件的设计高度如上：end
    windowWidth: 0,
    windowHeight: 0,
    mapHeight: 0,
    latitude: 0, //当前定位所在的纬度
    longitude: 0,//当前定位所在的经度
    markers: [],
    scale: 12, //地图缩放级别
    distance: 5000, //显示泊位的范围
    theMapCenterLocation: {}, //当前地图中心点经纬度
    listData: [], //路段list
    isMarkerClicked: false,  //标记是否被点击了
    isShowDetail: true,
  },
  onLoad: function (options) {
    let that = this;

    //获取系统信息
    wx.getSystemInfo({
      success: res => {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          mapHeight: res.windowHeight - that.data.iconTingHeight, //减去停车按钮的高度
          controls: [{
            id: 1, // 给控件定义唯一id
            iconPath: '/image/map_me_ic.png', // 用户控件图标
            position: { // 控件位置
              left: res.windowWidth - 59, // 单位px
              top: res.windowHeight - that.data.iconTingHeight - that.data.iconUserHeight - 20, // 根据设备高度设置top值，可以做到在不同设备上效果一致，减去：停车按钮高度44、减去用户图标高度40、减去用户图标距离地图底部间隙20，共104px。
              width: 40, // 控件宽度/px
              height: 40 // 控件高度/px
            },
            clickable: true // 是否可点击，默认为true,可点击
          },
          {
            id: 2, //中心点
            iconPath: '/image/map_landmark _ic.png',
            position: {
              left: (res.windowWidth - 18) / 2,
              top: (res.windowHeight - that.data.iconMapbbtHeight - that.data.iconTingHeight) / 2, //减去：地图中心点图标的高度28、减去停车按钮的高度44
              width: 18,
              height: 28.796
            },
            clickable: false
          }]
        });
      }
    });

  },
  onShow: function () {
    let that = this;
    // 1.创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("ytcMap"); // 地图组件的id
    this.movetoPosition();
    // this.setData({
    //   isShowDetail: true, //隐藏路段概要区
    //   mapHeight: this.data.windowHeight  //重置地图高度
    // });

    //针对清理了缓存的情况，openid、parkuserid等都会没有
    if (util.isNull(that.data.openid)) {
      theApp.wxLoginCallback = function () {
        that.setData({
          parkuserid: wx.getStorageSync('wxapp_parkuserid'),
          openid: wx.getStorageSync('wxapp_openid'),
          mobileno: wx.getStorageSync('wxapp_mobileno')
        });
        //查询欠费单
        that.getarrearslist();
      };
    } else {
      //查询欠费单
      that.getarrearslist();
    }

    //上一次拒绝授权，这一次进来就立马提示他，然后让用户手动开启授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          util.showModal('需要获取您的地理位置，请确认授权，否则地图功能将无法使用', true, function () {
            wx.openSetting({
              success: function (data) {
                if (data.authSetting["scope.userLocation"] == true) {
                  wx.showToast({
                    title: '授权成功',
                    icon: 'success',
                    duration: 3000
                  })
                  //再次授权，调用getLocationt的API
                  that.getLocationAndShowSection();
                } else {
                  //暂不用提醒
                  // wx.showToast({
                  //   title: '授权失败',
                  //   icon: 'success',
                  //   duration: 5000
                  // })
                }
              }
            });
          }, function () {
            //暂不用提醒
            // util.showModal('您取消了授权');
          }, '是否授权当前位置');
        } else {
          util.showLoading(function () {
            //获取当前定位并显示此定位附近路段
            that.getLocationAndShowSection();
          });
        }
      }
    });
  },
  //获取欠费单列表，判断用户是否有欠费单
  getarrearslist: function () {
    let that = this;
    // let cmd = new fetch('getarrearslist');
    // cmd.parkuserid = that.data.parkuserid;
    // cmd.success = function (data) {
    //   if (data.status == 1) {
    //     if (data.data.count > 0) {
    //       wx.redirectTo({
    //         url: '../arrearDetail/arrearDetail',
    //       })
    //     } else {

    //判断是否有进行中订单
    that.getMebParking();
    //     }
    //   }
    //   else {
    //     util.showModal(data.msg);
    //   }
    // };
    // cmd.execute("transactionapi");
  },
  //判断用户是否有进行中订单
  getMebParking: function () {
    let that = this;
    let cmd = new fetch('parking');
    cmd.parkuserid = that.data.parkuserid;
    cmd.success = function (data) {
      if (data.status == 1) {
        if (data.code == "no_park") {
          //...
        }
        else {
          // 正在停车
          wx.redirectTo({
            url: '../nowpark/nowpark',
          });
        }
      }
      else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("transactionapi");
  },
  //获取当前定位 & 显示附近泊位
  getLocationAndShowSection: function () {
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        });
        //获取附近泊位
        that.getbearbyberth(res.longitude, res.latitude, that.data.distance);
      }, fail: err => {
        if (err.errMsg == "getLocation:fail auth deny") {
          util.showModal("温馨提示：您已拒绝授权获取定位");
        }
        wx.hideLoading();
      }
    });
  },
  // 定位函数，移动位置到地图中心
  movetoPosition: function () {
    this.mapCtx.moveToLocation();
  },
  //获取附近泊位列表
  getbearbyberth: function (longitude, latitude, distance) {
    let that = this;
    let cmd = new fetch('getbearbyberth');
    cmd.Longitude = longitude;
    cmd.Latitude = latitude;
    cmd.Distance = distance;
    cmd.success = function (data) {
      if (data.status == 1) {
        var res = data.data;
        that.setData({
          listData: res.items
        });
        //getMarkers方法需要listData的值，所以这中间要有个先后关系，listData先赋值，getMarkers后执行。同时在setData里为多个变量赋值，这些变量之间就是同时进行的
        that.setData({
          markers: that.getMarkers()
        });
      }
      else {
        util.showModal(data.msg);
      }
      wx.hideLoading();
    };
    cmd.execute("berthapi");
  },
  //获取标记集合
  getMarkers: function () {
    var market = [];
    for (let item of this.data.listData) {
      let marker1 = this.createMarker(item);
      market.push(marker1);
    }
    return market;
  },
  //把接口数据创建成标记
  createMarker(point) {
    let marker = {
      iconPath: "/image/map_red_ic.png",
      id: point.SectionId || 0,
      name: point.SectionName || '未命名',
      title: point.SectionName || '未命名',
      latitude: point.Latitude,
      longitude: point.Longitude,
      callout: {
        content: point.SectionName,
        color: '#333333',
        bgColor: '#f2f2f2',
        fontSize: 13,
        borderRadius: 4,
        padding: 6,
        display: 'BYCLICK',
        textAlign: 'center'
      },
      width: 25,
      height: 32
    };
    return marker;
  },
  //拖动地图，视野发生变化时触发
  regionchange(e) {
    let that = this;
    if (e.type == 'end') {
      this.mapCtx.getCenterLocation({
        success: function (res) {
          that.getbearbyberth(res.longitude, res.latitude, that.data.distance);
          that.setData({
            theMapCenterLocation: res  //把中心点的经纬度存起来，用于路段详情
          });
        }
      });
    }
  },
  //点击标记时触发
  markertap(e) {
    for (let item of this.data.listData) {
      if (item.SectionId == e.markerId) {
        this.setData({
          mapHeight: this.data.windowHeight - 129,
          markerChecked: item,
          isShowDetail: false,
          controls: [{
            id: 1, // 给控件定义唯一id
            iconPath: '/image/map_me_ic.png', // 用户控件图标
            position: { // 控件位置
              left: this.data.windowWidth - 59, // 单位px
              top: this.data.windowHeight - this.data.iconTingHeight - this.data.iconUserHeight - 20 - this.data.iconRoadDetailHeight, // 根据设备高度设置top值，可以做到在不同设备上效果一致，用户图标top值是：减去：停车按钮高度44、减去用户图标高度40、减去用户图标距离地图底部间隙20，共104px，再减去路段详情区高度85。
              width: 40, // 控件宽度/px
              height: 40 // 控件高度/px
            },
            clickable: true // 是否可点击，默认为true,可点击
          },
          {
            id: 2,
            iconPath: '/image/map_landmark _ic.png',
            position: {
              left: (this.data.windowWidth - 18) / 2,
              top: (this.data.windowHeight - this.data.iconTingHeight - this.data.iconRoadDetailHeight - this.data.iconMapbbtHeight) / 2,//可用区域减去：我要停车按钮44、路段详情区85、中心点图标的高度28，最后除以2就是top的值。
              width: 18,
              height: 28.796
            },
            clickable: false
          }]
        });
      }
    }
  },
  //点击控件
  controltap(e) {
    if (e.controlId == 1) {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },

})