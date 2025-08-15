import Layer from "./Layer.js";
import Piece from "./Piece.js";
import { BOARD_ROWS, BOARD_COLS, PIECE_RADIUS, PIECE_SIZE } from "../config/constants.js";
export default class PieceLayer extends Layer {
  static isCreated = false; // 单例标识
  static instance = null; // 单例
  static movingPiece = null // 正在移动的棋子
  static selectedPiece = null // 当前选中的棋子
  lastFramePos = {x:0,y:0} // 上一帧位置
  nextFramePos = {x:0,y:0} // 下一帧位置
  // 当前棋子层实例的棋子状态
  static pieceMap = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
  ]; // 使用字面量声明二维数组，相较使用数组构造函数性能略优
  constructor(container, LayerZindex) {
    if (PieceLayer.isCreated) {
      return PieceLayer.instance;
    } else {
      super(container, LayerZindex);
      this.createCanvas();
      PieceLayer.instance = this
      this.eventBus = Layer.eventBus
    }
  }
  // 棋子层的绘制同样也只初始化触发一次，对调用时的pieceMap全量绘制
  draw() {
    for(let i = 0;i<=BOARD_ROWS;i++){
        for(let j = 0;j<=BOARD_COLS;j++){
            if(!PieceLayer.pieceMap[i][j]) continue
            queueMicrotask(()=>this.drawOnePiece(PieceLayer.pieceMap[i][j]))
            // this.drawOnePiece(this.pieceMap[i][j])
        }
    }
  }
  // 将绘制棋子解耦，由draw调用，这样方便切换棋子渲染的实现（允许canvas绘制模式和精灵图模式）
  drawOnePiece(piece) {
    // 这里不清除画布，清除画布只在做动画时作用
    const ctx = this.getCtx();
    let px = 0;
    let py = 0;
    [px, py] = this.boardToPixel(piece.x,piece.y);
    // 绘制阴影（增加立体感），后期把阴影拆出去可配置(考虑对擦除动画的影响，暂时取消阴影效果)
    // ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    // ctx.shadowBlur = 10;
    // ctx.shadowOffsetX = 5;
    // ctx.shadowOffsetY = 10;
    // 绘制棋子
    ctx.beginPath();
    ctx.arc(px, py, PIECE_RADIUS, 0, Math.PI * 2); // 绘制棋子整体
    ctx.fillStyle = piece.canvasOption.pieceBgcolor; // 设置棋子主体色
    ctx.fill();
    // 绘制棋子文字
    ctx.font = 'bold 25px "SimSun", "STSong", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = piece.canvasOption.textColor; // 设置棋子文字颜色
    ctx.fillText(piece.canvasOption.text, px, py);
    ctx.beginPath();
    ctx.strokeStyle = piece.side
    ctx.arc(px, py, PIECE_RADIUS * 0.7, 0, Math.PI * 2); // 绘制棋子内框
    ctx.stroke()
    ctx.beginPath(); // 清除路径，保持好习惯
  }
  // 初始化添加棋子（作为框架内部方法）
  addPiece(piece) {
    if (!(piece instanceof Piece)) {
      throw new Error("只能添加棋子实例");
    } else {
      PieceLayer.pieceMap[piece.x][piece.y] = piece;
      // 考虑触发事件
    }
  }
  // 改变棋盘数组状态，用于移动时的棋盘状态改变
  setPieceMap(piece,x,y){
    if(!piece){
      PieceLayer.pieceMap[x][y] = 0;
    }else{
      PieceLayer.pieceMap[piece.x][piece.y] = piece;      
    }
  }
  // 选中棋子
  selectPiece(piece){
    if(!piece) throw new Error('棋子不存在')
    if(!(piece instanceof Piece))  throw new TypeError('只能添加棋子实例')
    PieceLayer.selectedPiece = piece
  }
  // 高亮棋子，option为用户可配置的高亮样式
  hightLightPiece(piece,option) {}
  // 动画相关-------------------------------------------------------------------------------------------------------------
  // 清除固定区域
  clearFrame(x,y){
    // 传入的是棋子中心点
    const ctx = this.getCtx()
    // 修正位置
    const [px,py] = this.boardToPixel(x,y)
    ctx.clearRect(px-PIECE_RADIUS,py-PIECE_RADIUS,PIECE_SIZE,PIECE_SIZE) // 不需要设置清楚区域大小，默认清除棋子的外接正方形大小
  }
  // 动画操作，先按照直线移动设计
  static animation = {
    startX:0,
    startY:0,
    endX:0,
    endY:0,
    currentX:0,
    currentY:0,
    duration:0,
    timeElapsed:0,
    startTime:0,
  }
  // fn为注入函数控制动画，option为动画配置，需包含终点坐标和其他可选配置
  animate(fn,option){ 
    const _self = PieceLayer.instance
    if(!PieceLayer.movingPiece){
      // 当前没有正在移动的动画则开始动画，初始化系列配置
      PieceLayer.movingPiece = PieceLayer.selectedPiece
      // 设置起点和终点
      PieceLayer.animation.startX = PieceLayer.selectedPiece.x
      PieceLayer.animation.startY = PieceLayer.selectedPiece.y
      PieceLayer.animation.endX = option.x
      PieceLayer.animation.endY = option.y
      // 初始化当前坐标
      PieceLayer.animation.currentX = PieceLayer.animation.startX
      PieceLayer.animation.currentY = PieceLayer.animation.startY
      // 设置相关时间
      PieceLayer.animation.startTime = Date.now()
      PieceLayer.animation.duration = option.duration
      // 动画过程中无选中棋子
      PieceLayer.selectedPiece = null
      _self.eventBus.emit('AnimationStart',PieceLayer.animation) // 触发动画开始事件
      requestAnimationFrame(()=>_self.animate(fn,option))
    }else{
      // 到达目的地，动画结束
      if(PieceLayer.movingPiece.x===PieceLayer.animation.endX&&PieceLayer.movingPiece.y===PieceLayer.animation.endY){
        _self.eventBus.emit('AnimationEnd',PieceLayer.movingPiece) // 触发动画结束事件
        PieceLayer.movingPiece = null 
        return
      }
      // 更新已逝时间
      PieceLayer.animation.timeElapsed = Date.now() - PieceLayer.animation.startTime
      // 清除上一帧画面（局部清除，而非整个画布重绘）
      _self.lastFramePos.x = PieceLayer.movingPiece.x
      _self.lastFramePos.y = PieceLayer.movingPiece.y
      _self.clearFrame(_self.lastFramePos.x,_self.lastFramePos.y)
      // 设置下一帧到达的坐标
      const {x,y} = fn(PieceLayer.animation,option.method,option.easing) // 为注入的函数传入动画配置，由其决定下一帧如何走，具体体现在以[x,y]格式返回下一帧的坐标
      PieceLayer.movingPiece.x = x
      PieceLayer.movingPiece.y = y
      // 更新动画配置中的当前坐标 
      PieceLayer.animation.currentX = x
      PieceLayer.animation.currentY = y
      _self.drawOnePiece(PieceLayer.movingPiece) // 绘制下一帧
      requestAnimationFrame(()=>_self.animate(fn,option))
    }
  }
}
// TODO:
// 1. 精灵图棋子模式
