// pages/collage-join/index.js
var common = require("../../utils/common.js");
var Bmob = require("../../utils/bmob.js");
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodId:"",
    detail: [],
    goodList:[],
    collage_join:true,//是否可以参团
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.goodId=options.id;
    this.getData();
  },
  onShow: function () {
  
  },
  onShareAppMessage: function () {
  
  },
  getData:function(){
    wx.showLoading({
      title: '加载中',
    });
    //查询商品详情
    let goodId = this.data.goodId;
    let Good = Bmob.Object.extend("good");
    let good = new Bmob.Query(Good);

    good.get(goodId).then(result=>{
      console.log(result);
      this.setData({
        detail:result
      })
      console.log(this.data.detail);
      wx.hideLoading();
    },error => {
      console.log(error);
      wx.hideLoading();
      common.showTip('系统出错请重试', 'loading');
    });

    //更多推荐
    let goods = new Bmob.Query(Good);
    goods.limit(4); //返回4条数据
    goods.equalTo("is_delete", 0); //上架
    goods.equalTo("is_collage", 1);//拼团
    goods.equalTo("is_rec", 1);//推荐
    goods.notEqualTo("objectId", goodId);
    goods.descending('weight'); //按权重排序
    goods.find({
      success:(results=>{
        console.log(results);
        this.setData({
          goodList:results
        })
        wx.hideLoading();
      })
    }, error => {
      console.log(error);
      wx.hideLoading();
    });
  },
  payOrder:function(){
    that = this;
    var User = Bmob.Object.extend("_User");
    var currentUser = Bmob.User.current();
    var objectId = currentUser.id;
    var collage = Bmob.Object.extend("collage");
    var query = new Bmob.Query(collage);
    query.notEqualTo("status",2);
    query.equalTo("creator",objectId);
    query.equalTo("good", that.data.goodId);
    query.find({
      success:function(results){
        if(results.length!=0){
          common.showTip("您已参加该团!", "loading");
        }else{
          let detailArray = {
            goodId: that.data.goodId,
            number: 1,
            price: that.data.detail.get('collage_price'),
            name: that.data.detail.get('menu_name'),
            pic: that.data.detail.get('menu_logo'),
            fare: that.data.detail.get('fare'),
          };
          let collageOrder = new Array();
          collageOrder.push(detailArray);
          wx.setStorage({
            key: "collageOrder",
            data: collageOrder
          })
          wx.navigateTo({
            url: '../collage-submit/index'
          })
        }
      },
      error:function(error){

      }
    })
  },
  attend:function(){
    that = this;
    //查询是否参团
    var User = Bmob.Object.extend("_User");
    var currentUser = Bmob.User.current();
    var objectId = currentUser.id;
    let collage = Bmob.Object.extend("collage_order");
    let query = new Bmob.Query(collage);

    query.equalTo("orderUser",objectId);
    query.equalTo("goodId", that.data.goodId)
    query.include("collage");
    query.find({
      success: function (res) {
        if(res.length!=0){
          for (var i = 0; i < res.length; i++) {
            console.log(res[i].get("collage").status);
            if (res[i].get("collage").status==0){
              that.setData({
                collage_join:false
              });
              break;
            }
          }

          if(that.data.collage_join){
            wx.navigateTo({
              url: `../collage-attend/index?id=${that.data.goodId}`,
            })
          }else{
            common.showTip("您已参加该团!","loading");
          }
        }else{
          wx.navigateTo({
            url: `../collage-attend/index?id=${that.data.goodId}`,
          })
        }
      }
    })
    
  }
})