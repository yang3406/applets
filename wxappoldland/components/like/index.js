// components/like/index.js
Component({
  /** 
   * 组件的属性列表
   */
  properties: {
    num:{
      type:Number
    },
    likeFlag:{
      type:Boolean
    }
  },

  /**
   * 组件的初始数据 
   */
  data: {
    likeIconUrl:'images/like.png',
    unlikeIconUrl:'images/like@dis.png',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLike: function (e) {
      this.setData({
        "num": this.data.likeFlag ? parseInt(this.data.num) - 1:parseInt(this.data.num)+1,
        "likeFlag":!this.data.likeFlag
        });
      this.triggerEvent("like", { num: this.data.num, likeFlag: this.data.likeFlag},{})
    }
  }
})
