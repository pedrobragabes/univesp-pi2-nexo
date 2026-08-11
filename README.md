# Nexo — Projeto Integrador II

O **Nexo** é um protótipo de catálogo acessível para descoberta de serviços, iniciativas comunitárias e pequenos estabelecimentos locais. O projeto foi planejado para cobrir tanto o PJI240 quanto o Projeto Integrador Extensionista II, dependendo da matriz ativa no Portal/AVA.

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

Requer Node.js 22.5 ou superior.

```powershell
cd "C:\Users\pedro\Documents\Projetos\UNIVESP\Estudos UNIVESP\pi2-nexo"
npm install
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

## Próximos incrementos

1. realizar o levantamento com a organização parceira;
2. definir critérios e responsáveis pela verificação das informações;
3. implementar autenticação e fila de curadoria;
4. preparar configuração para ambiente de homologação em nuvem;
5. executar revisão de acessibilidade e testes com participantes.
