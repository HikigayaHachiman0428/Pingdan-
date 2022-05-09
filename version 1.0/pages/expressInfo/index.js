// pages/expressInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    expressInfo: {},
    show: false
  },
  onLoad(e) {
    var that = this;
    var expressId = e.expressId;
    var selectUrl =
      wx.request({
        url: 'https://qf-restapi.mdscj.com/xp_express/kuaidi100/query?logisticsNo=' + expressId,
        success(res) {
          console.log(res.data)
          if (!res.data.data) {
            wx.showToast({
              title: '单号有误',
              icon: 'loading',
              duration: 2000
            })
            return false;
          }
          var expressInfo = res.data.data;
          var reg = /(\d{11,20})/;
          for (var item in expressInfo.traces) {
            var str = expressInfo.traces[item].acceptStation;
            var phone = str.match(reg);
            if (phone) {
              expressInfo.traces[item].phone = phone[0];
            }
          }
          console.log(expressInfo);
          that.setData({
            expressInfo: expressInfo,
            show: true
          })
        }
      })
  },
  callPhone(e) {
    console.log(e);
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    });
  }
})