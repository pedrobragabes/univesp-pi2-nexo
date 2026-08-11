import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeCep } from './viacep.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const categories = ['Alimentação', 'Assistência', 'Comércio local', 'Cultura', 'Educação', 'Saúde e bem-estar', 'Outros'];

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isHttpUrl(value) {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); }
  catch { return false; }
}

function validate(body) {
  const item = {
    nome: clean(body.nome), descricao: clean(body.descricao), categoria: clean(body.categoria),
    cep: normalizeCep(body.cep), logradouro: clean(body.logradouro), numero: clean(body.numero),
    complemento: clean(body.complemento), bairro: clean(body.bairro), cidade: clean(body.cidade),
    uf: clean(body.uf).toUpperCase(), telefone: clean(body.telefone), site: clean(body.site),
    horario: clean(body.horario), acessibilidade: clean(body.acessibilidade), fonte: clean(body.fonte),
  };
  const errors = [];
  if (item.nome.length < 3 || item.nome.length > 100) errors.push('O nome deve ter entre 3 e 100 caracteres.');
  if (item.descricao.length < 20 || item.descricao.length > 1000) errors.push('A descrição deve ter entre 20 e 1.000 caracteres.');
  if (!categories.includes(item.categoria)) errors.push('Selecione uma categoria válida.');
  if (!/^\d{8}$/.test(item.cep)) errors.push('Informe um CEP com 8 dígitos.');
  if (item.logradouro.length < 3 || item.logradouro.length > 150) errors.push('Informe um logradouro válido.');
  if (item.numero.length > 20) errors.push('O número deve ter no máximo 20 caracteres.');
  if (item.complemento.length > 100) errors.push('O complemento deve ter no máximo 100 caracteres.');
  if (item.bairro.length < 2 || item.bairro.length > 100) errors.push('Informe um bairro válido.');
  if (item.cidade.length < 2 || item.cidade.length > 100) errors.push('Informe uma cidade válida.');
  if (!/^[A-Z]{2}$/.test(item.uf)) errors.push('Informe uma UF válida.');
  if (item.telefone.length > 30) errors.push('O telefone deve ter no máximo 30 caracteres.');
  if (!isHttpUrl(item.site)) errors.push('O site deve começar com http:// ou https://.');
  if (item.horario.length < 3 || item.horario.length > 300) errors.push('Informe o horário de funcionamento.');
  if (item.acessibilidade.length > 500) errors.push('As informações de acessibilidade devem ter no máximo 500 caracteres.');
  if (item.fonte.length < 3 || item.fonte.length > 200) errors.push('Informe a origem das informações.');
  return { item, errors };
}

function addSecurityHeaders(req, res, next) {
  res.set({
    'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self'",
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  next();
}

function rejectCrossSiteWrites(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).send('Requisição entre sites bloqueada.');

  const origin = req.get('origin');
  if (origin) {
    try {
      const expected = new URL(`${req.protocol}://${req.get('host')}`).origin;
      if (new URL(origin).origin !== expected) return res.status(403).send('Origem não permitida.');
    } catch {
      return res.status(403).send('Origem inválida.');
    }
  }
  next();
}

export function createApp({ database, viaCep }) {
  if (!database) throw new Error('A dependência database é obrigatória.');
  if (!viaCep) throw new Error('A dependência viaCep é obrigatória.');

  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', resolve(projectRoot, 'views'));
  app.use(addSecurityHeaders);
  app.use(express.urlencoded({ extended: false, limit: '30kb' }));
  app.use(express.json({ limit: '10kb' }));
  app.use(rejectCrossSiteWrites);
  app.use(express.static(resolve(projectRoot, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  }));

  app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.categories = categories;
    res.locals.formatCep = (value) => String(value).replace(/^(\d{5})(\d{3})$/, '$1-$2');
    res.locals.formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value.replace(' ', 'T')}Z`));
    next();
  });

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'nexo' }));

  app.get('/', (req, res) => {
    res.render('index', {
      title: 'Serviços locais, em um só lugar',
      indicators: database.indicators(),
      featured: database.featured(),
      categorySummary: database.categories(),
    });
  });

  app.get('/servicos', (req, res) => {
    const filters = { busca: clean(req.query.busca), categoria: clean(req.query.categoria), cidade: clean(req.query.cidade) };
    res.render('servicos/index', {
      title: 'Explorar serviços', items: database.list(filters), filters, cities: database.cities(),
    });
  });

  app.get('/servicos/novo', (req, res) => {
    res.render('servicos/form', { title: 'Sugerir serviço', item: {}, errors: [] });
  });

  app.post('/servicos', (req, res) => {
    const { item, errors } = validate(req.body);
    if (errors.length) return res.status(422).render('servicos/form', { title: 'Sugerir serviço', item, errors });
    const id = database.create(item);
    res.redirect(`/servicos/${id}?enviado=1`);
  });

  app.get('/servicos/:id', (req, res, next) => {
    const item = database.find(Number(req.params.id));
    if (!item) return next();
    res.render('servicos/show', { title: item.nome, item, sent: req.query.enviado === '1' });
  });

  app.get('/api/cep/:cep', async (req, res) => {
    try {
      res.json(await viaCep.lookup(req.params.cep));
    } catch (error) {
      const status = error.code === 'INVALID_CEP' ? 400 : error.code === 'NOT_FOUND' ? 404 : 503;
      res.status(status).json({ error: error.message || 'Não foi possível consultar o CEP.' });
    }
  });

  app.get('/api/servicos', (req, res) => {
    const filters = { busca: clean(req.query.busca), categoria: clean(req.query.categoria), cidade: clean(req.query.cidade) };
    res.json({ items: database.list(filters), filters });
  });

  app.get('/sobre', (req, res) => res.render('sobre', { title: 'Sobre o Nexo' }));

  app.use((req, res) => res.status(404).render('404', { title: 'Página não encontrada' }));
  app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    res.status(500).render('500', { title: 'Erro interno' });
  });

  return app;
}
