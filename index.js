const http = require('http');
const fs = require('fs');
const url = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const clientApp = express();
const serverApp = express();
const bodyParser_text = bodyParser.text();
const bodyParser_json = bodyParser.json();
const bodyParser_urlencoded = bodyParser.urlencoded({extended: false});

const serv_port = 8080;
const client_port = 80;

var startGame = false;
var players = [];
var playerIndex = 0;
var loc = "";

serverApp.get("/", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('server.html', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});
serverApp.get("/jquery.js", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/javascript');
    fs.readFile('jquery.js', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});
serverApp.get("/getdata", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/json');
    res.send({ playerList: players, loc: loc, startGame: startGame });
    res.end();
});
serverApp.post("/startgame", bodyParser_urlencoded, (req, res) => {
    startGame = true;

    loc = Object.keys(req.body)[0];

    var numMafiaLeft = Math.max(1, Math.floor(Math.sqrt(players.length)));
    var numDoctorsLeft = Math.max(1, Math.floor(players.length / 8));
    var numDetectivesLeft = Math.max(1, Math.floor(players.length / 8));
    var numCitizensLeft = 0;
    for (var i = 0; i < players.length; ++i) {
        if (players[i].alive) {
            ++numCitizensLeft;
        }
    }
    while (numMafiaLeft > 0 && numCitizensLeft > 0) {
        var randIndex = Math.floor(Math.random() * players.length);
        if (players[randIndex].role == "citizen" && players[randIndex].alive) {
            players[randIndex].role = "mafia";
            --numMafiaLeft;
            --numCitizensLeft;
        }
    }
    while (numDoctorsLeft > 0 && numCitizensLeft > 0) {
        var randIndex = Math.floor(Math.random() * players.length);
        if (players[randIndex].role == "citizen" && players[randIndex].alive) {
            players[randIndex].role = "doctor";
            --numDoctorsLeft;
            --numCitizensLeft;
        }
    }
    while (numDetectivesLeft > 0 && numCitizensLeft > 0) {
        var randIndex = Math.floor(Math.random() * players.length);
        if (players[randIndex].role == "citizen" && players[randIndex].alive) {
            players[randIndex].role = "detective";
            --numDetectivesLeft;
            --numCitizensLeft;
        }
    }
    console.log("Game started");
    res.statusCode = 200;
    res.end();
})
serverApp.post("/killplayer", bodyParser_urlencoded, (req, res) => {
    res.statusCode = 200;
    for (var i = 0; i < players.length; ++i) {
        if (players[i].index == Object.keys(req.body)) {
            players[i].alive = false;
        }
    }
    res.end();
});
serverApp.post("/restartgame", (req, res) => {
    startGame = false;
    players = [];
    playerIndex = 0;
    loc = "";

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end();
});
// TODO serverApp.post("/restart")
serverApp.listen(8080, () => console.log("Server started successfully"));

// Client code

clientApp.get("/", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('client.html', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});
clientApp.get("/jquery.js", (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.readFile('jquery.js', (err, data) => {
        if (err) throw err;
        res.end(data);
    });
});
clientApp.post("/submitname", bodyParser_urlencoded, (req, res) => {
    var newPlayer = {
        index: ++playerIndex,
        name: Object.keys(req.body)[0],
        role: 'citizen',
        alive: 'true'
    };
    players.push(newPlayer);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.send(Number(playerIndex).toString());
    res.end();
});
clientApp.post("/removeplayer", bodyParser_urlencoded, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    for (var i = 0; i < players.length; ++i) {
        if (players[i].index == Object.keys(req.body)[0]) {
            players.splice(i, 1);
            break;
        }
    }
    res.end();
});

clientApp.post("/killplayer", bodyParser_urlencoded, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    for (var i = 0; i < players.length; ++i) {
        if (players[i].index == Object.keys(req.body)) {
            players[i].alive = false;
        }
    }
    res.end();
});
clientApp.get("/startgame", bodyParser_text, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    for (var i = 0; i < players.length; ++i) {
        if (players[i].index == Object.keys(req.query)[0]) {
            res.send({ status: startGame, loc: loc, player: players[i] });
            break;
        }
    }
    res.end();
});
clientApp.get("/gamestatus", bodyParser_text, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.send({players: players});
    res.end();
});

clientApp.listen(client_port, () => console.log("Client started successfully"));

