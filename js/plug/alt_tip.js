$(document).ready(function(){

    $('.tip').mouseover(function(target)
    {
        if(!target){return;}
        if(!$(target.target).attr("alt")){
            return;
        }
        layui.use('form', function () {
            var layer = layui.layer;
            layer.tips($(target.target).attr("alt"), target.target,{time:1000});
        });
    });

});

