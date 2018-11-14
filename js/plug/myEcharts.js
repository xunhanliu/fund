function resize_echarts(para){
    //para={$selector:   }
    var echartsInstance= echarts.getInstanceByDom(para.$selector[0]);
    if(!echartsInstance){
        return -1;
    }
    echartsInstance.resize({width:para.$selector.width(),height:para.$selector.height()});
    //echartsInstance.resize('auto','auto');

}