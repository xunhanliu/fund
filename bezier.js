$("body").append('<div id="mainSet">\n' +
    '<span style="position: absolute;top:5px;right:5px; font-size: large;color: #f00; cursor:pointer " onclick="closeMainSet()">×</span>'+
    '<div class="btn-group mainSetItem" id="mapBtn">\
        <button type="button" class="btn btn-default active" onclick="mapBtnClick(event)">opacity</button>\
        <button type="button" class="btn btn-default" onclick="mapBtnClick(event)">thickness </button>\
        <button type="button" class="btn btn-default " onclick="mapBtnClick(event)">distance</button>\
    </div>\
    <hr>\
    '+
    '    <div id="funcOption">\n' +
    '        <label for="bzPresets"><span class="text">映射类型:</span>\n' +
    '            <select name="bzPresets" id="bzPresets" class="form-control input-sm">\n' +
    '                <optgroup label="常用">\n' +
    '                    <option value="0.250, 0.250, 0.750, 0.750" selected="">linear</option>\n' +
    '                    <option value="0.250, 0.100, 0.250, 1.000">ease (default)</option>\n' +
    '                    <option value="0.420, 0.000, 0.580, 1.000">ease-in-out</option>\n' +
    '                    <option value="0.550, 0.085, 0.680, 0.530">easeInQuad</option>\n' +
    '                    <option value="0.550, 0.055, 0.675, 0.190">easeInCubic</option>\n' +
    '                    <option value="0.895, 0.030, 0.685, 0.220">easeInQuart</option>\n' +
    '                    <option value="0.755, 0.050, 0.855, 0.060">easeInQuint</option>\n' +
    '                    <option value="0.600, 0.040, 0.980, 0.335">easeInCirc</option>\n' +
    '                    <option value="0.250, 0.460, 0.450, 0.940">easeOutQuad</option>\n' +
    '                    <option value="0.215, 0.610, 0.355, 1.000">easeOutCubic</option>\n' +
    '                    <option value="0.165, 0.840, 0.440, 1.000">easeOutQuart</option>\n' +
    '                    <option value="0.230, 1.000, 0.320, 1.000">easeOutQuint</option>\n' +
    '                    <option value="0.075, 0.820, 0.165, 1.000">easeOutCirc</option>\n' +
    '                    <option value="0.455, 0.030, 0.515, 0.955">easeInOutQuad</option>\n' +
    '                    <option value="0.645, 0.045, 0.355, 1.000">easeInOutCubic</option>\n' +
    '                    <option value="0.770, 0.000, 0.175, 1.000">easeInOutQuart</option>\n' +
    '                    <option value="0.860, 0.000, 0.070, 1.000">easeInOutQuint</option>\n' +
    '                    <option value="0.785, 0.135, 0.150, 0.860">easeInOutCirc</option>\n' +
    '                </optgroup>\n' +
    '                <optgroup label="自定义">\n' +
    '                    <option value="0.500, 0.250, 0.500, 0.750">自定义动画 (拖拽左边句柄)</option>\n' +
    '                </optgroup>\n' +
    '            </select>\n' +
    '        </label>\n' +
    '    </div>\n' +
    '    <div id="bzGraph">\n' +
    '        <figure>\n' +
    '            <canvas id="bzCurve" width="200" height="230"></canvas>\n' +
    '            <figcaption id="axisTime">opacity</figcaption>\n' +
    '            <figcaption id="axisAnimation">new Map</figcaption>\n' +
    '        </figure>\n' +
    '    </div> <hr>\n' +
    '</div>');
function closeMainSet(){
    $("#mainSet").slideUp(200);
}
function mapBtnClick(event){
    $("#mapBtn .btn").removeClass("active");
    $(event.target).addClass("active");
    $("#axisTime").text( $(event.target).text());

}

function mainSet(event){
    contextmenu("mainSet");
    event.cancelBubble = true;
}

var bzCanvas = document.getElementById('bzCurve'),
    ctx = bzCanvas.getContext('2d'),
    supportsTouch = ('createTouch' in document);

// bezier contructor
function BezierHandle(x, y) {
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 12;
}

BezierHandle.prototype = {

    // get the edges for easy grabby coordinates
    getSides : function() {
        this.left = this.x - (this.width / 2);
        this.right = this.left + this.width;
        this.top = this.y - (this.height / 2);
        this.bottom = this.top + this.height;
    },

    draw : function() {
        // figure out the edges
        this.getSides();
        ctx.fillStyle = "#222";
        ctx.fillRect(this.left, this.top, this.width, this.height);
    }

};


// make 2 new handles
var bzHandles = [
    new BezierHandle(50,50),
    new BezierHandle(150,180)
];

function BzGraph() {
    this.x = 0;
    this.y = 5;
    this.height = 200;
    this.width = 200;
}

BzGraph.prototype = {

    draw : function() {

        ctx.save();

        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // the 0.5 offset is to account for stroke width to make lines sharp
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + 0.5, this.y - 0.5, this.width - 1, this.height );

        ctx.restore();
    }

};

var bzGraph = new BzGraph();

// get the x and y pos, normalized by getOffset
function bzGetPos(event) {
    var mouseX = event.pageX - bzGetOffSet(event.target).left,
        mouseY = event.pageY - bzGetOffSet(event.target).top;

    return {
        x: mouseX,
        y: mouseY
    };
}

//from quirksmode.org. Modified slightly to return obj
function bzGetOffSet(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        }
        while (obj = obj.offsetParent);

        return {
            left: curleft,
            top: curtop
        };
    }
}


var bzDrag = false,
    bzDraggingObj,
    bzOldX,
    bzOldY;

function bzOnPress(event) {
    //console.log('press')

    // to get rid of text cursor
    event.preventDefault();
    event.stopPropagation(); //not sure if this is needed

    var cursorEvent = supportsTouch ? event.touches[0] : event;

    var mouseCoordinates = bzGetPos(cursorEvent),
        x = mouseCoordinates.x,
        y = mouseCoordinates.y;


    //check to see if over any bzHandles
    for (var i=0; i < bzHandles.length; i++) {
        var current = bzHandles[i],
            curLeft = current.left,
            curRight = current.right,
            curTop = current.top,
            curBottom = current.bottom;

        //20 px padding for chubby fingers
        if ( supportsTouch ) {
            curLeft -= 20;
            curRight += 20;
            curTop -= 20;
            curBottom += 20;
        }

        //console.log('current.x:',current.x, 'current.y:',current.y)
        if (x >= curLeft &&
            x <= curRight &&
            y >= curTop &&
            y <= curBottom
        ) {
            //over the current handle
            //console.log('over')
            //bzDrag = true;
            bzDraggingObj = current;
            bzOldX = event.pageX;
            bzOldY = event.pageY;

            var currentlySelected = $('#bzPresets option:selected');

            currentlySelected.removeAttr('selected')
                .parent().parent().find('option').last().attr('selected', 'selected');


            document.addEventListener('mouseup', bzOnRelease, false);
            document.addEventListener('touchend', bzTouchEnd, false);

            document.addEventListener('mousemove', bzOnMove, false);
            document.addEventListener('touchmove', bzTouchMove, false);


            // set move cursor
            document.body.style.cursor = bzCanvas.style.cursor = 'move';

        }
    }

}

function bzOnMove(event) {

    var cursorEvent = supportsTouch ? event.touches[0] : event;

    var x = cursorEvent.pageX - bzGetOffSet(bzCanvas).left,
        y = cursorEvent.pageY - bzGetOffSet(bzCanvas).top;

    if (x > bzGraph.width) {
        x = bzGraph.width;
    }
    if (x < 0) {
        x = 0;
    }
    if (y > bzGraph.y+bzGraph.height) {
        y = bzGraph.y+bzGraph.height;
    }
    if (y < bzGraph.y) {
        y = bzGraph.y;
    }

    bzDraggingObj.x = x;
    bzDraggingObj.y = y;

    bzUpdateDrawing();

}

function bzTouchMove(event) {
    bzOnMove(event);
    event.preventDefault();
}

function bzOnRelease(event) {
    //console.log('release')
    bzDrag = false;

    // restore pointer cursor
    bzCanvas.style.cursor = 'pointer';
    document.body.style.cursor = 'default';

    document.removeEventListener('mousemove', bzOnMove, false);
    document.removeEventListener('touchmove', bzTouchMove, false);
    document.removeEventListener('mouseup', bzOnRelease, false);
    document.removeEventListener('touchend', bzTouchEnd, false);
}

function bzTouchEnd(event) {
    bzOnRelease(event);
    event.preventDefault();
}


bzCanvas.addEventListener('mousedown', bzOnPress, false);
bzCanvas.addEventListener('touchstart', function bzTouchPress(event) {
    bzOnPress(event);
    event.preventDefault();
}, false);


var bzFirstLoad=true;
//绘制bezier曲线，控制点
function bzUpdateDrawing() {
    // clear
    ctx.clearRect(0,0,bzCanvas.width,bzCanvas.height);

    // draw bzGraph
    bzGraph.draw();

    // get bzHandles
    var cp1 = bzHandles[0],
        cp2 = bzHandles[1];

    // draw bezier bzCurve
    ctx.save();
    ctx.strokeStyle = '#4C84D3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bzGraph.x, bzGraph.y + bzGraph.height);
    //start at bottom left, first handle is cp1, second handle is cp2, end is top right
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, bzGraph.width, bzGraph.y);
    ctx.stroke();
    ctx.restore();

    // draw anchor point lines
    ctx.strokeStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(bzGraph.x, bzGraph.y + bzGraph.height);
    ctx.lineTo(cp1.x, cp1.y);
    ctx.moveTo(bzGraph.width, bzGraph.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.stroke();

    // draw bzHandles
    for (var i=0; i < bzHandles.length; i++) {
        bzHandles[i].draw();
    }

    //console.log(cp1.x, cp1.y, cp2.x, cp2.y)

    // output code
    var x1 = (cp1.x / bzGraph.width).toFixed(3),
        y1 = ( (bzGraph.height + bzGraph.y - cp1.y) / bzGraph.height ).toFixed(3),
        x2 = (cp2.x / bzCanvas.width).toFixed(3),
        y2 = ( (bzGraph.height + bzGraph.y - cp2.y) / bzGraph.height ).toFixed(3),

        //console.log( cp1.x, cp1.y )
        points = '(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')',
        bezier = 'cubic-bezier' + points;

    //   easeName = $('#bzPresets option:selected').text();
   if(!bzFirstLoad ) {
       bezierDragDebounce();
   }
    bzFirstLoad=false;


}

bzUpdateDrawing();

function getBezierCPoint(){
    var cp1 = bzHandles[0],
        cp2 = bzHandles[1];

    var x1 = (cp1.x / bzGraph.width).toFixed(3),
        y1 = ( (bzGraph.height + bzGraph.y - cp1.y) / bzGraph.height ).toFixed(3),
        x2 = (cp2.x / bzCanvas.width).toFixed(3),
        y2 = ( (bzGraph.height + bzGraph.y - cp2.y) / bzGraph.height ).toFixed(3);

    if (y1 > 1) y1 = 1;
    if (y1 < 0) y1 = 0;
    if (y2 > 1) y2 = 1;
    if (y2 < 0) y2 = 0;
    //console.log( cp1.x, cp1.y )
//            points = '(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')';
    return [{x:x1,y:y1},{x:x2,y:y2}];
}
var bezierDragDebounce = _.debounce(function(){

    //只需填充一下bzSample即可
    bzSample[$("#mapBtn .active").text()]=bzCreateSample(100,getBezierCPoint());
    getMainPointPos();
    refreshMyChart_main(myChart_main_data);
    }, 200);
//getMainPointPos();
//refreshMyChart_main(myChart_main_data);
function bzCreateSample(num,ps){ //ps是两个点的数组
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
}

function bzPresetChange() {

    var coordinates = this.value.split(','),
        cp1 = bzHandles[0],
        cp2 = bzHandles[1];

    cp1.x = coordinates[0] * bzGraph.width;
    cp1.y = bzGraph.y + bzGraph.height - (coordinates[1] * bzGraph.height);
    cp2.x = coordinates[2] * bzGraph.width;
    cp2.y = bzGraph.y + bzGraph.height - (coordinates[3] * bzGraph.height);
    //以上代码更新两个控制手柄的坐标。
    bzUpdateDrawing();

}

var $bzPresets = $('#bzPresets'),
    $bzPresetOpts = $('#bzPresets option');

$bzPresets.change(bzPresetChange);



//    $time.change(function() {
//        setTransitions();
//        bzUpdateDrawing(); //写在这里没多大用，主要用于触发textArea的显示
//    });

//    $time.keyup(function() {
//        $(this).trigger('change');
//    });


// arrow key support
//option 选择，对左右箭头按键进行触发
$(document).keydown(function(event) {

    var currentlySelected,
        currentIdx;

    if ( event.keyCode === 39  ) {//&& event.target !== time
        //right key && not in time input
        currentlySelected = $('#bzPresets option:selected');
        currentIdx = $bzPresetOpts.index(currentlySelected);

        if ( currentIdx < $bzPresetOpts.length - 1 ) {
            currentlySelected.attr('selected', '');
            $bzPresetOpts.eq( currentIdx + 1 ).attr('selected', 'selected');
            $bzPresets.trigger('change');
        }
    } else if ( event.keyCode === 37  ) {
        // left key && not in time input
        currentlySelected = $('#bzPresets option:selected');
        currentIdx = $bzPresetOpts.index(currentlySelected);

        if ( currentIdx > 0 ) {
            currentlySelected.attr('selected', '');
            $bzPresetOpts.eq( currentIdx - 1 ).attr('selected', 'selected');
            $bzPresets.trigger('change');
        }
    }

});
$bzPresets.trigger('change');