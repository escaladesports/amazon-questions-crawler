'use strict'
const questionsCrawler = require('./app.js')

// https://www.amazon.com/ask/questions/asin/B003B809IG/1/ref=ask_ql_psf_ql_hza?sort=SUBMIT_DATE
function testCrawler(){
	questionsCrawler('B003B809IG', function(err, questions){
		if(err) throw err
		console.log(questions)
	})
}


function testHorseman(){
	const Horseman = require('node-horseman')
	const horseman = new Horseman()
	const pageLink = 'https://google.com/'
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
