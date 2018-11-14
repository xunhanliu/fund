var color20 = d3.scale.category20();

var myColorScheme={
    diff:{
        color:color20,
    },
    active:{
        color:function(d){  //暂时使用node.group
            if(d==myColorScheme.active.lastActiveName)
            {
                return "#d60"
            }
            else {
                return "#999"
            }
        },
        lastActiveName:0,//使用node.group
    },
    cluster:{  //还未完善
        color:color20,
    },
    scheme:"diff",
};

//myColorScheme[myColorScheme.scheme].color(d)
//myColorScheme.active.lastActiveName=d.group
//**************************************
//填充bzSample
function bzGetSample(num,ps){ //ps是两个点的数组
    var t=0;
    var interval=1/num;
    var mp=[];
    while(t<=1)
    {
        var p0={x:0,y:0};
        var p3={x:1,y:1};
        var p1=ps[0];//控制点1
        var p2=ps[1];//控制点2
        var point = {x:0,y:0};
        var temp = 1 - t;
        point.x = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
        point.y = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
        mp.push( point);
        t+=interval;
    }
    return mp;
}

var bzSample={
    opacity:[],
    thickness:[],
    distance:[],
    opacityBzPoints:[{x:0.505,y:0},{x:0.525,y:0.425}],
    thicknessBzPoints:[{x:0.45,y:0.055},{x:0.590,y:0.405}],
    distanceBzPoints:[{x:0.805, y:0.085},{x:0.485, y: 0.965}],
};


bzSample.opacity=bzGetSample(100,bzSample.opacityBzPoints);
bzSample.thickness=bzGetSample(100,bzSample.thicknessBzPoints);
bzSample.distance=bzGetSample(100,bzSample.distanceBzPoints);

function bzMap(whichStr,x) {  //返回相应点的映射
    //查找字符串 bzSample[whichStr],取距离最近的点，并输出其y值，注意，数组已经进行了排序（x ,y）都是递增
    var l=0,r=bzSample[whichStr].length-1;
    var mid=Math.floor ((l+r)/2);
    if(bzSample[whichStr][l].x>=x) {
        return  bzSample[whichStr][l].y;
    }
    else if(bzSample[whichStr][r].x<=x) {
        return bzSample[whichStr][r].y;
    }
    while(r>=l){
        if(bzSample[whichStr][mid].x==x)  //几乎不存在
            return  bzSample[whichStr][mid].y;
        else if(bzSample[whichStr][mid].x<x){
            if(bzSample[whichStr][mid+1].x>=x) {
                //返回中值
                return  (bzSample[whichStr][mid].y+bzSample[whichStr][mid+1].y)/2;
            }
            l=mid+1;
            mid=Math.floor ((l+r)/2);
        }
        else if(bzSample[whichStr][mid].x>x){
            if(bzSample[whichStr][mid-1].x<=x) {
                //返回中值
                return  (bzSample[whichStr][mid].y+bzSample[whichStr][mid-1].y)/2;
            }
            r=mid-1;
            mid=Math.floor ((l+r)/2);
        }
    }
}
//



//三大映射之opacity ,修改colorMap函数


var colorMap =function(d){
    var myMap=d3.scale.linear()
        .domain([-1, 0, 1])
        .range(["red", "white", "green"]);
    if(d>=0){
        return myMap(bzMap("opacity",d));
    }else{
        return myMap(0-bzMap("opacity",0-d));
    }

}
var opacityMap =function(d){
        return bzMap("opacity",Math.abs(d));
}
var colorMapCooperateOpacity =function(d){
    if(d>=0){
        return "#080";
    }
    else{
        return "#c00";
    }
}

var lineWidthMap=function(d){  //1-5
    var myMap=d3.scale.linear()
        .domain([0, 1])
        .range([1, 5]);
    return myMap(bzMap("thickness",d));
}
