var synth = null;

var oscillator1;
var oscillator2;
var envelope;
var soundfont;
var general;

var fontFolder;
var fontControl;

var mode = 0;

var keydict;
var midicps;

var instrumentTypes = {"All Instruments": 16,
                       "Piano": 0,
                       "Chromatic Percussion": 1,
                       "Organ": 2,
                       "Guitar": 3,
                       "Bass": 4,
                       "Strings": 5,
                       "Ensemble": 6,
                       "Brass": 7,
                       "Reed": 8,
                       "Pipe": 9,
                       "Synth Lead": 10,
                       "Synth Pad": 11,
                       "Synth Effects": 12,
                       "Ethnic": 13,
                       "Percussive": 14,
                       "Sound Effects": 15};

var instrumentTypeList = [];
for (type in instrumentTypes) {
  instrumentTypeList.push(type);
}

var midiInstruments = ["Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano","Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet", "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular Bells", "Dulcimer", "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ", "Accordion", "Harmonica", "Tango Accordion", "Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)", "Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar Harmonics", "Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2", "Violin", "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani", "String Ensemble 1", "String Ensemble 2", "Synth Strings 1", "Synth Strings 2", "Choir Aahs", "Voice Oohs", "Synth Choir", "Orchestra Hit", "Trumpet", "Trombone", "Tuba", "Muted Trumpet", "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2", "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet", "Piccolo", "Flute", "Recorder", "Pan Flute", "Blown bottle", "Shakuhachi", "Whistle", "Ocarina", "Lead 1 (square)", "Lead 2 (sawtooth)", "Lead 3 (calliope)", "Lead 4 chiff", "Lead 5 (charang)", "Lead 6 (voice)", "Lead 7 (fifths)", "Lead 8 (bass + lead)", "Pad 1 (new age)", "Pad 2 (warm)", "Pad 3 (polysynth)", "Pad 4 (choir)", "Pad 5 (bowed)", "Pad 6 (metallic)", "Pad 7 (halo)", "Pad 8 (sweep)", "FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)", "FX 5 (brightness)", "FX 6 (goblins)", "FX 7 (echoes)", "FX 8 (sci-fi)", "Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai", "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal", "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", "Telephone Ring", "Helicopter", "Applause", "Gunshot"];


var General = function () {
  this.poly = 4;
  this.octave = 4;
};

var Oscillator = function () {
  this.wave = "sin";
  this.mul = 0.25;
  this.offset = 0;
};

var Envelope = function () {
  this.attack = 50;
  this.release = 300;
  this.sustain = 0.5;
  this.hold = 0;
  this.decay = 300;
  this.level = 1;
};


var SoundFont = function () {
  this.instrumentType = instrumentTypeList[0];
  this.instrument = midiInstruments[0];
  this.midiMode = false;
  this.length = 64;
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
  if (!soundfont.midiMode) {
    synth.noteOff(midi, 100);
  }
}

function play(midi) {
  if (soundfont.midiMode) {
    T.soundfont.play(midi);
  }
  else {
    var freq = midicps.at(midi);
    synth.noteOnWithFreq(freq, 100);
  }
}

function octaveShift(midi) {
  midi -= 48;
  midi += general.octave * 12;
  return midi;
}

function checkNewSynth(value) {
  if (soundfont.midiMode) {
    T.soundfont.setInstrument(midiInstruments.indexOf(soundfont.instrument));
  }
  else {

    synth = T("SynthDef").play();

    synth.def = function(opts) {
      var osc1, osc2, env;
      var freq1 = opts.freq;
      var freq2 = opts.freq;
      if (oscillator1.offset != 0) {
        freq1 = freq1 * Math.pow(2, oscillator1.offset / 12);
      }
      if (oscillator2.offset != 0) {
        freq2 = freq2 * Math.pow(2, oscillator2.offset / 12);
      }
      osc1 = T(oscillator1.wave, {freq:freq1, mul: (oscillator1.mul / 2)});
      osc2 = T(oscillator2.wave, {freq:freq2, mul: (oscillator2.mul / 2)});
      env = T("ahdsfr", {a: envelope.attack, r: envelope.release, h: envelope.hold, d: envelope.decay, s: envelope.sustain, lv: envelope.level}, osc1, osc2);
      env.plot({target:wavePlot});
      return env.on("ended", opts.doneAction).bang();
    };
    synth.poly = general.poly;

  }
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

function octaveUp() {
  if (general.octave < 9) {
    general.octave++;
  }
}

function octaveDown() {
  if (general.octave > 0) {
    general.octave--;
  }
}

function changeInstrumentType(value) {
  fontFolder.remove(fontControl);
  var channel = instrumentTypes[value];
  var options = midiInstruments;
  if (channel < 16) {
    var typeCount = 8;
    options = midiInstruments.slice(typeCount * channel, (channel + 1) * typeCount);
  }
  fontControl = fontFolder.add(soundfont, 'instrument', options);
  fontControl.onFinishChange(checkNewSynth);
}

window.onload = function () {

  var waves = ["sin", "cos", "pulse", "tri", "saw", "fami", "konami", "+sin", "+pulse", "+tri", "+saw", "fnoise", "soundfont"];

  general = new General();
  oscillator1 = new Oscillator();
  oscillator2 = new Oscillator();
  envelope = new Envelope();
  soundfont = new SoundFont();

  var gui = new dat.GUI();

  var polyControl = gui.add(general, 'poly', 1, 64);
  polyControl.step(1);
  polyControl.onFinishChange(checkNewSynth);
  var octaveControl = gui.add(general, 'octave', 0, 9);
  octaveControl.onFinishChange(function (value) {});
  octaveControl.step(1);
  octaveControl.listen();

  var f1 = gui.addFolder('Oscillator 1');

  f1.add(oscillator1, 'wave', waves).onFinishChange(checkNewSynth);
  f1.add(oscillator1, 'mul', 0, 1).onFinishChange(checkNewSynth);
  f1.add(oscillator1, 'offset', -12, 12).onFinishChange(checkNewSynth);

  var f2 = gui.addFolder('Oscillator 2');
  f2.add(oscillator2, 'wave', waves).onFinishChange(checkNewSynth);
  f2.add(oscillator2, 'mul', 0, 1).onFinishChange(checkNewSynth);
  f2.add(oscillator2, 'offset', -12, 12).onFinishChange(checkNewSynth);

  var f3 = gui.addFolder('Envelope');
  f3.add(envelope, 'attack', 0, 2000).onFinishChange(checkNewSynth);
  f3.add(envelope, 'release', 0, 2000).onFinishChange(checkNewSynth);
  f3.add(envelope, 'sustain', 0, 1).onFinishChange(checkNewSynth);
  f3.add(envelope, 'hold', 0, 2000).onFinishChange(checkNewSynth);
  f3.add(envelope, 'decay', 0, 2000).onFinishChange(checkNewSynth);
  f3.add(envelope, 'level', 0, 1).onFinishChange(checkNewSynth);

  fontFolder = gui.addFolder('MIDI');
  fontFolder.add(soundfont, 'midiMode').onFinishChange(checkNewSynth);
  fontFolder.add(soundfont, 'length', 1, 256).onFinishChange(checkNewSynth);
  fontFolder.add(soundfont, 'instrumentType', instrumentTypeList).onFinishChange(changeInstrumentType);
  fontControl = fontFolder.add(soundfont, 'instrument', midiInstruments);
  fontControl.onFinishChange(checkNewSynth);


  keydict = T("ndict.key");
  midicps = T("midicps");

  generatePiano();

  checkNewSynth(0);

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
    if (midi) {
      pressKey(midi);
      midi = octaveShift(midi);
      play(midi);
    }
  }).on("keyup", function(e) {
    var midi = keydict.at(e.keyCode);
    if (midi) {
      unpressKey(midi);
      midi = octaveShift(midi);
      stop(midi);
    }
  }).start();
}
