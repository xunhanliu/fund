function redraw_mdsScatter(para){
    //para={  $selector, data=[]}
    var data=para.data;
    showToast('info',"edgeScatter calculating...");
    var myScatter = echarts.getInstanceByDom(para.$selector[0]);
    if(!myScatter)  //不存在
    {
        myScatter=echarts.init(para.$selector[0],'mySubject',{width:para.$selector.width(),height:para.$selector.height()});
    }
    $.ajax({url:mylocalURL+"mdsScatter",type: "POST",data:{ 'data':JSON.stringify(data),"galleryIndex":0},success:function(result){
        showToast('success',"mdsScatter success");
        getScattersuccess(para,result);
    }});

    function getScattersuccess(para,result){ // result是一个关于坐标的矩阵。
        //获取全局的head列表，获取全局颜色列表。
        var data=result;
    //对data进行处理，把名字加到[2]位置上，把颜色加到[3]位置上
        var circleSizeScale= d3.scale.linear()
            .domain([1, Number(myChart_main_data['dataNum'])])
            .range([5, 15]) //值域
        ;
        data.forEach(function (d,i) {
            d.push(myChart_main_data.head[i][0]);
            d.push( myColorScheme[myColorScheme.scheme].color(myChart_main_data.nodes[i].category,myChart_main_data.head[i][0].split(",")[0]));
            d.push(circleSizeScale(myChart_main_data.head[i][1]))
        });
        var title='MDS（dimension）';

        var option = {
            title: {
                text: title,
                textStyle:{
                    fontSize:12,
                },
            },
            grid:{
                left:25,
                top:30,
                right:25,
                bottom:25,
            },
            tooltip: {
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (param) {
                    return 'dim:' + param.data[2];
                }
            },

            xAxis: {
                type: 'value',
                // axisLine: {onZero: true},
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                // name:result['name'][0],
                // min:data[3][0][0],
            },
            yAxis: {
                type: 'value',
                // axisLine: {onZero: true},
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                // min:data[2][0][1],
                // name:result['name'][1]-1,
            },
            toolbox:{
                show:true,
                itemSize:15,
                feature:{
                    saveAsImage:{show:false},
                    restore:{show:false},
                    dataView:{show:false},
                    dataZoom:{show:false},
                    magicType:{show:false},
                }
            },
            series: [{
                data: data,
                name: 'scatter',
                type: 'scatter',
                symbolSize:function (d) {
                    return d[4];
                },
                label: {
                    emphasis: {
                        show: true,
                        position: 'left',
                        textStyle: {
                            color: 'blue',
                            fontSize: 16
                        }
                    }
                },
                tooltip: {
                    formatter: function (param) {
                        return 'dim: ' + param.data[2];
                    }
                },
                itemStyle: {

                    normal: {
                        color:(d)=>d.data[3],
                        shadowBlur: 5,
                        shadowColor: 'rgba(50, 50, 50, 0.5)',
                        shadowOffsetY: 3,}
                        }
            }]

    };
        myScatter.setOption(option, true);
    }
}