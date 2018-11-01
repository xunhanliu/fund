function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    // 如果最后的节点是目标元素，则直接添加
//        if(parent.lastChild = targetElement){
//            parent.appendChild(newElement)
//        }else{
//            //如果不是，则插入在目标元素的下一个兄弟节点 的前面
//            parent.insertBefore(newElement,targetElement.nextSibling)
//        }
    parent.insertBefore(newElement, targetElement.nextSibling);
}

var galleryDrag = {
    allowDrop: function (ev) {
        ev.preventDefault();
    },

    dragenter: function (ev) {
        var node = ev.target;
        while (!node["id"] || node["id"].split("_")[0] != 'div') {
            node = node.parentNode;
        }

        if ($(node.nextSibling).attr('id') == "i_vacancy") {

        }
        else { //存在
            if (!document.getElementById("i_vacancy")) {
                $('<div id="i_vacancy" style="background-color: #cccccc;display:inline-block;"><p style="visibility:hidden">88</p></div>').insertAfter('#' + node.id);
            }
            else {
                $("#i_vacancy").remove();
            }
        }

    },

    dragend: function (ev) //用于被推动元素的删除
    {
        // $(ev.currentTarget).remove();
    },

    drag: function (ev) {
        ev.dataTransfer.setData("Text", ev.target.id);
    },


    drop: function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("Text");
        var node = ev.target;
        while (node.id.split("_")[0] != 'div') {
            node = node.parentNode;
        }
        insertAfter(document.getElementById(data), node);
        //ev.target.appendChild(document.getElementById(data));
        // $(ev.target).after($("#"+data).prop("outerHTML")) ;
        if (document.getElementById("i_vacancy")) {
            //$("#i_vacancy").remove();
            $("#i_vacancy").width(0);
            setTimeout(function () {
                $("#i_vacancy").remove();
            }, 1000);
        }
    }
};

var gallery = {
    galleryData: {},
    allDelete: function () {
        showToast('info', "请不要继续操作");
        $.ajax({
            url: mylocalURL + "delAllGalleryItem", type: "POST",
            data: {}, success: function (data) {
                gallery.galleryData = [];
                showToast('success', "galleryItem删除成功");
            }
        });
        if (document.getElementsByClassName("c_mybox")) {
            $(".c_mybox").remove();
        }
        gallery.galleryItemNum = 0;
        gallery.changeGalleryLength();

    },
    screenShot: function () { //保存
        //new 指令到后台，并得到一个index
        showToast('info', "请不要继续操作");
        getMainPointPos();
        // d3.select("#mainGraph").selectAll("circle").each(function(data){
        //     lastGraphData[data.id]=data;
        // });
        $.ajax({
            url: mylocalURL + "newGalleryItem", type: "POST",
            data: {}, success: function (data) {
                showToast('success', "galleryItem加入成功！编号为：" + data.newIndex);
                gallery.galleryItemNum += 1;
                gallery.changeGalleryLength();
                galleryInterface.showToGallery(data.newIndex);
                //相关数据保存在galleryData["newIndex"]里
                //根据data绘制graph
                var graph = gallery.galleryData[data.newIndex];
                $.extend(true, graph.myChart_main_data.links = [], graph.linkListBuf);
                gallery.newGraph(data.newIndex, graph);
            }
        });


    },
    recover: function () {
        showToast('info', "请不要继续操作");
        var index = $("input[name='gallerySel']:checked").val();
        if (!index) {
            showToast('warning', "请在gallery中选择一个Item!");
            return;
        }
        $.ajax({
            url: mylocalURL + "recoverGalleryItem", type: "POST",
            data: {
                "galleryIndex": index,
            }, success: function (data) {
                if (!galleryInterface.galleryToShow(index)) {
                    return;
                }
                showToast('success', "galleryItem恢复成功！编号为：" + data.newIndex);
                //根据data绘制graph
                //更新主图
                var maxHW=svg_height>svg_width?svg_height :svg_width;
                if(lastGraphData["noNeedZoom"])//子图更新过了，需要，进行缩放
                {
                    for (var i = 0; i < myChart_main_data.nodes.length; i++) {
                        if (typeof(lastGraphData[myChart_main_data.nodes[i].id]) != 'undefined') {
                            myChart_main_data.nodes[i].x = lastGraphData[myChart_main_data.nodes[i].id].x*maxHW/gallery.galleryItemWidth;
                            myChart_main_data.nodes[i].y = lastGraphData[myChart_main_data.nodes[i].id].y*maxHW/gallery.galleryItemWidth;
                            myChart_main_data.nodes[i].fx = null;
                            myChart_main_data.nodes[i].fy = null;
                        }
                    }
                }
                else{
                    for (var i = 0; i < myChart_main_data.nodes.length; i++) {
                        if (typeof(lastGraphData[myChart_main_data.nodes[i].id]) != 'undefined') {
                            myChart_main_data.nodes[i].x = lastGraphData[myChart_main_data.nodes[i].id].x;
                            myChart_main_data.nodes[i].y = lastGraphData[myChart_main_data.nodes[i].id].y;
                            myChart_main_data.nodes[i].fx = null;
                            myChart_main_data.nodes[i].fy = null;
                        }
                    }
                }
                main_redraw(myChart_main_data);

            }
        });

    },
    updateItemPointPos: function (index) {  //先保存目标位置
        d3.select("#graph_" + index).selectAll("circle").each(function (data) {
            $.extend(true, gallery.galleryData[index].lastGraphData[data.id] = {}, data);
        });
        gallery.galleryData[index].lastGraphData["noNeedZoom"]=true;
    },

    unify: function () {
        var index = $("input[name='gallerySel']:checked").val();
        if (!index) {
            showToast('warning', "您未在gallery中选择，位置将统一布局为主图布局!");
        }
        else {
            gallery.updateItemPointPos(index);
            gallery.galleryData[index].transform=d3.select("#graph_" + index).select(".g-zoom").attr("transform");
        }
        for (var i in gallery.galleryData) {
            if (i == index) {
                continue;
            }
            if (!index) {  //按主图布局
                getMainPointPos();
                $.extend(true, gallery.galleryData[i].lastGraphData = [], lastGraphData);
            }
            else {
                $.extend(true, gallery.galleryData[i].lastGraphData = [], gallery.galleryData[index].lastGraphData);
                gallery.galleryData[i].transform=gallery.galleryData[index].transform;
            }
            gallery.drawGraph(i, gallery.galleryData[i]);
        }

    },
    delete: function (ev) {
        showToast('info', "请不要继续操作");
        $.ajax({
            url: mylocalURL + "delGalleryItem", type: "POST",
            data: {
                "galleryIndex": $("#" + $(ev.target.parentNode).attr("id")).data("index"),
            }, success: function (data) {
                delete gallery.galleryData[$("#" + $(ev.target.parentNode).attr("id")).data("index")];
                showToast('success', "galleryItem删除成功");
            }
        });
        $("#" + $(ev.target.parentNode).attr("id")).css("visibility", "hidden");
        $("#" + $(ev.target.parentNode).attr("id")).width(0);
        window.setTimeout(function () {
            $("#" + $(ev.target.parentNode).attr("id")).remove();
            gallery.galleryItemNum -= 1;
            gallery.galleryItemNum < 0 ? 0 : gallery.galleryItemNum;
            gallery.changeGalleryLength();
        }, 550)

    },


    zoomOut: function () {//height  ++20  到800px
        if ((gallery.galleryItemWidth + 20) > 600) {
            return;
        }
        gallery.galleryItemWidthLast = gallery.galleryItemWidth;
        gallery.galleryItemWidth += 20;
        gallery.changeGalleryLength();

    },
    zoomIn: function () { //--20 到200px
        if ((gallery.galleryItemWidth - 20) < 200) {
            return;
        }
        gallery.galleryItemWidthLast = gallery.galleryItemWidth;
        gallery.galleryItemWidth -= 20;
        gallery.changeGalleryLength();
    },

//计算gallery长度
    galleryItemWidth: 200,
    galleryItemWidthLast: 200,
    galleryItemNum: 0,
    changeGalleryLength: function () {
        if (gallery.galleryItemWidth * (gallery.galleryItemNum + 1.2) < document.body.clientWidth)
            $("#i_gallery").width(document.body.clientWidth);
        else
            $("#i_gallery").width((gallery.galleryItemWidth ) * (gallery.galleryItemNum + 1.2));
        $("#i_gallery20").height(gallery.galleryItemWidth + 20);
        $("#i_gallery").height(gallery.galleryItemWidth + 2);

        $(".c_mybox").height(gallery.galleryItemWidth);
        $(".c_mybox").width(gallery.galleryItemWidth);
        $("#i_vacancy").height(gallery.galleryItemWidth);
        $("#i_vacancy").width(gallery.galleryItemWidth);
        gallery.resizeGalleryItem();


    },
    resizeGalleryItem() {
        for (var i in gallery.galleryData) {
            if (i == 0) {
                continue;
            }
            gallery.drawGraph(i, gallery.galleryData[i]);

        }
    },
    init: function () {
        $("#i_gallery").width(1000);
        gallery.galleryItemWidthLast = gallery.galleryItemWidth;
        // for (var i = 0; i < 10; i++) {
        //     $("#i_gallery").append('<div  id="div' + i + '" ondrop="galleryDrag.drop(event)" ondragover="galleryDrag.allowDrop(event)" ondragenter="galleryDrag.dragenter(event)" ' +
        //         ' draggable="true"  ondragend="galleryDrag.dragend(event)" ondragstart="galleryDrag.drag(event)"  class="c_mybox" style="display:inline-block;" ' +
        //         'data-index='+i+
        //         '><span style="text-align: center;display:block;">' + i + '</span>' +
        //         '' +
        //         '<input class="c_galleryChk" type="radio" name="gallerySel" value="' +i+
        //         '">' +
        //         '<button type="button" class="close" onclick="gallery.delete(event)" style="position: absolute;\n' +
        //         '  right: 5px;\n' +
        //         '  top: 0px;">×</button>' +
        //         '</div>');
        // }
    },

    showGalleryItemMess: function (ev) {
        var index = $(ev.target.parentNode).data("index");
        //relationThreshold=0;
        // var overlapThreshold=0;
        var str = "";
        str = "relationThreshold: " + gallery.galleryData[index].relationThreshold +
            "</br>overlapThreshold:  " + gallery.galleryData[index].overlapThreshold
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
//    $(":checkbox[name=mul]:checked").each(function () {
//        answer += $(this).val() + ",";   //input 一般是相同的名字
//    });
    newGraph: function (index, data) {
        $("#i_gallery").append('<div  id="div_' + index + '" ondrop="galleryDrag.drop(event)" ondragover="galleryDrag.allowDrop(event)" ondragenter="galleryDrag.dragenter(event)" ' +
            ' draggable="true"  ondragend="galleryDrag.dragend(event)" ondragstart="galleryDrag.drag(event)"  class="c_mybox" style="display:inline-block;' +
            'height:' + gallery.galleryItemWidth +
            'px;width: ' + +gallery.galleryItemWidth +
            'px"' +
            'data-index=' + index +
            '><span style="text-align: center;display:block;" onclick="gallery.showGalleryItemMess(event)">' + index + '</span>' +
            '<input style="z-index: 100" class="c_galleryChk" type="radio" name="gallerySel" value="' + index +
            '">' +
            '<button type="button"   class="close" onclick="gallery.delete(event)" style="z-index: 100;position: absolute;\n' +
            '  right: 5px;\n' +
            '  top: 0px;">×</button>' +
            '<svg id="graph_' + index + '"></svg>' +
            '</div>');
        window.setTimeout(function () {
            gallery.drawGraph(index, data);
        }, 100);


    },
    drawGraph: function (index, data) {
        $("#graph_" + index).children().remove();
        var graph = data.myChart_main_data;
        var svgWidth = gallery.galleryItemWidth,
            svgHeight = gallery.galleryItemWidth - 18;
        var svg = d3v4.select("#graph_" + index)
            .attr("width", svgWidth)
            .attr("height", svgHeight);
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
        if(data.lastGraphData["noNeedZoom"])
        {
            graph.nodes.forEach(function (item, index) {
                if (data.lastGraphData[item.id]) {
                    item.x = data.lastGraphData[item.id].x*gallery.galleryItemWidth/gallery.galleryItemWidthLast;
                    item.y = data.lastGraphData[item.id].y*gallery.galleryItemWidth/gallery.galleryItemWidthLast;
                    item.fx = item.x;
                    item.fy = item.y;
                    data.lastGraphData[item.id].x=item.x;
                    data.lastGraphData[item.id].y=item.y;
                }
            });
        }
        else{
            graph.nodes.forEach(function (item, index) {
                if (data.lastGraphData[item.id]) {
                    item.x = data.lastGraphData[item.id].x * svgWidth / maxHW;
                    item.y = data.lastGraphData[item.id].y * svgWidth / maxHW;
                    item.fx = item.x;
                    item.fy = item.y;
                }
            });
        }

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
            gallery.galleryData[index].transform=d3.select("#graph_" + index).select(".g-zoom").attr("transform");
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
                return opacityMap(d.value);
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


        node.on("mouseover", function (d) {
                var graph = gallery.galleryData[index].myChart_main_data;

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
                    return opacityMap(d.value);
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
            d.fx = d3v4.event.x;
            d.fy = d3v4.event.y;
        }
        function dragended(d) {
            d.fx = d.x;
            d.fy = d.y;
            var lastGraphData=gallery.galleryData[index].lastGraphData;
            d3.select("#graph_" + index+" .gnode").selectAll(".node").each(function (data) {
                $.extend(true, lastGraphData[data.id] = {}, data);
            });
            lastGraphData["noNeedZoom"]=true;
        }
    },


//     svg.selectAll("circle").each(function(data){
//         lastGraphData[data.id]=data;
//     });
// }, 5000);


};

gallery.init();
//element:   indexNum: {每个graph需要的最小变量，和函数interface}