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
    getTabs1ActiveID();
    main_redraw(myChart_main_data);
}

function main_deepRedraw() {

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
            main_redraw(myChart_main_data);
            refrshParaChart(myChart_main_data);
        }
    });

}

//使用d3  V4版本   ，内部d3变量使用d3v4替换
var simulation;
function main_redraw(graph) {
    // if both d3v3 and d3v4 are loaded, we'll assume
    // that d3v4 is called d3v4, otherwise we'll assume
    // that d3v4 is the default (d3)

    circleSizeScale_M.domain([1, Number(graph['dataNum'])]);

    mainGraphPara.graphArea.x[0]=(svg_width-svg_width*mainGraphPara.maxGraphArea)/2;
    mainGraphPara.graphArea.x[1]=(svg_width-svg_width*mainGraphPara.maxGraphArea)/2+mainGraphPara.maxGraphArea*svg_width;
    mainGraphPara.graphArea.y[0]=(svg_height-svg_height*mainGraphPara.maxGraphArea)/2;
    mainGraphPara.graphArea.y[1]=(svg_height-svg_height*mainGraphPara.maxGraphArea)/2+mainGraphPara.maxGraphArea*svg_height;
   // 把上一幅图的点的位置更新到本图上
    for (var i = 0; i < graph.nodes.length - 1; i++) {
        if (typeof(lastGraphData[graph.nodes[i].id]) != 'undefined') {
            graph.nodes[i].fixed = lastGraphData[graph.nodes[i].id].fixed;
            graph.nodes[i].x = lastGraphData[graph.nodes[i].id].x;
            graph.nodes[i].y = lastGraphData[graph.nodes[i].id].y;
            graph.nodes[i].px = lastGraphData[graph.nodes[i].id].px;
            graph.nodes[i].py = lastGraphData[graph.nodes[i].id].py;
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

    var gDraw = gMain.append('g');
//zoom
    var zoom = d3v4.zoom()
        .on('zoom', zoomed)
    gMain.call(zoom).on('dblclick.zoom', null);
    function zoomed() {
        gDraw.attr('transform', d3v4.event.transform);
    }
//*zoom
//     var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

    // the brush needs to go before the nodes so that it doesn't
    // get called when the mouse is over a node
    var drawBorder=gDraw.append('rect')
        .attr('width', svg_width*mainGraphPara.maxGraphArea+mainGraphPara.maxPointSize)
        .attr('height', svg_height*mainGraphPara.maxGraphArea+mainGraphPara.maxPointSize)
        .attr("x",mainGraphPara.graphArea.x[0]-mainGraphPara.maxPointSize/2)
        .attr("y",mainGraphPara.graphArea.y[0]-mainGraphPara.maxPointSize/2)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('fill', 'white')
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
            getScatterData([link['source']['id'], link['target']['id']], 0);

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
        .attr("class", "node")
        .call(d3v4.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("class", function (data) {
            return "main_" + data.name.replace(/[\W]/g, '_');
        })
        .style("fill", function (node) {
            return myColorScheme[myColorScheme.scheme].color(node.group);
        })
        .attr("r", function (node) {
            return circleSizeScale_M(Number(node['symbolSize']));
        })//设置圆圈半径
        .style('stroke', function (node) {
            if (node.isCutPoint == true ) {  // || isInArray(selectPoint, node['id'].split(',')[0]) != -1
                return "#f00";
            }
            else{
                return "#fff";
            }
        });



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
        .force('collision',d3v4.forceCollide(mainGraphPara.maxPointSize+5) )
        .force("charge",d3v4.forceManyBody()
            .strength(-3000) //静电斥力
            .distanceMax(parentHeight/8)
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
        node.attr("transform", function (d) {

            if (d.x<=mainGraphPara.graphArea.x[0] )
            {
                d.x+= mainGraphPara.springback*svg_width;
            }
            else if(d.x>=mainGraphPara.graphArea.x[1]){
                d.x-= mainGraphPara.springback*svg_width;
            }
            if (d.y<=mainGraphPara.graphArea.y[0] )
            {
                d.y+= mainGraphPara.springback*svg_height;
            }
            else if(d.y>=mainGraphPara.graphArea.y[1]){
                d.y-= mainGraphPara.springback*svg_height;
            }
            return "translate(" + d.x + "," + d.y + ")";
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

    rect.on('click', () => {
        node.each(function(d) {
            d.selected = false;
            d.previouslySelected = false;
        });
        node.classed("selected", false);
    });

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
        d.fx = null;
        d.fy = null;
        node.filter(function(d) { return d.selected; })
            .each(function(d) { //d.fixed &= ~6;
                d.fx = null;
                d.fy = null;
            })
    }

    var texts = ['Use the scroll wheel to zoom',
        'Hold the shift key to select nodes'];

    svg.selectAll('.mainOperationInfo')
        .data(texts)
        .enter()
        .append('text')
        .attr("class",".mainOperationInfo")
        .attr('x', 0)
        .attr('y', function(d,i) { return 30 + i * 18; })
        .text(function(d) { return d; });

    node.on("contextmenu", function (node) {
        whichNodeClick = node;
        return contextmenu("mainRmenu");
    })
        .on("click", function (node) {
            myColorScheme.active.lastActiveName=node.group;
        })
        .on("dblclick", function (node) {
            myColorScheme.active.lastActiveName=node.group;
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
                '<script src="./js/nodeDetail.js"></script>';
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
    ;








    return graph;
};




