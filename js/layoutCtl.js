//调整层级
$(".bottom-gallery").click(function(){
    $(".bottom-gallery").css("z-index",1001);
});

$(".middle").click(function(){
    $(".bottom-gallery").css("z-index",0);
});

