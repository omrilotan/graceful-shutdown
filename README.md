# @routes/graceful-shutdown <a href="https://www.npmjs.com/package/@routes/graceful-shutdown"><img src="https://img.shields.io/npm/v/@routes/graceful-shutdown.svg"></a> [![](https://img.shields.io/badge/source--000000.svg?logo=github&style=social)](https://github.com/omrilotan/graceful-shutdown)

## 💀 Shut down server gracefully

[![](https://circleci.com/gh/omrilotan/graceful-shutdown.svg?style=svg)](https://circleci.com/gh/omrilotan/graceful-shutdown) [![](https://snyk.io/test/github/omrilotan/graceful-shutdown/badge.svg)](https://snyk.io/test/github/omrilotan/graceful-shutdown) [![](https://api.codeclimate.com/v1/badges/7914da297e8693bba8f6/maintainability)](https://codeclimate.com/github/omrilotan/graceful-shutdown/maintainability)

[net.Server](https://nodejs.org/api/net.html#net_class_net_server) or [Express](https://expressjs.com/en/api.html#app.listen), whatever you're using should be fine

```js
const graceful = require('@routes/graceful-shutdown');

const server = app.listen(1337); // express will return the server instance here
graceful(server);
```

### Arguments
- First argument is an net.Server instance (including Express server)
- Second argument is options:

| option | type | meaning | default
| - | - | - | -
| `timeout` | Number | Time (in milliseconds) to wait before forcefully shutting down | `10000` (10 sec)
| `logger` | Object | Object with `info` and `error` functions (supports async loggers). Pass `false` to disable | `console`
| `events` | Array | Process events to handle | `['SIGTERM', 'SIGINT']`
| `onsuccess` | Function | Final functionality when shutdown finished correctly | `process.exit(0)`
| `onfail` | Function | Final functionality when shutdown finished incorrectly | `process.exit(1)`

Example of using options
```js
graceful(server, {
	timeout: 3e4,
	logger: winston.createLogger({level: 'error'}),
});
```

## What happens on process termination?
1. Process termination is interrupted
2. Open connections are instructed to end (FIN packet) and receive a new timeout to allow them to close in time
3. The server is firing a close function
4. After correct closing: `onsuccess` (default: process exists with exit code 0)
	- _End correct behaviour_
5. After `timeout` passes - an error log is printed with the amount of connection that will be forcefully terminated
6. `onfail`: (default: process exists with an exit code 1)

## Add custom functionality to shutdown
Add behaviour to the graceful shut down process using a built in pub/sub mechanism
```js
const { sub, BEFORE, AFTER } = graceful(server, {...});

// Will be triggered first thing before the procedure starts
sub(BEFORE, async() => {
	await flushThrottledThings();
	await closeDatabaseConnections();
});

// Will be triggered once the procedure has ended
sub(AFTER, () => logger.info('Okay okay, closing down'));
```

## `server.shuttingDown`
After shutdown has initiated, the attribute `shuttingDown` is attached to server with value of `true`.

User can query this value on service to know not to send any more requests to the service
```js
app.get(
	'/health',
	(request, response) => response.status(server.shuttingDown ? 503 : 200).end()
);
```

## What else does graceful expose?

- `{Set} sockets` A reference to the sockets collection
```js
const { sockets } = graceful(server, {...});

// Monitor size of set every two minutes
setInterval(() => stats.time('graceful_stored_sockets', sockets.size), 12e4);
```
