const theApp = getApp();
let fetch = require('../../utils/fetch');
let util = theApp.util;

Page({
  data: {
    sectionId: '',  //路段id
    longitude: 0,
    latitude: 0,
    sectionObj: {}
  },
  onLoad: function (options) {
    this.setData({
      sectionId: options.sectionid,
      longitude: options.longitude,
      latitude: options.latitude
    });
    this.getSectionById();
  },
  onShow: function () {


  },
  //获取路段详情
  getSectionById: function () {
    let that = this;
    let cmd = new fetch('newgetsectionbyid');
    cmd.SectionId = this.data.sectionId;
    cmd.Longitude = this.data.longitude;
    cmd.Latitude = this.data.latitude;
    cmd.Channel = "wxApp";
    cmd.success = function (data) {
      if (data.status == 1) {
        that.setData({
          sectionObj: data.data
        });
        //画右上角的这个占比图
        that.drawBerth();
      } else {
        util.showModal(data.msg);
      }
    };
    cmd.execute("berthapi");
  },
  //画右上角的这个占比图
  drawBerth: function () {
    let BerthTotal = this.data.sectionObj.BerthTotal;
    let BerthVacant = this.data.sectionObj.BerthVacant;
    const ctx = wx.createCanvasContext('firstCanvas');
    //添加文字，设置占比图的标题
    ctx.setFontSize(12)
    ctx.setFillStyle('black')
    ctx.fillText('车位', 27, 85)
    //画一个灰色的整圆
    ctx.beginPath();
    ctx.arc(37, 35, 30, 0, 2 * Math.PI);
    ctx.setLineWidth(5);
    ctx.setStrokeStyle('#eaeaea');
    ctx.stroke();
    //画绿色的弧度
    ctx.beginPath();
    ctx.arc(37, 35, 30, 1.5 * Math.PI, 1.5 * Math.PI + (2 * Math.PI / BerthTotal) * BerthVacant); //把整个周长除几就是分成多少份，*几就是这么多份里占的比
    ctx.setLineWidth(5);
    ctx.setStrokeStyle('#23ba91');
    ctx.stroke();
    //开画
    ctx.draw();
  },

})