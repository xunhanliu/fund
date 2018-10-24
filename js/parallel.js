getTabs1ActiveID();
var parallel_width= Math.floor( $(tabs1ActiveID).width());
var parallel_height=Math.floor( $(tabs1ActiveID).height()*0.8);

var parallel_table_width= Math.floor( $(tabs1ActiveID).width());
var parallel_table_height= Math.floor( $(tabs1ActiveID).height()*0.2);
var blue_to_brown = d3.scale.linear()
    .domain([9, 50])
    .range(["steelblue", "brown"])
    .interpolate(d3.interpolateLab);

var parallel_color = function(d) { return blue_to_brown(d['economy (mpg)']); };
var example_color = function(d) { return blue_to_brown(d['A']); };
var parcoords = d3.parcoords()("#parallel")
    .color(parallel_color)
    .alpha(0.4)
    .mode("queue")
    .height(parallel_height)
    .width(parallel_width)
    .margin({ top: 40, left: 5, bottom: 12, right: 5 })
;
function externalRefreshParallel(){
    showToast('info',"数据获取中。。。");
    $.ajax({url:mylocalURL+"parallelData",type: "POST",data:{ "galleryIndex":0},success:function(data){
        showToast('success',"获取成功");
        parcoords
            .data(data)
            .hideAxis(["name"])
            .color(example_color)
            .alpha(0.4)
            .render()
            .reorderable()
            .brushMode("1D-axes");  // enable brushing

        //create data table, row hover highlighting
        var parallelTable = d3.divgrid()
        ;
        d3.select("#parallel_table")
            .attr("width",parallel_table_width)
            .datum(data.slice(0,10))
            .call(parallelTable)
            .selectAll(".row")
            .on({
                "mouseover": function(d) { parcoords.highlight([d]) },
                "mouseout": parcoords.unhighlight
            });

// update data table on brush event
        parcoords.on("brush", function(d) {
            d3.select("#parallel_table")
                .datum(d.slice(0,10))
                .call(parallelTable)
                .selectAll(".row")
                .on({
                    "mouseover": function(d) { parcoords.highlight([d]) },
                    "mouseout": parcoords.unhighlight
                });
        });

        var column_keys = d3.keys(data[0]);//注意把隐藏的轴删掉
        freshParallelGUI(column_keys);
    }});
}
// load csv file and create the chart
d3.csv('myData/cars.csv', function(data) {
    parcoords
        .data(data)
        .hideAxis(["name"])
        .render()
        .reorderable()
        .brushMode("1D-axes");  // enable brushing

    //create data table, row hover highlighting
    var parallelTable = d3.divgrid()
    ;
    d3.select("#parallel_table")
        .attr("width",parallel_table_width)
        .datum(data.slice(0,10))
        .call(parallelTable)
        .selectAll(".row")
        .on({
            "mouseover": function(d) { parcoords.highlight([d]) },
            "mouseout": parcoords.unhighlight
        });

// update data table on brush event
    parcoords.on("brush", function(d) {
        d3.select("#parallel_table")
            .datum(d.slice(0,10))
            .call(parallelTable)
            .selectAll(".row")
            .on({
                "mouseover": function(d) { parcoords.highlight([d]) },
                "mouseout": parcoords.unhighlight
            });
    });

    var column_keys = d3.keys(data[0]);//注意把隐藏的轴删掉

    freshParallelGUI(delListSpacialValue(column_keys,"name"));

});

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
    getTabs1ActiveID();
    parcoords.width(Math.floor( $(tabs1ActiveID).width()));
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
        top: 0,
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
}

var paralle_onChange={


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
        externalRefreshParallel();
    }
}


