// components/epsoide/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    index: {
      type: String, //如果设置Number类型 会导致06 自动去掉前面的0 
      observer: function (newVal, oldVal, path) {
        if (newVal < 10) {
          newVal = "0" + newVal;
        }
        console.log(newVal);

        this.setData({
          //index: newVal  不能再observer改变当前属性的值 会陷入无限循环中
          _index: newVal
        })
      }
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月',
      '十二月'],
    month: "",
    year: 2018,
    _index: ""
  },
  ready: function () {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    this.setData({
      year,
      month: this.data.months[month],
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {

  }
})
