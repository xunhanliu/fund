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
                for (var i = 0; i < myChart_main_data.nodes.length; i++) {
                    if (typeof(lastGraphData[myChart_main_data.nodes[i].id]) != 'undefined') {
                        myChart_main_data.nodes[i].fixed = lastGraphData[myChart_main_data.nodes[i].id].fixed;
                        myChart_main_data.nodes[i].x = lastGraphData[myChart_main_data.nodes[i].id].x;
                        myChart_main_data.nodes[i].y = lastGraphData[myChart_main_data.nodes[i].id].y;
                        myChart_main_data.nodes[i].px = lastGraphData[myChart_main_data.nodes[i].id].px;
                        myChart_main_data.nodes[i].py = lastGraphData[myChart_main_data.nodes[i].id].py;
                    }
                }
                refreshMyChart_main(myChart_main_data);

            }
        });

    },
    updateItemPointPos: function (index) {
        d3.select("#graph_" + index).selectAll("circle").each(function (data) {
            $.extend(true, gallery.galleryData[index].lastGraphData[data.id] = {}, data);
            //缩放为原来的比例
            gallery.galleryData[index].lastGraphData[data.id].x=data.x*800/gallery.galleryItemWidth;
            gallery.galleryData[index].lastGraphData[data.id].y=data.y*800/gallery.galleryItemWidth;
            gallery.galleryData[index].lastGraphData[data.id].px=data.px*800/gallery.galleryItemWidth;
            gallery.galleryData[index].lastGraphData[data.id].py=data.py*800/gallery.galleryItemWidth;
        });
    },

    unify: function () {
        var index = $("input[name='gallerySel']:checked").val();
        if (!index) {
            showToast('warning', "您未在gallery中选择，位置将统一布局为主图布局!");
        }
        else {
            gallery.updateItemPointPos(index);
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
        // circle.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});//圆圈
        // text.attr("transform", function(d){ return "translate(" + (d.x) + "," + d.y + ")";});//顶点文字
        // edges_line.attr('d', function (d) {
        //     var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        //     return path;
        // });
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
        graph = data.myChart_main_data;
        var svg_width = gallery.galleryItemWidth,
            svg_height = gallery.galleryItemWidth - 18;
        var svg = d3.select("#graph_" + index)
            .attr("width", svg_width)
            .attr("height", svg_height);
        // var color = d3.scale.category20();
        var circleSizeScale_M = d3.scale.linear()
        //.domain([-1, 0, 1])
            .range([3, 15])
            .domain([1, Number(graph['dataNum'])]);
        ;
        var links = graph.links;
        var nodes = graph.nodes;
        //把上一幅图的点的位置更新到本图上
        //点位置范围的缩小。800到svg_width


        nodes.forEach(function (item, index) {
            if (data.lastGraphData[item.id]) {
                data.lastGraphData[item.id].fixed = true;
                item.fixed = true;
                item.x = data.lastGraphData[item.id].x * svg_width / 800;
                item.y = data.lastGraphData[item.id].y * svg_width / 800;
                item.px = data.lastGraphData[item.id].px * svg_width / 800;
                item.py = data.lastGraphData[item.id].py * svg_width / 800;
            }
        });

        var dataLinkLength = d3.scale.linear()
            .domain([0, 1])
            .range([100, 20]);
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
            .charge(-3000)//-3000   顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥，正值是相互吸引
            .on("tick", tick)//指时间间隔，隔一段时间刷新一次画面
            .start();//开始转换
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
                return d.width / 2
            })//线条粗细
        ;
        svg.selectAll('.edgepath')
            .on("click", function (link) {
                getScatterData([link['source']['id'], link['target']['id']], index);  //重写
            });
        edges_line.append("svg:title")
            .text(function (link) {
                return "source: " + link.source.name + ' -->target: ' + link.target.name + "\nralation: " + link.value + "\noverlap: " + link.overlap;//link.source ;link.target ;link.overlap ; link.value;
                //return "aaaa";
            });
        var drag = force.drag()
            .on("dragstart", dragstart);

        function dblclick(d) {
            d3.select(this).classed("fixed", d.fixed = false);
        }

        function dragstart(d) {
            d3.select(this).classed("fixed", d.fixed = true);
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
                return myColorScheme[myColorScheme.scheme].color(node.group);
            })
            .style('stroke', function (node) {
                if (node.isCutPoint == true || isInArray(selectPoint, node['id'].split(',')[0]) != -1) {
                    return "rgb(0,0,0)";
                }
                else {
                    return myColorScheme[myColorScheme.scheme].color(node.group);
                }
            })
            .style('stroke-width', 1)
            .attr("r", function (node) {
                return circleSizeScale_M(Number(node['symbolSize']));
            })//设置圆圈半径
            .on("mouseover", function (d) {
                    var graph=gallery.galleryData[index].myChart_main_data;
                    d3.select("#graph_" + index).selectAll("circle").each(function (d1, i) {
                        if (graph.relation[data.nodeMap[d.name]][data.nodeMap[d1.name]] == 0 && d.name != d1.name) //加gray属性
                        {
                            d3.select(this).style("fill", "rgba(9,9,9,0.1)");
                        }
                    });
                    d3.select("#graph_" + index).selectAll("text").each(function (d1, i) {
                        if (graph.relation[data.nodeMap[d.name]][data.nodeMap[d1.name]] == 0 && d.name != d1.name) //加gray属性
                        {
                            d3.select(this).style("fill", "rgba(9,9,9,0)");
                        }
                    });
                    d3.select("#graph_" + index).selectAll(".edgepath").each(function (d1, i) {
                        if (!(d1.source.name == d.name || d1.target.name == d.name)) {
                            d3.select(this).style("stroke", "rgba(9,9,9,0.1)");
                        }
                    });
                }
            )
            .on("mouseout", function (d) {
                d3.select("#graph_" + index).selectAll("circle")
                    .style("fill", function (node) {
                        return myColorScheme[myColorScheme.scheme].color(node.group);
                    });

                d3.select("#graph_" + index).selectAll("text").style("fill", "#555");

                d3.select("#graph_" + index).selectAll(".edgepath").style("stroke", function (d) {
                    return colorMap(d.value);
                })
            })
            .on("click", function (node) {
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

                setTimeout(getNodeDetailData(nodeMessName, index), 100);

            })
            .on("dblclick", dblclick)
            .call(drag);//将当前选中的元素传到drag函数中，使顶点可以被拖动

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
            .attr("dy", ".20em")
            .attr("text-anchor", "middle")//在圆圈中加上数据
            .style('fill', function (node) {
                return '#555';
            })
            .attr("transform", "scale(0.8)")
            .style("display", "inline-block")
            .attr('x', 0)
            .attr('y', -10)
            .text(function (d) {
                return d.name;
            });

        function tick() {
            circle.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });//圆圈
            text.attr("transform", function (d) {
                return "translate(" + (d.x) + "," + d.y + ")";
            });//顶点文字
            edges_line.attr('d', function (d) {
                var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                return path;
            });
        }


    },


//     svg.selectAll("circle").each(function(data){
//         lastGraphData[data.id]=data;
//     });
// }, 5000);


};

gallery.init();
//element:   indexNum: {每个graph需要的最小变量，和函数interface}