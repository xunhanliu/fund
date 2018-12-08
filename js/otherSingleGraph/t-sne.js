//t-sne 筛选，需要更新所有视图

function getTSNE(){
    showToast('info',"tsne 获取中。。");
    $.ajax({url:mylocalURL+"getTSNE",type: "POST",data:{"galleryIndex":0,tsnePara: JSON.stringify({"perplexity": 50,nameList:selectPoint})},success:function(result){
        //result
        showToast('success',"tsne获取成功");
        tsneData=result;
        //tsenRefreshData(result);
        otherGraph_g.new('t-sne',tsneData)
    }});
}

function getAllTSNE(){
    showToast('info',"tsne 获取中。。");
    $.ajax({url:mylocalURL+"getTSNE",type: "POST",data:{"galleryIndex":0,tsnePara: JSON.stringify({"perplexity": 50,nameList:[]})},success:function(result){
        //result
        showToast('success',"tsne获取成功");
        tsneData=result;
        //tsenRefreshData(result);
        otherGraph_g.new('t-sne',tsneData)
    }});
}

function redraw_tsne(para){
    //para={ $selector,data}
    var data=para.data;
    var tsneScatter = echarts.getInstanceByDom(para.$selector[0]);
    if(!tsneScatter)  //不存在
    {
        tsneScatter=echarts.init(para.$selector[0],'mySubject',{width:para.$selector.width(),height:para.$selector.height()});
    }
    var tsneOption = {
        /* backgroundColor: new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [{
            offset: 0,
            color: '#f7f8fa'
        }, {
            offset: 1,
            color: '#cdd0d5'
        }]), */
        title: {
            text: 't-SNE'
        },
        grid:{
            bottom:'10%',
            backgroundColor:"#fff",
        },
        tooltip: {
            axisPointer: {
                type: 'cross'
            }
        },
        toolbox: {
            itemSize:15,
            right:15,
            feature: {
                myTool1: {
                    show: true,
                    title:'获取tsne图',
                    //icon: 'image://http://echarts.baidu.com/images/favicon.png',
                    icon: 'path://M512 960c-278.748 0-505.458-222.762-511.848-499.974 5.92 241.864 189.832 435.974 415.848 435.974 229.75 0 416-200.576 416-448 0-53.020 42.98-96 96-96s96 42.98 96 96c0 282.77-229.23 512-512 512zM512-64c278.748 0 505.458 222.762 511.848 499.974-5.92-241.864-189.832-435.974-415.848-435.974-229.75 0-416 200.576-416 448 0 53.020-42.98 96-96 96s-96-42.98-96-96c0-282.77 229.23-512 512-512z',
                    onclick: function (){
                        showToast('info',"tsne图计算中。。。");
                        $.ajax({url:mylocalURL+"getTSNE",type: "POST",data:{"galleryIndex":0,"perplexity": 50},success:function(result){
                            //result
                            showToast('success',"tsne获取成功");
                            tsneData=result;
                            //tsenRefreshData(result);
                            redraw_tsne({ $selector:para.$selector,data:result});
                        }});
                    }
                }
            }
        },
        brush: {
            toolbox: ['rect', 'polygon', 'keep', 'clear'],
            xAxisIndex: 0,
            throttleType:'debounce',
            throttleDelay:1000,
        },
        legend: {
            top: 22,
            right: 10,
        },
        xAxis: {
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        yAxis: {
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            },
            scale: true
        },
        series: [],
    };

    for (i in data){
        tsneOption.series.push(
            {
                name: i,
                data: data[i],
                type: 'scatter',
                symbolSize:5,
                tooltip: {
                    formatter: function (param) {
                        return [
                            'dataName: ' + param.data[2],
                        ].join('<br/>')
                    }
                },
                label: {
                    emphasis: {
                        show: false,
                        // formatter: function (param) {
                        //     return [
                        //         'dataName: ' + param.data[2],
                        //         'class: ' + param.data,
                        //     ].join('<br/>')
                        //     //return param.data[0].toFixed(2)+','+param.data[1].toFixed(2);
                        // },
                        // position: 'top'
                    }
                },
                itemStyle: {
                    normal: {
                        shadowBlur: 5,
                        shadowColor: 'rgba(120, 36, 50, 0.5)',
                        shadowOffsetY: 3,
                        /*  color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                             offset: 0,
                             color: 'rgb(251, 118, 123)'
                         }, {
                             offset: 1,
                             color: 'rgb(204, 46, 72)'
                         }]) */
                    }
                }
            }
        );

    }
    tsneScatter.setOption(tsneOption, true);


    tsneScatter.on('brushSelected', function (params) {
        if(params.batch[0]['areas'].length==0){return;}
        var array=params.batch[0]['selected'];
        //array[0]["dataIndex"]=arr
        var dataIdList=[];
        for (i in array){
            for(j in array[i]["dataIndex"])
            {
                dataIdList.push(tsneData[ array[i]['seriesName'] ][array[i]["dataIndex"][j]][3]);
            }
        }
        if (dataIdList.length==0) return;
        //alert("相关数据计算中。。。");
        showToast('warning',"相关数据计算中。。。");
        $.ajax({url:mylocalURL+"getIdList",type: "POST",data:{ 'idList':JSON.stringify(dataIdList), "galleryIndex":0},success:function(result){
            showToast('success',"计算完毕");
            main_deepRedraw();
        }});

    });

}
function tsne_size_update(){
    // tsneScatter.resize({height:700,width:700});
    //getTabs2ActiveID();
    // tsneScatter.resize({width:$(tabs2ActiveID).width(),height:500});
}





function tsenRefreshData(data){

}




