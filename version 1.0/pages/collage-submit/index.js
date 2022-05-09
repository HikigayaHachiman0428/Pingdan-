var common = require("../../utils/common.js");
var Bmob = require("../../utils/bmob.js");

Page({
  data: {
    goodId:"",
    collageId:"",//拼团id
    showAddr:false,
    showAddAddr:true,
    totalMoney:0,
    goodMoney:0,
    price: 0,
    fare: 0.00,
    addrdetail:"",
    detail:[]
  },
  onLoad: function (options) {
    var that = this;
    if(options.collageId){
      that.setData({collageId:options.collageId});
    }
    var User = Bmob.Object.extend("_User");
    var currentUser =Bmob.User.current();
    var userId = currentUser.id;
    var query = new Bmob.Query(User);
    query.get(userId,{
      success:function(result){
        var name = result.get("name");
        if (name) {
          that.setData({
            showAddr: true,
            showAddAddr: false
          })
        }
        var tel = result.get("tel");
        var addrdetail = result.get("addrdetail");
        that.setData({
          name: name,
          tel: tel,
          addrdetail: addrdetail,
          showAddr: true,
          showAddAddr: false,
        })

      },error: function (object, error) {
        
      }
    })
  },
  onShow: function () {
    let totalMoney = null;
    let total = null;
    wx.getStorage({
      key: 'collageOrder',
      success: res => {
        console.log(this.data.fare);
        console.log(res.data);
        let len = res.data.length;
        let fare = this.data.fare;
        let goodMoney = 0;
        for (let i = 0; i < len; i++) {
          goodMoney += res.data[i].number * res.data[i].price;
          if (res.data[i].fare > fare) {
            fare = res.data[i].fare;
          }
        }
        total = goodMoney + fare;
        this.setData({
          fare: fare.toFixed(2),
          totalMoney: total.toFixed(2),
          goodMoney: goodMoney.toFixed(2),
          detail: res.data,
          goodId:res.data[0].goodId
        })
      },
    })
  },
  getAddress:function(){
    wx.chooseAddress({
      success:(res)=>{
        this.setData({
          showAddr:true,
          showAddAddr:false,
          name:res.userName,
          addrdetail:res.provinceName+res.cityName+res.countyName+res.detailInfo,
          tel:res.telNumber,
        });
        var User =Bmob.Object.extend("_User");
        var currentUser = Bmob.User.current();
        var userId = currentUser.id;
        var query = new Bmob.Query(User);
        query.get(userId,{
          success: (result) => {
            result.set('name', res.userName);
            result.set('tel', res.telNumber);
            result.set('addrdetail', res.provinceName + res.cityName + res.countyName + res.detailInfo);
            result.set('mailcode', res.nationalCode);
            result.save(null, {
              success: (result) => { },
              error: (result, error) => {
                console.log('地址创建失败');
              }
            });
          },
          error: (object, error) => {
            console.log(object)
          },
        });
      }
    })
  },
  placeOrder:function(event){
    var that = this;
    if(!this.data.showAddr){
      common.showTip("请填写收货地址", "loading");
      return false;
    }

    //发起支付
    var orderDetail = this.data.detail;
    var userInfo = {
      name: this.data.name,
      tel: this.data.tel,
      addrdetail: this.data.addrdetail
    };

    var totalPrice = parseFloat(this.data.totalMoney);
    var remarks = event.detail.value.remark;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        
        var openId = res.data;
        if (!openId) {
          console.log('未获取到openId请刷新重试');
          return false;
        }

        var collageId = that.data.collageId;

        var User = Bmob.Object.extend("_User");
        var currentUser = Bmob.User.current();
        var objectId = currentUser.id;
        var Collage = Bmob.Object.extend("collage");
        var collage = new Collage();
        var user = new Bmob.User();
        user.id = objectId;

        if(collageId){
          //参团
          var Good = Bmob.Object.extend("good");
          var good = new Good();
          good.id = that.data.goodId;
          var collage_order = Bmob.Object.extend("collage_order");
          var collageOrder = new collage_order();
          collage.id = collageId;
          collageOrder.set("goodId", good);
          collageOrder.set("collage", collage);
          collageOrder.set("remarks", remarks);
          collageOrder.set("orderUser", user);
          collageOrder.set("totalprice", parseFloat(totalPrice));
          collageOrder.set("orderDetail", orderDetail);
          collageOrder.set("orderId", "111111");
          collageOrder.set("status", '1');
          collageOrder.set("userInfo", userInfo);
          collageOrder.save(null, {
            success: function (result) {
              var query = new Bmob.Query(Collage);
              query.include("good");
              query.get(collageId,{
                success:function(res){
                  res.set('people', (parseInt(res.get("people")+1)));
                  if (res.get("people")===res.get("good").collage_people){
                    res.set('status','1');
                  }
                  res.save();
                  wx.redirectTo({
                    url: '../collage-order/index'
                  })
                },error:function(object,error){

                }
              })
              
            },
            error: function (result, error) {

            }
          });
        }else{
          //开团
          
          var Good = Bmob.Object.extend("good");
          var good = new Good();
          good.id = that.data.goodId;
          collage.set("good", good);
          collage.set("status", '0');
          collage.set("creator", user);
          collage.set("people", 1);
          collage.save(null, {
            success: function (result) {
              var collage_order = Bmob.Object.extend("collage_order");
              var collageOrder = new collage_order();
              collage.id = result.id;
              collageOrder.set("collage", collage);
              collageOrder.set("goodId",good);
              collageOrder.set("remarks", remarks);
              collageOrder.set("orderUser", user);
              collageOrder.set("totalprice", parseFloat(totalPrice));
              collageOrder.set("orderDetail", orderDetail);
              collageOrder.set("orderId", "111111");
              collageOrder.set("status", '1');
              collageOrder.set("userInfo", userInfo);
              collageOrder.save(null, {
                success: function (result) {
                  wx.redirectTo({
                    url: '../collage-order/index'
                  })
                },
                error: function (result, error) {

                }
              });
            },
            error: function (result, error) {

            }
          });
        }

        // Bmob.Pay.wechatPay(totalPrice, '小程序商城', '描述', openId).then(function(resp){

        //   //服务端返回成功
        //   var timeStamp = resp.timestamp,
        //     nonceStr = resp.noncestr,
        //     packages = resp.package,
        //     orderId = resp.out_trade_no,
        //     sign = resp.sign;
        //   wx.requestPayment({
        //     'timeStamp': timeStamp,
        //     'nonceStr': nonceStr,
        //     'package': packages,
        //     'signType': 'MD5',
        //     'paySign': sign,
        //     'success':function(res){
              // //开团
              // if (collageId) {
              //   //参团
              //   var Good = Bmob.Object.extend("good");
              //   var good = new Good();
              //   good.id = that.data.goodId;
              //   var collage_order = Bmob.Object.extend("collage_order");
              //   var collageOrder = new collage_order();
              //   collage.id = collageId;
              //   collageOrder.set("goodId", good);
              //   collageOrder.set("collage", collage);
              //   collageOrder.set("remarks", remarks);
              //   collageOrder.set("orderUser", user);
              //   collageOrder.set("totalprice", parseFloat(totalPrice));
              //   collageOrder.set("orderDetail", orderDetail);
              //   collageOrder.set("orderId", "111111");
              //   collageOrder.set("status", '1');
              //   collageOrder.set("userInfo", userInfo);
              //   collageOrder.save(null, {
              //     success: function (result) {
              //       var query = new Bmob.Query(Collage);
              //       query.include("good");
              //       query.get(collageId, {
              //         success: function (res) {
              //           res.set('people', (parseInt(res.get("people") + 1)));
              //           if (res.get("people") === res.get("good").collage_people) {
              //             res.set('status', '1');
              //           }
              //           res.save();
              //           wx.redirectTo({
              //             url: '../collage-order/index'
              //           })
              //         }, error: function (object, error) {

              //         }
              //       })

              //     },
              //     error: function (result, error) {

              //     }
              //   });
              // } else {
              //   //开团

              //   var Good = Bmob.Object.extend("good");
              //   var good = new Good();
              //   good.id = that.data.goodId;
              //   collage.set("good", good);
              //   collage.set("status", '0');
              //   collage.set("creator", user);
              //   collage.set("people", 1);
              //   collage.save(null, {
              //     success: function (result) {
              //       var collage_order = Bmob.Object.extend("collage_order");
              //       var collageOrder = new collage_order();
              //       collage.id = result.id;
              //       collageOrder.set("collage", collage);
              //       collageOrder.set("goodId", good);
              //       collageOrder.set("remarks", remarks);
              //       collageOrder.set("orderUser", user);
              //       collageOrder.set("totalprice", parseFloat(totalPrice));
              //       collageOrder.set("orderDetail", orderDetail);
              //       collageOrder.set("orderId", "111111");
              //       collageOrder.set("status", '1');
              //       collageOrder.set("userInfo", userInfo);
              //       collageOrder.save(null, {
              //         success: function (result) {
              //           wx.redirectTo({
              //             url: '../collage-order/index'
              //           })
              //         },
              //         error: function (result, error) {

              //         }
              //       });
              //     },
              //     error: function (result, error) {

              //     }
              //   });
              // }
        //     },
        //     'fail':function(res){

        //     }
        //   })

        // },function(err){
        //     console.log('服务端返回失败');
        //     console.log(err);
        // });
      },
    })


  }
})