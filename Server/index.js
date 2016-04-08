/**
 * Server side script
**/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dl = require('delivery');
var fs = require('fs');
var user_count = 0;

/*app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});*/

/**
 * Sets specified directory as location of client side code to be pushed on new connection
**/
app.use(express.static(__dirname + '/client'));

/**
 * Called when new connection is established
**/
io.on('connection', function(socket) {
	var conn_id;
	user_count++;

	console.log('a user connected with id: ' + conn_id);
	io.emit('user count', user_count);

	/**
	 * Called on client disconnected; pushes new user count to all connected clients
	**/
	socket.on('disconnect', function() {
		console.log('user disconnected');
		user_count--;
		io.emit('user count', user_count);
	});
	
	/**
	 * Called on chat message received from client; pushes message to all connected clients
	 * @params - msg: Message from client
	**/
	socket.on('chat message', function(msg) {
		console.log('message from ' + msg.id + ': ' + msg.message);
		io.emit('chat message', { 'id': msg.id, 'message': msg.message } );
	});
	
	/**
	 * Called on name change from client
	**/
	socket.on('conn_id', function(msg) {
		conn_id = msg;
	});
	
	/**
	 * Send requested file from cache directory
	**/
	socket.on('test', function(msg) {
		console.log('test');
		delivery.send({
			//console.log('sending');
			name: msg,
			path : 'cache/' + name,
			params: {foo: 'bar'}
		});
		
		delivery.on('send.success', function(file) {
			console.log('sent');
		});
	});
	
	/**
	 * Receive and save transmitted file to cache directory
	**/
	delivery = dl.listen(socket);
	delivery.on('receive.success',function(file){
		var filepath = 'cache/' + file.name;
		fs.writeFile(filepath,file.buffer, function(err){
			console.log("Attempting to write " + filepath + " of size: " + Math.round(file.size/1024) + " kb");
			if(err){
				console.log('File could not be saved.');
			}else{
				console.log('File saved.');
			};
		});
	});
	
	
});

/**
 * Listens for new client connections
**/
http.listen(3000, function() {
	console.log('listening on *:3000');
});
