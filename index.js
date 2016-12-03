const output = document.getElementById('output')
const thresholdDOM = document.getElementById('threshold')
const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
const analyser = audioCtx.createAnalyser()
analyser.fftSize = 2048
analyser.smoothingTimeConstant = 1;

const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

const WIDTH = 100
const HEIGHT = 100

const canvas = document.getElementById('canvas')
const canvasCtx = canvas.getContext('2d')
let canvasLineHeight = 0
let threshold = 200

canvas.addEventListener('mousemove', (evt) => {
  const mousePos = getMousePos(canvas, evt)
  const { y } = mousePos
  canvasLineHeight = y
})

if (navigator.getUserMedia) {
  console.log('getUserMedia supported.')
  navigator.getUserMedia({ audio: true },
    (stream) => {
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      const timer = getBeatsPerMinute()
      analyze(timer)
    },
    (err) => {
      console.error('The following gUM error occured: ' + err)
    }
  )
} else {
  console.log('getUserMedia not supported on your browser!')
}

function analyze (timer) {
  const analyzer = analyze.bind(null, timer)
  // eslint-disable-next-line no-unused-vars, no-undef
  const drawVisual = requestAnimationFrame(analyzer)

  // copies waveform data into array
  analyser.getByteTimeDomainData(dataArray)
  drawWave()
  updateThreshold(canvasLineHeight)
  getAmplitude(timer)
}

function millisecondsToBpm (ms) {
  return 60000 / ms
}

function getBeatsPerMinute () {
  let time = new Date()
  return {
    tick: function () {
      const delay = new Date() - time
      if (delay < 200) return // debounce
      time = new Date()
      output.innerHTML = millisecondsToBpm(delay)
    }
  }
}

function getAmplitude (timer) {
  const max = Math.max.apply(null, dataArray)
  if (max > threshold) {
    timer.tick()
  }
}

function drawWave () {
  canvasCtx.fillStyle = 'rgb(200, 200, 200)'
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)
  canvasCtx.lineWidth = 2
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)'
  canvasCtx.beginPath()

  const sliceWidth = WIDTH * 1.0 / bufferLength
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0
    const y = (v * HEIGHT / 2) + 50
    if (i === 0) {
      canvasCtx.moveTo(x, y)
    } else {
      canvasCtx.lineTo(x, y)
    }

    x += sliceWidth
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2)
  canvasCtx.stroke()
}

function getMousePos (canvas, evt) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

function updateThreshold (y) {
  drawLine(y)
  const relativeHeight = 100 - y
  threshold = ((relativeHeight / 100) * 256) + 128
  thresholdDOM.innerHTML = threshold
}

function drawLine (y) {
  canvasCtx.beginPath()
  canvasCtx.moveTo(0, y)
  canvasCtx.lineTo(WIDTH, y)
  canvasCtx.stroke()
}

