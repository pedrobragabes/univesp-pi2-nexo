# Implantação em nuvem — Nexo

## Estado

Existe configuração de contêiner para demonstração e construção na CI. A versão 0.1.2 foi validada localmente com dados sintéticos; isso não homologa implantação em nuvem. Não há instância pública comprovada. Autenticação, moderação, limitação/cache da API de CEP, privacidade e operação são bloqueios antes de abrir o serviço à internet.

## Requisitos da plataforma

- execução de contêiner Linux;
- porta HTTP fornecida por `PORT`;
- volume persistente montado em `/app/data`;
- endpoint de saúde `GET /health`;
- HTTPS encerrado pela plataforma.

## Variáveis

| Variável | Homologação controlada |
|---|---|
| `PORT` | definida pela plataforma |
| `DATABASE_PATH` | `/app/data/nexo.db` |
| `SEED_DATABASE` | `false` |
| `VIACEP_TIMEOUT_MS` | `4000` |

## Homologação local do contêiner

```bash
docker build -t nexo:0.1.2 .
docker volume create nexo-data
docker run --rm -p 127.0.0.1:3001:3001 -v nexo-data:/app/data nexo:0.1.2
curl http://localhost:3001/health
```

## Evidências antes da entrega

- registrar provedor, região, data e URL HTTPS;
- reiniciar a instância e confirmar persistência;
- testar o `/health`, a consulta de CEP e um cadastro sem dados pessoais reais;
- guardar capturas e logs sem segredos;
- definir responsável por disponibilidade, backup e exclusão dos dados.
