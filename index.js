const vosk = require('./node_modules/vosk');
const minimist = require('minimist')
const fs = require('fs');
const mic = require('mic');
const Express = require('express');
const useWebSocket = require('express-ws');
const keypress = require('keypress');

const SERVER_PORT = 8080;
const VOSK_MODEL_PATH = 'model';
const VOSK_SAMPLE_RATE = 16000;
const VOSK_NUM_CHANNELS = 1;

class Server {
  server;
  sockets = [];

  constructor({ port }) {
    const app = Express();
    useWebSocket(app);

    app.ws('/', (socket) => {
      this.sockets.push(socket);
      console.log(`connected. current # of connection: ${this.sockets.length}`);
      socket.on('close', () => {
        this.sockets = this.sockets.filter((s) => {
          return s !== socket;
        });
        console.log(`closed. current # of connection: ${this.sockets.length}`);
      });
    });

    this.server = app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  }

  close() {
    this.server.close();
  }

  sendMessage(message) {
    for (const socket of this.sockets) {
      socket.send(message);
    }
  }
}

class VoskRecognizer {
  model;
  rec;
  micInstance;
  micInputStream;
  constructor({ device, vosk, onRecognized }) {
    this.onRecognized = onRecognized;
    this.model = new vosk.Model(VOSK_MODEL_PATH);
    this.rec = new vosk.Recognizer({
      model: this.model,
      sampleRate: VOSK_SAMPLE_RATE,
    });

    const option = {
      rate: String(VOSK_SAMPLE_RATE),
      channels: String(VOSK_NUM_CHANNELS),
      debug: true,
    }
    if (device) {
      option.device = device
    }
    this.micInstance = mic(option);

    const micInputStream = this.micInstance.getAudioStream();
    micInputStream.on('data', (data) => {
      if (this.rec.acceptWaveform(data)) {
        const result = this.rec.result();
        console.log(result);
        const message = result.text;
        if (message != null && message.length > 1) {
          this.onRecognized?.(message);
        }
      } else {
        // console.log(rec.partialResult());
      }
    });
    this.start();
  }
  start() {
    this.micInstance.start();
  }
  pause() {
    this.micInstance.pause();
  }
  close() {
    console.log(this.rec.finalResult());
    this.micInstance.stop();
    this.rec.free();
    this.model.free();
  }
}

class KeyHandler {
  constructor({ onKeyPressed, stdin }) {
    keypress(stdin);
    this.onKeyPressed = onKeyPressed;
    stdin.on('keypress', (_ch, key) => {
      if (key && key.ctrl && key.name == 'c') {
        process.kill(process.pid, 'SIGINT');
        //強制終了するなら　process.stdin.exit();
      } else if (key != null) {
        // Spaceキーが押された時に実行する関数を呼び出す
        this.onKeyPressed?.(key);
      }
    });
    stdin.setRawMode(true);
    stdin.resume();
    this.stdin = stdin;
  }

  close() {
    this.stdin.destroy();
  }
}

(function main() {
  const argv = minimist(process.argv.slice(2));
  const device = argv.device;
  const useVosk = argv.useVosk !== 'false';

  let listening = true;
  if (useVosk && !fs.existsSync(VOSK_MODEL_PATH)) {
    console.log(
      `Please download the model from https://alphacephei.com/vosk/models and unpack as ${VOSK_MODEL_PATH} in the current folder.`
    );
    process.exit();
  }

  const server = new Server({
    port: SERVER_PORT,
  });

  let recognizer;
  let keyHandler;

  if (useVosk) {
    vosk.setLogLevel(0);
    recognizer = new VoskRecognizer({
      device,
      vosk,
      onRecognized: (message) => {
        if (listening) {
          server.sendMessage(message);
        }
      },
    });
    keyHandler = new KeyHandler({
      stdin: process.stdin,
      onKeyPressed: (key) => {
        if (key.name === 'space') {
          listening = !listening;
          if (listening) {
            console.log('resuming');
            // recognizer.start();
          } else {
            console.log('pausing');
            // recognizer.pause();
          }
        }
        // console.log(key);
      },
    });
  }

  process.on('SIGINT', function () {
    server.close();
    recognizer?.close();
    keyHandler?.close();
    console.log('\nDone');
  });
})();
