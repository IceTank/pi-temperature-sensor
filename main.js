const PORT = 8080;
const UPDATE_INTERVAL = 60000; // intervals in ms

//Thermometer Configuration
const W1Thermometers = [{
	id: '28-01191a571ca1',
	name: 'Kessel',
	alias: 'therm1'
}, {
	id: '28-011919f26d68',
	name: 'Temperatur',
	alias: 'therm2'
}];

const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser')

const Thermometer = require('./module/thermometer.js');
const timer = require('./module/timer.js');
const files = require('./module/file.js');

//Start Thermometer
const allThermometers = (function() {
	var _temp = {};
	for (i in W1Thermometers) {
		_temp[W1Thermometers[i].alias] = new Thermometer(W1Thermometers[i].id, W1Thermometers[i].name);
	}
	return _temp;
})();

//Configured Graphs
const availableThermalGraphs = [{
	name: 'thermal1Day',
	description: 'Temperatur heute'
}, {
	name: 'thermal1Hour',
	description: 'Themperatur der letzten Stunde'
}, {
	name: 'thermal7Days',
	description: 'Temperatur der letzten 7 Tage'
}, {
	name: 'custom',
	description: 'Custom'
}];
const graphList = (function() {
	var list = [];
	for (i in availableThermalGraphs) {
		list.push(availableThermalGraphs[i].name);
	}
	return list;
})();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/webContent'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	if (req.query) {
		if (graphList.includes(req.query.graphType)) {
			// console.log('Render ' + req.query.graphType);
			res.render('graph', {
				thermalType: req.query.graphType,
				graphs: availableThermalGraphs
			})
			return;
		}
	}
	// console.log('Render thermalToday');
	res.render('graph', {
		thermalType: availableThermalGraphs[0].name,
		graphs: availableThermalGraphs
	});
});

app.get('/custom', (req, res) => {
	console.log('/custom');
	if (req.query) {
		if (req.query.options) {
			try {
				res.render('graph', {
					thermalType: 'custom',
					customData: req.query.options,
					graphs: availableThermalGraphs
				});
				return
			} catch (e) {
				console.log(e);
				res.end();
				return
			}
		}
	}
	// console.log('/custom', req.query, 'Redirect...');
	res.redirect('/custom?options=totalHours:5');
	// res.send(':(')
	return;
	res.render('graph', {
		thermalType: 'custom',
		customData: buildCustomData({
			totalDays: 1
		}),
		graphs: availableThermalGraphs
	})
})

app.get('/thermalNow', (req, res) => {
	console.log('/thermalNow');
	var data = {};
	for (i in allThermometers) {
		data[allThermometers[i].name] = allThermometers[i].readThemperatur();
	};
	res.json({
		date: new Date().toLocaleTimeString('de-DE', {
			hour12: false
		}),
		temp: data
	});
	// res.json(thermometer.readThemperatur());
})

app.get('/thermal7Days', (req, res) => {
	console.log('/thermal7Days');
	var data = [];
	for (i in allThermometers) {
		// console.log(allThermometers);
		data.push({
			name: allThermometers[i].name,
			data: allThermometers[i].graphData7Days()
		});
	};
	res.json(data)
})

app.get('/thermal1Day', (req, res) => {
	console.log('/thermal1Day');
	var data = [];
	for (i in allThermometers) {
		// console.log(allThermometers);
		data.push({
			name: allThermometers[i].name,
			data: allThermometers[i].graphData1Day()
		});
	};
	res.json(data);
})

app.get('/thermal1Hour', (req, res) => {
	console.log('/thermal1Hour');
	var data = [];
	for (i in allThermometers) {
		// console.log(allThermometers);
		data.push({
			name: allThermometers[i].name,
			data: allThermometers[i].graphDate1Hour()
		});
	};
	res.json(data);
})

app.get('/frame', (req, res) => {
	if (req.query && req.query.options) {
		var data = [];
		try {
			var lines = req.query.options.split(',');
			var options = {};
			for (k in lines) {
				var temp = lines[k].split(':');
				options[temp[0]] = temp[1];
			}
			console.log('/frame options:', options);
			for (i in allThermometers) {
				data.push({
					name: allThermometers[i].name,
					data: allThermometers[i].graphDataEasyGet(options)
				})
			}
			res.json(data);
			return;
		} catch (e) {
			console.log(e);
			res.send('Error creating graph');
		}
	} else {
		res.send('Invalid query')
	}
})

function buildCustomData(obj) {
	var str = "";
	var first = true;
	for (i in obj) {
		if (first) {
			str += `${i}:${obj[i]}`;
			first = false;
		} else {
			str += `,${i}:${obj[i]}`;
		}
	}
	return str;
}

//Start Server
app.listen(PORT, () => {
	console.log(`Server startet on Port: ${PORT}`);
});

//Start Thermometer reading Loop
(async () => {
	while (true) {
		await timer.sleepUntilNextMinute();
		for (i in allThermometers) {
			allThermometers[i].saveThemperatur();
		}
	}
})();
console.log('Starting Thermometer Interval 60 seconds');
