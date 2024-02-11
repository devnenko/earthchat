const express = require('express');
const path = require('path')
import { createServer } from 'http'
import { Server, Socket } from "socket.io"
import { profanity } from '@2toad/profanity';
import { rateLimit } from 'express-rate-limit'
import xss from "xss";

//Setup server ------------------------------------------------
const app = express();
const server = createServer(app);
server.listen(8080, () => {
    console.log('listening on *:8080');
});

//redirect all traffic to base url
app.get('*', (req: any, res: any, next: any) => {
    const acceptHeader = req.get('Accept');
    if (acceptHeader.includes('text/html') && req.path != "/") {
        return res.redirect("/");
    }
    return next();
});

//add files to website
app.use(express.static(path.join(__dirname, 'build')));



//Declare server data ------------------------------------------------
let online = 0;

interface IServerMsg {
    msg: string,
    lat: number,
    lng: number,
    startTime: number,
    duration: number
}
const messages: IServerMsg[] = []



//Setup socketio ------------------------------------------------
const io = new Server(server);
io.on('connection', onConnect);

function onConnect(socket: Socket) {


    //update online amount
    online++;
    io.emit("online", online);
    socket.on('disconnect', () => {
        online--;
        io.emit("online", online);
    });

    //emit all active messages to new client
    messages.forEach(msg => {
        const timePassed = Date.now() - msg.startTime;
        const remainingDur = msg.duration - timePassed;
        socket.emit("message_to_clients", msg.msg, msg.lat, msg.lng, remainingDur, true);
    });

    socket.on('message_to_server', onMessage);
}

function onMessage(msg: string, lat: number, lng: number) {

    let locationInUse = messages.find(_msg => _msg.lat === lat && _msg.lng === lng);
    if (locationInUse) {

        //all messages have a 3 second cooldown before you can override them
        if (Date.now()<locationInUse.startTime+3000) return;

        //destroy the message to leave space for new message
        messages.splice(messages.indexOf(locationInUse), 1)

    }

    //max 26 characters
    if (msg.length > 26) {
        msg = msg.substring(0, 26)
    }

    //profanity filter
    if (profanity.exists(msg)) {
        msg = "@#$%&!"
    }

    //protect against cross site scripting attacks
    msg = xss(msg);

    const duration = getMsgDuration()
    const serverMsg: IServerMsg = {
        msg,
        lat: lat,
        lng: lng,
        startTime: Date.now(),
        duration: duration
    };
    messages.push(serverMsg)
    io.emit("message_to_clients", msg, lat, lng, duration, false);

    //remove message after duration
    setTimeout(() => {
        if (messages.indexOf(serverMsg) != -1) {
            messages.splice(messages.indexOf(serverMsg), 1)
        }

    }, duration)
}


//looks at the amount of messages and determines message duration
//less messages => more time per message
//more messages => less time per message
function getMsgDuration() {
    let duration = 0;
    if (messages.length > 100) {
        duration = 1000;
    } else if (messages.length > 50) {
        duration = 2000
    }
    else if (messages.length > 10) {
        duration = 4000
    } else if (messages.length > 2) {
        duration = 20000
    } else {
        duration = 40000
    }
    return duration;
}

//spawn test messages to test the website under load
function stressTest() {
    setTimeout(() => {
        onMessage("yo", Math.random() * 180 - 90, Math.random() * 360 - 180)
        stressTest()
    }, 100);
}

//stressTest()