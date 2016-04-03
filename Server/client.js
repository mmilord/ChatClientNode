var socket = io();
var id = 0;
socket.on('conn_id', function(msg) {
	this.id = msg;
});

$('form').submit(function() {
	socket.emit('chat message', $('#m').val());
	$('#m').val('');
	return false;
});

socket.on('chat message', function(msg) {
	$('#messages').append($('<li>').text(msg.id + ": " + msg.message));
});