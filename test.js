'use strict'
const questionsCrawler = require('./app.js')

// https://www.amazon.com/ask/questions/asin/1503364127/1/ref=ask_ql_psf_ql_hza?sort=SUBMIT_DATE
function testCrawler(){
	questionsCrawler('B003145K3E', function(err, questions){
		if(err) throw err
		console.log(questions)
	})
}


function testHorseman(){
	const Horseman = require('node-horseman')
	const horseman = new Horseman()
	const pageLink = 'https://google.com/'
	const userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0'
	horseman
		.userAgent(userAgent)
		.open(pageLink)
		.status()
		.then(status => {
			if(Number(status) >= 400){
				console.error(`Page ${pageLink} failed with status: ${status}`)
			}
		})
		.evaluate(function(){
			return document.querySelector('title').textContent
		})
		.then(content => {
			console.log(content)
		})
		.catch(err => {
			console.error(err)
		})
		.close()
}

testCrawler()