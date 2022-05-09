// pages/getCoupon/getCoupon.js
var Bmob = require("../../utils/bmob.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupon:null
  },
  onShow() {
    const UserQuery = new Bmob.Query(Bmob.Object.extend("user_coupon"));
    const currentUser = Bmob.User.current();
    UserQuery.equalTo("user", currentUser.id);
    UserQuery.find({
      success: (results) => {
        let isCoupon = [];
        if (results){
          for (let object of results) {
            isCoupon.push(object.get('coupon').id)
          }
        }

        const coupon = Bmob.Object.extend("coupon");
        const query = new Bmob.Query(coupon);
        // 查询所有数据
        query.find({
          success: (results) => {

            let data = [];
            
            for(let object of results){
              let status = true;
              console.log(isCoupon.indexOf(object.id))
              if (isCoupon.indexOf(object.id) != -1){
                status = false
              }
              data.push({
                objectId: object.id,
                price: object.get('price'),
                nprice: object.get('nprice'),
                status: status
              })
            }

            this.setData({
              coupon: data
            })

            console.log(results)
          },
          error: (error) => {
            console.log("查询失败: " + error.code + " " + error.message);
          }
        });


      }      
    })

  },
  getCoupon(e){
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index;
    const data = this.data.coupon

    const Diary = Bmob.Object.extend("user_coupon");
    const diary = new Diary();

    const coupon = Bmob.Object.extend("coupon");
    const query = new Bmob.Query(coupon);

    const currentUser = Bmob.User.current();
    const me = new Bmob.User();

    me.id = currentUser.id;

    diary.set("user", me);
    diary.set("status", 0);
    const post = Bmob.Object.createWithoutData("coupon", id);
    diary.set("coupon", post);
    diary.save(null, {
      success: (result) => {
        wx.showToast({
          title: '领取成功',
          icon: 'success',
          duration: 1000,
        })
        data[index].status = !data[index].status
        this.setData({
          coupon: data
        })
      },
      error: (result, error) => {
        console.log('创建日记失败');
      }
    })


  }
})