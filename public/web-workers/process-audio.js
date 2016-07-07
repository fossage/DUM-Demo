// let audioCtx = new AudioWorkerNode();

// function onmessage(e) {
//   debugger
//   fetch(`audio/${e.data.trackUrl}`, init)
//   .then((response) => {
//     response.arrayBuffer()
//     .then((data) => {
//       audioCtx.decodeAudioData(data, (buffer) => {
//        postMessage(buffer);
//       });
//     });
//   });
// }