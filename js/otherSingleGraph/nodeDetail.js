function nodeDetailCluster(ev){
    var find=findEleAType(ev.target) ;
    var $splitText= $(find[0]).find(".splitValue");
    if(!$splitText.length){  //无数据
        layui.use('form', function () {
            var layer = layui.layer;
            layer.msg('Please split manually!', {
                time: 1000 //2秒关闭（如果不配置，默认是3秒）
            })
        });
        return;
    }
    var value=[];
    for(var i=0;i<$splitText.length;i++){
        value.push($($splitText[i]).text());
    }
    var name=nodeDetailData[$(find[0]).data("index")]["name"].split(",")[0];
    $.ajax({url:mylocalURL+"clustering",type: "POST",data:{
                    'galleryIndex':0,
                    clusterData:JSON.stringify({
                        type:"custom",
                        nameList:[name],
                        splitpointList:value,
                    })
    },success:function(result){
        layui.use('form', function () {
            var layer = layui.layer;
            layer.msg('ok!', {
                time: 1000 //2秒关闭（如果不配置，默认是3秒）
            })
        });
    }});
}


var nodeDetailData={   //[{data,name}]
    //nodeDetailKey :result
};
var nodeDetailPara={
    // min:0,  //注意可能是字符串
    // max:0,  //注意可能是字符串
    layout:{    //根据grid来更新数据
        left:0,
        top:0,
        bottom:0,
        right:0,
        width:0,
        height:0,
        splitCtlHeight:20,
    },
};
function redraw_nodeDetail(para){
    //para={  $selector}
    var data=para.data;
    var nodeDetailKey=para.$selector.data("index");
    nodeDetailData[nodeDetailKey]={};
    nodeDetailData[nodeDetailKey]["splitID_index"]=0;
    nodeDetailData[nodeDetailKey]["xValueNum"]=60;     //[20,60).step(5);
    nodeDetailData[nodeDetailKey]["pointSize"]=5;      //[3, 15).step(1)
    var nodeDetailScatter = echarts.getInstanceByDom(para.$selector[0]);
    if(!nodeDetailScatter)  //不存在
    {
        nodeDetailScatter=echarts.init(para.$selector[0],'mySubject',{width:para.$selector.width(),height:para.$selector.height()});
    }
    var nodeDetailParaDebounce = _.debounce(function(para){getnodeDetailSuccess(para,nodeDetailData[nodeDetailKey]);}, 100);


    $.ajax({url:mylocalURL+"nodeDetailScatter",type: "POST",data:{ 'data':JSON.stringify(para.data)},success:function(result){
        getnodeDetailSuccess(para,result);
       nodeDetailData[nodeDetailKey]["data"]=result["data"];
       nodeDetailData[nodeDetailKey]["name"]=result["name"];
    }});
    // $.getJSON('./data/nodeDetail.json', function (result) {
    //     getnodeDetailSuccess(result);
    //     nodeDetailData[nodeDetailKey]=result;
    // });;


    function getnodeDetailSuccess(para,result){
        var nodeDetailKey=para.$selector.data("index");
        var processData= dataProcessND(para,result);
        // $('#dataNum').text('总数据量：'+result['data'][0].length+"条");
        var data=result['data'];
        var title=result['name'];
        var option = {
            title: {
                text: title,
                textStyle:{
                    fontSize:12,
                },
            },
            tooltip: {

                axisPointer: {
                    type: 'cross'
                }
            },
            grid:{
                left:25,
                top:30,
                right:25,
                bottom:30,
            },
            xAxis: {
                type: 'value',
                axisLine: {onZero: false},
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min:nodeDetailData[nodeDetailKey]["min"]-1,
                max:Number(nodeDetailData[nodeDetailKey]["max"])+1,
                name:result['name'],
            },
            yAxis: [{
                type: 'value',
                axisLine: {onZero: false},
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                name:"",
            },
                {
                    show:false,
                    type: 'category',
                    data: processData[1].axisData,
                    boundaryGap: true,
                    nameGap: 30,
                    splitArea: {
                        show: false
                    },
                    axisLabel: {
                        formatter: 'expr {value}'
                    },
                    splitLine: {
                        show: false
                    }
                },
            ],
            series: [{
                name: 'scatter',
                type: 'scatter',
                symbolSize:nodeDetailData[nodeDetailKey]["pointSize"],
                data: processData[0],
                zlevel:10,
                tooltip: {
                    formatter: function (param) {
                        return [
                            'value: ' + param.data.trueValue,
                            'class: ' + param.data.class,
                            'dataName: '+ param.data.dataName,
                        ].join('<br/>')
                    }
                },
            },
                {
                    name: 'boxplot',
                    type: 'boxplot',
                    data: processData[1].boxData,
                    yAxisIndex:1,
                    tooltip: {
                        formatter: function (param) {
                            return [
                                'Experiment ' + param.name + ': ',
                                'upper: ' + param.data[5],
                                'Q3: ' + param.data[4],
                                'median: ' + param.data[3],
                                'Q1: ' + param.data[2],
                                'lower: ' + param.data[1]
                            ].join('<br/>')
                        }
                    },
                    itemStyle:{
                        opacity:0.8,
                    }
                },
                // {
                //     name: 'outlier',
                //     type: 'scatter',
                //     data: NodeDetailBoxplotData.outliers,
                //     yAxisIndex:1,
                // }
            ]
        };
        nodeDetailScatter.setOption(option, true);
        nodeDetailPara.layout.top=option.grid.top;
        nodeDetailPara.layout.bottom=option.grid.bottom;
        nodeDetailPara.layout.left=option.grid.left;
        nodeDetailPara.layout.right=option.grid.right;
        nodeDetailPara.layout.width= para.$selector.width();
        nodeDetailPara.layout.height= para.$selector.height();
        drawSplitCtl(para);
    }
    function drawSplitCtl(para){
        var nodeDetailKey=para.$selector.data("index");
        para.$selector.find("svg").remove();
        var layout=nodeDetailPara.layout;

        para.$selector.prepend('<svg class="splitsvgpre"></svg>');
        para.$selector.append('<svg class="splitsvg"></svg>');
        var svgpre=d3.select(para.$selector[0]).select(".splitsvgpre")
            .attr("width",layout.width-layout.left-layout.right)
            .attr("height",layout.height)
            .style("position","absolute")
            .style("top",0)
            .style("left",layout.left)
            .append("g")
        ;
        var mysplit = d3.select(para.$selector[0]).select(".splitsvg")
            .attr("width",layout.width-layout.left-layout.right)
            .attr("height",30)
            .style("position","absolute")
            .style("top",(layout.height-layout.bottom))
            .style("left",layout.left)
            .append("g")
        ;

        var x = d3.scale.linear()
            .range([0, layout.width-layout.right-layout.left])
            .domain([Number(nodeDetailData[nodeDetailKey]["min"])-1,Number(nodeDetailData[nodeDetailKey]["max"])+1]);
        nodeDetailData[nodeDetailKey]["x"]=x;
        //根据x轴的范围指定格式
        var extend=nodeDetailData[nodeDetailKey]["max"]-nodeDetailData[nodeDetailKey]["min"];
        var format;
        var scale=d3.scale.quantize()
            .domain([-3, 1]) // 连续的
            .range([4,3,2, 1]); // 离散的
        if(extend>10){
            format=d3.format("d");
            nodeDetailData[nodeDetailKey]["x_format_dot"]=0;
        }
        else{
            var a=Math.round(Math.log(extend)/Math.log(10));
            format=d3.format("."+scale(a)+"f");
            nodeDetailData[nodeDetailKey]["x_format_dot"]=scale(a);
        }

        var splitPointDrag= d3.behavior.drag()
            .on("dragstart", function(d) {})
            .on("drag", function(d) {
                if(d3.event.x>=0&& d3.event.x<=layout.width-layout.right-layout.right ){
                    d3.select(this).attr("transform",
                        "translate("+d3.event.x+ ",0)");
                    var value=nodeDetailData[nodeDetailKey]["x"].invert(d3.event.x);
                    d3.select(this).select("text").text(value.toFixed(nodeDetailData[nodeDetailKey]["x_format_dot"]+1));
                    var lineid="#line_"+d3.select(this).attr("id").split("_")[1];

                    d3.select(lineid).attr("transform",
                        "translate("+d3.event.x+ ",0)");

                }
            }).on("dragend", function(d) {});

        mysplit.attr("class", "split")
            .on("dblclick",function(){
                var x=nodeDetailData[nodeDetailKey]["x"];
                var value=x.invert(d3.mouse(this)[0]);
                var dragItem=d3.select(this).append("g")
                    .attr("class","splitItem")
                    .attr("id","dragItem_"+nodeDetailData[nodeDetailKey]["splitID_index"])
                    .attr("transform", "translate("+d3.mouse(this)[0]+ ",0)")
                    .on("dblclick",function(){
                        d3.select(this).remove();
                        var lineid="#line_"+d3.select(this).attr("id").split("_")[1];
                        d3.select(lineid).remove();
                        window.event.stopPropagation();
                    })
                    .call(splitPointDrag);
                dragItem.append("circle")
                    .attr("cx",0)
                    .attr("cy",5)
                    .attr("r",5)
                ;
                svgpre.append("line")
                    .attr("id",'line_'+nodeDetailData[nodeDetailKey]["splitID_index"])
                    .attr("x1",0)
                    .attr("y1",nodeDetailPara.layout.top)
                    .attr("x2",0)
                    .attr("y2",nodeDetailPara.layout.height-nodeDetailPara.layout.top+1)
                    .attr("transform", "translate("+d3.mouse(this)[0]+ ",0)")
                ;

                dragItem.append("line")
                    .attr("class","splitItem")
                    .attr("x1",0)
                    .attr("y1",0)
                    .attr("x2",0)
                    .attr("y2",-(nodeDetailPara.layout.height-nodeDetailPara.layout.top-nodeDetailPara.layout.bottom+1))
                ;
                dragItem.append("text")
                    .attr("x", 0)
                    .attr("y", 28)
                    .attr("class","splitValue")
                    .style("text-anchor", "middle")
                    .text(value.toFixed(nodeDetailData[nodeDetailKey]["x_format_dot"]+1))
                ;

                nodeDetailData[nodeDetailKey]["splitID_index"]+=1;
            });
        mysplit.append("rect")
            .attr("class", "sliderRect")
            // .attr("transform", "translate(0," + height+10 + ")")
            .attr("width",layout.width-layout.left-layout.right)
            .attr("height",10)
        ;


    }
    function dataProcessND(para,result)
    {
        var nodeDetailKey=para.$selector.data("index");
        result['data'].sort(sortMyNumber);
        var dataScatter=result['data'];
        var data=[];
        for (var i in result['data'])
        {
            data.push(result['data'][i][0]);
        }
        var extend=d3.extent(data);//_.max(data); _.min(data);
        var xValueNum=nodeDetailData[nodeDetailKey]["xValueNum"]
        var xIncrease=((extend[1]-extend[0])/xValueNum);
        var myMean= d3.mean(data);//中值
        var myVariance= variance(data);//方差
        nodeDetailData[nodeDetailKey]["max"]=extend[1].toFixed(1);
        nodeDetailData[nodeDetailKey]["min"]=extend[0].toFixed(1);
        //d3.quantile(data,0.7);//分位数
        //variance(data);//方差
        var xValue=extend[0];
        var yValue=1;
        var lastxValue=xValue;
        var NodeDetailBoxplotData=echarts.dataTool.prepareBoxplotData([
            data
        ], {
            layout: 'vertical'
        });
        var NodeDetailScatterData=[];
        for (var i in dataScatter)
        {
            xValue=Math.ceil((dataScatter[i][0]-extend[0])/xIncrease)*xIncrease+ extend[0];
            if( xValue!= lastxValue)
            {
                lastxValue=xValue;
                yValue=1;
            }
            if(dataScatter[i][1]==result['name'].split(',')[2]) //当前点用黑色表示
            {

                NodeDetailScatterData.push({value:[xValue, yValue] ,
                    trueValue:dataScatter[i][0],
                    itemStyle:{color:'#222',},
                    class:dataScatter[i][1],
                    dataName:dataScatter[i][2]
                })
            }
            else {
                NodeDetailScatterData.push({
                    value: [xValue, yValue],
                    trueValue: dataScatter[i][0],
                    itemStyle: {color: color20(dataScatter[i][1]),},  //从全局调色盘获取颜色
                    class: dataScatter[i][1],
                    dataName:dataScatter[i][2]
                });
            }
            yValue+=1;
        }
        return [NodeDetailScatterData,NodeDetailBoxplotData]
    }
    nodeDetail_g_resize=function(ele){
        //重新绘制
        if(!ele){
        var $sel=$("#nodeDetail .gallery_item");
        //更新nodeDetailPara.layout即可
        if($sel.length){
            var nodeDetailScatter = echarts.getInstanceByDom($sel[0]);
            if(!nodeDetailScatter){return;} //是空的
            var option=nodeDetailScatter.getOption();
            nodeDetailPara.layout.top=option.grid[0].top;
            nodeDetailPara.layout.bottom=option.grid[0].bottom;
            nodeDetailPara.layout.left=option.grid[0].left;
            nodeDetailPara.layout.right=option.grid[0].right;
            nodeDetailPara.layout.width= $($sel[0]).width();
            nodeDetailPara.layout.height= $($sel[0]).height();
            for(var i=0;i<$sel.length;i++){
                var $update=$($sel[i]);
                drawSplitCtl({$selector:$update});
            }
        }
        }else{
            var nodeDetailScatter = echarts.getInstanceByDom(ele);
            if(!nodeDetailScatter){return;} //是空的
            var option=nodeDetailScatter.getOption();
            nodeDetailPara.layout.top=option.grid[0].top;
            nodeDetailPara.layout.bottom=option.grid[0].bottom;
            nodeDetailPara.layout.left=option.grid[0].left;
            nodeDetailPara.layout.right=option.grid[0].right;
            nodeDetailPara.layout.width= $(ele).width();
            nodeDetailPara.layout.height= $(ele).height();
            drawSplitCtl({$selector:$(ele)});
        }

    };


}
var nodeDetail_g_resize=function(){};

var variance = function(numbers) {
    var mean = 0;
    var sum = 0;
    for(var i=0;i<numbers.length;i++){
        sum += numbers[i];
    }
    mean = sum / numbers.length;
    sum = 0;
    for(var i=0;i<numbers.length;i++){
        sum += Math.pow(numbers[i] - mean , 2);
    }
    return sum / numbers.length;
};
function sortNumber(a,b)    //升序排列
{
    return a - b;
}
function sortMyNumber(a,b)
{
    // return a[0] - b[0];
    if( a[0] == b[0])
    {
        return a[1] - b[1];
    }
    else {
        return a[0] - b[0];
    }
}

/*约定数据格式
* data:[[123,1](这是一个数据点,第一个坐标是具体的数据，第二个坐标是分类),[],[],[],[],[],[]]
* name:***
* 使用黑色标出
* */


/*用于测试
*
*
* */
// redraw_nodeDetail({  $selector:$("#div_1")});