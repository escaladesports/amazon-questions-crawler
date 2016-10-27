'use strict'

const Horseman = require('node-horseman')

const defaultOptions = {
	page: 'https://www.amazon.com/ask/questions/asin/{{asin}}/1/ref=ask_ql_psf_ql_hza?sort=SUBMIT_DATE',
	userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
	elements: {
		// Searches whole page
		productTitle: '.askProductDescription a',
		questionBlock: '.askTeaserQuestions > div',
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
		.evaluate(function(opt){

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

		}, opt)
		.then(content => {
			// Find last review
			cb(false, content)
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


module.exports = crawlQuestions



