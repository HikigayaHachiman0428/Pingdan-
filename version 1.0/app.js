//app.js
var Bmob = require("utils/bmob.js");
Bmob.initialize("8818003fa7db52e30be7d6da7699facc", "3602a037c8a3625c9a65f2880527677e");

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var user = new Bmob.User() //实例化用户对象
    console.log("cccc")
    user.auth().then(function (user) {
      console.log("HHHHHH",user)
    })
    
  },
  getUserInfo: function (cb) {
    var that = this
  },
  globalData: {
    userInfo: null
  }
})
