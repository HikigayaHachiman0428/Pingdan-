// pages/brand/brand.js
const Bmob = require("../../utils/bmob.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand:null
  },
  onLoad(options) {
    //查询品牌
    const brand = Bmob.Object.extend("brand");
    const Qbrand = new Bmob.Query(brand);
    Qbrand.descending("createdAt");
    Qbrand.find({
      success: (results) => {
        const data = [];
        for (let object of results) {
          data.push({
            id: object.id,
            name: object.get('name'),
            logo: object.get('logo')
          })
        }
        this.setData({
          brand: data
        })
      },
      error: (error) => {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  }

})