// pages/center/index.js
var Bmob = require("../../utils/bmob.js");
Page({
  data: {
    loading: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad: function (options) {
    //页面初始化 options为页面跳转所带来的参数
    var that = this;
    var value = wx.getStorageSync('openid')
    console.log(value, 'value')


    // var currentUser = Bmob.User.current()
    // if (!currentUser) {
    //   console.log('未获取到用户信息')
    // }
    // var openid = wx.getStorageSync('openid')
    // console.log(openid)
    // var query = new Bmob.Query("_User")
    // query.get(currentUser.id, {
    //   success: function (result) {
    //     result.set('openid', openid)
    //     result.save().then((res) => {
    //       Bmob.User._saveCurrentUser(currentUser)
    //     })
    //   }
    // })

    if (value) {
      var u = Bmob.Object.extend("_User");
      var query = new Bmob.Query(u);
      query.equalTo("username", value);
      query.find({
        success: function (results) {
          console.log(results, "results")
          that.setData({
            userInfo: results[0].attributes,
          })
        },
        error: function (error) {}
      });
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  cart: function () {
    wx.switchTab({
      url: '../cart/index'
    })
  },

  sale: function () {
    wx.navigateTo({
      url: '../sale/sale'
    })
  },
  collage: function () {
    wx.navigateTo({
      url: '../collage/index',
    })
  },
  feedback: function () {
    wx.navigateTo({
      url: './feedback/feedback'
    })
  },
  getUserProfile: function () {


    var that = this;
    console.log("获取用户信息")

 var user = Bmob.User.current()
    if (!user) {
      console.log('未获取到用户信息')
      return
    }
    var openid = wx.getStorageSync('openid')

    // console.log(user, 'resd')
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        that.setData({
          loading: false
        })
        console.log(res, 'res')
        var userInfo = res.userInfo;
        var nickName = userInfo.nickName;
        var avatarUrl = userInfo.avatarUrl;

        var u = Bmob.Object.extend("_User");
        var query = new Bmob.Query(u);
        // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
        query.get(user.id, {
          success: function (result) {
            // 自动绑定之前的账号
            result.set('nickName', nickName);
            result.set("userPic", avatarUrl);
            result.set("openid", openid);
            result.save();
            wx.setStorageSync('openid', openid)
            setTimeout(function () {
              that.setData({
                loading: true,
                canIUse:false
              })
              that.onLoad()
            }, 2000);
          }
        });
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      },
      fail: (err) => {
        console.log(err)
      }
    })



  }
})
