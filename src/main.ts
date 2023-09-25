import net from 'net';
import sourceMapSupport from 'source-map-support';
import WebSocket from 'ws';

import { env } from './env';
import { acquireTicket } from './esxi';

sourceMapSupport.install();

type Credentials = {
  username: string;
  password: string;
};

async function main() {
  console.log('esxi-vnc running');
  if (!env.TUNNELS) {
    throw new Error('Missing TUNNELS envirovnment variable.');
  }
  if (!env.ESXI_USERNAME || !env.ESXI_PASSWORD) {
    throw new Error('Missing ESXI_USERNAME or ESXI_PASSWORD envirovnment variable.');
  }
  for (const tunnel of env.TUNNELS.split(/,/)) {
    const [port, host, machineName] = tunnel.split(/:/);
    console.log(`Starting tunnel on port ${port} to ${host}:${machineName}`);
    createTunnel(Number(port), host, machineName, {
      username: env.ESXI_USERNAME,
      password: env.ESXI_PASSWORD,
    });
  }
}

function createTunnel(port: number, host: string, machineName: string, credentials: Credentials) {
  net
    .createServer(async (socket) => handleClient(socket, host, machineName, credentials))
    .listen(port);
}

async function handleClient(
  socket: net.Socket,
  host: string,
  machineName: string,
  credentials: Credentials,
) {
  let ticket;
  try {
    ticket = await acquireTicket(host, machineName, credentials);
    if (!ticket) {
      throw new Error('Ticket is falsy');
    }
  } catch (error) {
    console.error('Could not acquire ticket', error);
    socket.destroy();
    return;
  }

  const webSocket = new WebSocket(`wss://${host}:443/ticket/${ticket}`, ['binary'], {
    rejectUnauthorized: false,
  });

  webSocket.on('message', (data: Buffer) => socket.write(data));
  socket.on('data', (data: Buffer) => webSocket.send(data));

  webSocket.on('close', () => {
    try {
      socket.destroy();
    } catch (e) {
      // Probable closed/destroyed already
    }
  });

  socket.on('close', () => {
    try {
      webSocket.close();
    } catch (e) {
      // Probable closed/destroyed already
    }
  });
}

main().catch((error: unknown) => console.error(error));
