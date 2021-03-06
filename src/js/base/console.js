var Console = {
    level: 'info',
    dateFormat: 'yyyyMMdd hh:mm:ss',
    DOM: null,
    line: '<p class="Console-line"></p>',
    tgt: '<div id="Console-log" style="opacity:0.7;position: fixed; top: 0;left:0; max-height: 105px;-webkit-overflow-scrolling:touch;overflow:auto;' +
        'line-height:1.5;z-index:999999;width:100%;font-size:11px;background:rgba(0,0,0,.8);color:#fff;bottom:0;' +
        '-webkit-user-select: initial;"></div>', //pointer-events:none;
    style: '<style>' +
        '.Console-line { margin-top:-1px;padding:.5em;border-top:1px solid rgba(255,255,255,.3);width:70% }' +
        ' .c_info .c_log { color:white; } .c_error { color:red; } .c_warn { color:yellow; } .c_debug { color:green; }' +
        ' </style>',
    inited: false,
    isDebug:false
};

var getParams= function (param1, param2) {
        var reg, url, param;
        if (typeof param2 === 'undefined') {
            url = window.location.href;
            param = param1;
        } else {
            url = param1;
            param = param2;
        }
        reg = new RegExp('(^|&?)' + param + '=([^&]*)[&#$]+', 'i');
        var rstArr = url.match(reg);
        if (rstArr !== null) {
            return decodeURIComponent(rstArr[2]);
        }
        return null;
};
var doc = window.document;
var docEl  = doc.documentElement;

Console.isDebug = function (){
    var isbug =  docEl.getAttribute('data-debug') ||
    getParams('debug') || getParams('DEBUG') || 'false';
    isbug = ( isbug === 'true' || isbug === '1') ? true : false;
    return isbug;
}();

//业务对象
var service = {};
//内部工具类
var util = {};

//获取参数类型
util.getType = function (t) {
    var _t, o = t;
    return ((_t = typeof (o)) === "object" ? o === null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
};

//转换成指定模式的时间字符串
util.DateFormat = function (date, format) {
    date=date||new Date();
    format=format || 'yyyyMMdd hh:mm:ss';
    var o = {
        "M+" : date.getMonth() + 1, // month
        "d+" : date.getDate(), // day
        "h+" : date.getHours(), // hour
        "m+" : date.getMinutes(), // minute
        "s+" : date.getSeconds(), // second
        "q+" : Math.floor((date.getMonth() + 3) / 3), // quarter
        "S" : date.getMilliseconds()
        // millisecond
    };
    try{
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {

            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
    }catch(e){
        console.log(e);
    }

    return format;
};

//返回模板对象
service.logObj = function (level) {
    var l = level || "INFO";
    var logobj = {
        timestamp : service.getTimestamp(),
        level : l
    };

    return logobj;
};

//生成输出标头
service.applyData = function (data) {
    data.alisLevel = data.level.toUpperCase().substring(0, 1);
    var t = [/*'',data.timestamp,*/" [ ", data.level, ' ] '].join('');

    return t;
};




//获取当前时间戳字符串
service.getTimestamp = function () {

    return util.DateFormat(new Date(), Console.dateFormat);
};

//添加html
service.output = function (prefixObj, text1, text2) {

    if (typeof text1 !== 'undefined' && typeof text2 !== 'undefined') {
        console.log(text1, text2);

    } else if (typeof text1 !== 'undefined') {
        console.log(text1);
    }

    try {
        if(!Console.isDebug){
            return;
        }
        //如果没有创建过log容器，则初始化容器
        if (!Console.inited) {
            service.init();
        }
        var div = document.createElement('div');
        div.className = 'c_' + prefixObj.level.toLowerCase() || "c_info";
        var html = service.applyData(prefixObj) + " " + text1;

        if (typeof text2 !== 'undefined') {
            html += ', ' + text2;
        }
        div.innerHTML = html;

        if ($('.c_log').length > 0) {
            Console.DOM.insertBefore(div, $('.c_log')[0]);

        } else {
            Console.DOM.appendChild(div);
        }

    } catch (e) {
        console.log("exception :" + e);
    }
};

//业务初始化
service.init = function () {

    if (!Console.inited) {
        var style = document.createElement("style");
        style.innerHTML = Console.style;
        document.body.appendChild(style);
        var div = document.createElement("div");
        div.innerHTML = Console.tgt;
        document.body.appendChild(div);
        Console.DOM = document.getElementById('Console-log');
        Console.inited = true;
    }
};
var leves=['LOG','DEBUG','INFO','ERROR','WARN'];
for(var i=0;i<leves.length;i++){
    var l=leves[i];
    Console[l.toLowerCase()] = function (text1, text2) {
        var logs = service.logObj("LOG");
        service.output(logs, text1, text2);
    };

}
/**
 * @memberof Console
 * @summary 以log形式输入日志
 * @type {function}
 * @property text1                            - 需要打印的内容1
 * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
 */
Console.log = function (text1, text2) {
    var logs = service.logObj("LOG");
    service.output(logs, text1, text2);
};

/**
 * @memberof Console
 * @summary 以log形式输入日志
 * @type {function}
 * @property text1                            - 需要打印的内容1
 * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
 */
Console.debug = function (text1, text2) {
    var logs = service.logObj("DEBUG");
    service.output(logs, text1, text2);
};

/**
 * @memberof Console
 * @summary 以info形式输入日志
 * @type {function}
 * @property text1                            - 需要打印的内容1
 * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
 */
Console.info = function (text1, text2) {
    var logs = service.logObj("INFO");
    service.output(logs, text1, text2);
};

/**
 * @memberof Console
 * @summary 以error形式输入日志
 * @type {function}
 * @property text1                            - 需要打印的内容1
 * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
 */
Console.error = function (text1, text2) {
    var logs = service.logObj("ERROR");
    service.output(logs, text1, text2);
};

/**
 * @memberof Console
 * @summary 以warn形式输入日志
 * @type {function}
 * @property text1                            - 需要打印的内容1
 * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
 */
Console.warn = function (text1, text2) {
    var logs = service.logObj("WARN");
    service.output(logs, text1, text2);
};

window.Console = Console;
/*
 * 兼容 RequireJS 和 Sea.js
 */
if (typeof define === "function") {
    define('base/console',function(require, exports, module) {
        module.exports = Console;
    })
}

export { Console };