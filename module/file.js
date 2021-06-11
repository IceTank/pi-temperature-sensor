const fs = require('fs');
const dh = require('../module/date.js');

const PathData = './data/rawReadings/';
const UPDATE_INTERVAL = 60000;

function beautifyDayData(data) {
	const intervals = Math.floor((24 * 60 * 60 * 1000) / UPDATE_INTERVAL);
	const intervalSteps = UPDATE_INTERVAL;
	var dataRoundedTimestemp = {};

	for (i in data) {
		var timestemp = dh.getLowerMinute(data[i].time);
		dataRoundedTimestemp[timestemp] = {
			time: timestemp,
			temp: data[i].temp
		};
	}

	var beautifyData = {};
	var insertet = 0;
	for (var i = 0; i < intervals; i++) {
		var hours = Math.floor((i * intervalSteps / (1000 * 60 * 60)));
		var minutes = Math.floor((i * intervalSteps / (1000 * 60))) % 60;
		var seconds = 0;
		var index = dh.getTimeString(hours, minutes, seconds);
		if (dataRoundedTimestemp[index]) {
			beautifyData[index] = dataRoundedTimestemp[index];
			insertet++;
		} else {
			beautifyData[index] = {
				time: index,
				temp: NaN
			}
		}
	}
	// console.log(`BeautifyData insertet ${insertet} data Points out of ${intervals} Posible Data Points (${Math.floor(100 * insertet/intervals)}%)`);
	return beautifyData;
}

function spliceData(files, options) {
	options = options || {};
	options.timeInterval = 60000;
	options.timeSpanMin = options.timeSpanMin || 24 * 60;
	options.startTime = options.startTime || new Date();
	options.endTime = options.endTime || new Date(options.startTime.getFullYear(), options.startTime.getMonth(), options.startTime.getDate() - 7);
	var maxUnix = options.startTime.getTime();
	var minUnix = options.endTime.getTime();

	// console.log('Splicing Data', options);

	var splicedData = {};
	var array = [];
	for (i in files) {
		var day = beautifyDayData(files[i]);
		var date = dh.dateStringToDate(i);
		for (k in day) {
			var temp = k.split(':');
			var unixTimestemp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), temp[0], temp[1], temp[2]).getTime();
			// console.log(unixTimestemp, day, k);
			// return null;

			if ((unixTimestemp < maxUnix) && (unixTimestemp > minUnix)) {
				array.push({
					time: unixTimestemp,
					temp: day[k].temp
				});
			}
		}
	}
	sortArray = array.sort(function(a, b) {
		return b.time - a.time;
	});
	var str;
	for (i in sortArray) {
		var date = new Date(sortArray[i].time);
		var index = `${dh.getDateString(date.getDate(), date.getMonth(), date.getFullYear())}-${dh.getTimeString(date.getHours(), date.getMinutes(), 0)}`;
		const time = `${dh.getTimeString(date.getHours(), date.getMinutes())}`;
		// index = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}`
		splicedData[index] = {
			time: time,
			temp: sortArray[i].temp
		}
	}
	return splicedData;
}

function parseLogToData(file) {
	try {
		var data = [];
		lines = file.trim().split('\n');
		for (i in lines) {
			const temp = lines[i].split('-');
			data.push({
				time: temp[0],
				temp: temp[1]
			});
		}
		return data;
	} catch (e) {
		console.log(e);
		return null;
	}
}

exports.spliceData = spliceData
exports.parseLogToData = parseLogToData
exports.beautifyDayData = beautifyDayData
