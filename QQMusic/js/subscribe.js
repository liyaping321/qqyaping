// /*实现发布订阅设计模式 */
// (function () {
//     // 构建事件池
//     let listeners = {};
//     // 像事件池中注入方法
//     const on = function on(event, callback) {
//         // 如果当前对象当中没有这个属性，就它加一个数组
//         if (!listeners[event]) listeners[event] = [];
//         let arr = listeners[event];
//         //  如果有这个这个属性
//         if (!arr.includes(callback)) {
//             arr.push(callback);

//         }

//     }
//     // 从事件池当中移出方法
//     const off = function off(event, callback) {
//         let arr = listeners[event];
//         if (!arr) return;
//         for (let i = 0; i < arr.length; i++) {
//             let item = arr[i];
//             if (item === callback) {
//                 // arr.splice(i, 1);  因为产生数据塌陷，让程序出现bug
//                 arr[i] = null; //当前索引赋值为null，就可以防止数据塌陷
//                 break;
//             }
//         }


//     }
//     // 通知事件池中方法执行
//     const emit = function emit(event, ...params) {
//         let arr = listeners[event];
//         if (!arr) return;
//         for (let i = 0; i < arr.length; i++) {
//             let item = arr[i];
//             if (typeof item === 'function') {
//                 item(...params);
//                 continue;
//             }
//             // 移出非函数内容
//             arr.splice(i, 1);
//             i--;
//         }
//     };
//     //   暴露API，挂再window上，以后就可以通过window.$sub.on使用方法
//     window.$sub = {
//         on,
//         off,
//         emit
//     }
// })()

// 所有的设计模式都是“锦上添花”；没有设计模式也可以实现需求，只不过基于设计模式可以更高效的管理代码！！
// 发布订阅设计模式：
//   @1 制定一个计划表「创建一个容器」
//   @2 在没有通知计划执行之前，我们把后续要做的事情，逐一添加到计划表中！「添加到容器中」
//   @3 在指定阶段，通知计划表中的方法逐一执行即可！！
//   @4 也有人说，发布订阅就是模拟DOM2的事件池机制{只能处理浏览器标准事件}，实现自定义事件的管理！！

// DOM0级事件绑定 VS DOM2级事件绑定
//   DOM0：
//     元素.onxxx=function(){}
//     给当前元素的某个“事件私有属性”赋值！！浏览器监听事件的触发，在事件触发后，把绑定的方法执行！！
//   DOM2：
//     新增了一个内置类 EventTarget，所有DOM元素都会基于__proto__找到EventTarget.prototype！！
//     在其原型对象上，提供了几个方法：
//       + addEventListener
//       + removeEventListener
//       + dispatchEvent
//       + ...
//     DOM2中构建了事件池机制，基于addEventListener向事件池中注入事件和方法、基于removeEventListener是移除事件和方法！！
//       元素   事件        方法   阶段
//       #box  click       fn1   冒泡
//       #box  mouseover   fn1   冒泡
//       #box  click       fn2   冒泡
//       ....
//     当我们触发某个事件的时候，会去事件池中进行查找，把匹配的方法逐一拿出来执行！！
//   DOM0和DOM2的区别：
//     + DOM0只能给当前元素的某个事件行为绑定一个方法，绑定第二个会覆盖之前的；DOM2可以给当前元素的某个事件行为，绑定多个不同的方法！！
//     + DOM0绑定，只有元素拥有相关的事件私有属性才可以绑定（例如：onxxx）！DOM2则不需要，只要是浏览器标准的事件行为，都可以做事件绑定！例如：DOMContentLoaded 在DOM TREE构建完即触发，这个事件是不支持DOM0绑定的，也就是没有onDOMContentLoaded这个属性！！只能用DOM2绑定！！
//     + DOM0从性能角度讲，比DOM2强上那么一丢丢丢丢丢丢丢丢丢丢丢....
//     + DOM0绑定和移除绑定都很方便「移除绑定就是给属性赋值为null即可」；但是DOM2需要基于removeEventListener特定的方法，从事件池中，移除指定类型、指定阶段的指定方法「需要和绑定阶段对应」！！
//   平时项目中建议采用DOM2事件绑定，可以有效避免多人协作开发中，事件绑定的冲突问题！！


/* 发布订阅设计模式 */
(function () {
    // 构建事件池
    let listeners = {};

    // 向事件池中注入方法
    const on = function on(event, callback) {
        if (!listeners[event]) listeners[event] = [];
        let arr = listeners[event];
        if (!arr.includes(callback)) {
            arr.push(callback);
        }
    };

    // 从事件池中移除方法
    const off = function off(event, callback) {
        let arr = listeners[event];
        if (!arr) return;
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            if (item === callback) {
                // arr.splice(i, 1); //因为产生数组塌陷，让程序出现bug
                arr[i] = null;
                break;
            }
        }
    };

    // 通知事件池中的方法执行 
    const emit = function emit(event, ...params) {
        let arr = listeners[event];
        if (!arr) return;
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            if (typeof item === "function") {
                item(...params);
                continue;
            }
            // 移除非函数内容
            arr.splice(i, 1);
            i--;
        }
    };

    // 暴露API
    window.$sub = {
        on,
        off,
        emit
    };
})();