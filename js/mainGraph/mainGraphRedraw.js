// 使用d3 V4

// //控制图形的zoom
// var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
//
// function zoomed() {
//     svg.attr("transform",
//         "translate(" + zoom.translate() + ")" +
//         "scale(" + zoom.scale() + ")"
//     );
// }
function mainGraph_size_update() {
    //getTabs1ActiveID();
    main_redraw(myChart_main_data);
}

function main_deepRedraw() {

    showToast('info', "数据计算中，请不要进行graph的点击操作！");
    $.ajax({
        url: mylocalURL + "refreshGraph", type: "POST",
        data: {
            mainGraphPara:JSON.stringify({'overlapThreshold': overlapThreshold,
            'nameList': (selectName),
            'selList': (selectPoint),
            'relationThreshold': relationThreshold,
            'kickEdge': (kickEdgeList),
            'kickPoint': (kickPointList),
            'kickPointByNum': app_main.config.kickPointByNum,
            }),
            "galleryIndex": 0
        }, success: function (graph) {
            showToast('success', "数据计算成功！");
            graph_preprocessor(graph);
            getorderRelationMatrixSuccess(myChart_main_data);
            main_redraw(myChart_main_data);
            refrshParaChart(myChart_main_data);
        }
    });

}

//使用d3  V4版本   ，内部d3变量使用d3v4替换

//"main_" + d.name.replace(/[\W]/g, '_');
var simulation;
function legend_redraw(nodes){
    $("#main_legend").html("");
    str="";
    nodes.forEach(function (d,i) {
        var id="main_" + d.name.replace(/[\W]/g, '_');
        str+='<li  class="graph-legend" onmouseover="legendOver(\''+ id+'\')"  onmouseout="legendOut(\''+id+'\')" style="background-color:'+ myColorScheme[myColorScheme.scheme].color(d.group)+'">'+d.name+'</li>'
    });
    // for(var i=0;i<50;i++)
    // {
    //     str+='<li  class="graph-legend" style="background-color:#0f0">'+i+'</li>';
    // }
    $("#main_legend").html(str);
}
function FireEvent(elem, eventName)
{
    if(typeof(elem) == 'object')
    {
        eventName = eventName.replace(/^on/i,'');
        if (document.all)
        {//
            eventName = "on"+eventName;
            elem.fireEvent(eventName);
        }
        else
        {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventName,true,true);
            elem.dispatchEvent(evt);
        }
    }
}
function legendOver(id){
    //$("#"+id).trigger("mouseover");
    FireEvent(document.getElementById(id), 'mouseover')
    //d3.selectAll("#"+id).dispatch('mouseover');
}
function legendOut(id){
    //$("#"+id).trigger("mouseout");
    FireEvent(document.getElementById(id), 'mouseout')
    //d3.selectAll("#"+id).dispatch('mouseout');
}
function main_redraw(graph) {
    // if both d3v3 and d3v4 are loaded, we'll assume
    // that d3v4 is called d3v4, otherwise we'll assume
    // that d3v4 is the default (d3)

    legend_redraw(graph.nodes);

    getMainPointPos();  //保存上一幅图的布局
    circleSizeScale_M.domain([1, Number(graph['dataNum'])]);
    //下面两个for循环是为similarToClose的tick做准备
    mainGraphPara.classMapNum={}
    for(var i in graph.head ){
        var name=graph.head[i][0].split(",")[0];
        var index=graph.head[i][0].split(",")[2];
        if(name in mainGraphPara.classMapNum)
        {
            mainGraphPara.classMapNum[name]["num"]+=1;
            mainGraphPara.classMapNum[name][index]=0;
        }
        else{
            mainGraphPara.classMapNum[name]={"num":1,"mainPoint":graph.head[i][0],"middleNum":graph.head[i][0].split(",")[1]};// 主点不记录index
        }
    }
    var angle=0;
    for ( var n in mainGraphPara.classMapNum){
        var value=mainGraphPara.classMapNum[n];
        var num=value["num"]-1;  //子点个数
        angle=0;
        for(var m in value)
        {
            if(m=="num" || m=="mainPoint" ||m=="middleNum")
            {
                continue;
            }
            else{
                value[m]=angle;
                angle+=2*Math.PI/num;
            }
        }
    }

//node中心点的布局范围
    mainGraphPara.graphArea.x[0]=(svg_width-svg_width*mainGraphPara.maxGraphArea)/2;
    mainGraphPara.graphArea.x[1]=(svg_width-svg_width*mainGraphPara.maxGraphArea)/2+mainGraphPara.maxGraphArea*svg_width;
    mainGraphPara.graphArea.y[0]=(svg_height-svg_height*mainGraphPara.maxGraphArea)/2;
    mainGraphPara.graphArea.y[1]=(svg_height-svg_height*mainGraphPara.maxGraphArea)/2+mainGraphPara.maxGraphArea*svg_height;
   // 把上一幅图的点的位置更新到本图上
    for (var i = 0; i < graph.nodes.length - 1; i++) {
        if (typeof(lastGraphData[graph.nodes[i].id]) != 'undefined') {
            graph.nodes[i].x = lastGraphData[graph.nodes[i].id].x;
            graph.nodes[i].y = lastGraphData[graph.nodes[i].id].y;
            graph.nodes[i].fx = lastGraphData[graph.nodes[i].id].fx;
            graph.nodes[i].fy = lastGraphData[graph.nodes[i].id].fy;
        }
    }


    var dataLinkLength = d3.scale.linear()
        .domain([0, 1])
        .range([500, 100]);
    var parentWidth=svg_width;
    var parentHeight=svg_height;

    // remove any previous graphs
    var svg = d3v4.select('#mainGraph')
    .attr('width', parentWidth)
    .attr('height', parentHeight)
    svg.selectAll('g').remove();
    svg.selectAll('text').remove();
    var gMain = svg.append('g')
        .classed('g-main', true);

    var rect = gMain.append('rect')
        .attr('width', parentWidth)
        .attr('height', parentHeight)
        .style('fill', 'white')
       // .attr('class', 'back') //背景

    var gDraw = gMain.append('g')
        .classed('g-zoom', true);
//zoom
     var zoom = d3v4.zoom().scaleExtent([0.3, 3])
        .on('zoom', zoomed).on("end",zoomEnd);
    gMain.call(zoom).on('dblclick.zoom', null)
        .on('click.zoom', null)
        ;
     function zoomEnd(d){
         transform=d3v4.select("#mainGraph .g-zoom").attr("transform");
     }
    function zoomed() {
        gDraw.attr('transform', d3v4.event.transform);
    }
//*zoom
//     var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

    // the brush needs to go before the nodes so that it doesn't
    // get called when the mouse is over a node
    var drawBorder=gDraw.append('rect')
        //rect比中心点的布局范围稍微大一些
        .attr('width', svg_width*mainGraphPara.maxGraphArea+mainGraphPara.maxPointSize)
        .attr('height', svg_height*mainGraphPara.maxGraphArea+mainGraphPara.maxPointSize)
        .attr("x",mainGraphPara.graphArea.x[0]-mainGraphPara.maxPointSize/2)
        .attr("y",mainGraphPara.graphArea.y[0]-mainGraphPara.maxPointSize/2)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('fill', 'white')
        .attr('class', 'back')
        .on('click', () => {
            node.each(function(d) {
                d.selected = false;
                d.previouslySelected = false;
            });
            node.classed("selected", false);
        })
    ;
    var gBrushHolder = gDraw.append('g');

    var gBrush = null;

    var link = gDraw.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return lineWidthMap(d.overlap);; })
        .attr("stroke-dasharray", function (d) {
            if (d.isCutEdge == 0)
                return "5,0";
            else return "5,5";
        })
        .style("stroke", function (d) {
        return colorMapCooperateOpacity(d.value);
    })
        .attr("opacity", function (d) {
            return opacityMap(d.value);
        })
        .on("click", function (link) {
            //getScatterData([link['source']['id'], link['target']['id']], 0);
            otherGraph_g.new("edgeScatter",{nameList:[link['source']['id'], link['target']['id']], galleryIndex:0});
        })
        .on("contextmenu", function (link) {
            whichLineClick = link;
            return contextmenu("mainLineRmenu");
        })
    ;
    link.append("svg:title")
        .text(function (link) {
            return "source: " + link.source.name + ' -->target: ' + link.target.name + "\nralation: " + link.value + "\noverlap: " + link.overlap;//link.source ;link.target ;link.overlap ; link.value;
        });

    var node = gDraw.append("g")
        .attr("class", "gnode")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", function(d){

            return "node "+"main_" + d.name.split(",")[0].replace(/[\W]/g, '_');
        })
        .attr("id", function(d){
            return "main_" + d.name.replace(/[\W]/g, '_');
        })
        .call(d3v4.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .style("fill", function (node) {
            return myColorScheme[myColorScheme.scheme].color(node.group);
        })
        .attr("r", function (node) {
            return circleSizeScale_M(Number(node['symbolSize']));
        })//设置圆圈半径
        .style('stroke', function (node) {
            if (node.isCutPoint == true ) {  // || isInArray(selectPoint, node['id'].split(',')[0]) != -1
                return "#000";
            }
            else{
                return "#fff";
            }
        });
    node.selectAll(".splitLine")
        .data(function (d) {
            return d.deg;
        })
        .enter().append("line")
        .attr("class",'splitLine')
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",function (d) {
            var node=d3.select(this)[0][0].parentNode.__data__;
            var r=circleSizeScale_M(Number(node['symbolSize']));
            return r*Math.sin(d);

        })
        .attr("y2",function (d) {
            var node=d3.select(this)[0][0].parentNode.__data__;
            var r=circleSizeScale_M(Number(node['symbolSize']));
            return -r*Math.cos(d);
        })


    // add titles for mouseover blurbs
    node.append("title")
        .text(function (node) {
            return "name: " + node.name + '\n数据条数： ' + node.value;//name    数据条数：
        });

    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")//在圆圈中加上数据
        .style('fill', function (node) {
            return '#555';
        })
        .attr("y",-7)
        .text(function (d) {
            return d.name;
        });
    ;
    simulation = d3v4.forceSimulation()
        .force("link", d3v4.forceLink()
            .id(function(d) { return d.id; })
            .distance(function(d) {
                return dataLinkLength(bzMap("distance",Math.abs(d.value)));

            })
           // .iterations(function(d){ return Math.ceil(Math.abs(d.value)*10+1)})
        )
        .velocityDecay(0.5)  //默认0.4
         .force("center", d3v4.forceCenter(parentWidth / 2, parentHeight / 2))  //写center力会出bug
        .force("x", null)
        .force("y", null)
    ;

    setTimeout(function(){
        simulation.force("center",null).force("x", null)
            .force("y", null)
            .restart();
    },2000);
    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);
    simulation.force('collision',d3v4.forceCollide(mainGraphPara.maxPointSize+5) )  //使能碰撞力，使点之间无重叠
        .force("charge",d3v4.forceManyBody()
            .strength(-100) //静电斥力
            .distanceMax(parentHeight/8)
			.distanceMin(mainGraphPara.maxPointSize+5)
        )

    // var mainGraphPara={
    //     maxPointSize:30,
    //     maxGraphArea:2,//即长宽是原图的二倍。
    //     graphArea:{x:[0,0],y:[0,0]},  //根据maxGraphArea来计算
    //     springback:0.1//碰到边界，让其瞬间回弹。
    //
    // }
    function ticked() {
        // update node and line positions at every step of
        // the force simulation
        node.attr("transform", function (d) {  //忽略第一波的tick
//限定布局范围
            if (d.x<=mainGraphPara.graphArea.x[0] )
            {
                d.x+= mainGraphPara.springback*svg_width;
                d.vx/=4;
            }
            else if(d.x>=mainGraphPara.graphArea.x[1]){
                d.x-= mainGraphPara.springback*svg_width;
                d.vx/=4;
            }
            if (d.y<=mainGraphPara.graphArea.y[0] )
            {
                d.y+= mainGraphPara.springback*svg_height;
                d.vy/=4;
            }
            else if(d.y>=mainGraphPara.graphArea.y[1]){
                d.y-= mainGraphPara.springback*svg_height;
                d.vy/=4;
            }
            // 检查相似点是否需要放一起
            if(mainGraphPara.similarToClose){
               // if(d.name.split(",")[2]!="0"){ //是主点就跳过
                if(!mainGraphPara.classMapNum[d.name.split(",")[0]])
                {
                    return "translate(" + d.x + "," + d.y + ")";
                }
                if(mainGraphPara.classMapNum[d.name.split(",")[0]].num==1 ||mainGraphPara.classMapNum[d.name.split(",")[0]].middleNum!=d.name.split(",")[1] ){
                    return "translate(" + d.x + "," + d.y + ")";
                }
                var mainPoint=mainGraphPara.classMapNum[d.name.split(",")[0]].mainPoint;
                if(mainPoint!=d.name){ //是主点就跳过
                    var pos=[];//找到主点位置
                    var vpos=[];
                    var childNum=0;
                    // d3.selectAll(".main_" + d.name.split(",")[0].replace(/[\W]/g, '_')).each(function(data){
                    //     if(data.name==mainPoint)
                    //     {
                    //         pos=[data.x,data.y];
                    //         vpos=[data.vx,data.vy];
                    //         return false;
                    //         //childNum=Number(data.name.split(",")[1])-1;
                    //     }
                    // }) ;
                    var data=d3.select("#main_" + mainPoint.replace(/[\W]/g, '_')).data()[0];
                    pos=[data.x,data.y];
                    vpos=[data.vx,data.vy];
                    //下面这种算法易造成振荡，原因：多个子点在同一个方向上，易造成向边界上移动
                    // var poschild=[d.x,d.y];
                    // if(pos.length)
                    // {
                    //     var s=Math.sqrt((poschild[0]-pos[0])**2+(poschild[1]-pos[1])**2);
                    //     var s1=mainGraphPara.similarPointDistance;
                    //     d.x=pos[0]-s1/s*(pos[0]-poschild[0]);
                    //     d.y=pos[1]-s1/s*(pos[1]-poschild[1]);
                    //     d.vx=vpos[0];
                    //     d.vy=vpos[1];
                    // }
                    //取子点个数，根据索引分布在主点的圆周上。
                   // var deg=2*Math.PI/childNum*(d.name.split(",")[2]-1);
                    if(!pos.length){
                        console.error("未找到pos数据点！！！");
                    }
                    var deg= mainGraphPara.classMapNum[d.name.split(",")[0]][Number(d.name.split(",")[2])];
                    d.x=pos[0]+mainGraphPara.similarPointDistance*Math.cos(deg);
                    d.y=pos[1]+mainGraphPara.similarPointDistance*Math.sin(deg);
                    d.vx=vpos[0];
                    d.vy=vpos[1];
                }
            }

            if(!isNaN(d.x)&& !isNaN(d.x)){
                return "translate(" + d.x + "," + d.y + ")";
            }
            console.log(mainGraphPara.classMapNum[d.name.split(",")[0]]+"\npoint:"+d.name);
        })



        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        // node.attr("cx", function(d) { return d.x; })
        //     .attr("cy", function(d) { return d.y; });

    }

    var brushMode = false;
    var brushing = false;

    var brush = d3v4.brush()
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended);

    function brushstarted() {
        // keep track of whether we're actively brushing so that we
        // don't remove the brush on keyup in the middle of a selection
        brushing = true;

        node.each(function(d) {
            d.previouslySelected = shiftKey && d.selected;
        });
    }



    function brushed() {
        if (!d3v4.event.sourceEvent) return;
        if (!d3v4.event.selection) return;

        var extent = d3v4.event.selection;

        node.classed("selected", function(d) {
            return d.selected = d.previouslySelected ^
                (extent[0][0] <= d.x && d.x < extent[1][0]
                    && extent[0][1] <= d.y && d.y < extent[1][1]);
        });


    }

    function brushended() {
        if (!d3v4.event.sourceEvent) return;
        if (!d3v4.event.selection) return;
        if (!gBrush) return;

        gBrush.call(brush.move, null);

        if (!brushMode) {
            // the shift key has been release before we ended our brushing
            gBrush.remove();
            gBrush = null;
        }

        brushing = false;
        reSelectPoint();

    }
    function reSelectPoint(){
        if($(".gnode .selected").length)
        {
            selectPoint=[];
            d3v4.selectAll(".gnode .selected").each(function(d) {
                var name= d.name.split(',')[0];
                if(isInArray(selectPoint,name)==-1)
                {
                    selectPoint.push(name);
                }
            })
        }
    }


    d3v4.select('body').on('keydown', keydown);
    d3v4.select('body').on('keyup', keyup);

    var shiftKey;

    function keydown() {
        shiftKey = d3v4.event.shiftKey;

        if (shiftKey) {
            // if we already have a brush, don't do anything
            if (gBrush)
                return;

            brushMode = true;

            if (!gBrush) {

                gBrush = gBrushHolder.append('g');
                gBrush.call(brush);
            }
        }
    }

    function keyup() {
        shiftKey = false;
        brushMode = false;

        if (!gBrush)
            return;

        if (!brushing) {
            // only remove the brush if we're not actively brushing
            // otherwise it'll be removed when the brushing ends
            gBrush.remove();
            gBrush = null;
        }
    }

    function dragstarted(d) {
        myColorScheme.active.lastActiveName=d.group;
        if (!d3v4.event.active) simulation.alphaTarget(0.9).restart();

        if (!d.selected && !shiftKey) {
            // if this node isn't selected, then we have to unselect every other node
            node.classed("selected", function(p) { return p.selected =  p.previouslySelected = false; });
        }

        d3v4.select(this).classed("selected", function(p) { d.previouslySelected = d.selected; return d.selected = true; });

        node.filter(function(d) { return d.selected; })
            .attr("transform",function(d){return "translate(" + d.x + "," + d.y + ")";})
            .each(function(d) { //d.fixed |= 2;
                d.fx = d.x;
                d.fy = d.y;
            })

    }

    function dragged(d) {
        //d.fx = d3v4.event.x;
        //d.fy = d3v4.event.y;
        node.filter(function(d) { return d.selected; })
            .each(function(d) {
                d.fx += d3v4.event.dx;
                d.fy += d3v4.event.dy;
            })
    }

    function dragended(d) {
        if (!d3v4.event.active) simulation.alphaTarget(0);
        // d.fx = null;
        // d.fy = null;
        node.filter(function(d) { return d.selected; })
            .each(function(d) { //d.fixed &= ~6;
                d.fx = null;
                d.fy = null;
            });
        if(mainGraphPara.dragFixed)
        {
            d.fx =d.x;
            d.fy = d.y;
        }
        else{
             d.fx = null;
             d.fy = null;
        }
    }

    // var texts = ['Use the scroll wheel to zoom',
    //     'Hold the shift key to select nodes'];
    //
    // svg.selectAll('.mainOperationInfo')
    //     .data(texts)
    //     .enter()
    //     .append('text')
    //     .attr("class",".mainOperationInfo")
    //     .attr('x', 0)
    //     .attr('y', function(d,i) { return 30 + i * 18; })
    //     .text(function(d) { return d; });

    node.on("contextmenu", function (node) {
        whichNodeClick = node;
        return contextmenu("mainRmenu");
    })
        .on("click", function (node) {
            myColorScheme.active.lastActiveName=node.group;

            reSelectPoint();
        })
        .on("dblclick", function (node) {
            myColorScheme.active.lastActiveName=node.group;
            nodeMessName = node['id'];
            var $ele=otherGraph_g.new('nodeDetail',{name:node['id'],galleryIndex:0});
            $ele.append('<button type="button" style="position: absolute;' +
                '    right: 20px;' +
                '    padding: 0;' +
                '    background-color: #dedecc;' +
                '    font-size: 12px;' +
                '    top: 5px;" onclick="nodeDetailCluster(event)" class="btn btn-default ">custom cluster</button>');
        })
    ;

    node.on("mouseover", function (d) {

            d3.selectAll(".matrixText_" + d.name.replace(/[\W]/g, '_')).classed("active",true);
            d3.select("#mainGraph").selectAll(".node circle").each(function (data, index) {
                if (myChart_main_data.relation[nodeMap[d.name]][nodeMap[data.name]] == 0 && d.name != data.name&& d.name.split(",")[0]!=data.name.split(",")[0] ) //加gray属性
                {
                    d3.select(this).style("opacity", 0.1);
                }
            });
            d3.select("#mainGraph").selectAll(".node text").each(function (data, index) {
                if (myChart_main_data.relation[nodeMap[d.name]][nodeMap[data.name]] == 0 && d.name != data.name && d.name.split(",")[0]!=data.name.split(",")[0]) //加gray属性
                {
                    d3.select(this).style("opacity", 0.1);
                }
            });
            d3.select("#mainGraph").selectAll(".link line").each(function (data, index) {
                if (!(data.source.name == d.name || data.target.name == d.name)) {
                    d3.select(this).style("opacity", 0);
                }
            });


            //d3.selectAll(".matrixText_"+d.name.replace(/[\W]/g,'_')).classed("active", true);
        }
    )
        .on("mouseout", function (d) {
            d3.selectAll(".matrixText_" + d.name.replace(/[\W]/g, '_')).classed("active",false);

            d3.select("#mainGraph").selectAll(".node circle")
                .style("opacity", 1);
            d3.select("#mainGraph").selectAll(".node text").style("opacity", 1);

            d3.select("#mainGraph").selectAll(".link line").style("opacity", function (d) {
                return opacityMap(d.value);
            })


            //d3.selectAll(".matrixText_"+d.name.replace(/[\W]/g,'_')).classed("active", false);
        });






    return graph;
};




