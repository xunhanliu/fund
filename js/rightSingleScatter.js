/**
 * Created by Administrator on 2018/4/11 0011.
 */
//**********************************************************************************************************

var myScatter = echarts.init(document.getElementById("scatter"),'mySubject');
var data={};
var send={};
getTabs2ActiveID();
function scatter_size_update(){
    // myScatter.resize({height:700,width:700});
    getTabs2ActiveID();
    myScatter.resize({width:$(tabs2ActiveID).width(),height:500});
}
function getScatterData(list1,index)//[name1_1,name2_0]
{
    showToast('info',"边数据获取中。。。");
    $.ajax({url:mylocalURL+"showScatter",type: "POST",data:{ 'nameList':list1.join('*'),"galleryIndex":index},success:function(result){
        showToast('success',"边数据获取成功");
        getScattersuccess(result);
    }});
}

function getScattersuccess(result){

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
            subtext: '并自动拟合了一条线性回归线',
            left: 'center'
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
            min:Math.floor(data[3][0][0]-1),
        },
        yAxis: {
            type: 'value',
            axisLine: {onZero: true},
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            },
            min:Math.floor(data[2][0][1]-1),
            name:result['name'][1]-1,
        },
        series: [{
            name: 'scatter',
            type: 'scatter',
            itemStyle:{
                color:'red'
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
            data: data[0],
            tooltip: {
                formatter: function (param) {
                    return 'dataName: ' + param.data[2];
                }
            },
            itemStyle: {
                normal: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(120, 36, 50, 0.5)',
                    shadowOffsetY: 5,}}
        },
            {
                name: 'scatter',
                type: 'scatter',
                itemStyle:{
                    color: "gray",
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
                data: data[1],
                tooltip: {
                    formatter: function (param) {
                        return 'dataName: ' + param.data[3];
                    }
                },
                itemStyle: {
                    normal: {
                        color: "gray",
                        shadowBlur: 10,
                        shadowColor: 'rgba(80, 80, 80, 0.5)',
                        shadowOffsetY: 5,}}
            },
            {
                name: 'scatter',
                type: 'scatter',
                itemStyle:{
                    color: "gray",
                },
                data: data[2],
                itemStyle: {
                    normal: {
                        color: "gray",
                        shadowBlur: 10,
                        shadowColor: 'rgba(80, 80, 80, 0.5)',
                        shadowOffsetY: 5,}}
            },
            {
                name: 'scatter',
                type: 'scatter',
                itemStyle:{
                    color: "gray",
                },
                data: data[3],
                itemStyle: {
                    normal: {
                        color: "gray",
                        shadowBlur: 10,
                        shadowColor: 'rgba(80, 80, 80, 0.5)',
                        shadowOffsetY: 5,}}
            },{
            name: 'line',
            type: 'line',
            showSymbol: false,
            data: myRegression.points,
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
                            fontSize: 14
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
    myScatter.resize({width:$(tabs2ActiveID).width()});


}

myScatter.showLoading();
$.getJSON('./js/scatterExample.json', function (result) {
    myScatter.hideLoading();
    getScattersuccess(result);
});;