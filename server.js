/*var http = require('http');
var time = 0

http.createServer(function (req, res) {
  res.write("Bot allumé");
  res.end();
}).listen(25550);*/

const express = require('express');
const server = express();

server.all(`/`, (req, res) => {
    res.send(`Result: [OK].`);
});

function keepAlive() {
    server.listen(3000, () => {
        console.log(`Server is now ready! | ` + Date.now());
    });
}

module.exports = keepAlive;