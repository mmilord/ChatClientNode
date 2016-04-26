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
app.use(express.static('client'));
app.get('/', function (req, res) {
	console.log('app.get');
	res.sendFile(__dirname + "/" + "index.htm");
});

/**
 * Called when new connection is established
**/
io.sockets.on('connection', function(socket) {
	//var conn_id;
	user_count++;
	var rooms = [''];
	var usernames = {};
	var animals, adjs
	fs.readFile('animals.txt', 'utf8', function(err, data) {
		if (err) throw err;
		animals = data.split('\n');
	});
	fs.readFile('adjectives.txt', 'utf8', function(err, data) {
		if (err) throw err;
		adjs = data.split('\n');
	});
	
	io.emit('user count', user_count);

	socket.on('newuser', function(username) {
		if (username == "" || username == null) {
		
			var randLineIndex = Math.floor(Math.random() * adjs.length);
			var randomLine = adjs[randLineIndex];
			username = randomLine[0].toUpperCase() + randomLine.slice(1);
			
			randLineIndex = Math.floor(Math.random() * adjs.length);
			randomLine = adjs[randLineIndex];
			username += randomLine[0].toUpperCase() + randomLine.slice(1);
			
			randLineIndex = Math.floor(Math.random() * animals.length);
			randomLine = animals[randLineIndex];
			username += randomLine[0].toUpperCase() + randomLine.slice(1);
		}
		socket.username = username;
		usernames[username] = username;
		socket.room = '';
		//socket.id = '';
		console.log("user connected: " + username);
		socket.emit('username', socket.username);
	});
	
	
	/**
	 * Called on client disconnected; pushes new user count to all connected clients
	**/
	socket.on('disconnect', function() {
		console.log('User disconnected: ' + socket.username);
		user_count--;
		//io.emit('user count', user_count);
	});
	
	/**
	 * Called on chat message received from client; pushes message to all connected clients
	 * @params - msg: Message from client
	**/
	socket.on('chat message', function(msg) {
		console.log('message to _' + socket.room + '_ from ' + socket.username + ': ' + msg.message);
		io.sockets.in(socket.room).emit('chat message', { 'un': socket.username, 'message': msg.message } );
	});
	
	
	socket.on('join_room', function (room) {
		count = io.sockets.clients(socket.room).length;
		io.sockets.in(socket.room).emit('user count', (count - 1));
		socket.leave(socket.room);
		socket.join(room);
		socket.room = room;
		io.sockets.in(socket.room).emit('user count', io.sockets.adapter.rooms[socket.room].length);
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
				sockets.emit('new_file', file.name);
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
