// components/epsoide/index.js
import { classicBehavior } from '../classic-beh.js';
Component({
  /**
   * 组件的属性列表
   */
  behaviors: [classicBehavior],
  properties: {
    //放在classicBehavior中 统一继承
    /* imgUrl: {
      type: String
    },
    content: {
      type: String
    },
    kind: {
      type: String
    } */
  },

  /**
   * 组件的初始数据
   */
  data: {
    typeUrl: './images/movie.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
