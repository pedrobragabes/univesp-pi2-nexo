# Revisão de código - versão 0.1.0

## Escopo

Revisão local de `server.js`, `src/`, `public/`, `views/`, testes, configuração e documentação antes da primeira publicação. Foram analisados bugs funcionais, validação de entrada, SQL, XSS, requisições entre sites, dependência externa, acessibilidade, comportamento responsivo e limites de implantação.

## Achados corrigidos

### P1 - Troca de CEP mantinha endereço anterior

O JavaScript preenchia apenas campos vazios. Depois de consultar um CEP, uma segunda consulta mantinha logradouro, bairro, cidade e UF antigos, podendo formar um endereço inconsistente.

**Correção:** os campos autoritativos do ViaCEP agora são substituídos a cada consulta. O complemento digitado pelo usuário é preservado.

### P1 - Escritas entre sites não eram recusadas

O endpoint de cadastro aceitava formulários enviados a partir de outra origem. Embora ainda não exista sessão autenticada, isso permitiria inserções indesejadas se o protótipo fosse publicado.

**Correção:** requisições de escrita marcadas como `cross-site` ou com `Origin` divergente retornam `403`. Uma solução com sessão futura deverá acrescentar token CSRF.

### P2 - Ausência de cabeçalhos defensivos

As respostas não definiam política de conteúdo, proteção contra enquadramento ou restrições de permissões do navegador.

**Correção:** foram adicionados CSP restritivo, `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e `X-Frame-Options`.

### P2 - JSON inválido do serviço externo escapava do contrato

Falhas ao interpretar a resposta do ViaCEP geravam um erro genérico em vez de `ViaCepError`.

**Correção:** erros de parsing agora são classificados como indisponibilidade e retornam resposta controlada ao cliente.

## Riscos aceitos nesta fase

### P1 para produção - não há autenticação nem moderação

Uma sugestão válida aparece imediatamente no catálogo. Isso é aceitável somente para demonstração local com dados fictícios. Antes de qualquer implantação pública, é obrigatório incluir autenticação de curadores, fila de análise, auditoria e política de correção/expiração.

### P2 para produção - API externa sem rate limiting ou cache

O proxy de CEP pode ser chamado repetidamente. Antes da implantação, deve receber limite por origem/IP, cache de consultas e observabilidade, respeitando a restrição do provedor contra uso massivo.

### P2 - `node:sqlite` ainda é experimental

O runtime utilizado emite aviso experimental. O protótipo mantém poucas dependências e testes reproduzíveis, mas uma implantação deverá fixar a versão do Node e avaliar um driver estável ou serviço gerenciado.

## Verificações

- checagem sintática de todos os arquivos JavaScript;
- testes de cadastro, validação, busca, API própria e ViaCEP simulado;
- teste de escrita entre sites e cabeçalhos defensivos;
- `npm audit` sem vulnerabilidades conhecidas;
- smoke test HTTP da aplicação;
- inspeção visual em desktop e viewport móvel;
- console do navegador sem erros ou avisos;
- ausência de overflow horizontal na página e na navegação móvel.

## Conclusão

Não restaram achados bloqueadores para publicação do código como **protótipo acadêmico local**. Os riscos de autenticação, moderação e abuso permanecem bloqueadores explícitos para disponibilização pública do serviço.
