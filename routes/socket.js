var socketIO = require('socket.io');
var server = require('http').createServer();
server.listen(8000);

module.exports = socketIO(server);