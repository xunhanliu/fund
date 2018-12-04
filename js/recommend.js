var similarValue = 0.2;

function getSimilarPoint() {
    var data = myChart_main_data['relation'];
    //不管正负，只考虑值
    //正负，与值都考虑
    var dataArr = [];
    var dataBuf = [];
    var dataArrS = [];
    var dataBufS = [];
    for (var i = 0; i < data.length; i++) {
        dataBuf = []
        dataBuf.push(i);
        dataBufS = []
        dataBufS.push(i);
        for (var j = i + 1; j < data.length; j++) {
            //比较第i行，和第j行
            if (compare(shallowRemove(data[i], i), shallowRemove(data[j], j), 0)) {
                dataBuf.push(j);
            }
            if (compare(shallowRemove(data[i], i), shallowRemove(data[j], j), 1)) {
                dataBufS.push(j);
            }
        }
        if (dataBuf.length != 1) {
            dataArr.push(dataBuf);
        }
        if (dataBufS.length != 1) {
            dataArrS.push(dataBufS);
        }
    }
    //解析名字
    var nameList = [];
    var nameBuf = [];
    var divBuf = "";
    divBuf += '<p>不考虑符号</p>';
    for (i in dataArr) {
        nameBuf = [];
        divBuf += '<p style="word-break: break-all; word-wrap:break-word;">';
        for (j in dataArr[i]) {
            //data.nodes
            var name = myChart_main_data["head"][dataArr[i][j]][0];
            nameBuf.push(name);
            divBuf = divBuf + '<span onmouseover="subspaceSpanOver(\'' + name.replace(/[\W]/g, '_') + '\')" onmouseout="subspaceSpanOut(\'' + name.replace(/[\W]/g, '_') + '\')" class="subspaceSpan" style="background-color: ' + getColorFromName(name) + '">' + myChart_main_data["head"][dataArr[i][j]][0] + '</span>'
        }
        divBuf += '</p>';
        if (nameBuf.length) {
            allConnectNameList.push(nameBuf);
        }
    }
    divBuf += '<p>考虑符号</p>';
    for (i in dataArrS) {
        divBuf += '<p style="word-break: break-all; word-wrap:break-word;">';
        for (j in dataArrS[i]) {
            var name = myChart_main_data["head"][dataArr[i][j]][0];
            divBuf = divBuf + '<span onmouseover="subspaceSpanOver(\'' + name.replace(/[\W]/g, '_') + '\')" onmouseout="subspaceSpanOut(\'' + name.replace(/[\W]/g, '_') + '\')" class="subspaceSpan" style="background-color: ' + getColorFromName(name) + '">' + name + '</span>'
        }
        divBuf += '</p>';
    }

    $("#subspace").css("width", "100%");
    $("#subspace").css("display", "block");
    $("#subspaceContent").html("");
    $("#subspaceContent").append(divBuf);
}

function subspaceSpanOver(name) {//name中不带逗号
    $(".main_" + name).addClass("myActiveCircle");
    $(".matrixText_" + name).addClass("active");
}

function subspaceSpanOut(name) {//name中不带逗号
    $(".main_" + name).removeClass("myActiveCircle");
    $(".matrixText_" + name).removeClass("active");
}

function getColorFromName(name) {
    // for(var i in myChart_main_data["node"])
    // {
    //    if( myChart_main_data["node"][i]["name"]==name)
    //    {
    //        return color20(myChart_main_data["node"][i]["group"]);
    //    }
    // }
    // return "#888"

    // myChart_main_data.category
    for (var i in myChart_main_data.category) {
        if (myChart_main_data["category"][i] == name.split(",")[0]) {
            return color20(i);
        }
    }
}

function compare(arr1, arr2, sign) {
    if (sign)//考虑符号
    {
        for (var i = 0; i < arr1.length; i++) {
            if (Math.abs(arr1[i] - arr2[i]) > similarValue) //符号相反也不行
            {
                return false;
            }
            else if (arr1[i] >= 0 ^ arr2[i] >= 0) {  //判断符号相反，进入
                return false;
            }
        }
    }
    else {//Math.abs() 不考虑符号
        for (var i = 0; i < arr1.length; i++) {
            if (Math.abs(Math.abs(arr1[i]) - Math.abs(arr2[i])) > similarValue) {
                return false;
            }
        }
    }
    return true;
}

function shallowRemove(arr, index) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        if (i != index) {
            result.push(arr[i]);
        }
    }
    return result;
}

function getAllConnect() {//贪婪，新加入的，要与原来的逐个比较
    var data = myChart_main_data['relation'];
    //不管正负，只考虑值
    //正负，与值都考虑
    var dataArr = [];
    var dataBuf = [];
    for (var i = 0; i < data.length; i++) {
        //需要判断，原数据中是否已经记录
        if (inRecord(dataArr, i)) {
            continue;
        }
        dataBuf = [];
        dataBuf.push(i);
        for (var j = i + 1; j < data.length; j++) {
            //比较第i行，和第j行
            if (data[i][j] != 0) {
                if (addOrNot(data, dataBuf, j))  //加入
                {
                    dataBuf.push(j);
                }
            }
        }
        if (dataBuf.length != 1) {
            dataArr.push(dataBuf);
        }

    }

    //解析名字
    allConnectNameList = [];
    var nameBuf = [];
    var divBuf = "";
    for (i in dataArr) {
        nameBuf = [];
        divBuf += "<p>" + "第" + i + "个全连接" + "</p>"
        divBuf += '<p style="word-break: break-all; word-wrap:break-word;" onmouseover="allConnectOver(\'' + dataArr[i] + '\')" onmouseout="allConnectOut(\'' + dataArr[i] + '\')" >';
        for (j in dataArr[i]) {
            //data.nodes
            var name = myChart_main_data["head"][dataArr[i][j]][0];
            nameBuf.push(name);
            divBuf = divBuf + '<span class="allConnectSpan" style="background-color: ' + getColorFromName(name) + '">' + myChart_main_data["head"][dataArr[i][j]][0] + '</span>'
        }
        divBuf += '</p>';
        if (nameBuf.length) {
            allConnectNameList.push(nameBuf);
        }
    }

    $("#allConnect").css("width", "100%");
    $("#allConnect").css("display", "block");
    $("#allConnectContent").html("");
    $("#allConnectContent").append(divBuf);
}


function allConnectOver(Arr) {
    Arr = Arr.split(",");
    for (var i in Arr) {
        var name = myChart_main_data["head"][Arr[i]][0];
        $(".main_" + name.replace(/[\W]/g, '_')).addClass("myActiveCircle");
        $(".matrixText_" + name.replace(/[\W]/g, '_')).addClass("active");
    }
    //$(".main_"+name).addClass("myActiveCircle");
    //$(".matrixText_"+name).addClass("active");
}

function allConnectOut(Arr) {
    Arr = Arr.split(",");
    for (var i in Arr) {
        var name = myChart_main_data["head"][Arr[i]][0];
        $(".main_" + name.replace(/[\W]/g, '_')).removeClass("myActiveCircle");
        $(".matrixText_" + name.replace(/[\W]/g, '_')).removeClass("active");
    }
}

function addOrNot(arr, dataBuf, j) {
    for (var i in dataBuf) {
        if (arr[i][j] == 0) {
            return false;
        }
    }
    return true;
}

function inRecord(dataArr, k) {//dataArr是两层数据
    for (var i in dataArr) {
        for (var j in dataArr[i]) {
            if (dataArr[i][j] == k) {
                return true;
            }
        }
    }
    return false;
}