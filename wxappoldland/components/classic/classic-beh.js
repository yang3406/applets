/* Behavior和component很类似 可以定义component相关生命周期 其他的组件可以继承它 
*当成公有的
*/
let classicBehavior = Behavior({
  properties: {
    imgUrl: {
      type: String
    },
    content: {
      type: String
    },
    kind: {
      type: String
    }
  }
});
export { classicBehavior }