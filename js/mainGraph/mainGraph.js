/**
 * Created by Administrator on 2018/4/11 0011.
 */
<<<<<<< HEAD
//getTabs1ActiveID();
=======
getTabs1ActiveID();
>>>>>>> 3e04ebd1f741eef741d89ececed57035181be992
var clusterSelect = 0; //聚类方式的索引  ~
//var myChart_main = echarts.init(document.getElementById(divID_main));
var selectName = [];  //聚类的维度选择  ~
var categoriesMain = [];  //存放全部裸维度名， ~
var relationThreshold = 0;
var overlapThreshold = 0;
var myChart_main_data = {};  // graph的前端数据
var lastGraphData = {};   //用于辅助前一个与后一个点的fixed
var kickPointList = []; //子名字
var kickEdgeList = [];
var selectPoint = [];//用于多个点，共同聚类
var similarValue = 0.2;
var nodeMap = {};
var linkListBuf = [];
var transform="";
//app_main.config


var mainGraphPara={
    similarToClose:true,
    dragFixed:false,
    similarPointDistance:3*30,  //2倍半径
    maxPointSize:30,
    maxGraphArea:2,//即长宽是原图的二倍。
    graphArea:{x:[0,0],y:[0,0]},  //根据maxGraphArea来计算
    springback:0.1,//碰到边界，让其瞬间回弹。
    classMapNum:{},

}




//circle的右键************************************************************
var whichNodeClick;
var mainRmenuClick = function (target) {
    if (!whichNodeClick) {
        return;
    }
    if ($(target).text() == '聚类操作') {
        nodeClick_cluster(whichNodeClick);
    }
    else if ($(target).text() == '剔除点') {
        //post
        //检查重点
        for (var i = 0; i < kickPointList.length; i++) {
            if (kickPointList[i] == whichNodeClick['id'])
                break;
        }
        if (i == kickPointList.length) //说明没有重点
        {
            kickPointList.push(whichNodeClick['id']);
        }
        main_deepRedraw();
    }
    else if ($(target).text() == '选择(聚类2)') {
        var name = whichNodeClick['id'].split(',')[0];

        var i = isInArray(selectPoint, name);
        if (i == -1) {// 不在里面，需要添加，然后设置相关的属性
            selectPoint.push(name);
            svg.select(".main_" + whichNodeClick.name.replace(/[\W]/g, '_')).style('stroke-width', 2)
                .style('stroke', "rgb(0,0,0)");
        } else {//在里面，需要删除，然后恢复默认属性
            selectPoint.splice(i, 1);
            svg.select(".main_" + whichNodeClick.name.replace(/[\W]/g, '_')).style('stroke-width', 1)
                .style('stroke', function (whichNodeClick) {
                    if (whichNodeClick.isCutPoint == true) {
                        return "rgb(0,0,0)";
                    }
                    else {
                        return myColorScheme[myColorScheme.scheme].color(whichNodeClick.group);
                    }
                })
        }
    }
}


//line的右键************************************************************
var whichLineClick;
var mainLineRmenuClick = function (target) {
    if ($(target).text() == '剔除边') {
        //post
        var i = 0;
        for (; i < kickEdgeList.length; i++) {
            if (whichLineClick['source']['id'] === kickEdgeList[i][0] && whichLineClick['target']['id'] === kickEdgeList[i][1]) {
                break;
            }
        }
        if (i >= kickEdgeList.length) {
            kickEdgeList.push([whichLineClick['source']['id'], whichLineClick['target']['id']]);
        }
        main_deepRedraw();
    }
}


var allConnectNameList = [];
var nodeMessName = "";
var hover_last = {stroke_width: 2, stroke: "#000"};
//右上角controlTab************************************************************
var app_main = {};
var clusterList_mian = ['单点聚类', '多点聚类', '全部聚类', '全部取消聚类'];
// var setOverlapThreshold;
// var setRalationThreshold;
app_main.configParameters = {
    clusterOption: {
        options: echarts.util.reduce(clusterList_mian, function (map, pos) {
            map[pos] = pos;
            return map;
        }, {})
    },
    overlapThreshold: {
        min: 0,
        max: 1,
        step: 0.01,
    },
    ralationThreshold: {
        min: 0,
        max: 1,
        step: 0.01,
    },
    kickPointByNum: {  //此比率以下的全部滤掉
        min: 0,
        max: 1,
        step: 0.01,
    },

    // verticalAlign: {
    //     options: {
    //         top: 'top',
    //         middle: 'middle',
    //         bottom: 'bottom'
    //     }
    // },

};

<<<<<<< HEAD
function layoutCheckClick(ev){
    mainGraphPara[ev.target.value]=ev.target.checked;
    simulation.restart();
}

var lastClusterOption = '单点聚类';
app_main.config = {
    clusterOption: '单点聚类',
=======
var lastClusterOption = '单点聚类';
app_main.config = {
    similarToClose:true,
    dragFixed:false,
    clusterOption: '单点聚类',
    overlapThreshold: 0.01,
    ralationThreshold: 0.01,
>>>>>>> 3e04ebd1f741eef741d89ececed57035181be992
    kickPointByNum: 0.01,
    ResetKick: resetKick,
    UnDoKick: undoKick,
    submitMulCluster: submitMulCluster,
    getSimilarPoint: getSimilarPoint,
    getAllConnect: getAllConnect,
    canselFixed: canselFixed,
    //不用写在app_main.configParameters里
    // 如果是Number 类型则用 slider来控制
    // 如果是 Boolean 类型，则用 Checkbox来控制
    // 如果是 Function 类型则用 button 来控制
    // 如果是 String 类型则用 input 来控制
    onFinishChange: function (change) {
        if (typeof(change) == "undefined") { //按钮触发
            return;
        }
        else if(typeof(change)=="boolean") //similarToClose  改变
        {
<<<<<<< HEAD
        }
        else if (typeof(change) == "number") {
=======
            mainGraphPara.similarToClose=app_main.config.similarToClose;
            mainGraphPara.dragFixed=app_main.config.dragFixed;
           // main_redraw(myChart_main_data);
            simulation.restart();
        }
        else if (typeof(change) == "number") {
                relationThreshold = app_main.config.ralationThreshold;
                overlapThreshold = app_main.config.overlapThreshold;
                main_deepRedraw();
>>>>>>> 3e04ebd1f741eef741d89ececed57035181be992
        }

    },
    onChange: function (change) {
        if (typeof(change) == "undefined") { //按钮触发
            return;
        }
        if (typeof(change) == "number") {
        }
        if (typeof(change) == "string") {
            if (app_main.config.clusterOption != lastClusterOption) {
                lastClusterOption = app_main.config.clusterOption;
                if (app_main.config.clusterOption == "单点聚类") {
                    clusterSelect = 0;
                    if (selectName.length > 1) {
                        //需要重新请求
                        buf = selectName[selectName.length - 1];
                        selectName = [];
                        selectName.push(buf);
                        main_deepRedraw();
                    }
                }
                else if (app_main.config.clusterOption == "多点聚类") {
                    clusterSelect = 1;
                }
                else if (app_main.config.clusterOption == "全部聚类") {
                    selectName = categoriesMain;
                    clusterSelect = 2;
                    main_deepRedraw();
                }
                else {
                    selectName = [];
                    clusterSelect = 3;
                    main_deepRedraw();
                }
            }
        }


    }
};
// if (gui_main) {
//     $(gui_main.domElement).remove();
//     gui_main.destroy();
//     gui_main = null;
// }
if (app_main.config) {
    gui_main = new dat.GUI({
        autoPlace: false
    });
    $(gui_main.domElement).css({
        position: 'absolute',
        // float:"right",
        right: 5,
        top: 0,
        color: "red",
        zIndex: 1000,
    });
    $("#mainGraph_controls").append(gui_main.domElement);

    var configParameters = app_main.configParameters || {};
    for (var name in app_main.config) {
        // var value = app_main.config[name];
        if (name !== 'onChange' && name !== 'onFinishChange') {
            var isColor = false;
            // var value = obj;
            var controller;
            if (typeof(configParameters[name]) != "undefined") {  //有配置参数
                if (configParameters[name].options) { //下拉列表
                    controller = gui_main.add(app_main.config, name, configParameters[name].options);
                }
                else if (configParameters[name].min != null) { // 连续的输入bar
                    controller = gui_main.add(app_main.config, name, configParameters[name].min, configParameters[name].max).step(configParameters[name].step);
                }
            }
            else if (name != 'onChange') {  //无配置参数， button 或者check框等
                controller = gui_main.add(app_main.config, name);
            }

            app_main.config.onChange && controller.onChange(app_main.config.onChange);
            app_main.config.onFinishChange && controller.onFinishChange(app_main.config.onFinishChange);
        }
    }
    gui_main.close();
}

//右上角controlTab  OVER************************************************************

function isInArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
            return i;
        }
    }
    return -1;
}

function graph_preprocessor(graph) {
    categoriesMain = graph['category'];
    var categories = [];
    for (var i = 0; i < graph['category'].length; i++) {
        categories[i] = {
            name: graph['category'][i]
        };
    }
    nodeMap = {};
    graph.nodes.forEach(function (node, index) {  //node.data=[1,2,3] 是每类的数据数目
        node.value = node.symbolSize;
        node.symbolSize = node.symbolSize;//可以控制symbol大小
        node.group = node.category;// 分类从0开始取
        node.id = node.id;
        node.name = node.name;
        node.type = 'node';
        node.color = node.color;//这个值割点才能取到
        nodeMap[node.name] = index;
        node.data=[1,2,3,4];
        node.deg=[];
        var sum=d3.sum(node.data);
        if( node.data.length!=1)
        {
            node.deg.push(0);
            for (var i in node.data) {
                node.deg.push(node.data[i]/sum*2*Math.PI);
            }
            for (var i=1;i<node.deg.length;i++) {
                node.deg[i]=node.deg[i]+node.deg[i-1];
            }
        }
    });
    //需要查看nodes的序号
    graph.links.forEach(function (link) {
        // node.itemStyle = null;//可以控制symbol颜色
        // link.id = link.id;
        // link.name = link.name;
        // // link.source = nodeMap[link.source];
        // // link.target = nodeMap[link.target];
        // link.overlap = link.overlap;
        // link.value = link.value;
        // link.width = link.width;
        // link.lineStyle = link.lineStyle;
        // link.color = link.color;
        link.type = 'edge';


    });

    $.extend(true, linkListBuf = [], graph.links);
    myChart_main_data = graph;
}



// var linear = d3.scale.linear()
//     .domain([100,1300])  //需要做相应的修改
//     .range([10,20]);



// width = +svg.attr("width"),
// height = +svg.attr("height");
<<<<<<< HEAD
var svg_width = $("#mainGraph_controls").width(),
    svg_height = $("#mainGraph_controls").height();
=======
var svg_width = $(tabs1ActiveID).width(),
    svg_height = $(tabs1ActiveID).height();
>>>>>>> 3e04ebd1f741eef741d89ececed57035181be992
var svg = d3.select("#mainGraph")
        .attr("width", svg_width)
        .attr("height", svg_height)
    //  .call(zoom)
    // .append("g");
;


var circleSizeScale_M = d3.scale.linear()
    .range([5, mainGraphPara.maxPointSize]);  //值域



function getMainPointPos() {
    d3.select("#mainGraph .gnode").selectAll(".node").each(function (data) {
        $.extend(true, lastGraphData[data.id] = {}, data);
    });
}


//设置圆圈和文字的坐标
function transform1(d) {
    return "translate(" + d.x + "," + d.y + ")";
}

function transform2(d) {
    return "translate(" + (d.x) + "," + d.y + ")";
}

//第一次加载
(function(){
<<<<<<< HEAD
    $.get('./data/car.json', function (graph) {
=======
    $.get('myData/car.json', function (graph) {
>>>>>>> 3e04ebd1f741eef741d89ececed57035181be992
        graph_preprocessor(graph);
        main_redraw(myChart_main_data);
        getorderRelationMatrixSuccess(myChart_main_data);
        refrshParaChart(myChart_main_data);

    });
})();

function nodeClick_cluster(node) {

    name = node['id'].split(',')[0];
    switch (clusterSelect) {
        case 3:
        case 0:
            if (selectName[0] == name) {
                selectName = [];
                main_deepRedraw();
            }
            else {
                selectName = [];
                selectName.push(name);
                main_deepRedraw();
            }
            break;
        case 1:
        case 2:
            i = isInArray(selectName, name);
            if (i == -1) {
                selectName.push(name);
                main_deepRedraw();
            } else {
                selectName.splice(i, 1);
                main_deepRedraw();
            }
            break;
    }


}

function canselFixed() {  //主图全部取消固定
    d3.select("#mainGraph .gnode").selectAll(".node").each(function (data) {
        data.fixed = false;
        data.fx=null;
        data.fy=null;
    });
    simulation.restart();
}

function resetKick() {
    kickEdgeList = [];
    kickPointList = [];
    main_deepRedraw();

}

function undoKick() {
    kickEdgeList.pop();
    kickPointList.pop();
    main_deepRedraw();

}

function submitMulCluster() {
    if (selectPoint.length < 2) {
        showToast('warning', "请选中两个以上的点！");
        return;
    }
    //向后端发送 聚类消息


    if (app_main.config.clusterOption != "多点聚类") {
        showToast('warning', "请在‘clusterOption’中选中‘多点聚类’！然后查看聚类结果！");
        return;
    }

    //selectName = [];
    main_deepRedraw(); //默认 按照selPoint进行分类


}


function getSimilarPoint() {
    var data = myChart_main_data['relation'];
    //不管正负，只考虑值
    //正负，与值都考虑
    var dataArr = [];
    var dataBuf = [];
    var dataArrS = [];
    var dataBufS = [];
    for (var i = 0; i < data.length; i++) {
        dataBuf = []
        dataBuf.push(i);
        dataBufS = []
        dataBufS.push(i);
        for (var j = i + 1; j < data.length; j++) {
            //比较第i行，和第j行
            if (compare(shallowRemove(data[i], i), shallowRemove(data[j], j), 0)) {
                dataBuf.push(j);
            }
            if (compare(shallowRemove(data[i], i), shallowRemove(data[j], j), 1)) {
                dataBufS.push(j);
            }
        }
        if (dataBuf.length != 1) {
            dataArr.push(dataBuf);
        }
        if (dataBufS.length != 1) {
            dataArrS.push(dataBufS);
        }
    }
    //解析名字
    var nameList = [];
    var nameBuf = [];
    var divBuf = "";
    divBuf += '<p>不考虑符号</p>';
    for (i in dataArr) {
        nameBuf = [];
        divBuf += '<p style="word-break: break-all; word-wrap:break-word;">';
        for (j in dataArr[i]) {
            //data.nodes
            var name = myChart_main_data["head"][dataArr[i][j]][0];
            nameBuf.push(name);
            divBuf = divBuf + '<span onmouseover="subspaceSpanOver(\'' + name.replace(/[\W]/g, '_') + '\')" onmouseout="subspaceSpanOut(\'' + name.replace(/[\W]/g, '_') + '\')" class="subspaceSpan" style="background-color: ' + getColorFromName(name) + '">' + myChart_main_data["head"][dataArr[i][j]][0] + '</span>'
        }
        divBuf += '</p>';
        if (nameBuf.length) {
            allConnectNameList.push(nameBuf);
        }
    }
    divBuf += '<p>考虑符号</p>';
    for (i in dataArrS) {
        divBuf += '<p style="word-break: break-all; word-wrap:break-word;">';
        for (j in dataArrS[i]) {
            var name = myChart_main_data["head"][dataArr[i][j]][0];
            divBuf = divBuf + '<span onmouseover="subspaceSpanOver(\'' + name.replace(/[\W]/g, '_') + '\')" onmouseout="subspaceSpanOut(\'' + name.replace(/[\W]/g, '_') + '\')" class="subspaceSpan" style="background-color: ' + getColorFromName(name) + '">' + name + '</span>'
        }
        divBuf += '</p>';
    }

    $("#subspace").css("width", "100%");
    $("#subspace").css("display", "block");
    $("#subspaceContent").html("");
    $("#subspaceContent").append(divBuf);
}

function subspaceSpanOver(name) {//name中不带逗号
    $(".main_" + name).addClass("myActiveCircle");
    $(".matrixText_" + name).addClass("active");
}

function subspaceSpanOut(name) {//name中不带逗号
    $(".main_" + name).removeClass("myActiveCircle");
    $(".matrixText_" + name).removeClass("active");
}

function getColorFromName(name) {
    // for(var i in myChart_main_data["node"])
    // {
    //    if( myChart_main_data["node"][i]["name"]==name)
    //    {
    //        return color20(myChart_main_data["node"][i]["group"]);
    //    }
    // }
    // return "#888"

    // myChart_main_data.category
    for (var i in myChart_main_data.category) {
        if (myChart_main_data["category"][i] == name.split(",")[0]) {
            return color20(i);
        }
    }
}

function compare(arr1, arr2, sign) {
    if (sign)//考虑符号
    {
        for (var i = 0; i < arr1.length; i++) {
            if (Math.abs(arr1[i] - arr2[i]) > similarValue) //符号相反也不行
            {
                return false;
            }
            else if (arr1[i] >= 0 ^ arr2[i] >= 0) {  //判断符号相反，进入
                return false;
            }
        }
    }
    else {//Math.abs() 不考虑符号
        for (var i = 0; i < arr1.length; i++) {
            if (Math.abs(Math.abs(arr1[i]) - Math.abs(arr2[i])) > similarValue) {
                return false;
            }
        }
    }
    return true;
}

function shallowRemove(arr, index) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        if (i != index) {
            result.push(arr[i]);
        }
    }
    return result;
}

function getAllConnect() {//贪婪，新加入的，要与原来的逐个比较
    var data = myChart_main_data['relation'];
    //不管正负，只考虑值
    //正负，与值都考虑
    var dataArr = [];
    var dataBuf = [];
    for (var i = 0; i < data.length; i++) {
        //需要判断，原数据中是否已经记录
        if (inRecord(dataArr, i)) {
            continue;
        }
        dataBuf = [];
        dataBuf.push(i);
        for (var j = i + 1; j < data.length; j++) {
            //比较第i行，和第j行
            if (data[i][j] != 0) {
                if (addOrNot(data, dataBuf, j))  //加入
                {
                    dataBuf.push(j);
                }
            }
        }
        if (dataBuf.length != 1) {
            dataArr.push(dataBuf);
        }

    }

    //解析名字
    allConnectNameList = [];
    var nameBuf = [];
    var divBuf = "";
    for (i in dataArr) {
        nameBuf = [];
        divBuf += "<p>" + "第" + i + "个全连接" + "</p>"
        divBuf += '<p style="word-break: break-all; word-wrap:break-word;" onmouseover="allConnectOver(\'' + dataArr[i] + '\')" onmouseout="allConnectOut(\'' + dataArr[i] + '\')" >';
        for (j in dataArr[i]) {
            //data.nodes
            var name = myChart_main_data["head"][dataArr[i][j]][0];
            nameBuf.push(name);
            divBuf = divBuf + '<span class="allConnectSpan" style="background-color: ' + getColorFromName(name) + '">' + myChart_main_data["head"][dataArr[i][j]][0] + '</span>'
        }
        divBuf += '</p>';
        if (nameBuf.length) {
            allConnectNameList.push(nameBuf);
        }
    }

    $("#allConnect").css("width", "100%");
    $("#allConnect").css("display", "block");
    $("#allConnectContent").html("");
    $("#allConnectContent").append(divBuf);
}


function allConnectOver(Arr) {
    Arr = Arr.split(",");
    for (var i in Arr) {
        var name = myChart_main_data["head"][Arr[i]][0];
        $(".main_" + name.replace(/[\W]/g, '_')).addClass("myActiveCircle");
        $(".matrixText_" + name.replace(/[\W]/g, '_')).addClass("active");
    }
    //$(".main_"+name).addClass("myActiveCircle");
    //$(".matrixText_"+name).addClass("active");
}

function allConnectOut(Arr) {
    Arr = Arr.split(",");
    for (var i in Arr) {
        var name = myChart_main_data["head"][Arr[i]][0];
        $(".main_" + name.replace(/[\W]/g, '_')).removeClass("myActiveCircle");
        $(".matrixText_" + name.replace(/[\W]/g, '_')).removeClass("active");
    }
}

function addOrNot(arr, dataBuf, j) {
    for (var i in dataBuf) {
        if (arr[i][j] == 0) {
            return false;
        }
    }
    return true;
}

function inRecord(dataArr, k) {//dataArr是两层数据
    for (var i in dataArr) {
        for (var j in dataArr[i]) {
            if (dataArr[i][j] == k) {
                return true;
            }
        }
    }
    return false;
}



