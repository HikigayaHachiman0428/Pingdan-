const app = getApp()
var template = require('../../template/template.js');
const Bmob = require('../../utils/bmob.js');


Page({
  data: {
    goods: [], //页面数据
    pagination: 0, //页码
    pageSize: 8, //每页数据
    nodata: true, //无数据
    searchVal: ""
  },
  input(e) {
    this.setData({
      searchVal: e.detail.value
    })
    this.search()
  },
  clear() {
    this.setData({
      goods: [], //页面数据
      pagination: 0, //页码
      pageSize: 8, //每页数据
      nodata: true, //无数据
      searchVal: ""
    })
    this.getData();
  },
  search() {
    this.setData({
      goods: [], //页面数据
      pagination: 0, //页码
      pageSize: 8, //每页数据
      nodata: true, //无数据
    });
    let Good = Bmob.Object.extend("good");
    let query = new Bmob.Query(Good);
    query.equalTo("menu_name", { "$regex": `${this.data.searchVal}.*` });
    query.limit(this.data.pageSize); //返回n条数据
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.equalTo("is_delete", 0);
    query.equalTo("is_collage", 1); //拼团
    query.descending('createdAt');
    query.find({
      success: (results) => {
        let data = [];
        //将得到的数据存入数组
        for (let object of results) {
          data.push({
            id: object.id,
            title: object.get('menu_name'),
            image: object.get('menu_logo'),
            price: object.get('price'),
            collage_price: object.get('collage_price'),
            collage_people: object.get('collage_people'),
          })
        }
        if (data.length) {
          let goods = this.data.goods;
          let pagination = this.data.pagination;
          goods.push.apply(goods, data);
          pagination = pagination ? pagination + 1 : 1;

          this.setData({
            goods: goods,
            pagination: pagination
          });
        } else {
          this.setData({
            nodata: false
          })
        }
        
      }
    });
  },
  onLoad: function () {
    template.tabbar("tabBar", 2, this)//0表示第一个tabbar

    this.getData();
  },
  getData(){
    let Good = Bmob.Object.extend("good");
    let query = new Bmob.Query(Good);
    query.limit(this.data.pageSize);
    query.skip(this.data.pageSize * this.data.pagination); //分页查询
    query.equalTo("is_delete",0);
    query.equalTo("is_collage",1); //拼团
    query.descending('weight'); //按权重排序
    query.find({
      success:(results)=>{
        let data =[];
        for(let object of results){
          data.push({
            id:object.id,
            title:object.get('menu_name'),
            image:object.get('menu_logo'),
            price:object.get('price'),
            collage_price:object.get('collage_price'),
            collage_people:object.get('collage_people'),
          });
        }

        if(data.length){
          let goods = this.data.goods;
          let pagination = this.data.pagination;
          goods.push.apply(goods,data);
          pagination = pagination ? pagination+1 : 1;

          this.setData({
            goods:goods,
            pagination:pagination
          });
        }else{
          this.setData({
            nodata: false
          })
        }

      }, error(error) {
        console.log(`查询失败: ${error.code} ${error.message}`);
      }
    });
  },
  onReachBottom(){
    //下拉触底加载更多数据
    if (this.data.nodata) {
      this.getData();
    }
  },
  router(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/collage-detail/index?id=${id}`
    })
  }
})