/**
 * Created by Administrator on 2018/9/17 0011.
 */
//**********************************************************************************************************

var nodeDetailScatter = echarts.init(document.getElementById("node_detail_left"),'mySubject');
var nodeDetailSymbolSize=5;
var widthNum=60;
var NodeDetailScatterData=[];
var NodeDetailBoxplotData;
var myLastDataResult;
var nodeDetailColor = d3.scale.category20();
var nodeDetailPara={};

nodeDetailPara.configParameters = {
    xValueNum: {
        min: 20,
        max: 60,
        step: 5,
    },
    pointSize: {
        min: 5,
        max: 15,
        step: 1,
    },
};
var nodeDetailParaDebounce = _.debounce(function(){getnodeDetailSuccess(myLastDataResult);}, 100);
nodeDetailPara.config = {
    xValueNum: 60,
    pointSize: 5,
    onFinishChange: function(change){
        if(typeof(change)=="undefined"){ //按钮触发
            return;
        }
        if(typeof(change)=="number"){
            //runDebounce();
            //main_redraw(myChart_main_data);
            widthNum=nodeDetailPara.config.xValueNum;
            nodeDetailSymbolSize=nodeDetailPara.config.pointSize;
            nodeDetailParaDebounce();
        }

    },}

if (nodeDetailPara.config) {
    nodeDetailParaCtl = new dat.GUI({
        autoPlace: false
    });
    $(nodeDetailParaCtl.domElement).css({
        position: 'absolute',
        // float:"right",
        right: 5,
        top: 0,
        color:"red",
        zIndex: 1000,
    });
    $("#node_detail_left").append(nodeDetailParaCtl.domElement);

    var configParameters = nodeDetailPara.configParameters || {};
    for (var name in nodeDetailPara.config) {
        // var value = nodeDetailPara.config[name];
        if (name !== 'onChange' && name !== 'onFinishChange') {
            var isColor = false;
            // var value = obj;
            var controller;
            if (typeof(configParameters[name])!="undefined") {  //有配置参数
                if (configParameters[name].options) { //下拉列表
                    controller = nodeDetailParaCtl.add(nodeDetailPara.config, name, configParameters[name].options);
                }
                else if (configParameters[name].min != null) { // 连续的输入bar
                    controller = nodeDetailParaCtl.add(nodeDetailPara.config, name, configParameters[name].min, configParameters[name].max).step(configParameters[name].step);
                }
            }
            else if(name!='onChange'){  //无配置参数， button 或者check框等
                controller = nodeDetailParaCtl.add(nodeDetailPara.config,name);
            }

            nodeDetailPara.config.onChange && controller.onChange(nodeDetailPara.config.onChange);
            nodeDetailPara.config.onFinishChange && controller.onFinishChange(nodeDetailPara.config.onFinishChange);
        }
    }
}
//右上角controlTab  OVER************************************************************


function getNodeDetailData(name1_0,index)//维度名]
{
    $.ajax({url:mylocalURL+"nodeDetailScatter",type: "POST",data:{ 'name':name1_0,"galleryIndex":index},success:function(result){
        getnodeDetailSuccess(result);
    }});
}
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

function dataProcessND(result)
{
    result['data'].sort(sortMyNumber);
    var dataScatter=result['data'];
    var data=[];
    for (var i in result['data'])
    {
        data.push(result['data'][i][0]);
    }
    var extend=d3.extent(data);//_.max(data); _.min(data);
    var xIncrease=Math.ceil((extend[1]-extend[0])/widthNum);
    var myMean= d3.mean(data);//中值
    var myVariance= variance(data);//方差
    var nodeDetailRightStr='';
    nodeDetailRightStr+='<p>最大值：'+extend[1].toFixed(2) +'</p>'+
                        '<p>最小值：'+extend[0].toFixed(2) +'</p>'+
                        '<p>均值：'+myMean.toFixed(2) +'</p>'+
                        '<p>方差：'+myVariance.toFixed(2) +'</p>';
    $('#node_detail_right').html(nodeDetailRightStr);
    //
    //d3.quantile(data,0.7);//分位数
    //variance(data);//方差
     var xValue=extend[0];
     var yValue=1;
     var lastxValue=xValue;
    NodeDetailBoxplotData=echarts.dataTool.prepareBoxplotData([
        data
    ], {
        layout: 'vertical'
    });
    NodeDetailScatterData=[];
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
                                        itemStyle:{color:'#000',},
                                        class:dataScatter[i][1],
                                        dataName:dataScatter[i][2]
            })
        }
        else {
            NodeDetailScatterData.push({
                value: [xValue, yValue],
                trueValue: dataScatter[i][0],
                itemStyle: {color: nodeDetailColor(dataScatter[i][1]),},
                class: dataScatter[i][1],
                dataName:dataScatter[i][2]
            });
        }
        yValue+=1;
    }
}
/*约定数据格式
* data:[[123,1](这是一个数据点,第一个坐标是具体的数据，第二个坐标是分类),[],[],[],[],[],[]]
* name:***
* 使用黑色标出
* */
function getnodeDetailSuccess(result){
    myLastDataResult=result;
    dataProcessND(result);
   // $('#dataNum').text('总数据量：'+result['data'][0].length+"条");

    var data=result['data'];
    var title=result['name']+'的分布情况';
    var option = {
        title: {
            text: title,
            left: 'center'
        },
        tooltip: {

            axisPointer: {
                type: 'cross'
            }
        },

        xAxis: {
            type: 'value',
            axisLine: {onZero: false},
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            },
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
            name:"频率",
        },
            {
                show:false,
                type: 'category',
                data: data.axsersData,
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
            symbolSize:nodeDetailSymbolSize,
            data: NodeDetailScatterData,
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
                data: NodeDetailBoxplotData.boxData,
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
}

/*用于测试
*
*
* */
// $.getJSON('./nodeDetail.json', function (result) {
//     getnodeDetailSuccess(result);
// });;