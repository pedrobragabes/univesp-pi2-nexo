# Nexo — Projeto Integrador II

[![CI](https://github.com/pedrobragabes/univesp-pi2-nexo/actions/workflows/ci.yml/badge.svg)](https://github.com/pedrobragabes/univesp-pi2-nexo/actions/workflows/ci.yml)
[![CodeQL](https://github.com/pedrobragabes/univesp-pi2-nexo/actions/workflows/codeql.yml/badge.svg)](https://github.com/pedrobragabes/univesp-pi2-nexo/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

O **Nexo** é um protótipo de catálogo acessível para descoberta de serviços, iniciativas comunitárias e pequenos estabelecimentos locais. O projeto foi planejado para cobrir tanto o PJI240 quanto o Projeto Integrador Extensionista II, dependendo da matriz ativa no Portal/AVA.

## Estado

| Dimensão | Situação |
|---|---|
| fundação técnica | concluída, com 11 testes e release `v0.1.0-foundation` |
| entrega acadêmica | pendente de parceiro, pesquisa, validação, relatório e vídeo |
| dados | três registros fictícios identificados |
| nuvem | configuração de contêiner pronta; homologação real ainda não executada |

## Estado da primeira entrega

- catálogo com busca e filtros por categoria e cidade;
- cadastro de uma sugestão com validação no servidor;
- preenchimento assistido de endereço por CEP;
- integração externa com ViaCEP isolada atrás do backend;
- API JSON própria para consulta do catálogo;
- persistência em SQLite;
- interface responsiva com navegação por teclado e mensagens anunciadas;
- testes do fluxo principal, validação, filtros e integração simulada;
- registros fictícios claramente identificados.

## Executar

Requer Node.js 22.5 ou superior. Após clonar o repositório e entrar em sua pasta:

```powershell
npm ci
npm start
```

Acesse `http://localhost:3001`.

Para iniciar sem os três registros fictícios:

```powershell
$env:SEED_DATABASE="false"
npm start
```

## Verificar

```powershell
npm run check
npm test
```

Os testes utilizam SQLite em memória e um cliente ViaCEP simulado. Eles não acessam a internet nem alteram o banco local.

## Integração ViaCEP

O servidor consulta `https://viacep.com.br/ws/{cep}/json/` após validar oito dígitos. CEP válido mas inexistente é tratado como `404`; formato inválido como `400`; timeout ou falha externa como `503`. O navegador chama apenas `/api/cep/:cep`, mantendo o contrato externo concentrado no backend.

O ViaCEP alerta que uso massivo pode causar bloqueio. Esta integração serve ao preenchimento pontual do formulário e não deve ser usada para validar bases em lote.

## Limites acadêmicos e éticos

O software ainda não comprova que o problema existe no território. A equipe precisa definir parceiro e município, entrevistar participantes, revisar requisitos e validar tarefas. Os registros iniciais são fictícios. Não há autenticação, moderação, auditoria ou política de privacidade; portanto, o protótipo não deve ser divulgado como diretório oficial nem receber dados pessoais reais.

## Documentação

- [Fundação e requisitos](docs/01-fundacao-do-projeto.md)
- [Revisão de código](docs/02-revisao-de-codigo.md)
- [Modelo de relatório parcial](docs/03-relatorio-parcial.md)
- [Modelo de relatório final](docs/04-relatorio-final.md)
- [Implantação em nuvem](docs/05-implantacao-em-nuvem.md)

## Próximos incrementos

1. realizar o levantamento com a organização parceira;
2. definir critérios e responsáveis pela verificação das informações;
3. implementar autenticação e fila de curadoria;
4. preparar configuração para ambiente de homologação em nuvem;
5. executar revisão de acessibilidade e testes com participantes.

## Governança e licença

As atividades devem ser acompanhadas por issues e milestones alinhados ao AVA. Consulte [SECURITY.md](SECURITY.md). O código usa [licença MIT](LICENSE); cadastros e evidências reais exigem autorização específica.
