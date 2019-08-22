import express from 'express';
import fs from 'fs';
import { join } from 'path';
import graceful from '.';

process.on('unhandledRejection', console.error);
const {promises: {lstat, readdir}} = fs;

const app = express();
app.set('x-powered-by', false);
app.set('etag', () => null);

const {PORT = 1337} = process.env;
const respond = (request, response) => response.send('-');

app.use(({url, method}, response, next) => {
	console.log(method, url);
	next();
});

app.get('/wait/:delay', ({params: {delay = 0}}, response) => setTimeout(() => response.status(200).type('txt').send(delay), Number(delay)));
app.get('*', respond);
app.post('*', respond);
app.patch('*', respond);
app.delete('*', respond);

const server = app.listen(
	PORT,
	() => console.log(`Listening on http://localhost:${server._connectionKey.split(':').pop()}`)
);

graceful(server, {timeout: 10000});

app.get(
	'/health',
	(request, response) => response.status(server.shuttingDown ? 503 : 200).end()
);

server.on(
	'connection',
	(socket, start = Date.now()) => ['close', 'error', 'timeout'].forEach(
		event => socket.on(
			event,
			() => console.debug(`Socket terminated after ${Date.now() - start}ms on ${event} event`)
		)
	)
);
