// worker.js
worker.onMessage(function (res) {
  console.log('Worker received:', res)
  worker.postMessage({
    message: 'Worker processed data'
  })
}) 