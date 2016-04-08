$(function() {
	var socket = io();
				
	//on transmit message clicked
	$('form').submit(function(){
		if ($('#sendMsg').val() != "") {
			messageSender();
		}
		return false;
	});
	
	/**
	 * Send message to server if connection is active
	**/
	function messageSender() {
		if (socket.connected) {
			socket.emit('chat message', { 'id': socket.io.engine.id, 'message': $('#sendMsg').val() });
			$('#sendMsg').val('');
		}
		else {
			alert("Connection error; try refreshing");
		}
	}
	
	/**
	 * Send request to server for specified file
	**/ 
	function test() {
		if (socket.connected) {
			socket.emit('test');
		}
	}

	/**
	 * Update user count in window
	**/
	socket.on('user count', function(msg) {
		document.getElementById('userCount').innerHTML = 'Connected user count: ' + msg;
	});
			

	/**
	 * Display received chat message in window
	**/
	socket.on('chat message', function(msg){
		d = new Date();
		
		if (msg.id == socket.io.engine.id) {
			$('#messageList').append($('<li>').html(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' - Me: <br>' + msg.message).css('text-align', 'right'));
		}
		else {
			$('#messageList').append($('<li>').html(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' - User ' + socket.io.engine.id + " says: <br>" + msg.message));
		}
	});
	
	/**
	 * Delivery.js logic to send files to server
	**/
	socket.on('connect', function() {
		var delivery = new Delivery(socket);

		delivery.on('delivery.connect',function(delivery){
		  $("input[type=submit]").click(function(evt){
			var file = $("input[type=file]")[0].files[0];
			console.log("file size is: " + Math.round(file.size/1024) + " kb");
			if (file.size < 1000000) {
				delivery.send(file);
				evt.preventDefault();
			}
			else {
				console.log("too big");
			}
		  });
		});

		delivery.on('send.success',function(fileUID){
		  console.log("file was successfully sent.");
		});
	});
});