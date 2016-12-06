(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.audio = undefined;

var _utils = require('./utils');

var _canvasController = require('./canvasController');

var _state = require('./state');

var _domElements = require('./domElements');

function updateThreshold(y) {
  _canvasController.waveAnimation.drawLine(y);
  var relativeHeight = _state.state.height - y;
  _state.state.threshold = relativeHeight / _state.state.height * 256 + 128;
  _domElements.thresholdDOM.innerHTML = _state.state.threshold;
}

function audioController() {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 1;

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  function analyze(timer, canvas) {
    var analyzer = analyze.bind(null, timer, canvas);
    // eslint-disable-next-line no-unused-vars, no-undef
    var drawVisual = requestAnimationFrame(analyzer);

    // copies waveform data into array
    analyser.getByteTimeDomainData(dataArray);
    canvas.drawWave();
    updateThreshold(_state.state.canvasLineHeight);
    getAmplitude(timer);
  }

  return {
    dataArray: dataArray,
    bufferLength: bufferLength,
    init: function init() {
      if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.');
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          var source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          var timer = (0, _utils.getBeatsPerMinute)();
          console.log('wave animaiton', _canvasController.waveAnimation);
          analyze(timer, _canvasController.waveAnimation);
        }, function (err) {
          console.error('The following gUM error occured: ' + err);
        });
      } else {
        console.log('getUserMedia not supported on your browser!');
      }
    }
  };
}

function getAmplitude(timer) {
  var max = Math.max.apply(null, audio.dataArray);
  if (max > _state.state.threshold) {
    timer.tick(_domElements.outputDOM);
  }
}

var audio = audioController();
audio.init();

exports.audio = audio;

},{"./canvasController":2,"./domElements":3,"./state":4,"./utils":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waveAnimation = undefined;

var _state = require('./state');

var _audioController = require('./audioController');

var canvasController = function canvasController() {
  var canvas = document.getElementById('canvas');
  canvas.style['cursor'] = 'row-resize';
  canvas.setAttribute('width', _state.state.width);
  canvas.setAttribute('height', _state.state.height);
  var canvasCtx = canvas.getContext('2d');

  function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function mouseHandler(evt) {
    var mousePos = getMousePos(evt);
    var y = mousePos.y;

    _state.state.canvasLineHeight = y;
  }

  canvas.addEventListener('mousemove', mouseHandler);
  canvas.addEventListener('touchmove', mouseHandler);
  window.addEventListener('resize', function (evt) {
    _state.state.width = window.innerWidth;
    canvas.setAttribute('width', _state.state.width);
  });

  return {
    drawWave: function drawWave() {
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, _state.state.width, _state.state.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx.beginPath();

      var sliceWidth = _state.state.width * 1.0 / _audioController.audio.bufferLength;
      var x = 0;

      for (var i = 0; i < _audioController.audio.bufferLength; i++) {
        var v = _audioController.audio.dataArray[i] / 128.0;
        var y = v * _state.state.height / 2 + _state.state.height / 2;
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    },
    drawLine: function drawLine(y) {
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = 'red';
      canvasCtx.moveTo(0, y);
      canvasCtx.lineTo(_state.state.width, y);
      canvasCtx.stroke();
    }
  };
};

var waveAnimation = canvasController();

exports.waveAnimation = waveAnimation;

},{"./audioController":1,"./state":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var outputDOM = document.getElementById('output');
var thresholdDOM = document.getElementById('threshold');

document.body.style['padding'] = 0;
document.body.style['margin'] = 0;
document.getElementById('info').style['padding'] = '10px';

exports.outputDOM = outputDOM;
exports.thresholdDOM = thresholdDOM;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var state = {
  width: window.innerWidth,
  height: 256,
  canvasLineHeight: 0,
  threshold: 200
};

exports.state = state;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function getBeatsPerMinute() {
  var time = new Date();
  var bpm = void 0;
  var set = new LimitedArray(6);
  return {
    tick: function tick(elem) {
      var delay = new Date() - time;
      if (delay < bpmToMilliseconds(300)) return; // debounce
      time = new Date();
      set.add(millisecondsToBpm(delay));
      bpm = set.getAverage();
      elem.innerHTML = bpm;
    }
  };
}

function bpmToMilliseconds(bpm) {
  return 60000 / bpm;
}

function millisecondsToBpm(ms) {
  return 60000 / ms;
}

function LimitedArray(size) {
  var data = new Uint8Array(size);
  return {
    add: function add(num) {
      for (var i = 1; i < size; i++) {
        data[i - 1] = data[i];
      }
      data[size - 1] = num;
      return data;
    },
    getData: function getData() {
      return data;
    },
    getAverage: function getAverage() {
      return data.reduce(function (total, number) {
        return total + number;
      }, 0) / size;
    }
  };
}

exports.getBeatsPerMinute = getBeatsPerMinute;
exports.bpmToMilliseconds = bpmToMilliseconds;
exports.millisecondsToBpm = millisecondsToBpm;
exports.LimitedArray = LimitedArray;

},{}]},{},[1]);
