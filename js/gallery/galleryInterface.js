//由于文中变量用的比较混乱，这里加个接口，用于变量的存放
// var clusterSelect=0; //聚类方式的索引  ~
// //var myChart_main = echarts.init(document.getElementById(divID_main));
// var selectName=[];  //聚类的维度选择  ~
// var categoriesMain = [];  //存放全部裸维度名， ~
// var relationThreshold=0;
// var overlapThreshold=0;
// var myChart_main_data={};  // graph的前端数据
// var lastGraphData={};   //用于辅助前一个与后一个点的fixed
// var kickPointList=[]; //子名字
// var kickEdgeList=[];
// var selectPoint=[];//用于多个点，共同聚类
// var similarValue=0.2;
// var nodeMap={};
//app_main.config





var galleryInterface={
    now:{},
    galleryToShow:function(index){
        //先填充now变量
        if(mainGraph_g.data[index]) {
            $.extend(true, galleryInterface.now={}, mainGraph_g.data[index]);
        }else{
            return false;
        }
        //galleryInterface.now to main
        clusterSelect=galleryInterface.now["clusterSelect"]; //聚类方式的索引  ~
        $.extend(true, selectName=[], galleryInterface.now["selectName"]);
        $.extend(true, categoriesMain=[], galleryInterface.now["categoriesMain"]);
        relationThreshold=galleryInterface.now["relationThreshold"];
        overlapThreshold=galleryInterface.now["overlapThreshold"];
        $.extend(true, myChart_main_data={}, galleryInterface.now["myChart_main_data"]);
        $.extend(true, lastGraphData={}, galleryInterface.now["lastGraphData"]);
        $.extend(true, kickPointList=[], galleryInterface.now["kickPointList"]);
        $.extend(true, kickEdgeList=[], galleryInterface.now["kickEdgeList"]);
        $.extend(true, selectPoint=[], galleryInterface.now["selectPoint"]);
        similarValue=galleryInterface.now["similarValue"];
        $.extend(true, nodeMap={}, galleryInterface.now["nodeMap"]);
      //  $.extend(true, app_main.config={}, galleryInterface.now["main_config"]);
        $.extend(true, linkListBuf=[], galleryInterface.now["linkListBuf"])
        $.extend(true, myChart_main_data.links=[], galleryInterface.now["linkListBuf"]);
        $.extend(true, bzSample={}, galleryInterface.now["bzSample"]);
        $.extend(true, myColorScheme={}, galleryInterface.now["myColorScheme"]);
        $.extend(true, transform="", galleryInterface.now["transform"]);

        return true;
    },
    showToGallery:function(index){
        //先填充now变量
        //main to galleryInterface.now
        galleryInterface.now["clusterSelect"]=clusterSelect; //聚类方式的索引  ~
        $.extend(true, galleryInterface.now["selectName"]=[], selectName);
        $.extend(true, galleryInterface.now["categoriesMain"]=[], categoriesMain);
        galleryInterface.now["relationThreshold"]=relationThreshold;
        galleryInterface.now["overlapThreshold"]=overlapThreshold;
        $.extend(true, galleryInterface.now["myChart_main_data"]={}, myChart_main_data);
        $.extend(true, galleryInterface.now["lastGraphData"]={}, lastGraphData);
        $.extend(true, galleryInterface.now["kickPointList"]=[], kickPointList);
        $.extend(true, galleryInterface.now["kickEdgeList"]=[], kickEdgeList);
        $.extend(true, galleryInterface.now["selectPoint"]=[], selectPoint);
        similarValue=galleryInterface.now["similarValue"];
        $.extend(true, galleryInterface.now["nodeMap"]={}, nodeMap);
        $.extend(true, galleryInterface.now["main_config"]={}, app_main.config);
        $.extend(true, galleryInterface.now["linkListBuf"]=[], linkListBuf);//linkListBuf
        $.extend(true,  galleryInterface.now["bzSample"]={},bzSample);
        $.extend(true,  galleryInterface.now["myColorScheme"]={},myColorScheme);
       // $.extend(true,  galleryInterface.now["transform"]="",transform);
        galleryInterface.now["transform"]="";//不往里面存放

        //galleryInterface.now to mainGraph_g.data
        mainGraph_g.data[index]={};
        $.extend(true,mainGraph_g.data[index],galleryInterface.now);
    }
};