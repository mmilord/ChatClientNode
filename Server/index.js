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

// rooms currently available in the chat
var rooms = ['room1', 'room2', 'room3', 'room4', 'room5', 'room6'];

/**
 * Called when new connection is established
**/
io.on('connection', function(socket) {
	var conn_id;
	user_count++;
	
	// when the client emits 'adduser', this function listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		
		// store the room name in the socket session for this client
		socket.room = 'room1';
		
		// add the clients's username to the global listStyleType
		usernames[username] = username;
		
		// send client to room 1
		socket.join('room1');
		
		// echo to client that they've been connected
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		
		// echo to room 2 that a person has connected to that room
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit ('updaterooms', roooms, 'room1');
		
		

	console.log('a user connected with id: ' + conn_id);
	io.emit('user count', user_count);

	/**
	 * Called on client disconnected; pushes new user count to all connected clients
	**/
	socket.on('disconnect', function() {
		// remove the username from global usernames list
		delete usernames[socket.username];
		
		// update list of users in chat on the client side 
		io.sockets.emit('updateusers', usernames);
		
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.user name +
		' has disconnected');
		socket.leave(socket.room);
		/**console.log('user disconnected');
		user_count--;
		io.emit('user count', user_count);**/
	});
	
	/**
	 * Called on chat message received from client; pushes message to all connected clients
	 * @params - msg: Message from client
	**/
	socket.on('chat message', function(msg) {
		console.log('message from ' + msg.id + ': ' + msg.message);
		io.emit('chat message', { 'id': msg.id, 'message': msg.message } );
		io.sockets.in(socket.room).emit('updatechat', socket.username, msg);
	});
	
	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'uou have connected to ' + newroom);
		
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER',
		socket.username + ' has left this room');
		
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username +
		' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	
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
