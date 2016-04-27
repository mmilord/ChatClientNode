$(function() {

	$('.room').click(function() {
		//alert("test");
		var loc = "chat_window.html?room=" + $(this).attr('value');
		if ($('#un').val() != "") {
			loc += "&un=" + $('#un').val();
		}
		//alert(loc);
		window.location =  loc;
	});

});