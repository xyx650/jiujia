const axios = require('axios')
const headers = {
  Cookie: 'PHPSESSID=micpg1f4q81ucs15s4qp27sve4; acw_tc=7d4d8ea716269411384121324ef7ca077ff088218c12057bbd54ece0fc',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.9(0x18000922) NetType/WIFI Language/en',
  Connection: 'keep-alive',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'en-us',
  'Upgrade-Insecure-Requests': '1',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  Host: 'w.hzzfy.com'
}

const url = 'http://w.hzzfy.com/hospital/public/index.php/wechat/nine_kinds_vaccine/nineappointment/id/5016.html'

axios.get(url, {
  headers
}).then(res => {
  console.log(res)
}).catch(e => {
  console.log(e)
})

