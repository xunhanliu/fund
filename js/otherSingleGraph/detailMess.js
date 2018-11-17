var detailMess={
    $detailMess:$("#myMiddleTabCon1"),

    itemAllowDrop: function (ev) {
        ev.preventDefault();
    },

    itemDragenter: function (ev) {  //对其本身会执行一次enter leave

    },
    itemDragleave: function (ev) {

    },

    itemDrop: function (ev) {
        galleryDrag.itemDragend();  //修改拖动元素的transform 和透明度
        //删空
        detailMess.itemDragleave(ev);
        //判断是否可以放置，只允许gallery_item来放置
        if(galleryDrag.dragType=="group")
        {return;}
        //清空目标区域，并在gallery处理完之后，append
        detailMess.$detailMess.children().remove();

        var parent=galleryDrag.dragEle.parentNode;
        var parentData=parent.dataset["group"];
        detailMess.$detailMess[0].appendChild(galleryDrag.dragEle);
        gallery.itemNum-=1;
        if(parent.children.length==1){
            $(parent).remove();
            gallery.groupNum-=1;
        }
        updateGalleryInnerWidth();
        //先把 gallery_item 的外框缩放，
        var $moveGallery_item=detailMess.$detailMess.find(".gallery_item")
        $moveGallery_item.outerWidth(detailMess.$detailMess.width()-gallery.item.margin.left-gallery.item.margin.right)
            .outerHeight(detailMess.$detailMess.height()-gallery.item.margin.top-gallery.item.margin.bottom);
        resize_echarts({$selector:$moveGallery_item});
        if(parentData=="nodeDetail") //nodeDetail需要重绘svg
        {
            nodeDetail_g_resize($moveGallery_item[0]);
        }
        $moveGallery_item.find(".close").remove();
        $moveGallery_item.append('<button type="button" class="close" onclick="detailMess.delete_g(event)" style="z-index: 100;position: absolute;\n' +
            '  right: 5px;top: 0px;">×</button>');
    },
    delete_g:function(ev){
        $(ev.target.parentNode).remove();
    }
};


(function () {
    var attr={
        // draggable:"true",
        // ondragstart: "detailMess.itemDragstart(event)",
        // ondragend:"detailMess.itemDragend(event)",
        // ondrag: "detailMess.itemDrag(event)",
        ondragover: "detailMess.itemAllowDrop(event)",
        ondragenter: "detailMess.itemDragenter(event)",
        ondragleave: "detailMess.itemDragleave(event)",
        ondrop: "detailMess.itemDrop(event)",
    };
    for(var i in attr){
        detailMess.$detailMess.attr(i,attr[i]);
    }
})();

