function redraw_paraBoxplot(para) {
    //para={ $selector,data}
    var data=para.data;
    var paraChart = echarts.getInstanceByDom(para.$selector[0]);
    if(!paraChart)  //不存在
    {
        paraChart=echarts.init(para.$selector[0],'mySubject',{width:para.$selector.width(),height:para.$selector.height()});
    }
    var databuf1=[];
    var databuf2=[];
    for (var i=0;i<data['overlap'].length;i++ ) {
        for (var j = 0; j < i; j++) {
            databuf1.push(data['overlap'][i][j]);
        }
    }
    for (var i=0;i<data['relation'].length;i++ ){
        for (var j=0;j<i;j++ ){
            databuf2.push(data['relation'][i][j]);
        }
    }
    var paraData = echarts.dataTool.prepareBoxplotData([databuf1,databuf2]);
    var paraOption = {
        title: [
            {
                text: 'param',
                left: 'center',
            }
        ],
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%'
        },
        xAxis: {
            type: 'category',
            data: ["overlapParam","ralationPara"],
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
                show: false
            },
            splitLine: {
                show: true
            }
        },
        yAxis: {
            type: 'value',
            splitArea: {
                show: true
            }
        },
        series: [
            {
                name: 'boxplot',
                type: 'boxplot',
                data: paraData.boxData,
                tooltip: {
                    formatter: function (param) {
                        return [
                            'param: ' + param.name ,
                            'upper: ' + param.data[5],
                            'Q3: ' + param.data[4],
                            'median: ' + param.data[3],
                            'Q1: ' + param.data[2],
                            'lower: ' + param.data[1]
                        ].join('<br/>')
                    }
                }
            },
            {
                name: 'outlier',
                type: 'scatter',
                data: paraData.outliers
            }
        ]
    };;
    paraChart.setOption(paraOption, true);



}


function ParaChart_size_update(){
}
function refrshParaChart(data){

}
