function getBeatsPerMinute () {
  let time = new Date()
  let bpm
  let set = new LimitedArray(6)
  return {
    tick: function (elem) {
      const delay = new Date() - time
      if (delay < bpmToMilliseconds(300)) return // debounce
      time = new Date()
      set.add(millisecondsToBpm(delay))
      bpm = set.getAverage()
      elem.innerHTML = bpm
    }
  }
}

function bpmToMilliseconds (bpm) {
  return 60000 / bpm
}

function millisecondsToBpm (ms) {
  return 60000 / ms
}

function LimitedArray (limit = 6) {
  let data = []
  return {
    add: function (num) {
      if (data.length < limit) {
        data.push(num)
      } else {
        for (let i = 1; i <= limit; i++) {
          data[i - 1] = data[i]
        }
        data[limit - 1] = num
      }
      return data
    },
    getData: function () {
      return data
    },
    getAverage: function () {
      return data.reduce((total, number) => total + number, 0) / data.length
    }
  }
}

export {
  getBeatsPerMinute,
  bpmToMilliseconds,
  millisecondsToBpm,
  LimitedArray
}
