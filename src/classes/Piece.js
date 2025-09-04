export default class Piece {
  // 当使用canvas绘制模式时，棋子的阵营及文字映射
  static textMap = {
    red: {
      king: "帥", // 红方主帅（繁体字）
      advisor: "仕", // 红方仕（繁简同形）
      elephant: "相", // 红方相（繁简同形）
      horse: "馬", // 红方马（繁体字）
      chariot: "車", // 红方车（繁体字）
      cannon: "炮", // 红方炮（繁简同形，也可用“砲”，通用“炮”）
      pawn: "兵", // 红方兵（繁简同形）
    },
    black: {
      king: "將", // 黑方将（繁体字）
      advisor: "士", // 黑方士（繁简同形）
      elephant: "象", // 黑方象（繁简同形）
      horse: "馬", // 黑方马（繁体字）
      chariot: "車", // 黑方车（繁体字）
      cannon: "炮", // 黑方炮（繁简同形，也可用“砲”，通用“炮”）
      pawn: "卒", // 黑方卒（繁简同形）
    },
  };
  constructor(x, y, type, side,spriteOption) {
    this.x = x; // 横坐标，索引从0开始
    this.y = y; // 竖坐标，索引从0开始
    this.type = type; // 棋子种类，如车、兵等
    this.side = side; // 阵营，红方黑方
    // 当不使用精灵图时，canvas的绘制选项
    this.canvasOption = {
      text: Piece.textMap[side][type], // 棋子文字
      textColor: side === "red" ? "red" : "black",
      // pieceBgcolor: side === 'black'?'#cd9755ff':'#543b2fff' // 阵营棋子颜色区分
      pieceBgcolor: "#cd9755ff",
    };
    this.spriteOption = spriteOption
    // spriteOption示例
    // {
    //     x:x, 精灵图横坐标
    //     y:y, 精灵图竖坐标
    //     w:w, 精灵图宽度
    //     h:h, 精灵图高度
    // }
  }
}
