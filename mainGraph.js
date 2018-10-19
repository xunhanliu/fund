/**
 * Created by Administrator on 2018/4/11 0011.
 */
getTabs1ActiveID();
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
//app_main.config




//circle的右键************************************************************
var whichNodeClick;
$("body").append('<ul class="Rmenu" id="mainRmenu" style="display: none;z-index: 1001">' +
    '    <li><span onclick="mainRmenuClick(this)">聚类操作</span></li>' +
    '    <hr size="1px" noshade=true>' +
    '    <li><span onclick="mainRmenuClick(this)">剔除点</span></li>' +
    '    <hr size="1px" noshade=true>' +
    '    <li><span onclick="mainRmenuClick(this)">选择(聚类2)</span></li>' +
    '</ul>');

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
        deepRefresh_main();
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
                        return color(whichNodeClick.group);
                    }
                })
        }
    }
}


//line的右键************************************************************
var whichLineClick;
$("body").append('<ul class="Rmenu" id="mainLineRmenu" style="display: none;z-index: 1001">' +
    '    <li><span onclick="mainLineRmenuClick(this)">剔除边</span></li>' +
    '</ul>');
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
        deepRefresh_main();
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
    charge: {
        min: -6000,
        max: -100,
        step: 10,
    },
    // verticalAlign: {
    //     options: {
    //         top: 'top',
    //         middle: 'middle',
    //         bottom: 'bottom'
    //     }
    // },

};

var lastClusterOption = '单点聚类';
app_main.config = {
    clusterOption: '单点聚类',
    overlapThreshold: 0.01,
    ralationThreshold: 0.01,
    kickPointByNum: 0.01,
    charge: -6000,
    ResetKick: resetKick,
    UnDoKick: undoKick,
    confirmSel: confirmSel,
    deselect: deselect,
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
        if (typeof(change) == "number") {
            if (app_main.config.charge == change) {
                refreshMyChart_main(myChart_main_data);
            }
            else if (app_main.config.perplexity == change) {

            }
            else {
                relationThreshold = app_main.config.ralationThreshold;
                overlapThreshold = app_main.config.overlapThreshold;
                deepRefresh_main();
            }
            //refreshMyChart_main(myChart_main_data);

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
                        deepRefresh_main();
                    }
                }
                else if (app_main.config.clusterOption == "多点聚类") {
                    clusterSelect = 1;
                }
                else if (app_main.config.clusterOption == "全部聚类") {
                    selectName = categoriesMain;
                    clusterSelect = 2;
                    deepRefresh_main();
                }
                else {
                    selectName = [];
                    clusterSelect = 3;
                    deepRefresh_main();
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
    graph.nodes.forEach(function (node, index) {
        // node.itemStyle = null;//可以控制symbol颜色

        node.value = node.symbolSize;
        node.symbolSize = node.symbolSize;//可以控制symbol大小
        node.group = node.category;// 分类从0开始取
        node.id = node.id;
        node.name = node.name;
        node.type = 'node';
        node.color = node.color;//这个值割点才能取到
        nodeMap[node.name] = index;
    });
    //需要查看nodes的序号
    graph.links.forEach(function (link) {
        // node.itemStyle = null;//可以控制symbol颜色
        link.id = link.id;
        link.name = link.name;
        link.source = nodeMap[link.source];
        link.target = nodeMap[link.target];
        link.overlap = link.overlap;
        link.value = link.value;
        link.width = link.width;
        link.lineStyle = link.lineStyle;
        link.color = link.color;
        link.type = 'edge';
        // if(Math.abs(link.overlap)<=overlapThreshold || Math.abs(link.value)<=relationThreshold){
        //     link.opacity=0;
        // }
        // else  link.opacity=1;

    });

    $.extend(true, linkListBuf = [], graph.links);
    myChart_main_data = graph;
}

// function getGraphData(list1)
// {
//     $.ajax({url:mylocalURL+"fundGraph",type: "POST",data:{ 'nameList':JSON.stringify(list1),'selList':JSON.stringify(selectPoint)},success:function(graph){
//
//         graph_preprocessor(graph);
//         getorderRelationMatrixSuccess(myChart_main_data);
//
//         refreshMyChart_main(myChart_main_data);
//         refrshParaChart(myChart_main_data);
//     }});
//
// }

function firstLoad() {
    $.get('myData/car.json', function (graph) {
        graph_preprocessor(graph);
        refreshMyChart_main(myChart_main_data);
        getorderRelationMatrixSuccess(myChart_main_data);
        refrshParaChart(myChart_main_data);

    });

}

// var linear = d3.scale.linear()
//     .domain([100,1300])  //需要做相应的修改
//     .range([10,20]);

//控制图形的zoom
var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

function zoomed() {
    svg.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
}

// width = +svg.attr("width"),
// height = +svg.attr("height");
var svg_width = $(tabs1ActiveID).width(),
    svg_height = $(tabs1ActiveID).height();
var svg = d3.select("#mainGraph")
        .attr("width", svg_width)
        .attr("height", svg_height)
    //  .call(zoom)
    // .append("g");
;
var color = d3.scale.category20();


function deepRefresh_main() {

    showToast('info', "数据计算中，请不要进行graph的点击操作！");
    $.ajax({
        url: mylocalURL + "refreshGraph", type: "POST",
        data: {
            'nameList': JSON.stringify(selectName),
            'selList': JSON.stringify(selectPoint),
            'overlapThreshold': overlapThreshold,
            'relationThreshold': relationThreshold,
            'kickEdge': JSON.stringify(kickEdgeList),
            'kickPoint': JSON.stringify(kickPointList),
            'kickPointByNum': app_main.config.kickPointByNum,
            "galleryIndex": 0
        }, success: function (graph) {
            showToast('success', "数据计算成功！");
            graph_preprocessor(graph);
            getorderRelationMatrixSuccess(myChart_main_data);
            refreshMyChart_main(myChart_main_data);
            refrshParaChart(myChart_main_data);
        }
    });

}

function mainGraph_size_update() {
    getTabs1ActiveID();
    refreshMyChart_main(myChart_main_data);
}

var circleSizeScale_M = d3.scale.linear()
//.domain([-1, 0, 1])
    .range([5, 30]);

function refreshMyChart_main(graph) {

    svg.attr("width", $(tabs1ActiveID).width())
        .attr("height", $(tabs1ActiveID).height());

    circleSizeScale_M.domain([1, Number(graph['dataNum'])]);
    var a = circleSizeScale_M(100);
    // graph.links.forEach(function (link) {
    //     // node.itemStyle = null;//可以控制symbol颜色
    //     if(Math.abs(link.overlap)<=overlapThreshold || Math.abs(link.value)<=relationThreshold){
    //         link.opacity=0;
    //     }
    //     else  link.opacity=1;
    //
    // });

    svg.selectAll("g").remove();
    var links = myChart_main_data.links;
    var nodes = myChart_main_data.nodes;
    //把上一幅图的点的位置更新到本图上
    for (var i = 0; i < nodes.length - 1; i++) {
        if (typeof(lastGraphData[nodes[i].id]) != 'undefined') {
            nodes[i].fixed = lastGraphData[nodes[i].id].fixed;
            nodes[i].x = lastGraphData[nodes[i].id].x;
            nodes[i].y = lastGraphData[nodes[i].id].y;
            nodes[i].px = lastGraphData[nodes[i].id].px;
            nodes[i].py = lastGraphData[nodes[i].id].py;
        }
    }


    //三大属性之 thickness 与opacity  。 验证线宽取小数有用吗，实验证明：线宽取小数的时候是有用的



    // 三大映射,注意放在中间层映射，因为毕竟是0-1 到0-1的映射
    // 三大映射，之distance


    var dataLinkLength = d3.scale.linear()
        .domain([0, 1])
        .range([400, 90]);
    var force = d3.layout.force()//layout将json格式转化为力学图可用的格式
        .nodes(nodes)//设定节点数组
        .links(links)//设定连线数组
        .size([svg_width, svg_height])//作用域的大小
        //.linkDistance(app_main.config.linkDistance)//300 连接线长度
        .linkDistance(function (d) {
            return dataLinkLength(bzMap("distance",Math.abs(d.value)));
        })
        .gravity(0.5)//默认0.1  ，越大重力越大
        .friction( 0.2)
        .charge(app_main.config.charge)//-3000   顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥，正值是相互吸引
        .on("tick", tick)//指时间间隔，隔一段时间刷新一次画面
        .start();//开始转换


    //    //箭头
    //    var marker=
    //            svg.append("marker")
    //            //.attr("id", function(d) { return d; })
    //                    .attr("id", "resolved")
    //                    //.attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
    //                    .attr("markerUnits","userSpaceOnUse")
    //                    .attr("viewBox", "0 -5 10 10")//坐标系的区域
    //                    .attr("refX",32)//箭头坐标
    //                    .attr("refY", -1)
    //                    .attr("markerWidth", 12)//标识的大小
    //                    .attr("markerHeight", 12)
    //                    .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
    //                    .attr("stroke-width",2)//箭头宽度
    //                    .append("path")
    //                    .attr("d", "M0,-5L10,0L0,5")//箭头的路径
    //                    .attr('fill','#000000');//箭头颜色

    /* 将连接线设置为曲线
     var path = svg.append("g").selectAll("path")
     .data(force.links())
     .enter().append("path")
     .attr("class", function(d) { return "link " + d.type; })
     .style("stroke",function(d){
     //console.log(d);
     return "#A254A2";//连接线的颜色
     })
     .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
     */

    svg.selectAll(".edgepath").remove();
    //设置连接线
    var edges_line = svg.append("g").selectAll(".edgepath")
        .data(force.links())
        .enter()
        .append("path")
        .attr({
            'd': function (d) {
                return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
            },
            'class': 'edgepath',
            //'fill-opacity':0,
            //'stroke-opacity':0,
            //'fill':'blue',
            //'stroke':'red',
            'id': function (d, i) {
                return 'edgepath' + i;
            }
        })
        .style("stroke", function (d) {
            return colorMap(d.value);
        })
        .style("stroke-dasharray", function (d) {
            if (d.isCutEdge == 0)
                return "5,0";
            else return "5,5";
        })
        // .style("pointer-events", "none")
        .style("stroke-width", function (d) {
            return lineWidthMap(d.overlap);
        })//线条粗细
        .attr("marker-end", "url(#resolved)")//根据箭头标记的id号标记箭头
    ;
    edges_line = svg.selectAll('.edgepath')
        .on("click", function (link) {
            getScatterData([link['source']['id'], link['target']['id']], 0);

        })
        .on("contextmenu", function (link) {
            whichLineClick = link;
            return contextmenu("mainLineRmenu");
        });
//    var edges_text = svg.append("g").selectAll(".edgelabel")
//            .data(force.links())
//            .enter()
//            .append("text")
//            .style("pointer-events", "none")
//            //.attr("class","linetext")
//            .attr({  'class':'edgelabel',
//                'id':function(d,i){return 'edgepath'+i;},
//                'dx':80,
//                'dy':0
//                //'font-size':10,
//                //'fill':'#aaa'
//            });
//
//    //设置线条上的文字
//    edges_text.append('textPath')
//            .attr('xlink:href',function(d,i) {return '#edgepath'+i})
//            .style("pointer-events", "none")
//            .text(function(d){return d.rela;});
    edges_line.append("svg:title")
        .text(function (link) {
            return "source: " + link.source.name + ' -->target: ' + link.target.name + "\nralation: " + link.value + "\noverlap: " + link.overlap;//link.source ;link.target ;link.overlap ; link.value;
            //return "aaaa";
        });


    var drag = force.drag()
        .on("dragstart", dragstart)
        .on("dragend",function(d){
           // canselFixed();
            d3.select(this).classed("fixed", d.fixed = true);
        });

    function dblclick(d) {
        //d3.select(this).classed("fixed", d.fixed = false);

    }

    function dragstart(d) {
       // d3.select(this).classed("fixed", d.fixed = true);
    }

    //圆圈
    svg.selectAll("circle").remove();
    var circle = svg.append("g").selectAll("circle")
        .data(force.nodes())//表示使用force.nodes数据
        .enter().append("circle")
        .attr("class", function (data) {
            return "circle main_" + data.name.replace(/[\W]/g, '_');
        })
        .style("fill", function (node) {
            // var color;//圆圈背景色
            // var link=links[node.index];
            // if(node.name==link.source.name && link.rela=="主营产品"){
            //     color="#F6E8E9";
            // }else{
            //     color="#F9EBF9";
            // }
            return color(node.group);
        })
        .style('stroke', function (node) {
            // var color;//圆圈线条的颜色
            // var link=links[node.index];
            // if(node.name==link.source.name && link.rela=="主营产品"){
            //     color="#B43232";
            // }else{
            //     color="#A254A2";
            // }
            if (node.isCutPoint == true || isInArray(selectPoint, node['id'].split(',')[0]) != -1) {
                return "rgb(0,0,0)";
            }
            else {
                return color(node.group);
            }
        })
        .style('stroke-width', function (node) {
            if (isInArray(selectPoint, node['id'].split(',')[0]) != -1) {
                return 2;
            }
            else {
                return 1;
            }
        })
        .attr("r", function (node) {
            return circleSizeScale_M(Number(node['symbolSize']));
        })//设置圆圈半径
        // $(".circle").mouseover(function(){
        //     hover_last.stroke_width=$(this).css("stroke-width");
        //     hover_last.stroke=$(this).css("stroke");
        //     $(this).css("stroke-width","2 !important");
        //     $(this).css("stroke","#000 !important");
        // });
        // $(".circle").mouseout(function(){
        //     $(this).css("stroke-width",hover_last.stroke_width);
        //     $(this).css("stroke",hover_last.stroke);
        // });
        .on("mouseover", function (d) {
                // hover_last.stroke_width=$(this).css("stroke-width");
                // hover_last.stroke=$(this).css("stroke");
                // d3.select(this).attr("stroke-width","2 !important");
                // d3.select(this).attr("stroke","#000 !important");
                $(".matrixText_" + d.name.replace(/[\W]/g, '_')).addClass("mytextactive");
                $(".matrixText_" + d.name.replace(/[\W]/g, '_')).trigger('mouseenter');
                //与之相连的点，加shadow
                // for(var j in myChart_main_data.relation)
                // {
                //     if(myChart_main_data.relation[nodeMap[d.name]][j]!=0)
                //     {
                //         //$(".main_"+myChart_main_data.head[j][0].replace(/[\W]/g,'_')).addClass("hoverCircle");
                //         $(".main_"+myChart_main_data.head[j][0].replace(/[\W]/g,'_')).css("filter", "url(#drop-shadow)");
                //     }
                //
                // }

                d3.select("#mainGraph").selectAll("circle").each(function (data, index) {
                    if (myChart_main_data.relation[nodeMap[d.name]][nodeMap[data.name]] == 0 && d.name != data.name) //加gray属性
                    {
                        d3.select(this).style("fill", "rgba(9,9,9,0.1)");
                    }
                });
                d3.select("#mainGraph").selectAll("text").each(function (data, index) {
                    if (myChart_main_data.relation[nodeMap[d.name]][nodeMap[data.name]] == 0 && d.name != data.name) //加gray属性
                    {
                        d3.select(this).style("fill", "rgba(9,9,9,0)");
                    }
                });
                d3.select("#mainGraph").selectAll(".edgepath").each(function (data, index) {
                    if (!(data.source.name == d.name || data.target.name == d.name)) {
                        d3.select(this).style("stroke", "rgba(9,9,9,0.1)");
                    }
                });


                //d3.selectAll(".matrixText_"+d.name.replace(/[\W]/g,'_')).classed("active", true);
            }
        )
        .on("mouseout", function (d) {
            // $(this).css("stroke-width", hover_last.stroke_width);
            // $(this).css("stroke", hover_last.stroke);
            $(".matrixText_" + d.name.replace(/[\W]/g, '_')).removeClass("mytextactive");
            $(".matrixText_" + d.name.replace(/[\W]/g, '_')).trigger('mouseout');

            //与之相连的点，加shadow
            // for(var j in myChart_main_data.relation)
            // {
            //     if(myChart_main_data.relation[nodeMap[d.name]][j]!=0)
            //     {
            //         //$(".main_"+myChart_main_data.head[j][0].replace(/[\W]/g,'_')).removeClass("hoverCircle");
            //         $(".main_"+myChart_main_data.head[j][0].replace(/[\W]/g,'_')).css("filter", "");
            //     }
            //
            // }

            d3.select("#mainGraph").selectAll("circle")
                .style("fill", function (node) {
                    return color(node.group);
                });

            d3.select("#mainGraph").selectAll("text").style("fill", "#555");

            d3.select("#mainGraph").selectAll(".edgepath").style("stroke", function (d) {
                return colorMap(d.value);
            })


            //d3.selectAll(".matrixText_"+d.name.replace(/[\W]/g,'_')).classed("active", false);
        })
        .on("contextmenu", function (node) {
            whichNodeClick = node;
            return contextmenu("mainRmenu");
        })
        .on("click", function (node) {
        })
        .on("dblclick", function (node) {
            nodeMessName = node['id'];
            //iframe窗

            var str = '<div class="layui-fluid">' +
                '    <div class="layui-row layui-col-space6">' +
                '        <div class="layui-col-md9">' +
                '            <div id="node_detail_left" style="height: 300px"></div>' +
                '        </div>' +
                '        <div class="layui-col-md3">' +
                '            <div id="node_detail_right" style="height: 300px"></div>' +
                '        </div>' +
                '    </div>' +
                '</div>' +
                '<script src="./nodeDetail.js"></script>';
            layui.use('form', function () {
                var layer = layui.layer;
                layer.open({
                    type: 1,
                    title: nodeMessName + "的分布",
                    maxmin: true, //开启最大化最小化按钮
                    shadeClose: true,
                    area: ['800px', '342px'],
                    content: str, //iframe的url，no代表不显示滚动条
                });
            });

            setTimeout(getNodeDetailData(nodeMessName, 0), 100);

        })
        .call(drag);//将当前选中的元素传到drag函数中，使顶点可以被拖动
    /*
     circle.append("text")
     .attr("dy", ".35em")
     .attr("text-anchor", "middle")//在圆圈内添加文字
     .text(function(d) {
     //console.log(d);
     return d.name;
     }); */

    //圆圈的提示文字
    circle.append("svg:title")
        .text(function (node) {
            // var link=links[node.index];
            // if(node.name==link.source.name && link.rela=="主营产品"){
            //     return "双击可查看详情"
            // }
            return "name: " + node.name + '\n数据条数： ' + node.value;//name    数据条数：
        });
    svg.selectAll("text").remove();
    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
        //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")//在圆圈中加上数据
        .style('fill', function (node) {
            // var color;//文字颜色
            // var link=links[node.index];
            // if(node.name==link.source.name && link.rela=="主营产品"){
            //     color="#B43232";
            // }else{
            //     color="#A254A2";
            // }
            return '#555';
        }).attr('x', function (d) {
            // console.log(d.name+"---"+ d.name.length);
            var re_en = /[a-zA-Z]+/g;
            //如果是全英文，不换行
            if (d.name.match(re_en)) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', -10)
                    .text(function () {
                        return d.name;
                    });
            }
            //如果小于四个字符，不换行
            else if (d.name.length <= 4) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', -10)
                    .text(function () {
                        return d.name;
                    });
            } else {
                var top = d.name.substring(0, 4);
                var bot = d.name.substring(4, d.name.length);

                d3.select(this).text(function () {
                    return '';
                });

                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', -7)
                    .text(function () {
                        return top;
                    });

                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 10)
                    .text(function () {
                        return bot;
                    });
            }
        });


    function tick() {

        if (force.alpha() <= 0.1) {
            circle.attr("transform", transform1);//圆圈
            text.attr("transform", transform2);//顶点文字
            edges_line.attr('d', function (d) {
                var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                return path;
            });
        }
//        edges_text.attr('transform',function(d,i){
//            if (d.target.x<d.source.x){
//                bbox = this.getBBox();
//                rx = bbox.x+bbox.width/2;
//                ry = bbox.y+bbox.height/2;
//                return 'rotate(180 '+rx+' '+ry+')';
//            }
//            else {
//                return 'rotate(0)';
//            }
//        });
    }

    var timeout = setTimeout(function () {
        lastGraphData = {};
        svg.selectAll("circle").each(function (data) {
            lastGraphData[data.id] = data;
        });
    }, 5000);
}

function getMainPointPos() {
    d3.select("#mainGraph").selectAll("circle").each(function (data) {
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

//先请求一次
firstLoad();

function externalRefreshMain() {
    deepRefresh_main();
}

function nodeClick_cluster(node) {

    name = node['id'].split(',')[0];
    switch (clusterSelect) {
        case 3:
        case 0:
            if (selectName[0] == name) {
                selectName = [];
                deepRefresh_main();
            }
            else {
                selectName = [];
                selectName.push(name);
                deepRefresh_main();
            }
            break;
        case 1:
        case 2:
            i = isInArray(selectName, name);
            if (i == -1) {
                selectName.push(name);
                deepRefresh_main();
            } else {
                selectName.splice(i, 1);
                deepRefresh_main();
            }
            break;
    }


}

function canselFixed() {  //主图全部取消固定
    d3.select("#mainGraph").selectAll("circle").each(function (data) {
        data.fixed = false;
    });
}

function resetKick() {
    kickEdgeList = [];
    kickPointList = [];
    deepRefresh_main();

}

function undoKick() {
    kickEdgeList.pop();
    kickPointList.pop();
    deepRefresh_main();

}

function confirmSel() {
    if (app_main.config.clusterOption != "多点聚类") {
        showToast('warning', "请在‘clusterOption’中选中‘多点聚类’！");
        return;
    }
    if (selectPoint.length < 2) {
        showToast('warning', "请选中两个以上的点！");
        return;
    }
    selectName = [];
    deepRefresh_main(); //默认 按照selPoint进行分类


}

function deselect() {
    selectPoint = [];
    refreshMyChart_main(myChart_main_data);

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
    //        return color(myChart_main_data["node"][i]["group"]);
    //    }
    // }
    // return "#888"

    // myChart_main_data.category
    for (var i in myChart_main_data.category) {
        if (myChart_main_data["category"][i] == name.split(",")[0]) {
            return color(i);
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



