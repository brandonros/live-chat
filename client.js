var client_id;
var socket;

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
	
function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function init_client_id() {
	client_id = localStorage.getItem('client_id');

	if (!client_id) {
		client_id = 'client:' + guid();
		localStorage.setItem('client_id', client_id);
	}
}

function init_socket() {
	socket = io('http://localhost:3000/');

	socket.emit('subscribe', { 'room': client_id });

	socket.on('message', function (data) {
		add_message(data['agent_name'], data['message']);

		var container = $('#live_chat_container');

		if (container.hasClass('hide')) {
			container.removeClass('hide');
		}
	});
}

function init_events() {
	$('#live_chat_input').on('keypress', function (event) {
		if (event['which'] === 13) {
			var input = $(this);
			var value = input.val();
			socket.emit('message', { 'room': 'agents', 'message': value });
			input.val('');

			add_message('You', value);
		}
	});

	$('#live_chat_button').on('click', function (event) {
		$('#live_chat_container').removeClass('hide');
		$('#live_chat_input').focus();
	});
}

function add_message(name, message) {
	$('#live_chat_messages').append('<div class="live-chat-message">' + name + ': ' + message + '</div>');
}

init_client_id();
init_events();
init_socket();