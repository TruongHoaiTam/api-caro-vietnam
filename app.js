const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');

mongoose.connect(`mongodb+srv://Hatomia:hatomiatruong@caro-vietnam-8rsia.gcp.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const port = process.env.PORT || '3000';

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

////
var server = require('http').Server(app);
var io = require("socket.io")(server);
server.listen(port);

let count = 0;
let arr = [];
let usernames = [];
let room = null;

io.on('connection', socket => {
    console.log('User connected', socket.id)

    socket.on('send-username', (username) => {
        if (count === 0) {
            room = "ROOM " + socket.id;
        }
        socket.join(room);
        socket.room = room;
        arr.push(socket.id);
        usernames.push(username);
        count++;
        if (count === 2) {
            io.sockets.in(room).emit("players", arr, usernames);
            room = null;
            count = 0;
            arr = [];
            usernames = [];
        }
    })



    socket.on('client-click', (pos) => {
        socket.broadcast.to(socket.room).emit('broadcast-pos', pos);
    })

    socket.on('ask-for-undo', (step) => {
        socket.broadcast.in(socket.room).emit('ask-for-undo', step);
    })

    socket.on('undo', (step) => {
        socket.broadcast.in(socket.room).emit('undo', step);
    })

    socket.on('not-undo', (step) => {
        socket.broadcast.in(socket.room).emit('not-undo', step);
    })

    socket.on("continue-play", () => {
        socket.broadcast.in(socket.room).emit('continue-play');
    });

    socket.on("ask-for-surrender", () => {
        socket.broadcast.in(socket.room).emit('ask-for-surrender');
    });

    socket.on("ask-for-draw", () => {
        socket.broadcast.in(socket.room).emit('ask-for-draw');
    });

    socket.on('allow-surrender', () => {
        socket.broadcast.in(socket.room).emit('allow-surrender');
    })

    socket.on('not-allow-surrender', () => {
        socket.broadcast.in(socket.room).emit('not-allow-surrender');
    })

    socket.on('allow-draw', () => {
        socket.broadcast.in(socket.room).emit('allow-draw');
    })

    socket.on('not-allow-draw', () => {
        socket.broadcast.in(socket.room).emit('not-allow-draw');
    })

    socket.on("stop-play", (str) => {
        socket.broadcast.in(socket.room).emit('stop-play', str);
    });

    ///

    socket.on("send-message", (message) => {
        socket.broadcast.in(socket.room).emit('send-message', message);
    });

    ///


    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    })

})



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", 'GET,HEAD,OPTIONS,POST,PUT');
    res.header("Access-Control-Allow-Headers", 'Origin, Access-Control-Allow-Methods, X-Requested-With, Content-Type, Accept, Authorization ');
    next();
});

app.use('/', require('./app/routes/index'));

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;