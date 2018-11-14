gallery['new']=function(groupId,title="",otherCtlHtml,attr=""){
    //attr 是个字典,
    //返回创建的ele
    if(title==""){
        title=groupId;
    }
    var isNewGroup=0;
    if(!$("#"+groupId).length){  //空
        $("#galleryInner").prepend('<div id="'+groupId+'" class="gallery_group" data-group="'+groupId+'">\n' +
            '                <div class="gallery_item" '+(attr?"data-index="+attr["data-index"]:"")+'></div>\n' +
            '<div class="gallery_group_head" ><div class="gallery_group_title">'+title+'</div>' +
            (otherCtlHtml? otherCtlHtml:'')+
            ' </div>'+

            '            </div>');  //子元素添加
        gallery.itemNum+=1;
        gallery.groupNum+=1;
        isNewGroup=1;
    }
    else{
        $("#"+groupId).prepend('<div class="gallery_item" '+(attr?"data-index="+attr["data-index"]:"")+'></div>');
        gallery.itemNum+=1;
    }
    //更新gallery的宽度
    updateGalleryInnerWidth();
    while($(".gallery_item").length!=gallery.itemNum){};
    //对新元素进行css attr 设置


    var $groupId=$("#"+groupId);
    for (i in attr){
        $groupId.attr(i,attr[i]);
    }
    attr={
        draggable:"true",
        ondragstart: "galleryDrag.itemDragstart(event)",
        ondragend:"galleryDrag.itemDragend(event)",
        ondrag: "galleryDrag.itemDrag(event)",
        ondragover: "galleryDrag.itemAllowDrop(event)",
        ondragenter: "galleryDrag.itemDragenter(event)",
        ondragleave: "galleryDrag.itemDragleave(event)",
        ondrop: "galleryDrag.itemDrop(event)",
    };
    if(isNewGroup){  //加入了新group
        var group=gallery.group
        $groupId[0].style.margin="0  " + group.margin.right + "px " + "0 " + group.margin.left + "px ";
        $groupId[0].style.paddingLeft=group.margin.padding_left + "px";
        for (i in attr){
            $groupId.attr(i,attr[i]);
        }

    }
    var newEle=$groupId[0].firstElementChild;
    var item=gallery.item, itemMargin=gallery.item.margin;
    $(newEle).css("margin", itemMargin.top + "px " + itemMargin.right + "px " + itemMargin.bottom + "px " + itemMargin.left + "px ")
        .css("padding", item.padding + "px").css("border-width", item.borderWidth)
        .height(item.height).width(item.height);
    for (i in attr){
        $(newEle).attr(i,attr[i]);
    }
    return newEle;
}
gallery["delete"]=function(ele){  //group 或者item
    var find=findEleAType(ele);
    if(find ==-1){
        console.error("del error");
        return;
    }
    if(find[1]=="item")
    {
        var parent=find[0].parentNode;
        $(find[0]).remove()
        gallery.itemNum-=1;
        if(parent.children.length==1){
            $(parent).remove();
            gallery.groupNum-=1;
        }

    } else{ //删的是整个group
        var delItemNum=find[0].children.length-1;
        $(find[0]).remove();
        gallery.groupNum-=1;
        gallery.itemNum-=delItemNum;
    }
    updateGalleryInnerWidth();
}





var galleryDrag = {
    dragType: "item", //group
    groupName: null,
    dragEle: null,
    lastMousePos: [],
    itemDragstart: function (ev) {
        var ele = ev.target;
        galleryDrag.lastMousePos = [ev.screenX, ev.screenX];
        var find = findEleAType(ele);
        if (find == -1) {
            console.error("itemDragstart  error");
            return;
        }
        galleryDrag.dragType = find[1];
        galleryDrag.dragEle = find[0];
        galleryDrag.groupName = find[2];
        ele.style.opacity = "0.5 !important";
    },
    itemDrag: function (ev) {
        galleryDrag.dragEle.style.transform = "translate(" + (ev.screenX - galleryDrag.lastMousePos[0]) + "px," + (ev.screenY - galleryDrag.lastMousePos[1]) + "px)"

    },
    // 当放置与不可放置的位置的时候，会触发end ,反之会触发drop, 二者只能触发一个
    itemDragend: function (ev) //用于被拖动元素放置失败
    {
        galleryDrag.dragEle.style.opacity = 1;
        galleryDrag.dragEle.style.transform = "translate(0,0)"
    },


    itemAllowDrop: function (ev) {
        ev.preventDefault();
    },


    itemDragenter: function (ev) {  //对其本身会执行一次enter leave
        //判断同级
        if (ev.target == galleryDrag.dragEle) return;
        var find = findEleAType(ev.target);
        if (moveCase(find) == -1) return;

        var emptyWidth = $(galleryDrag.dragEle).width();
        var emptyHeight = gallery.item.height;

        //在它后面添加一个空元素
        var itemMargin = gallery.item.margin;

        var margin = itemMargin.top + "px " + itemMargin.right + "px " + itemMargin.bottom + "px " + itemMargin.left + "px ";


        var nextNode = find[0].nextElementSibling;
        if (nextNode) {
            if (!$(nextNode).hasClass("gallery_empty")) {
                $('<div class="gallery_item gallery_empty" style="width:' + emptyWidth + 'px' + ';height:' + emptyHeight + 'px' + ' ;margin:' + margin + '"></div>').insertAfter(find[0]);
            }
        }
        else {
            $('<div class="gallery_item gallery_empty" style="width:' + emptyWidth + 'px' + ';height:' + emptyHeight + 'px' + ' ;margin:' + margin + '"></div>').insertAfter(find[0]);
        }

    },
    itemDragleave: function (ev) {
        if (ev.target == galleryDrag.dragEle) return;

        var find = findEleAType(ev.target);
        if (moveCase(find) == -1) return;
        var nextNode = find[0].nextElementSibling;
        if (nextNode) {
            if ($(nextNode).hasClass("gallery_empty")) {
                $(nextNode).remove();
            }
        }
    },

    itemDrop: function (ev) {
        galleryDrag.itemDragend();
        //删空
        galleryDrag.itemDragleave(ev);
        var find = findEleAType(ev.target);
        if (moveCase(find) == -1) return;
        //append
        insertAfter(galleryDrag.dragEle, find[0]);
    }
};


(function () {

    var item = gallery.item;
    item.height = gallery.height - item.margin.top - item.margin.bottom - item.padding * 2 - item.borderWidth * 2;
    var group = gallery.group;
    var itemMargin = gallery.item.margin;
    $(".gallery").height(gallery.height + scrobarSize);
    updateGalleryInnerWidth();
    $(".gallery_item").css("margin", itemMargin.top + "px " + itemMargin.right + "px " + itemMargin.bottom + "px " + itemMargin.left + "px ")
        .css("padding", item.padding + "px").css("border-width", item.borderWidth)
        .height(item.height).width(item.height);
    $(".gallery_group").css("margin", "0  " + group.margin.right + "px " + "0 " + group.margin.left + "px ")
        .css("padding-left", group.margin.padding_left + "px");
})();
//以上是初始化部分

function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (targetElement.nextElementSibling) {  //nextSibling   nextElementSibling
        parent.insertBefore(newElement, targetElement.nextElementSibling)
    } else {
        parent.appendChild(newElement)
    }
}

function updateGalleryInnerWidth() {
    var groupMargin = gallery.group.margin;
    var len = gallery.height * gallery.itemNum + gallery.groupNum * (groupMargin.left + groupMargin.right + gallery.group.padding_left);
    $("#galleryInner").width(len+ gallery.height*2);
}

document.getElementById("zoomCtl").onmousemove = function (e) {
    if (e.buttons !== 1) {                               // 当鼠标没有按下则不走方法
        //恢复大小
        e.target.style.transform = "scale(1)"
        return;
    } else {  //上下移动
        //对控制点进行放大
        e.target.style.transform = "scale(3)"
        //#galleryOuter top
        //.gallery   height
        var $galleryOuter = $("#galleryOuter"), $gallery = $(".gallery");
        var top = parseFloat($galleryOuter.css("top"));
        var height = $gallery.height();
        var newGalleryHeight = height - e.movementY

        if (newGalleryHeight <= gallery.maxHeight && newGalleryHeight >= gallery.minHeight) {
            $galleryOuter.css("top", (top + e.movementY) + "px");
            $gallery.height(newGalleryHeight);
            gallery.height = newGalleryHeight;
            var item = gallery.item;
            item.height = gallery.height - item.margin.top - item.margin.bottom - item.padding * 2 - item.borderWidth * 2 - scrobarSize;
            $(".gallery_item").height(item.height).width(item.height);
            updateGalleryInnerWidth();
            gallery_resize();
        }
    }
};

$(".gallery_item")
    .attr("draggable", "true")
    .attr("ondragstart", "galleryDrag.itemDragstart(event)")
    .attr("ondragend", "galleryDrag.itemDragend(event)")
    .attr("ondrag", "galleryDrag.itemDrag(event)")

    .attr("ondragover", "galleryDrag.itemAllowDrop(event)")
    .attr("ondragenter", "galleryDrag.itemDragenter(event)")
    .attr("ondragleave", "galleryDrag.itemDragleave(event)")
    .attr("ondrop", "galleryDrag.itemDrop(event)")
;
$(".gallery_group")
    .attr("draggable", "true")
    .attr("ondragstart", "galleryDrag.itemDragstart(event)")
    .attr("ondragend", "galleryDrag.itemDragend(event)")
    .attr("ondrag", "galleryDrag.itemDrag(event)")

    .attr("ondragover", "galleryDrag.itemAllowDrop(event)")
    .attr("ondragenter", "galleryDrag.itemDragenter(event)")
    .attr("ondragleave", "galleryDrag.itemDragleave(event)")
    .attr("ondrop", "galleryDrag.itemDrop(event)")
;


function findEleAType(ele) {
    while (!$(ele).hasClass("gallery_item") && !$(ele).hasClass("gallery_group")) {
        ele = ele.parentNode;
        if (!ele) {
            console.error("findEleAType  Null");
            return -1;
        }
    }
    //找到
    var type = "";
    var groupName = "";
    if ($(ele).hasClass("gallery_item")) {

        type = 'item';
        groupName = ele.parentNode.dataset["group"];
        if (!groupName) {
            type = 'group';
        }
    } else {
        type = 'group';
        groupName = $(ele).data();
    }
    return [ele, type, groupName];
}

function isSameGroup(e1, e2) {
    while (!$(e1).hasClass("gallery_group") && !$(e1).hasClass("gallery_item")) {
        e1 = e1.parentNode;
        if (!e1) {
            console.error("isSameGroup e1  Null");
            return -1;
        }
    }
    if ($(e1).hasClass("gallery_item")) {
        e1 = e1.parentNode;
    }
    while (!$(e2).hasClass("gallery_group") && !$(e2).hasClass("gallery_item")) {
        e2 = e2.parentNode;
        if (!e2) {
            console.error("isSameGroup e2 Null");
            return -1;
        }
    }
    if ($(e2).hasClass("gallery_item")) {
        e2 = e2.parentNode;
    }
    if (e1.dataset["group"] == e2.dataset["group"]) {
        return true;
    } else {
        return false;
    }
}

function moveCase(find) {
    if (isSameGroup(galleryDrag.dragEle, find[0])) {  //类内移动  元素到元素 ，元素到group
        if ($(find[0]).hasClass("gallery_group"))  //元素到group
        {
            //console.log("元素到group。不绘制");
            return -1;
        }
        //console.log("元素到元素。绘制;" + find[1]);

    } else {
        //类间移动  元素到元素  元素到类  类到元素 不绘制

        //类间移动    类到类 绘制
        if (find[1] == "group" && galleryDrag.dragType == "group") {
            // console.log("类与类。绘制")
        } else {
            //console.log("类间。不绘制")
            return -1;
        }
    }
    return 0;
}
