
//屏蔽选中  return true;正常选中
document.onselectstart = function (event) {
    if (window.event) {
        event = window.event;
    }
    try {
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}
//屏蔽右键菜单
document.oncontextmenu = function(event) {
    if (window.event) {
        event = window.event;
    }
    try {
        var the = event.srcElement;
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

//获取可视区宽度
var winWidth = function () {
   // return document.documentElement.clientWidth || document.body.clientWidth;
    return document.body.clientWidth;
}
//获取可视区高度
var winHeight = function () {
    return document.body.clientHeight;
    //return document.documentElement.clientHeight || document.body.clientHeight; //前一个不考虑滚动条，后一个考虑滚动条
}

var contextmenu=function(id){
    var event = d3.event || window.event;
    var mainRmenu = document.getElementById(id);
   // mainRmenu.style.display = 'block';
    $("#"+id).slideDown(200);
    var l, t;
    l = event.pageX;
    t = event.pageY;
    if (l >= (winWidth() - mainRmenu.offsetWidth)) {
        l = winWidth() - mainRmenu.offsetWidth;
    } else {
        l = l
    }
    if (t > winHeight() - mainRmenu.offsetHeight) {
        t = winHeight() - mainRmenu.offsetHeight;
    } else {
        t = t;
    }
    // if(ev.pageX || ev.pageY){
    //     return {x:ev.pageX, y:ev.pageY};
    // }
    // return {
    //     x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
    //     y:ev.clientY + document.body.scrollTop - document.body.clientTop
    // };
    mainRmenu.style.left = l + 'px';
    mainRmenu.style.top = t + 'px';

    event.stopPropagation();
    event.preventDefault();
    return false;

}
window.onload = function () {
    $("body").click(function(event){
        // $("#mainRmenu").css("display","none");
        // $("#mainLineRmenu").css("display","none");
        $("#mainRmenu").slideUp(200);
        $("#mainLineRmenu").slideUp(200);
       // $("#mainSet").slideUp(200);
    });
    $("#mainRmenu").click(function(event){
        event = event || window.event;
        //$("#mainRmenu").css("display","none");
        $("#mainRmenu").slideUp(200);
        event.cancelBubble = true;
    });

    $("#mainLineRmenu").click(function(event){
        event = event || window.event;
        //$("#mainLineRmenu").css("display","none");
        $("#mainLineRmenu").slideUp(200);
        event.cancelBubble = true;
    });

}


// //点右键
// $("body").append('<ul class="Rmenu" id="mainRmenu" style="display: none;z-index: 1001">' +
//     '    <li><span onclick="mainRmenuClick(this)">聚类操作</span></li>' +
//     '    <hr size="1px" noshade=true>' +
//     '    <li><span onclick="mainRmenuClick(this)">剔除点</span></li>' +
//     '    <hr size="1px" noshade=true>' +
//     '    <li><span onclick="mainRmenuClick(this)">选择(聚类2)</span></li>' +
//     '</ul>');
// //边右键
// $("body").append('<ul class="Rmenu" id="mainLineRmenu" style="display: none;z-index: 1001">' +
//     '    <li><span onclick="mainLineRmenuClick(this)">剔除边</span></li>' +
//     '</ul>');