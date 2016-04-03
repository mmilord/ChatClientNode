var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var user_count = 0;

/*app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});*/
app.use(express.static(__dirname + '/client'));

io.on('connection', function(socket) {
	var conn_id;
	//id++;
	user_count++;

	console.log('a user connected with id: ' + conn_id);
	io.emit('user count', user_count);

	socket.on('disconnect', function() {
		console.log('user disconnected');
		user_count--;
		io.emit('user count', user_count);
	});
	
	socket.on('chat message', function(msg) {
		console.log('message from ' + msg.id + ': ' + msg.message);
		io.emit('chat message', { 'id': msg.id, 'message': msg.message } );
	});
	
	socket.on('conn_id', function(msg) {
		conn_id = msg;
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
