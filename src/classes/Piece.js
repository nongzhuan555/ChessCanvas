export default class Piece{
    // 当使用canvas绘制模式时，棋子的阵营及文字映射
    static textMap = {
        red:{
            car:'车',
        },
        black:{
            car:'车',
        }
    }
    constructor(x,y,type,side){
        this.x = x // 横坐标，索引从0开始
        this.y = y // 竖坐标，索引从0开始
        this.type = type // 棋子种类，如车、兵等
        this.side  =side // 阵营，红方黑方
        this.canvasOption = {
            // 当不使用精灵图时，canvas的绘制选项 
            text: Piece.textMap[side][type],
            textColor: side === 'red'?'red':'black',
            // pieceBgcolor: side === 'black'?'#cd9755ff':'#543b2fff' // 阵营棋子颜色区分
            pieceBgcolor:'#cd9755ff'
        }
    }
}