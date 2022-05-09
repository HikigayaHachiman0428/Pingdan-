var common = require("../../utils/common.js");
var Bmob = require("../../utils/bmob.js");

Page({

  data: {
    goodId: "",
    detail:[],
    collageList:[],
    collageId:"",//拼团id
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
  },

  onLoad: function (options) {
    this.data.goodId = options.id;
    this.getData();
  },

  // 页面渲染完成后 调用
  onReady: function () {
   
  },


  onShow: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  getData:function(){
    var that = this;
    wx.showLoading({
      title: '加载中',
    });
    //查询商品详情
    let goodId = this.data.goodId;
    let Good = Bmob.Object.extend("good");
    let good = new Bmob.Query(Good);

    good.get(goodId).then(result => {
      
      this.setData({
        detail: result
      })
      //查看是否有团购
      let data = [];
      let collage_order = Bmob.Object.extend("collage");
      let query = new Bmob.Query(collage_order);
      query.equalTo("good", goodId);
      query.equalTo("status", '0');
      query.include("good");
      query.include("creator");
      query.limit(1);
      query.find({
        success: function (res) {
          console.log(res);
          if(res.length!=0){
            that.setData({
              collageList: res,
              collageId:res[0].id
            })
            var safariTime = res[0].createdAt.replace(/\-/g, '/')
            var countDown = Date.parse(new Date(safariTime)) / 1000 + 24 * 3600 * res[0].get("good").collage_days;
            console.log(countDown, "2555");
            that.countDown(countDown);
          }
         
        }
      });
      wx.hideLoading();
    }, error => {
      console.log(error);
      wx.hideLoading();
      common.showTip('系统出错请重试', 'loading');
    });
  },
  payOrder: function () {
    let detailArray = {
      goodId: this.data.goodId,
      number: 1,
      price: this.data.detail.get('collage_price'),
      name: this.data.detail.get('menu_name'),
      pic: this.data.detail.get('menu_logo'),
      fare: this.data.detail.get('fare'),
    };
    let collageOrder = new Array();
    collageOrder.push(detailArray);
    wx.setStorage({
      key: "collageOrder",
      data: collageOrder
    })
    wx.navigateTo({
      url: `../collage-submit/index?collageId=${this.data.collageId}`
    })
  },
  //倒计时
  countDown:function(time){
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