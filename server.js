import { createApp } from './src/app.js';
import { createDatabase } from './src/database.js';
import { createViaCepClient } from './src/viacep.js';

const port = Number(process.env.PORT) || 3001;
const database = createDatabase({
  filename: process.env.DATABASE_PATH,
  seed: process.env.SEED_DATABASE !== 'false',
});
const viaCep = createViaCepClient({
  timeoutMs: Number(process.env.VIACEP_TIMEOUT_MS) || 4000,
});

const server = createApp({ database, viaCep }).listen(port, () => {
  console.log(`Nexo disponível em http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
