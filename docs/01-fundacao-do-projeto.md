# Fundação do projeto Nexo

## Hipótese inicial

Informações sobre serviços e iniciativas locais podem estar dispersas, desatualizadas ou pouco acessíveis. O Nexo testa se um catálogo pesquisável, com fonte e estado de verificação visíveis, ajuda pessoas a encontrar recursos do território.

Esta hipótese não substitui o levantamento com a comunidade.

## Questão orientadora

Como uma plataforma acessível, integrada a serviços externos e disponível em nuvem pode facilitar a descoberta de recursos locais confiáveis?

## Recorte técnico da primeira entrega

- Express 5 e EJS para a aplicação web;
- HTML semântico, CSS responsivo e JavaScript progressivo;
- SQLite para persistência;
- ViaCEP como primeiro serviço externo;
- API JSON própria para consulta;
- testes com banco em memória e integração simulada;
- Git para rastrear a evolução.

## Decisões

1. **Projeto independente:** o Nexo não usa banco, entidades ou fluxos do Conecta Bairro.
2. **Integração isolada:** o cliente ViaCEP fica em módulo próprio e pode ser substituído.
3. **Falha explícita:** indisponibilidade externa não apaga o formulário nem bloqueia preenchimento manual.
4. **Curadoria visível:** todo registro informa fonte e situação de verificação.
5. **Dados fictícios:** a base inicial demonstra o software sem simular pesquisa de campo.
6. **Melhoria progressiva:** o cadastro funciona sem JavaScript; a consulta de CEP é conveniência adicional.

## Pendências que exigem estudantes e parceiro

- integrantes, RAs, polo e orientador;
- organização e território;
- entrevistas e observação do fluxo atual;
- público prioritário e critérios de sucesso;
- categorias reais e vocabulário utilizado pelos participantes;
- processo de inclusão, revisão, correção e expiração de registros;
- plano de implantação em nuvem aprovado para a disciplina;
- resultados de acessibilidade, usabilidade e impacto.
