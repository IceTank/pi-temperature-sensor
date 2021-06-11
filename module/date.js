exports.getCurrentgetDateString = function() {
  const now = new Date();
  // return `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;
  return getDateString(now.getDate(), now.getMonth(), now.getFullYear());
}

exports.getCurrentTimeString = function() {
  const now = new Date();
  return getTimeString(now.getHours(), now.getMinutes(), now.getSeconds());
}

exports.getCurrentDateJson = function() {
  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear()
  }
}

function getDateString(day, month, year) {
  function pad(num) {
    if (String(num).length < 2) {
      return '0' + num;
    } else {
      return '' + num;
    }
  }
  return `${pad(day)}-${pad(month)}-${year}`;
}

function getTimeString(hours, minutes, seconds) {
  function pad(num) {
    if (String(num).length < 2) {
      return '0' + num;
    } else {
      return '' + num;
    }
  }
  if (seconds == undefined) {
    return `${pad(hours)}:${pad(minutes)}`;
  } else {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}

exports.getLowerMinute = function(date) {
  var arr = date.trim().split(':');
  return getTimeString(arr[0], arr[1], 0);
}

exports.unixToTimeString = function(unixMs) {
  var date = new Date(unixMs);
  return getTimeString(date.getHours(), date.getMinutes(), date.getSeconds());
}

exports.timeToUnix = function(date, time) {
  date = new Date(date + " " + time);
  if (date.getDate() == NaN) {
    console.log('Date Conversion Failed Panic');
    return null;
  } else {
    return date.getTime();
  }
}

exports.dateStringToUnix = function(date) {
  return dateStringToDate(date).getTime();
}

function dateStringToDate(date) {
  var temp = date.split('.log')[0].split('-');
  return new Date(temp[2], temp[1], temp[0]);
}

exports.dateStringToDate = dateStringToDate
exports.getTimeString = getTimeString
exports.getDateString = getDateString
