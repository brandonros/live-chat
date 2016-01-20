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
		socket.on('message', function (data) {
			io.to(data['room']).emit('message', data);
		});

		socket.on('clients', function (data) {
			var clients = Object.keys(server['sockets']['adapter']['rooms']).filter(function (key) {
				return key.indexOf('client:') !== -1;
			});

			socket.emit('clients', clients);
		});

		socket.on('subscribe', function (data) {
			socket.join(data['room']);

			if (data['room'] !== 'agent') {
				socket['client_id'] = data['room'];

				server.to('agent').emit('subscription', { 'client': socket['client_id'] });
			}
		});

		socket.on('disconnect', function () {
			server.to('agent').emit('disconnection', { 'client': socket['client_id'] });
		});
	});

	server.on('error', function (err) {
		console.error(err['stack']);
	});
}

init_socket(3000);