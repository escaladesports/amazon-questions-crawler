# Amazon Questions Crawler

Crawls product questions from Amazon.

## Installation

Via [npm](https://www.npmjs.com/):

```bash
npm install amazon-questions-crawler
```

Or [Yarn](https://yarnpkg.com/):

```bash
yarn add amazon-questions-crawler
```

## Usage

### Load the module

```javascript
var questionsCrawler = require('amazon-questions-crawler')
```

### Get questions by a product ASIN

```javascript
questionsCrawler('0062472100')
	.then(function(questions){
		console.log(questions)
	})
	.catch(function(err){
		console.error(err)
	})
```

This will return an object containing the title of the product and an array of questions data.

Example of a return:

```javascript
{
	title: "Product Name",
	questions: [
		{
			id: "Tx2FZP4T1BTNF6K",
			question: "Amazon user question here?",
			link: "https://www.amazon.com/forum/-/Tx3S3D31UW3GXGH/ref=ask_ql_ql_al_hza?asin=B00LB33S0Y"
		}
	]
}
```

## Options

Options can also be provided to change the user agent string, questions page, or elements being crawled.

Example:

```javascript
reviewsCrawler('0062472100', {
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
		// Stops crawling when it hits a particular question ID
		// Useful for only crawling new questions
		stopAtQuestionId: false
	})
	.then(console.log)
	.catch(console.error)
```