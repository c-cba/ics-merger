'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var ICAL = _interopDefault(require('ical.js'));

var icalMerger = {"prodid":"-//Jacob Mischka//iCal Merger//EN","version":"2.0"};

function merge(inputs, options = {}){
	if(!Array.isArray(inputs))
		inputs = [...arguments];

	let calendar;
	for(let input of inputs){
		let jcal = ICAL.parse(input);
		let cal = new ICAL.Component(jcal);

		if(!calendar) {
			calendar = cal;
			calendar.updatePropertyWithValue('prodid', icalMerger.prodid);
			calendar.updatePropertyWithValue('version', icalMerger.version);

			if(options.calname)
				calendar.updatePropertyWithValue('x-wr-calname', options.calname);
			if(options.timezone)
				calendar.updatePropertyWithValue('x-wr-timezone', options.timezone);
			if(options.caldesc)
				calendar.updatePropertyWithValue('x-wr-caldesc', options.caldesc);
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

module.exports = merge;
