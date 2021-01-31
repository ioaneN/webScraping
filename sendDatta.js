const puppeteer = require('puppeteer');
const rp = require('request-promise');
const $ = require('cheerio');
const request = require('request')
const NodeGeocoder = require('node-geocoder')
let obj
const geocoder = NodeGeocoder({
    provider: 'opencage',
    apiKey: '9957fb55e19a4e7fa4b39772d7ae7a0a'
  });
const url='someUrl'
const postRequest= async(obj)=>{
    console.log(obj)
    request.post({url:url', formData: obj}, function optionalCallback(err, httpResponse, body) {
        err 
         ?console.error('upload failed:', err)
         :console.log('Upload successful! Server responded with: ', body )
      })
}
const getCoor=async (obj)=>{
    const getLonLat=await geocoder.geocode(obj.Location)
    const longLat={
        longitude:getLonLat[0].longitude,
        latitude:getLonLat[0].latitude
    }
    return obj={
        ...obj,
        ...longLat
    }
  }
  
  


const getObject=(html)=>{
    obj=
    {
        Name:$('.listing-hero-title', html).text(),
        Date:$('.js-date-time-first-line', html).text(),
        Time:$('.js-date-time-second-line', html).text(),
        Price:$('.js-display-price', html).text().trim(),
        Location:'29 champs elysée paris',
        Organiser:$('.l-align-left > a', html).text().trim(),
        Description:$('.text-body-medium > strong', html).text(),
        Picture:$('picture', html).attr('content'),
        Text:$('.structured-content-rich-text', html).text().trim().replace('\t',""),
        longitude:0,
        latitude:0,
       
    }
    return obj
}


const eventScraping=   async (url) => {
    const browser = await puppeteer.launch(); 
    const page = await browser.newPage();
    await page.goto(`${url}`);
    const data =await page.$x(`//*[@id="root"]/div/div[2]/div/div/div/div[1]/div/main/div/div/section[1]/div[1]/div/ul//aside/a`)
    const hrefs= await Promise.all(data.map(
        async (item) => {
            let x=  await item.getProperty('href')
            let y=  x._remoteObject.value
            return y
        }
    ))
    hrefs.map((item,index,arr)=>item===arr[index+1]?arr.splice(index,1):null)
    hrefs.forEach(async (item)=>{
       const html= await  rp(item)
       getObject(html) // returns obj
        const postObj= await getCoor(obj) //returns obj with longitude and lagitute
       postRequest(postObj)
    })   
};

const numberOfPage=2

for(let i=1;i<=numberOfPage;i++){
    eventScraping(`https://www.eventbrite.com/d/online/all-events/?page=${i}`)
}






