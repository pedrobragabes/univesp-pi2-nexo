# Implantação em nuvem — Nexo

## Estado

O projeto está conteinerizado e pronto para homologação. Este documento não declara que exista uma instância pública ativa.

## Requisitos da plataforma

- execução de contêiner Linux;
- porta HTTP fornecida por `PORT`;
- volume persistente montado em `/app/data`;
- endpoint de saúde `GET /health`;
- HTTPS encerrado pela plataforma.

## Variáveis

| Variável | Produção recomendada |
|---|---|
| `PORT` | definida pela plataforma |
| `DATABASE_PATH` | `/app/data/nexo.db` |
| `SEED_DATABASE` | `false` |
| `VIACEP_TIMEOUT_MS` | `4000` |

## Homologação local do contêiner

```bash
docker build -t nexo:0.1.0 .
docker volume create nexo-data
docker run --rm -p 3001:3001 -v nexo-data:/app/data nexo:0.1.0
curl http://localhost:3001/health
```

## Evidências antes da entrega

- registrar provedor, região, data e URL HTTPS;
- reiniciar a instância e confirmar persistência;
- testar o `/health`, a consulta de CEP e um cadastro sem dados pessoais reais;
- guardar capturas e logs sem segredos;
- definir responsável por disponibilidade, backup e exclusão dos dados.
