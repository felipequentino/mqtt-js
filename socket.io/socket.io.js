const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const atob = require('atob');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const client = mqtt.connect('mqtt://140.238.178.248', {
    username: '',
    password: ''
});

const camName = 'cam_3177';

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; ++i) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

client.on('connect', () => {
    console.log('Connected to MQTT Broker!');
    client.subscribe(`camera/${camName}/result_image`);
    client.subscribe(`camera/${camName}/result`);
});

let imgBytes = null;

client.on('message', (topic, message) => {
    if (topic === `camera/${camName}/result_image`) {
        // Decode base64 image
        imgBytes = base64ToArrayBuffer(message.toString());
        io.emit('image', imgBytes);
        console.log('Image received');
    } else if (topic === `camera/${camName}/result`) {
        console.log(message.toString());
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});



app.use(express.static('public'));