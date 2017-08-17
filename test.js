'use strict'
const questionsCrawler = require('./app.js')
// https://www.amazon.com/ask/questions/asin/B003B809IG/1/ref=ask_ql_psf_ql_hza?sort=SUBMIT_DATE
questionsCrawler('B0076S64T0')
	.then(console.log)
	.catch(console.error)