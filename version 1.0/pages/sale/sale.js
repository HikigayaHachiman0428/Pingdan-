var that;
var Bmob = require("../../utils/bmob.js");
var util = require("../../utils/util.js");
Page({
  data: {
    currentTab: 0,
    winHeight: null,
  },
  onLoad(options) {
    if (options.id) {
      this.setData({
        currentTab: options.id
      })
    }
    // 页面初始化 options为页面跳转所带来的参数
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
  },
  onReady () {
    // 页面渲染完成
  },
  onShow() {
    // 页面显示
    //获取全部订单信息
    const currentUser = Bmob.User.current();
    const Order = Bmob.Object.extend("user_coupon");
    const query = new Bmob.Query(Order);
    query.equalTo("user", currentUser.id);
    query.include("coupon");
    query.descending('createdAt');
    query.find({
      success: (result) => {
        let allOrder = [], //未使用
          noPayment = [], //已使用
          shipments = []; //已过期

        for (let object of result) {
          let status = "";
          let date = object.get("coupon").deadtime;
          let today = object.createdAt;
          let expday = util.addDate(today, date);
          
          let data = {
            createdAt: today.substring(0,10),
            updateAt: expday,
            price: object.get("coupon").price,
            nprice: object.get("coupon").nprice
          }
          
          if (!object.get("status")){
            let date = new Date();
            let year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();

            month = month < 10 ? `0${month}` : month;
            day = day < 10 ? `0${day}` : day;

            let Today = `${year}-${month}-${day}`;
            
            if (util.dateTab(Today, expday)) {
              shipments.push(data)
            }else{
              allOrder.push(data)
            }
          }else{
            noPayment.push(data)
          }
          
        }

        this.setData({
          allOrder: allOrder,
          noPayment: noPayment,
          shipments: shipments
        })

      },
      error: (error) => {

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

  bindChange: function (e) {
    that = this;
    that.setData({ currentTab: e.detail.current });

  },


});
