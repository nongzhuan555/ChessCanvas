import Layer from "./Layer.js";
import {
  BOARD_COLS,
  BOARD_MARGIN,
  BOARD_ROWS,
  GRID_SIZE,
} from "../config/constants.js";
export default class BoardLayer extends Layer {
  static isCreated = false; // 单例标识
  static instance = null; // 单例
  backgroundColor = "#E8C48A"; // 棋盘背景色，当没设置背景图时应用，默认取木色
  backgroundImage = "https://pic.52112.com/180309/180309_83/8fZmnuxTfu_small.jpg"; // 棋盘背景图（优先于背景色）
  constructor(container, LayerZindex) {
    if (BoardLayer.isCreated) {
      return BoardLayer.instance;
    } else {
      super(container, LayerZindex);
      this.createCanvas();
      BoardLayer.isCreated = true;
      BoardLayer.instance = this;
    }
  }
  // 棋盘层实现绘制-绘制棋盘
  // 会触发棋盘背景图是否加载成功的事件，最终触发棋盘渲染完成的事件（这里其实可以叫生命周期）
  // 所谓“生命周期”，其实就是必然会按照既定顺序发生的系列事件
  draw(canvas, ctx, boardColor) {
    const _self = this; // 保留调用对象
    const boardImage = this.backgroundImage; // draw由实例调用，可获取正确this，否则内部函数需用箭头函数继承this
    const promise = new Promise((resolve,reject)=>{
      // 使用promise的目的是精确控制背景和线条的绘制顺序，避免覆盖
      drawBackgroundImage(resolve,reject) // 以背景的加载开始切入整体棋盘渲染
    })
    promise
      .then((value)=>{
        // console.log(value.msg)
        queueMicrotask(()=>_self.eventBus.emit('BoardImgSucces',value))
        ctx.drawImage(value.image, 0, 0, canvas.width, canvas.height);
      })
      .catch((reason)=>{
        // console.log(reason.msg)
        queueMicrotask(()=>_self.eventBus.emit('BoardImgFail',reason))
        drawBackgroundColor() // 退而求其次，使用备用的背景色
      })
      .finally(()=>{
        drawChessBoardLine(); // 背景处理好后统一绘制棋盘线条
        // 触发绘制事件
        queueMicrotask(()=>_self.eventBus.emit('BoardRendered',_self)) // 把全局唯一的棋盘层实例作为事件参数
      })
    // 绘制棋盘背景图
    function drawBackgroundImage(resolve,reject) {
        // 使用图片背景
        const img = new Image();
        img.src = boardImage;
        img.onload = () => {
          resolve({
            msg:'背景图片加载成功，设置为背景图模式',
            image:img
          })
        };
        // 图片加载错误处理
        img.onerror = () => {
          reject({
            msg:'背景图片加载失败，设置为背景色模式'
          })
        };
      
    }
    // 绘制纯色背景图
    function drawBackgroundColor(){
      // 使用颜色背景
        ctx.fillStyle = boardColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        resolve('背景色模式绘制成功')
    }
    // 绘制棋盘线条
    function drawChessBoardLine() {
      // 绘制网格线（暂时不允许配置，采用默认取值）
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;

      // 绘制垂直线
      for (let i = 0; i <= BOARD_COLS; i++) {
        const x = BOARD_MARGIN + i * GRID_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, BOARD_MARGIN);
        if (i === 0 || i === BOARD_COLS) {
          ctx.lineTo(x, BOARD_ROWS * GRID_SIZE + BOARD_MARGIN);
        } else {
          ctx.lineTo(x, BOARD_MARGIN + 4 * GRID_SIZE);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, BOARD_MARGIN + 5 * GRID_SIZE);
          ctx.lineTo(x, BOARD_MARGIN + 9 * GRID_SIZE);
        }
        ctx.stroke();
      }

      // 绘制水平线
      for (let j = 0; j <= BOARD_ROWS; j++) {
        const y = BOARD_MARGIN + j * GRID_SIZE;
        ctx.beginPath();
        ctx.moveTo(BOARD_MARGIN, y);
        ctx.lineTo(BOARD_MARGIN + BOARD_COLS * GRID_SIZE, y);
        ctx.stroke();
      }

      // 绘制"楚河""汉界"文字
      ctx.font = "35px KaiTi, STKaiti, serif";
      // ctx.fillStyle = "#8B4513";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "楚 河",
        (BOARD_COLS * GRID_SIZE) / 4 + BOARD_MARGIN,
        BOARD_MARGIN + (BOARD_ROWS / 2) * GRID_SIZE
      );
      ctx.fillText(
        "汉 界",
        (BOARD_COLS * GRID_SIZE * 3) / 4 + BOARD_MARGIN,
        BOARD_MARGIN + (BOARD_ROWS / 2) * GRID_SIZE
      );

      // 绘制九宫格
      drawPalace(BOARD_MARGIN + 3 * GRID_SIZE, BOARD_MARGIN + 7 * GRID_SIZE);
      drawPalace(BOARD_MARGIN + 3 * GRID_SIZE, BOARD_MARGIN);
    }
    // 绘制九宫格
    function drawPalace(x, y) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      // 绘制外框
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2 * GRID_SIZE, y);
      ctx.lineTo(x + 2 * GRID_SIZE, y + 2 * GRID_SIZE);
      ctx.lineTo(x, y + 2 * GRID_SIZE);
      ctx.closePath();
      ctx.stroke();

      // 绘制对角线
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2 * GRID_SIZE, y + 2 * GRID_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 2 * GRID_SIZE, y);
      ctx.lineTo(x, y + 2 * GRID_SIZE);
      ctx.stroke();
    }
    // 绘制特殊棋盘点位标记（暂时省略）
  }
  // 设置背景图
  setBackgroundImage(path) {
    this.backgroundImage = path;
  }
  // 处理棋盘相关事件
  eventBus = Layer.eventBus
}
// TODO:
// 1. 棋盘大小模式（响应式和设定式）
// 2. 棋盘样式配置拆分
// 3. 棋盘背景图的大小适配问题