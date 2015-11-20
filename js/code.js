var synth = null;
var wave = null;
var mul = null;
var poly = null;
var attack = null;
var release = null;
var hold = null;
var decay = null;
var level = null;
var fontNum = null;
var soundfont = null;
var mode = 0;
var keydict;
var midicps;

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

function stop(midi) {
  if (mode == 0) {
    synth.noteOff(midi, 100);
  }
}

function play(midi) {
  if (mode == 0) {
    var freq = midicps.at(midi);
    console.log(midi);
    synth.noteOnWithFreq(freq, 100);
  }
  else {
    T.soundfont.play(midi);
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
var buttons = ["Z", "S", "X", "D", "C", "V", "G", "B", "H", "N", "J", "M", ",/Q", "L/2", "./W", "3", "E", "R", "5", "T", "6", "Y", "7", "U", "I", "9", "O", "0", "P"];

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
    key.innerHTML = buttons[i];
    keys.appendChild(key);
  }
  piano.appendChild(keys);
}

var soundfontList = ["Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano","Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet", "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular Bells", "Dulcimer", "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ", "Accordion", "Harmonica", "Tango Accordion", "Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)", "Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar Harmonics", "Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2", "Violin", "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani", "String Ensemble 1", "String Ensemble 2", "Synth Strings 1", "Synth Strings 2", "Choir Aahs", "Voice Oohs", "Synth Choir", "Orchestra Hit", "Trumpet", "Trombone", "Tuba", "Muted Trumpet", "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2", "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet", "Piccolo", "Flute", "Recorder", "Pan Flute", "Blown bottle", "Shakuhachi", "Whistle", "Ocarina", "Lead 1 (square)", "Lead 2 (sawtooth)", "Lead 3 (calliope)", "Lead 4 chiff", "Lead 5 (charang)", "Lead 6 (voice)", "Lead 7 (fifths)", "Lead 8 (bass + lead)", "Pad 1 (new age)", "Pad 2 (warm)", "Pad 3 (polysynth)", "Pad 4 (choir)", "Pad 5 (bowed)", "Pad 6 (metallic)", "Pad 7 (halo)", "Pad 8 (sweep)", "FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)", "FX 5 (brightness)", "FX 6 (goblins)", "FX 7 (echoes)", "FX 8 (sci-fi)", "Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai", "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal", "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", "Telephone Ring", "Helicopter", "Applause", "Gunshot"];

function loadSoundfontMenu() {
  var soundfontTypeSel = document.getElementById("soundfont-type");
  var soundfontType = Number(soundfontTypeSel.options[soundfontTypeSel.selectedIndex].value);
  console.log(soundfontType);

  var count = 8;
  if (soundfontType == 16) {
    count = soundfontList.length;
    soundfontType = 0;
  }
  var soundfontSel = document.getElementById("soundfont");
  soundfontSel.innerHTML = "";
  for (var i = (soundfontType * count); i < ((soundfontType + 1) * count); i++) {
    var option = document.createElement("option");
    option.setAttribute("value", i.toString());
    option.innerHTML = soundfontList[i];
    soundfontSel.appendChild(option);
  }
}

function checkNewSynth() {
  var loadingStatus = document.getElementById("loading-status");
  loadingStatus.innerHTML = "Preparing synth...";

  var waveSel = document.getElementById("wave");
  var newWave = waveSel.options[waveSel.selectedIndex].value;

  var fontNumSel = document.getElementById("soundfont");
  var newFontNum = Number(fontNumSel.options[fontNumSel.selectedIndex].value);

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

  if ((newWave !== wave) || (newFontNum !== fontNum) || (newMul !== mul) || (newPoly !== poly) || (newAttack !== attack) || (newRelease !== release) || (newHold !== hold)
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
    fontNum = newFontNum;
    if (wave === "soundfont") {
      mode = 1;
      T.soundfont.setInstrument(fontNum);
    }
    else {
      mode = 0;
      var env = T("ahdsfr", {a: attack, r: release, h: hold, d: decay, lv: level});
      env.plot({target:wavePlot});
      synth = T("OscGen", {wave: wave, env: env, mul: mul}).play();
      synth.poly = poly;
    }
  }
  loadingStatus.innerHTML = "Done.";
}

function preloadSoundfont() {
  checkNewSynth();
  if (mode == 1) {
    var loadingStatus = document.getElementById("loading-status");
    loadingStatus.innerHTML = "Preloading soundfont...";
    T.soundfont.emptyCache();
    var noteArray = [];
    for (var i = 0; i < 128; i++) {
      noteArray.push(i);
    }
    T.soundfont.preload(noteArray);
    loadingStatus.innerHTML = "Done.";
  }
  else {

  }
}

window.onload = function () {
  keydict = T("ndict.key");
  midicps = T("midicps");

  loadSoundfontMenu();
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
      play(midi);
    }
  }).on("keyup", function(e) {
    var midi = keydict.at(e.keyCode);
    checkNewSynth();
    if (midi) {
      unpressKey(midi);
      midi = octaveShift(midi);
      stop(midi);
    }
  }).start();
}
