function servicetask9(attempt, message) {

    /***********************************************************************************************
 * @author      ENOS ROCHA - PROGRAMADOR FULL STACK
 * @data        18/05/2026
 * @Versao RM   12.1.2302.160
 * @Descricao   Carrega dados do contrato G12 via dataset G12-CARREGAR-DADOS
 *              e popula os campos do formulário via hAPI.setCardValue
 ***********************************************************************************************/

    try {
        // Nomes EXATOS que o RM envia — confirmados no log
        var codColigada = String(hAPI.getCardValue('CodColigada'));
        var idMov = String(hAPI.getCardValue('IdMov'));

        // hAPI.setCardValue("IdMov", idMov);

        log.info("[G12] CodColigada: " + codColigada);
        log.info("[G12] IdMov: " + idMov);

        loadDsG12(codColigada, idMov);

    } catch (e) {
        throw "Erro servicetask_g12: " + String(e) + " - Linha " + e.lineNumber;
    }


}

function loadDsG12(codColigada, idMov) {
    try {
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idMov, idMov, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-CARREGAR-DADOS", null, [c1, c2], null);

        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum dado retornado. CodColigada=" + codColigada + " IdMov=" + idMov);
            return;
        }

        // INFORMACOES DO PROJETO
        log.info("VALOR DO IDMOV -> " + dataset.getValue(0, "IDMOV"));
        hAPI.setCardValue('IDMOV_numero', safe(dataset.getValue(0, "IDMOV")));
        hAPI.setCardValue('NumeroMov', safe(dataset.getValue(0, "NUMERO_MOVIMENTO")));
        hAPI.setCardValue('coligada', safe(dataset.getValue(0, "COLIGADA")));
        hAPI.setCardValue('filial', safe(dataset.getValue(0, "FILIAL")));
        hAPI.setCardValue('idprj', safe(dataset.getValue(0, "IDPRJ")));
        hAPI.setCardValue('cnpj', safe(dataset.getValue(0, "CNPJ_EMPRESA")));
        hAPI.setCardValue('cnpjCliente', safe(dataset.getValue(0, "CNPJ_CLIENTE")));
        hAPI.setCardValue('centro_de_custo', safe(dataset.getValue(0, "CENTRO_DE_CUSTO")));
        hAPI.setCardValue('nome_centro_de_custo', safe(dataset.getValue(0, "NOME_CENTRO_DE_CUSTO")));
        hAPI.setCardValue('codigo_do_projeto', safe(dataset.getValue(0, "CODIGO_DO_PROJETO")));
        hAPI.setCardValue('descricao_projeto', safe(dataset.getValue(0, "DESCRICAO_PROJETO")));
        hAPI.setCardValue('rua_projeto', safe(dataset.getValue(0, "RUA_PROJETO")));
        hAPI.setCardValue('estado_projeto', safe(dataset.getValue(0, "ESTADO_PROJETO")));
        hAPI.setCardValue('cidade_projeto', safe(dataset.getValue(0, "CIDADE_PROJETO")));
        hAPI.setCardValue('complemento_projeto', safe(dataset.getValue(0, "COMPLEMENTO_PROJETO")));
        hAPI.setCardValue('bairro_projeto', safe(dataset.getValue(0, "BAIRRO_PROJETO")));
        hAPI.setCardValue('numero_endereco_projeto', safe(dataset.getValue(0, "NUMERO_ENDERECO_PROJETO")));
        hAPI.setCardValue('revisaoProjeto', safe(dataset.getValue(0, "REVISAO_PROJETO")));
        hAPI.setCardValue('codigoMunicipio', safe(dataset.getValue(0, "CODIGO_MUNICIPIO")));
        hAPI.setCardValue('valorBrutoOriginal', safe(dataset.getValue(0, "VALOR_BRUTO_ORIGINAL")));
        hAPI.setCardValue('valorLiquidoOriginal', safe(dataset.getValue(0, "VALOR_LIQUIDO_ORIGINAL")));
        hAPI.setCardValue('fiscalMedicao', safe(dataset.getValue(0, "FISCAL_MEDICAO")));

        hAPI.setCardValue('unidade_produto', safe(dataset.getValue(0, "UNIDADE_ITEM")));
        hAPI.setCardValue('quantidade_produto', safe(dataset.getValue(0, "QUANTIDADE_ITEM")));

        hAPI.setCardValue('cno', safe(dataset.getValue(0, "CNO")));
        hAPI.setCardValue('art', safe(dataset.getValue(0, "ART")));
        hAPI.setCardValue('IDPRD', safe(dataset.getValue(0, "IDPRD")));
        hAPI.setCardValue('coligadaCliente', safe(dataset.getValue(0, "COLIGADA_CLIENTE")));

        // CONTRATO
        hAPI.setCardValue('numero_contrato', safe(dataset.getValue(0, "NUMERO_CONTRATO")));
        hAPI.setCardValue('tipo_contrato', safe(dataset.getValue(0, "TIPO_CONTRATO")));
        hAPI.setCardValue('numero_licitacao', safe(dataset.getValue(0, "NUMERO_LICITACAO")));
        hAPI.setCardValue('codigo_cliente', safe(dataset.getValue(0, "CODIGO_CLIENTE")));
        hAPI.setCardValue('data_contrato', formatDate(safe(dataset.getValue(0, "DATA_CONTRATO"))));
        hAPI.setCardValue('data_inicio_contrato', formatDate(safe(dataset.getValue(0, "DATA_INICIO_CONTRATO"))));
        hAPI.setCardValue('data_termino', formatDate(safe(dataset.getValue(0, "DATA_TERMINO"))));
        hAPI.setCardValue('periodicidade_medicao', safe(dataset.getValue(0, "PERIODICIDADE_MEDICAO")));
        hAPI.setCardValue('condicao_pagamento', safe(dataset.getValue(0, "CONDICAO_PAGAMENTO")));
        hAPI.setCardValue('nome_produto', safe(dataset.getValue(0, "NOME_PRODUTO")));
        hAPI.setCardValue('codigo_produto', safe(dataset.getValue(0, "CODIGO_PRODUTO")));
        hAPI.setCardValue('idContrato', safe(dataset.getValue(0, "ID_CONTRATO")));


        // CAMPOS DO PRESTADOR
        hAPI.setCardValue('nomePrestador', safe(dataset.getValue(0, "NOME_PRESTADOR")));
        hAPI.setCardValue('nomeEmpresarialPrestador', safe(dataset.getValue(0, "NOME_PRESTADOR")));
        hAPI.setCardValue('incricaoPrestador', safe(dataset.getValue(0, "INCRICAO_PRESTADOR")));
        hAPI.setCardValue('inscricaoMunicipalPrestador', safe(dataset.getValue(0, "INCRICAO_PRESTADOR")));
        hAPI.setCardValue('telefonePrestador', safe(dataset.getValue(0, "TELEFONE_PRESTADOR")));
        hAPI.setCardValue('emailPrestador', safe(dataset.getValue(0, "EMAIL_PRESTADOR")));
        hAPI.setCardValue('ruaPrestador', safe(dataset.getValue(0, "RUA_PRESTADOR")));
        hAPI.setCardValue('numeroPrestador', safe(dataset.getValue(0, "NUMERO_PRESTADOR")));
        hAPI.setCardValue('bairroPrestador', safe(dataset.getValue(0, "BAIRRO_PRESTADOR")));
        hAPI.setCardValue('cidadePrestador', safe(dataset.getValue(0, "CIDADE_PRESTADOR")));
        hAPI.setCardValue('estadoPrestador', safe(dataset.getValue(0, "ESTADO_PRESTADOR")));
        hAPI.setCardValue('cepPrestador', safe(dataset.getValue(0, "CEP_PRESTADOR")));
        hAPI.setCardValue('nome_filial', safe(dataset.getValue(0, "NOME_FANTASIA")));

        // CAMPOS DO PRESTADOR - ENDERECO
        var endPrestador = joinNonEmpty([
            safe(dataset.getValue(0, "RUA_PRESTADOR")),
            safe(dataset.getValue(0, "NUMERO_PRESTADOR")),
            safe(dataset.getValue(0, "BAIRRO_PRESTADOR"))
        ], ", ");
        hAPI.setCardValue('enderecoPrestador', endPrestador);
        hAPI.setCardValue('municipioPrestador', safe(dataset.getValue(0, "CIDADE_PRESTADOR")));

        // CAMPOS DO TOMADOR
        hAPI.setCardValue('incricaoTomador', safe(dataset.getValue(0, "INSCRICAO_TOMADOR")));
        hAPI.setCardValue('telefoneTomador', safe(dataset.getValue(0, "TELEFONE_TOMADOR")));
        hAPI.setCardValue('nomeEmpresarial', safe(dataset.getValue(0, "NOME_TOMADOR")));
        hAPI.setCardValue('nome_cliente', safe(dataset.getValue(0, "NOME_TOMADOR")));
        hAPI.setCardValue('emailTomador', safe(dataset.getValue(0, "EMAIL_TOMADOR")));
        hAPI.setCardValue('ruaTomador', safe(dataset.getValue(0, "RUA_TOMADOR")));
        hAPI.setCardValue('numeroTomador', safe(dataset.getValue(0, "NUMERO_TOMADOR")));
        hAPI.setCardValue('bairroTomador', safe(dataset.getValue(0, "BAIRRO_TOMADOR")));
        hAPI.setCardValue('cidadeTomador', safe(dataset.getValue(0, "CIDADE_TOMADOR")));
        hAPI.setCardValue('cepTomador', safe(dataset.getValue(0, "CEP_TOMADOR")));

        hAPI.setCardValue("dataDeCompetencia", safe(dataset.getValue(0, "DATA_DE_COMPETENCIA")));

        // CAMPOS DO TOMADOR PARA NF
        var endTomador = joinNonEmpty([
            safe(dataset.getValue(0, "RUA_TOMADOR")),
            safe(dataset.getValue(0, "NUMERO_TOMADOR")),
            safe(dataset.getValue(0, "BAIRRO_TOMADOR"))
        ], ", ");
        hAPI.setCardValue('enderecoTomador', endTomador);
        hAPI.setCardValue('municipioTomador', safe(dataset.getValue(0, "CIDADE_TOMADOR")));

        // LOCAL DE ATUACAO 
        hAPI.setCardValue('codMuniIbs', safe(dataset.getValue(0, "COD_MUNI_IBS")));
        hAPI.setCardValue('codUfIbs', safe(dataset.getValue(0, "COD_UF_IBS")));

        // ITEM
        hAPI.setCardValue('unidadeItem', safe(dataset.getValue(0, "UNIDADE_ITEM")));
        hAPI.setCardValue('quantidadeItem', safe(dataset.getValue(0, "QUANTIDADE_ITEM")));
        hAPI.setCardValue('valor_item', safe(dataset.getValue(0, "VALOR_ITEM")));

        // Seção 7 — Tributação
        // hAPI.setCardValue('tributosNacionais',   safe(dataset.getValue(0, "TRIBUTOS_NACIONAIS")));
        // hAPI.setCardValue('naturezaOrcamentaria',safe(dataset.getValue(0, "NATUREZA_ORCAMENTARIA")));
        // hAPI.setCardValue('irrfDoItem',          safe(dataset.getValue(0, "IRRF_DO_ITEM")));
        // hAPI.setCardValue('inssDoItem',          safe(dataset.getValue(0, "INSS_DO_ITEM")));
        // hAPI.setCardValue('tributosMunicipais',  safe(dataset.getValue(0, "TRIBUTOS_MUNICIPAIS")));

        // Seção 8 — Histórico (TMOVHISTORICO)
        hAPI.setCardValue('informacoesComplementaresNota', safe(dataset.getValue(0, "INFORMACOES_COMPLEMENTARES_NOTA")));
        hAPI.setCardValue('historicoMovimento', safe(dataset.getValue(0, "INFORMACOES_COMPLEMENTARES_NOTA")));

        log.info("[G12] Todos os campos preenchidos com sucesso para IdMov=" + idMov);

    } catch (e) {
        throw "Erro loadDsG12: " + String(e) + " - Linha " + e.lineNumber;
    }
}

function joinNonEmpty(parts, separator) {
    var result = [];
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] && parts[i] !== "") result.push(parts[i]);
    }
    return result.join(separator);
}

function safe(valor) {
    log.info("VALOR DO IDMOV QUE ENTROU DENTRO DO CAMPO DE VALIDACAO DE CARREGAMENTO" + valor)
    if (valor == null || valor == undefined) return "";
    var s = String(valor).trim();
    return (s == "null" || s == "undefined") ? "" : s;
}

function formatDate(rawDate) {
    if (!rawDate || rawDate == "") return "";
    try {
        var inputFormat = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        var outputFormat = new java.text.SimpleDateFormat("dd/MM/yyyy");
        return outputFormat.format(inputFormat.parse(rawDate));
    } catch (e) {
        return rawDate;
    }
}