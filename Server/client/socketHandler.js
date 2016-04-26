$(function() {
	var room = "";
	var un = "";
	var socket = io();
	var scrolled = false;
	
	$("messageList").on('scroll', function() {
		
	});
				
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
		document.getElementById('userCount').innerHTML = msg + ' User(s) Connected';
	});
	
	/**
	 * Display received chat message in window
	**/		
	socket.on('chat message', function(msg){
		d = new Date();
		
		if (msg.un == un) {
			$('#messageList').append($('<li>').html('Me @ ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '<br>' + msg.message).css('text-align', 'right'));
		}
		else {
			$('#messageList').append($('<li>').html(msg.un + ' @ ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + " says: <br>" + msg.message).css('text-align', 'left'));
		}
		
		var element = document.getElementById('msgs')
		//element.scrollTop = element.scrollHeight;
		var isScrolledToBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 1;
		if (isScrolledToBottom)
			element.scrollTop = element.scrollHeight - element.clientHeight;
	});
	
	/**
	 * get which chat room
	**/
	function getRoom() {
		room = getParameterByName('room');
		console.log(getParameterByName('room'));
		document.getElementById('title').innerHTML = room;
		document.title = room;
		socket.emit('join_room', room);
	}
	
	function getUsername() {
		un = getParameterByName('un');
		//alert(un);
		socket.emit('newuser', un);
		document.getElementById('username').innerHTML = "Connected as: " + un;
	}
	
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
	
	socket.on('new_file', function(data) {
		filepath = 'cache/' + data;
		$('#messageList').append($('<li>').html(msg.un + ' @ ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + " uploaded: <br>" + '<a href=filepath>' + data + '</a>').css('text-align', 'left'));
	
	});
	
	socket.on('username' , function(data) {
		un = data;
		console.log('username= ' + un);
		document.getElementById('username').innerHTML = "Connected as: " + un;
	});
	
	
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	
	getUsername();
	
	getRoom();
});
