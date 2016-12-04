function LimitedArray (size) {
  let data = new Uint8Array(size)
  return {
    add: function (num) {
      for (let i = 1; i < size; i++) {
        data[i - 1] = data[i]
      }
      data[size - 1] = num
      return data
    },
    getData: function () {
      return data
    },
    getAverage: function () {
      return data.reduce((total, number) => total + number, 0) / size
    }
  }
}