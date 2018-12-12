function redraw_edgeScatter(para){
    //para={  $selector, data=[]}
    var data=para.data;
    showToast('info',"edgeScatter calculating...");
    var myScatter = echarts.getInstanceByDom(para.$selector[0]);
    if(!myScatter)  //不存在
    {
        myScatter=echarts.init(para.$selector[0],'mySubject',{width:para.$selector.width(),height:para.$selector.height()});
    }
    $.ajax({url:mylocalURL+"showScatter",type: "POST",data:{ 'nameList':JSON.stringify(data.nameList),"galleryIndex":data.galleryIndex},success:function(result){
        showToast('success',"edgeScatter success");
        getScattersuccess(para,result);
    }});

    function getScattersuccess(para,result){
        var myScatter = echarts.getInstanceByDom(para.$selector[0]);
        if(!myScatter)  //不存在
        {
            myScatter=echarts.init(para.$selector[0],'mySubject',{width:para.$selector.width(),height:para.$selector.height()});
        }
        $('#dataNum').text('总数据量：'+result['data'][0].length+"条");

        var data=result['data'];
        var lineData=[];
        $.extend(true,lineData,data[0]);
        for(var i in lineData)
        {
            lineData[i].pop();
        }
        var myRegression = ecStat.regression('linear', lineData);

        myRegression.points.sort(function(a, b) {
            return a[0] - b[0];
        });
        var title=result['name'][0]+'-'+result['name'][1]
        var option = {
            title: {
                text: title,
                textStyle:{
                    fontSize:12,
                },
            },
            grid:{
                left:25,
                top:'20%',
                right:25,
                bottom:25,
            },
            tooltip: {
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (param) {
                    return 'dataName: ' + param.data[2];
                }
            },

            xAxis: {
                type: 'value',
                axisLine: {onZero: true},
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                name:result['name'][0],
                min:data[3][0][0],
            },
            yAxis: {
                type: 'value',
                axisLine: {onZero: true},
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min:data[2][0][1],
                name:result['name'][1]-1,
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
                    // mydelete: {
                    //     show: true,
                    //     title:'delete',
                    //     //icon: 'image://http://echarts.baidu.com/images/favicon.png',
                    //     icon: 'path://M512 960c-282.77 0-512-229.23-512-512s229.23-512 512-512 512 229.23 512 512-229.23 512-512 512zM512 32c-229.75 0-416 186.25-416 416s186.25 416 416 416 416-186.25 416-416-186.25-416-416-416zM672 704l-160-160-160 160-96-96 160-160-160-160 96-96 160 160 160-160 96 96-160 160 160 160z',
                    //     onclick: function (){
                    //         gallery.delete(para.$selector[0]);
                    //     }
                    // }
                }

            },
            series: [{
                name: 'scatter',
                type: 'scatter',
                symbolSize:5,
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
                data: data[0],
                tooltip: {
                    formatter: function (param) {
                        return 'dataName: ' + param.data[2];
                    }
                },
                itemStyle: {
                    color:'red',
                    normal: {
                        shadowBlur: 5,
                        shadowColor: 'rgba(120, 36, 50, 0.5)',
                        shadowOffsetY: 3,}}
            },
                {
                    name: 'scatter',
                    type: 'scatter',
                    symbolSize:5,
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
                    data: data[1],
                    tooltip: {
                        formatter: function (param) {
                            return 'dataName: ' + param.data[3];
                        }
                    },
                    itemStyle: {
                        color: "gray",
                        normal: {
                            color: "gray",
                            shadowBlur: 5,
                            shadowColor: 'rgba(80, 80, 80, 0.5)',
                            shadowOffsetY: 3,}}
                },
                {
                    name: 'scatter',
                    type: 'scatter',
                    symbolSize:5,
                    data: data[2],
                    itemStyle: {
                        color: "gray",
                        normal: {
                            color: "gray",
                            shadowBlur: 5,
                            shadowColor: 'rgba(80, 80, 80, 0.5)',
                            shadowOffsetY: 3,}}
                },
                {
                    name: 'scatter',
                    type: 'scatter',
                    symbolSize:5,
                    data: data[3],
                    itemStyle: {
                        color: "gray",
                        normal: {
                            color: "gray",
                            shadowBlur: 5,
                            shadowColor: 'rgba(80, 80, 80, 0.5)',
                            shadowOffsetY: 3,}}
                },{
                    name: 'line',
                    type: 'line',
                    showSymbol: false,
                    data: myRegression.points,
                    itemStyle:{
                        color: "#110761",
                    },
                    markPoint: {
                        itemStyle: {
                            normal: {
                                color: 'transparent'
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'left',
                                formatter: myRegression.expression,
                                textStyle: {
                                    color: '#333',
                                    fontSize: 12
                                }
                            }
                        },
                        data: [{
                            coord: myRegression.points[myRegression.points.length - 1]
                        }]
                    }
                }]
        };;
        myScatter.setOption(option, true);
    }

}