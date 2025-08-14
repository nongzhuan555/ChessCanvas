import {
  BOARD_COLS,
  BOARD_MARGIN,
  BOARD_ROWS,
  GRID_SIZE,
} from "../config/constants.js";
import EventBus from "./EventBus.js";
export default class Layer {
  static eventBus = new EventBus() // 框架本身全局唯一的事件总线，但开发者可另行定义
  constructor(container, LayerZindex) {
    this.container = container;
    this.LayerZindex = LayerZindex;
  }
  // 可被继承的创建、设置canvas实例的方法
  createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    canvas.style.top = "0";
    // 设置画布尺寸
    canvas.width = BOARD_COLS * GRID_SIZE + 2 * BOARD_MARGIN;
    canvas.height = BOARD_ROWS * GRID_SIZE + 2 * BOARD_MARGIN;
    canvas.style.zIndex = this.LayerZindex.toString();
    const parent = document.getElementById(this.container);
    parent.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      this.canvasInstance = canvas;
      this.ctx = ctx;
    } else {
      throw new Error("当前浏览器不支持canvas");
    }
  }
  // 可被继承的获取canvas实例方法
  getCanvasInstance() {
    return this.canvasInstance;
  }
  // 可被继承的获取上下文方法
  getCtx() {
    return this.ctx;
  }
  // 以下为通用工具方法：
  // 棋盘坐标转像素坐标
  boardToPixel(x, y) {
    return [x * GRID_SIZE + BOARD_MARGIN, y * GRID_SIZE + BOARD_MARGIN];
  }
  // 像素坐标转棋盘坐标
  pixelToBoard(px, py) {
    return [
      Math.round((px - BOARD_MARGIN) / GRID_SIZE),
      Math.round((py - BOARD_MARGIN) / GRID_SIZE),
    ];
  }
}
