exports.callOnNextFullNMinute = function(nMinute, callback) {
	var milis = nMinute * 60 * 1000
	var now = new Date()
	var rounded = new Date(Math.ceil(now.getTime() / milis ) * milis)
	var milisTill = rounded.getTime() - now.getTime()
	setTimeout(() => {
		callback()
	}, milisTill)
	return milisTill
}

exports.sleep = function(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  })
}

exports.sleepUntilNextMinute = function() {
  return new Promise((resolve) => {
    const sleepMinutes = 1;
    const extraDelay = 100;
    var milis = sleepMinutes * 60000;
  	var now = new Date();
  	var rounded = new Date(Math.ceil(now.getTime() / milis ) * milis);
  	var milisTill = rounded.getTime() - now.getTime() +extraDelay;
    setTimeout(() => {
      resolve();
    }, milisTill);
  });
}
