import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database.js';
import { ViaCepError } from '../src/viacep.js';

const database = createDatabase({ filename: ':memory:', seed: true });
const viaCep = {
  async lookup(cep) {
    if (!/^\d{8}$/.test(cep)) throw new ViaCepError('INVALID_CEP', 'Informe um CEP com 8 dígitos.');
    if (cep === '99999999') throw new ViaCepError('NOT_FOUND', 'CEP não encontrado.');
    return { cep, logradouro: 'Rua sintética', complemento: '', bairro: 'Bairro sintético', cidade: 'Cidade sintética', uf: 'SP', ibge: '' };
  },
};
const server = createApp({ database, viaCep }).listen(3484, '127.0.0.1');
function shutdown() { server.close(() => { database.close(); process.exit(0); }); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
