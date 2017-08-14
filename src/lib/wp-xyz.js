/**
 * Created by Farkas on 2017/6/1.
 */

let jpgDefault = require('@/res/img/default.png')

//格式化日期
Date.prototype.xyzFormat = function (fmt) { // author: meizz
  let o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    "S": this.getMilliseconds()
    // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    }
  }
  return fmt
}

let thiz = window
let doc = thiz.document
let xyz = {}
xyz.config = {
  version: new Date().getTime()
}

if (process.env.NODE_ENV === 'production') {
  let p = thiz.location.pathname.indexOf('/xtTicket')
  xyz.config.server = thiz.localStorage.localPath ? 'http://www.lanpixiang.com/'
    : (thiz.location.origin + (p === 0 || p === -1 ? '/xtTicket/' : '/'))
} else {
  let config = require('@/../config')
  xyz.config.server = 'http://' + config.dev.local + ':' + config.dev.port + '/xtTicket/'
}

(function () {
  let n = navigator
  xyz.nav = {
    appCodeName: n.appCodeName,
    appMinorVersion: n.appMinorVersion,
    appName: n.appName,
    appVersion: n.appVersion,
    browserLanguage: n.browserLanguage,
    cookieEnabled: n.cookieEnabled,
    cpuClass: n.cpuClass,
    onLine: n.onLine,
    platform: n.platform,
    systemLanguage: n.systemLanguage,
    userAgent: n.userAgent,
    userLanguage: n.userLanguage
  }
})()

xyz.getFullurl = function (shortUrl) {
  //APP兼容代码
  if (!xyz.isNull(thiz.localStorage.localPath)) {
    // console.log(thiz.localStorage.localPath + shortUrl + '?__v=' + xyz.config.version)
    return thiz.localStorage.localPath + shortUrl + '?__v=' + xyz.config.version
  }

  return xyz.config.server + 'wap/' + shortUrl + '?__v=' + xyz.config.version
}
xyz.getSmallImageUrl = function (imageUrl) {
  if (!xyz.isNull(imageUrl) && imageUrl.indexOf('file.maytek.cn') > -1) {
    return imageUrl + '-small'
  }
  if (!xyz.isNull(imageUrl) && imageUrl.indexOf('file.duanyi.com.cn') > -1) {
    let index = imageUrl.lastIndexOf('/')
    return imageUrl.substring(0, index + 1) + "small_" + imageUrl.substring(index + 1, imageUrl.length)
  }
  //APP兼容代码
  if (!xyz.isNull(thiz.localStorage.localPath)) {
    return thiz.localStorage.localPath + 'img/default.png'
  }
  return jpgDefault
}
xyz.getMiddleImageUrl = function (imageUrl) {
  if (!xyz.isNull(imageUrl) && imageUrl.indexOf('file.maytek.cn') > -1) {
    return imageUrl + '-mid'
  }
  if (!xyz.isNull(imageUrl) && imageUrl.indexOf('file.duanyi.com.cn') > -1) {
    let index = imageUrl.lastIndexOf('/')
    return imageUrl.substring(0, index + 1) + "mid_" + imageUrl.substring(index + 1, imageUrl.length)
  }
  //APP兼容代码
  if (!xyz.isNull(thiz.localStorage.localPath)) {
    return thiz.localStorage.localPath + 'img/default.png'
  }
  return jpgDefault
}
xyz.isPhone = function (phone) {
  return (/^(((13[0-9])|(14[0-9])|(15[0-9])|(17[0-9])|(18[0-9]))+\d{8})$/).test(phone)
}
xyz.isNull = function (obj) {
  return (obj === undefined || obj === null || (obj + "".trim()) === "" || (obj + "".trim()) === '')
}
//是否为正整数
xyz.isPositiveNum = function (s) {
  let re = /^[0-9]*[1-9][0-9]*$/
  return re.test(s)
}
xyz.id = function (eleId) {
  return doc.getElementById(eleId)
}
xyz.q = function (selector) {
  let se = doc.querySelectorAll(selector)
  if (se.length === 1) {
    return se[0]
  } else {
    return se
  }
}
xyz.setUrlparam = function (url, param) {
  let pString = ''
  if (typeof param === 'object') {

    for (let p = 0; p < param.length; p++) {
      pString += encodeURIComponent(p) + '=' + encodeURIComponent(param[p]) + '&'
    }

  } else if (typeof param === 'string') {
    let arr = param.split('&')
    if (arr) {
      for (let i = 0; i < arr.length; i++) {
        let tt = arr[i].split('=')
        if (tt && tt.length === 2) {
          pString += encodeURIComponent(tt[0]) + '=' + encodeURIComponent(tt[1]) + "&"
        }
      }
    }
  } else {
    return url
  }
  return url + (url.indexOf('?') > -1 ? '&' : '?') + pString.substring(0, pString.length - 1)
}

xyz.getUrlparam = function () {
  let result = {}
  let q = location.search.substr(1)
  let qs = q.split("&")
  if (qs) {
    for (let i = 0; i < qs.length; i++) {
      let key = qs[i].substring(0, qs[i].indexOf("="))
      if (key !== '__v') {
        result[decodeURIComponent(key)] = decodeURIComponent(qs[i].substring(qs[i].indexOf("=") + 1))
      }
    }
  }
  return result
}

xyz.ajax = function (p) {
  if (p.data) {
    p.data._navigator_ = JSON.stringify(xyz.nav)
  }
  xyzAjax(p)
}

function xyzAjax(p) {
  let progress = ('progress' in p) ? p.progress : false
  //loading 是  vux  里的   loading 组件 如果想要展示加载中的弹出框 就必须传入该参数
  let loading = ('loading' in p) ? p.loading : false

  if (loading && loading.show) {
    loading.show({
      text: progress ? progress : '加载中...'
    })
  }

  if (thiz.vm && thiz.vm.loadingShow !== undefined) {
    thiz.vm.loadingShow = true
  }

  let option = {
    url: p.url ? (p.url.indexOf('http') === 0 ? p.url : xyz.config.server + p.url) : '',
    type: ('type' in p) ? p.type : "POST",
    dataType: ('dataType' in p) ? p.dataType : "json",
    sync: ('async' in p) ? p.async : true
  }
  //data、success、error
  let ajaxOption = {
    param: ('data' in p) ? p.data : {},
    success (data) {
      if (loading && loading.hide) {
        loading.hide()
      }
      p.success(data)
    },
    error (XMLHttpRequest, textStatus, errorThrown) {

      if (loading && loading.hide) {
        loading.hide()
      }

      let ErrorInfo = {}
      ErrorInfo.parsererror = "解析出错了！"
      ErrorInfo.timeout = "亲，网络不太顺畅~请重试~/(ㄒoㄒ)/~~"
      ErrorInfo.error = "请求出错！"
      ErrorInfo.abort = "请求被阻止或服务器无响应！"
      ErrorInfo.notmodified = "网络异常！"
      ErrorInfo.null = "网络异常！"
      ErrorInfo['Not Found'] = '请求地址未找到！'

      if (p.error ? (typeof p.error) === 'function' : false) {
        p.error(XMLHttpRequest, ErrorInfo[textStatus] ? ErrorInfo[textStatus] : textStatus, errorThrown)
      }

      /*if (ErrorInfo[textStatus]) {
       if ((typeof p.error) === 'function') {
       p.error(XMLHttpRequest, ErrorInfo[textStatus], errorThrown)
       return
       }
       thiz.alert(ErrorInfo[textStatus])
       }*/
    }
  }
  if ('jsonp' in p) {
    option.jsonp = p.jsonp
  }
  if (option.type.toUpperCase() === 'JSONP') {
    jsonp(ajaxOption, option)
  } else {
    ajax(ajaxOption, option)
  }
}

function ajax(ajaxOption, option) {
  let xhr = null
  if (thiz.plus && thiz.plus.net.XMLHttpRequest) {
    xhr = new thiz.plus.net.XMLHttpRequest()
  } else if (thiz.XMLHttpRequest) {//code for IE7, Firefox, Opera, etc.
    xhr = new XMLHttpRequest()
  } else if (thiz.ActiveXObject) {//IE6,5专用
    xhr = new thiz.ActiveXObject("Microsoft.XMLHTTP")
  }
  if (xhr !== null) {
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          if (typeof(ajaxOption.success) === 'function') {
            if (option.dataType && option.dataType.toUpperCase() === 'JSON') {
              let resultData = xhr.responseText
              try {
                resultData = eval('(' + xhr.responseText + ')')
              } catch (e) {
                resultData = {
                  status: 0,
                  msg: xhr.responseText
                }
              }
              ajaxOption.success(resultData)
            } else {
              ajaxOption.success(xhr.responseText)
            }
          }
        } else {
          if (typeof(ajaxOption.error) === 'function') {
            ajaxOption.error(xhr, xhr.statusText)
          }
        }
      }
    }
    let paramArray = []
    if ('param' in ajaxOption) {
      for (let p in ajaxOption.param) {
        if (ajaxOption.param.hasOwnProperty(p)) {
          paramArray[paramArray.length] = (encodeURIComponent(p) + '=' + encodeURIComponent(ajaxOption.param[p]))
        }
      }
    }
    let param = paramArray.join('&').replace('%20', '+')
    let url = option.type.toUpperCase() === 'GET' ? (option.url + '?' + param) : option.url
    //给url增加时间戳防止xhr读取缓存
    //url+=(url.indexOf('?')>-1 ? '&' : '?')+new Date().valueOf()
    xhr.open(option.type, url, option.sync)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
    xhr.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01")
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    if (option.type.toUpperCase() === 'GET') {
      xhr.send(null)
    } else if (option.type.toUpperCase() === 'POST') {
      xhr.send(param)
    }

  } else {
    throw new Error("您的浏览器不支持XMLHttpRequest")
  }
}

function insertScript(script) {
  let body = doc.getElementsByTagName('body')[0]
  let scriptTag = doc.createElement('script')
  scriptTag.type = 'text/javascript'
  scriptTag.src = script
  body.appendChild(scriptTag)
  body.removeChild(scriptTag)
}

function jsonp(ajaxOption, option) {
  let successCallbackName = '_xyzAjaxCallback_' + (new Date().valueOf())
  if ('success' in ajaxOption) {
    thiz[successCallbackName] = ajaxOption.success
  }
  let param = ""
  if ('param' in ajaxOption) {
    if ('jsonp' in option) {
      ajaxOption.param[option.jsonp] = successCallbackName
    } else {
      ajaxOption.param.callback = successCallbackName
    }
    for (let p in ajaxOption.param) {
      if (ajaxOption.param.hasOwnProperty(p)) {
        if (param.length > 1) {
          param += '&'
        }
        param += (p + '=' + encodeURIComponent(ajaxOption.param[p]))
      }
    }
  }
  let url = param.length > 1 ? (option.url + '?' + param) : option.url
  insertScript(url)
}

/**
 * 把毫秒转成中文的 xx天xx时xx分
 * @param time
 * @returns {String}
 */
xyz.getZhTime = function (time) {
  if (time === 0) {
    return '0分钟'
  }
  if (time < 0) {
    time = 0 - time
  }
  let day = parseInt(time / 86400000)
  let hour = parseInt((time - (86400000 * day)) / 3600000)
  let min = parseInt((time - ((86400000 * day) + (3600000 * hour)) ) / 60000)
  let result = day <= 0 ? '' : day + '天'
  if (day <= 0 && hour <= 0) {
    result += ''
  } else {
    result += hour + '时'
  }
  return result + min + '分'
}
/**
 * 把毫秒转成中文的剩余xx天或xx小时或xx分的奇葩效果
 */
xyz.getZhTimeQp = function (time) {
  if (time === 0) {
    return '0分钟'
  }
  if (time < 0) {
    time = 0 - time
  }
  if (time >= (2 * 86400000)) {
    return parseInt(time / 86400000) + "天"
  }
  if (time >= 3600000) {
    return parseInt(time / 3600000) + "小时"
  }
  return parseInt(time / 60000) + "分钟"
}
/**
 * 回退一个页面，返回处理
 */
xyz.back = function () {
  let p = xyz.getUrlparam()
  if (p && p.back) {
    thiz.location.href = p.back
    return
  }
  if (thiz.history.length > 1) {
    thiz.history.back()
    return true
  }
  return false
}
/**
 * 允许指定返回页面，没有指定则返回当前页
 * @param shortUrl
 * @param urlParams
 * @param backShortUrl
 * @param backUrlParams
 */
xyz.open = function (shortUrl, urlParams, backShortUrl, backUrlParams) {
  let params = urlParams ? urlParams : {}
  if (backShortUrl) {
    if (backUrlParams) {
      params.back = xyz.setUrlparam(xyz.getFullurl(backShortUrl), backUrlParams)
    } else {
      params.back = xyz.getFullurl(backShortUrl)
    }
  }
  thiz.location.href = xyz.setUrlparam(xyz.getFullurl(shortUrl), params)
}

xyz.href = function (path, id, params) {
  if (thiz.plus) {
    thiz.location.href = xyz.setUrlparam(xyz.getFullurl(path), params)
  } else {
    thiz.location.href = xyz.setUrlparam(xyz.getFullurl(path), params)
  }
}

export default xyz
