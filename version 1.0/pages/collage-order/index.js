const app = getApp()
var template = require('../../template/template.js');

var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var that;
Page({
  data: {
    currentTab: 0,
    winHeight:"",
    winWidth:"",
  },
  onLoad: function () {
    that = this;
    //底部tabBar
    template.tabbar("tabBar", 3, this)//0表示第一个tabbar

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      },
    })
  },
  onShow:function (){
    //获取全部订单
    var currentUser = Bmob.User.current();
    var collageOrder = Bmob.Object.extend("collage_order");
    var query = new Bmob.Query(collageOrder);
    query.equalTo("orderUser",currentUser.id);
    query.descending("createdAt");
    query.find({
      success:function(result){
        var allOrder = [], //全部
          noPayment = [], //待付款
          shipments = [], //待发货
          Receiving = [], //待收货
          finish = []; //已完成
        for (var i=0;i<result.length;i++){
          var object = result[i];
          var status = '';

          var resData = {
            totalprice: object.get('totalprice'),
            remarks: object.get('remarks'),
            orderId: object.get('orderId'),
            status: status,
            orderDetail: object.get('orderDetail'),
            expressId: object.get('expressId'),
            createdAt: object.createdAt
          }

          switch(object.get('status')){
            case '0':
              resData.status ="待付款";
              noPayment.push(resData);
              break;
            case '1':
              resData.status ="待发货";
              shipments.push(resData);
              break;
            case '2':
              resData.status ="正在配送";
              Receiving.push(resData);
              break;
            case '3':
              resData.status ="已完成";
              finish.push(resData);
              break;
            default: //全部状态
          }

          allOrder.push(resData);

        }

        that.setData({
          allOrder: allOrder, //全部
          noPayment: noPayment, //待付款
          shipments: shipments, //待发货
          Receiving: Receiving, //待收货
          finish: finish
        })
        console.log(that.data.allOrder);
      },
      error:function(error){

      }
    })
  },
  swichNav:function(e){
    var that = this;

    if(this.data.currentTab === e.target.dataset.current){
      return false;
    }else{
      that.setData({
        currentTab:e.target.dataset.current
      })
    }
  },
  overOrder: function (e) {
    var that = this;
    var orderid = e.target.dataset.id;
    common.showModal('你确定收货了吗？', '提示', true, function (e) {

      if (e.confirm) {
        var Order = Bmob.Object.extend("collage_order");
        var query = new Bmob.Query(Order);
        query.equalTo("orderId", orderid);

        query.find().then(function (result) {

          for (let obj of result) {
            obj.set('status', '3')

          
            obj.save(null, {
              success: function () {
                common.showTip('收货成功');
                setTimeout(function () {
                  that.onShow()
                }, 1000);
              }
            });
          }
        }),
          function (error) {
            // 异常处理
          };


      }
    });
  },
  deleteOrder: function (e) {
    var that = this;
    var orderid = e.target.dataset.id;
    common.showModal('你确定删除订单吗？', '提示', true, function (e) {

      if (e.confirm) {
        //取消订单
        var Order = Bmob.Object.extend("collage_order");
        var query = new Bmob.Query(Order);
        query.equalTo("orderId", orderid);
        query.find().then(function (result) {
          return Bmob.Object.destroyAll(result);
        }).then(function (result) {
          common.showTip('删除订单成功');
          setTimeout(function () {
            that.onShow()
          }, 3000);
          // 删除成功
        }, function (error) {
          // 异常处理
        });
      }
    });
  },
  cancelOrder: function (e) {
    var that = this;
    var orderid = e.target.dataset.id;

    common.showModal('你确定取消订单吗？', '提示', true, function (e) {
      if (e.confirm) {

        //取消订单
        var Order = Bmob.Object.extend("collage_order");
        var query = new Bmob.Query(Order);
        query.equalTo("orderId", orderid);
        query.find().then(function (result) {
          return Bmob.Object.destroyAll(result);
        }).then(function (result) {
          common.showTip('取消订单成功');
          setTimeout(function () {
            that.onShow()
          }, 3000);
          // 删除成功
        }, function (error) {
          // 异常处理
        });
      }
    });
  },
  payOrder: function (e) {
    var orderid = e.target.dataset.id;
    var money = e.target.dataset.price
    var that = this;
  },
  selectExpress(e) {
    console.log(e);
    var expressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/expressInfo/index?expressId=' + expressId
    });
  }
})