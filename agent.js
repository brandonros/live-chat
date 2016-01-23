var socket;

function init_socket() {
	socket = io('http://localhost:3000/');

	socket.on('message', function (data) {
		add_message(data['client_id'], data['client_id'], data['message']);
	});

	socket.on('clients', function (data) {
		draw_clients(data);
	});

	socket.on('disconnection', function (data) {
		remove_client(data['client']);
	});

	socket.on('subscription', function (data) {
		add_client(data['client']);
	});

	socket.on('messages', function (data) {
		var client_id = data['client_id'];
		var messages = data['messages'];

		$('.messages[data-client_id="' + client_id + '"]').html('');

		messages.forEach(function (m) {
			if (m['to'] === 'agents') {
				add_message(m['from'], m['from'], m['message']);
			}

			else {
				add_message(m['from'], m['to'], m['message']);
			}
		});
	});

	socket.emit('subscribe', { 'agent_name': 'Brandon', 'room': 'agents' });
	socket.emit('clients');
}

function init_events() {
	$('#input').on('keypress', function (event) {
		if (event['which'] === 13) {
			var input = $(this);
			var value = input.val();

			var active_client_id = $('button.client.active').val();
			socket.emit('message', { 'room': active_client_id, 'message': value });
			
			input.val('');

			add_message('Brandon', active_client_id, value);
		}
	});

	$('body').on('click', '.client', function (event) {
		var button = $(this);
		var client_id = button.val();

		$('button.client.active').removeClass('active');
		button.addClass('active');

		$('.messages').addClass('hide');
		$('.messages[data-client_id="' + client_id + '"]').removeClass('hide');

		$('#input').focus();

		socket.emit('messages', { 'client_id': client_id });
	});
}

function draw_clients(clients) {
	var html = '';

	clients.forEach(function (client) {
		html += '<div class="client-container"><button class="client" value="' + client + '">' + client + '</button></div>';
	});

	$('#clients').html(html);
}

function add_client(client) {
	$('#clients').append('<div class="client-container"><button class="client" value="' + client + '">' + client + '</button></div>');
}

function remove_client(client) {
	$('button.client[value="' + client + '"]').parents('.client-container').remove();
}

function add_message(name, client_id, message) {
	var html = '<div>' + name + ': ' + message + '</div>';

	var container = $('.messages[data-client_id="' + client_id + '"]');

	if (container.length === 0) {
		$('#message_container').append('<div class="messages hide" data-client_id="' + client_id + '">' + html + '</div>');

		var active_client_id = $('button.client.active').val();

		if (active_client_id === client_id) {
			$('.messages[data-client_id="' + client_id + '"]').removeClass('hide');
		}
	}

	else {
		container.append(html);
	}
}

init_events();
init_socket();