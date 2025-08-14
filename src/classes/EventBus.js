export default class EventBus{
    // 非单例，允许用户自己使用事件总线
    constructor(){
        this.eventMap = new Map()
    }
    // 订阅事件
    on(eventName,callback){
        if(typeof callback !== 'function'){
            throw new TypeError('callback必须是一个函数')
        }
        if(!this.eventMap.has(eventName)){
            // []为回调队列
            this.eventMap.set(eventName,[])
        }
        this.eventMap.get(eventName).push(callback)
        return this
    }
    // 发布事件
    emit(eventName,...args){
        let eventQueue = this.eventMap.get(eventName)
        // 发布时事件尚未被订阅则事件丢失
        if(!eventQueue||!eventQueue.length){
            console.log(eventName+'事件未被订阅，事件丢失')
            return false
        }
        eventQueue = [...eventQueue] // 不修改原数组
        eventQueue.forEach(cb => {
            queueMicrotask(()=>cb.apply(this,args)) // 避免回调阻塞
        });
        return true
    }
    // 获取指定事件的回调队列
    getCallbacks(eventName){
        if(typeof eventName!=='string'){
            throw new TypeError('事件名称必须为字符串类型')
        }
        return this.eventMap.get(eventName)
    }
}