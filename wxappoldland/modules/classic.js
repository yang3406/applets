import { HTTP } from "../utils/http.js";

class ClassicModule extends HTTP{
  getLatest(sCallback){
    this.req({
      url:'classic/latest', //获取最新一期周刊
      success: sCallback
    })
  }
}
export { ClassicModule}