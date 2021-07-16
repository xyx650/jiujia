const axios = require('axios')
const qs = require('qs')

const sessionId = 'e0hbdwe5zkdgurukqxtvd33f'
const HEADERS = {
  Referer: 'https://servicewechat.com/wx2c7f0f3c30d99445/76/page-frame.html',
  Cookie: `ASP.NET_SessionId=${ sessionId }`,
  
  Connection: 'keep-alive',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac'
}

// 年月 YYYYMM
const MONTH = 202107
// 九价id=1 四价id=2 二价进口id=3
const PID = 3
// 接种单位 ID
const ID = 505
// 第几针
const FTIME = 2
// 猜测验证码X
let X = 105
// 用户信息
const USER = {
  birthday: '',
  tel: 12345678900,
  sex: 1,
  cname: '陆**',
  doctype: 1,
  idcard: '4****************'
}


const URL = 'https://cloud.cn2030.com/sc/wx/HandlerSubscribe.ashx'


const appointmentList = [] // 可预约列表
const list = []


const listUrl = 'https://cloud.cn2030.com/sc/wx/HandlerSubscribe.ashx'
const query = {
  act: 'CustomerList',
  // city 与 cityCode 需要对应，默认为空时不需要
  city: ['', '', ''],
  lat: '23.121686935424805',
  lng: '113.38758087158203',
  id: '0',
  cityCode: '440000',
  // 1 九价疫苗
  product: '1'
}


async function getList() {
  const params = qs.stringify({ ...query, city: JSON.stringify(query.city || ['', '', '']) })
  return axios.get(`${ listUrl }?${ params }`, {
    headers: HEADERS
  }).then((res) => {
    // console.log(res)
    const { data } = res
    // 请求成功
    if (data.status === 200) {
      const { list } = data
      // console.log(list)
      return list
      // return list.map(item => item.id)
    }
  }).catch((e) => {
    // console.log(e)
    console.log('获取列表失败')
    return []
  })
}

async function getProduct(customerList) {
  if (!customerList.id) {
    return
  }
  return axios.get(`https://cloud.cn2030.com/sc/wx/HandlerSubscribe.ashx?act=CustomerProduct&id=${ customerList.id }&lat=${ customerList.lat }&lng=${ customerList.lng }`, {
    headers: HEADERS
  }).then(res => {
    // console.log(res)
    const { data } = res
    if (data.status === 200) {
      // console.log(data.list)
      data.list.forEach(item => {
        item.id === PID && list.push(item)
        item.id === PID && item.enable && appointmentList.push(item)
      })
      console.log(`共查询到${ list.length }条九价记录`)
      console.log(`可预约${ appointmentList.length }条九价记录`)
    }
  }).catch(e => {
    // console.log('error', e)
    // console.log(customerList)
  })
}

async function run() {
  let count = 1
  while (count) {
    console.log(`----------------------第${ count }次查询开始----------------------`)
    const customerList = await getList()
    // console.log(customerList)
    // const user = await getUser()
    // console.log(user)
    while (customerList.length) {
      await getProduct(customerList.pop())
    }
    // console.log(`共查询到${ list.length }条九价记录`)
    // console.log(`可预约${ appointmentList.length }条九价记录`)
    console.log(`----------------------第${ count }次查询结束----------------------`)
    appointmentList.length = 0
    list.length = 0
    count++
    console.log('----------------------------------------------------------------')
    console.log('----------------------------------------------------------------')
  }
}

async function seckill() {
  book()
}


// 获取接种机构可预约的详情
async function book() {
  const params = {
    act: 'GetCustSubscribeDateAll',
    pid: PID,
    id: ID,
    month: MONTH
  }
  return axios.get(URL, {
    params,
    headers: HEADERS
  }).then(res => {
    // console.log(res)
    const { data } = res
    if (data.status === 200) {
      // console.log(data.list)
      const enableList = data.list.filter(item => item.enable)
      enableList.forEach(item => {
        bookDetail(item)
      })
    }
  }).catch(() => {
    console.log('查询预约失败')
  })
}

// 获取该机构下某个疫苗的预约日期详情
async function bookDetail({ date }) {
  const params = {
    act: 'GetCustSubscribeDateDetail',
    pid: PID,
    id: ID,
    scdate: date
  }
  return axios.get(URL, {
    params,
    headers: HEADERS
  }).then(async res => {
    // console.log(res)
    const { data } = res
    if (data.status === 200) {
      // console.log(data.list)
      const list = data.list
      // list.forEach(item => {
      //   const mxid = item.mxid
      //   getCaptcha(mxid).then(async captcha => {
      //     if (captcha) {
      //       const guid = await captchaVerify(mxid)
      //       if (guid) {
      //         await save20(date, mxid, guid)
      //       }
      //     }
      //   })
      // })
      let index = 0
      while (list.length) {
        const mxid = list[index].mxid
        const captcha = await getCaptcha(mxid)
        await sleep()
        if (captcha) {
          const guid = await captchaVerify(mxid)
          if (guid) {
            await save20(date, mxid, guid)
            index++
            list.pop()
          }
        }
      }
    }
  }).catch(() => {
    console.log('查询详情失败')
    return ''
  })
}

// 获取验证码
async function getCaptcha(mxid) {
  const params = {
    act: 'GetCaptcha',
    mxid
  }
  return axios.get(URL, {
    params,
    headers: HEADERS
  }).then(res => {
    console.log(res)
    const { data } = res
    return data.status === 0
  }).catch((e) => {
    console.log('获取验证码失败')
    return false
  })
}

getCaptcha('5nWoAANFAAAgZDQB')

// 验证码校验
async function captchaVerify(mxid) {
  const params = {
    act: 'CaptchaVerify',
    token: '',
    x: X,
    y: 5,
    mxid
  }
  return axios.get(URL, {
    params,
    headers: HEADERS
  }).then(res => {
    // console.log(res, '校验成功')
    return res.guid
  }).catch(() => {
    console.log('验证码校验失败')
    return ''
  })
}

function save20(date, mxid, guid) {
  const params = {
    act: 'Save20',
    ...USER,
    mxid,
    date,
    pid: PID,
    Ftime: FTIME,
    guid
  }
  return axios.get(URL, {
    params,
    headers: HEADERS
  })
}

async function sleep(time = 3000) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time)
  })
}

// seckill()

// run()





