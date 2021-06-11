var autoplay = true;
//width="800" height="800"
/*function createStats() {
var stats = new Stats();
stats.showPanel(0);
stats.dom.setAttribute('id', 'stats');
document.body.appendChild(stats.dom);
return stats;
} */

//var stats = createStats();
//setStatsVisibility(false);

var c = document.querySelector("#c");
var playing = true;
console.log(c);
c.width = window.innerWidth;
c.height = window.innerHeight;
var S = Math.sin;
var C = Math.cos;
var T = Math.tan;

function R(r, g, b, a) {
  a = a === undefined ? 1 : a;
  return "rgba(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + "," + a + ")";
};
var x = c.getContext("2d");
var time = 0;
var frame = 0;

function u(t) {
  c.width |= 0;
  for (i = 1; i < 140; i++) {
    b = 2 * t + i;
    o = 200 - (S(b + 5) * 126) % 256;
    x.fillStyle = R(0, o, 0, 1);
    //x.fillRect(940+((i/60)%1)*S(b)*200,400+i*6%400,8,8);
    x.fillRect(((c.width / 2)) + ((i / 60) % 1) * S(b) * 200, ((c.height / 2) - 200) + i * 6 % 400, 8, 8);
  }
}

function loop() {
  //stats = stats || createStats();

  if (playing) {
    requestAnimationFrame(loop);
  }
  time = frame / 60;
  if (time * 60 | 0 == frame - 1) {
    time += 0.000001;
  }
  frame++;

  try {
    //stats.begin();
    u(time / 3);
    //stats.end();
    //displayError("");
  } catch (e) {
    //displayError(e);
    throw e;
  }
}

if (autoplay) {
  loop();
}

function reset() {
  c = document.querySelector("#c");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}

window.onresize = (event) => {
  reset();
}
