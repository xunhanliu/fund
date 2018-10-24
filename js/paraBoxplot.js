var paraChart = echarts.init(document.getElementById("paraGraph"));
var paraData = echarts.dataTool.prepareBoxplotData([
    [850, 740, 900, 1070, 930, 850, 950, 980, 980, 880, 1000, 980, 930, 650, 760, 810, 1000, 1000, 960, 960],
    [960, 940, 960, 940, 880, 800, 850, 880, 900, 840, 830, 790, 810, 880, 880, 830, 800, 790, 760, 800],

]);
var paraOption={};
function ParaChart_size_update(){
    paraChart.resize({width:$("#paraGraph").width()});
}
function refrshParaChart(data){
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
    paraData = echarts.dataTool.prepareBoxplotData([databuf1,databuf2]);
    paraOption = {
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

if (paraOption && typeof paraOption === "object") {
    paraChart.setOption(paraOption, true);
}