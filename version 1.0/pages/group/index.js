const app = getApp()
const Bmob = require("../../utils/bmob.js");
const common = require("../../utils/common.js");

var template = require('../../template/template.js');
var that;
Page({
  data: {
    currentTab: 0,
    winHeight: "",
    winWidth: ""
  },
  onLoad: function() {
    that = this;
    template.tabbar("tabBar", 4, this) //0表示第一个tabbar

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      },
    })
  },

  onShow: function() {
    //获取全部订单
    var User = new Bmob.User("_User");
    var currentUser = Bmob.User.current();
    var collage = Bmob.Object.extend("collage_order");
    var query = new Bmob.Query(collage);
    query.equalTo("orderUser", currentUser.id);
    query.include("goodId");
    query.include("collage");
    query.descending("createdAt");
    query.find({
      success:function(result){
        console.log(result);
        var collageing = [],
            collageSuc = [],
            collageFai = [];
        for(var i=0;i<result.length;i++){
          var object = result[i];
          var status = "";
          var resData = {
            id:object.get("collage").objectId,
            status:status,
            createdAt: object.createdAt,
            detail:object.attributes
          }
          console.log(resData);
          switch (object.get('collage').status) {
            case '0':
              resData.status = "组团中";
              collageing.push(resData);
              break;
            case '1':
              resData.status = "组团成功";
              collageSuc.push(resData);
              break; 
            case '2':
              resData.status = "组团失败";
              collageFai.push(resData);
              break;
            default: 
          };
        }
        that.setData({
          collageing: collageing, 
          collageSuc: collageSuc, 
          collageFai: collageFai,
        })
        console.log(that.data.collageing);
      },error:function(error){
      
      }
    })
  },
  swichNav: function (e) {
    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  detail:function(e){
    var that = this;
    
    wx.navigateTo({
      url: `../collage-orderDetail/index?id=${e.currentTarget.dataset.collage}`,
    })
  }
})