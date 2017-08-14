//registerWxPay();

var wxready = false;

wx.ready(function () {
  wxready = true;
});
if (isWeixin()) {
  registerWxPay();
}
function registerWxPay() {
  xyz.ajax({
    url: 'WeixinWS/registerWxJs.xyz',
    progress: false,
    data: {
      url: window.location.href
    },
    success (data) {
      if (data.status === 1) {
        wx.config({
          debug: false,
          appId: data.content.appId,
          timestamp: data.content.timestamp,
          nonceStr: data.content.nonceStr,
          signature: data.content.signature,
          jsApiList: ['chooseWXPay']
        });
      } else {
        alert(data.msg);
      }
    }
  });
}

// xyz.id('payBtn').addEventListener('click', function (e) {
//     checkPayOrder();
// });

function checkPayOrder(orderNum, productNameCn, money) {

  if (xyz.isNull(orderNum)) {
    weui.alert('订单编号不存在无法发起支付');
    return;
  }
  if (xyz.isNull(money) || money <= Number(0)) {
    weui.alert('订单金额异常无法发起支付');
    return;
  }

  xyz.ajax({
    url: 'BuyerOrderWS/decideOrder.cus',
    data: {
      apikey: window.localStorage.apikey,
      orderNum: orderNum,
      money: money
    },
    success (data) {
      if (data.status === 1) {
        if (window.plus) {
          appPay(orderNum, money, productNameCn);
        } else if (isWeixin()) {
          wxJsPay(orderNum, money, productNameCn);
        } else {
          wxBarcodePay(orderNum, money, productNameCn);
        }
      }
    }
  });
}

function appPay(orderNum, money, productNameCn) {
  // 获取支付通道
  window.plus.payment.getChannels(function (channels) {
    wxPay(orderNum, money, productNameCn, channels);
  });
}

function wxBarcodePay(orderNum, money, productNameCn) {
  xyz.ajax({
    url: 'PayWS/getWxPayOrderInfo.cus',
    data: {
      apikey: window.localStorage.apikey,
      orderNo: orderNum,
      totalFee: money,
      body: productNameCn,
      tradeType: 'NATIVE'
    },
    success (data) {
      if (data.status === 1) {
        //生成二维码
        xyz.id('payBarcodeShow').innerHTML = "";
        var qrcode = new QRCode("payBarcodeShow", {
          text: data.content.code_url,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
        // var payBarcodeDiv = xyz.id('payBarcodeDiv');
        // payBarcodeDiv.style.display = 'block';
        vm.payBarcodeDiv = true;
        // payBarcodeDiv.addEventListener('click', function () {
        // payBarcodeDiv.style.display = 'none';
        // vm.payBarcodeDiv = false;
        // window.location.reload();
        // });
        intervalDecidePayOk(data.content.outTradeNo);
        //window.location.href = data.content.code_url;
      } else {
        weui.alert(data.msg);
      }
    }
  });
}

function wxJsPay(orderNum, money, productNameCn) {
  xyz.ajax({
    url: 'PayWS/getWxJsPayOrderInfo.xyz',
    data: {
      apikey: window.localStorage.apikey,
      orderNo: orderNum,
      totalFee: money,
      body: productNameCn,
      openid: window.localStorage.openid
    },
    success (data) {
      if (data.status === 1) {
        //alert(JSON.stringify(data));
        wx.chooseWXPay({
          timestamp: data.content.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
          nonceStr: data.content.nonceStr, // 支付签名随机串，不长于 32 位
          package: data.content.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
          signType: data.content.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
          paySign: data.content.paySign, // 支付签名
          success (res) {
            if ('chooseWXPay:ok' === res.errMsg) {
              weui.toast('<br/>恭喜您，支付成功！<br/><br/>', function () {
                xyz.back();
              });
              // intervalDecidePayOk(data.content.outTradeNo);
            } else {
              weui.toast('<br/>未完成支付<br/><br/>' + res.errMsg, function () {
                window.location.reload();
              });
            }
          }
        });
      } else {
        weui.alert(data.msg);
      }
    }
  });
}

function wxPay(orderNum, money, productNameCn, channels) {
  xyz.ajax({
    url: 'PayWS/getWxPayOrderInfo.cus',
    data: {
      apikey: window.localStorage.apikey,
      orderNo: orderNum,
      totalFee: money,
      body: productNameCn,
      tradeType: 'APP'
    },
    success (data) {
      if (data.status === 1) {
        var order = data.content;
        plus.payment.request(channels[0], order, function (result) {//根据支付通道调用对应客户端
          /* weui.toast("<br/>恭喜您，支付成功！<br/><br/>", function(){
           window.location.reload();
           }); */
          intervalDecidePayOk(order.outTradeNo);
        }, function (e) {
          weui.toast('<br/>未完成支付<br/><br/>', function () {
            window.location.reload();
          });
        });
      }
    }
  });
}

function aliPay(orderNum, money, productNameCn, channels) {
  xyz.ajax({
    url: 'PayWS/getAliPayOrderInfo.cus',
    data: {
      apikey: window.localStorage.apikey,
      orderNo: orderNum,
      totalFee: money,
      body: productNameCn
    },
    success (data) {
      if (data.status === 1) {
        var order = data.content;
        plus.payment.request(channels[0], order, function (result) {//根据支付通道调用对应客户端
          /* weui.toast("<br/>恭喜您，支付成功！<br/><br/>", function(){
           window.location.reload();
           }); */
          /*orderData2PaySuccess();*/
          intervalDecidePayOk(order.outTradeNo);
        }, function (e) {
          weui.toast('<br/>未完成支付<br/><br/>', function () {
            window.location.reload();
          });
        });
      }
    }
  });
}

function intervalDecidePayOk(outTradeNo) {
  xyz.ajax({
    url: 'PayWS/decidePayOk.cus',
    progress: false,
    data: {
      apikey: window.localStorage.apikey,
      outTradeNo: outTradeNo
    },
    success (data) {
      if (data.status === 1) {
        weui.hideLoading();
        weui.toast('支付成功！', function () {
          xyz.back();
        });
      } else {
        window.setTimeout('intervalDecidePayOk("' + outTradeNo + '")', 1000);
      }
    }
  });
}

function orderData2PaySuccess() {
  weui.loading(-1);
  window.localStorage.orderData2PaySuccess = xyz.id('orderInfo').innerText;
  xyz.open('page/paySuccess.html');
}
