// pages/collage-orderDetail/index.js
const Bmob = require("../../utils/bmob.js");
const common = require("../../utils/common.js");
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    collageId:"",
    goodId:"",
    detail:[],
    collage_info:[],
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    own:false,//是否为自己参加的团
    lackPeople:0 //缺少的人数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    var collageId = options.id;
    var collage = Bmob.Object.extend("collage");
    var query = new Bmob.Query(collage);
    query.include("good");
    query.get(collageId,{
      success:function(result){
        console.log(result);
        var safariTime = result.createdAt.replace(/\-/g, '/')
        var countDown = Date.parse(new Date(safariTime)) / 1000 + 24 * 3600 * result.get("good").collage_days;
        that.countDown(countDown);
        that.setData({
          collageId: collageId,
          goodId:result.get("good").objectId,
          detail:result,
          lackPeople: result.get("good").collage_people - result.get("people")
        })
      }
    });

    var collage_order = Bmob.Object.extend("collage_order");
    var order = new Bmob.Query(collage_order);
    order.include("orderUser");
    order.equalTo("collage",collageId);
    order.find({
      success:function(res){
        console.log(res);
        var currentUser = Bmob.User.current();
        var objectId = currentUser.id;
        for(var i=0;i<res.length;i++){
          if(res[i].get("orderUser").objectId == objectId){
            that.setData({
              own:true
            })
            break;
          }
        }
        that.setData({
          collage_info:res
        })
      }
    })
  },

  onShow: function () {
  
  },

  onShareAppMessage: function (res) {
    
    that = this;
    console.log(that.data.detail.get("good").menu_name);
    return {
      title: that.data.detail.get("good").menu_name ,
      path: `/pages/collage-orderDetail/index?id=${that.data.collageId}`,
      imageUrl: that.data.detail.get("good").menu_logo,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }

  },
  index:function(){
    wx.navigateTo({
      url: '../collage/index',
    })
  },
  join:function(){
    wx.navigateTo({
      url: `../collage-attend/index?id=${that.data.goodId}`,
    })
  },

  //倒计时
  countDown: function (time) {
    var totalSecond = time - Date.parse(new Date()) / 1000;

    var interval = setInterval(function () {
      // 秒数
      var second = totalSecond;

      // 天数位
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownDay: dayStr,
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
  }

})