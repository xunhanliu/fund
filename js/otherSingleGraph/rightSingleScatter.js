/**
 * Created by Administrator on 2018/4/11 0011.
 */
//**********************************************************************************************************


function scatter_size_update(){

}
function getScatterData(list1,index)//[name1_1,name2_0]
{
    showToast('info',"边数据获取中。。。");
    $.ajax({url:mylocalURL+"showScatter",type: "POST",data:{ 'nameList':list1.join('*'),"galleryIndex":index},success:function(result){
        showToast('success',"边数据获取成功");
        getScattersuccess(result);
    }});
}

function getScattersuccess(result){

}
