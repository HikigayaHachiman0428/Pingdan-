const app = getApp()
var template = require('../../template/template.js');
const Bmob = require('../../utils/bmob.js');
let Good = Bmob.Object.extend("good");
let query = new Bmob.Query(Good);

Page({
  data: {
    goods: [], //页面数据
    pagination: 0, //页码
    pageSize: 8, //每页数据
    nodata: true, //无数据
  },
  onLoad: function () {
    template.tabbar("tabBar", 1, this)//0表示第一个tabbar
    this.getData();
  },
  getData (){
    query.limit(this.data.pageSize); //返回n条数据
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.equalTo("is_delete", 0); //上架
    query.equalTo("is_collage",1);//拼团
    query.equalTo("is_rec",1);//推荐
    query.descending('weight'); //按权重排序
    query.find({
       success:(results)=>{
         console.log(results);

         let data = [];
         for(let object of results){
           data.push({
             id: object.id,
             title: object.get('menu_name'),
             image: object.get('menu_logo'),
             price:object.get('price'),
             collage_price: object.get('collage_price'),
             collage_people:object.get('collage_people')
           })
         }
         if(data.length){
           let goods = this.data.goods; //得到页面上已经渲染的数据(数组)
           let pagination = this.data.pagination; //获取当前分页(第几页)
           goods.push.apply(goods, data); //将页面上面的数组和最新获取到的数组进行合并
           pagination = pagination ? pagination + 1 : 1; //此处用于判断是首次渲染数据还是下拉加载渲染数据

           //更新数据
           this.setData({
             goods: goods,
             pagination: pagination
           })
         }else{
           //没有返回数据，页面不再加载数据
           this.setData({
             nodata: false
           })
         }
      }, error(error) {
        console.log(`查询失败: ${error.code} ${error.message}`);
      }
    });
  },
  onReachBottom() {
    //下拉触底加载更多数据
    if(this.data.nodata){
      this.getData();
    }
    
  },
  router(e){
    //跳转至商品详情页
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/collage-detail/index?id=${id}`
    })

  }
})