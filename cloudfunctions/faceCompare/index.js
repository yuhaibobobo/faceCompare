// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {

    const wxContext = cloud.getWXContext()
    let param = event.param;
    
    let app_key = event.app_key
    let time_in_sec = Math.floor(new Date().getTime() / 1000)
    param["time_stamp"] = time_in_sec.toString();
    param["nonce_str"] = Math.random().toString(36).slice(-8)

    let res = await cloud.callFunction({
      name: 'getRequestSign',
      data: {
        param: param,
        app_key: app_key
      }
    })
    param["sign"] = res.result.sign;
    console.log(res.result.sign);
    let request = require("request-promise")
    res = await request.post({
      url: "https://api.ai.qq.com/fcgi-bin/face/face_facecompare",
      qs: param
    })
    return res
  }

