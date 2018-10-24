/**
 * Created by Administrator on 2018/4/25.
 */
// <!DOCTYPE html>
// <html class="ocks-org do-not-copy">
//     <meta charset="utf-8">
//     <title>Les Misérables Co-occurrence</title>
// <style>
//
// @import url(./style.css);
//
// .background {
//     fill: #eee;
// }
//
//
//
// </style>
// <script src="//d3js.org/d3.v2.min.js" charset="utf-8"></script>
//
//     <h1><i>Les Misérables</i> Co-occurrence</h1>
//
// <aside style="margin-top:80px;">
//     <p>Order: <select id="order">
//     <option value="name">by Name</option>
// <option value="count">by Frequency</option>
// <option value="group">by Cluster</option>
// </select>
// </aside>

// var svg_width=$('#mainGraph_controls').width(),
//     svg_height=$('#mainGraph_controls').height();
getTabs2ActiveID();
var showMatrix={};
var margin_orderRelation = {top: 80, right: 5, bottom: 5, left: 80};
var  width_orderRelation=height_orderRelation = Math.min( Math.floor( $(tabs2ActiveID).width()*0.9)- margin_orderRelation.left - margin_orderRelation.right,
     Math.floor($(tabs2ActiveID).height())-margin_orderRelation.top - margin_orderRelation.bottom);

var x_orderRelation = d3.scale.ordinal().rangeBands([0, width_orderRelation]),
    y_orderRelation = d3.scale.ordinal().rangeBands([0, width_orderRelation]),
    z_orderRelation = d3.scale.linear().domain([0, 4]).clamp(true),//透明度scale
    c_orderRelation = d3.scale.category10().domain(d3.range(10));//  颜色  按group映射

var svg_orderRelation = d3.select("#orderRelationMatrix")
    .attr("width", width_orderRelation + margin_orderRelation.left + margin_orderRelation.right)
    .attr("height", height_orderRelation + margin_orderRelation.top + margin_orderRelation.bottom)
    .style("margin_orderRelation-left", -margin_orderRelation.left + "px")
    .append("g")
    .attr("transform", "translate(" + margin_orderRelation.left + "," + margin_orderRelation.top + ")");
var xOrder;
var yOrder;
var orders;
var lastEvent={x:0,y:0};
var dragElement_M = d3.behavior.drag()
    .origin(function() {
        var t = d3.select(this);
        return {
            x: t.attr("cx"),
            y: t.attr("cy")
        };
    })
    .on("dragstart", function(d) {//传入的是Matrix参数
        //var m=d3.mouse(svg_orderRelation)[0];
        lastEvent.x=0;
        lastEvent.y=0;
    })
    .on("dragend", function(d) {
        var dx= Math.round((lastEvent.x)/x_orderRelation.rangeBand());
        var dy = Math.round((lastEvent.y)/x_orderRelation.rangeBand());
        if (Math.abs(dx)>=1 || Math.abs(dy)>=1)
        {
            reOrder(xOrder, d.x, dx);
            reOrder(yOrder, d.y, dy);
            //跟新
             orderImmediately(xOrder,yOrder);
        }
         })
    .on("drag", function(d) {//传入的是Matrix参数
       // var m=d3.mouse(svg_orderRelation)[0];

        lastEvent.x=d3.event.x;
        lastEvent.y=d3.event.y;
        // d3.select(this)
        //     .attr("cx", function() {
        //         return d.cx = d3.event.x
        //     })
        //     .attr("cy", d.cy = d3.event.y)
        var a=0;
    });
function reOrder(orderList,order_num,order_dx){
    for (var i in orderList){
        if(order_num==orderList[i])
            break;
    }
    i=parseInt(i);
	if(order_dx>orderList.length-1) order_dx=orderList.length-1;
	if(order_dx<(-orderList.length+1)) order_dx=-orderList.length+1;
    if((i+order_dx)>orderList.length-1 )
    {
        order_dx=orderList.length-1-i;
    }
    if((i+order_dx)<0 )
    {
        order_dx=0-i;
    }
    if(order_dx>0){
        var temp=orderList[i];
		for (var j =1;j<= order_dx;j++){
            orderList[i+j-1]=orderList[i+j];
        }
        orderList[i+j-1]=temp;
    }
    else if(order_dx<0){
        var temp=orderList[i];
        for (var j =-1;j>= order_dx;j--){
            orderList[i+j+1]=orderList[i+j];
        }
        orderList[i+j+1]=temp;
    }
	
}
function orderRelatMatrix_size_update(){
    getTabs1ActiveID();
    width_orderRelation=height_orderRelation = Math.min( Math.floor( $(tabs2ActiveID).width()*0.9)- margin_orderRelation.left - margin_orderRelation.right,
        Math.floor($(tabs2ActiveID).height())-margin_orderRelation.top - margin_orderRelation.bottom);

    x_orderRelation.rangeBands([0, width_orderRelation]);
    y_orderRelation.rangeBands([0, width_orderRelation]);

    svg_orderRelation.attr("width", width_orderRelation + margin_orderRelation.left + margin_orderRelation.right)
            .attr("height", height_orderRelation + margin_orderRelation.top + margin_orderRelation.bottom);
    getorderRelationMatrixSuccess(orderRelationMatrixData);
}
var orderRelationMatrixData={};
function getorderRelationMatrixSuccess(data){
    orderRelationMatrixData=data;
    showMatrix= orderRelationMatrixData[app_orderRelation.config.whichMatrix];

    var matrix = [],
        nodes = data.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0}; });
    });

    // Convert links to matrix; count character occurrences.
    // data.links.forEach(function(link) {
    //     matrix[link.source][link.target].z += link.value;
    //     matrix[link.target][link.source].z += link.value;
    //     matrix[link.source][link.source].z += link.value;
    //     matrix[link.target][link.target].z += link.value;
    //     nodes[link.source].count += link.value;
    //     nodes[link.target].count += link.value;
    // });
    for(var i=0;i<showMatrix.length;i++){
        for(var j=0;j<showMatrix.length;j++){
            matrix[i][j].z += showMatrix[i][j];
            nodes[i].count += showMatrix[i][j];
        }
    }

    // Precompute the orders.
    orders = {
        init: d3.range(n),
        name: d3.range(n).sort(function(a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
        count: d3.range(n).sort(function(a, b) { return nodes[b].count - nodes[a].count; }),
        group: d3.range(n).sort(function(a, b) { return nodes[b].group - nodes[a].group; }),
        spectral:[]
    };
    xOrder=[];
    yOrder=[];
	for (i in orders['init']){
		xOrder.push(orders['init'][i]);
		yOrder.push(orders['init'][i]);
	}
    // The default sort order.
    x_orderRelation.domain(orders.init);

    svg_orderRelation.selectAll("rect").remove();
    svg_orderRelation.selectAll(".row").remove();
    svg_orderRelation.selectAll(".column").remove();

    svg_orderRelation.append("rect")
        .attr("class", "cellBackground")
        .attr("width", width_orderRelation)
        .attr("height", height_orderRelation);

    var row = svg_orderRelation.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x_orderRelation(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width_orderRelation);

    row.append("text")
        .attr("x", -6)
        .attr("y", x_orderRelation.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return nodes[i].name; })
        .attr("class",function(d,i) {
            return "matrixText_"+nodes[i].name.replace(/[\W]/g,'_');
        })
        .style("fill", function(d,i) { return color20( nodes[i].group ); })
    ;

    var column = svg_orderRelation.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + x_orderRelation(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width_orderRelation);

    column.append("text")
        .attr("x", 6)
        .attr("y", x_orderRelation.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return nodes[i].name; })
        .attr("class",function(d,i) {
            return "matrixText_"+nodes[i].name.replace(/[\W]/g,'_');
        })
        .style("fill", function(d,i) { return color20( nodes[i].group ); })
    ;
//提示文字

    svg_orderRelation.selectAll(".cell").append("svg:title")
        .text(function(data) {
            // var link=links[node.index];
            // if(node.name==link.source.name && link.rela=="主营产品"){
            //     return "双击可查看详情"
            // }
            return data.z;//name    数据条数：
        });
    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row)
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) {
                var x=d.x;
                var t=x_orderRelation(d.x);
                return x_orderRelation(d.x); })
            .attr("width", x_orderRelation.rangeBand())
            .attr("height", x_orderRelation.rangeBand())
            //.style("fill-opacity", function(d) { return z_orderRelation(d.z); })
            //.style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c_orderRelation(nodes[d.x].group) : null; })
            .style("fill", function(d) { return colorMapCooperateOpacity(d.z); })
                .attr("opacity",function(d){
                    return opacityMap(d.z);
                })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .call(dragElement_M)
            ;
    }

    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function(d, i) {
            return i == p.y; });
        d3.selectAll(".column text").classed("active", function(d, i) {
            return i == p.x; });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    d3.select("#order").on("change", function() {
        clearTimeout(timeout);
        order(this.value);
    });




}




function order(value) {
    if(value=="spectral"){
        $.ajax({url:mylocalURL+"getSpectralResult",async:false ,type: "POST",data:{ 'matrix':JSON.stringify(orderRelationMatrixData[app_orderRelation.config.whichMatrix]),"galleryIndex":0},success:function(data){
            var max=Math.max(data["label"]);
            myList=d3.range(orderRelationMatrixData[app_orderRelation.config.whichMatrix].length).sort(function(a, b) { return data["label"][b] - data["label"][a];  }),
            orders["spectral"]=myList;
        }});
    }
    x_orderRelation.domain(orders[value]);
    xOrder=orders[value];
    yOrder=orders[value];
    var t = svg_orderRelation.transition().duration(2500);

    t.selectAll(".row")
        .delay(function(d, i) { return x_orderRelation(i) ; })
        .attr("transform", function(d, i) { return "translate(0," + x_orderRelation(i) + ")"; })// 在y轴上进行偏移
        .selectAll(".cell")
        .delay(function(d) { return x_orderRelation(d.x) ; })
        .attr("x", function(d) { return x_orderRelation(d.x); }); //在x轴上设置x坐标

    //column似乎只控制上部的字体
    t.selectAll(".column")
        .delay(function(d, i) { return x_orderRelation(i) ; })
        .attr("transform", function(d, i) { return "translate(" + x_orderRelation(i) + ")rotate(-90)"; });

}
function orderImmediately(orderX,orderY)
{
    x_orderRelation.domain(orderX);
    y_orderRelation.domain(orderY);
  //  var t = svg_orderRelation.transition().duration(2500);

    svg_orderRelation.selectAll(".row")
        .attr("transform", function(d, i) { return "translate(0," + y_orderRelation(i) + ")"; })
        .selectAll(".cell")
        .attr("x", function(d) { return x_orderRelation(d.x); });

    svg_orderRelation.selectAll(".column")
        .attr("transform", function(d, i) { return "translate(" + x_orderRelation(i) + ")rotate(-90)"; });
}

// var timeout = setTimeout(function() {
//     order("group");
//     // d3.select("#order").property("selectedIndex", 2).node().focus();
// }, 5000);

// d3.json("./miserables.json", function(miserables) {
//     getorderRelationMatrixSuccess(miserables);
// });//load

function legendInit(){
    var widthLegend=Math.floor( $(tabs2ActiveID).width()*0.1);
    var height=400;
    var margin= {top: 80, right: 0, bottom: 10, left: 10};
    var key = d3.select("#oderRalationLegend")
        .attr("width", widthLegend)
        .attr("height", height + margin.top + margin.bottom);

    var legend = key
        .append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#0f0")
        .attr("stop-opacity", 1);
    legend
        .append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#0f0")
        .attr("stop-opacity", 0);
    legend
        .append("stop")
        .attr("offset", "50.1%")
        .attr("stop-color", "#f00")
        .attr("stop-opacity", 0);
    legend
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#f00")
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", widthLegend/2)
        .attr("height", height)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0," + margin.top + ")");

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([-1, 1]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");

    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+widthLegend/2+"," + margin.top + ")")
        .call(yAxis)
}
legendInit();







// var runDebounce = _.debounce(function(){main_redraw(myChart_main_data);}, 600, {
//     trailing: true
// });
function shuffle(a) {
	var b=[];
    var len = a.length;
    for (var i = 0; i < len - 1; i++) {
        var index = parseInt(Math.random() * (len - i));
        var temp = a[index];
        a[index] = a[len - i - 1];
        a[len - i - 1] = temp;
    }
	for (var i in a) {
		b.push(a[i]);
    }
	return b;
}
var app_orderRelation = {};
app_orderRelation.config = {
    orderSel: 'init',
    whichMatrix:"relation",
};
var orderRelation_onFinishChange={
    orderSelChg:function (value) {
        order( app_orderRelation.config.orderSel );
    },
    matrixChg:function (value) {
        getorderRelationMatrixSuccess(orderRelationMatrixData);
    }

}
var gui_orderRelation_orderRelation={};
if (app_orderRelation.config) {
     gui_orderRelation = new dat.GUI({
        autoPlace: false
    });
    $(gui_orderRelation.domElement).css({
        position: 'absolute',
        right: 5,
        top: 0,
        color:"red",
        zIndex: 1000
    });
    $("#orderRalation").append(gui_orderRelation.domElement);
    var controller = gui_orderRelation.add(app_orderRelation.config, "orderSel", [ 'init','name', 'count', 'group' ,'spectral']);
    controller.onFinishChange(orderRelation_onFinishChange.orderSelChg);
    controller = gui_orderRelation.add(app_orderRelation.config, "whichMatrix", [ "overlap","relation" ]);
    controller.onFinishChange(orderRelation_onFinishChange.matrixChg);
}

