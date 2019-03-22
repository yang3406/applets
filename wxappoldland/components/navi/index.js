// components/navi/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String
    },
    latest: {
      type: Boolean,
      default: false,
      observer: function () {

      }
    },
    first: {
      type: Boolean,
      observer: function () {

      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    disLeftSrc: "./images/triangle.dis@left.png",
    highLeftSrc: "./images/triangle@left.png"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLeft: function () {
      if (!this.first) {
        this.triggerEvent("left", {}, {}); //是triggerEvent 不是trggleEvent
      }

    },
    onRight: function () {
      console.log("ppp");
      if (!this.latest) {
        this.triggerEvent("right", {}, {});
      }
    }
  }
})
