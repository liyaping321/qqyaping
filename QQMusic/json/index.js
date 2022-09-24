FastClick.attach(document.body);
const musicBtn = document.querySelector('.music_btn'),
    wrapper = document.querySelector('.main_box .wrapper'),
    progress = document.querySelector('.progress'),
    curTime = progress.querySelector('.cur_time'),
    totalTime = progress.querySelector('.total_time'),
    progCur = progress.querySelector('.prog_cur'),
    myAudio = document.querySelector('.myAudio');
let lyricList = [],//记录歌词的集合
    prevLyric = [],//上一行显示那句歌词
    PH = 0;//一行歌词的高度
// 第一步：获取数据&&绑定数据
const queryData = function queryData() {
    // 通过promise管理模式，只有等数据获取成功之后再去做某事
    return new Promise(resolve => {
        //创建一个核心对象
        let xhr = new XMLHttpRequest;
        // 建立连接
        xhr.open('get', './json/lyric.json');
        // 建立侦听
        xhr.onreadystatechange = () => {
            let { readyState, status, responseText } = xhr;
            if (xhr.readyState === 4 && xhr.status === 200) {
                let data = JSON.parse(responseText);
                // 用promise管理模式，只有歌词获取到，才可以执行
                resolve(data.lyric);
            }
        };
        // 发送请求
        xhr.send();
    })
}
// 第二步：异步成功之后，再执行操作 ---获取解析歌词
const binding = function binding(lyric) {
    // 设置一个空数组。来存储我们每一行歌词（每一行歌词都具备分钟、秒、歌词）
    let data = [];
    // 歌词解析  替换成歌词里正常符号
    lyric = lyric.replace(/&#(32|40|41|45);/g, (val, $1) => {
        // 利用我们的映射表，将歌词里面的部分符号内容替换，如果没有就返回原本的歌词
        let table = {
            32: ' ',
            40: '(',
            41: ')',
            45: '-'
        };
        return table[$1] || val;
    });

    //将拿到的数据，用正则混合replace的方式，捕获到mintues,seconds,text,这三个值放到data数组里面
    lyric.replace(/\[(\d+)\:(\d+)\.(?:\d+)\]([^(/[)]+)(?:\r\n)?/g, (_, minutes, seconds, text) => {
        data.push({
            minutes,
            seconds,
            text
        });
    });
    let str = ``;
    // 循环data数据，获取每一个item，和index值
    data.forEach((item, index) => {
        // 拿到每一个item身上的三个值
        let { minutes, seconds, text } = item;
        // 统一将p标签模板的时间和下标都绑定好，并将内容添加上去
        // 因为我们匹配的每一行歌词，都是通过P标签身上的分钟和秒匹配
        str += `<p minutes="${minutes}" seconds="${seconds}" index="${index}">${text}</p>`;
    })
    // 将字符串模板添加到wrapper的标签里
    wrapper.innerHTML = str;
    // 获取P标签集合
    lyricList = Array.from(wrapper.querySelectorAll('p'));
    // 获取一行的高度
    PH = lyricList[0].offsetHeight;
}

//  按钮暂停时，将move移出，将定时器赋值null
const audioPause = function audioPause() {
    myAudio.pause();
    musicBtn.classList.remove('move');
    clearInterval(autoTimer);
    // 因为当你点击暂停时，就将定时器清空，让歌词和进度条就停止运行
    autoTimer = null;
}
/* 歌词滚动&&进度条处理*/
const format = function format(time) {
    time = +time;
    let obj = {
        minutes: '00',
        seconds: '00',

    };
    //将时间传进来，
    if (time) {
        // 用时间除以60向下取整,获取分钟
        let m = Math.floor(time / 60),
            s = Math.round(time - m * 60);
        obj.minutes = m < 10 ? '0' + m : '' + m;
        obj.seconds = s < 10 ? '0' + s : '' + s;
    }
    return obj;
}
//  第四步：歌词滚动
const handleLyric = function handleLyric() {
    let { duration, currentTime } = myAudio,
        a = format(currentTime),
        flag = false,
        arr = [];
    // 控制歌词的选中 记录上一个     item -->p标签 拿到p
    for (let i = 0; i < lyricList.length; i++) {
        let item = lyricList[i];
        let minutes = item.getAttribute('minutes'),
            seconds = item.getAttribute('seconds');
        if (minutes === a.minutes && seconds === a.seconds) {
            arr.push(item);
            flag = true;
        }
    }
    if (flag) {
        prevLyric.forEach(prev => prev.className = "");
        arr.forEach(item => item.className = "active");
        prevLyric = arr;
    }
    //控制歌词移动
    // console.log(+arr);
    let index = +prevLyric[prevLyric.length - 1].getAttribute('index');
    if (index >= 4) {
        wrapper.style.top = `${-(index - 3) * PH}px`;
    }
    // 音乐播放结束
    if (currentTime >= duration) {
        wrapper.style.top = '0px';
        if (prevLyric) prevLyric.className = '';
        num = 0;
        // prevLyric = null;
        audioPause();

    }
}
//  第四步：进度条
const handleProgress = function handleProgress() {
    // 获取音乐播放器的总时间，和当前播放的时间
    let { duration, currentTime } = myAudio,
        a = format(duration),
        b = format(currentTime);
    // 如果播放时间》总时间
    if (currentTime > duration) {
        // 播放结束
        curTime.innerHTML = `00:00`;
        progCur.style.width = `0%`;
        audioPause();
        return;
    }
    curTime.innerHTML = `${b.minutes}:${b.seconds}`;
    totalTime.innerHTML = `${a.minutes}:${a.seconds}`;
    progCur.style.width = `${currentTime / duration * 100}%`;


}
$sub.on('playing', handleLyric);
$sub.on('playing', handleProgress);
/*第三步：控制按钮的播放和暂停*/
let autoTimer = null;
const handle = function handle() {
    //  将按钮的透明度变为一，使按钮显示，说明就可以点击了。
    musicBtn.style.opacity = 1;
    // 给音乐按钮添加点击事件
    musicBtn.addEventListener('click', function () {
        // 当前音乐是暂停的
        if (myAudio.paused) {
            //    我们让其播放 &&开启定时器
            myAudio.play();
            // 并通过classList.add(),向musicBth按钮添加类名move（使按钮有旋转的动画效果）
            musicBtn.classList.add('move');
            //    如果当前我们没有设置定时器
            if (autoTimer == null) {
                $sub.emit('playing');
                // 设定一个定时器，每间隔一秒执行一下play类的方法
                autoTimer = setInterval(() => {
                    //  歌词滚动，和进度条前进（这里运用事件池机制，同一时间执行多个方法时）
                    $sub.emit('playing');
                }, 1000);
                return;
            }
        }
        // 当前是播放的，我们让其暂停（调用audioPause()方法）
        audioPause();
    });
};
// 当离开页面时，如果停止定时器的时候，num就不加加了 
// document.addEventListener('visibilitychange', function () {
//     if (document.hidden) {
//         // 离开页面
//         clearInterval(autoTimer);
//         autoTimer = null;
//         return;
//     }
//     if (autoTimer == null) {
//         $sub.emit('playing');
//         autoTimer = setInterval(() => {
//             $sub.emit('playing');
//         }, 1000);
//     }
// })
queryData().then(value => {
    //拿到数据，在控制播放和暂停
    binding(value);
    handle();
})
