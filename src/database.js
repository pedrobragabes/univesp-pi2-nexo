import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const schema = `
  CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL CHECK(length(nome) BETWEEN 3 AND 100),
    descricao TEXT NOT NULL CHECK(length(descricao) BETWEEN 20 AND 1000),
    categoria TEXT NOT NULL,
    cep TEXT NOT NULL CHECK(length(cep) = 8),
    logradouro TEXT NOT NULL,
    numero TEXT DEFAULT '',
    complemento TEXT DEFAULT '',
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    uf TEXT NOT NULL CHECK(length(uf) = 2),
    telefone TEXT DEFAULT '',
    site TEXT DEFAULT '',
    horario TEXT NOT NULL,
    acessibilidade TEXT DEFAULT '',
    fonte TEXT NOT NULL,
    verificado INTEGER NOT NULL DEFAULT 0 CHECK(verificado IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedRows = [
  {
    nome: 'Biblioteca Comunitária Ponto de Luz',
    descricao: 'Empréstimo de livros, rodas de leitura e apoio a pesquisas escolares para moradores da região.',
    categoria: 'Educação', cep: '01001000', logradouro: 'Praça da Sé', numero: '12', complemento: '',
    bairro: 'Sé', cidade: 'São Paulo', uf: 'SP', telefone: '(11) 3000-1001', site: '',
    horario: 'Terça a sábado, das 9h às 17h', acessibilidade: 'Entrada sem degraus e banheiro acessível.',
    fonte: 'Registro fictício para demonstração acadêmica', verificado: 1,
  },
  {
    nome: 'Cozinha Escola Bairro Alto',
    descricao: 'Oficinas gratuitas de aproveitamento integral de alimentos e preparação de refeições econômicas.',
    categoria: 'Alimentação', cep: '13010000', logradouro: 'Rua Barão de Jaguara', numero: '80', complemento: 'Salão 2',
    bairro: 'Centro', cidade: 'Campinas', uf: 'SP', telefone: '(19) 3000-2020', site: '',
    horario: 'Quartas e sextas, das 14h às 18h', acessibilidade: 'Atendimento prioritário sob solicitação.',
    fonte: 'Registro fictício para demonstração acadêmica', verificado: 0,
  },
  {
    nome: 'Feira de Produtores da Estação',
    descricao: 'Venda direta de hortaliças, pães e produtos artesanais por pequenos produtores locais.',
    categoria: 'Comércio local', cep: '18010000', logradouro: 'Rua São Bento', numero: '240', complemento: '',
    bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP', telefone: '(15) 3000-3030', site: 'https://example.com/feira',
    horario: 'Domingos, das 7h às 12h', acessibilidade: 'Circulação em piso nivelado; não há banheiro no local.',
    fonte: 'Registro fictício para demonstração acadêmica', verificado: 1,
  },
];

function insertService(db, item) {
  return db.prepare(`
    INSERT INTO servicos (
      nome, descricao, categoria, cep, logradouro, numero, complemento, bairro, cidade, uf,
      telefone, site, horario, acessibilidade, fonte, verificado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.nome, item.descricao, item.categoria, item.cep, item.logradouro, item.numero,
    item.complemento, item.bairro, item.cidade, item.uf, item.telefone, item.site,
    item.horario, item.acessibilidade, item.fonte, item.verificado ? 1 : 0,
  );
}

export function createDatabase({ filename, seed = true } = {}) {
  const dbPath = filename || resolve(projectRoot, 'data', 'nexo.db');
  if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  db.exec(schema);

  const count = db.prepare('SELECT COUNT(*) AS total FROM servicos').get().total;
  if (seed && count === 0) {
    db.exec('BEGIN');
    try {
      for (const row of seedRows) insertService(db, row);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return {
    list({ busca = '', categoria = '', cidade = '' } = {}) {
      const clauses = [];
      const params = [];
      if (categoria) { clauses.push('categoria = ?'); params.push(categoria); }
      if (cidade) { clauses.push('cidade = ?'); params.push(cidade); }
      if (busca) {
        const term = `%${busca}%`;
        clauses.push('(nome LIKE ? OR descricao LIKE ? OR bairro LIKE ? OR categoria LIKE ?)');
        params.push(term, term, term, term);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return db.prepare(`SELECT * FROM servicos ${where} ORDER BY verificado DESC, nome COLLATE NOCASE`).all(...params);
    },
    featured(limit = 3) {
      return db.prepare('SELECT * FROM servicos ORDER BY verificado DESC, datetime(created_at) DESC LIMIT ?').all(limit);
    },
    find(id) {
      return db.prepare('SELECT * FROM servicos WHERE id = ?').get(id);
    },
    create(item) {
      return Number(insertService(db, { ...item, verificado: false }).lastInsertRowid);
    },
    categories() {
      return db.prepare('SELECT categoria, COUNT(*) AS total FROM servicos GROUP BY categoria ORDER BY categoria COLLATE NOCASE').all();
    },
    cities() {
      return db.prepare('SELECT DISTINCT cidade FROM servicos ORDER BY cidade COLLATE NOCASE').all().map((row) => row.cidade);
    },
    indicators() {
      return db.prepare(`
        SELECT COUNT(*) AS total,
          COUNT(DISTINCT categoria) AS categorias,
          COUNT(DISTINCT cidade) AS cidades,
          COALESCE(SUM(verificado), 0) AS verificados
        FROM servicos
      `).get();
    },
    close() { db.close(); },
  };
}
