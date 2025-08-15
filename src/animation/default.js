// 棋子运动模式
// 线性（匀速）
function linear(t) {
  return t;
}

// 缓入（开始慢）
function easeInQuad(t) {
  return t * t;
}

// 缓出（结束慢）
function easeOutQuad(t) {
  return t * (2 - t);
}

// 缓入缓出
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// 弹性效果
function elastic(t) {
  return Math.sin(-13 * (t + 1) * Math.PI/2) * Math.pow(2, -10 * t) + 1;
}

export const MoveMode = {
    linear,easeInQuad,easeInOutQuad,easeOutQuad,elastic
}

/**
 * 计算动画下一帧的坐标（自动走直线）
 * @param {Object} animation - 动画配置对象
 * @param {number} animation.startX - 起点X坐标
 * @param {number} animation.startY - 起点Y坐标
 * @param {number} animation.endX - 终点X坐标
 * @param {number} animation.endY - 终点Y坐标
 * @param {number} animation.currentX - 当前X坐标
 * @param {number} animation.currentY - 当前Y坐标
 * @param {number} animation.duration - 总动画时长(毫秒)
 * @param {number} animation.timeElapsed - 已过去的时间(毫秒)
 * @param {Function} [easing] - 自定义缓动函数 (可选)
 * @returns {{x: number, y: number}} 下一帧的坐标
 */
function getNextAnimationPosition(animation, easing) {
    const {
        startX, startY,
        endX, endY,
        duration,
        timeElapsed
    } = animation;
    
    // 计算进度百分比 (0-1)
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easing ? easing(progress) : progress;
    
    // 计算总位移
    const dx = endX - startX;
    const dy = endY - startY;
    
    // 自动沿直线移动到终点
    return {
        x: startX + dx * easedProgress,
        y: startY + dy * easedProgress
    };
}
export default function animateFn(animation,easing){
    return getNextAnimationPosition(animation,easing)
}