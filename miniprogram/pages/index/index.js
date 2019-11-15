//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    image_a: '',
    image_b: '',
    imgPath:'',
    app_id: 2123939493,
    app_key: 'USKQCiyPOTvdfEMR',
    _openid: 'oMfVH4wZcFIrZ8noriIJJphy1N_4'
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  uploadImage() {
    let that = this
    // 从相册和相机中获取图片
    wx.chooseImage({
      count : 1,
      sizeType: ['compressed'],
      sourceType: ['album','camera'],
      success: function(res) {
        let imgPathA = res.tempFilePaths[0];
        
        let Abase64 = wx.getFileSystemManager().readFileSync(imgPathA, "base64")
        //Abase64 　= 'data:image/jpeg;base64,' + Abase64
        that.setData({
          image_a:Abase64
        },()=>{
          db.collection('student').where({
            _openid:that.data._openid
          }).get().then(res =>{
            let imgPathB = res.data[0].imgPath;
            let Bbase64 = wx.getFileSystemManager().readFileSync(imgPathB,"base64");
            //Bbase64 = 'data:image/jpeg;base64,' + Bbase64
            that.setData({
              image_b:Bbase64
            },() =>{
              console.log(that.data.image_a);
              console.log(that.data.image_b);
              console.log(that.data.app_id)
              wx.cloud.callFunction({
                name: 'faceCompare',
                data: {
                  "param": {
                    "app_id": that.data.app_id,
                    "image_a": that.data.image_a,
                    "image_b": that.data.image_b
                  },
                  "app_key": that.data.app_key
                },
              }).then(res => {
                res = res.result.replace(/\ufeff/g, "");
                res = JSON.parse(res)
                console.log(res);
                //console.log(res.result.data)
                //console.log(res.result.data.similarity)
                
                if (res.data.similarity > 70){
                  wx.navigateTo({
                    url: '../success/index',
                  })
                }else{
                  wx.navigateTo({
                    url: '../fail/index',
                  })
                }
              }).catch(err => {
                console.log("fail" + err);
              })
            })
          })
        })
      },
    })
  }
})
