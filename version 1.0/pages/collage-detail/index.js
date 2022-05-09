var Zan = require("../../dist/index.js");
var common = require("../../utils/common.js");
var WxParse = require('../../utils/wxParse/wxParse.js');
var app = getApp()
var Bmob = require("../../utils/bmob.js");

Page(Object.assign({}, Zan.Quantity, {

  data: {
    indicatorDots: true, //是否出现焦点
    autoplay: true, //是否自动播放轮播图
    interval: 4000, //时间间隔
    duration: 1000, //延时时间
    detail: [],
    hiddenModal: true,
    goodId: 0,
    goodNum: 0, //库存
    price: 0, //商品价格
    minPrice: 999999999999, //商品最低价格
    maxPrice: 0, //商品最高价格
    quantity1: {
      quantity: 1,
      min: 1,
      max: 20
    },
    actionType: 'payOrder',
    cartResult: false,
    option: [],
    optionIndex: -1,
    isOption: false, //是否显示商品属性
    fare: 0.00
  },
  onLoad: function(options) {
    if (!options.id) {
      common.showModal("获取商品信息失败", '', false, () => {
        wx.navigateBack({
          delta: 1
        })
      });
      return false;
    }
    this.setData({
      goodId: options.id
    });

    this.getData();
  },
  onShow: function() {

  },
  getData: function() {
    wx.showLoading({
      title: '加载中',
    });
    //查询商品详情
    let goodId = this.data.goodId;
    let Good = Bmob.Object.extend("good");
    let good = new Bmob.Query(Good);

    good.equalTo("is_delete", 0);

    let cover = ''; //商品封面
    good.get(goodId).then(result => {
      let good_desc = result.get("good_desc");
      if (good_desc) {
        let reg = new RegExp("&quot;", "g");
        let detail = good_desc.replace(reg, "");
        WxParse.wxParse('content', 'html', detail, this);
      }
      cover = result.get("menu_logo"); //商品封面
      let fare = result.get("fare") ? result.get("fare").toFixed(2) : 0.00;
      this.setData({
        goodNum: result.get("good_number"),
        price: result.get("price"),
        detail: result,
        fare: fare,
        quantity1: {
          quantity: 1,
          min: 1,
          max: result.get("good_number")
        }
      })

      let goodPic = new Bmob.Query(Bmob.Object.extend("good_pic"));
      goodPic.equalTo("good_id", goodId);
      return goodPic.find();
    }).then(result => {

      /***商品图片 ***/
      let pic_attr = new Array();
      for (let object of result) {
        pic_attr.push(object.get("good_pic"));
      }
      pic_attr.unshift(cover);
      this.setData({
        imgUrls: pic_attr
      })
      wx.hideLoading();
    }, error => {
      console.log(error);
      wx.hideLoading();
      common.showTip('系统出错请重试', 'loading');
    })
  },
  index: function () {
    wx.navigateTo({
      url: '../collage/index',
    })
  },
  placeOrder:function(event) {
    var name = event.target.dataset.name;
    this.setData({
      actionType: name
    })
    if (name == 'order'){
      this.showModal();
    }else{
      this.navCollage();
    }
    
  },
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideModal:function() {
    //隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  click_cancel:function(){
    this.hideModal();
  },
  handleZanQuantityChange:function(e){
    var componentId = e.componentId;
    var quantity = e.quantity;

    this.setData({
      [`${componentId}.quantity`]: quantity
    });
  },
  payOrder:function(){
    //获取传递过来的数量，商品名称，价格
    let number = this.data.quantity1.quantity;
    let good_number = this.data.goodNum;

    if(parseInt(number)>parseInt(good_number)){
      common.showTip("货存不足！", 'loading');
      return false;
    }

    if (this.data.isOption && this.data.optionIndex == -1) {
      common.showTip("请选择商品属性", 'loading');
      return false;
    }

    let goodOption = this.data.isOption ? this.data.option[this.data.optionIndex].optionName : '';

    let detailArray = {
      number: number,
      price: this.data.isOption ? this.data.option[this.data.optionIndex].price : this.data.detail.get('price'),
      name: this.data.detail.get('menu_name'),
      pic: this.data.detail.get('menu_logo'),
      fare: this.data.detail.get('fare'),
      option: goodOption,
    };
    let orderResult = new Array();
    orderResult.push(detailArray);
    wx.setStorage({
      key: "orderResult",
      data: orderResult
    })
    wx.redirectTo({
      url: '../payorder/index'
    })
  },
  navCollage:function(){
    var goodId = this.data.goodId;
    wx.navigateTo({
      url: `../collage-join/index?id=${goodId}`,
    })
  }

}))