import express from 'express';
import fetch from 'node-fetch';

import merge from './index.js';

import dotenv from '../.env.json';

const app = express();

app.get('/combine.ics', (req, res) => {
	if(!req.query.urls){
		res.sendStatus(400);
		return;
	}

	let icals = getIcalsFromUrls(req.query.urls);

	setHeaders(res);

	let options = {};
	if(dotenv && dotenv.combine)
		options = Object.assign({}, dotenv.combine);
	options = Object.assign({}, options, req.query);

	icals.then(icals => {
		res.send(merge(icals, options));
	});
});

app.get('/basic.ics', (req, res) => {
	if(!dotenv || !dotenv.basic || !dotenv.basic.urls || !Array.isArray(dotenv.basic.urls)){
		res.sendStatus(501);
		return;
	}

	let icals = getIcalsFromUrls(dotenv.basic.urls);

	setHeaders(res);

	let options = Object.assign({}, dotenv.basic);

	icals.then(icals => {
		res.send(merge(icals, options));
	});
});

function setHeaders(res){
	res.set('Expires', 'Mon, 01 Jan 1990 00:00:00 GMT');
	res.set('Date', new Date().toGMTString());
	res.set('Content-Type', 'text/calendar; charset=UTF-8');
	res.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
	res.set('Pragma', 'no-cache');
}

let port = 3000;
if(app.get('env') === 'production')
	port = 80;

app.listen(port, () => {
	console.log(`Listening on ${port}`);
});

function getIcalsFromUrls(urls){
	let icals = [];
	let promises = [];
	for(let url of urls){
		promises.push(fetch(url).then(response => {
			return response.text();
		}).then(text => {
			icals.push(text);
		}).catch(err => {
			console.error(`Error reading ${url}: ${err}`);
		}));
	}

	return Promise.all(promises).then(() => {
		return icals;
	});
}
