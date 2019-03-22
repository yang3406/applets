Page({
  data: {
    orderWrapHeight: 44, //初始化时，那个块只能显示的高度
    swipeHeight: 100, //手指滑动的距离，不论上下。
    mapHeight: 0, //地图的高度；//iphone6上就是559px
    layoutStyle: '', //那个块的样式
    windowHeight: 0, //屏高
    lastY: 0, //滑动到顶上时，即那个块完全显示时，所处的top
  },
  onShow: function () {
    let that = this;
    wx.getSystemInfo({
      success: res => {
        that.setData({
          windowHeight: res.windowHeight,
          mapHeight: res.windowHeight - that.data.orderWrapHeight, // 屏高-底部那个订单块的高度=地图的高度
          layoutStyle: 'top:' + (res.windowHeight - that.data.orderWrapHeight)
        });
      }
    });
  },
  touchMoveOW: function (e) {
    console.dir(e);
    let that = this;

    let theTop = e.touches[0].clientY;
    let windowHeight = that.data.windowHeight; //屏高
    let orderWrapHeight = that.data.orderWrapHeight; //初始化时显示的高度
    let mapHeight = that.data.mapHeight;  //地图的高度
    let swipeHeight = that.data.swipeHeight;  //滑动的距离

    console.log(mapHeight + '--' + theTop + '#' + (mapHeight - theTop));
    if (mapHeight - theTop > 0) { //往上滑
      if (that.data.lastY <= 0) {
        if (mapHeight - theTop > swipeHeight) {
          that.setData({
            layoutStyle: 'bottom:0', //完全展开那个块
            lastY: theTop
          });
        } else {
          that.setData({
            layoutStyle: 'top:' + theTop
          });
        }
      } else {
        // debugger
        if (mapHeight - theTop > swipeHeight) {
          that.setData({
            layoutStyle: 'top:' + mapHeight,
            lastY: 0
          });
        } else {
          that.setData({
            layoutStyle: 'top:' + theTop
          });
        }
      }


    }
    // else { //往下滑
    // console.log('进来了');
    //   that.setData({
    //     layoutStyle: 'top:' + mapHeight
    //   });

    // }






  },
})