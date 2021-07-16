const axios = require('axios')
const qs = require('qs')
const moment = require('moment')


const headers = {
  Referer: 'https://servicewechat.com/wx2c7f0f3c30d99445/76/page-frame.html'
}
const URL = 'https://cloud.cn2030.com/sc/wx/HandlerSubscribe.ashx'
const id = 0
const cityCode = 0
const city = JSON.stringify(['', '', ''])
// 广西坐标--广东坐标--湖南--海南
const lat = ['23.36708919154803', '23.13176873169885', '25.789161079153946', '20.006834618060857']
const lng = ['110.07174958203123', '113.3219860932617', '113.04595459912107', '110.3146504304199']
const array = ['广西', '广东', '湖南', '海南']
const bookingList = []

let index = 1

async function getList() {
  const params = {
    act: 'CustomerList',
    id: 0,
    product: 1,
    cityCode,
    city
  }
  
  return Promise.all(lat.map((_, _index) => {
    return axios.get(`${ URL }?${ qs.stringify({ ...params, lat: lat[_index], lng: lng[_index] }) }`, {
      headers
    }).then(res => {
      const { data } = res
      if (data.status === 200) {
        return data.list
      }
      return []
    }).catch(() => {
      console.log(`查询${ array[_index] }列表失败`)
      return []
    })
  })).then(async (res) => {
    let list = []
    res.forEach(l => {
      list = [...list, ...l]
    })
    // console.log(list, list.length)
    const length = list.length
    let _i = 1
    while (list.length) {
      const item = list.pop()
      console.log(`正在查询：${ item.cname }[ ${ _i } / ${ length } ]`)
      const pro = await getProductList(item.id)
      _i++
      console.log(`查询到 ${ pro.length } 条结果`)
      if (pro.length) {
        pro.forEach(p => {
          console.log(p.text)
          console.log(p.date)
          console.log(item.addr)
          bookingList.push({
            cname: item.cname,
            text: p.text,
            date: p.date,
            addr: item.addr
          })
        })
      }
      await sleep()
    }
    console.log(`第 ${ index } 次查询完毕，共查询到 ${ bookingList.length } 条记录`)
    if (bookingList.length) {
      bookingList.forEach((item, i) => {
        console.log(`${ i + 1 }---${ item.cname }`)
        console.log(`   ${ item.text }`)
        console.log(`   ${ item.date }`)
        console.log(`   ${ item.addr }`)
      })
    }
  }).catch(() => {
    console.log('查询列表失败')
    return []
  })
}

async function getProductList(id) {
  const params = {
    act: 'CustomerProduct',
    id
  }
  return axios.get(`${ URL }?${ qs.stringify(params) }`, { headers }).then(async res => {
    const { data } = res
    return data.status === 200 ? data.list.filter(p => /九价/.test(p.text) && p.date && p.date !== '暂无') : []
  }).catch(() => {
    console.log('查询疫苗失败😭😭')
    return []
  })
}


async function sleep(time = 777) {
  return new Promise(resolve => setTimeout(resolve, time))
}


(async function run() {
  while (1) {
    console.log(`第 ${ index } 次查询开始@@@@@@@@@@@@@@@@@@@@@@@@@@@@`)
    await getList()
    console.log(`第 ${ index } 次查询结束@@@@@@@@@@@@@@@@@@@@@@@@@@@@`)
    console.log(`  `)
    console.log(`  `)
    await sleep(4000)
    index++
    bookingList.length = 0
  }
})()