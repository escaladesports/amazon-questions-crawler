'use strict'
const Nightmare = require('nightmare')
const random_ua = require('random-ua');

const defaultOptions = {
	page: 'https://www.amazon.com/ask/questions/asin/{{asin}}/1/ref=ask_ql_psf_ql_hza?sort=SUBMIT_DATE',
	elements: {
		// Searches whole page
		productTitle: '.askProductDescription a',
		questionBlock: '.askTeaserQuestions > div',
		questionDate: '.cdAuthorInfoBlock',
		author: '.cdAuthorInfoBlock a',
		// Searches within questionBlock
		question: 'a',
		link: 'a'
	},
	stopAtQuestionId: false
}

function crawlQuestions(asin, opt, cb) {
	// Find options
	if (typeof opt === 'function') {
		cb = opt
		opt = defaultOptions
	} else if (typeof opt === 'object') {
		let i
		for (i in defaultOptions) {
			if (!(i in opt)) {
				opt[i] = defaultOptions[i]
			}
		}
	}

	new Nightmare()
		.useragent(opt.userAgent || random_ua.generate())
		.goto(opt.page.replace('{{asin}}', asin))
		.wait(opt.elements.questionBlock)
		.evaluate(parseQuestions, opt)
		.end()
		.then(content => {
			crawlQuestionPages(content, opt, cb)
		})
		.catch(err => {
			if (err.toString().indexOf('TimeoutError') > -1) {
				// No questions
				cb(false, {
					title: false,
					questions: []
				})
			} else {
				cb(err)
			}
		})
}
// Find questions in browser
function parseQuestions(opt) {
	var questions = document.querySelectorAll(opt.elements.questionBlock)
	var title = document.querySelector(opt.elements.productTitle)
	title = title ? title.textContent.trim() : 'Not found'
	var arr = []
	for (var i = 0; i < questions.length; i++) {
		var link = questions[i].querySelector(opt.elements.link)
		if (link) {
			var text = questions[i].querySelector(opt.elements.question)
			var id = link.href.split('/')
			id = id[id.length - 2]
				// Stop crawling if ID is latest
			if (opt.stopAtQuestionId == id) {
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
function crawlQuestionPages(content, opt, cb) {
	const promises = []
	for (let i = content.questions.length; i--;) {
		promises.push(crawlSinglePage(content.questions[i], opt))
	}
	Promise.all(promises)
		.then(() => {
			cb(false, content)
		})
		.catch(cb)
}

function crawlSinglePage(obj, opt) {
	return new Promise((resolve, reject) => {
		new Nightmare()
			.useragent(opt.userAgent || random_ua.generate())
			.goto(obj.link)
			.wait(opt.elements.questionDate)
			.evaluate(parseDetails, opt)
			.end()
			.then(data => {
				obj.date = data.date
				obj.author = data.author
				resolve()
			})
			.catch((err) => {
				reject(err)
			})
	})
}
// Find date in browser
function parseDetails(opt) {
	var dateQuery = document.querySelector(opt.elements.questionDate)
	var authorQuery = document.querySelector(opt.elements.author).innerText

	var date = undefined;
	if (dateQuery) {
		var str = dateQuery.textContent.split(' on ')
		if (str && str[1]) {
			date = new Date(str[1].trim());
			if(date == 'Invalid Date') {
				date = undefined;
			}
		}
	}

	var author = 'Not found'
	if (authorQuery) {
		author = authorQuery;
	}
	return {
		date: date,
		author: author
	}
}


module.exports = crawlQuestions