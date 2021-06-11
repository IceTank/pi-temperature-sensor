const fs = require('fs');
const dh = require('../module/date.js');
const fh = require('../module/file.js');

const PathData = './data/rawReadings/';
const W1Path = '/sys/bus/w1/devices/';

//28-01191a571ca1/w1_slave

const UPDATE_INTERVAL = 60000;

class Thermometer {
  constructor(W1_Id, name) {
    this.W1_Id = W1_Id;
    this._name = name;
  }

  get name() {
    return this._name;
  }

  readThemperatur() {
    const temp = this.readThemperaturRaw();
    var therm;
    try {
      therm = Math.floor(Number(temp) / 100) / 10;
    } catch (e) {
      console.error(e);
      therm = NaN;
    }
    return therm;
  }

  readThemperaturRaw() {
    const file = fs.readFileSync(`${W1Path}${this.W1_Id}/w1_slave`, 'utf8');
    return file.split('t=')[1].trim();
  }

  saveThemperatur() {
    try {
      fs.statSync(`${PathData}${this.W1_Id}`);
    } catch (e) {
      console.log(e);
      fs.mkdirSync(`${PathData}${this.W1_Id}`)
      console.log('Created Folder ' + `${PathData}${this.W1_Id}`);
    }
    try {
      const temperatur = this.readThemperaturRaw();
      const line = `${dh.getCurrentTimeString()}-${temperatur}\n`;
      const date = dh.getCurrentgetDateString();
      fs.appendFile(`${PathData}${this.W1_Id}/${date}.log`, line, (err) => {
        if (err) {
          console.log(err);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  graphData7Days() {
    return this.graphDataEasyGet({
      totalDays: 7
    })
  }

  graphData1Day() {
    return this.graphDataEasyGet({
      totalDays: 1
    })
  }

  graphDate1Hour() {
    return this.graphDataEasyGet({
      totalHours: 1
    });
  }

  graphDataEasyGet(options) {
    //startTime = minimales alter der daten
    //endTime = maximales alter der daten
    var startTime, endTime, totalDays;
    if (options.startTime == 'now') {
      startTime = new Date();
    } else if (typeof options.startTime == 'number') {
      startTime = new Date(options.startTime);
    } else {
      startTime = new Date();
    }
    if (options.totalDays && typeof options.totalDays == 'number') {
      endTime = new Date(startTime.getTime());
      endTime.setDate(endTime.getDate() - options.totalDays);
      // totalDays = options.totalDays;
    } else if (options.totalHours){
      endTime = new Date(startTime.getTime());
      // console.log('End Time totalDays Pre:', endTime, ' ', endTime.getTime());
      endTime.setHours(endTime.getHours() - options.totalHours);
      // console.log('End Time totalDays After:', endTime, ' ', endTime.getTime());
    } else {
      if (typeof options.endTime == 'number') {
        endTime = new Date(options.endTime);
        // totalDays = Math.ceil((endTime.getTime() - startTime.getTime()) / 60000 * 60 * 24);
      } else {
        endTime = new Date(startTime.getTime());
        endTime.setDate(endTime.getDate() -1);
      }
    }
    totalDays = 1 + Math.ceil((startTime.getTime() - endTime.getTime()) / (60000 * 60 * 24));

    var lookingFor = [];
    for (var i = 0; i < totalDays; i++) {
      const date = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() - i);
      lookingFor.push(`${dh.getDateString(date.getDate(), date.getMonth(), date.getFullYear())}`)
    }

    // console.log('Found Files:', lookingFor);
    var bigData = {};
    for (var i = 0; i < lookingFor.length; i++) {
      var file;
      try {
        file = fs.readFileSync(PathData + this.W1_Id + '/' + lookingFor[i] + '.log', 'utf8');
        // console.log(lookingFor[i]);
        bigData[lookingFor[i]] = fh.parseLogToData(file);
      } catch (e) {
        //set dummy Data
        bigData[lookingFor[i]] = [];
        // console.log(e);
      }
    }
    // console.log(bigData);
    // console.log('Found: ' + bigData.length);
    // console.log('Easy Get endtime: ', endTime);
    try {
      var temp = fh.spliceData(bigData, {
        endTime: endTime
      });
      return temp;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

module.exports = Thermometer

// exports.saveThemperatur = saveThemperatur
// exports.readThemperatur = readThemperatur
