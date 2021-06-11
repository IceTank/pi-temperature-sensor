var ctx = document.getElementById('myChart').getContext('2d');
var chart;
const colors = {
	backgroundColor: ['rgb(255, 99, 132)', 'rgb(245, 220, 88)'],
	borderColor: ['rgb(255, 99, 132)', 'rgb(245, 220, 88)']
}
var _currentColor = 0;
var graphAutoUpdate = false;
var graphAutoUpdateIntervalHandle;

function fetchUrl(url) {
	console.log(url);
	return new Promise((resolve, reject) => {
		fetch(url, {
				methode: 'GET'
			})
			.then(response => response.json())
			.then(data => {
				resolve(data);
			});
	})
}

function updateTempTicker() {
	fetchUrl('/thermalNow').then((data) => {
		try {
			str = "";
			for (i in data.temp) {
				str += i + ': ' + data.temp[i] + 'C° ';
			}
			document.getElementById('thermalNow').innerText = str;
			document.getElementById('currentTemperaturDate').innerText = 'Temperatur ' + data.date + ':';
		} catch (e) {
			console.log('Error momentane Temperatur abfrage gescheitert:',e);
			document.getElementById('thermalNow').innerText = 'error';
		}
	});
}

function nextColor(type) {
	var temp = {
		backgroundColor: colors.backgroundColor[_currentColor],
		borderColor: colors.borderColor[_currentColor]
	}
	_currentColor = (++_currentColor) % Object.keys(colors).length;
	return temp;
}

function processData(data) {
	var preProcessData = [];
	var labels = [];
	var longestLabels = 0;
	var longestLabelsIndex = 0;
	for (i in data) {
		length = Object.keys(data[i].data).length;
		if (longestLabels < length) {
			longestLabels = length;
			longestLabelsIndex = i;
		}
	}

	for (k in data[longestLabelsIndex].data) {
		labels.push(data[longestLabelsIndex].data[k].time);
	}
	labels = labels.reverse();
	for (i in data) {
		var graph = [];
		for (k in data[i].data) {
			if (data[i].data[k].temp) {
				graph.push(Number(data[i].data[k].temp) / 1000);
			} else {
				graph.push(NaN);
			}
		}
		preProcessData.push({
			name: data[i].name,
			data: graph.reverse()
		});
	}

	var _dataset = [];
	for (i in preProcessData) {
		var colors = nextColor();
		_dataset.push({
			label: preProcessData[i].name,
			backgroundColor: colors.backgroundColor,
			borderColor: colors.borderColor,
			data: preProcessData[i].data
		})
	}

	return [labels, _dataset];
}

function newChart(dataset, labels) {
	chart = new Chart(ctx, {
		type: 'line',

		data: {
			labels: labels,
			datasets: dataset
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						// min: 5,
						// max: 40
					},
					scaleLabel: {
						display: true,
						labelString: "Grad C°"
					}
				}],
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: "Uhrzeit"
					},
				}]
			},
			elements: {
				line: {
					fill: false,
					lineTension: 0.4
				},
				point: {
					radius: 2,
					hitRadius: 5
				}
			}
		}
	});
}

function loadNewChartData(datasets, labels) {
	chart.data.labels = labels;
	chart.data.datasets = datasets;
	chart.update();
}

function submitCustomGraphData() {
  var type = document.getElementById('graphSelector').value;
	fetchUrl(fetchCustom()).then((data) => {
		var processedData = processData(data);
		loadNewChartData(processedData[1], processedData[0]);
		document.getElementById('thermalTitle').innerText = '';
	})
}

function updateGraphData() {
	var type = document.getElementById('graphSelector').value;
  var typeOld = document.getElementById('chartInfo').getAttribute('thermalType');
	if (type != 'custom') {
    if (typeOld == 'custom') {
      changePage();
    } else {
      document.getElementById('chartInfo').setAttribute('thermalType', type);
      document.getElementById('thermalTitle').innerText = 'Lade Grafik';
  		fetchUrl('/' + type).then((data) => {
  			// fetchUrl('/thermalToday').then((data) => {
  			var dataset = processData(data);
  			// console.log(dataset);
  			loadNewChartData(dataset[1], dataset[0]);
  			document.getElementById('thermalTitle').innerText = '';
  		});
    }
	} else {
    if (typeOld == 'custom') {
      submitCustomGraphData();
    } else {
      changePage();
    }
  }
}

function changePage() {
  var type = document.getElementById('graphSelector').value;
  if (type == 'custom') {
    window.location = '/custom';
  } else {
    window.location = '/?graphType=' + type;
  }
}

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

function fetchCustom() {
	var options = {};
	var startTime = document.getElementById('selectorStartTime').value;
	var durration = document.getElementById('selectorDurration').value;
	switch (startTime) {
		case 'startNow':
			options['startTime'] = 'now'
			break;
		case 'start6hoursAgo':
			var date = new Date();
			date.setHours(date.getHours() - 6);
			options['startTime'] = date.getTime();
			break;
		case 'start1daysAgo':
			var date = new Date();
			date.setHours(date.getDate() - 1);
			options['startTime'] = date.getTime();
			break;
		case 'start2daysAgo':
			var date = new Date();
			date.setHours(date.getDate() - 2);
			options['startTime'] = date.getTime();
			break;
	}
	switch (durration) {
		case 'durration1hours':
			options['totalHours'] = 1;
			break;
		case 'durration6hours':
			options['totalHours'] = 6;
			break;
		case 'durration1days':
			options['totalDays'] = 1;
			break;
		case 'durration2days':
			options['totalDays'] = 2;
			break;
		default:
	}
	var _temp = buildCustomData(options);
	var _newUrl = '/frame?options=' + _temp;
	// console.log('Fetch custom: ' + _newUrl);
	return _newUrl;
}

function initGraph() {

	var thermalType = document.getElementById('graphSelector').value
	if (thermalType == 'custom') {
		var customData = document.getElementById('chartInfo').getAttribute('customData');
		var lines = customData.split(',');
		var options = {};
		for (k in lines) {
			var temp = lines[k].split(':');
			options[temp[0]] = temp[1];
		}
		fetchUrl('/frame?options=' + buildCustomData(options)).then((data) => {
			var dataset = processData(data);
			document.getElementById('thermalTitle').innerText = "";
			// console.log(dataset);
			newChart(dataset[1], dataset[0]);
		})
		// data = JSON.parse(document.getElementById('custom').innerText);
	} else {
		fetchUrl('/' + thermalType).then((data) => {
			// fetchUrl('/thermalToday').then((data) => {
			var dataset = processData(data);
			document.getElementById('thermalTitle').innerText = "";
			// console.log(dataset);
			newChart(dataset[1], dataset[0]);
		})
	}
}

function startAutoUpdateGraph() {
  if (!graphAutoUpdate) {
    graphAutoUpdate = true;
    graphAutoUpdateIntervalHandle = setInterval(() => {
      updateGraphData();
    }, 60000);
  }
}

function stopAutoUpdateGraph() {
  graphAutoUpdate = false;
  clearInterval(graphAutoUpdateIntervalHandle);
}

function checkboxClicked() {
  var state = document.getElementById('autoUpdateGraph').checked;
  if (state) {
    console.log('Starting Auto Update');
    startAutoUpdateGraph();
  } else {
    console.log('Stopping Auto Update');
    stopAutoUpdateGraph();
  }
}

function init() {
	const temperaturTickerInterval = 60000;
	// var chartInfo = document.getElementById('chartInfo');
	// var thermalType = chartInfo.getAttribute('thermalType');
	updateTempTicker();
	initGraph();

	setInterval(() => {
		updateTempTicker();
	}, temperaturTickerInterval);
	// startGraph();
	// var graphType = document.getElementById('graphType').value;
}

init();
