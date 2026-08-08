import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

await import('./server.js');
