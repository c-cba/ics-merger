'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var fetch = _interopDefault(require('node-fetch'));
var ICAL = _interopDefault(require('ical.js'));

function merge(inputs){
	if(!Array.isArray(inputs))
		inputs = [...arguments];

	let calendar;
	for(let input of inputs){
		let jcal = ICAL.parse(input);
		let cal = new ICAL.Component(jcal);

		if(!calendar) {
			calendar = cal;
		}
		else {
			for(let vevent of cal.getAllSubcomponents('vevent')){
				calendar.addSubcomponent(vevent);
			}
		}
	}

	if(!calendar){
		console.error('No icals parsed successfully');
		return;
	}

	return calendar.toString();
}

const app = express();

app.get('/combined.ics', (req, res) => {

	if(!req.query.urls){
		res.sendStatus(400);
		return;
	}

	let inputs = [];
	let promises = [];
	for(let url of req.query.urls){
		promises.push(fetch(url).then(response => {
			return response.text();
		}).then(text => {
			inputs.push(text);
		}).catch(err => {
			console.error(`Error reading ${url}: ${err}`);
		}));
	}

	res.set('Expires', 'Mon, 01 Jan 1990 00:00:00 GMT');
	res.set('Date', new Date().toGMTString());
	res.set('Content-Type', 'text/calendar; charset=UTF-8');
	res.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
	res.set('Pragma', 'no-cache');

	Promise.all(promises).then(() => {
		res.send(merge(inputs));
	});
});

let port = 3000;
if(app.get('env') === 'production')
	port = 80;

app.listen(port, () => {
	console.log(`Listening on ${port}`);
});
