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
const audio = audioController()
audio.init()