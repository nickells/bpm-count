import {
  getBeatsPerMinute
} from './utils'
import {
  waveAnimation
} from './canvasController'
import { state } from './state'
import { thresholdDOM, outputDOM } from './domElements'

function updateThreshold (y) {
  waveAnimation.drawLine(y)
  const relativeHeight = state.height - y
  state.threshold = ((relativeHeight / state.height) * 256) + 128
  thresholdDOM.innerHTML = state.threshold
}

function audioController () {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 2048
  analyser.smoothingTimeConstant = 1

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  function analyze (timer, canvas) {
    const analyzer = analyze.bind(null, timer, canvas)
    // eslint-disable-next-line no-unused-vars, no-undef
    const drawVisual = requestAnimationFrame(analyzer)

    // copies waveform data into array
    analyser.getByteTimeDomainData(dataArray)
    console.log('canvas', canvas)
    canvas.drawWave()
    updateThreshold(state.canvasLineHeight)
    getAmplitude(timer)
  }

  return {
    dataArray,
    bufferLength,
    init: function () {
      if (navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia supported.')
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(
          (stream) => {
            const source = audioCtx.createMediaStreamSource(stream)
            source.connect(analyser)
            const timer = getBeatsPerMinute()
            console.log('wave animaiton', waveAnimation)
            analyze(timer, waveAnimation)
          },
          (err) => {
            console.error('The following gUM error occured: ' + err)
          }
        )
      } else {
        console.log('getUserMedia not supported on your browser!')
      }
    }
  }
}

function getAmplitude (timer) {
  const max = Math.max.apply(null, audio.dataArray)
  if (max > state.threshold) {
    timer.tick(outputDOM)
  }
}

const audio = audioController()
audio.init()

export {
  audio
}
