const puppeteer = require('puppeteer');
const rp = require('request-promise');
const $ = require('cheerio');
const request = require('request')
const config =require('./config.json');
const { link } = require('fs');
const { spawn } = require('child_process');

const autoScroll=async (page)=>{
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight
                window.scrollBy(0, distance)
                totalHeight += distance

                if(totalHeight >= scrollHeight){
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    })
}


(async()=>{
    // launches virtual browser chromium 
    const browser = await puppeteer.launch({
        headless: false,
    })

    //opens a new page
     const page = await browser.newPage()

     // override permissions such as geolocation and notifications
     const context = browser.defaultBrowserContext();
     context.overridePermissions("https://www.facebook.com", ["geolocation", "notifications"]);
     context.overridePermissions("https://www.facebook.com/search/events/?q=%20Los-Angeles%20events", ["geolocation", "notifications"]);

    //goes to facebook and types login and email 
        await page.goto('https://www.facebook.com/login',{waitUntil:'networkidle0'})
        await page.type('#email',config.username)
        await page.type('#pass',config.password)
        await page.click('#loginbutton')

        // waits untill everything is loaded
        await page.waitForNavigation({waitUntil:'networkidle2'})
       


        // goes to events page and waits untill everything is loaded
        await page.goto(`https://www.facebook.com/search/events/?q=%20Los-Angeles%20events`,{waitUntil: 'networkidle2'})

        // Scroll Automatically to the Bottom of the Page
        await autoScroll(page)
        
        // takes html from event page
        const data = await page.evaluate(() => document.querySelector('*').outerHTML)

        // gets all the href attributes of events
        const links= $('.nc684nl6 > .oajrlxb2', data)
     
       
       

       // creates array with href attributes as item 
    let arr=[]
        for(let i=0;i<links.length;i++){
            arr.push(links[`${i}`].attribs.href)
        }
    console.log(arr)

    
    //goes to the event page and takes tittle and date
    let obj
       for(let i=0;i<15;i++){
            await page.goto(`https://www.facebook.com/${arr[`${i}`]}`,{waitUntil: 'networkidle0'})
            const dataEvent = await page.evaluate(() => document.querySelector('*').outerHTML)
            const date=$('.bi6gxh9e  > h2',dataEvent).first().text()
            const title=$('.bi6gxh9e  > h2',dataEvent).last().text()
            obj={
                title:title,
                date:date
            }
            console.log(obj)
        }
})()

 



