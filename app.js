/*
	start: 9:43pm

	goals:
		dump active user list
		pass message from agent to client
		pass message from client to agent
*/

var io = require('socket.io');

function init_socket(port) {
	var server = io(port);

	server.on('connection', function (socket) {
		client.on('message', function (data) {
			io.to(data['room']).emit('message', data);
		});

		client.on('clients', function (data) {
			client.emit('clients', server['sockets']);
		});

		client.on('subscribe', function (data) {
			socket.join(data['room']);

			if (data['room'] !== 'agent') {
				io.to('agent').emit('subscribe', { 'client': data['client_id'] });
			}
		});
	});

	server.on('error', function (err) {
		console.error(err['stack']);
	});
}

init_socket(3000);