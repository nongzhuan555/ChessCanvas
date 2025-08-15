import { GRID_SIZE } from "../config/constants.js";
import Layer from "./Layer.js";
import Piece from "./Piece.js";
import PieceLayer from "./PieceLayer.js";
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
      // 将实例存放在canvas上，因为后面将canvas设置为this
      canvas.eventBus = Layer.eventBus 
      canvas.pieceMap = PieceLayer.pieceMap
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
    const clicked = this.pieceMap[row][col] // 获取被点击的元素，可能为棋子或空
    // 这里统一处理象棋基本事件--------------------------------------------------
    if(clicked instanceof Piece){
        if(PieceLayer.selectedPiece){
            // 已经选中棋子，再次点击棋子，可能是重选己方棋子，或者是尝试吃子
            if(PieceLayer.selectedPiece===clicked){
                // 再次点击同一棋子，取消选中
                PieceLayer.selectedPiece = null
                this.eventBus.emit('CancelPiece',clicked)
            }else if(PieceLayer.selectedPiece.side===clicked.side){
                // 同一阵营不同棋子则为换选棋子
                PieceLayer.selectedPiece = clicked
                this.eventBus.emit('ChangePiece',clicked)
            }else{
                // 不同阵营则代表尝试吃子
                this.eventBus.emit('EatPiece',{
                    ourPiece: PieceLayer.selectedPiece,
                    enemyPiece: clicked 
                })
            }
        }else{
            // 初次选中棋子，触发选中棋子事件
            PieceLayer.selectedPiece = clicked
            this.eventBus.emit('SelectPiece',clicked)
        }
    }else{
        // 选中棋盘空位
        if(PieceLayer.selectedPiece){
            // 如果选中棋子，那么触发“想要”移动事件，想要移动事件应该被开发者拦截，检验是否可以移动，比如是否符合想象棋移动规则等等，而动画应该是纯粹的操作，不应该涉及移动校验
            this.eventBus.emit('WantMovePiece',{
                movePiece:PieceLayer.selectedPiece,
                moveTo:{x:row,y:col}
            })
        }else{
            // 无效点击（没选中棋子的情况下点击棋盘，没有意义）
        }
    }
  }
}
// TODO:
// 1. 点击事件的坐标转换精确度、敏感度
