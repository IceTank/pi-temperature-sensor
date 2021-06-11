const fs = require('fs');


const PathAllReadings = '../data/';


exports.readThemperatur = function() {
  const file = fs.readFileSync(ThermometerName, 'utf8');
  var themp;
  try {
    themp = Math.floor(Number(file.split('t=')[1].trim()) / 100) / 10;
  } catch (e) {
    console.error(e);
    themp = NaN;
  }
  return themp;
}
