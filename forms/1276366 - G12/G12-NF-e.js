var NFeModal = (function ($) {

  "use strict";

  // =================================================================
  // MAPA DE CAMPOS — chave = name/id do input hidden no formulário
  //                  valor = id do <span> dentro do modal NFS-e
  // Campos com lógica especial (tributos, endereços compostos, local)
  // são tratados em preencherModal() e não entram neste mapa.
  // =================================================================
  var CAMPO_MAP = {

    // --- CABEÇALHO ---
    chaveAcesso                   : "nfe-chave-acesso",
    numeroNFe                     : "nfe-numero",
    competenciaNFe                : "nfe-competencia",
    dataEmissaoNFe                : "nfe-data-emissao",

    // --- EMITENTE (Prestador — GFILIAL) ---
    cnpj                          : "nfe-emitente-cnpj",
    inscricaoMunicipalPrestador   : "nfe-emitente-im",
    nomeEmpresarialPrestador      : "nfe-emitente-nome",
    emailPrestador                : "nfe-emitente-email",
    enderecoPrestador             : "nfe-emitente-end",    // composto: rua + numero + bairro
    municipioPrestador            : "nfe-emitente-mun",   // cidade prestador
    cepPrestador                  : "nfe-emitente-cep",

    // --- TOMADOR (FCFO) ---
    cnpjCliente                   : "nfe-tomador-cnpj",
    incricaoTomador               : "nfe-tomador-im",
    telefoneTomador               : "nfe-tomador-tel",
    nomeEmpresarial               : "nfe-tomador-nome",
    emailTomador                  : "nfe-tomador-email",
    enderecoTomador               : "nfe-tomador-end",    // composto: rua + numero + bairro
    municipioTomador              : "nfe-tomador-mun",   // cidade tomador
    cepTomador                    : "nfe-tomador-cep",

    // --- SERVIÇO ---
    descricao_projeto             : "nfe-descricao-servico",

    // --- TRIBUTAÇÃO FEDERAL (valores diretos do item) ---
    irrfDoItem                    : "nfe-irrf",
    inssDoItem                    : "nfe-prev",

    // --- INFORMAÇÕES COMPLEMENTARES ---
    informacoesComplementaresNota : "nfe-inf-comp"
  };

  // =================================================================
  // UTILITÁRIOS
  // =================================================================

  function lerCampo(fieldName) {
    var $zoom = $("[name='" + fieldName + "ZoomValue']");
    if ($zoom.length && $zoom.val()) return $zoom.val();
    var $campo = $("[name='" + fieldName + "'], #" + fieldName);
    if (!$campo.length) return "";
    if ($campo.is("select")) return $campo.find("option:selected").text() || $campo.val() || "";
    return $campo.val() || "";
  }

  function preencherSpan(spanId, valor) {
    var $span = $("#" + spanId);
    if (!$span.length) return;
    $span.text(valor && String(valor).trim() ? String(valor).trim() : "—");
  }

  function preencherDiv(divId, htmlContent) {
    var $div = $("#" + divId);
    if (!$div.length) return;
    $div.html(htmlContent || "—");
  }

  function preencherMunicipio() {
    var nome = lerCampo("municipioPrestador") || lerCampo("cidadePrestador") || "";
    var $topo = $("#nfe-municipio-topo");
    if ($topo.length) {
      $topo.html(nome ? "<strong>Município de " + nome + "</strong>" : "—");
    }
  }

  // =================================================================
  // CONSTRUTORES DE TABELA (usados no modal)
  // Os parsers globais parseTributosNacionais() e parseTributosMunicipais()
  // são definidos em G12-Carregamento.js (carregado antes deste arquivo).
  // =================================================================

  function tabelaNacionaisHtml(tributos) {
    if (!tributos || !tributos.length) {
      return "<p style='margin:6px 0;color:#888;font-size:11px'>Nenhum tributo nacional registrado.</p>";
    }
    var h = "<table style='width:100%;border-collapse:collapse;font-size:11px'>";
    h += "<thead><tr style='background:#eef2f8'>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Código</th>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Valor</th>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Alíquota</th>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Base de Cálculo</th>" +
         "</tr></thead><tbody>";
    for (var i = 0; i < tributos.length; i++) {
      var t = tributos[i];
      h += "<tr>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.codigo   || "—") + "</td>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.valor    || "—") + "</td>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.aliquota || "—") + "</td>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.base     || "—") + "</td>" +
           "</tr>";
    }
    h += "</tbody></table>";
    return h;
  }

  function tabelaMunicipaisHtml(tributos) {
    if (!tributos || !tributos.length) {
      return "<p style='margin:6px 0;color:#888;font-size:11px'>Nenhum tributo municipal registrado.</p>";
    }
    var h = "<table style='width:100%;border-collapse:collapse;font-size:11px'>";
    h += "<thead><tr style='background:#eef2f8'>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Código</th>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Alíquota</th>" +
         "<th style='border:1px solid #ccc;padding:3px 6px'>Base Redução ISS (%)</th>" +
         "</tr></thead><tbody>";
    for (var i = 0; i < tributos.length; i++) {
      var t = tributos[i];
      h += "<tr>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.codigo   || "—") + "</td>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.aliquota || "—") + "</td>" +
           "<td style='border:1px solid #ddd;padding:3px 6px'>" + (t.fator    || "—") + "</td>" +
           "</tr>";
    }
    h += "</tbody></table>";
    return h;
  }

  // =================================================================
  // PREENCHIMENTO DO MODAL
  // =================================================================

  function preencherModal() {

    // 1. Mapa simples: lê campo do formulário → escreve no span do modal
    $.each(CAMPO_MAP, function (campo, spanId) {
      preencherSpan(spanId, lerCampo(campo));
    });

    // 2. Município no topo
    preencherMunicipio();

    // 3. Local de prestação: COD_MUNI_IBS / COD_UF_IBS
    var codMuni = lerCampo("codMuniIbs");
    var codUf   = lerCampo("codUfIbs");
    preencherSpan("nfe-local", [codMuni, codUf].filter(Boolean).join(" / "));

    // 4. Tributação — parse das strings concatenadas
    var rawNac = lerCampo("tributosNacionais");
    var rawMun = lerCampo("tributosMunicipais");
    var trNac  = (typeof parseTributosNacionais  === "function") ? parseTributosNacionais(rawNac)  : [];
    var trMun  = (typeof parseTributosMunicipais === "function") ? parseTributosMunicipais(rawMun) : [];

    // Código de tributação nacional/municipal (primeiro entry de cada lista)
    preencherSpan("nfe-ctn", trNac.length ? trNac[0].codigo : "—");
    preencherSpan("nfe-ctm", trMun.length ? trMun[0].codigo : "—");

    // Tributação municipal — valores do primeiro entry
    preencherSpan("nfe-valor-servico", trNac.length ? trNac[0].valor    : "—");
    preencherSpan("nfe-bc-issqn",      trNac.length ? trNac[0].base     : "—");
    preencherSpan("nfe-aliquota",      trMun.length ? trMun[0].aliquota : "—");
    preencherSpan("nfe-issqn-apurado", "—");

    // PIS / COFINS — identifica pelo código dentro da lista nacional
    var pisTrib = null, cofinsTrib = null;
    for (var i = 0; i < trNac.length; i++) {
      var cod = (trNac[i].codigo || "").toUpperCase();
      if (cod.indexOf("PIS") !== -1    && !pisTrib)    pisTrib    = trNac[i];
      if (cod.indexOf("COFINS") !== -1 && !cofinsTrib) cofinsTrib = trNac[i];
    }
    preencherSpan("nfe-pis",    pisTrib    ? pisTrib.valor    : "—");
    preencherSpan("nfe-cofins", cofinsTrib ? cofinsTrib.valor : "—");

    // Totais consolidados — não disponíveis diretamente na consulta
    preencherSpan("nfe-total-servico",   "—");
    preencherSpan("nfe-issqn-retido",    "—");
    preencherSpan("nfe-total-retencoes", "—");
    preencherSpan("nfe-valor-liquido",   "—");

    // Totais aproximados — texto resumido por lista
    preencherSpan("nfe-trib-fed", trNac.length ? trNac.length + " tributo(s) nacional(is)" : "—");
    preencherSpan("nfe-trib-mun", trMun.length ? trMun.length + " tributo(s) municipal(is)" : "—");
    preencherSpan("nfe-trib-est", "—");

    // 5. Tabelas detalhadas no modal
    preencherDiv("nfe-detalhe-tributos-nacionais",  tabelaNacionaisHtml(trNac));
    preencherDiv("nfe-detalhe-tributos-municipais", tabelaMunicipaisHtml(trMun));
  }

  // =================================================================
  // CONTROLE DO MODAL
  // =================================================================

  function abrir() {
    preencherModal();
    $("#modalNFe").addClass("ativo");
    $("body").css("overflow", "hidden");
  }

  function fechar() {
    $("#modalNFe").removeClass("ativo");
    $("body").css("overflow", "");
  }

  function imprimir() {
    var conteudo = document.getElementById("nfeDocumento").innerHTML;
    var win = window.open("", "_blank", "width=900,height=700");
    win.document.write([
      "<!DOCTYPE html><html><head>",
      "<meta charset='UTF-8'>",
      "<title>NFS-e</title>",
      "<style>",
      "  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 12px; }",
      "  .nfe-secao-titulo { background: #1a4f8a; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 10px; text-transform: uppercase; }",
      "  .nfe-grid-2 { display: grid; grid-template-columns: 1fr 1fr; }",
      "  .nfe-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; }",
      "  .nfe-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; }",
      "  .nfe-field { padding: 4px 10px; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; }",
      "  .nfe-field-label { font-size: 8.5px; color: #666; text-transform: uppercase; display: block; }",
      "  .nfe-field-value { font-size: 10.5px; display: block; }",
      "  .nfe-topo { display: grid; grid-template-columns: 180px 1fr 200px; border-bottom: 2px solid #1a4f8a; }",
      "  .nfe-topo > div { padding: 8px 10px; border-right: 1px solid #ccc; }",
      "  .nfe-topo-centro { text-align: center; font-weight: bold; color: #1a4f8a; font-size: 13px; }",
      "  .nfe-logo-sigla { font-size: 20px; font-weight: 900; color: #1a4f8a; }",
      "  .nfe-logo-sub { font-size: 8px; }",
      "  .nfe-destaque .nfe-field-value { font-size: 13px; color: #1a4f8a; font-weight: 800; }",
      "  .nfe-chave-acesso { padding: 5px 10px; border-bottom: 1px solid #ccc; }",
      "  .nfe-chave-acesso .nfe-field-value { font-family: monospace; letter-spacing: 1px; color: #1a4f8a; }",
      "  .nfe-secao { border-bottom: 1px solid #ccc; }",
      "  .nfe-detalhe-tributos { padding: 8px 10px; }",
      "  table { border-collapse: collapse; width: 100%; font-size: 10px; }",
      "  table th, table td { border: 1px solid #ccc; padding: 2px 6px; }",
      "  table thead tr { background: #eef2f8; }",
      "</style>",
      "</head><body>",
      conteudo,
      "</body></html>"
    ].join(""));
    win.document.close();
    win.focus();
    setTimeout(function () { win.print(); }, 400);
  }

  // Fechar ao clicar fora
  $(document).on("click", "#modalNFe", function (e) {
    if ($(e.target).is("#modalNFe")) fechar();
  });

  // Fechar com ESC
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" || e.keyCode === 27) fechar();
  });

  // =================================================================
  // API PÚBLICA
  // =================================================================
  return {
    abrir     : abrir,
    fechar    : fechar,
    imprimir  : imprimir,
    configurar: function (mapaExtra) {
      $.extend(CAMPO_MAP, mapaExtra || {});
    }
  };

})(jQuery);
