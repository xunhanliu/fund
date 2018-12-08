//平行轴
$("#parallel").contextmenu(function()
{
    str='<pre>'+'Interaction:' +'<br>'+
        '&#9;'+'Lable: '+"<br>"+
        '&#9;&#9;'+ '"onwheel": adjust the Angle of the lable;' +'<br>'+
        '&#9;&#9;'+ '"dbclick": change the sorting way;'+'<br>'+
        '&#9;'+'Axis: '+"<br>"+
        '&#9;&#9;'+ '"drag": sort the axis(note to drag the lable on the axis);' +'<br>'+
        '&#9;&#9;'+ '"Brush": brush the data;'+'<br>'+
        '</pre>';


    layui.use('form', function () {
        var layer = layui.layer;
        layer.alert(str, {
            skin: 'layui-layer-info' //样式类名
            ,closeBtn: 0,
            area: '500px',
            title:"operation instructs"
        })
    });


});

//相关矩阵
$("#orderRelationMatrix").contextmenu(function()
{
    str='<pre>'+'Interaction:' +'<br>'+
        '&#9;'+'cell: '+"<br>"+
        '&#9;&#9;'+ '"drag": manual sorting;' +'<br>'+
        '&#9;&#9;'+ '"hover": display relevant information;'+'<br>'+
        '</pre>';


    layui.use('form', function () {
        var layer = layui.layer;
        layer.alert(str, {
            skin: 'layui-layer-info' //样式类名
            ,closeBtn: 0,
            area: '500px',
            title:"operation instructs"
        })
    });


});
//主图
$("#mainGraph").contextmenu(function()
{
    str='<pre>'+'Operation:' +'<br>'+
        '&#9;'+'Use the scroll wheel to zoom'+"<br>"+
        '&#9;'+'Hold the shift key to select nodes'+"<br>"+
        'Interaction:' +'<br>'+
        '&#9;'+'circle: '+"<br>"+
        '&#9;&#9;'+ '"dbclick": look at the distribution of the dimension;' +'<br>'+
        '&#9;&#9;'+ '"Right click": do something with the dimension;'+'<br>'+
        '&#9;'+'line: '+"<br>"+
        '&#9;&#9;'+ '"click": Look at the corresponding scatter of the two dimensions;' +'<br>'+
        '&#9;&#9;'+ '"Right click": do something with the line;'+'<br>'+
        '</pre>';


    layui.use('form', function () {
        var layer = layui.layer;
        layer.alert(str, {
            skin: 'layui-layer-info' //样式类名
            ,closeBtn: 0,
            area: '500px',
            title:"operation instructs"
        })
    });


});

function galleryInfo(){
    str='<pre>'+'Operation:' +'<br>'+
        '&#9;'+'gallery'+"<br>"+
        'Interaction:' +'<br>'+
        '&#9;'+'circle: '+"<br>"+
        '&#9;&#9;'+ '"dbclick": gallery;' +'<br>'+
        '</pre>';


    layui.use('form', function () {
        var layer = layui.layer;
        layer.alert(str, {
            skin: 'layui-layer-info' //样式类名
            ,closeBtn: 0,
            area: '500px',
            title:"operation instructs"
        })
    });
}