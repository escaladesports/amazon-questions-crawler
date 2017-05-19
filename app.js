'use strict'

const Horseman = require('node-horseman')

const defaultOptions = {
	page: 'https://www.amazon.com/ask/questions/asin/{{asin}}/1/ref=ask_ql_psf_ql_hza?sort=SUBMIT_DATE',
	userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
	elements: {
		// Searches whole page
		productTitle: '.askProductDescription a',
		questionBlock: '.askTeaserQuestions > div',
		questionDate: '.cdAuthorInfoBlock',
		// Searches within questionBlock
		question: 'a',
		link: 'a'
	},
	stopAtQuestionId: false
}

function crawlQuestions(asin, opt, cb){
	// Find options
	if(typeof opt === 'function'){
		cb = opt
		opt = defaultOptions
	}
	else if(typeof opt === 'object'){
		let i
		for(i in defaultOptions){
			if(!(i in opt)){
				opt[i] = defaultOptions[i]
			}
		}
	}

	const horseman = new Horseman()
	const pageLink = opt.page.replace('{{asin}}', asin)
	horseman
		.userAgent(opt.userAgent)
		.open(pageLink)
		.status()
		.then(status => {
			if(Number(status) >= 400){
				cb(`Page ${pageLink} failed with status: ${status}`)
			}
		})
		.waitForSelector(opt.elements.questionBlock)
		.evaluate(parseQuestions, opt)
		.then(content => {
			crawlQuestionPages(content, opt, cb)
			//cb(false, content)
		})
		.catch(err => {
			if(err.toString().indexOf('TimeoutError') > -1){
				// No questions
				cb(false, { title: false, questions: [] })
			}
			else{
				cb(err)
			}
		})
		.close()
}
// Find questions in browser
function parseQuestions(opt){
	var questions = document.querySelectorAll(opt.elements.questionBlock)
	var title = document.querySelector(opt.elements.productTitle)
	title = title ? title.textContent.trim() : 'Not found'
	var arr = []
	for(var i = 0; i < questions.length; i++){
		var link = questions[i].querySelector(opt.elements.link)
		if(link){
			var text = questions[i].querySelector(opt.elements.question)
			var id = link.href.split('/')
			id = id[id.length - 2]
			// Stop crawling if ID is latest
			if(opt.stopAtQuestionId == id){
				break
			}
			arr[i] = {
				id: id,
				link: link.href,
				question: text ? text.textContent.trim() : 'Not found'
			}
		}
	}
	return {
		title: title,
		questions: arr
	}
}

// Crawls individual questions pages
function crawlQuestionPages(content, opt, cb){
	const promises = []
	for(let i = content.questions.length; i--;){
		promises.push(crawlSinglePage(content.questions[i], opt))
	}
	Promise.all(promises)
		.then(() => {
			cb(false, content)
		})
		.catch(cb)
}
function crawlSinglePage(obj, opt){
	return new Promise((resolve, reject) => {
		const horseman = new Horseman()
			.userAgent(opt.userAgent)
			.open(obj.link)
			.then(status => {
				if(Number(status) >= 400){
					reject(`Page ${pageLink} failed with status: ${status}`)
				}
			})
			.waitForSelector(opt.elements.questionDate)
			.evaluate(parseDate, opt)
			.then(date => {
				obj.date = new Date(date).getTime()
				resolve()
			})
			.catch(reject)
			.close()
	})
}
// Find date in browser
function parseDate(opt){
	var el = document.querySelector(opt.elements.questionDate)
	var date = 'Not found'
	if(el){
		var str = el.textContent.split(' on ')
		if(str && str[1]){
			date = str[1].trim()
		}
	}
	return date
}





module.exports = crawlQuestions
