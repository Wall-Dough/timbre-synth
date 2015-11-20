var synth = null;
var wave = null;
var mul = null;
var poly = null;
var attack = null;
var release = null;
var hold = null;
var decay = null;
var level = null;

function octaveUp() {
  document.getElementById("octave").stepUp();
}

function octaveDown() {
  document.getElementById("octave").stepDown();
}

function pressKey(midi) {
  midi -= 48;
  var key = document.getElementById("key" + midi.toString());
  if (key != null) {
    var keyClass = key.getAttribute("class");
    if (keyClass != null) {
      if (keyClass.indexOf("pressed") < 0) {
        key.setAttribute("class", keyClass + " pressed");
      }
    }
    else {
      key.setAttribute("class", "pressed");
    }
  }
}

function unpressKey(midi) {
  midi -= 48;
  var key = document.getElementById("key" + midi.toString());
  if (key != null) {
    var keyClass = key.getAttribute("class");
    if (keyClass != null) {
      key.setAttribute("class", keyClass.replace(/( ?)pressed/, ""));
    }
  }
}

function octaveShift(midi) {
  midi -= 48;
  var octaveRange = document.getElementById("octave");
  var octave = Number(octaveRange.value);
  midi += octave * 12;
  return midi;
}

var blacks = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22, 25, 27];

function generatePiano() {
  var piano = document.getElementById("piano");
  var keys = document.createElement("tr");
  keys.setAttribute("id", "keys");
  for (var i = 0; i < 29; i++) {
    var key = document.createElement("td");
    if (blacks.indexOf(i) > -1) {
      key.setAttribute("class", "black");
    }
    key.setAttribute("id", "key" + i.toString());
    keys.appendChild(key);
  }
  piano.appendChild(keys);
}

function checkNewSynth() {
  var waveSel = document.getElementById("wave");
  var newWave = waveSel.options[waveSel.selectedIndex].value;

  var mulRange = document.getElementById("mul");
  var newMul = Number(mulRange.value);

  var polyRange = document.getElementById("poly");
  var newPoly = Number(polyRange.value);

  var attackRange = document.getElementById("attack");
  var newAttack = Number(attackRange.value);

  var releaseRange = document.getElementById("release");
  var newRelease = Number(releaseRange.value);

  var holdRange = document.getElementById("hold");
  var newHold = Number(holdRange.value);

  var decayRange = document.getElementById("decay");
  var newDecay = Number(decayRange.value);

  var levelRange = document.getElementById("level");
  var newLevel = Number(levelRange.value);

  if ((newWave !== wave) || (newMul !== mul) || (newPoly !== poly) || (newAttack !== attack) || (newRelease !== release) || (newHold !== hold)
      || (newDecay !== decay) || (newLevel !== level)) {
    if (synth != null) {
      synth.allNoteOff();
    }
    wave = newWave;
    mul = newMul;
    poly = newPoly;
    attack = newAttack;
    release = newRelease;
    hold = newHold;
    decay = newDecay;
    level = newLevel;
    var env = T("ahdsfr", {a: attack, r: release, h: hold, d: decay, lv: level});
    env.plot({target:wavePlot});
    synth = T("OscGen", {wave: wave, env: env, mul: mul}).play();
    synth.poly = poly;
  }
}

window.onload = function () {
  var keydict = T("ndict.key");
  var midicps = T("midicps");

  generatePiano();

  T("keyboard").on("keydown", function(e) {
    if (e.keyCode == 189) {
      // Pitch shift down
      console.log("Pitch shift down");
    }
    else if (e.keyCode == 187) {
      // Pitch shift up
      console.log("Pitch shift up");
    }
    else if (e.keyCode == 219) {
      // Octave down
      console.log("Octave down");
      octaveDown();
    }
    else if (e.keyCode == 221) {
      // Octave up
      console.log("Octave up");
      octaveUp();
    }
    var midi = keydict.at(e.keyCode);
    checkNewSynth();
    if (midi) {
      pressKey(midi);
      midi = octaveShift(midi);
      var freq = midicps.at(midi);
      console.log(midi);
      synth.noteOnWithFreq(freq, 100);
    }
  }).on("keyup", function(e) {
    var midi = keydict.at(e.keyCode);
    checkNewSynth();
    if (midi) {
      unpressKey(midi);
      midi = octaveShift(midi);
      synth.noteOff(midi, 100);
    }
  }).start();
}
