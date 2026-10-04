# Relatório técnico parcial e campos acadêmicos pendentes — PI II / PIE II

> Substitua cada `[PREENCHER]` por evidência real. Não apresente dados fictícios como pesquisa de campo.

## Evidência técnica de 04/10/2026

O protótipo 0.1.2 usa Express/EJS, HTML/CSS/JavaScript, SQLite e um cliente ViaCEP isolado no backend. Oferece catálogo pesquisável, filtros, detalhes, sugestão não verificada e API JSON. Os três registros iniciais são fictícios; cadastros adicionais dos testes também são sintéticos e ficam em memória.

| Verificação | Resultado | Limite |
|---|---|---|
| Node | 16 testes passaram, sem falhas ou skips | Dados sintéticos; nenhum levantamento real |
| Playwright | 11 testes passaram | Chromium: desktop 1440 px, celular 390 px e layout 320 px |
| Acessibilidade automática | Quatro páginas com zero violações Axe nos estados testados | Não substitui leitores de tela e participantes reais |
| Dependências | npm audit completo com zero alertas conhecidos | Resultado desta execução, não garantia permanente |
| ViaCEP | Formato, timeout, falhas e estrutura inválida tratados; resultados atrasados e edição manual preservados | Respostas simuladas; sem chamada à API real nesta validação |
| Formulário | Envio manual, conteúdo escapado e cadastro sem JavaScript verificados | Sugestões aparecem publicamente no protótipo, sem moderação |

Reprodução: npm ci, npm run check, npm test, npx playwright install chromium, npm run test:e2e e npm audit. O Playwright inicia e encerra um servidor somente em loopback. A CI executa essas verificações e constrói a imagem; o resultado do workflow precisa ser consultado no commit usado na entrega.

Não foram executados implantação pública, avaliação em aparelhos físicos, entrevistas, curadoria real, envio ao AVA nem vídeo acadêmico. Autenticação, moderação, limite/cache da consulta de CEP, privacidade e operação continuam requisitos antes de uso público. As issues 4, 5, 6 e 7 permanecem abertas porque dependem dessas evidências e decisões.

## Identificação

- Curso, polo e semestre: [PREENCHER]
- Integrantes e orientador: [PREENCHER]
- Comunidade ou parceiro: [PREENCHER]

## Tema, problema e justificativa

Descreva o acesso a serviços locais, quem é afetado e como o problema foi confirmado por observação, entrevista ou fonte documental. [PREENCHER]

## Objetivos

- Objetivo geral: [PREENCHER]
- Objetivos específicos: [PREENCHER]

## Método e levantamento de requisitos

Registre participantes, instrumentos, critérios éticos, requisitos funcionais e não funcionais. Explique como acessibilidade, API externa, banco de dados e nuvem entram na proposta. [PREENCHER]

## Solução em desenvolvimento

O resumo técnico e os resultados estão acima. Para a entrega acadêmica, acrescente o commit efetivamente entregue, telas escolhidas pela equipe, resultados do ambiente de homologação e evidências da avaliação com participantes. [PREENCHER]

## Plano de ação

| Atividade | Responsável | Evidência | Prazo do AVA | Situação |
|---|---|---|---|---|
| Validar requisitos com a comunidade | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| Homologar implantação em nuvem | [PREENCHER] | URL e teste | [PREENCHER] | Pendente |

## Referências

- ViaCEP. Documentação de formato, retorno e restrição de uso massivo. https://viacep.com.br/. Consultado em 04/10/2026. Esta referência foi usada no contrato de integração, sem consulta de CEP real nos testes.
- Demais fontes acadêmicas efetivamente utilizadas e adequação ao padrão exigido pela Univesp: [PREENCHER].
