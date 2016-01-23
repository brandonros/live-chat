/*
	start: 9:43pm

	goals:
		dump active user list
		pass message from agent to client
		pass message from client to agent
*/

var low = require('lowdb');
var storage = require('lowdb/file-async');
var io = require('socket.io');

var db;

function init_db() {
	db = low('db.json', { 'storage': storage });
}

function init_socket(port) {
	var server = io(port);

	server.on('connection', function (socket) {
		socket.on('messages', function (data) {
			var messages = db('messages').filter(function (o) { 
				return o['from'] === data['client_id'] || o['to'] === data['client_id'];
			});

			socket.emit('messages', {
				'client_id': data['client_id'],
				'messages': messages
			});
		});

		socket.on('message', function (data) {
			if (data['room'] === 'agents') {
				server.to('agents').emit('message', { 'client_id': socket['client_id'], 'message': data['message'] });

				db('messages').push({
					'id': db('messages').size() + 1,
					'from': socket['client_id'],
					'to': 'agents',
					'message': data['message']
				});
			}

			else {
				server.to(data['room']).emit('message', { 'agent_name': socket['agent_name'], 'message': data['message'] });

				db('messages').push({
					'id': db('messages').size() + 1,
					'from': socket['agent_name'],
					'to': data['room'],
					'message': data['message']
				});
			}
		});

		socket.on('clients', function (data) {
			var clients = Object.keys(server['sockets']['adapter']['rooms']).filter(function (key) {
				return key.indexOf('client:') !== -1;
			});

			socket.emit('clients', clients);
		});

		socket.on('subscribe', function (data) {
			socket.join(data['room']);

			if (data['room'] === 'agents') {
				socket['agent_name'] = data['agent_name'];
			}

			else {
				socket['client_id'] = data['room'];

				server.to('agents').emit('subscription', { 'client': socket['client_id'] });
			}
		});

		socket.on('disconnect', function () {
			server.to('agents').emit('disconnection', { 'client': socket['client_id'] });
		});
	});

	server.on('error', function (err) {
		console.error(err['stack']);
	});
}

init_db();
init_socket(3000);