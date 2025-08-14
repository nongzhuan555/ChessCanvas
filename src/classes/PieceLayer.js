import Layer from "./Layer.js";
import Piece from "./Piece.js";
import { BOARD_ROWS, BOARD_COLS, PIECE_RADIUS } from "../config/constants.js";
export default class PieceLayer extends Layer {
  static movingPiece = null // 正在移动的棋子
  static selectedPiece = null // 当前选中的棋子
  static isCreated = false; // 单例标识
  static instance = null; // 单例
  // 当前棋子层实例的棋子状态
  pieceMap = [
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
    }
  }
  // 棋子层的绘制同样也只初始化触发一次，对调用时的pieceMap全量绘制
  draw() {
    for(let i = 0;i<=BOARD_ROWS;i++){
        for(let j = 0;j<=BOARD_COLS;j++){
            if(!this.pieceMap[i][j]) continue
            queueMicrotask(()=>this.drawOnePiece(this.pieceMap[i][j]))
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
    // 绘制阴影（增加立体感），后期把阴影拆出去可配置
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 10;
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
  // 添加棋子
  addPiece(piece) {
    if (!(piece instanceof Piece)) {
      throw new Error("只能添加棋子实例");
    } else {
      this.pieceMap[piece.x][piece.y] = piece;
      // 考虑触发事件
    }
  }
  // 选中棋子
  selectPiece(piece){
    
  }
  // 高亮棋子
  hightLightPiece(piece) {}
}
