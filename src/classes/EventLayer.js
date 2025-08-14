import { GRID_SIZE } from "../config/constants.js";
import Layer from "./Layer.js";
export default class EventLayer extends Layer {
  static isCreated = false; // 单例标识
  static instance = null; // 单例
  constructor(container, LayerZindex) {
    if (EventLayer.isCreated) {
      return EventLayer.instance;
    } else {
      super(container, LayerZindex);
      this.createCanvas();
      // 事件层需监听点击事件
      const canvas = this.getCanvasInstance()
      canvas.eventBus = Layer.eventBus // 将实例存放在canvas上，因为后面将canvas设置为this
      canvas.addEventListener('click',(e)=>this.handleClick.call(canvas,e))
    }
  }
  // 事件层处理点击事件
  handleClick(e){
    // 可能需要考虑做一下阻止冒泡
    // 计算画布内像素坐标
    const rect = this.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top
    // console.log(canvasX,canvasY)
    // 转换为行列整数坐标，精确度和敏感度待优化
    const row = Math.floor((canvasX - rect.left + GRID_SIZE / 2) / GRID_SIZE);
    const col = Math.floor((canvasY - rect.top + GRID_SIZE / 2) / GRID_SIZE)+1;
    // console.log(row,col)
    this.eventBus.emit('click',{x:row,y:col})
  }
}
