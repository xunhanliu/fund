/**
 * Created by Administrator on 2018/4/11 0011.
 */

//getTabs1ActiveID();

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
var lastSelPoint = [];
var nodeMap = {};
var linkListBuf = [];
var transform = "";
//app_main.config


var mainGraphPara = {
    similarToClose: true,
    dragFixed: false,
    mixedFlag: false,
    mixFunctionStr: "",
    similarPointDistance: 3 * 30,  //2倍半径
    maxPointSize: 30,
    maxGraphArea: 2,//即长宽是原图的二倍。
    graphArea: {x: [0, 0], y: [0, 0]},  //根据maxGraphArea来计算
    springback: 0.1,//碰到边界，让其瞬间回弹。
    classMapNum: {},

}


//circle的右键************************************************************
var whichNodeClick;
var mainRmenuClick = function (target) {
    if (!whichNodeClick) {
        return;
    }
    if ($(target).text() == 'cluster') {
        nodeClick_cluster(whichNodeClick);
    }
    else if ($(target).text() == 'kick point') {
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
    else if ($(target).text() == 'cluster(sel)') {
        showToast('info', "union clustering...");
        $.ajax({
            url: mylocalURL + "clustering", type: "POST", data: {
                'galleryIndex': 0,
                clusterData: JSON.stringify({
                    type: "union",
                    nameList: selectPoint,
                })
            }, success: function (result) {
                layui.use('form', function () {
                    var layer = layui.layer;
                    layer.msg('union cluster success, getting graph...', {
                        time: 1000 //2秒关闭（如果不配置，默认是3秒）
                    })
                });
                for (var i in selectPoint) {
                    if (isInArray(selectName, selectPoint[i]) == -1) {
                        selectName.push(selectPoint[i]);
                    }
                }
                main_deepRedraw();
            }
        });

    }
}


//line的右键************************************************************
var whichLineClick;
var mainLineRmenuClick = function (target) {
    if ($(target).text() == 'kick edge') {
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
var clusterList_mian = ['mono-clustering', 'multi-clustering', 'all-clustering', 'none-clustering'];
// var setOverlapThreshold;
// var setRalationThreshold;
app_main.configParameters = {
    clusterOption: {
        options: echarts.util.reduce(clusterList_mian, function (map, pos) {
            map[pos] = pos;
            return map
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
    similarValue:{
        min:0,
        max:0.3,
        step:0.01,
    }
    // verticalAlign: {
    //     options: {
    //         top: 'top',
    //         middle: 'middle',
    //         bottom: 'bottom'
    //     }
    // },

};


function layoutCheckClick(ev) {
    mainGraphPara[ev.target.value] = ev.target.checked;
    simulation.restart();
}

function mixedCheck(ev) {
    mainGraphPara[ev.target.value] = ev.target.checked;
   // ev.target.checked ? $("#inlineInputbox4").attr("disabled", false) : $("#inlineInputbox4").attr("disabled", true);
    if(ev.target.checked ){
        testMixedFunctionStr($("#inlineInputbox4")[0].value);}
    main_redraw(myChart_main_data);
    getorderRelationMatrixSuccess(myChart_main_data);
}

function makeMixFunction(ev) {
    //mainGraphPara['mixFunction']=ev.target.value;
    // simulation.restart();
    testMixedFunctionStr(ev.target.value);
    main_redraw(myChart_main_data);
    getorderRelationMatrixSuccess(myChart_main_data);
}

function testMixedFunctionStr(functionstr)
{
    mainGraphPara['mixFunctionStr'] = "";
    try {
        //代码可以正常执行,当里面有错,不会抛出错误
        var testResult=[0,0.5,1];
        var test=[0,0.5,1];
        var correlation,overlap,testResult0;
        for (var i in test){
            correlation= test[i];
            overlap=test[i];
            eval("testResult0="+functionstr);
            if(testResult0 !=testResult[i])
            {
                showToast('error',"输入关系的归一化不正确，请重新输入！");
                $("#inlineCheckbox3")[0].checked=false;
                $("#inlineInputbox4").css("background-color",'#f00');
                d3v4.select('#inlineCheckbox3').dispatch('change');//mixedCheck
                return ;

            }
        }
    } catch (e) {
        //当try里面的代码不出错,catch里面的代码是不会执行的;
        //如果try里面的代码出错,catch会把try里面错误的信息捕捉到,错误有一堆错误信息,(//error error.message error.name )
        //把这些错误信息给打包到e里面，一般情况下，我们都会打印e
        console.log(e.name + ':  ' + e.message);
        showToast('error', e.name + ':  ' + e.message);
        $("#inlineCheckbox3")[0].checked=false;
        $("#inlineInputbox4").css("background-color",'#f00');
        d3v4.select('#inlineCheckbox3').dispatch('change');//mixedCheck
        // 不会自动把错误信息打印在控制台，所以不会影响后续代码的执行
    }
    $("#inlineInputbox4").css("background-color",'#fff');
    mainGraphPara['mixFunctionStr']=functionstr;
}

var lastClusterOption = 'mono-clustering';
app_main.config = {
    clusterOption: 'mono-clustering',
    kickPointByNum: 0.01,
    similarValue:0.21,
    ResetKick: resetKick,
    UnDoKick: undoKick,
    lastSel: lastSel,
    // submitMulCluster: submitMulCluster,
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
        else if (typeof(change) == "boolean") //similarToClose  改变
        {

        }
        else if (typeof(change) == "number") {

            if(similarValue!=app_main.config.similarValue)
            {
                similarValue=app_main.config.similarValue;
                d3v4.select('#recommend_btn').dispatch("click");
            }else{
                main_deepRedraw();
            }
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
                if (app_main.config.clusterOption == "mono-clustering") {
                    clusterSelect = 0;
                    if (selectName.length > 1) {
                        //需要重新请求
                        buf = selectName[selectName.length - 1];
                        selectName = [];
                        selectName.push(buf);
                        main_deepRedraw();
                    }
                }
                else if (app_main.config.clusterOption == "multi-clustering") {
                    clusterSelect = 1;
                }
                else if (app_main.config.clusterOption == "all-clustering") {
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
    graph.nodes.forEach(function (node, index) {  //node.catListNum=[1,2,3] 是每类的数据数目
        node.value = node.symbolSize;
        node.symbolSize = node.symbolSize;//可以控制symbol大小
        node.group = node.category;// 分类从0开始取
        node.id = node.id;
        node.name = node.name;
        node.type = 'node';
        node.color = node.color;//这个值割点才能取到
        nodeMap[node.name] = index;
        if (node.name.split(',')[2] == 0) {
            node.catListNum = graph.catListNumMap[node.name.split(',')[0]];
            node.deg = [];  //存储角度，以弧度为单位
            var sum = d3.sum(node.catListNum);
            if (node.catListNum.length != 1) {
                node.deg.push(0);
                for (var i in node.catListNum) {
                    node.deg.push(node.catListNum[i] / sum * 2 * Math.PI);
                }
                for (var i = 1; i < node.deg.length; i++) {
                    node.deg[i] = node.deg[i] + node.deg[i - 1];
                }
            }
        }
        else {
            node.deg = [];
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

var svg_width = $("#mainGraph_controls").width(),
    svg_height = $("#mainGraph_controls").height();

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
(function () {

    $.getJSON('./data/car.json', function (graph) {
        graph_preprocessor(graph);
        main_redraw(myChart_main_data);
        getorderRelationMatrixSuccess(myChart_main_data);
        refrshParaChart(myChart_main_data);
        d3v4.select('#recommend_btn').dispatch("click");

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
        data.fx = null;
        data.fy = null;
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
    // if (selectPoint.length < 2) {
    //     showToast('warning', "请选中两个以上的点！");
    //     return;
    // }
    // //向后端发送 聚类消息
    //
    //
    // if (app_main.config.clusterOption != "multi-clustering") {
    //     showToast('warning', "请在‘clusterOption’中选中‘multi-clustering’！然后查看聚类结果！");
    //     return;
    // }
    //
    // //selectName = [];
    // main_deepRedraw(); //默认 按照selPoint进行分类


}





