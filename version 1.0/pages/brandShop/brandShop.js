// pages/brandShop/brandShop.js
const Bmob = require("../../utils/bmob.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({id}) {
    const brand = Bmob.Object.extend("good");
    const Qbrand = new Bmob.Query(brand);
    Qbrand.descending("createdAt");
    Qbrand.equalTo("brand", id);
    Qbrand.find({
      success: (results) => {
        if (results){
          this.setData({
            data: results
          })
        }
      },
      error: (error) => {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})