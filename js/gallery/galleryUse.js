// var groupID= [ "mainGraphGroup",'edgeScatter','nodeDetail','paraBoxplot','t-sne']

function g_scrollLeft(ev){
    ev.target.parentElement.lastElementChild.scrollLeft-=mainGraph_g.lastHeight;
}
function g_scrollRight(ev){
    ev.target.parentElement.lastElementChild.scrollLeft+=mainGraph_g.lastHeight;
}

var otherGraph_g={
    index:0,
    title:{'edgeScatter':'edge Scatter','nodeDetail':'node Detail','paraBoxplot':'para Boxplot','t-sne':'t-sne(data)',mdsScatter:'mds(dimension)'},
    //自定义函数注册。
    methodMap:{'edgeScatter':redraw_edgeScatter,'nodeDetail':redraw_nodeDetail,'paraBoxplot':redraw_paraBoxplot,'t-sne':redraw_tsne,'mdsScatter':redraw_mdsScatter},
    new:function(type,data,groupCtl=""){

        var ctlButton='<div class="btn-group-vertical full_width ">' +
            '                <button type="button" onclick="otherGraph_g.allDelete(event)" class="btn btn-default tip" alt="delete all"><i class="fa fa-trash-o"></i></button>\n' +
            ' </div>';
        if(groupCtl){
            ctlButton=groupCtl;
        }
        var title=otherGraph_g.title[type]
        if (title==undefined)
        {
            title=type;
        }
        var ele=gallery.new(type,title,ctlButton,{"data-index":otherGraph_g.index});  //第二个参数是title
        otherGraph_g.index+=1;
        var para={$selector:$(ele), data:data};
        otherGraph_g.methodMap[type](para); //调用自定义函数
        $(ele).append(
            '<button type="button"   class="close" onclick="otherGraph_g.delete(event)" style="z-index: 100;position: absolute;\n' +
            '  right: 5px;\n' +
            '  top: 0px;">×</button>'
        );
        return $(ele);
    },
    delete:function(ev){
        gallery.delete(ev.target);
    },
    allDelete:function(ev){
        gallery.delete(ev.target);
    },
    resize:function(){
        for(var id in otherGraph_g.methodMap){
            var $group=$("#"+id)
            if($group.length){
                var $item=$group.find(".gallery_item");
                for (var i=0 ;i<$item.length;i++){
                    resize_echarts({$selector:$($item[i])});
                }
            }
        }
    },
};

var mainGraph_g = {
    data: {},
    lastHeight:gallery.item.height,
    allDelete: function () {
        showToast('info', "Please do not operation!");
        $.ajax({
            url: mylocalURL + "delAllGalleryItem", type: "POST",
            data: {}, success: function (data) {
                mainGraph_g.data = [];
                showToast('success', "galleryItem del success");
                gallery.delete($("#mainGraphGroup")[0]);
            }
        });
    },
    resize:function () {
//缩放svg 点的缩放
        if(mainGraph_g.lastHeight==0){
            mainGraph_g.lastHeight= gallery.item.height;
        }
        var svgWidth=$(".gallery_item").height();
        var svgHeight=svgWidth-18;
        var maxHW=svg_height>svg_width?svg_height :svg_width;
        for (i in mainGraph_g.data){
            d3v4.select("#graph_"+i).attr('width',svgWidth).attr('height',svgHeight)
                .selectAll(".node").each(function (data) {
                data.x = data.x * svgWidth / mainGraph_g.lastHeight;
                data.y = data.y * svgWidth / mainGraph_g.lastHeight;
                data.fx = data.fx * svgWidth / mainGraph_g.lastHeight;
                data.fy = data.fy * svgWidth / mainGraph_g.lastHeight;
            });
            $($("#graph_"+i+" .g-main")[0].firstElementChild).attr('width',svgWidth).attr('height',svgHeight) //充满
            $($("#graph_"+i+" .g-zoom")[0].firstElementChild).attr('width', svgWidth*mainGraphPara.maxGraphArea+15) //maxPointSize=15
                .attr('height', svgHeight*mainGraphPara.maxGraphArea+15)
        }
        mainGraph_g.lastHeight=svgWidth;
    },



    screenShot: function () { //保存
        //new 指令到后台，并得到一个index
        showToast('info', "Please do not operation!");
        getMainPointPos();  //mainGraph 里面的函数，保存点的位置
        $.ajax({
            url: mylocalURL + "newGalleryItem", type: "POST",
            data: {}, success: function (data) {
                showToast('success', "screenShot success! serial number:" + data.newIndex);
                galleryInterface.showToGallery(data.newIndex);
                //相关数据保存在mainData["newIndex"]里
                //根据data绘制graph
                var graph = mainGraph_g.data[data.newIndex];
                $.extend(true, graph.myChart_main_data.links = [], graph.linkListBuf);
                mainGraph_g.newGraph(data.newIndex, graph);
            }
        });


    },
    recover: function () {
        showToast('info', "Please do not operation!");
        var index = $("input[name='gallerySel']:checked").val();
        if (!index) {
            showToast('warning', "Please sel an item in gallery!");
            return;
        }
        $.ajax({
            url: mylocalURL + "recoverGalleryItem", type: "POST",
            data: {
                "galleryIndex": index,
            }, success: function (data) {
                var galleryItemWidth=gallery.item.height;
                if (!galleryInterface.galleryToShow(index)) {
                    return;
                }
                showToast('success', "galleryItem recover success, serial number:" + data.newIndex);
                //根据data绘制graph
                //更新主图
                var maxHW=svg_height>svg_width?svg_height :svg_width;

                for (var i = 0; i < myChart_main_data.nodes.length; i++) {
                    if (typeof(lastGraphData[myChart_main_data.nodes[i].id]) != 'undefined') {
                        myChart_main_data.nodes[i].x = lastGraphData[myChart_main_data.nodes[i].id].x;
                        myChart_main_data.nodes[i].y = lastGraphData[myChart_main_data.nodes[i].id].y;
                        myChart_main_data.nodes[i].fx = null;
                        myChart_main_data.nodes[i].fy = null;
                    }
                }

                main_redraw(myChart_main_data);

            }
        });

    },
    // updateItemPointPos: function (index) {  //先保存目标位置
    //     d3.select("#graph_" + index).selectAll("circle").each(function (data) {
    //         $.extend(true, mainGraph_g.data[index].lastGraphData[data.id] = {}, data);
    //     });
    //
    // },

    unify: function () {
        var index = $("input[name='gallerySel']:checked").val();
        var graphDatapos={}
        if (!index) {
            showToast('warning', "you do not sel an item in gallery,the position will be unified according to the main graph layout!");
        }
        else {
            //mainGraph_g.updateItemPointPos(index);
            mainGraph_g.data[index].transform=d3.select("#graph_" + index).select(".g-zoom").attr("transform");
            d3.select("#graph_" + index).selectAll("circle").each(function (data) {
                        $.extend(true,graphDatapos[data.id] = {}, data);
                    });

        }
        getMainPointPos();
        for (var i in mainGraph_g.data) {
            var maxHW= svg_width>svg_height? svg_width: svg_height;
            var data=mainGraph_g.data[i];
            if (i == index) {
                continue;
            }
            if (!index) {  //按主图布局
                //$.extend(true, mainGraph_g.data[i].lastGraphData = [], lastGraphData);
                d3v4.select("#graph_"+i)
                    .selectAll(".node").each(function (item) {
                    if (lastGraphData[item.id]) {
                        item.x = lastGraphData[item.id].x * mainGraph_g.lastHeight / maxHW;
                        item.y = lastGraphData[item.id].y * mainGraph_g.lastHeight  / maxHW;
                        item.fx = item.x;
                        item.fy = item.y;
                    }
                });
                d3v4.select("#graph_" + i).select(".g-zoom").attr("transform",transform) ;
            }
            else {
                //$.extend(true, mainGraph_g.data[i].lastGraphData = [], mainGraph_g.data[index].lastGraphData);
                d3v4.select("#graph_"+i)
                    .selectAll(".node").each(function (item) {
                    if (graphDatapos[item.id]) {
                        item.x = graphDatapos[item.id].x;
                        item.y = graphDatapos[item.id].y;
                        item.fx = item.x;
                        item.fy = item.y;
                    }
                });
                d3v4.select("#graph_" + i).select(".g-zoom").attr("transform",mainGraph_g.data[index].transform) ;
            }
            //mainGraph_g.drawGraph(i, mainGraph_g.data[i]);

            d3v4.select("#graph_" + i).dispatch('refresh');

        }

    },
    delete: function (ev) {
        showToast('info', "Please do not operation!");
        $.ajax({
            url: mylocalURL + "delGalleryItem", type: "POST",
            data: {
                "galleryIndex":  ev.target.parentNode.dataset["index"],
            }, success: function (data) {
                delete mainGraph_g.data[ ev.target.parentNode.dataset["index"]];
                showToast('success', "galleryItem del success");
                gallery.delete(ev.target);
            }
        });



    },
    showGalleryItemMess: function (ev) {
        var index = $(ev.target.parentNode).data("index");
        //relationThreshold=0;
        // var overlapThreshold=0;
        var str = "";
        str = "relationThreshold: " + mainGraph_g.data[index].relationThreshold +
            "</br>overlapThreshold:  " + mainGraph_g.data[index].overlapThreshold
        ;
        layui.use('form', function () {
            var layer = layui.layer;
            layer.open({
                type: 1,
                title: index + "的分布",
                maxmin: true, //开启最大化最小化按钮
                shadeClose: true,
                area: ['200px', '200px'],
                content: str, //iframe的url，no代表不显示滚动条
            });
        });
    },
    newGraph: function (index, data) {
        var ctlButton='<div class="btn-group-vertical full_width "><button type="button" onclick="mainGraph_g.recover()" class="btn btn-default tip main-shot" alt="recover"><i class="fa fa-upload"></i></button>\n' +
            '                <button type="button" onclick="mainGraph_g.unify()" class="btn btn-default tip main-shot" alt="unify" ><i class="fa fa-th"></i></button>\n' +
            '                <button type="button" onclick="mainGraph_g.allDelete()" class="btn btn-default tip" alt="delete all"><i class="fa fa-trash-o"></i></button>\n' +
            '                <button type="button" class="btn btn-default tip" onclick="galleryInfo()" alt="instruction" ><i class="fa fa-info"></i></button></div>';
        var ele=gallery.new("mainGraphGroup","main graph",ctlButton);
        $(ele).append('<div  style="width: 100%;height: 100%"   id="div_' + index + '"  ' +
            'data-index=' + index +
            '><span style="text-align: center;display:block;" onclick="mainGraph_g.showGalleryItemMess(event)">' + index + '</span>' +
            '<input style="z-index: 100" class="c_galleryChk" type="radio" name="gallerySel" value="' + index +
            '">' +
            '<button type="button"   class="close" onclick="mainGraph_g.delete(event)" style="z-index: 100;position: absolute;\n' +
            '  right: 5px;\n' +
            '  top: 0px;">×</button>' +
            '<svg id="graph_' + index + '"></svg>' +
            '</div>');
        window.setTimeout(function () {
            mainGraph_g.drawGraph(index, data,ele);
        }, 100);
    },
    drawGraph: function (index, data,parent) {
        $("#graph_" + index).children().remove();
        var graph = data.myChart_main_data;
        var svgWidth = $(parent).width(),
            svgHeight = $(parent).height() - 18;
        var svg = d3v4.select("#graph_" + index)
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .on("refresh",ticked)
        ;
        // var color = d3.scale.category20();
        var maxPointSize=15;
        var circleSizeScale_M = d3.scale.linear()
        //.domain([-1, 0, 1])
            .range([3, maxPointSize])
            .domain([1, Number(graph['dataNum'])]);
        ;

        //把上一幅图的点的位置更新到本图上
        //点位置范围的缩小。svg_width到svgWidth

        var maxHW= svg_width>svg_height? svg_width: svg_height;
        graph.nodes.forEach(function (item, index) {
            if (data.lastGraphData[item.id]) {
                item.x = data.lastGraphData[item.id].x * svgWidth / maxHW;
                item.y = data.lastGraphData[item.id].y * svgWidth / maxHW;
                item.fx = item.x;
                item.fy = item.y;
            }
        });


        var dataLinkLength = d3.scale.linear()
            .domain([0, 1])
            .range([100, 20]);

        svg.selectAll('g').remove();
        svg.selectAll('text').remove();
        var gMain = svg.append('g')
            .classed('g-main', true);

        var rect = gMain.append('rect')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .style('fill', 'white')

        var gDraw = gMain.append('g').classed('g-zoom', true)
            .attr("transform", data.transform);
//zoom
        var zoom = d3v4.zoom().scaleExtent([0.3, 3])
            .on('zoom', zoomed).on("end",zoomEnd);
        gMain.call(zoom).on('dblclick.zoom', null);
        function zoomEnd(){
            mainGraph_g.data[index].transform=d3.select("#graph_" + index).select(".g-zoom").attr("transform");
        }
        function zoomed() {
            gDraw.attr('transform', d3v4.event.transform);
        }
        var drawBorder=gDraw.append('rect')
            //rect比中心点的布局范围稍微大一些
                .attr('width', svgWidth*mainGraphPara.maxGraphArea+maxPointSize)
                .attr('height', svgHeight*mainGraphPara.maxGraphArea+maxPointSize)
                .attr("x",(svgWidth-svgWidth*mainGraphPara.maxGraphArea)/2-maxPointSize/2)
                .attr("y",(svgHeight-svgHeight*mainGraphPara.maxGraphArea)/2-maxPointSize/2)
                .style('stroke', 'black')
                .style('stroke-width', 1)
                .style('fill', 'white')
                .attr('class', 'back')
        ;


        var link = gDraw.append("g")
            .attr("class", "link")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return lineWidthMap(d.overlap)/1.5;; })
            .attr("stroke-dasharray", function (d) {
                if (d.isCutEdge == 0)
                    return "5,0";
                else return "5,5";
            })
            .style("stroke", function (d) {
                return colorMapCooperateOpacity(d.value);
            })
            .attr("opacity", function (d) {
                return opacityMap(d.value,d.overlap);
            })
            .on("click", function (link) {
                getScatterData([link['source']['id'], link['target']['id']], index);

            })
        ;




        link.append("svg:title")
            .text(function (link) {
                return "source: " + link.source.name + ' -->target: ' + link.target.name + "\nralation: " + link.value + "\noverlap: " + link.overlap;//link.source ;link.target ;link.overlap ; link.value;
                //return "aaaa";
            });


        var node = gDraw.append("g")
            .attr("class", "gnode")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", function(d){
                return "node "+"main_" + d.name.split(",")[0].replace(/[\W]/g, '_');
            })
            .call(d3v4.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .style("fill", function (node) {
                return myColorScheme[myColorScheme.scheme].color(node.group,node.name.split(',')[0]);
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


        node.on("mouseover", function (d) {
                var graph = mainGraph_g.data[index].myChart_main_data;
                var nodeMap=mainGraph_g.data[index]['nodeMap'];
                d3.select("#graph_" + index).selectAll(".node circle").each(function (data, index) {
                    if (graph.relation[nodeMap[d.name]][nodeMap[data.name]] == 0 && d.name != data.name && d.name.split(",")[0] != data.name.split(",")[0]) //加gray属性
                    {
                        d3.select(this).style("opacity", 0.1);
                    }
                });
                d3.select("#graph_" + index).selectAll(".node text").each(function (data, index) {
                    if (graph.relation[nodeMap[d.name]][nodeMap[data.name]] == 0 && d.name != data.name && d.name.split(",")[0] != data.name.split(",")[0]) //加gray属性
                    {
                        d3.select(this).style("opacity", 0.1);
                    }
                });
                d3.select("#graph_" + index).selectAll(".link line").each(function (data, index) {
                    if (!(data.source.name == d.name || data.target.name == d.name)) {
                        d3.select(this).style("opacity", 0);
                    }
                });

            }
        )
            .on("mouseout", function (d) {
                d3.select("#graph_" + index).selectAll(".node circle")
                    .style("opacity", 1);
                d3.select("#graph_" + index).selectAll(".node text").style("opacity", 1);

                d3.select("#graph_" + index).selectAll(".link line").style("opacity", function (d) {
                    return opacityMap(d.value,d.overlap);
                });
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
                    '</div>'
                ;
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
                setTimeout(
                    function(){
                        if(typeof(nodeDetailJS)=="undefined"){   //判断文件是否已经加载。
                            $('body').append('<script src="./js/nodeDetail.js"></script>')};
                        setTimeout(getNodeDetailData(nodeMessName, index),100);
                    },
                    500);

            });

        var simulation = d3v4.forceSimulation()
            .force("link", d3v4.forceLink()
                    .id(function(d) { return d.id; })
                    .distance(function(d) {
                        return dataLinkLength(bzMap("distance",Math.abs(d.value)));

                    })
                // .iterations(function(d){ return Math.ceil(Math.abs(d.value)*10+1)})
            )
            .velocityDecay(0.5)  //默认0.4
            .force("center", null)  //写center力会出bug
            .force("x", null)
            .force("y", null)
        ;
        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);
        simulation.force('collision',d3v4.forceCollide(maxPointSize+5) )  //使能碰撞力，使点之间无重叠
            .force("charge",d3v4.forceManyBody()
                .strength(-100) //静电斥力
                .distanceMax(svgHeight/8)
                .distanceMin(maxPointSize+5)
            );
        function ticked() {
            node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")";});
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        }

        function dragstarted(d) {
        }

        function dragged(d) {
            d.x = d3v4.event.x;
            d.y = d3v4.event.y;
            d.fx=d.x;
            d.fy=d.y;
            node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")";});
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        }
        function dragended(d) {
            d.fx = d.x;
            d.fy = d.y;
            // var lastGraphData=mainGraph_g.data[index].lastGraphData;

            // //注意要缩放回去
            // d3.select("#graph_" + index+" .gnode").selectAll(".node").each(function (data) {
            //     $.extend(true, lastGraphData[data.id] = {}, data);
            // });

        }
    },


};