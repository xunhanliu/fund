//getTabs1ActiveID();
// var parallel_width= Math.floor( $("#parallel").width());
// var parallel_height=Math.floor( $("#parallel").height());

var parallel_width= Math.floor($("#myMiddleTabCon").find(".active").width());
var parallel_height= Math.floor($("#myMiddleTabCon").find(".active").height());
// var blue_to_brown = d3.scale.linear()
//     .domain([9, 50])
//     .range(["steelblue", "brown"])
//     .interpolate(d3.interpolateLab);
// //d3v4.interpolatePlasma(0)
// var parallel_color = function(d) { return blue_to_brown(d['economy (mpg)']); };
// var example_color = function(d) { return blue_to_brown(d['A']); };
var parcoords = d3.parcoords()("#parallel")
    //.color(parallel_color)
    .alpha(0.4)
    .mode("queue")
    .height(parallel_height)
    .width(parallel_width)
    .margin({ top: 40, left: 10, bottom: 40, right: 5 })
;
function externalRefreshParallel(flag){
    showToast('info',"calculating...");
    $.ajax({url:mylocalURL+"parallelData",type: "POST",data:{ "galleryIndex":0,parallelPara:JSON.stringify({"perplexity": 50,nameList:(flag=="all"?[]:selectPoint)})},success:function(data){
        showToast('success',"calculating success");
        FireEvent(document.getElementById('parallelBtn'), 'click');
        parcoords
            .data(data)
            .dimensions(d3.keys(data[0]))
           // .hideAxis(["name"])
            //.color(example_color)
            .composite("darken")
            .alpha(0.4)
            .reorderable()
            .render()
            .updateAxes()
            .brushMode("1D-axes");  // enable brushing
        var column_keys = d3.keys(data[0]);//注意把隐藏的轴删掉
        freshParallelGUI(column_keys);

        change_color(column_keys[0]);
        parcoords.svg.selectAll(".dimension")
            .on("click", change_color)
            .selectAll(".label")
            .style("font-size", "14px");
    }});
}
// load csv file and create the chart
d3.csv('./data/cars.csv', function(data) {
    parcoords
        .data(data)
        .hideAxis(["name"])
        .composite("darken")
        .render()
        .reorderable()
        .createAxes()
        .brushMode("1D-axes");  // enable brushing


    var column_keys = d3.keys(data[0]);//注意把隐藏的轴删掉
    column_keys=delListSpacialValue(column_keys,"name");
    freshParallelGUI(column_keys);

    change_color(column_keys[0]);
    parcoords.svg.selectAll(".dimension")
        .on("click", change_color)
        .selectAll(".label")
        .style("font-size", "14px");

});

//color
// var zcolorscale = d3.scale.linear()
//     .domain([-2,-0.5,0.5,2])
//     .range(["brown", "#999", "#999", "steelblue"])
//     .interpolate(d3.interpolateLab);


//  var colorInterpolateNum= d3.scale.linear()
//     .domain([-2,2])
//     .range([0,cc.length-1]);
//
// var zcolorscale=function(d){
//     //return d3v4.interpolatePlasma(colorInterpolateNum(d));
//
//    //  var a=colorInterpolateNum(d)%16
//    //  if(a<0){
//    //      return cc[Math.floor(-a)];
//    //  }
//    //  return cc[Math.floor(a)];
// }

 var zcolorscale = d3.scale.linear()
        .domain([-2,0, 2])
        .range([colorMapCooperateOpacity(-1),'white',colorMapCooperateOpacity(1)])
        .interpolate(d3.interpolateLab);

function change_color(dimension) {
    parcoords.svg.selectAll(".dimension")
        .style("font-weight", "normal")
        .filter(function(d) { return d == dimension; })
        .style("font-weight", "bold")

    parcoords.color(zcolor(parcoords.data(),dimension)).render()
}

// return color function based on plot and dimension
function zcolor(col, dimension) {
    var z = zscore(_(col).pluck(dimension).map(parseFloat).filter(function(value) { return !Number.isNaN(value) }))
    return function(d) { return zcolorscale(z(d[dimension])) }
};

// color by zscore
function zscore(col) {
    var n = col.length,
        mean = _(col).mean(),
        sigma = _(col).stdDeviation();
    return function(d) {
        return (d-mean)/sigma;
    };
};

function delListSpacialValue(slist,value){
    for (var i in slist){
        if(slist[i]==value)
        {
            slist.splice(i,1);
            return slist;
        }
    }
    return slist;
}
function parallel_size_update() {
    //getTabs1ActiveID();
    parcoords.width(Math.floor( $("#parallel").width()));
    parcoords.resize();
    parcoords.render()
        .brushMode("1D-axes");
}




var app_parallel = {};

app_parallel.config = {
    folder:[{
        name:"bundling",
        content:{bd_dimension:"",
            bd_strength:0.5, //[0,1]
        }
    },{
        name:"brush",
        content:{
            brushMode:"1D-axes",//parcoords.brushModes()
            brushPredicate:"AND"//AND OR
        }
    }],
    smoothness:0.1,//[0,1]
    getParaData:function(){},
    onChange: function () {
    }
};

var gui_parallel={};
function freshParallelGUI(keyList)
{
    if (gui_parallel) {
        $(gui_parallel.domElement).remove();
        // gui_parallel.destroy();
        gui_parallel = null;
    }

    gui_parallel = new dat.GUI({
        autoPlace: false
    });

    $(gui_parallel.domElement).css({
        position: 'absolute',
        right: 5,
        color:"red",
        zIndex: 1000
    });
    $("#parallel").append(gui_parallel.domElement);
    var controller;
    controller = gui_parallel.add(app_parallel.config, "getParaData");
    controller.onFinishChange(paralle_onFinishChange.getParaData);
    controller = gui_parallel.add(app_parallel.config, "smoothness", 0, 1).step(0.1);
    controller.onFinishChange(paralle_onFinishChange.changeSmooth);
    var Folder=app_parallel.config.folder;
    var f = gui_parallel.addFolder('bundling');
    controller=f.add(Folder[0]["content"], "bd_dimension", keyList);
    controller.onFinishChange(paralle_onFinishChange.changeBundling);
    controller=f.add(Folder[0]["content"], "bd_strength", 0, 1).step(0.1);
    controller.onFinishChange(paralle_onFinishChange.changeBundling);
    f.open();
    f = gui_parallel.addFolder('brush');
    controller=f.add(Folder[1]["content"], "brushMode", parcoords.brushModes());
    controller.onFinishChange(paralle_onFinishChange.changeBrush);
    controller=f.add(Folder[1]["content"], "brushPredicate",["AND","OR"]);
    controller.onFinishChange(paralle_onFinishChange.changeBrush);
    f.open();
    gui_parallel.close();
}

var paralle_onFinishChange={
    changeSmooth: function (value) {
        parcoords.smoothness(value).render();
    },
    changeBundling:function (value) {
        if(typeof(value)=="number"){
            parcoords.bundlingStrength(value).render();
        }
        else{
            parcoords.bundleDimension(value);
            parcoords.bundlingStrength(app_parallel.config.folder[0].content.bd_strength).render();
        }
    },
    changeBrush:function (value) {
        if (value == "AND" || value == "OR") {
            parcoords.brushPredicate(value);
        }
        else {
            parcoords.brushMode(value);
        }
    },
    getParaData:function(){
        externalRefreshParallel('all');
    }
}


