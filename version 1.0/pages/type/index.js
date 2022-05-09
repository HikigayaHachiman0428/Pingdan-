var Bmob = require("../../utils/bmob.js");
Page({
  data: {
    currentTab: null,
    winHeight: 0,
    good: [],
  },
  onShareAppMessage: function() {
    let title = "分类";
    let path = "pages/type/index";
    return {
        title: title,
        path: path
    }
  },

  onLoad: function () {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          winHeight: res.windowHeight
        });
      }
    });

    let typeArray = [];
    let goodType = new Bmob.Query(Bmob.Object.extend("good_type"));
    goodType.find().then(result => {
      for (let object of result) {
        typeArray.push({
          id: object.id,
          name: object.get('type_name')
        })
      }

      let good = new Bmob.Query(Bmob.Object.extend("good"));
      good.equalTo("is_delete", 0); //上架
      good.include("type");
      return good.find();
    }).then(result => {
      let res = [];
      for (let type of typeArray) {
        let data = [];
        let canGetType = true
        for (let good of result) {
          if (!good.get('type')) {
            canGetType = false
          }
          if (canGetType) {
            if (type.id == good.get('type').objectId) {
              data.push(good.attributes);
            }
          }
          canGetType = true
        }
        let goodData = {
          foodType: type.name,
          id: type.id,
          data: data
        };
        res.push(goodData);
        this.setData({
          good: res
        })
      }
      this.setData({
        good: res,
        currentTab: res[0].id,//第一个tab
      })
      console.log(this.data.good);
    });
  },

  chooseType: function(event) {
      let foodType = event.target.dataset.foodtype;
      this.setData({
        currentTab: foodType
      })
  },
})