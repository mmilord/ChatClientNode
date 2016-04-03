$(function() {
	var socket = io();
				
	//on transmit message clicked
	$('form').submit(function(){
		if ($('#sendMsg').val() != "") {
			messageSender();
		}
		return false;
	});
	
	
	function messageSender() {
		if (socket.connected) {
			socket.emit('chat message', { 'id': socket.io.engine.id, 'message': $('#sendMsg').val() });
			$('#sendMsg').val('');
		}
		else {
			alert("Connection error; try refreshing");
		}
	}

	socket.on('user count', function(msg) {
		document.getElementById('userCount').innerHTML = 'Connected user count: ' + msg;
	});
				
	socket.on('chat message', function(msg){
		d = new Date();
		
		if (msg.id == socket.io.engine.id) {
			$('#messageList').append($('<li>').html(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' - Me: <br>' + msg.message).css('text-align', 'right'));
		}
		else {
			$('#messageList').append($('<li>').html(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' - User ' + socket.io.engine.id + " says: <br>" + msg.message));
		}
	});
});