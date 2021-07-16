const axios = require('axios')
const qs = require('qs')
const moment = require('moment')



const headers = {
  Referer: 'https://servicewechat.com/wx2c7f0f3c30d99445/76/page-frame.html'
}
const URL = 'https://cloud.cn2030.com/sc/wx/HandlerSubscribe.ashx'
// 可预约列表
let bookingList = []
// 可预约产品
let productionList = []
// 可秒杀列表
let seckillList = []
// show
let showList = []

const id = 0
const cityCode = 450400
const city = JSON.stringify(['广西壮族自治区', '梧州市', ''])
const product = 1

async function getList() {
  const params = {
    act: 'CustomerList',
    id: 0,
    product: 1,
    cityCode,
    city
  }
  return axios.get(`${ URL }?${ qs.stringify(params) }`, { headers }).then(async res => {
    // console.log(res)
    const { data } = res
    if (data.status === 200) {
      // console.log(data)
      const { list } = data
      // console.log(list)
      bookingList = list.filter(item => item.tags && item.tags.some(tag => tag === '可预约'))
      while (bookingList.length) {
        const bookingItem = bookingList.pop()
        const productList = await getProduct(bookingItem.id)
        await sleep(666)
        // console.log(productList, 'productList')
        productList.forEach(pro => {
          if (pro.enable && (/九价/.test(pro.text) || /九价/.test(pro.descript))) {
            productionList.push({
              parent_id: bookingItem.id,
              cname: bookingItem.cname,
              tel: bookingItem.tel,
              addr: bookingItem.addr,
              ...pro
            })
          }
        })
        // console.log(productionList)
      }
      
      // 查询具体日期
      // console.log(productionList.length,'00000000000000000')
      while (productionList.length) {
        const proItem = productionList.pop()
        await sleep(999)
        const proItemDate = await getSubscribeDateAll(proItem.parent_id)
        proItemDate.forEach(d => {
          console.log(proItem.cname)
          console.log(`[ ${ proItem.tel } ]`)
          console.log(`${ d.date } ----> ${ d.enable ? '可预约' : '已满😭' }`)
          console.log('                                                 ')
          if (d.enable) {
            seckillList.push({
              cname: proItem.cname,
              addr: proItem.addr,
              date: d.date
            })
          }
        })
        // console.log(showList)
      }
      
      if (seckillList.length) {
        seckillList.forEach(s => {
          console.log(s.cname)
          console.log(s.addr)
          console.log(s.date)
        })
      }
    }
  }).catch(() => {
    console.log('查询列表失败😭😭😭')
  })
}

async function getProduct(id) {
  const params = {
    act: 'CustomerProduct',
    id
  }
  return axios.get(`${ URL }?${ qs.stringify(params) }`, { headers }).then(async res => {
    const { data } = res
    if (data.status === 200) {
      return data.list
    }
    return []
  }).catch(() => {
    console.log('查询疫苗失败😭😭')
    return []
  })
}


// 获取所有订阅日期
async function getSubscribeDateAll(id) {
  const params = {
    act: 'GetCustSubscribeDateAll',
    pid: 1,
    id,
    month: moment().format('YYYYMM')
  }
  return axios.get(`${ URL }?${ qs.stringify(params) }`, { headers }).then(res => {
    const { data } = res
    // console.log(res)
    if (data.status === 200) {
      return data.list
    }
    return []
  }).catch(() => {
    console.log('查询日期失败😭😭')
    return []
  })
}


async function sleep(time = 3000) {
  return new Promise(resolve => setTimeout(resolve, time))
}

let index = 1
~(async function run() {
  while (!seckillList.length) {
    console.log(`第${ index }次查询`)
    console.log(`                `)
    await getList()
    await sleep()
    index++
  }
})()
