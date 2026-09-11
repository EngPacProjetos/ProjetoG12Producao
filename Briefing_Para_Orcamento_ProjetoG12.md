# Briefing para Orçamento — Projeto G12 (Fluig/TOTVS RM)

**Objetivo deste documento:** reunir tudo que um programador Fluig sênior precisa saber sobre o estado atual do **G12** para conseguir te dar um orçamento sério — e listar o que **você** ainda precisa decidir/perguntar antes de pedir esse orçamento, para não receber um número "chutado".

Este briefing foi montado a partir da documentação técnica completa já existente (`Documentacao_ProjetoG12Producao.md`, no mesmo diretório), produzida por leitura integral do código-fonte do repositório de Produção. **Anexe aquele arquivo junto com este** quando for conversar com o programador — ele é a fonte de todos os números e achados citados aqui.

---

## 1. O que é o G12, em uma frase

Processo de BPM no Fluig que automatiza a **transmissão de Notas Fiscais de Serviço Eletrônicas (NFS-e)** de contratos, com faturamento em cadeia dentro do TOTVS RM (3 tipos de movimento), ajuste de tributos (nacionais, municipais, IRRF/INSS), envio/validação da nota junto à prefeitura e checagem final de transmissão — hoje **em uso ativo em produção**, faturando notas reais.

Isso importa para o orçamento porque **qualquer mudança precisa ser testada com cuidado antes de subir para produção** — não é um sistema experimental, é faturamento real rodando.

---

## 2. Tamanho e complexidade do projeto (para o programador dimensionar o esforço)

| Camada | Quantidade / Fato |
|---|---|
| Processo BPMN | 1 processo (`G12`, versão 6 em produção), ~50 atividades/estados mapeados, 2 gateways (1 por expressão JavaScript, 1 por regra automática de campo), múltiplos pares de "link" cruzando 5 pools/swimlanes |
| Service Tasks (scripts automáticos) | ~15 originais + 13 do sub-fluxo "Ajuste Financeiro" adicionado depois = **~28 scripts** de integração com o RM |
| Eventos globais do processo | 3 (`beforeStateEntry`, `afterTaskComplete`, função de condição de gateway) |
| Mecanismos de atribuição (define quem recebe cada tarefa) | 4 confirmados como usados pelo processo + 5 adicionais existentes mas **não conectados** ao processo ainda (parecem preparados para uma evolução futura) |
| Datasets (consultas ao RM) | 13 consultas SQL nomeadas cadastradas no RM |
| Formulário | 1 arquivo HTML com ~19 seções/painéis e 6 modais dinâmicos de ajuste/cadastro de tributos |
| JavaScript de front-end | ~19 arquivos (toggle de painéis, cálculo de tributos, modal de nota fiscal/DANFSe, upload de anexos, "bot" de pendências, histórico de movimentos, splash screen) |
| CSS | 1 arquivo, ~1150 linhas |
| Integração com o RM | SOAP via 3 serviços: `WSCONSSQL` (consultas), `wsProcess` (faturamento/cancelamento/envio de NFS-e), `RMWsDataServer` (CRUD direto em ~7 tabelas do RM) |
| Recursos externos | CDN de ícones (Lordicon), 2 imagens estáticas no Imgur |
| E-mail | 1 template HTML próprio, disparado em 2 pontos do processo |

**Resumo para quem não é técnico:** não é um formulário simples — é um processo de ponta a ponta com dezenas de etapas automáticas conversando com o ERP, várias telas condicionais, e vários "sub-fluxos" que se ramificam e voltam.

---

## 3. ⚠️ Lacuna importante que o programador PRECISA saber antes de orçar

O repositório de Produção que você tem hoje **veio sem duas pastas inteiras**: `datasets/` (as 13 consultas ao RM) e `mechanisms/` (as regras de quem recebe cada tarefa). Elas existem no Fluig de Homologação, mas **não foram confirmadas em Produção**.

Na prática, isso significa:
- Ninguém consegue afirmar hoje, só olhando este repositório, **para quais grupos/pessoas as tarefas de produção realmente vão**, nem o texto exato das 13 consultas SQL.
- **Qualquer orçamento fechado sem antes reexportar essas duas pastas do Fluig de Produção corre o risco de estar chutando o cenário real.**

➡️ **Recomendação prática:** trate isso como uma fase própria do orçamento (ver bloco 1 da seção 6), não como um detalhe menor.

---

## 4. Passivo técnico já identificado (achados confirmados por leitura de código)

Isso é o que já sabemos que existe de errado/inacabado. Serve para o programador ter noção do "tamanho da faxina" e para você decidir o que entra ou não no escopo.

### 4.1 Bugs funcionais confirmados

| # | Problema | Onde | Risco |
|---|---|---|---|
| 1 | Em produção, `servicetask223` (ajuste de competência) **não verifica se o RM retornou erro** — um erro de gravação passa despercebido e o fluxo segue como se tivesse dado certo | `G12.servicetask223.js` | Dado incorreto pode seguir adiante sem ninguém perceber |
| 2 | Uma Service Task do sub-fluxo "Ajuste Financeiro" (`servicetask410`) **declara a lógica mas nunca a executa** — o histórico do movimento 2.2.01 não é atualizado nessa etapa | `G12.servicetask410.js` | Histórico incompleto num relatório usado pelo financeiro |
| 3 | Comparação de datas feita como **texto**, não como data de verdade — pode gerar aviso errado de "competência retroativa" dependendo dos números envolvidos | `G12-CheckBot.js` | Aviso visual incorreto para o usuário (não trava o processo) |
| 4 | Um mecanismo de atribuição tem uma string de centro de custo corrompida (nunca casa com nada) — o roteamento nominal cai sempre no fallback | `G12-APROVACAO-ST.js` (Homologação) | Uma pessoa específica nunca recebe a tarefa que deveria |

### 4.2 Riscos operacionais

- **URLs/hosts do ambiente Fluig gravados fixos no código** (não trocam sozinhos entre Homologação e Produção) — qualquer troca de servidor exige alteração manual.
- **Parâmetros de contexto do RM fixos** nos scripts de envio/validação de NFS-e (coligada, exercício fiscal, IP de máquina) — funcionam hoje, mas são um ponto frágil se a coligada/exercício mudar.
- **Nenhuma validação obrigatória real no servidor**, além de um campo (CNOPB): o "painel de pendências" que avisa campo vazio é só visual — o usuário pode ignorar e avançar mesmo assim.
- **Concentração num único usuário fixo** como responsável de fallback em pelo menos 2 pontos do processo — se essa pessoa sair da empresa ou ficar indisponível, tarefas não mapeadas ficam paradas com ela.
- **Cada troca de etapa relevante do processo dispara 2 consultas ao RM** mesmo quando ninguém vai usar aquela informação naquele momento — possível ponto de lentidão.

### 4.3 Código morto / inconsistências (mais "arrumação" que risco)

- 2 arquivos JavaScript carregados no formulário **sem nenhum código ativo** (vazios ou função comentada por completo).
- Um mecanismo (`G12-CONTRATOS-VALIDA.js`) parece ter sido **substituído** por outro, mas continua no repositório sem uso.
- 5 mecanismos de atribuição novos existem mas **não estão conectados a nenhuma etapa do processo ainda** — parecem preparados para uma evolução futura que não foi concluída.
- Duas rotinas diferentes constroem a mesma tabela de tributos na tela (aparentemente uma delas é sobra de uma versão anterior).
- Um dataset tem uma inconsistência entre o nome das colunas declaradas e a coluna que o código realmente lê — não dá pra confirmar sem acesso à consulta SQL cadastrada no RM.

> Detalhamento completo, com nome de arquivo e linha de raciocínio, está nos capítulos 13 e 14 de `Documentacao_ProjetoG12Producao.md`.

---

## 5. O que VOCÊ precisa decidir antes de pedir o orçamento

Um orçamento só é preciso se o escopo for claro. Responda (ou pelo menos pense sobre) estes pontos antes da conversa:

1. **Qual é o objetivo real do contrato?** Escolha um (ou combine):
   - [ ] Só corrigir os bugs/riscos já identificados na seção 4 (manutenção corretiva)
   - [ ] Fazer uma "faxina" geral de código morto e dívida técnica (seção 4.3)
   - [ ] Reexportar e auditar de verdade `datasets/` e `mechanisms/` de Produção (fechar a lacuna da seção 3)
   - [ ] Adicionar uma funcionalidade nova (especifique qual — este briefing não cobre isso, porque ainda não foi definido)
   - [ ] Contrato de suporte contínuo (o programador fica disponível por um período, sob demanda)
2. **Quais itens da seção 4 entram no escopo e quais ficam de fora?** (marque os que importam pra você)
3. **Que acesso você vai fornecer?**
   - Acesso ao Fluig de Homologação (pra testar antes de subir)
   - Acesso ao Fluig de Produção (só leitura, pra reexportar `datasets/`/`mechanisms/`)
   - Ambiente/usuário de teste no TOTVS RM (pra não mexer em dado real durante o desenvolvimento)
   - Eclipse/TDS configurado ou é o programador quem monta o ambiente dele?
4. **Prazo e criticidade**: existe uma data que o processo *não pode* parar (ex.: fechamento fiscal)? Isso muda a forma como o programador testa e faz o deploy.
5. **Modelo de cobrança preferido**: por hora, por escopo fechado, ou por período mensal (retainer)? Isso muda o formato da proposta que ele vai te mandar.
6. **Quer o orçamento em uma etapa só, ou em duas fases** — primeiro um "diagnóstico fechado" (reexportar e confirmar o estado real de produção, seção 3) e só depois o orçamento de execução? **Isso é recomendado dado o tamanho da lacuna encontrada.**

---

## 6. Sugestão de estrutura para comparar propostas

Peça para o programador (ou para os candidatos, se for cotar com mais de um) preencher uma tabela neste formato — assim você compara propostas de forma justa:

| Bloco | O que inclui | Pré-requisito | Horas estimadas | Valor |
|---|---|---|---|---|
| **1. Levantamento/recomposição do ambiente** | Reexportar `datasets/` e `mechanisms/` do Fluig de Produção; conferir se o `.ecm30.xml` está na versão mais recente do processo; validar se os achados deste briefing ainda procedem | Acesso ao Fluig de Produção (mínimo leitura) | | |
| **2. Correção dos bugs funcionais confirmados** (seção 4.1) | Os 4 itens listados, ou os que você escolher | Resultado do Bloco 1 (alguns dependem de confirmar o mecanismo real em produção) | | |
| **3. Redução de riscos operacionais** (seção 4.2) | Parametrizar URLs/hosts, revisar parâmetros fixos do RM, reforçar validação server-side | | | |
| **4. Limpeza de código morto** (seção 4.3) | Remover/consolidar arquivos e funções sem uso, decidir o destino dos 5 mecanismos não conectados | | | |
| **5. Funcionalidade nova** *(preencher se houver)* | — descreva aqui o que você quer de novo, se for o caso — | | | |
| **6. Suporte pós-entrega** *(se aplicável)* | Período de garantia/acompanhamento após subir as mudanças para produção | | | |

---

## 7. Perguntas para avaliar se o programador é adequado para este projeto

Esse não é um sistema genérico — é BPM Fluig com integração SOAP profunda no TOTVS RM. Vale perguntar diretamente:

1. Já trabalhou com Fluig Process Designer (BPMN2/Graphiti) e com mecanismos de atribuição customizados?
2. Já integrou Fluig com TOTVS RM via `wsProcess`/`RMWsDataServer`/`WSCONSSQL`?
3. Sabe ler/editar Service Tasks em JavaScript rodando no motor Rhino (dentro do Fluig)?
4. Como ele pretende lidar com o fato de `datasets/` e `mechanisms/` de Produção não estarem neste export — vai pedir acesso direto ao servidor de Produção, ou trabalhar só a partir de Homologação?
5. Qual é o processo dele para testar uma mudança num processo que já fatura notas fiscais reais, sem arriscar produção (ambiente de homologação espelhado, janela de deploy, plano de rollback)?

---

## 8. O que entregar para ele junto com este briefing

- `Documentacao_ProjetoG12Producao.md` (documentação técnica completa — a fonte de tudo que está resumido aqui)
- Acesso (ou promessa de acesso) ao repositório/projeto Eclipse-TDS
- Suas respostas à seção 5 deste documento
