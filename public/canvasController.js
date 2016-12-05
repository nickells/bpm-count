function canvasController () {
  const canvas = document.getElementById('canvas')
  canvas.style['cursor'] = 'row-resize'
  document.body.style['padding'] = 0
  document.body.style['margin'] = 0
  document.getElementById('info').style['padding'] = '10px'

  canvas.setAttribute('width', state.width)
  canvas.setAttribute('height', state.height)
  const canvasCtx = canvas.getContext('2d')

  function getMousePos (evt) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    }
  }

  function mouseHandler (evt) {
    const mousePos = getMousePos(evt)
    const { y } = mousePos
    state.canvasLineHeight = y
  }

  canvas.addEventListener('mousemove', mouseHandler)
  canvas.addEventListener('touchmove', mouseHandler)
  window.addEventListener('resize', (evt) => {
    state.width = window.innerWidth
    canvas.setAttribute('width', state.width)
  })

  return {
    drawWave: function () {
      canvasCtx.fillStyle = 'rgb(200, 200, 200)'
      canvasCtx.fillRect(0, 0, state.width, state.height)
      canvasCtx.lineWidth = 2
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)'
      canvasCtx.beginPath()

      const sliceWidth = state.width * 1.0 / audio.bufferLength
      let x = 0

      for (let i = 0; i < audio.bufferLength; i++) {
        const v = audio.dataArray[i] / 128.0
        const y = (v * state.height / 2) + state.height / 2
        if (i === 0) {
          canvasCtx.moveTo(x, y)
        } else {
          canvasCtx.lineTo(x, y)
        }

        x += sliceWidth
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2)
      canvasCtx.stroke()
    },
    drawLine: function (y) {
      canvasCtx.beginPath()
      canvasCtx.strokeStyle = 'red'
      canvasCtx.moveTo(0, y)
      canvasCtx.lineTo(state.width, y)
      canvasCtx.stroke()
    }
  }
}

const waveAnimation = canvasController()
