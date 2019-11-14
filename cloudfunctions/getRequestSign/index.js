// 云函数入口文件
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let param = event.param
  let app_key = event.app_key

  let sorted_key = Object.keys(param).sort()

  let sorted_param_strs = []
  for (var index in sorted_key) {
    let key = sorted_key[index]
    let value = param[key]

    if (value) {
      let quoted = encodeURIComponent(value)
      sorted_param_strs.push(key + "=" + quoted)
    }
  }

  sorted_param_strs.push("app_key=" + app_key)

  let request_str = sorted_param_strs.join('&')
  console.log(request_str)

  let crypto = require('crypto');
  let sign = crypto.createHash('md5').update(request_str).digest('hex');
  sign = sign.toUpperCase()

  return {
    event,
    sign: sign
  }
}