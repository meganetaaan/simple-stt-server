var vosk = require('./node_modules/vosk')
const fs = require("fs");
var mic = require("mic");

const Express = require('express')
const useWebSocket = require('express-ws')

const app = Express()
useWebSocket(app)

const PORT = 8080
let sockets = []

function sendMessage(message) {
  for (const socket of sockets) {
    socket.send(message)
  }
}

// WebSocketエンドポイントの設定
app.ws('/', function (socket) {
  sockets.push(socket)
  console.log(`connected. current # of connection: ${sockets.length}`)
  socket.on('close', () => {
    // 閉じたコネクションを取り除く
    sockets = sockets.filter(s => {
      return s !== socket
    })
    console.log(`closed. current # of connection: ${sockets.length}`)
  })
})
// ポート8080で接続を待ち受ける
app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`)
})

MODEL_PATH = "model"
SAMPLE_RATE = 16000

if (!fs.existsSync(MODEL_PATH)) {
  console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
  process.exit()
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });

var micInstance = mic({
  /** 
   * @note If you get "No such file or directory" error
   * You should specify the device
   **/
  // device: "plughw:CARD=PCH,DEV=0",
  rate: String(SAMPLE_RATE),
  channels: '1',
  debug: false
});

var micInputStream = micInstance.getAudioStream();
micInstance.start();

micInputStream.on("data", (data) => {
  if (rec.acceptWaveform(data)) {
    const result = rec.result()
    console.log(result);
    const message = result.text
    if (message != null && message.length > 1) {
      sendMessage(message);
    }
  } else {
    // console.log(rec.partialResult());
  }
});

process.on("SIGINT", function () {
  console.log(rec.finalResult());
  console.log("\nDone");
  rec.free();
  model.free();
});
