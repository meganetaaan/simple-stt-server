# Simple VOSK WebSocket Server

[日本語](./README_ja.md) | English

This project is a Node.js server that uses VOSK to recognize speech and send it over WebSocket.

## Installation

1. Clone this repository.
2. Navigate to the project root directory.
3. Run `npm install` to install dependencies.
4. Download and extract [VOSK model files](https://alphacephei.com/vosk/models) and put them in the `model` directory. The directory structure should look like the following:

```
[sskw]$ ls -l model
合計 24
-rw-r--r-- 1 sskw sskw  898  7月  9  2022 README
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 am
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 conf
drwxr-xr-x 3 sskw sskw 4096  7月  9  2022 graph
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 ivector
drwxr-xr-x 2 sskw sskw 4096  7月  9  2022 rescore
```

## Launch

1. Navigate to the project root directory.
2. Run `npm start` to start the server.

## Usage

Once the server is started, it runs a WebSocket server on port 8080. When a client connects to the WebSocket, recognized text is sent to the client.

To pause the sending of recognition results, press the space key. To resume, press the space key again.

## License

MIT License
