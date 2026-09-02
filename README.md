# Documentação Técnica — Projeto G12 (Produção)

**Plataforma:** TOTVS Fluig (BPM/ECM) + TOTVS RM (backoffice)
**Processo BPMN:** `G12` — versão 6 (servidor `PRODUCAO`)
**Formulário:** `G12.html` (Form ID **1276366**, dataset de origem `DSG12`, pasta `forms/1276366 - G12/`)
**Autor identificado no código:** Enos Rocha — Programador Full Stack (Fluig)
**Base de análise:** este documento é derivado da documentação técnica do `ProjetoG12Homologacao` (levantamento 29/07/2026 + Adendos de 28/08 e 02/09/2026), **conferido contra o export do repositório `ProjetoG12Producao` de 28/08/2026**. O código de produção é, na maior parte, idêntico ao de homologação; as divergências reais estão consolidadas no capítulo **0. Diferenças entre Homologação e Produção** e sinalizadas ao longo do texto com a marca **[PRD]**.
**Método:** engenharia reversa por leitura de código-fonte (nenhum arquivo foi alterado).

> **Aviso de fidelidade:** este documento descreve exclusivamente o que foi observado no código-fonte. Onde o comportamento não pôde ser confirmado (arquivos binários, cache de webservice, ou configurações que só existem no ambiente Fluig e não no repositório), isso é declarado explicitamente na seção correspondente e no capítulo **16. Limitações da Análise**.
>
> **Aviso específico de Produção:** as pastas `datasets/` e `mechanisms/` **não vieram no export deste repositório** (estão vazias). Os capítulos **4 (Mecanismos)** e **6 (Datasets)** foram mantidos com o conteúdo levantado no repositório de **Homologação**, apenas como referência — **não foram verificados no ambiente de produção** e podem divergir (nomes de grupos, colleagueIds, texto das consultas SQL, parâmetros). Ver capítulos 0 e 16.

---

## 0. Diferenças entre Homologação e Produção

> Comparação feita entre `ProjetoG12Producao` (export de 28/08/2026) e `ProjetoG12Homologacao` (estado em 02/09/2026). Itens marcados **[PRD]** ao longo do documento remetem a esta tabela.

### 0.1 Identidade do ambiente

| | Homologação | **Produção** |
|---|---|---|
| Servidor Fluig | `HOMOLOGACAO` | `PRODUCAO` |
| Versão do processo BPMN (`.process`) | 390 | **6** |
| Form ID / pasta do formulário | `68555` / `forms/G12/` | **`1276366` / `forms/1276366 - G12/`** |
| `.metadata` do formulário | server `HOMOLOGACAO`, `DSG12`, `G12.html` | server `PRODUCAO`, `DSG12`, `G12.html` |
| Cache de WSDL (`workflow/.resources/`) | `HOMOLOGACAO.ws.cache(.bkp)` + `PRODUCAO.ws.cache(.bkp)` | apenas `PRODUCAO.ws.cache(.bkp)` |

> A "versão 6" do processo em produção **não** significa que produção esteja 384 versões atrás — o contador de versão do Fluig é por ambiente e foi reiniciado. O conjunto de atividades, Service Tasks e sub-fluxos (incluindo o "AJUSTE FINANCEIRO" do Adendo A.1) **está presente** em produção. O export do `G12.ecm30.xml` de produção é ligeiramente menor (ex.: 175 vs 179 `automaticLink`, 6 vs 25 `appField`/`appKey`) — provável reflexo de o BPMN de produção ter sido reexportado num momento um pouco anterior.

### 0.2 Integração com o RM — nome do serviço

Todas as Service Tasks que fazem CRUD direto no RM chamam, em **produção**, `ServiceManager.getService("RMWsDataServer")` — em homologação o nome é `"wsDataServer"`. Afeta: `servicetask87`, `108`, `118`, `130`, `180`, `223`, `233`, `325`, `334`, `343`, `355`, `404`, `410`, `418`. As Service Tasks de `wsProcess`/`WSCONSSQL` não mudam de nome.

### 0.3 `G12.servicetask223.js` (AJUSTAR COMPETÊNCIA) — sem checagem de erro do RM em produção

Além do nome do serviço (0.2), a versão de produção **não tem** o bloco que inspeciona a resposta do RM em busca de `"Exception"`/`"Error"` e lança erro. Em produção, um erro textual retornado pelo RM ao gravar `DTCOMPETENCIASERVICO` **não interrompe o fluxo** — só uma exceção Java lançada pelo próprio `executeWithParams` faria isso. Ver seção 13.

### 0.4 Notificação por e-mail (`G12.beforeStateEntry.js`, atividades 242/62 — Adendo A.4)

Em **produção** os destinatários ativos são os corporativos reais:
```
destinatarios.add("contratos@engpac.com.br");
destinatarios.add("contratos@gennesisengenharia.com.br");
// destinatarios.add("ens4562@gmail.com");   // e-mail de teste, comentado
```
Em homologação é o inverso (só o e-mail de teste ativo).

### 0.5 Host do portal Fluig no link do GED (`G12-GED.js`)

O link de visualização de documento do GED em produção aponta para outro tenant/porta:

| | URL base hardcoded |
|---|---|
| Homologação | `https://gennesisengenharia160517.fluig.cloudtotvs.com.br:1650/portal/p/1/ecmnavigation?...` |
| **Produção** | `https://gennesisengenharia160516.fluig.cloudtotvs.com.br:443/portal/p/1/ecmnavigation?...` |

Continua sendo URL hardcoded (mesmo risco de portabilidade da seção 13, agora com o valor de produção).

### 0.6 Bloqueio total do formulário em modo de visualização — **exclusivo de produção**

Os hooks `events/displayFields.js` e `events/enableFields.js` de produção têm um bloco extra, **ausente em homologação**, disparado quando `mode == "VIEW"`:

- **`enableFields.js`**: percorre `form.getFields()` e chama `form.setEnabled(campo, false)` para **todos** os campos.
- **`displayFields.js`**: injeta um `<script>` com a função `g12TravarView()` que, no `$(document).ready` (e de novo após 400 ms), adiciona a classe `.g12-view-lock` a `.fluig-style-guide`, desabilita todos os `button`/`a`/`input[type=button|submit]` (`disabled = true`, remove `href`, `tabindex = -1`) e marca todos os `input`/`select`/`textarea` não-hidden como `readonly` + `.campo-desabilitado`.
- **`G12-Style.css`** (produção): bloco `.g12-view-lock input/select/textarea/button/a...` que reforça visualmente o estado travado (cinza, `pointer-events`, cursor).

Objetivo: impedir qualquer edição/ação quando o processo é aberto apenas para consulta. Ver seções 8.17, 8.18 e 9.

### 0.7 `datasets/` e `mechanisms/` ausentes no export de produção

As duas pastas existem no repositório mas estão **vazias**. Os capítulos 4 e 6 descrevem os arquivos do repositório de **Homologação**, como referência — o conteúdo real de produção (grupos, colleagueIds, SQL nomeada) **não foi verificado**. Ver seção 16.

### 0.8 Diferenças cosméticas (sem efeito funcional)

- `forms/1276366 - G12/G12.html`: quebra de linha CRLF (homologação está em LF) e falta uma linha de comentário HTML acima do `<script src="/webdesk/vcXMLRPC.js">` (o `<script>` em si **está presente**).
- `G12-Main.js`, `G12-Toogle.js`, `G12-Style.css`: diferenças de acento em comentário, indentação e ordem de blocos — sem mudança de lógica. A splash screen do Adendo A2.4 **está** em produção.
- `forms/1276366 - G12/`: os 3 `.gif` estão na raiz da pasta (em homologação foram movidos para `Images/`).
- `workflow/literals/`: pasta vazia presente em produção (esqueleto TDS).

---

## Adendo — Atualizações Pós-Levantamento (28/08/2026)

> **Nota de produção:** este adendo e o Adendo 2 abaixo foram levantados no repositório de **Homologação**. Todo o código que eles descrevem (sub-fluxo "AJUSTE FINANCEIRO" e suas Service Tasks 267/308/325/334/343/355/363/369/375/394/404/410/418, evento `afterTaskComplete.js`, painéis `#aguardandoRecebimento`/`#ajusteFinanceiro`/Histórico dos Movimentos, `G12-ControleDeEtiquetas.js`, `buscarInfoGed`, splash screen) **está presente também no repositório de Produção** — foi conferido arquivo a arquivo. As divergências de produção (nome do serviço RM, host do GED, e-mail, `servicetask223`) estão no capítulo 0.
>
> **Ao ler os adendos com foco em Produção:** onde se lê `forms/G12/...`, o caminho neste repositório é `forms/1276366 - G12/...`; onde se cita o host `gennesisengenharia160517…:1650` (GED / link do processo), em produção é `gennesisengenharia160516…:443` (cap. 0.5); os destinatários de e-mail são os corporativos reais (cap. 0.4).
>
> Este adendo documenta tudo que foi identificado no código-fonte **após** o levantamento original de 29/07/2026 (capítulos 1 a 18, abaixo). Segue o mesmo método: apenas o que foi observado diretamente no repositório. Onde a extensão exata de um sub-fluxo novo não pôde ser confirmada por leitura integral do `.process`/`.ecm30.xml` (por ser uma área extensa e recém-adicionada), isso é dito explicitamente. As tabelas e listas dos capítulos originais que ficaram desatualizadas por essas mudanças (estrutura de arquivos, catálogo de atividades, tabela de Service Tasks, painéis do formulário) foram atualizadas diretamente nos respectivos capítulos.

### A.1 Novo sub-fluxo "AJUSTE FINANCEIRO" (reprocessamento fiscal completo)

O gateway `exclusivegateway246` (seção 3.5) já direcionava, em caso de `infoSetorAjuste == "financeiro"`, para a atividade **250 — AJUSTE DE SOLICITAÇÃO [FINANCEIRO]**. O levantamento original registrava essa atividade como um fim de linha simples (`→ Fim`). Isso não é mais o caso: a partir dela existe hoje um **sub-fluxo completo de reprocessamento fiscal**, que repete — com o mesmo padrão de integração RM já documentado na seção 5 — praticamente toda a cadeia de faturamento/tributação original, agora como uma etapa de correção:

| Seq. (estado) | Nome da atividade | Script |
|---|---|---|
| 353 | CHEGADA EM FATURAR MOVIMENTO 2.1.02 E GERAR 2.2.01 DE AJUSTE FINANCEIRO | — (link de chegada) |
| 394 | FATURAR MOVIMENTO 2.1.01 DE AJUSTE FINANCEIRO | `G12.servicetask394.js` |
| 308 | FATURAR MOVIMENTO 2.1.02 E GERAR O MOVIMENTO 2.2.01 DE AJUSTE FINANCEIRO | `G12.servicetask308.js` |
| 321 | CHEGADA AJUSTAR TRIBUTOS DO MOVIMENTO DE AJUSTE FINANCEIRO | — (link de chegada) |
| 355 | AJUSTE TRIBUTOS DO MOVIMENTO [AJUSTE FINANCEIRO] | `G12.servicetask355.js` |
| 317 | TRATAMENTO DE ERRO [AJUSTAR DE TRIBUTOS DO AJUSTE FINANCEIRO] | — (task de erro) |
| 325 | CADASTRAR/AJUSTAR TRIBUTO MUNICIPAL [AJUSTE FINANCEIRO] | `G12.servicetask325.js` |
| 334 | AJUSTAR IRRF/INSS [AJUSTE FINANCEIRO] | `G12.servicetask334.js` |
| 343 | AJUSTAR COMPETÊNCIA [AJUSTE FINANCEIRO] | `G12.servicetask343.js` |
| 363 | BUSCAR STATUS DA NOTA [AJUSTE FINANCEIRO] | `G12.servicetask363.js` |
| 369 | CANCELAR NOTA FISCAL | `G12.servicetask369.js` |
| 375 | CANCELAR MOVIMENTO 2.1.02 | `G12.servicetask375.js` |
| 267 | CANCELAR MOVIMENTO 2.2.01 | `G12.servicetask267.js` |
| 418 | AJUSTAR VALOR DO RPS | `G12.servicetask418.js` |
| 421 | Intermediário (erro, anexado a 418) | — |
| 420 | TRATAMENTO DE ERRO [AJUSTE DE VALOR RPS] | — (task de erro) |
| 404 | AJUSTAR INFORMAÇÕES DE HISTÓRICO (2.1.02) | `G12.servicetask404.js` |
| 410 | AJUSTAR INFORMAÇÕES DE HISTÓRICO 2.2.01 | `G12.servicetask410.js` ⚠️ ver observação abaixo |

> **Limitação declarada:** ao contrário do capítulo 3.3 (pool principal, catalogado estado a estado por leitura integral do `.process`), este sub-fluxo foi mapeado por busca dirigida (nome de cada estado localizado individualmente a partir do `eventId` de cada `servicetaskNN` novo, pela convenção `servicetaskNN` ↔ `sequence NN` já confirmada em `servicetask418`/estado 418). A ordem exata de todos os links/gateways entre esses estados (e a existência de mais nós de "chegada"/tratamento de erro não amostrados) **não foi confirmada por leitura linear completa** do trecho correspondente do `.ecm30.xml`/`.process` — apenas os 18 estados acima, obtidos por nome.

**Propósito observado (pelo conteúdo dos scripts):** a atividade 250 permite ao setor financeiro **refazer o faturamento inteiro do movimento** (2.1.01 → 2.1.02 → 2.2.01), reajustar tributos nacionais/municipais/IRRF/INSS/competência, cancelar a NFS-e e os movimentos 2.1.02/2.2.01 anteriores, alterar o **valor unitário do RPS** e reemitir — cobrindo o caso de a nota original ter sido transmitida com valor ou tributação incorretos.

- **`G12.servicetask394.js`** — idêntico em estrutura ao `servicetask71` original (busca `G12-EXERCICIO-FISCAL`, chama `MovFaturamentoProc` 2.1.01→2.1.02), mas acrescenta o novo IDMOV 2.1.02 gerado ao **final** da lista em `historico2102` (`hAPI.getCardValue("historico2102") + "," + novoIdmov2102`), preservando o histórico dos movimentos anteriores — é essa lista acumulada que alimenta o painel "Histórico dos Movimentos" (ver A.5).
- **`G12.servicetask308.js`** — equivalente ao `servicetask78` original (2.1.02→2.2.01), também acumulando o novo IDMOV em `historico2201`; ao final, limpa `infoSetorAjusteRecebimento`/`infoSetorAjuste` (`hAPI.setCardValue(..., "")`) para resetar a seleção de setor da checagem de transmissão.
- **`G12.servicetask355.js`** — lê os tributos atuais do movimento no RM (`readRecord("MovMovimentoTBCData")`), mescla com o que o usuário editou nos campos dinâmicos `impostos_selecao_subs`/`valorImpostoSub`/`aliquotaSub`/`baseCalculoSub` (tabela filha do painel "Ajuste Financeiro", até 50 linhas) e regrava (`saveRecord`); **se nenhum tributo foi editado no formulário, a função retorna cedo e não recarrega `tributosNacionais`** — comportamento correto para este estado específico (é opcional editar tributo aqui), mas era a causa de um bug relatado quando o usuário esperava ver o valor recalculado após a **atividade 418** (que fica *depois* deste estado no fluxo) — ver A.6.
- **`G12.servicetask325.js`** / **`G12.servicetask334.js`** / **`G12.servicetask343.js`** — mesmo padrão de `servicetask108`/`servicetask118`/`servicetask223` originais, mas lendo os campos `_sub`/`Sub` do painel de Ajuste Financeiro (`impostos_selecao_municipal_sub___N`, `irrfCodSub___N`/`inssCodSub___N`, `dataDeCompetenciaSub`). Em `servicetask334`, há um comentário explícito no código alertando que os campos `irrfCodigoAjusteSub___i`/`inssCodigoAjusteSub___i` guardam a **descrição** do zoom, não o código — por isso a função usa os campos ocultos espelhados `irrfCodSub___i`/`inssCodSub___i` (preenchidos por `setSelectedZoomItem`, `G12-Zoom.js`) e, adicionalmente, **usa apenas a última linha preenchida** de cada lista (IRRF/INSS), descartando entradas anteriores.
- **`G12.servicetask363.js`** — mesmo padrão de `servicetask200` original (consulta `G12-HISTORICO-NFSE` com retry, até 5 tentativas / 2s), mas grava o resultado em `statusAutorizacao`/`errorAoAutorizarNotas`, e grava `"VAZIO"` em `statusAutorizacao` caso nenhum registro seja encontrado (usado como sinalizador por `servicetask369` logo em seguida).
- **`G12.servicetask369.js`** — só executa o cancelamento se `statusAutorizacao != "VAZIO"` (setado pelo estado anterior). Dispara duas ações RM em sequência: `FisNFSeCancelarNotasAction` (payload SOAP `FisNFSeCancelarParamsProc`, com `CodigoMotivoCancelamento=1`/`MotivoCancelamento="DADOS INCORRETOS"` fixos) seguida de nova consulta `FisNFSeRetornarNotasAction` — ambas com os mesmos **parâmetros de contexto hardcoded** já registrados na seção 13 para `servicetask148`/`servicetask157` (`$CODCOLIGADA=3`, `$EXERCICIOFISCAL=7` fixo neste segundo payload, host `DESKTOP-HBHNI5F`, IP `10.0.2.3`).
- **`G12.servicetask375.js`** / **`G12.servicetask267.js`** — cancelam, respectivamente, o último movimento 2.1.02 e o último 2.2.01 (`historico2102`/`historico2201`, `.split(",").pop()`) via `MovCancelMovProc`, mesmo padrão do `servicetask30` original mas com autenticação obtida via `dsTBCConnector` (`getAccess()`) em vez de `ds_Constantes`. **Ambos têm a checagem de erro na resposta do RM comentada** (bloco `if (response.indexOf("Exception")...) throw` desativado em código) — ou seja, hoje essas duas Service Tasks **não detectam falha de cancelamento retornada pelo RM como texto na resposta**; qualquer erro só interromperia o fluxo se lançado como exceção Java pelo próprio `executeWithParams`.
- **`G12.servicetask418.js`** — grava o novo `PRECOUNITARIO` do item do movimento 2.1.02 (lido do campo `valorAlterado`, preenchido pelo usuário no painel "Ajuste do setor técnico após nota emitida" — ver A.4) via `saveRecord("MOVMOVIMENTOTBCDATA", ...)`; **atualizado em 28/08/2026** para, na sequência, reconsultar `G12-CARREGAR-TRIBUTOS` e regravar `tributosNacionais` no card — ver A.6.
- **`G12.servicetask404.js`** — grava `HISTORICOLONGO` no movimento 2.1.02 (mesmo padrão do `servicetask233` original, porém usando `historico2102` como chave em vez de `idmov2`).
- **`G12.servicetask410.js`** ⚠️ **inconsistência de código observada**: o corpo da função `servicetask410` apenas **declara** uma função aninhada `servicetask404` (idêntica à `G12.servicetask404.js` só que gravando `HISTORICOLONGO` no movimento **2.2.01**, via `historico2201`) — mas **nunca a chama**. Como está escrito hoje, ao entrar no estado 410 o script não executa nenhuma ação (a função interna fica definida e sem uso); o histórico do movimento 2.2.01 não é atualizado por este passo. Não foi possível confirmar se isso é uma cópia incompleta de `servicetask404.js` (renomear a função interna e faltou adicionar a chamada) ou comportamento intencional.

### A.2 Checagem de transmissão espelhada em "Aguardando Recebimento" (atividade 62)

O painel `checagemDeTransmissao` (atividade 242, já documentado na seção 7.3) ganhou um **gêmeo completo** dentro da atividade **62 — AGUARDANDO RECEBIMENTO**, que antes (levantamento original) era uma tarefa simples sem lógica própria de formulário. Hoje a atividade 62 tem seu próprio painel `#aguardandoRecebimento`, com os mesmos campos da checagem original sob sufixo `Recebimento`:

| Painel 242 | Painel 62 (novo) |
|---|---|
| `infoNfseCorretas`/`infoNfseErradas` | `infoNfseCorretasRecebimento`/`infoNfseErradasRecebimento` |
| `financeiroReponsavel`/`tecnicoReponsavel` | `financeiroReponsavelRecebimento`/`tecnicoReponsavelRecebimento` |
| `motivoReemissao` (select) | `motivoReemissaoRecebimento` |
| `ajusteTransmissao` (textarea) | `ajusteTransmissaoRecebimento` |
| `infoTransmOK` (hidden, sim/não) | `infoTransmOKRecebimento` |
| `infoSetorAjuste` (hidden, financeiro/tecnico) | `infoSetorAjusteRecebimento` |

`G12-ChecagemTransmissao.js` foi generalizado para atender ambos os painéis por meio de um parâmetro `sufixo` (`""` para 242, `"Recebimento"` para 62) em `selecionarBotaoTransmissao`, `selecionarBotaoTransmissaoSetor`, `restaurarSelecaoTransmissao`/`restaurarBotoesTransmissao` (reaplica o estado visual "selecionado" ao reabrir o formulário — a classe CSS só era aplicada no clique e se perdia a cada reload) e `chagenSelect` (libera o textarea de descrição apenas quando o motivo selecionado é `"outros"`).

`G12-Toogle.js` ganhou a função **`desabilitarCampos()`**, chamada em `$(document).ready` (`G12-Main.js`), que bloqueia (`readOnly`, `pointer-events: none`, cor cinza) todos os campos de `#checagemDeTransmissao` quando a atividade não é 242, e todos os campos de `#aguardandoRecebimento` quando a atividade não é 62 — impedindo que o usuário edite a checagem de uma etapa em que ela não está ativa. Um botão já marcado como "selecionado" **mantém a cor de seleção** mesmo bloqueado (só perde a possibilidade de clique), em vez de ficar cinza como os demais.

`G12.afterTaskComplete.js` (evento global novo — ver A.3) grava, ao concluir a tarefa em qualquer um dos dois painéis, um **comentário automático da tarefa** (`hAPI.setTaskComments`) no formato `"MOTIVO DO AJUSTE: <motivo> | DESCRIÇÃO DETALHADA: <texto>"` (ou só o motivo, se a descrição estiver vazia).

### A.3 Novo evento global — `G12.afterTaskComplete.js`

Terceiro evento global do processo (além de `beforeStateEntry`/`atualizaçãoCNOPB`, seção 3.7): `function afterTaskComplete(colleagueId, nextSequenceId, userList)`, disparado pelo Fluig **ao concluir** uma tarefa. Hoje só age nas atividades 242 e 62 (grava o comentário automático descrito em A.2); os parâmetros `colleagueId`/`nextSequenceId`/`userList` são recebidos mas não utilizados no código atual.

> Uma versão anterior desta função também disparava um e-mail de notificação (mesmo template/estrutura HTML hoje presente em `beforeStateEntry.js`, ver A.4) ao concluir a atividade 62. Essa lógica foi **removida** de `afterTaskComplete.js` e o disparo de e-mail foi **reimplementado em `beforeStateEntry.js`**, passando a notificar na **entrada** das atividades 242/62 em vez de na conclusão de uma tarefa anterior a elas.

### A.4 Notificação por e-mail ao entrar em Checagem de Transmissão / Aguardando Recebimento

`G12.beforeStateEntry.js` (já documentado na seção 3.7 pela busca de período/GED) ganhou um segundo bloco, disparado quando `sequenceId == 242 || sequenceId == 62`: monta um e-mail HTML (tabelas inline, sem CSS externo) com os dados de Coligada/Filial/Centro de Custo/Projeto e Dados do Contrato (Cliente, Número do Contrato, Valor Bruto Original, datas de contrato/início/término) e chama `notifier.notify("admin", "G12.TemplateEmail", params, destinatarios, "text/html")`.

- **Template**: novo arquivo `forms/G12/G12.TemplateEmail.html` (cabeçalho com gradiente azul e borda vermelha, corpo injetado via placeholder `${corpoEmail}`, rodapé — não lido linha a linha na íntegra).
- **Destinatário**: hoje **hardcoded** — `destinatarios.add("ens4562@gmail.com")` — com duas linhas alternativas de e-mail corporativo comentadas (`contratos@engpac.com.br`, `contratos@gennesisengenharia.com.br`). Não existe, no formulário, nenhum campo de e-mail de responsável; o comentário no próprio código (`"E-mail fixo temporário até definição do endereço por setor..."`) confirma que é um valor provisório.
- **Link do processo**: reaproveita o mesmo padrão de URL hardcoded já registrado na seção 13 para `G12-GED.js` (host `gennesisengenharia160517.fluig.cloudtotvs.com.br:1650`).

### A.5 Novo painel "Histórico dos Movimentos" — `G12-HistoricoMovimentos.js`

Arquivo novo (`forms/G12/G12-HistoricoMovimentos.js`), carregado no `<head>` do formulário. Deriva, **sem nenhuma integração própria**, uma tabela de status a partir de campos já existentes no card:

- `montarLinhasHistoricoMovimentos()`: lê `IDMOV_numero` (2.1.01, valor único), `historico2102`/`historico2201` (listas separadas por vírgula, acumuladas pelos Service Tasks de faturamento — ver A.1) e `qtdeCancelamentos`, e monta uma lista de linhas `{tipo, numero, status}` (`"faturado"` / `"a-faturar"` / `"cancelado"`). Regra: dentro de cada lista (2.1.02 e 2.2.01), **todos os itens exceto o último são sempre "cancelado"** (foram substituídos por reemissão); o status do último item depende da comparação entre `qtdeCancelamentos` e o tamanho das listas.
- `countTipoAtividade()`: na atividade 375 ("CANCELAR MOVIMENTO 2.1.02", ver A.1), incrementa `qtdeCancelamentos` — é esse contador que a função acima usa para saber quantas reemissões já ocorreram.
- `renderizarHistoricoMovimentos()`: renderiza a tabela (`#tblHistoricoMovimentosBody`) com uma badge colorida por status (CSS `.historico-status-*`, seção 9). Chamada em `$(document).ready` e a cada `change` de qualquer campo do formulário (delegação em `G12-Main.js`).
- `atualizaMovimnentoManualmente(campo)`: acionada pelo `onblur` do campo readonly `numeroIdmov2201` (preenchido automaticamente por `servicetask78` original). Além de gravar o valor em `historicoNumMov2201` (campo hidden que **não é lido em nenhum outro ponto do código** — provável campo remanescente/não utilizado), também acrescenta o número à lista de `historico2201` (evitando duplicata) antes de re-renderizar — sem isso a tabela só refletia o valor após um reload completo da página, quando o card já vinha atualizado do servidor.

### A.6 Ajuste manual do valor do RPS + alerta de variação ≥ 1%

Novo painel `#ajusteSetorTecnicoPosNotaEmitida` ("ajuste do setor técnico após nota emitida"), visível conforme `displayFields.js` (ver A.9). Contém:

- `valorAlterado` (`input type="text"`, **não** `type="number"` — um `<input type="number">` nativo não aceita vírgula decimal, formato usado em todo o restante do formulário; usar `type="number"` aqui quebrava a gravação do valor, sintoma observado e corrigido). `onblur` chama `ajustarValorDoSetorTecnico(this)` (`G12-CalcularAjusteTributos.js`): sanitiza a entrada por regex (remove qualquer caractere que não seja dígito/ponto/vírgula), converte e formata para 4 casas decimais no padrão BR; se o resultado não for um número válido, limpa o campo em vez de gravar `NaN`.
- `avisoVariacaoValorDiv` (div vazia) + `valorAcimaDe1` (hidden): nova função `verificarVariacaoValorAlterado(valorAlteradoNumerico)`, chamada ao final de `ajustarValorDoSetorTecnico`, compara o valor digitado com `valorBrutoOriginal` e calcula a variação percentual absoluta. Se **≥ 1%**, injeta um aviso visual (`.aviso-variacao-valor`, seção 9) com o texto *"Variação no valor da nota igual ou maior que 1%, notificar ao diretor técnico"* e grava `"SIM"` no hidden `valorAcimaDe1`; abaixo de 1%, limpa ambos. Como esse aviso é gerado só em memória (DOM), uma segunda função — `restaurarAvisoVariacaoValor()`, chamada em `$(document).ready` — relê `valorAlterado` e recalcula a variação a cada carregamento da página, para o aviso não desaparecer ao sair e voltar ao formulário.
- Textarea `ajusteSetorTecnicoPosNota` ("Informações Ajustadas") — campo livre para descrição do ajuste, referenciado em `enableFields.js` (`form.setEnabled("ajusteSetorTecnicoPosNota", false)` fora da atividade correspondente).

O valor de `valorAlterado` é o que `G12.servicetask418.js` (A.1) grava como novo `PRECOUNITARIO` no RM. Até 28/08/2026, **nada no fluxo relia os tributos recalculados pelo RM de volta para o card** depois dessa alteração de valor — `servicetask404`, que roda em seguida, só atualiza o histórico (A.1) — fazendo `#tributosNacionais` exibir um valor de base desatualizado (o calculado antes do ajuste de valor) mesmo depois do RM já ter recalculado tudo internamente. Corrigido adicionando, ao final de `servicetask418.js`, a mesma releitura de `G12-CARREGAR-TRIBUTOS` que `servicetask71`/`servicetask355` já faziam.

### A.7 Marcação visual de notas fiscais canceladas — `G12-ControleDeEtiquetas.js`

Arquivo novo. `checarNotaCancelada()` (chamada em `$(document).ready`) conta quantos números de movimento 2.2.01 existem em `historico2201` (mesmo campo usado pelo painel de Histórico, A.5); se houver mais de um (ou seja, já ocorreu reemissão), pinta de rosa (`#f7b9bf`) o painel da primeira nota (`#enviarNota .panel-body`) e as linhas anteriores à mais recente na tabela filha de notas substituídas (`input[name^='notaFiscalSub___']`, dentro de `#ajusteFinanceiro`), e insere um selo **"Cancelado"** (reaproveitando a classe `.historico-status-cancelado` já usada no painel de Histórico dos Movimentos, A.5) posicionado no canto superior direito de cada bloco (`.selo-nota-cancelada`, `position: absolute`), sem duplicar o selo em execuções repetidas.

- **`preencherMovimentoEmNotasCanceladas()`**: também em `$(document).ready`, distribui os números de `historico2201` (posições 1 em diante — a posição 0 é a nota "pai", tratada à parte) para os campos `numeroIdmov2201Sub___N` da tabela filha, na ordem em que aparecem.

### A.8 Padronização de cores de campo desabilitado

As diversas rotinas que bloqueiam campos por atividade (`desabilitarParaAjuste`, `desabilitarCampos` em `G12-Toogle.js`; blocos `atividade != 23`/`!= 61`/`!= 250` em `events/displayFields.js`; classes `.campo-desabilitado`/`.textarea-desabilitado` em `G12-Style.css`) usavam cores inconsistentes entre si (`#dddddd`, `#e9ecef`, `#6c757d` misturados sem critério, inclusive aplicando cor de botão a campos de texto e vice-versa). Padronizado: **inputs/selects/textareas desabilitados** → fundo `#f2f2f2`, texto `#a7a9ac`; **botões desabilitados** → fundo `#6c757d`, texto branco. Isso exigiu também:
- Adicionar `!important` ao `pointer-events` das classes `.campo-desabilitado`/`.campo-habilitado`/`.textarea-desabilitado`/`.textarea-habilitado` (sem isso, o bloqueio programático por `element.style.setProperty(..., "important")` de `desabilitarCampos()` conseguia ser revertido por essas classes quando aplicadas depois, e vice-versa).
- Em `events/displayFields.js`, dois seletores estavam incorretos e por isso nunca bloqueavam nada: `$('button[onclick='exibirEdicaoManual()']')` (aspas simples aninhadas incorretamente — quebrava a sintaxe do `<script>` inteiro injetado, derrubando **todos** os blocos daquele mesmo `<script>`, não só aquele) e `$(".portaisNfseWrap button")` (os links de portal de NFS-e são `<a>`, não `<button>`); e `$('#ajusteFinanceiro').querySelectorAll('input')` (método nativo do DOM chamado sobre um objeto jQuery, que não o possui) — todos corrigidos.

### A.9 Outras adições observadas

- **Painel `#ajusteFinanceiro`** ("Ajuste Financeiro"): novo painel do formulário, visível conforme a atividade/`recebimentoFluxo` (campo hidden `controleDeFluxo`, setado como `"1"`/`"2"`/`"3"` em `displayFields.js` conforme a atividade 242/250/62), contendo a tabela filha de ajuste de tributos e a tabela filha de notas substituídas/canceladas usada por A.7.
- **`displayFields.js`**: passou a cobrir também as atividades 250 e 62 com lógica condicional por `controleDeFluxo` (mostrar `#ajusteFinanceiro`/`#aguardandoRecebimento` conforme o valor), além dos blocos de bloqueio por atividade descritos em A.8 (`!= 23`, `!= 61`, `!= 250`).
- **`G12-AnexosEmail.js`**: arquivo novo, carregado no `<head>` do formulário — contém apenas `function AnexosEmail() {}` **vazia**, sem chamada em nenhum outro arquivo lido. Mesmo padrão de código morto já registrado na seção 13 para `G12-Loading.js`.
- **Campos hidden novos relevantes**: `historico2102`, `historico2201` (listas acumuladas de IDMOV, ver A.1/A.5), `historicoNumMov2201`/`historicoNumMov2102` (não lidos em nenhum outro ponto do código — possível remanescente), `infoTransmOKRecebimento`, `infoSetorAjusteRecebimento`, `qtdeCancelamentos`, `controleDeFluxo`, `valorAcimaDe1`, `valorBrutoOriginal` (já existente, agora também consumido pelo alerta de variação de A.6).

---

## Adendo 2 — Atualizações de 02/09/2026 (import do servidor de HOMOLOGAÇÃO)

> Este segundo adendo cobre o que veio no código importado do servidor de homologação em **02/09/2026**, **posterior** ao Adendo de 28/08/2026 acima. Mesmo método: apenas o que está no código-fonte do repositório. Onde a mudança tornou desatualizado um capítulo original, a correção foi feita diretamente nos capítulos **4** (mecanismos), **13** (código morto/inconsistências) e **14** (riscos).

### A2.1 `G12-APROVACAO-ST.js` — roteamento nominal por centro de custo REATIVADO (29/08/2026)

O levantamento de 29/07 e o Adendo de 28/08 registravam o mecanismo `mechanisms/G12-APROVACAO-ST.js` (atividade **17 — APROVAÇÃO SETOR TÉCNICO**) como tendo **todo** o roteamento nominal por centro de custo **comentado**, retornando sempre o usuário fixo `4ef20412-7687-40a4-b1c8-095c0a92503e` ("Fluig"). Isso **mudou**: o cabeçalho do arquivo agora traz `@data 29/08/2026` e o bloco foi **reativado**.

`getUser(CentroDeCusto, CodColigada)` hoje percorre `CodColigada` em três ramos (`2`, `1`, `3`) e, dentro de cada um, dezenas de condições `CentroDeCusto == "..."` que apontam para colleagueIds de colaboradores nomeados nos comentários (higor `44001bcd-…`, odijerfeson `bbe0cc93-…`, Vanylk Souza `fdbc23c0-…`, thiago.leite, lucas.vinicius `d60eeee8-…`, diego `70f0fe39-…`, ciro.farias `0288d7f0-…`, "Sérgio Franco" `2abf965d-…`, Rodrigo Medeiros, marcelo.maia, isaac.medeiros, kaio.dorneles, José Emanuel, Tercio Porto, matheus.brito, "João Azevedo" `4b63d52d-…` para os lotes SEFAZ PB da coligada 3, entre outros). Cada um dos três ramos de coligada tem um `else` final → usuário fixo `4ef20412-…`.

- **Não há `else` de nível superior:** se `CodColigada` não for `1`, `2` nem `3`, `getUser` devolve lista vazia e `resolve()` lança `Error("Nenhum usuario encontrado para CentroDeCusto: … e CodColigada: …")` — a atividade 17 não é atribuída.
- **Inconsistência observada:** um dos ramos de `CodColigada == 2` compara `CentroDeCusto == '02.06.01.0sergio4.003'` — string corrompida (a palavra "sergio" foi colada dentro do código do centro de custo). Esse ramo nunca casa. Registrado na seção 13.
- **`mechanisms/G12-CONTRATOS-VALIDA.js` NÃO acompanhou** essa mudança: continua com o bloco comentado, usuário fixo, e continua não referenciado por nenhuma atividade do BPMN (ver seção 13). O mecanismo de fato ligado à atividade 173/183 continua sendo `G12-VALIDIACAO-CONTRATOS.js` (seção 4.3), que roteia por grupo.

Reflexo na doc: seções **4.1**, **13** (linha de roteamento) e **14** (risco nº 1) foram reescritas.

### A2.2 Cinco novos mecanismos de atribuição (ainda não referenciados no processo exportado)

Cinco arquivos novos em `mechanisms/`, todos com `function resolve(process, colleague)` + `function getGroup(...)`, autoria "Enos Rocha":

| Arquivo | `@data` no cabeçalho | Campos lidos do card | Grupos de saída |
|---|---|---|---|
| `G12-CHECAGEM-DE-TRANSMISSAO.js` | 06/07/2026 | `centro_de_custo`, `coligada`, `filial` | Col. 2 + 12 centros de custo da PB → `Pool:Group:G12-CHECAGEMTRANSMISSAO-CONTRATOS-PB`, senão `-GERAL`; Col. 1 (Filial 1/5) e Col. 3 (Filial 2) → `-DFGO`, senão `-GERAL` |
| `G12-AGUARDANDORECEB.js` | 06/07/2026 | `centro_de_custo`, `coligada`, `filial` | mesma lógica, grupos `Pool:Group:G12-AGUARDANDO-RECEBIMENTO-CONTRATOS-{PB,GERAL,DFGO}` |
| `G12-FATURAR-NOTAS.js` | 29/08/2026 | `CCcustoMEC`, `EmpresaMEC` | só por coligada: `2` → `Pool:Group:G12-ENGPAC-FATURAR-NOTAS`; `1` → `G12-GENNESIS-FATURAR-NOTAS`; `3` → `G12-ECONTECX-FATURAR-NOTAS`; outro → `Pool:Group:Suporte` |
| `G12-NFSE-TRANSMITIDA.js` | 29/08/2026 | `CCcustoMEC`, `EmpresaMEC` | idem, grupos `G12-{ENGPAC,GENNESIS,ECONTECX}-NFSE-TRANSMITIDA`; fallback `Pool:Group:Suporte` |
| `G12-AJUSTE-FINANCEIRO.js` | 29/08/2026 | `CCcustoMEC`, `EmpresaMEC` | idem, grupos `G12-{ENGPAC,GENNESIS,ECONTECX}-AJUSTE-FINANCEIRO`; fallback `Pool:Group:Suporte` |

> **Não referenciados no processo exportado.** Nem `workflow/diagrams/G12.process` nem `workflow/.resources/G12.ecm30.xml` citam esses 5 nomes como `engineAllocationId`/mecanismo de nenhuma atividade — os únicos mecanismos ligados a atividades no export são `G12-APROVACAO-ST` (ativ. 17) e `G12-VALIDIACAO-CONTRATOS` (ativ. 173/183). As atividades 23 (Faturar Notas), 61 (NFS-e Transmitida), 62 (Aguardando Recebimento), 242 (Checagem de Transmissão) e 250 (Ajuste Financeiro) continuam, no export atual, com o mecanismo **`Usuário`** (colleagueId fixo `4ef20412-…`). Os arquivos aparentam estar preparados para uma versão futura do processo, ou já vinculados no servidor Fluig e ainda não reexportados. É a mesma situação de `G12-CONTRATOS-VALIDA.js` (seção 13).
>
> - Os grupos `Pool:Group:G12-*` e `Pool:Group:Suporte` citados **não existem neste repositório** (ver seção 16 — grupos/usuários Fluig).
> - Os campos `CCcustoMEC`/`EmpresaMEC` (lidos pelos 3 mecanismos de 29/08) **não aparecem** no `G12.html` nem são gravados por nenhum script deste repositório — provavelmente campos auxiliares que o próprio motor de mecanismos do Fluig preenche em runtime.

### A2.3 `buscarInfoGed()` — busca do período de medição e do GED no client-side (`G12-GED.js`)

`forms/G12/G12-GED.js` ganhou, no topo, a função `buscarInfoGed()`, chamada em `$(document).ready` **antes** de `GED()`. Ela faz **no navegador (client-side)** o que `G12.beforeStateEntry.js` já fazia no servidor (seção 3.7):

1. `DatasetFactory.getDataset("G12-PERIODOS-MEDICAO", null, [IDMOV, CODCOLIGADA])` → grava o `PERIODOMED` da última linha retornada em `#periodoMedicao`.
2. `DatasetFactory.getDataset("G12-GED", null, [CODCOLIGADA, IDPRJ, IDCONTRATO, PERIODO, REVISAO])` → concatena `NOMEPASTA + "|" + CODDOCUMENTO + "|" + DESCRICAO` de cada linha, separado por `;`, e grava em `#gedInfo`.

Cada um dos dois blocos está em `try/catch` com `throw error` no `catch` (aborta o carregamento se a consulta falhar). Lê os campos `#CodColigada`, `#idprj`, `#IdMov`, `#idContrato`, `#revisaoProjeto` do formulário.

- **Pré-requisito habilitado no HTML:** `G12.html` passou a carregar `<script type="text/javascript" src="/webdesk/vcXMLRPC.js">` no `<head>` — comentário no código: *"Habilita DatasetFactory no client-side (necessario para consultar datasets a partir do JS do formulario, como o G4 faz)"*. Sem esse script, `DatasetFactory` não funciona dentro do iframe do formulário.
- **Consequência:** `#periodoMedicao`/`#gedInfo` passam a ter **dois** caminhos de preenchimento — server-side (`beforeStateEntry.js`, a cada transição de estado) e client-side (`buscarInfoGed`, a cada carregamento do formulário). Não há trava contra os dois: o client-side sobrescreve o valor vindo do servidor a cada abertura. `GED()` (seção 8.10), que consome esses dois campos para renderizar os cartões de documento, não mudou.

### A2.4 Splash screen de carregamento "G12" (`#carregamentoG12`)

Tela de carregamento em tela cheia exibida enquanto o formulário monta:

- **`G12.html`**: novo `<div id="carregamentoG12"><span>G12</span></div>` logo antes de `</body>`.
- **`G12-Main.js`**: `exibirCarregamento()` é a **primeira** chamada do `$(document).ready` (comentário: *"CARREGAMENTO COM O SIMBOLO DO G12 PARA MELHOR EXPERIENCIA DO USUÁRIO"*).
- **`G12-Toogle.js`**: nova função `exibirCarregamento()` — exibe `#carregamentoG12` e o esconde no evento `window.load` (imagens/GIFs/CSS já prontos), respeitando **tempo mínimo em tela de 900 ms** (`TEMPO_MIN`) e **trava de segurança de 8 s** (`TRAVA_MAX`, um `setTimeout` final que esconde de qualquer jeito). A saída adiciona a classe `.carregamentoG12` (animação `g12LoaderOut`) e, 500 ms depois, `$el.hide()`. Há também pequenos ajustes de indentação/espaçamento em `desabilitarCampos()` no mesmo arquivo, sem mudança de comportamento.
- **`G12-Style.css`**: `#carregamentoG12` (`position: fixed`, tela cheia, `z-index: 100000`, flex centralizado), `#carregamentoG12 span` (fonte 160 px, peso 900, cor `#1eaad9`, `font-family: system-ui`), e os keyframes `g12LoaderIn` / `g12LoaderOut` (opacidade 0↔1 com `scale(0.3)`↔`scale(1)`) e `entradaSuave`.

### A2.5 Ajustes menores

- **`G12.beforeStateEntry.js`** — a lista de destinatários do e-mail das atividades 242/62 (Adendo A.4) perdeu `enos.rocha@engpac.com`; ficou apenas `ens4562@gmail.com`, com `contratos@engpac.com.br` e `contratos@gennesisengenharia.com.br` comentados. (A seção A.4 já reflete esse estado.)
- **`G12.html`** — removido o BOM (`﻿`) do início do arquivo.
- **`forms/G12/.metadata`** — binário do formulário atualizado (545 → 541 bytes); não decodificado (ver seção 16).
- **`workflow/.resources/PRODUCAO.ws.cache` e `PRODUCAO.ws.cache.bkp`** — **novos**. Cache binário de WSDL do webservice do RM apontando para o ambiente de **PRODUÇÃO**, no mesmo formato dos `HOMOLOGACAO.ws.cache(.bkp)` já versionados. Não interpretável como texto (ver seção 16).
- **`workflow/diagrams/G12.process` / `G12.ecm30.xml` / `G12.png` / `G12.processimage.svg`** — reexportados. Inclui o reposicionamento da Service Task **418 "AJUSTAR VALOR DO RPS"** para antes dos ajustes tributários no fluxo (ver Adendo A.1/A.6). O diff é grande e majoritariamente reordenação/reformatação do XMI; a fiação exata dos estados novos não foi reconferida linha a linha (mesma limitação declarada no Adendo A.1).

---

## 1. Resumo Executivo

### 1.1 Objetivo do projeto

O **G12** é um processo de BPM no TOTVS Fluig que automatiza o ciclo de **transmissão de Notas Fiscais de Serviço Eletrônicas (NFS-e)** vinculadas a contratos de prestação de serviço, com integração direta ao **TOTVS RM** (ERP). O processo cobre desde o carregamento dos dados do contrato/movimento, passando pela aprovação técnica, validação de contratos, ajuste de tributos (nacionais, municipais, IRRF/INSS), faturamento em cadeia de três tipos de movimento RM (2.1.01 → 2.1.02 → 2.2.01), envio e validação da NFS-e junto à prefeitura, até a checagem final de transmissão e eventual reenvio para ajustes financeiros ou técnicos.

### 1.2 Arquitetura

- **Front-end do formulário**: HTML + jQuery (Fluig Style Guide) rodando dentro do iframe do formulário Fluig (`G12.html` + ~25 arquivos `.js` + 1 `.css` na pasta `forms/1276366 - G12/`).
- **Camada de eventos do formulário (server-side, Rhino/Java)**: `displayFields.js`, `enableFields.js`, `validateForm.js` — hooks padrão do ciclo de vida de formulário Fluig, executados no servidor a cada renderização/gravação. **[PRD 0.6]** `displayFields`/`enableFields` têm um bloco extra de bloqueio total em modo VIEW.
- **Camada de dados (Datasets Fluig)**: em homologação, 13 datasets em `datasets/*.js` consultando o RM via SOAP `WSCONSSQL`. **[PRD 0.7] Neste repositório a pasta `datasets/` está vazia** — cap. 6 descreve os datasets por referência.
- **Camada de processo (BPMN)**: `workflow/diagrams/G12.process` (modelo Graphiti/BPMN2 do Fluig Process Designer, processo G12 **versão 6 / servidor PRODUCAO**) + `workflow/.resources/G12.ecm30.xml` (export do processo para o ECM/banco do Fluig).
- **Service Tasks** (`workflow/scripts/*.js`, ~28 arquivos `servicetaskNN.js` + `beforeStateEntry` + `afterTaskComplete` + `atualizaçãoCNOPB`): scripts server-side (Rhino) que chamam os webservices SOAP do RM (`wsProcess`, **`RMWsDataServer`** — cap. 0.2) para faturar movimentos, ajustar tributos, enviar/consultar NFS-e, atualizar CNO, etc.
- **Mecanismos de atribuição (Mechanisms)** (`mechanisms/*.js`): resolvem para qual usuário/grupo Fluig uma atividade deve ser distribuída. **[PRD 0.7] Neste repositório a pasta `mechanisms/` está vazia** — cap. 4 descreve os mecanismos por referência.

### 1.3 Tecnologias identificadas

| Camada | Tecnologia |
|---|---|
| BPM/ECM | TOTVS Fluig (Fluig Process Designer / BPMN2 via Graphiti) |
| ERP integrado | TOTVS RM (via SOAP: `wsProcess`, `wsDataServer`, `WSCONSSQL`) |
| Scripts server-side | JavaScript (Rhino engine embutida no Fluig — uso de `java.lang.*`, `java.text.SimpleDateFormat`, `org.json.XML`) |
| Front-end | HTML, jQuery, Fluig Style Guide (`fluig-style-guide.min.css/js`), Mustache.js (carregado mas sem uso identificado no código lido), Lordicon (ícones animados via CDN externo) |
| Dados | Datasets Fluig (`DatasetFactory`, `DatasetBuilder`) consumindo XML→JSON de retorno do RM |
| Ambiente de projeto | Eclipse (nature `com.totvs.tds.ecm.designer.nature`, TDS — TOTVS Developer Studio) |

### 1.4 Principais módulos

1. **Carregamento de dados do contrato/movimento** (dataset `G12-CARREGAR-DADOS` + `servicetask9`)
2. **Aprovação do setor técnico** (mecanismo `G12-APROVACAO-ST`)
3. **Checagem/validação de contratos** (mecanismo `G12-VALIDIACAO-CONTRATOS`)
4. **Ajuste de CNO (Cadastro Nacional de Obras)** para Paraíba (`servicetask180`)
5. **Faturamento em cadeia RM**: 2.1.01 → 2.1.02 (`servicetask71`) → 2.2.01 (`servicetask78`)
6. **Ajuste de tributos** do movimento (nacionais `servicetask87`, municipais `servicetask108`, IRRF/INSS `servicetask118`/`servicetask130`)
7. **Ajuste de competência fiscal** (`servicetask223`)
8. **Envio e validação da NFS-e** (`servicetask233` ajuste de histórico → `servicetask148` envio → `servicetask157` validação/consulta de autorização, com sub-rotinas de captura de erro `servicetask193`/`servicetask200`)
9. **Checagem de transmissão** (gateway automático `exclusivegateway246` baseado em campos preenchidos pelo usuário)
10. **Ajuste de solicitação** (retorno ao solicitante ou a financeiro/técnico, mecanismo `G12-AJUSTE-SOLICITACAO`)
11. **Cancelamento de movimento** (subprocesso "CANCELAMENO", `servicetask30`)
12. **Anexos e GED** (upload de NFS-e para aba de anexos do Fluig; listagem de documentos do GED do RM por período de medição)
13. **"Bot" de checagem de preenchimento** (painel flutuante que lista campos obrigatórios não preenchidos, `G12-CheckBot.js`)

### 1.5 Fluxo geral (visão de altíssimo nível)

```
Usuário/RM dispara processo (IdMov + CodColigada)
        │
        ▼
Carregamento de dados (dataset + servicetask9)
        │
        ▼
Aprovação Setor Técnico ──(CANCELAR)──► Cancelamento (servicetask30) ─► Fim
        │
        ├──(AJUSTAR SOLICITACAO)──► Ajuste de Solicitação ─► Fim (retorna ao solicitante)
        │
        ▼
Checagem de Contratos ──(AJUSTAR SOLICITACAO)──► (mesmo destino acima)
        │
        ▼ (gateway: gerAtualizacaoCNOPB())
   true │                 │ false
        ▼                 │
Atualizar CNO PB           │
        │                 │
        └────────┬────────┘
                 ▼
   Faturar Movimento 2.1.01 → gera 2.1.02 (servicetask71)
                 │
                 ▼
            Faturar Notas (hub de ajustes) ◄───────────────┐
                 │  (links para sub-integrações opcionais) │
                 │  - Ajustar tributos do movimento         │
                 │  - Cadastrar/ajustar tributo municipal    │
                 │  - Ajustar IRRF/INSS                      │
                 │  - Cadastrar IRRF/INSS                    │
                 │  - Ajustar competência                    │
                 ▼                                           │
     Ajustar histórico + Enviar Nota (servicetask233)        │
                 │                                           │
                 ▼                                           │
     Envio de NFS-e — serviço automático (servicetask148) ───┘ (retorno em caso de erro)
                 │
                 ▼
     Validação de Nota Fiscal (servicetask157) ──(erro)──► Tratamento (task158) ─┬─► retorna a Faturar Notas
                 │                                                                ├─► retorna a Enviar Nota
                 │                                                                └─► Faturar Nota Manualmente → NFS-e Transmitida
                 ▼
     Faturar Movimento 2.1.02 → gera 2.2.01 (servicetask78)
                 │
                 ▼
          NFS-e Transmitida (task61)
                 │
                 ▼
       Checagem de Transmissão (task242)
                 │
                 ▼ (gateway automático por regras de campo)
   infoTransmissaoCorreta = sim ──► Aguardando Recebimento ──► Fim
   infoSetorAjuste = financeiro ──► Ajuste de Solicitação [Financeiro] ──► Fim
   infoSetorAjuste = tecnico ──► Ajuste de Solicitação [Retornar ao Solicitante] ──► Fim
```

### 1.6 Integrações identificadas

- **TOTVS RM via SOAP**: `WSCONSSQL` (consultas SQL nomeadas), `wsProcess` (ações complexas: faturamento, cancelamento, envio/consulta de NFS-e), `wsDataServer` (CRUD de registros: `saveRecord`/`readRecord` em tabelas do RM).
- **Fluig Datasets internos**: `dsTBCConnector` (credenciais de acesso ao RM) e `ds_Constantes` (parâmetros `rm_usuario`/`rm_senha` e outros) — **não fazem parte deste repositório**, são datasets globais do ambiente Fluig.
- **Fluig ECM/Anexos**: `parent.ECM.attachmentTable`, `WKFViewAttachment` — anexação de arquivos (nota fiscal) na aba "Anexos" do processo.
- **Fluig GED**: URLs diretas para `ecmnavigation` do portal Fluig, construídas a partir de códigos de documento retornados por dataset.
- **CDN externo**: `cdn.lordicon.com` (ícones animados) e `i.imgur.com` (imagens estáticas usadas como mascote do bot e ícone) — dependências externas fora do controle do Fluig.

---

## 2. Estrutura do Projeto

```
ProjetoG12Producao/
├── datasets/                        # ⚠️ VAZIO neste export (ver cap. 0.7 / 16). Em Homologação:
│   │                                #    G12-AJUSTAR-TRIBUTOS, G12-CADASTRAR-TRIBUTO-MUNICIPAL,
│   │                                #    G12-CARREGAR-DADOS, G12-CARREGAR-TRIBUTOS, G12-EXERCICIO-FISCAL,
│   │                                #    G12-GED, G12-HISTORICO-NFSE, G12-INFO-NFSE, G12-INSS-ZOOM,
│   │                                #    G12-IRRF-ZOOM, G12-MOVIMENTOS-2102, G12-PERIODOS-MEDICAO,
│   └                                #    G12-TRIBUTOS-MUNICIPAIS  (13 arquivos — documentados no cap. 6 por referência)
│
├── forms/1276366 - G12/             # Formulário do processo (HTML + JS + CSS) — pasta nomeada pelo Form ID de produção
│   ├── G12.html                     # Formulário principal; carrega vcXMLRPC.js + splash screen #carregamentoG12 (ver Adendo A2.3/A2.4) — CRLF [PRD 0.8]
│   ├── G12.TemplateEmail.html       # [NOVO] Template do e-mail disparado por beforeStateEntry.js (ver Adendo A.4)
│   ├── G12-Style.css                # Estilos
│   ├── G12-Main.js                  # Bootstrap de eventos on document.ready
│   ├── G12-Loading.js               # Arquivo vazio (ver seção 13 — código morto)
│   ├── G12-Carregamento.js          # Preenchimento do formulário a partir do dataset
│   ├── G12-Anexos.js                # Upload/visualização/remoção de anexos (aba Anexos do Fluig)
│   ├── G12-AnexosEmail.js           # [NOVO] Arquivo vazio (ver seção 13 — código morto)
│   ├── G12-CalcularAjusteTributos.js# Cálculo de valor de imposto (base x alíquota); [ATUALIZADO] ajuste de valor do RPS + alerta de variação ≥1% (ver Adendo A.6)
│   ├── G12-ChecagemTransmissao.js   # Seleção visual dos botões de checagem de transmissão; [ATUALIZADO] generalizado para o painel espelhado da atividade 62 (ver Adendo A.2)
│   ├── G12-CheckBot.js              # Painel flutuante de pendências de preenchimento
│   ├── G12-Cno.js                   # Função inteira comentada (código morto)
│   ├── G12-ControleDeEtiquetas.js   # [NOVO] Marcação visual de notas fiscais canceladas (ver Adendo A.7)
│   ├── G12-GED.js                   # Renderização dos anexos do GED por período; [ATUALIZADO] `buscarInfoGed()` consulta período/GED no client-side (ver Adendo A2.3)
│   ├── G12-HistoricoMovimentos.js   # [NOVO] Painel "Histórico dos Movimentos" (ver Adendo A.5)
│   ├── G12-IRRF-INSS.js             # Toggle de exibição das tabelas de IRRF/INSS
│   ├── G12-NF-e.js                  # Modal "DANFSe" (espelho de nota fiscal)
│   ├── G12-TabelaDeTributos.js      # Toggle de exibição da tabela de tributos do movimento
│   ├── G12-Toogle.js                # Toggle de exibição da checagem + edição manual/competência; [ATUALIZADO] `desabilitarCampos()` novo + padronização de cores (ver Adendo A.2/A.8)
│   ├── G12-TributosDoMovimento.js   # Toggle de exibição da tabela de tributos ajustáveis
│   ├── G12-TributosMunicipaisFuncoesAuxiliares.js # Toggle da tabela de tributos municipais
│   ├── G12-Zoom.js                  # Callback do componente "zoom" (autocomplete) de IRRF/INSS
│   ├── events/
│   │   ├── displayFields.js         # Hook Fluig: mostra/oculta seções; [PRD 0.6] bloco extra de bloqueio total em modo VIEW (g12TravarView)
│   │   ├── enableFields.js          # Hook Fluig: habilita/desabilita campos; [PRD 0.6] desabilita TODOS os campos em modo VIEW
│   │   └── validateForm.js          # Hook Fluig: validação obrigatória de CNOPB
│   ├── .metadata                    # Objeto Java serializado (FormularioServerDto) — form 1276366/PRODUCAO/DSG12
│   ├── charging.gif / wired-flat-400-*.gif / wired-flat-453-*.gif  # GIFs na raiz da pasta [PRD 0.8]
│
├── mechanisms/                      # ⚠️ VAZIO neste export (ver cap. 0.7 / 16). Em Homologação: 9 arquivos —
│   │                                #    G12-APROVACAO-ST, G12-VALIDIACAO-CONTRATOS, G12-CONTRATOS-VALIDA,
│   │                                #    G12-AJUSTE-SOLICITACAO, G12-CHECAGEM-DE-TRANSMISSAO, G12-AGUARDANDORECEB,
│   └                                #    G12-FATURAR-NOTAS, G12-NFSE-TRANSMITIDA, G12-AJUSTE-FINANCEIRO
│                                    #    (documentados no cap. 4 por referência — não verificados em produção)
│
├── workflow/
│   ├── diagrams/G12.process         # Modelo BPMN2/Graphiti — processo G12 versão 6, servidor PRODUCAO
│   ├── literals/                    # (pasta vazia — esqueleto TDS) [PRD 0.8]
│   ├── scripts/                     # 31 arquivos — Service Tasks e eventos globais do processo
│   │   ├── G12.servicetask9.js ... G12.servicetask233.js  (15 service tasks originais)
│   │   ├── G12.servicetask267/308/325/334/343/355/363/369/375/394/404/410/418.js  # sub-fluxo "AJUSTE FINANCEIRO" (Adendo A.1)
│   │   ├── G12.beforeStateEntry.js  # Evento global; dispara e-mail 242/62 (Adendo A.4) — [PRD 0.4] destinatários reais
│   │   ├── G12.afterTaskComplete.js # Evento global "ao concluir tarefa" — comentário automático 242/62 (Adendo A.3)
│   │   └── G12.atualizaçãoCNOPB.js  # Função de suporte à condição do gateway 177
│   └── .resources/
│       ├── G12.ecm30.xml            # Export do processo para o ECM (ligeiramente menor que o de homologação — cap. 0.1)
│       ├── G12.png / G12.processimage.svg  # Renderizações gráficas do processo
│       └── PRODUCAO.ws.cache(.bkp)  # Cache binário de WSDL do webservice do RM (produção) — não interpretável como texto
│
└── .project / .settings/.jsdtscope  # Metadados de projeto Eclipse/TDS (JSDT + nature ECM Designer)
```

> **`ServiceManager.getService(...)`:** em produção o serviço de CRUD do RM é **`RMWsDataServer`** (não `wsDataServer`) — ver cap. 0.2.
>
> **Diretórios vazios encontrados no repositório:** além de `datasets/` e `mechanisms/` (cap. 0.7), também `events/`, `reports/`, `wcm/layout/`, `wcm/widget/` e `workflow/literals/` existem na raiz mas **não contêm arquivos** — esqueleto padrão de projeto Fluig (TDS).

---

## 3. Processo BPM — G12

### 3.1 Identificação

| Campo | Valor |
|---|---|
| ID do processo | `G12` |
| Nome | G12 |
| Versão analisada | **6** (servidor `PRODUCAO`) |
| Servidor | `PRODUCAO` |
| Form ID | **1276366** (dataset `DSG12`, pasta `forms/1276366 - G12/`) |
| Mecanismo de gerência padrão | `Usuário` (colleagueId fixo `4ef20412-7687-40a4-b1c8-095c0a92503e`) |
| WebService de CRUD do RM | **`RMWsDataServer`** (em homologação: `wsDataServer` — cap. 0.2) |

### 3.2 Pools e Swimlanes identificados

| Pool | Swimlanes | Observação |
|---|---|---|
| **G12** (pool principal) | CARREGAMENTO, SETOR TÉCNICO, CONTRATOS, FINANCEIRO | Fluxo principal do processo |
| **CANCELAMENO** | (sem nome) | Subprocesso de cancelamento de movimento |
| **AJUSTE DE SOLICITACAO** | (sem nome) | Reservado para a atividade "AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE]" |
| **INTEGRAÇÕES DE TRIBUTOS E INFORMAÇÕES DA NOTA FISCAL** | 5 swimlanes (laranja `FF8040`) | Concentra as sub-rotinas de ajuste de tributos/IRRF/INSS/competência, acessadas via eventos de link a partir de "FATURAR NOTAS" |
| **NFS-e** | (sem nome, ciano `00FFFF`) | Sub-rotina de envio/ajuste de histórico da nota antes do envio |

> Os "links" (`BpmnIntermediateEvent` do tipo *link throw/catch*, `type="36"`/`type="42"`) são usados extensivamente para conectar pools diferentes sem desenhar uma seta direta — funcionam como "teleportes" nomeados (ex.: *"SAIDA PARA FATURAR NOTAS"* → *"CHEGADA EM FATURAR NOTAS"*).

### 3.3 Catálogo completo de atividades (states)

| Seq. | Nome da atividade | Tipo BPMN | Responsável / Mecanismo | Script associado |
|---|---|---|---|---|
| 5 | Início | StartEvent | — | — |
| 9 | CARREGAMENTO DE DADOS | Service Task (automática) | Sistema | `G12.servicetask9.js` |
| 12 | Intermediário (erro) | Boundary error event | — | anexado a `servicetask9` |
| 13 | TRATAMENTO DE ERRO [CARREGAMENTO DE DADOS] | User Task | Usuário fixo | — |
| 17 | **APROVAÇÃO SETOR TÉCNICO** | User Task | Mecanismo `G12-APROVACAO-ST` | — |
| 23 | **FATURAR NOTAS** | User Task (hub) | Usuário fixo | — |
| 30 | CANCELAR MOVIMENTO RM E FLUIG | Service Task | Sistema | `G12.servicetask30.js` |
| 31 | Intermediário (erro) | Boundary error | — | anexado a `servicetask30` |
| 32 | TRATAMENTO DE ERRO | User Task | Usuário fixo | — |
| 35 | Fim com cancelamento de processo | End Event | — | — |
| 43 | AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE] | User Task | Mecanismo `Executor Atividade` (retorna a `startevent5`) | — |
| 61 | **NFS-e TRANSMITIDA** | User Task | Usuário fixo | — |
| 62 | AGUARDANDO RECEBIMENTO | User Task | Usuário fixo | — |
| 65 | Fim | End Event | — | — |
| 67 | Fim | End Event | — | — |
| 71 | FATURAR MOVIMENTO 2.1.01 E GERAR MOVIMENTO 2.1.02 | Service Task | Sistema | `G12.servicetask71.js` |
| 73/74 | Intermediário (erro) / TRATAMENTO DE ERRO [FATURAMENTO DO 2.1.01] | Boundary error / User Task | — | — |
| 78 | FATURAR MOVIMENTO 2.1.02 E GERAR MOVIMENTO 2.2.01 | Service Task | Sistema | `G12.servicetask78.js` |
| 80/81 | Intermediário (erro) / TRATAMENTO DE ERRO [FATURAMENTO DO 2.1.02] | Boundary error / User Task | — | — |
| 87 | AJUSTAR TRIBUTOS DO MOVIMENTO | Service Task | Sistema | `G12.servicetask87.js` |
| 89/90 | Intermediário (erro) / TRATAMENTO DE ERRO [AJUSTAR TRIBUTO DO MOVIMENTO] | — | — | — |
| 108 | CADASTRAR/AJUSTAR TRIBUTO MUNICIPAL | Service Task | Sistema | `G12.servicetask108.js` |
| 109/107 | Intermediário (erro) / TRATAMENTO DE ERRO [CADASTRAR/AJUSTAR TRIBUTO MUNICIPAL] | — | — | — |
| 118 | AJUSTAR IRRF/INSS | Service Task | Sistema | `G12.servicetask118.js` |
| 122/117 | Intermediário (erro) / TRATAMENTO DE ERRO [AJUSTAR IRRF/INSS] | — | — | — |
| 130 | CADASTRAR IRRF/INSS | Service Task | Sistema | `G12.servicetask130.js` |
| 131/129 | Intermediário (erro) / TRATAMENTO DE ERRO [CADASTRAR IRRF/INSS] | — | — | — |
| 148 | ENVIO DE NOTA FISCAL - [SERVIÇO AUTOMÁTICO] | Service Task | Sistema | `G12.servicetask148.js` |
| 149 | Intermediário (erro) | Boundary error | — | anexado a `servicetask148` |
| 150 | TRATAMENTO DE ERRO [ENVIO DA NOTA FISCAL] | User Task | Usuário fixo | — |
| 157 | VALIDAÇÃO DE NOTA FISCAL | Service Task | Sistema | `G12.servicetask157.js` |
| 158 | TRATAMENTO DE ERRO [VALIDAÇÃO DA NOTA FISCAL] | User Task | Usuário fixo | — |
| 159 | Intermediário (erro) | Boundary error | — | anexado a `servicetask157` |
| 173 | **CHECAGEM DE CONTRATOS** | User Task | Mecanismo `G12-VALIDIACAO-CONTRATOS` | — |
| 177 | APROVAR | Exclusive Gateway (condição por expressão) | — | `gerAtualizacaoCNOPB()` |
| 180 | ATUALIZAR NÚMERO DO CNO | Service Task | Sistema | `G12.servicetask180.js` |
| 182/183 | Intermediário (erro) / TRATAMENTO DE ERRO [ATUALIZAÇÃO DE CNO PB] | — | Mecanismo `G12-VALIDIACAO-CONTRATOS` | — |
| 193 | BUSCAR DESCRIÇÃO E STATUS DO ERRO DE ENVIO | Service Task | Sistema | `G12.servicetask193.js` |
| 197 | Intermediário (erro) | Boundary error | — | anexado a `servicetask193` |
| 200 | BUSCAR DESCRIÇÃO E STATUS DO ERRO DE AUTORIZAÇÃO | Service Task | Sistema | `G12.servicetask200.js` |
| 202 | Intermediário (erro) | Boundary error | — | anexado a `servicetask200` |
| 222/223 | TRATAMENTO DE ERRO [AJUSTAR COMPETÊNCIA] / AJUSTAR COMPETÊNCIA | User Task / Service Task | Sistema | `G12.servicetask223.js` |
| 224 | Intermediário (erro) | Boundary error | — | anexado a `servicetask223` |
| 233 | ENVIAR NOTA | Service Task | Sistema | `G12.servicetask233.js` |
| 235/236 | TRATAMENTO DE ERRO [AJUSTE HISTÓRICO E ENVIAR] / Intermediário (erro) | — | — | — |
| 241 | Anotação "AJUSTA O HISTÓRICO DA NOTA ANTES DE ENVIAR" | Annotation (texto) | — | — |
| 242 | **CHECAGEM DE TRANSMISSÃO** | User Task | Usuário fixo | — |
| 246 | SEGUIR | Exclusive Gateway (regras automáticas por campo) | — | ver 3.5 |
| 250 | AJUSTE DE SOLICITAÇÃO [FINANCEIRO] | User Task | Mecanismo `G12-AJUSTE-SOLICITACAO` | — |
| 253 | Fim | End Event | — | — |
| 255/256 | Anotações "SETOR TÉCNICO" / "FINANCEIRO" | Annotation | — | — |

> Os números da coluna "Seq." correspondem ao **campo oculto `atividade`** do formulário (`$("#atividade").val()`), preenchido automaticamente pelo Fluig com `Number(getValue("WKNumState"))` e consumido em `displayFields.js`, `enableFields.js`, `validateForm.js`, `G12-CheckBot.js` e `G12-Toogle.js` para decidir o que mostrar/habilitar em cada etapa do processo.

### 3.4 Fluxograma textual detalhado (início ao fim)

1. **Início** → dispara automaticamente **CARREGAMENTO DE DADOS** (`servicetask9`, dataset `G12-CARREGAR-DADOS`, chave `CODCOLIGADA`+`IDMOV`). Em erro, cai em **TRATAMENTO DE ERRO [CARREGAMENTO DE DADOS]** (retrabalho manual) e retorna à mesma service task.
2. → **APROVAÇÃO SETOR TÉCNICO** (atividade 17, atribuída pelo mecanismo `G12-APROVACAO-ST`). Três saídas possíveis:
   - **CANCELAR** → link para o subprocesso **CANCELAMENO**: `servicetask30` cancela o movimento no RM (`MovCancelMovProc`) → **Fim com cancelamento de processo**.
   - **AJUSTAR SOLICITAÇÃO** → link para **AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE]** (mecanismo `Executor Atividade`, retorna ao nó `startevent5`) → **Fim**.
   - **APROVAR** → segue para **CHECAGEM DE CONTRATOS**.
3. **CHECAGEM DE CONTRATOS** (atividade 173, mecanismo `G12-VALIDIACAO-CONTRATOS`). Duas saídas:
   - **AJUSTAR SOLICITAÇÃO** → mesmo destino do item 2 (retorno ao solicitante).
   - **APROVAR** (fluxo padrão) → gateway **APROVAR** (`exclusivegateway177`), decidido pela expressão `gerAtualizacaoCNOPB()` (definida em `G12.atualizaçãoCNOPB.js`):
     - `true` (coligada 2 + centro de custo da Paraíba, lista fixa de 12 códigos) → **ATUALIZAR NÚMERO DO CNO** (`servicetask180`, grava `CGC`/`CNOPRJ` no projeto do RM conforme a coligada) → segue para o item 4.
     - `false` → segue direto para o item 4.
4. **FATURAR MOVIMENTO 2.1.01 E GERAR MOVIMENTO 2.1.02** (`servicetask71`): busca `G12-EXERCICIO-FISCAL`, chama `MovFaturamentoProc` (RM), depois recarrega `G12-MOVIMENTOS-2102`, `G12-CARREGAR-DADOS` (para pegar a data de competência do novo movimento) e `G12-CARREGAR-TRIBUTOS`.
5. → **FATURAR NOTAS** (atividade 23) — atividade "hub": a partir dela o usuário pode disparar, via botões do formulário, qualquer uma das sub-rotinas abaixo (implementadas como eventos de link BPMN que levam à pool "INTEGRAÇÕES DE TRIBUTOS..." ou à pool "NFS-e") **antes** de seguir o fluxo principal:
   - **AJUSTAR IMPOSTOS DO MOVIMENTO** → `servicetask87` (grava tributos nacionais ajustados no RM via `MovMovimentoTBCData`) → retorna a "FATURAR NOTAS".
   - **CADASTRAR IMPOSTOS MUNICIPAIS** → `servicetask108` (grava `FisTrbMunicipioPrdData`) → retorna a "FATURAR NOTAS".
   - **AJUSTAR IRRF E INSS** → `servicetask118` (grava `EstPrdCfoDataBR`) → retorna a "FATURAR NOTAS".
   - **CADASTRAR IRRF / INSS** → `servicetask130` (cadastra novo IRRF/INSS via `FinIRRFData`/`MovINSSData` e vincula ao cliente) → retorna a "FATURAR NOTAS".
   - **AJUSTAR COMPETÊNCIA** → `servicetask223` (grava `DTCOMPETENCIASERVICO` em `MOVMOVIMENTOTBCDATA`) → retorna a "FATURAR NOTAS".
   - **ENVIAR NOTA FISCAL** (fluxo principal) → pool **NFS-e**: `servicetask233` (" ENVIAR NOTA") grava o histórico longo do movimento (`HISTORICOLONGO`) → segue para o envio automático.
6. **ENVIO DE NOTA FISCAL - [SERVIÇO AUTOMÁTICO]** (`servicetask148`): dispara a ação RM `MovEnviaNFSeMovAction` via `wsProcess.executeWithXmlParams`. Em erro (evento de erro anexado): `servicetask193` busca `G12-HISTORICO-NFSE` (com retry de até 5 tentativas / 3s) e grava `errorAoEnviarNotas`/`statusEnvio` → **TRATAMENTO DE ERRO [ENVIO DA NOTA FISCAL]** (atividade 150), que pode **retornar ao próprio envio** ou **retornar a "FATURAR NOTAS"**.
7. → **VALIDAÇÃO DE NOTA FISCAL** (`servicetask157`): dispara `FisNFSeRetornarNotasData` (consulta autorização/cancelamento junto à prefeitura). Em erro: `servicetask200` busca `G12-HISTORICO-NFSE` e grava `errorAoAutorizarNotas`/`statusAutorizacao` → **TRATAMENTO DE ERRO [VALIDAÇÃO DA NOTA FISCAL]** (atividade 158), com **quatro** saídas possíveis: retry da própria validação, retorno a "FATURAR NOTAS", retorno ao envio de nota, ou **FATURAR NOTA MANUALMENTE** (pula direto para "NFS-e Transmitida").
8. → **FATURAR MOVIMENTO 2.1.02 E GERAR MOVIMENTO 2.2.01** (`servicetask78`): chama novamente `MovFaturamentoProc` (2.1.02 → 2.2.01), depois recarrega `G12-MOVIMENTOS-2102` (para obter o IDMOV 2.2.01) e `G12-INFO-NFSE` (número da nota, código de verificação, datas de emissão/autorização).
9. → **NFS-e TRANSMITIDA** (atividade 61) — também alcançável diretamente pelo caminho "FATURAR NOTA MANUALMENTE" do passo 7.
10. → **CHECAGEM DE TRANSMISSÃO** (atividade 242): tela onde o usuário informa se a transmissão está correta (`infoTransmissaoCorreta`) e, se não, qual setor deve ajustar (`infoSetorAjuste`).
11. Gateway **SEGUIR** (`exclusivegateway246`, decidido por **regras automáticas de campo**, não por expressão JS):
    - `infoTransmissaoCorreta == "sim"` → **AGUARDANDO RECEBIMENTO** → **Fim**.
    - `infoSetorAjuste == "financeiro"` → **AJUSTE DE SOLICITAÇÃO [FINANCEIRO]** (mecanismo `G12-AJUSTE-SOLICITACAO`) → **Fim**.
    - `infoSetorAjuste == "tecnico"` → **AJUSTE DE SOLICITAÇÃO [RETORNAR AO SOLICITANTE]** (mesmo destino do item 2/3) → **Fim**.

### 3.5 Gateways e condições (transcrição literal)

**`exclusivegateway177` ("APROVAR")** — condição por expressão JavaScript:
```
1) gerAtualizacaoCNOPB() == true   → destino: servicetask180 (ATUALIZAR NÚMERO DO CNO)
2) gerAtualizacaoCNOPB() == false  → destino: servicetask71  (FATURAR MOVIMENTO 2.1.01)
```

**`exclusivegateway246` ("SEGUIR")** — condição por **regras automáticas** (campo/valor/operador), sem expressão JS:
```
1) campo "infoTransmissaoCorreta" operador(1)=igual valor "sim"       → destino: task62  (AGUARDANDO RECEBIMENTO)
2) campo "infoSetorAjuste"        operador(1)=igual valor "financeiro" → destino: link → task250 (AJUSTE FINANCEIRO)
3) campo "infoSetorAjuste"        operador(1)=igual valor "tecnico"    → destino: link → task43  (AJUSTE — RETORNAR AO SOLICITANTE)
```

### 3.6 Timers / SLA

Não foram encontrados **timer events** (BPMN Timer) no processo. Os únicos prazos identificados são atributos de **SLA administrativo** do estado inicial no export ECM (`allowanceAuthorityTime`/`frequenceAuthorityTime` = 3600s, `deadlineTime` = 60 min no estado "Início"), que controlam alertas de atraso do Fluig, não desvios de fluxo.

### 3.7 Eventos globais do processo

- **`G12.beforeStateEntry.js` → `beforeStateEntry(sequenceId)`**: executado antes de entrar em praticamente qualquer atividade humana/de serviço do processo (lista extensa de `sequenceId`, cobrindo 30 estados). A cada entrada, busca o **período de medição atual** (dataset `G12-PERIODOS-MEDICAO`, por `IDMOV`+`CODCOLIGADA`) e, em seguida, os **documentos do GED** (dataset `G12-GED`, por `CODCOLIGADA`+`IDPRJ`+`IDCONTRATO`+`PERIODO`+`REVISAO`), concatenando os resultados em `gedInfo` (formato `pasta|codigoDocumento|descricao` separado por `;`) para consumo posterior por `G12-GED.js` no front-end. **Atualizações:** ganhou um segundo bloco que dispara e-mail nas atividades 242/62 (Adendo A.4) — **[PRD 0.4] em produção os destinatários ativos são `contratos@engpac.com.br` e `contratos@gennesisengenharia.com.br`** (o e-mail de teste `ens4562@gmail.com` está comentado); e a mesma busca de período/GED passou a ter também uma versão **client-side** em `G12-GED.js` (`buscarInfoGed`, Adendo A2.3), que sobrescreve `gedInfo`/`periodoMedicao` a cada carregamento do formulário.
- **`G12.atualizaçãoCNOPB.js` → `gerAtualizacaoCNOPB()`**: função pura usada apenas como condição do gateway 177; retorna `true` somente quando `CodColigada == 2` **e** `centro_de_custo` pertence à lista fixa de 12 centros de custo da Paraíba.

---

## 4. Mecanismos de Atribuição (Mechanisms)

Mecanismos Fluig implementam `function resolve(process, colleague)` e devolvem uma `java.util.ArrayList` de usuários (`Colleague`) ou grupos (`Pool:Group:...`) que receberão a tarefa.

> ⚠️ **[PRD 0.7] A pasta `mechanisms/` deste repositório está VAZIA.** Todo o conteúdo desta seção descreve os arquivos do repositório de **Homologação** (estado em 02/09/2026) e serve **apenas como referência**: os colleagueIds, nomes de grupo (`Pool:Group:...`) e a própria existência/versão de cada mecanismo em produção **não foram verificados**. O BPMN de produção (`G12.process` / `G12.ecm30.xml`) referencia como mecanismo de atividade apenas `G12-APROVACAO-ST` (ativ. 17) e `G12-VALIDIACAO-CONTRATOS` (ativ. 173/183) — os demais arquivos, mesmo em homologação, não aparecem no export.

> Em Homologação o repositório tem **9 arquivos** em `mechanisms/`: os 4 originais (4.1–4.4) e **5 adicionados em jul–ago/2026** (4.5–4.9, ver Adendo A2.2).

### 4.1 `G12-APROVACAO-ST.js`  *(reescrito — ver Adendo A2.1)*
- **Usado por:** atividade 17 (APROVAÇÃO SETOR TÉCNICO) — referenciado em `G12.process` **e** `G12.ecm30.xml`.
- **Entrada:** `centro_de_custo`, `CodColigada` (via `hAPI.getCardValue`).
- **Lógica ativa (cabeçalho `@data 29/08/2026`):** o roteamento nominal por centro de custo, antes **totalmente comentado**, foi **reativado**. `getUser(CentroDeCusto, CodColigada)` percorre `CodColigada` (`2`, `1`, `3`) e, em cada ramo, dezenas de condições `CentroDeCusto == "..."` apontando para colleagueIds de colaboradores nomeados (higor, odijerfeson, Vanylk Souza, thiago.leite, lucas.vinicius, diego, ciro.farias, "Sérgio Franco", Rodrigo Medeiros, marcelo.maia, isaac.medeiros, kaio.dorneles, José Emanuel, Tercio Porto, matheus.brito, "João Azevedo", entre outros). Cada ramo de coligada tem um `else` final → usuário fixo `4ef20412-7687-40a4-b1c8-095c0a92503e` ("Fluig").
- **Sem `else` de nível superior:** `CodColigada` diferente de `1`/`2`/`3` → `getUser` retorna lista vazia → `resolve()` lança `Error("Nenhum usuario encontrado ...")` e a atividade 17 não é atribuída.
- **Inconsistência:** um ramo de `CodColigada == 2` compara `CentroDeCusto == '02.06.01.0sergio4.003'` (string corrompida — nunca casa). Ver seção 13.
- **`mechanisms/G12-CONTRATOS-VALIDA.js` NÃO acompanhou** essa mudança: continua com o bloco comentado, usuário fixo, e não referenciado no BPMN (seção 13). Ver seção 14 (risco nº 1).

### 4.2 `G12-CONTRATOS-VALIDA.js`
- **Propósito declarado no cabeçalho:** "Mecanismo de atribuição de usuário para validação de contratos".
- **Lógica ativa:** retorna sempre o mesmo usuário fixo `4ef20412-7687-40a4-b1c8-095c0a92503e` (com bloco comentado de roteamento por centro de custo, semelhante ao 4.1, incluindo nomes com problemas de codificação de caracteres, ex. `"S�?©rgio Franco"`).
- **⚠️ Não referenciado no BPMN analisado** (`workflow/diagrams/G12.process` não usa `G12-CONTRATOS-VALIDA` como `managerAssignmentControllerString` de nenhuma atividade). Ver seção 15 — possível código morto/mecanismo substituído por `G12-VALIDIACAO-CONTRATOS`.

### 4.3 `G12-VALIDIACAO-CONTRATOS.js`
- **Usado por:** atividade 173 (CHECAGEM DE CONTRATOS) e atividade 183 (TRATAMENTO DE ERRO [ATUALIZAÇÃO DE CNO PB]).
- **Entrada:** `centro_de_custo`, `coligada` (nome do campo em minúsculo — atenção à diferença de grafia em relação ao `CodColigada` usado nos demais mecanismos), `filial`.
- **Lógica ativa:**
  - `CodColigada == 2` e centro de custo em uma lista de 12 códigos da Paraíba → grupo `Pool:Group:G12-ANALISECONTRATOS-PB`; caso contrário → `Pool:Group:G12-ANALISECONTRATOS-GERAL`.
  - `CodColigada == 1`: `Filial` 1 ou 5 → `Pool:Group:G12-ANALISECONTRATOS-DFGO`; senão → `GERAL`.
  - `CodColigada == 3`: `Filial == 2` → `DFGO`; senão → `GERAL`.

### 4.4 `G12-AJUSTE-SOLICITACAO.js`
- **Usado por:** atividade 250 (AJUSTE DE SOLICITAÇÃO [FINANCEIRO]).
- **Entrada:** `centro_de_custo`, `CodColigada`.
- **Lógica:** roteia por grupo conforme a coligada:
  - `2` → `Pool:Group:G12-ENGPAC-AJUSTELICITACOES-FINANCEIRO`
  - `1` → `Pool:Group:G12-GENNESIS-AJUSTELICITACOES-FINANCEIRO`
  - `3` → `Pool:Group:G12-ECONTECX-AJUSTELICITACOES-FINANCEIRO`
  - outro → `Pool:Group:G12-AJUSTE-SEM GRUPO`

### 4.5 `G12-CHECAGEM-DE-TRANSMISSAO.js`  *(novo — ver Adendo A2.2)*
- **Usado por:** *nenhuma atividade no processo exportado.* Aparenta estar preparado para a atividade 242 (CHECAGEM DE TRANSMISSÃO).
- **Entrada:** `centro_de_custo`, `coligada`, `filial`.
- **Lógica (idêntica em estrutura à 4.3):** `CodColigada == 2` + centro de custo em lista de 12 códigos da Paraíba → `Pool:Group:G12-CHECAGEMTRANSMISSAO-CONTRATOS-PB`; senão `-GERAL`. `CodColigada == 1` com `Filial` 1 ou 5 → `-DFGO`; `CodColigada == 3` com `Filial == 2` → `-DFGO`; demais casos → `-GERAL`.

### 4.6 `G12-AGUARDANDORECEB.js`  *(novo — ver Adendo A2.2)*
- **Usado por:** *nenhuma atividade no processo exportado.* Aparenta estar preparado para a atividade 62 (AGUARDANDO RECEBIMENTO).
- **Entrada e lógica:** idênticas à 4.5, com os grupos `Pool:Group:G12-AGUARDANDO-RECEBIMENTO-CONTRATOS-{PB,GERAL,DFGO}`.

### 4.7 `G12-FATURAR-NOTAS.js`  *(novo — ver Adendo A2.2)*
- **Usado por:** *nenhuma atividade no processo exportado.* Aparenta estar preparado para a atividade 23 (FATURAR NOTAS).
- **Entrada:** `CCcustoMEC`, `EmpresaMEC` (campos ausentes do `G12.html` e não gravados por nenhum script deste repositório — ver Adendo A2.2). `CCcustoMEC` é lido mas **não é usado** por `getGroup`.
- **Lógica (só por coligada):** `2` → `Pool:Group:G12-ENGPAC-FATURAR-NOTAS`; `1` → `G12-GENNESIS-FATURAR-NOTAS`; `3` → `G12-ECONTECX-FATURAR-NOTAS`; outro → `Pool:Group:Suporte`.

### 4.8 `G12-NFSE-TRANSMITIDA.js`  *(novo — ver Adendo A2.2)*
- **Usado por:** *nenhuma atividade no processo exportado.* Aparenta estar preparado para a atividade 61 (NFS-e TRANSMITIDA).
- **Entrada e lógica:** idênticas à 4.7, grupos `G12-{ENGPAC,GENNESIS,ECONTECX}-NFSE-TRANSMITIDA`; fallback `Pool:Group:Suporte`.

### 4.9 `G12-AJUSTE-FINANCEIRO.js`  *(novo — ver Adendo A2.2)*
- **Usado por:** *nenhuma atividade no processo exportado.* Aparenta estar preparado para a atividade 250 / sub-fluxo "AJUSTE FINANCEIRO" (Adendo A.1).
- **Entrada e lógica:** idênticas à 4.7, grupos `G12-{ENGPAC,GENNESIS,ECONTECX}-AJUSTE-FINANCEIRO`; fallback `Pool:Group:Suporte`.
- **Não confundir com a 4.4** (`G12-AJUSTE-SOLICITACAO.js`), que é o mecanismo hoje efetivamente ligado à atividade 250 e usa outros grupos (`G12-*-AJUSTELICITACOES-FINANCEIRO`).

---

## 5. Service Tasks (`workflow/scripts/*.js`)

Todas seguem o padrão `function servicetaskNN(attempt, message) {...}` (assinatura padrão de Service Task Fluig) e usam `hAPI.getCardValue`/`hAPI.setCardValue` para ler/gravar campos do card (formulário) do processo. A autenticação com o RM é obtida via dataset auxiliar `ds_Constantes` (função local `getConstante("rm_usuario")`/`getConstante("rm_senha")`), **exceto** em `servicetask9` e `servicetask30`, que usam o dataset `dsTBCConnector`. Ambos os datasets são **externos ao repositório** (globais do ambiente Fluig).

> **[PRD 0.2] Nome do serviço RM:** na tabela abaixo lê-se `wsDataServer.readRecord/saveRecord(...)` seguindo a nomenclatura de homologação. Em **produção** o serviço é obtido por `ServiceManager.getService("RMWsDataServer")` nas Service Tasks **87, 108, 118, 130, 180, 223, 233, 325, 334, 343, 355, 404, 410, 418** (o resto da chamada é idêntico). As Service Tasks de `wsProcess`/`WSCONSSQL` não mudam.
>
> **[PRD 0.3] `servicetask223`:** a versão de produção **não tem** a checagem de `"Exception"/"Error"` na resposta do RM — o "Tratamento de erro" listado para a linha 223 abaixo **não existe em produção** (só uma exceção Java do `executeWithParams` interromperia o fluxo). Ver seção 13.
>
> As Service Tasks 267/308/325/334/343/355/363/369/375/394/404/410/418 (sub-fluxo "AJUSTE FINANCEIRO", Adendo A.1) e o evento `afterTaskComplete.js` (Adendo A.3) **estão presentes em produção**, conferidos arquivo a arquivo.

| Script | Atividade | Entrada (card) | Integração RM | Saída (card) | Tratamento de erro |
|---|---|---|---|---|---|
| `G12.servicetask9.js` | 9 | `CodColigada`, `IdMov` | Dataset `G12-CARREGAR-DADOS` | ~50 campos do formulário (projeto, contrato, prestador, tomador, item, histórico) | `throw` propaga para o evento de erro anexado (→ task13) |
| `G12.servicetask30.js` | 30 | `CodColigada`, `IdMov`, `numeroMov` | `wsProcess.executeWithParams("MovCancelMovProc", XML)` | — (retorna dataset com resultado bruto) | Detecta strings `"Exception"/"erro"/"Error"` na resposta do RM e lança erro |
| `G12.servicetask71.js` | 71 | `CodColigada`, `IdMov`, `filial`, `idprj`, `idContrato`, `cidade_projeto` | 1) Dataset `G12-EXERCICIO-FISCAL`; 2) `wsProcess.executeWithParams("MovFaturamentoProc", ...)` (2.1.01→2.1.02); 3) datasets `G12-MOVIMENTOS-2102`, `G12-CARREGAR-DADOS`, `G12-CARREGAR-TRIBUTOS`, `G12-TRIBUTOS-MUNICIPAIS` | `exercicioFiscal`, `idmov2`, `dataDeCompetencia`, `tributosNacionais`, `naturezaOrcamentaria`, `irrfDoItem`, `inssDoItem`, `irrfDescricao`, `irrfAliquota`, `irrfTipoDePessoa`, `inssDescricao`, `inssAliquota`, `tributosMunicipais` | `throw e` em cada bloco `try/catch` (4 blocos independentes) |
| `G12.servicetask78.js` | 78 | `CodColigada`, `idmov2`, `filial`, `exercicioFiscal` | `wsProcess.executeWithParams("MovFaturamentoProc", ...)` (2.1.02→2.2.01) + datasets `G12-MOVIMENTOS-2102`, `G12-INFO-NFSE` | `numeroIdmov2201`, `codigoVerificacao`, `dataEmissao`, `dataAutorizacao`, `numeroNotas` | `throw` com mensagem contextual por bloco |
| `G12.servicetask87.js` | 87 | `CodColigada`, `idmov2`, campos dinâmicos `impostos_selecao___N`/`valorImposto___N`/`aliquota___N`/`baseCalculo___N` (tabela filha, até 50 linhas) | `wsDataServer.readRecord("MovMovimentoTBCData", ...)` (lê tributos atuais do movimento), mescla com o que o usuário editou no formulário, e `saveRecord("MovMovimentoTBCData", ...)` | recarrega `tributosNacionais`, `naturezaOrcamentaria`, `irrfDoItem`, `inssDoItem` via `G12-CARREGAR-TRIBUTOS` | Verifica `"Exception"/"Error"` na resposta do `saveRecord` |
| `G12.servicetask108.js` | 108 | `codigoMunicipio`, `estado_projeto`, `CodColigada`, `filial`, `idmov2`, `cidade_projeto`, `IDPRD`, campos `impostos_selecao_municipal___N`/`aliquotaMunicipal___N`/`baseReucaoMunicipal___N` | `wsDataServer.saveRecord("FisTrbMunicipioPrdData", ...)` por tributo (loop) | `tributosMunicipais` via `G12-TRIBUTOS-MUNICIPAIS` | Verifica erro por tributo individualmente |
| `G12.servicetask118.js` | 118 | `CodColigada`, `IDPRD`, `codigo_cliente`, `filial`, `idmov2`, `coligadaCliente`, `irrfCodigoAjuste`, `inssCodigoAjuste` | `wsDataServer.saveRecord("EstPrdCfoDataBR", ...)` (associa IRRF e/ou INSS ao cliente/produto) | recarrega dados via `G12-CARREGAR-TRIBUTOS` | Aborta silenciosamente se nenhum código foi selecionado |
| `G12.servicetask130.js` | 130 | Tabelas filhas `codigoIrrfCadastro___N`/`descricaoIrrfCadastro___N`/`aliquotaIrrfCadastro___N`/`codOficialIrrfCadastro___N`/`aplicavelA___N` e equivalentes de INSS, controladas por `indexIrrCadastro`/`indexInssCadastro` | `wsDataServer.saveRecord("FinIRRFData", ...)` / `saveRecord("MovINSSData", ...)` (cadastro) seguido de `saveRecord("EstPrdCfoDataBR", ...)` (vínculo ao cliente) | recarrega via `G12-CARREGAR-TRIBUTOS` | Aborta se nenhum índice de cadastro estiver presente |
| `G12.servicetask148.js` | 148 | `CodColigada`, `idmov2`, `filial` | `wsProcess.executeWithXmlParams("FisNFSeEnvioData", ...)` — payload SOAP extenso e específico do RM (`MovEnviaNFSeMovAction`), com parâmetros de contexto **hardcoded** (`$EXERCICIOFISCAL=7`, `$CODCOLIGADA=3`, `$CODFILIAL=1`, host/IP fixos) | — | `throw` se resposta contiver `Exception`/`Error` |
| `G12.servicetask157.js` | 157 | `CodColigada`, `idmov2`, `exercicioFiscal`, `cno` | `wsProcess.executeWithXmlParams("FisNFSeRetornarNotasData", ...)` (`FisNFEMunicipalAction` — consulta autorização/cancelamento), também com parâmetros de contexto hardcoded | — | `throw` se resposta contiver `Exception`/`Error` |
| `G12.servicetask180.js` | 180 | `CodColigada`, `idprj`, `CNOPB`, `filial` | `wsDataServer.saveRecord("PrjPrjData", ...)` — grava em `CGC` (se `CodColigada==2`, workaround documentado no próprio código: *"PARAMETRIZAÇÃO ERRADA NO MOMENTO"*) ou em `CNOPRJ` (demais coligadas) | — | `throw new Error` se resposta contiver `Exception`/`Error` |
| `G12.servicetask193.js` | 193 | `CodColigada`, `idmov2` | Dataset `G12-HISTORICO-NFSE` com **retry** (até 5 tentativas, 3s de intervalo, via `java.lang.Thread.sleep`) | `errorAoEnviarNotas`, `statusEnvio` | `throw` após esgotar tentativas |
| `G12.servicetask200.js` | 200 | `CodColigada`, `idmov2` | Dataset `G12-HISTORICO-NFSE` com retry (até 5 tentativas, 2s de intervalo) | `errorAoAutorizarNotas`, `statusAutorizacao` | `throw` após esgotar tentativas |
| `G12.servicetask223.js` | 223 | `CodColigada`, `idprj`, `CNOPB`, `filial`, `idmov2`, `dataDeCompetencia` | `wsDataServer.saveRecord("MOVMOVIMENTOTBCDATA", ...)` (grava `DTCOMPETENCIASERVICO` em `TMOVFISCAL`) | `CompetenciaAlterada = "1"` | `throw` com mensagem própria |
| `G12.servicetask233.js` | 233 | `CodColigada`, `idmov2`, `filial`, `historicoMovimento` | `wsDataServer.saveRecord("MovMovimentoTBCData", ...)` (grava `HISTORICOLONGO`) | — | `throw` se resposta contiver `Exception`/`Error` |

**Padrão comum de integração RM** (documentado em comentários dentro de `servicetask71.js` e replicado nos demais):
1. `ServiceManager.getService("wsProcess" | "wsDataServer")`
2. `.instantiate("com.totvs.WsProcess" | "com.totvs.WsDataServer")`
3. `.getRMIwsProcess()` / `.getRMIwsDataServer()`
4. Monta `properties` com `basic.authorization`, usuário/senha (`getConstante`), `disable.chunking`, `log.soap.messages`, `receive.timeout=180000`
5. `servico.getCustomClient(ws, properties, [])`
6. `authService.executeWithParams(...)` / `executeWithXmlParams(...)` / `saveRecord(...)` / `readRecord(...)`

---

## 6. Datasets (`datasets/*.js`)

> ⚠️ **[PRD 0.7] A pasta `datasets/` deste repositório está VAZIA.** Esta seção descreve os 13 datasets do repositório de **Homologação**, como referência. Nomes de consulta SQL, parâmetros e colunas **não foram verificados em produção** — podem divergir (inclusive o texto das consultas, que fica no RM). O que se sabe de produção: `G12-GED.js` é consumido pelo `beforeStateEntry.js` **e** pelo `buscarInfoGed()` do formulário (Adendo A2.3), como em homologação, mas o link de portal gerado usa o host de produção (cap. 0.5).

Todos seguem o mesmo esqueleto: `function createDataset(fields, constraints, sortFields)`, autenticação via `getAccess()` (lendo `dsTBCConnector`), chamada a `ServiceManager.getService("WSCONSSQL")` → `com.totvs.WsConsultaSQL` → `authService.realizarConsultaSQL(NOME_CONSULTA, 0, "F", PARAMS)`, e conversão do XML de retorno para JSON via `org.json.XML.toJSONObject`. Todos tratam o caso de registro único (`dados.isNull(0)`) vs. múltiplos registros, e todos expõem `retornarErro(...)` (dataset de erro com coluna `ERROR`) e `onMobileSync(user) {}` (vazio — sem sincronização mobile específica).

| Dataset | Consulta SQL nomeada no RM | Parâmetros obrigatórios | Colunas retornadas | Uso |
|---|---|---|---|---|
| `G12-CARREGAR-DADOS.js` | `G12FORMULARIO` | `CODCOLIGADA`, `IDMOV` | 60 colunas: identificação do projeto, contrato, prestador (GFILIAL), tomador (FCFO), local IBS (TMOV), item (TITMMOV), histórico, CNO/ART, valores originais | Carregamento inicial do formulário (`servicetask9`) e recarregado após faturamentos para atualizar `dataDeCompetencia` |
| `G12-CARREGAR-TRIBUTOS.js` | `G12Tributos` | `CODCOLIGADA`, `IDMOV` | `TRIBUTOS_NACIONAIS`, `IRRF_DO_ITEM`, `INSS_DO_ITEM`, `IRRF_DESCRICAO`, `IRRF_ALIQUOTA`, `TIPO_DE_PESSOA`, `INSS_DESCRICAO`, `INSS_ALIQUOTA` | Recarregado por `servicetask71/87/118/130` após qualquer ajuste de tributo |
| `G12-TRIBUTOS-MUNICIPAIS.js` | `G12TRIBUMUNICI` | `IDMOV`, `CODCOLIGADA`, `NOMEMUNICIPIO` | `TRIBUTOS_MUNICIPAIS`, `CODIGO_MUNICIPIO` | Recarregado por `servicetask71/108` |
| `G12-AJUSTAR-TRIBUTOS.js` | `G12AJUSTARTRIBU` | `CODCOLIGADA`, `IDMOV` | `CODIGO`, `TIPO` | Alimenta o campo *zoom* `impostos_selecao` (modal "Ajustar Tributos do Movimento") |
| `G12-CADASTRAR-TRIBUTO-MUNICIPAL.js` | `G12TRIBMUNIZOOM` | nenhum (sem constraints) | `CODIGO` | Alimenta o zoom de cadastro de tributo municipal |
| `G12-IRRF-ZOOM.js` | `G12IRRFZOOM` | nenhum | `CODIGO_IRRF`, `DESCRICAO_IRRF` | Zoom de seleção de IRRF (ajuste) |
| `G12-INSS-ZOOM.js` | `G12INSSZOOM` | nenhum | `CODIGO_INSS`, `DESCRICAO_INSS` | Zoom de seleção de INSS (ajuste) |
| `G12-EXERCICIO-FISCAL.js` | `G12EXERCICIOFISC` | `CODCOLIGADA` | `ID_EXERCICIO` | Usado por `servicetask71` para montar o XML de faturamento |
| `G12-MOVIMENTOS-2102.js` | `G12MOV02` | `IDMOV`, `CODCOLIGADA` | **Divergência de contrato interno**: colunas declaradas em `COLUNAS` são `IDMOV`/`CODCOLIGADA`, mas a função `buildRow` lê a chave `IDMOV_DESTINO` (não presente em `COLUNAS`) — ver seção 15 (risco) | Obtém o IDMOV do movimento 2.1.02 gerado a partir do 2.1.01 |
| `G12-INFO-NFSE.js` | `G12INFONFSE` | `IDMOV`, `CODCOLIGADA` | `DATA_EMISSAO`, `DATA_AUTORIZACAO`, `NUMERO_NFSE`, `CODIGO_VERIFICACAO` | Consultado por `servicetask78` após faturar o 2.2.01 |
| `G12-HISTORICO-NFSE.js` | `G12HISTORICONFS` | `IDMOV`, `CODCOLIGADA` | `HISTORICO`, `STATUS` | Consultado com retry por `servicetask193`/`servicetask200` |
| `G12-GED.js` | `G12GED` | `CODCOLIGADA`, `IDPRJ`, `IDCONTRATO`, `PERIODO`, `REVISAO` | `NOMEPASTA`, `CODDOCUMENTO`, `DESCRICAO` | Consultado por `beforeStateEntry.js`, alimenta `gedInfo` |
| `G12-PERIODOS-MEDICAO.js` | `G12PERIODOMED` | `IDMOV`, `CODCOLIGADA` | `PERIODOMED` | Consultado por `beforeStateEntry.js`, alimenta `periodoMedicao` (pré-requisito do `G12-GED`) |

### 6.1 Observações sobre as consultas SQL

- As consultas em si (`G12FORMULARIO`, `G12Tributos`, `G12TRIBUMUNICI`, etc.) são **objetos cadastrados no RM** (consultas SQL nomeadas via `WsConsultaSQL`) — o texto SQL **não está neste repositório** e não pôde ser analisado diretamente. Apenas os nomes, parâmetros de entrada e colunas de saída consumidas pelo Fluig puderam ser confirmados.
- Todas as chamadas usam o parâmetro fixo `"F"` (formato) e código de consulta `0` — não há paginação nem filtros adicionais visíveis no lado Fluig.
- Risco de performance/latência: cada troca de atividade relevante do processo (30 estados) dispara **duas consultas SQL adicionais** (`G12-PERIODOS-MEDICAO` + `G12-GED`) via `beforeStateEntry`, mesmo quando o usuário não vai interagir com a seção de anexos/GED naquele passo.

---

## 7. Formulário — `G12.html`

### 7.1 Estrutura geral

Documento HTML único (sem uso de templates Mustache, apesar da lib estar carregada), estilizado com `fluig-style-guide` e organizado em **painéis colapsáveis** (`panel panel-default`), cada um controlado por `displayFields.js` (mostrar/ocultar `div` por `id`, conforme a atividade atual).

### 7.2 Scripts carregados (ordem no `<head>`)
```
jquery.js, jquery-ui.min.js, mustache-min.js, lordicon.js (CDN),
fluig-style-guide.min.js,
G12-Carregamento.js, G12-Main.js, G12-Zoom.js, G12-NF-e.js,
G12-TabelaDeTributos.js, G12-TributosDoMovimento.js, G12-CalcularAjusteTributos.js,
G12-TributosMunicipaisFuncoesAuxiliares.js, G12-IRRF-INSS.js, G12-GED.js,
G12-Cno.js, G12-Toogle.js, G12-CheckBot.js, G12-Anexos.js, G12-Loading.js,
G12-ChecagemTransmissao.js
+ G12-Style.css
```
> `G12-Cno.js` e `G12-Loading.js` são carregados mas **não contêm código ativo** (ver seção 15).
>
> **Atualização (Adendo A2/A2.3):** o `<head>` também carrega hoje `/webdesk/vcXMLRPC.js` (habilita `DatasetFactory` no client-side, usado por `buscarInfoGed` em `G12-GED.js`) e os arquivos novos dos Adendos 1 e 2 — `G12.TemplateEmail.html` (template de e-mail, não é `<script>`), `G12-AnexosEmail.js`, `G12-ControleDeEtiquetas.js`, `G12-HistoricoMovimentos.js`. O `<body>` ganhou a `div#carregamentoG12` (splash screen — Adendo A2.4).

### 7.3 Seções (painéis) do formulário

| `div id` | Título | Campos-chave | Controlado por |
|---|---|---|---|
| `identificacaoProjetoDiv` | Identificação do Projeto | `coligada`, `filial`, `IDMOV_numero`, `idprj`, `cnpj`, `nome_filial`, `centro_de_custo`, `nome_centro_de_custo`, `codigo_do_projeto`, `descricao_projeto`, endereço do projeto, `art`, `cno` | `displayFields.js` |
| `detalhesContrato` | Detalhes do Contrato | `numero_contrato`, `tipo_contrato`, `numero_licitacao`, `codigo_cliente`, datas de contrato, `periodicidade_medicao`, `condicao_pagamento`, `nome_cliente`, `cnpjCliente`, produto, `valorBrutoOriginal`, `valorLiquidoOriginal` | `displayFields.js` |
| `historicoMovimento` | Histórico do movimento | `textarea historicoMovimento` | sempre visível; editável conforme `enableFields.js` (habilitado só na atividade 23) |
| `anexosRm` | Anexos | `div gedAnexos` (preenchido por `G12-GED.js`) | sempre visível |
| `aprovacaoSetorTecnico` | Aprovação do setor técnico | `textarea ajusteSetorTecnico` | habilitado somente na atividade 17 |
| `validacaoContratos` | Validação de contratos | `textarea ajusteContratosValidacao`, `input CNOPB` | habilitado somente na atividade 173; `CNOPB` obrigatório sob regra em `validateForm.js` |
| `tributacao` | Tributação | tabelas `tabelaTributosNacionais`/`tabelaTributosMunicipais` (geradas via JS), `dataDeCompetencia` | oculto nas atividades 17/173, visível a partir da 23 |
| `impostosajustaveis`, `cadastrotributosmunicipais`, `ajusteIrrf`, `ajusteInss`, `cadastrarIrrf`, `cadastrarInss` | 6 modais (`zoom-overlay`) de tabela pai/filho para ajuste/cadastro | tabelas dinâmicas Fluig (`wdkAddChild`), com campo `type="zoom"` ligado aos datasets de zoom (seção 6) | abertos/fechados por botões `onclick` (funções em `G12-TributosDoMovimento.js`, `G12-TributosMunicipaisFuncoesAuxiliares.js`, `G12-IRRF-INSS.js`) |
| `clienteFornecedor` | Cliente/Fornecedor | tabela de exibição `irrfInss` (montada por `G12-TabelaDeTributos.js`) | visível a partir da atividade 23 |
| `faturarNotas` | Faturar notas | `idmov2`, `ajusteContratos`, botão "Visualizar NFS-e" (`NFeModal.abrir()`) | visível a partir da atividade 23 |
| `erroEnvioDeNotasDiv` / `erroAutorizarNotas` | Erros de envio/autorização | `errorAoEnviarNotas`/`statusEnvio`, `errorAoAutorizarNotas`/`statusAutorizacao` | exibidos apenas nas atividades 150 e 158 respectivamente |
| `modalNFe` | Modal DANFSe (espelho de nota) | dezenas de `span`s preenchidos por `G12-NF-e.js` a partir dos campos ocultos do formulário | aberto via `NFeModal.abrir()` |
| `enviarNota` | Informações de envio da nota | `numeroNotas`, `codigoVerificacao`, `dataEmissao`, `dataAutorizacao`, `numeroIdmov2201`, upload de anexo `fnnotaFiscal` | visível apenas na atividade 61 |
| `checagemDeTransmissao` | Checagem de transmissão | botões `infoNfseCorretas`/`infoNfseErradas`, `financeiroReponsavel`/`tecnicoReponsavel`, `textarea ajusteTransmissao` | visível apenas na atividade 242 |
| `botChecagemInfo` | "Bot" flutuante de pendências | `img iconeChecagem`, `div inforChecagem` | sempre presente; alimentado por `G12-CheckBot.js` |

### 7.4 Campos ocultos (`type="hidden"`) relevantes

Praticamente todos os dados vindos do RM (prestador, tomador, tributação, local IBS, item, GED) são mantidos em **inputs ocultos** no topo do formulário — funcionam como "estado" client-side compartilhado entre os diversos arquivos `.js` (ex.: `tributosNacionais`, `tributosMunicipais`, `irrfDoItem`, `inssDoItem`, `gedInfo`, `periodoMedicao`, `atividade`, `infoTransmissaoCorreta`, `infoSetorAjuste`, `CompetenciaAlterada`).

---

## 8. JavaScript do Formulário — função por função

### 8.1 `G12-Main.js`
- `$(document).ready(...)`: dispara, em sequência, `exibirCarregamento()` *(novo — splash screen, Adendo A2.4)*, `dispararTributosTimeOut()`, `checkAllInfo()`, `competenciaMudou()`, `desabilitarParaAjuste()` e demais rotinas dos Adendos 1/2 (`desabilitarCampos`, `renderizarHistoricoMovimentos`, `checarNotaCancelada`, `restaurarAvisoVariacaoValor`, etc.).
- `$(document).on('change', 'input, select, textarea', ...)`: reexecuta `checkAllInfo()` a cada alteração de qualquer campo (recalcula o painel de pendências em tempo real).

### 8.2 `G12-Carregamento.js`
- `MAPA_CAMPOS`: dicionário coluna-do-dataset → id-do-campo-html (usado por `preencherFormulario`).
- `parseTributosNacionais(raw)` / `parseTributosMunicipais(raw)`: fazem *parsing* via regex de strings concatenadas vindas do RM no formato `"CODIGO: x - VALOR: y - ALIQUOTA: z - BASE: w | CODIGO: ..."` (nacionais) e `"CODIGO:x - ALIQUOTA:y - BASE REDUCAO ISS(%):z | ..."` (municipais).
- `renderizarTabelasTributacao(rawNac, rawMun, natureza)`: monta HTML de tabela Bootstrap para as duas listas de tributos e a natureza orçamentária.
- `preencherFormulario(ds)`: percorre `MAPA_CAMPOS` preenchendo os campos do formulário a partir de um dataset (usado num fluxo alternativo de carregamento client-side, função `carregarDadosContrato`); monta endereços compostos (rua+número+bairro) e chama `renderizarTabelasTributacao`.
- `mostrarErro(msg)` / `carregarDadosContrato(codColigada, idMov)`: chamam o dataset `G12-CARREGAR-DADOS` diretamente do client-side (via `DatasetFactory.getDataset`) — **rota alternativa** ao carregamento server-side feito por `servicetask9`.
- `onLoad()` / `onLoadView()` / `_renderizarVisuais(tentativas)`: hooks de carregamento do formulário; em modo de **visualização**, aguarda a restauração assíncrona dos campos pelo Fluig usando `numero_contrato` como sentinela, com até 8 tentativas de retry (500 ms cada, ~4 s no total) antes de desistir e renderizar mesmo assim.

### 8.3 `G12-TributosDoMovimento.js`
- `exibirTabelaAtualizarTributos()` / `esconderTabelaAtualizarTributos()`: toggle do modal de ajuste de tributos do movimento.
- `removerComAnimacao(botao)`: anima a remoção de uma linha da tabela filha (classe `card-removendo`, 400 ms) antes de chamar `fnWdkRemoveChild` (API nativa do Fluig para tabela pai/filho).

### 8.4 `G12-CalcularAjusteTributos.js`
- `ajustarValorTributo(campo)`: ao perder o foco do campo "Base de Cálculo" de uma linha da tabela de ajuste, lê a alíquota da mesma linha, calcula `valor = base * (aliquota/100)` (tratando vírgula decimal brasileira) e escreve o resultado formatado (4 casas decimais) no campo `valorImposto` correspondente.

### 8.5 `G12-TributosMunicipaisFuncoesAuxiliares.js`
- `exibirTabelaCdastrarMunicipais()` / `esconderTabelaCdastrarMunicipais()`: toggle do modal de tributo municipal.

### 8.6 `G12-IRRF-INSS.js`
- 6 funções de toggle (`exibir`/`esconder`) para as tabelas: ajuste de IRRF, ajuste de INSS, cadastro de IRRF, cadastro de INSS.
- `salvarIndex()` / `salvarIndexInss()`: contam quantas linhas existem na tabela de cadastro (`document.querySelectorAll`) e gravam o total nos campos ocultos `indexIrrCadastro`/`indexInssCadastro`, consumidos depois por `servicetask130`.

### 8.7 `G12-TabelaDeTributos.js`
- `CarregarTabelasDeTriutos()`: monta a tabela "Cliente/Fornecedor" (IRRF/INSS do item) e also re-renderiza as tabelas de tributos nacionais/municipais (mesma lógica de `G12-Carregamento.js`, duplicada aqui).
- `dispararTributosTimeOut()`: agenda `CarregarTabelasDeTriutos()` para 1s após o carregamento da página (dá tempo do DOM/campos ocultos serem restaurados pelo Fluig).

### 8.8 `G12-Zoom.js`
- `setSelectedZoomItem(selectedItem)`: callback padrão do componente `type="zoom"` do Fluig. Se o item selecionado pertence ao campo de ajuste de IRRF (`ajusteIrrfZoom`) ou INSS (`ajusteInssZoom`), copia código/descrição para os campos correspondentes. Caso não haja seleção, reagenda (`setTimeout` 1s) uma recarga do filtro do zoom `impostos_selecao___N` com os parâmetros `CODCOLIGADA`/`IDMOV` — comentário no código alerta que o Fluig converte `zoom` em `<select>` via WDK e por isso **não deve** ser filtrado por nome do input.

### 8.9 `G12-CheckBot.js`
- `checkAllInfo()`: função central de validação visual (não bloqueante) que:
  1. Percorre todos os `input` dentro de `#identificacaoProjetoDiv` e `#detalhesContrato` e lista, em HTML, os campos vazios.
  2. Regras específicas por atividade: na 173 (Paraíba), exige CNO ou CNOPB para os 12 centros de custo da lista fixa; na 23, exige `dataDeCompetencia` preenchida e não anterior à data atual (`valiodateCompetencia`); na 61, exige todos os campos de nota fiscal (número, código de verificação, datas, IDMOV 2.2.01, anexo da NFS-e).
  3. Após 1s (`setTimeout`), varre as linhas das tabelas de tributos nacionais/municipais já renderizadas no DOM e lista quaisquer valores vazios/zerados (`"0.0000"`, `"-"`, `"—"`).
  4. Escreve tudo em `#inforChecagem` (painel lateral flutuante).
- `valiodateCompetencia(data)`: compara a data de competência informada com "hoje" (ambas como string `pt-BR`), retornando `true` se a competência for anterior a hoje (comparação **lexicográfica de string**, não de data real — ver seção 15, risco).

### 8.10 `G12-GED.js`
- `buscarInfoGed()` *(novo — ver Adendo A2.3)*: consulta, no client-side, os datasets `G12-PERIODOS-MEDICAO` e `G12-GED` e grava `#periodoMedicao`/`#gedInfo` — os mesmos campos que `beforeStateEntry.js` já preenchia no servidor. Chamada em `$(document).ready` **antes** de `GED()`. Depende de `/webdesk/vcXMLRPC.js` (carregado no `<head>`).
- `GED()`: lê `gedInfo` (preenchido no servidor por `beforeStateEntry.js` **e/ou** no client-side por `buscarInfoGed`) e `periodoMedicao`, filtra as entradas cujo "código de pasta" contém o período atual, e monta cartões HTML com link direto para `.../portal/p/1/ecmnavigation?app_ecm_navigation_doc=<codigo>`. **[PRD 0.5] URL do portal Fluig hardcoded** — em produção: `https://gennesisengenharia160516.fluig.cloudtotvs.com.br:443/portal/p/1/ecmnavigation?...` (em homologação: `...160517...:1650`). Mesmo risco de portabilidade da seção 13.
- Executado 1s após o `document.ready`.

### 8.11 `G12-Cno.js`
- Conteúdo **inteiramente comentado** (função `checkOnCno()` desativada). Ver seção 15.

### 8.12 `G12-Toogle.js`
- `exibitInfo()`: abre/fecha o painel do bot (`#inforChecagem`) com animação `slideDown`/`slideUp`.
- `exibirEdicaoManual()`: remove o atributo `readonly` de todos os inputs dentro de `#enviarNota` (permite preenchimento manual da nota).
- `ajusteCompetencia()`: remove `readonly` do campo `dataDeCompetencia`.
- `pickerDate(campo)`: abre o calendário nativo do Fluig (`FLUIGC.calendar`) no campo de competência, a menos que ele esteja `readonly`.
- `competenciaMudou()`: apenas na atividade 23, se `dataDeCompetencia` já tiver valor e o aviso ainda não tiver sido inserido, insere uma mensagem "A data de competência já foi alterada!" abaixo do campo.
- `desabilitarParaAjuste()`: nas atividades 250 (ajuste financeiro) e 43 (retornar ao solicitante), força **todos** os `input/textarea/button/select` da página para somente leitura e estilo acinzentado (bloqueio total de edição do formulário nessas etapas).
- `desabilitarCampos()`: bloqueia os campos da checagem de transmissão fora da etapa ativa (Adendo A.2).
- `exibirCarregamento()` *(novo — ver Adendo A2.4)*: controla a splash screen `#carregamentoG12` — exibe no início e esconde no `window.load`, com tempo mínimo de 900 ms em tela e trava de segurança de 8 s.

### 8.13 `G12-CheckagemTransmissao.js`
- `selecionarBotaoTransmissao(botao)`: alterna visualmente entre os botões "Sim"/"Não" de `infoTransmissaoCorreta`; quando "Não" é selecionado, habilita os botões de setor responsável (financeiro/técnico) e o campo de descrição do ajuste; quando "Sim", desabilita-os (`pointer-events:none`).
- `selecionarBotaoTransmissaoSetor(botao)`: define `infoSetorAjuste` como `"financeiro"` ou `"tecnico"` conforme o botão clicado.

### 8.14 `G12-NF-e.js` (módulo `NFeModal`, IIFE)
- `CAMPO_MAP`: mapeia ~20 campos ocultos do formulário para `span`s do modal DANFSe.
- `lerCampo(fieldName)`: lê o valor de um campo, priorizando o valor "Zoom" (`[name='...ZoomValue']`) quando existir, com *fallback* para `select`/`input` comuns.
- `tabelaNacionaisHtml`/`tabelaMunicipaisHtml`: geram as tabelas de tributos dentro do modal.
- `preencherModal()`: executa o mapeamento simples, resolve o "local de prestação" (`codMuniIbs`/`codUfIbs`), faz o parsing dos tributos (reaproveitando `parseTributosNacionais`/`parseTributosMunicipais` definidos em `G12-Carregamento.js`), identifica PIS/COFINS pelo código dentro da lista de tributos nacionais, e preenche vários campos como **"—" (não disponível)** por não haver dado correspondente na consulta atual (ex.: total do serviço, ISSQN retido, total de retenções, valor líquido).
- `abrir()`/`fechar()`: controla a classe `.ativo` do overlay; fecha ao clicar fora ou pressionar `ESC`.
- `imprimir()`: abre uma nova janela com CSS de impressão embutido e chama `window.print()` após 400 ms.
- Exposto globalmente como `NFeModal` com API pública `abrir/fechar/imprimir/configurar`.

### 8.15 `G12-Anexos.js`
- `anexo(event)`: roteador de ações (`upload`/`viewer`/`download`/`delete`) baseado no atributo `data-acao` do botão clicado.
- `uploadFile(fileDescription, idInput)`: aciona o input de upload nativo da aba "Anexos" do Fluig (`#ecm-navigation-inputFile-clone`), com tratamento específico para IE9 (`WCMAPI.isIe9()`).
- Listener de `change` no input clonado do Fluig: remove um anexo pré-existente com a mesma descrição (evita duplicidade), grava o nome físico do arquivo no campo correspondente, e ajusta os botões (`delete`/`download` em modo `ADD`; `delete`/`viewer` em modo `MOD`).
- `viewerFile`/`downloadFile`/`removeFileConfirm`/`removeFile`: interagem com `parent.ECM.attachmentTable` e `parent.WKFViewAttachment` para visualizar, baixar (com confirmação via `FLUIGC.message.confirm`) ou remover anexos.
- `setFilePhisicalName`, `btnState`, `displayBtnFiles`, `invisibleBtnUpload`, `invalidFilesTable`, `invalidFile`, `hasFileFluig`: funções de apoio para sincronizar o estado visual dos botões com a existência real do anexo na aba do Fluig, e para validar (nos eventos de formulário, embora não referenciadas nos 3 hooks lidos) se um anexo referenciado no campo ainda existe fisicamente na aba.

### 8.16 `G12-Loading.js`
- Arquivo **vazio** (0 bytes). Carregado no `<head>` sem efeito algum.

### 8.17 `events/displayFields.js`
- Hook Fluig `displayFields(form, customHTML)`. Lê `WKNumState` (atividade atual) e o modo do formulário (`MOD`/`ADD`/`VIEW`). Para cada uma das 7 atividades relevantes (17, 173, 23, 150, 158, 61, 242), injeta um bloco `<script>` com chamadas jQuery `show()`/`hide()` para as 12 seções principais do formulário. Também injeta 3 funções globais úteis a todo o front-end: `getAtividade()`, `getMode()`, `getMobile()`.
- **[PRD 0.6] Bloco exclusivo de produção:** quando `mode == "VIEW"`, injeta também um `<script>` com `g12TravarView()` — no `$(document).ready` e de novo após 400 ms, adiciona `.g12-view-lock` a `.fluig-style-guide`, faz `disabled = true` + remove `href`/`tabindex` de todos os `button`/`a`/`input[type=button|submit]`, e marca todos os `input`/`select`/`textarea` não-hidden como `readonly` + `.campo-desabilitado` (`<select>` também `disabled`). Homologação não tem esse bloco.

### 8.18 `events/enableFields.js`
- Hook Fluig `enableFields(form)`. Desabilita (`form.setEnabled(..., false)`) campos específicos quando a atividade atual **não é** a correspondente: `ajusteSetorTecnico` (só ativo na 17), `ajusteContratosValidacao`/`CNOPB` (só na 173), campos de nota fiscal (só na 61), `ajusteContratos`/`historicoMovimento` (só na 23).
- **[PRD 0.6] Bloco exclusivo de produção:** quando `mode == "VIEW"`, percorre `form.getFields()` e chama `form.setEnabled(campo, false)` para **todos** os campos — reforço server-side do bloqueio de visualização. Homologação não tem esse bloco.

### 8.19 `events/validateForm.js`
- Hook Fluig `validateForm(form)`. Única regra: na atividade 173, se o centro de custo pertencer à lista de 12 códigos da Paraíba e nem `cno` nem `CNOPB` estiverem preenchidos, lança uma exceção (`throw`) com uma mensagem HTML estilizada (incluindo uma imagem de mascote hospedada em `i.imgur.com`) exigindo o preenchimento do CNOPB.

---

## 9. CSS — `G12-Style.css`

CSS puro (sem pré-processador), organizado em blocos temáticos. Em produção o arquivo tem ~1150 linhas (splash screen + bloco `.g12-view-lock`).

1. **Painéis principais** (`.panel-heading`/`.panel-body` do Fluig Style Guide) — gradiente azul `rgb(15,52,96)→rgb(26,95,168)→rgb(33,118,199)`.
2. **Modal DANFSe** (`.nfe-*`): overlay fixo em tela cheia, grid responsivo (`.nfe-grid-2/3/4`), estilos de impressão (`@media print`) que escondem cabeçalho/rodapé do modal e ajustam a tabela para impressão A4.
3. **Modais "zoom"** (`.zoom-overlay`, `.zoom-modal-*`): mesmo padrão visual de overlay, reaproveitado nos 6 modais de ajuste/cadastro de tributos.
4. **Ocultação de coluna interna do Fluig**: seletor `:first-child` em 6 tabelas específicas (`#tblajustarimpostos`, `#tblcadastrotributosmuni`, `#tblAjusteIrrf`, `#tblajusteInss`, `#tblcAdastrarIrrf`, `#tblCadastrarInss`) para esconder a coluna de ID interno que o Fluig injeta automaticamente em tabelas pai/filho.
5. **Cartões do GED** (`.ged-*`): layout de lista de documentos com ícone, nome (truncado com `ellipsis`) e botão de visualização.
6. **"Bot" de checagem** (`#botChecagemInfo`, `#cabecalhoBot` com animação `pulseColor` contínua, `#inforChecagem`): painel flutuante posicionado com `position: fixed` em unidades `vw/vh` (risco de responsividade — ver seção 15).
7. **Botões de checagem de transmissão** (`.botaoTransmissao`): efeito hover de elevação (`translateY(-5px) scale(1.10)`).
8. Media queries de responsividade (`max-width: 640px`) para o modal DANFSe e os cartões do GED.
9. **Splash screen** (Adendo A2.4): `#carregamentoG12` (`position: fixed`, tela cheia, `z-index: 100000`, texto "G12" 160 px cor `#1eaad9`) + keyframes `g12LoaderIn`/`g12LoaderOut`/`entradaSuave`.
10. **[PRD 0.6] Bloco `.g12-view-lock` (exclusivo de produção)**: `.g12-view-lock input/select/textarea` (fundo cinza, `pointer-events`, cursor `not-allowed`), `.g12-view-lock button/input[type=button|submit]/a[class*="btn"]` e `.g12-view-lock a:not([class*="btn"])` — reforço visual do bloqueio de modo VIEW injetado por `displayFields.js`/`enableFields.js`.

---

## 10. Integrações — Detalhamento

### 10.1 TOTVS RM via SOAP

| Serviço Fluig | Classe RM | Uso |
|---|---|---|
| `WSCONSSQL` | `com.totvs.WsConsultaSQL` | Todas as 13 consultas SQL nomeadas dos datasets (seção 6) |
| `wsProcess` | `com.totvs.WsProcess` | Ações complexas: `MovFaturamentoProc` (faturamento em cadeia), `MovCancelMovProc` (cancelamento), `FisNFSeEnvioData`/`MovEnviaNFSeMovAction` (envio de NFS-e), `FisNFSeRetornarNotasData`/`FisNFEMunicipalAction` (consulta de autorização/cancelamento) |
| `wsDataServer` | `com.totvs.WsDataServer` | CRUD direto: `saveRecord`/`readRecord` em `MovMovimentoTBCData` (tributos e histórico do movimento), `FisTrbMunicipioPrdData` (tributo municipal por produto), `EstPrdCfoDataBR` (IRRF/INSS por cliente×produto), `FinIRRFData`/`MovINSSData` (cadastro de novos IRRF/INSS), `PrjPrjData` (CNO do projeto), `MOVMOVIMENTOTBCDATA` (competência fiscal) |

Autenticação: **Basic Auth** com usuário/senha lidos de constantes (`ds_Constantes`: chaves `rm_usuario`/`rm_senha`) ou do dataset `dsTBCConnector` (usado apenas em `servicetask9` e nos datasets de consulta SQL) — ambos externos ao repositório.

### 10.2 Fluig — Datasets, ECM, GED, Anexos

- **Datasets**: mecanismo padrão do Fluig (`DatasetFactory`/`DatasetBuilder`) para expor dados a formulários e scripts de processo.
- **Anexos**: manipulados via API do Fluig no `parent` do iframe (`parent.ECM.attachmentTable`, `parent.WKFViewAttachment`, `parent.WCMAPI`).
- **GED**: acesso via URL direta ao módulo `ecmnavigation` do portal (não via API — simples link `<a>`).
- **Componente Zoom**: campo customizado do Fluig (`type="zoom"`, atributo `data-zoom` em JSON) que abre um seletor vinculado a um dataset (`datasetId`) com colunas configuráveis.
- **Tabela pai/filho (WDK)**: `wdkAddChild`/`fnWdkRemoveChild` — API nativa do Fluig para adicionar/remover linhas de tabelas dinâmicas dentro do formulário.

### 10.3 Recursos externos (fora do domínio Fluig/RM)

- `https://cdn.lordicon.com` — biblioteca de ícones animados (`<lord-icon>`), carregada via `<script src="https://cdn.lordicon.com/lordicon.js">` no `<head>` do formulário.
- `https://i.imgur.com/QMNgQ6x.png` (mascote de erro em `validateForm.js`) e `https://i.imgur.com/kFNXFlP.png` (ícone do bot em `G12.html`).
- Não foi identificado uso de LDAP, OAuth, JWT ou APIs REST externas no código analisado.

---

## 11. Fluxo Geral do Sistema (diagrama textual em camadas)

```
                 ┌────────────────────────────┐
                 │  Usuário (navegador/Fluig)  │
                 └──────────────┬─────────────┘
                                │  interage com
                                ▼
                 ┌────────────────────────────┐
                 │   Formulário G12.html       │
                 │  (jQuery + Fluig Style)     │
                 └──────────────┬─────────────┘
                                │  eventos DOM (change/click)
                                ▼
                 ┌────────────────────────────┐
                 │  JS client-side (18 arqs)   │  ── validações visuais, toggles,
                 │  forms/1276366 - G12/*.js   │     cálculos, modal NF-e, anexos
                 └──────────────┬─────────────┘
                                │  hAPI / DatasetFactory (server-side, mesma "camada" do Fluig)
                                ▼
                 ┌────────────────────────────┐
                 │  Eventos de Form. (hooks)   │  displayFields / enableFields / validateForm
                 └──────────────┬─────────────┘
                                │
                                ▼
                 ┌────────────────────────────┐
                 │   Motor de Processo (BPMN)  │  G12.process — states, gateways, links
                 └──────────────┬─────────────┘
                                │  dispara em cada estado
                                ▼
                 ┌────────────────────────────┐
                 │   Service Tasks (13 tasks)  │  workflow/scripts/*.js
                 └──────────────┬─────────────┘
                                │  SOAP (wsProcess / wsDataServer / WSCONSSQL)
                                ▼
                 ┌────────────────────────────┐
                 │        TOTVS RM (ERP)       │  movimentos, tributos, NFS-e, projeto
                 └──────────────┬─────────────┘
                                │  retorno XML → JSON
                                ▼
                 ┌────────────────────────────┐
                 │  Datasets (13 datasets)     │  datasets/*.js
                 └──────────────┬─────────────┘
                                │  hAPI.setCardValue / preencherFormulario
                                ▼
                 ┌────────────────────────────┐
                 │  Atualização da Interface   │  campos, tabelas, modal, bot de pendências
                 └────────────────────────────┘
```

---

## 12. Dependências e Recursos Externos

| Tipo | Item | Onde é usado |
|---|---|---|
| Biblioteca JS | jQuery / jQuery UI | Todo o front-end do formulário |
| Biblioteca JS | Mustache.js | Carregada no `<head>`, **nenhum uso encontrado** nos arquivos lidos (possível dependência não utilizada) |
| Framework CSS/JS | Fluig Style Guide (`fluig-style-guide.min.css/js`) | Estilo base de todos os painéis, botões, calendário (`FLUIGC.calendar`), toasts (`FLUIGC.toast`), confirmações (`FLUIGC.message.confirm`) |
| CDN externo | Lordicon (`cdn.lordicon.com/lordicon.js`) | Ícones animados em todos os cabeçalhos de painel |
| CDN externo | Imgur (`i.imgur.com`) | Duas imagens estáticas (mascote de erro e ícone do bot) |
| API Fluig | `DatasetFactory`, `DatasetBuilder`, `ConstraintType` | Datasets e leitura de dados dentro de scripts server-side |
| API Fluig | `hAPI` | Leitura/escrita de campos do card do processo (Service Tasks, `beforeStateEntry`) |
| API Fluig | `ServiceManager` | Instanciação dos webservices SOAP do RM |
| API Fluig (front-end) | `parent.ECM`, `parent.WKFViewAttachment`, `parent.WCMAPI`, `FLUIGC.*` | Anexos, calendário, mensagens |
| Motor de scripts | Rhino (JavaScript embutido na JVM do Fluig) | Todos os scripts server-side usam classes Java diretamente (`java.lang.String`, `java.text.SimpleDateFormat`, `java.util.ArrayList`, `java.lang.Thread.sleep`) |
| Ambiente de desenvolvimento | Eclipse + TOTVS Developer Studio (TDS), natureza `com.totvs.tds.ecm.designer.nature` | Estrutura de projeto (`.project`, `.jsdtscope`) |

---

## 13. Código Morto, Duplicações e Inconsistências

| Item | Local | Descrição |
|---|---|---|
| **[PRD] `datasets/` e `mechanisms/` vazios no export** | `datasets/`, `mechanisms/` | As duas pastas não vieram no export deste repositório. Cap. 4 e 6 descrevem os arquivos de homologação por referência (não verificados em produção). Ver caps. 0.7 e 16. |
| **[PRD] `servicetask223` sem checagem de erro do RM** | `workflow/scripts/G12.servicetask223.js` | Ao contrário de homologação, a versão de produção **não** inspeciona a resposta do RM em busca de `"Exception"/"Error"` após gravar `DTCOMPETENCIASERVICO`. Um erro textual do RM não interrompe o fluxo — só uma exceção Java lançada pelo `executeWithParams`. Ver cap. 0.3. |
| **Arquivo vazio** | `forms/1276366 - G12/G12-Loading.js` | 0 bytes; carregado no HTML sem nenhum efeito. |
| **Função vazia** *(novo, ver Adendo A.9)* | `forms/G12/G12-AnexosEmail.js` | Contém apenas `function AnexosEmail() {}`; carregada no HTML mas sem chamada em nenhum outro arquivo lido. |
| **Função nunca chamada** *(novo, ver Adendo A.1)* | `workflow/scripts/G12.servicetask410.js` | O corpo de `servicetask410` apenas declara uma função aninhada `servicetask404` (que atualizaria o histórico do movimento 2.2.01) e nunca a invoca — o estado 410 não executa nenhuma ação hoje. |
| **Campos hidden não lidos** *(novo, ver Adendo A.5)* | `historicoNumMov2201`, `historicoNumMov2102` | Gravados pelo formulário (`G12-HistoricoMovimentos.js`), mas não encontrados sendo lidos em nenhum outro arquivo — possíveis remanescentes de uma versão anterior da lógica de histórico, hoje substituída pelas listas acumuladas `historico2102`/`historico2201`. |
| **Função inteira comentada** | `forms/1276366 - G12/G12-Cno.js` | `checkOnCno()` totalmente desativada (mostrar/ocultar campo `CNOPB` por coligada+centro de custo); a exibição condicional de `CNOPB` hoje depende só de `enableFields.js`/`displayFields.js`. |
| **Mecanismo aparentemente não utilizado** | `mechanisms/G12-CONTRATOS-VALIDA.js` | Não referenciado por nenhuma atividade do BPMN analisado (`G12.process`); `G12-VALIDIACAO-CONTRATOS.js` é quem está de fato ligado à atividade 173/183. Pode ser resquício de uma versão anterior do processo. |
| **Regras de roteamento REATIVADAS** *(atualizado — ver Adendo A2.1)* | `mechanisms/G12-APROVACAO-ST.js` | O bloco de roteamento nominal por centro de custo, antes totalmente comentado, foi **reativado** (cabeçalho `@data 29/08/2026`). A atividade 17 volta a ser roteada por colaborador conforme `CodColigada` + `centro_de_custo`, com `else` de fallback (por coligada) para o usuário fixo `4ef20412-…`. Um ramo compara `CentroDeCusto == '02.06.01.0sergio4.003'` (string corrompida — nunca casa). **Sem `else` de topo:** `CodColigada` fora de `{1,2,3}` faz `resolve()` lançar erro e a atividade não é atribuída. |
| **Regras de roteamento ainda desativadas** | `mechanisms/G12-CONTRATOS-VALIDA.js` | Continua com o bloco de roteamento nominal comentado, retornando sempre o usuário fixo `4ef20412-…`. Além disso não é referenciado por nenhuma atividade do BPMN — `G12-VALIDIACAO-CONTRATOS.js` é quem está ligado às atividades 173/183 (e roteia por grupo). |
| **Mecanismos não referenciados no processo exportado** *(novo — ver Adendo A2.2)* | `mechanisms/G12-{CHECAGEM-DE-TRANSMISSAO, AGUARDANDORECEB, FATURAR-NOTAS, NFSE-TRANSMITIDA, AJUSTE-FINANCEIRO}.js` | Cinco mecanismos de atribuição por grupo adicionados em jul–ago/2026. Nenhum aparece como mecanismo de atividade em `G12.process` / `G12.ecm30.xml`; as atividades 23/61/62/242/250 seguem, no export atual, com o mecanismo `Usuário` (colleagueId fixo `4ef20412-…`). Aparentam estar preparados para uma versão futura do processo (ou já ligados no servidor Fluig e ainda não reexportados). `G12-FATURAR-NOTAS`/`-NFSE-TRANSMITIDA`/`-AJUSTE-FINANCEIRO` leem `CCcustoMEC` mas não o utilizam. |
| **Duplicação de lógica de renderização de tabelas de tributos** | `G12-Carregamento.js` (`preencherFormulario`/`renderizarTabelasTributacao`) vs. `G12-TabelaDeTributos.js` (`CarregarTabelasDeTriutos`) | As duas funções constroem HTML de tabela quase idêntico a partir dos mesmos campos ocultos; `CarregarTabelasDeTriutos` parece ser a versão "de produção" (chamada no `document.ready` via `dispararTributosTimeOut`), enquanto `preencherFormulario`/`carregarDadosContrato` parecem suportar uma rota alternativa client-side que não foi encontrada sendo chamada em nenhum evento do formulário lido. |
| **Possível inconsistência de dataset** | `datasets/G12-MOVIMENTOS-2102.js` | O array `COLUNAS` declara `IDMOV`/`CODCOLIGADA`, mas `buildRow` lê a chave `IDMOV_DESTINO`, que não está em `COLUNAS` nem é adicionada como coluna do dataset antes de `dataset.addRow`. Como o Fluig identifica colunas pelo índice posicional na hora de `addColumn`/`addRow`, isso é, na melhor hipótese, incoerente com a nomenclatura documentada no cabeçalho do arquivo, e no pior caso pode indicar que o valor de `IDMOV_DESTINO` nunca é de fato o esperado (a consulta `G12MOV02` pode não devolver essa coluna) — **não confirmável sem acesso à consulta SQL cadastrada no RM**. |
| **Nome de campo com capitalização divergente** | `G12.servicetask30.js` lê `hAPI.getCardValue("numeroMov")`; o campo HTML correspondente é `NumeroMov` (`id="NumeroMov"`, preenchido em `servicetask9` como `hAPI.setCardValue('NumeroMov', ...)`) | Divergência de capitalização entre gravação e leitura do mesmo campo lógico. Não foi possível confirmar neste repositório se o Fluig trata nomes de campo do card de forma case-insensitive; se não tratar, `servicetask30` sempre recebe `numeroMov` vazio/indefinido ao montar o XML de cancelamento. |
| **Validação de data por comparação de string** | `G12-CheckBot.js → valiodateCompetencia(data)` | Compara duas datas formatadas como string `pt-BR` (`dd/MM/aaaa`) usando o operador `<` de string, não conversão para `Date`/timestamp. Comparação lexicográfica de datas nesse formato não é equivalente à comparação cronológica real (ex.: "05/12/2026" vs "20/01/2026" pode comparar incorretamente dependendo dos dígitos), o que pode gerar falsos positivos/negativos no aviso de competência retroativa. |
| **Erro de digitação em nome de função** | `valiodateCompetencia` (deveria ser `validarCompetencia` ou similar) | Nome mantido conforme código-fonte. |
| **URL de ambiente hardcoded** | `G12-GED.js` | A URL de visualização de documento do GED contém o host fixo — **`gennesisengenharia160516.fluig.cloudtotvs.com.br:443` nesta versão de produção** (`...160517...:1650` em homologação). Impede portabilidade automática entre ambientes sem alteração manual do código. |
| **Parâmetros de contexto hardcoded nos Service Tasks de NFS-e** | `G12.servicetask148.js`, `G12.servicetask157.js` | Os payloads SOAP contêm valores fixos como `$CODCOLIGADA=3`, `$EXERCICIOFISCAL=7`, `$CODFILIAL=1`, hostname `DESKTOP-HBHNI5F`, IP `10.0.2.3` — aparentam ser resíduos de uma gravação/captura de payload real (via ferramenta de simulação do RM) reaproveitada como template, e não parâmetros dinamicamente calculados a partir do card do processo. Isso é um **risco potencial**: se esses valores fixos não corresponderem à coligada/exercício fiscal real do movimento sendo processado, o comportamento do RM ao processar a ação pode ser inconsistente com o restante do fluxo (que já obtém `exercicioFiscal` e `codColigada` corretamente do card). Não foi possível confirmar o impacto exato sem acesso ao ambiente RM. |
| **Bot flutuante com posicionamento em viewport units** | `G12-Style.css` (`#inforChecagem`, `#cabecalhoBot`, `#botChecagemInfo img`) | Uso de `vw`/`vh` fixos para popover flutuante pode se comportar de forma inconsistente em diferentes resoluções/zoom do navegador. |
| **Função `invalidFilesTable`/`invalidFile` (G12-Anexos.js)** | Definidas mas não encontradas sendo chamadas em nenhum dos arquivos lidos (`G12.html`, demais `.js`, hooks de evento) | Possível validação de anexos preparada para uso em `validateForm.js`, mas não conectada — `validateForm.js` hoje só valida o campo `CNOPB`. |

---

## 14. Pontos Críticos, Gargalos e Riscos (síntese)

1. **Concentração de responsabilidade (parcial — ver Adendo A2.1)**: desde 29/08/2026 a **aprovação técnica (17)** voltou a ser roteada por colaborador (`G12-APROVACAO-ST` reativado), mas com `else` de fallback para o usuário fixo `4ef20412-…` sempre que a coligada/centro de custo não casar com nenhum ramo — ou seja, todo centro de custo não mapeado ainda recai numa única pessoa. A **validação de contratos** via `G12-CONTRATOS-VALIDA.js` continua 100% concentrada no mesmo usuário fixo (mas esse mecanismo não é usado pelo BPMN; quem responde pela atividade 173/183 é `G12-VALIDIACAO-CONTRATOS`, que roteia por grupo). Risco operacional caso o usuário fixo fique indisponível e o movimento pertença a um centro de custo não mapeado.
2. **Latência por comunicação síncrona com o RM**: cada Service Task faz pelo menos uma chamada SOAP síncrona (`receive.timeout=180000` = 3 minutos configurados), e os Service Tasks de checagem de erro (`servicetask193`/`servicetask200`) fazem *polling* bloqueante com `Thread.sleep` (até 5 tentativas), o que mantém a instância do processo ocupada por vários segundos em cada passagem por essas atividades.
3. **Múltiplas consultas SQL redundantes por transição de estado**: `beforeStateEntry.js` roda em ~30 estados diferentes e sempre executa duas consultas (`G12-PERIODOS-MEDICAO` + `G12-GED`), mesmo que o usuário não abra a aba de Anexos naquele passo.
4. **Dependência de datasets/constantes externos não documentados no repositório** (`dsTBCConnector`, `ds_Constantes`) — qualquer mudança nesses objetos globais do Fluig impacta silenciosamente todos os scripts deste processo, sem que isso seja rastreável neste código-fonte.
5. **Parâmetros hardcoded em payloads SOAP de NFS-e** (seção 13) — risco de comportamento incorreto do RM em coligadas diferentes da `3`.
6. **Ausência de validação server-side abrangente**: `validateForm.js` só cobre a obrigatoriedade do CNOPB; toda a checagem de "campos obrigatórios" (`G12-CheckBot.js`) é **apenas visual/informativa** no client-side e não impede o avanço do processo caso o usuário ignore o painel de pendências.
7. **Regra de gateway 246 depende de dois campos preenchidos manualmente** (`infoTransmissaoCorreta`, `infoSetorAjuste`) sem valor padrão — se o usuário avançar sem selecionar nenhum botão de checagem de transmissão, nenhuma das três condições do gateway é satisfeita (comportamento resultante não determinável apenas pelo código; depende da configuração padrão do motor Fluig para gateways sem regra correspondida).
8. **[PRD] `servicetask223` sem checagem de erro do RM** (cap. 0.3): em produção, uma falha textual do RM ao gravar a data de competência passa despercebida — o fluxo segue como se tivesse dado certo. Homologação trata esse caso.
9. **[PRD] Camadas de dataset e mecanismo não versionadas neste repositório** (caps. 0.7 / 16): não há como auditar, a partir deste repositório, para quais grupos/usuários as atividades de produção são distribuídas nem o texto das consultas SQL — reexportar `datasets/` e `mechanisms/` do Fluig de produção antes de tratar este repositório como fonte da verdade.

---

## 15. Código morto / funções não utilizadas — ver seção 13 (consolidado ali para evitar duplicidade).

---

## 16. Limitações da Análise

Os itens abaixo **não puderam ser interpretados ou confirmados** a partir do código-fonte disponível neste repositório:

- **⚠️ [PRD] `datasets/` e `mechanisms/` vazios neste export.** Os 13 datasets e os mecanismos de atribuição **não vieram no export do repositório de produção**. Os capítulos 4 (Mecanismos) e 6 (Datasets) descrevem os arquivos do repositório de **Homologação** (estado em 02/09/2026), apenas como referência — **nada foi verificado no ambiente de produção**: nomes de grupo (`Pool:Group:...`), colleagueIds, texto e parâmetros das consultas SQL nomeadas, e a própria existência/versão de cada arquivo em produção podem divergir. Para uma documentação fiel dessas duas camadas em produção é necessário reexportá-las do Fluig de produção.
- **[PRD] Divergência de tamanho do `G12.ecm30.xml`**: o export de produção é ligeiramente menor que o de homologação (ex.: 175 vs 179 `automaticLink`, 6 vs 25 `appField`/`appKey`). Não foi possível determinar se isso reflete atividades/mapeamentos realmente ausentes em produção ou apenas um momento de export anterior. O conjunto de Service Tasks e sub-fluxos, esse sim, foi conferido como presente (arquivos `.js` em `workflow/scripts/`).
- **`workflow/.resources/PRODUCAO.ws.cache`** e **`PRODUCAO.ws.cache.bkp`**: arquivos binários de cache de WSDL do webservice do RM (produção). Não é texto/XML legível linha a linha; não foi decodificado.
- **`forms/1276366 - G12/.metadata`**: objeto Java serializado (`ObjectOutputStream`). Assinaturas visíveis no binário indicam um `FormularioServerDto`/`FormularioDto` apontando para o servidor `PRODUCAO`, serviço `DSG12`, arquivo principal `G12.html`, Form ID `1276366` — o restante não foi decodificado byte a byte.
- **Texto das consultas SQL nomeadas no RM** (`G12FORMULARIO`, `G12Tributos`, `G12TRIBUMUNICI`, `G12AJUSTARTRIBU`, `G12TRIBMUNIZOOM`, `G12IRRFZOOM`, `G12INSSZOOM`, `G12EXERCICIOFISC`, `G12MOV02`, `G12INFONFSE`, `G12HISTORICONFS`, `G12GED`, `G12PERIODOMED`): objetos cadastrados no RM, **não presentes neste repositório** — e, em produção, os próprios arquivos de dataset que os invocam também estão ausentes (ver acima).
- **Datasets globais `dsTBCConnector` e `ds_Constantes`**: não fazem parte deste repositório (são recursos configurados diretamente no ambiente Fluig); apenas seu uso (chaves lidas: `user`/`pass`, `rm_usuario`/`rm_senha`) pôde ser documentado.
- **Grupos e usuários Fluig** citados nos mecanismos (ex. `Pool:Group:G12-ANALISECONTRATOS-PB`, colleagueId `4ef20412-...`): a existência, composição atual e nomes reais desses grupos/usuários não podem ser confirmados a partir do código — apenas os identificadores literais usados.
- **`workflow/.resources/G12.png`** e **`G12.processimage.svg`**: renderizações gráficas do processo (imagem/SVG). Servem como referência visual complementar ao modelo textual do capítulo 3, mas não foram "lidas" como fonte de regras de negócio (o modelo semântico usado foi extraído da seção `bpmn2:*` do arquivo `G12.process`).
- **`forms/1276366 - G12/charging.gif`** (e os dois `wired-flat-*.gif`): imagens binárias na raiz da pasta do formulário; `charging.gif` não tem referência encontrada nos `.js`/`.html` — possível recurso órfão. Os `wired-flat-*.gif` são usados pelo `G12.html` (referência `Images/...` que, nesta versão de produção, não corresponde a uma subpasta — os arquivos estão na raiz).
- **Comportamento exato do motor Fluig** diante de gateways automáticos sem nenhuma condição satisfeita, tratamento de `throw` em Service Tasks (se gera reexecução automática, notificação, ou parada do processo), e semântica exata de `attempt`/`message` recebidos pelas funções `servicetaskNN(attempt, message)`: são comportamentos da **plataforma Fluig**, não do código deste projeto, e não foram documentados aqui por não serem observáveis no repositório.

---

## 17. Glossário

| Termo | Significado |
|---|---|
| **BPM** | Business Process Management — gestão de processos de negócio |
| **ECM** | Enterprise Content Management — módulo de gestão de conteúdo/documentos do Fluig (inclui o GED) |
| **Fluig** | Plataforma de portal/BPM/ECM da TOTVS |
| **RM** | TOTVS RM — sistema ERP integrado a este processo via SOAP |
| **G12** | Identificador do processo/formulário/dataset deste projeto ("Transmissão de notas") |
| **NFS-e** | Nota Fiscal de Serviço Eletrônica |
| **DANFSe** | Documento Auxiliar da NFS-e (o "espelho" visual da nota, reproduzido no modal `modalNFe`) |
| **CNO** | Cadastro Nacional de Obras (Receita Federal) |
| **CNOPB** | Campo específico do formulário para CNO de obras localizadas na Paraíba (regra de negócio própria do processo) |
| **CODCOLIGADA / coligada** | Identificador da empresa/coligada no RM |
| **IDMOV** | Identificador único de um movimento (documento fiscal/comercial) no RM |
| **IDPRJ** | Identificador do projeto no RM |
| **GFILIAL** | Tabela do RM referente à filial prestadora do serviço |
| **FCFO** | Tabela do RM referente ao cadastro de clientes/fornecedores (tomador do serviço) |
| **TMOV / TITMMOV** | Tabelas do RM referentes ao movimento e seus itens |
| **IBS** | Imposto sobre Bens e Serviços (referência de local de atuação tributária, campos `codMuniIbs`/`codUfIbs`) |
| **IRRF** | Imposto de Renda Retido na Fonte |
| **INSS** | Instituto Nacional do Seguro Social (contribuição previdenciária retida) |
| **ISS/ISSQN** | Imposto Sobre Serviços de Qualquer Natureza (tributo municipal) |
| **Dataset (Fluig)** | Objeto de acesso a dados usado por formulários/processos Fluig, implementado em JavaScript server-side (`DatasetFactory`/`DatasetBuilder`) |
| **Service Task** | Atividade automática do BPMN executada por um script server-side, sem interação humana |
| **Mechanism (mecanismo)** | Script Fluig que resolve dinamicamente para qual usuário/grupo uma atividade humana deve ser atribuída |
| **hAPI** | API Fluig disponível nos scripts de processo (Service Tasks, eventos) para ler/gravar valores do card |
| **Card** | Conjunto de valores (campos) de uma instância de processo Fluig, persistente entre atividades |
| **WDK** | Web Development Kit — camada de componentes dinâmicos do Fluig (tabelas pai/filho, zoom, etc.) |
| **Zoom (componente)** | Campo de formulário Fluig do tipo autocomplete/seleção vinculado a um dataset |
| **GED** | Gestão Eletrônica de Documentos — módulo de anexos/documentos do Fluig |
| **WSCONSSQL / wsProcess / wsDataServer** | Webservices SOAP do RM usados, respectivamente, para consultas SQL nomeadas, ações de processo complexas e CRUD direto de registros |
| **Graphiti / BPMN2 (XMI)** | Framework Eclipse usado pelo Fluig Process Designer para modelar e desenhar o processo; o arquivo `.process` é um documento XMI combinando o diagrama gráfico e o modelo semântico `bpmn2:*` |
| **Rhino** | Motor de execução JavaScript embutido na JVM, usado pelo Fluig para rodar os scripts server-side deste projeto |

---

## 18. Observações Finais

Esta documentação do ambiente de **Produção** é derivada da documentação técnica do `ProjetoG12Homologacao` (levantamento por leitura integral de código: 29/07/2026 + Adendos de 28/08 e 02/09/2026) e **conferida arquivo a arquivo contra o export do repositório `ProjetoG12Producao` de 28/08/2026**. O formulário, os hooks de evento, os Service Tasks, os eventos globais do processo e o modelo BPMN de produção foram lidos diretamente; as camadas de **dataset** e de **mecanismo de atribuição** não vieram no export e estão documentadas apenas por referência ao repositório de homologação (caps. 0.7 e 16).

Todas as divergências reais entre os dois ambientes estão consolidadas no **capítulo 0** e marcadas com **[PRD]** ao longo do texto. Toda afirmação sobre comportamento está ancorada em trecho de código; qualquer ponto não confirmável foi isolado no capítulo 16.

**Recomendação antes de tratar este repositório como fonte da verdade de produção:** reexportar do Fluig de produção as pastas `datasets/` e `mechanisms/`, e conferir se o `G12.ecm30.xml` está na versão mais recente do processo.
