function servicetask87(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idmov = hAPI.getCardValue("idmov2");
    var codFilial = hAPI.getCardValue("filial") || "1";


    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("[G12-AjustarTributos] Iniciando - CODCOLIGADA=" + codColigada + " IDMOV=" + idmov);

    var tributosFormulario = {};
    var i = 1;

    while (true) {
        var sufixo = "___" + i;
        var codtrbN = hAPI.getCardValue("impostos_selecao" + sufixo);

        if (codtrbN == null || codtrbN == "" || codtrbN == "null" || codtrbN == undefined) break;

        var valorN = hAPI.getCardValue("valorImposto" + sufixo);
        var aliqN = hAPI.getCardValue("aliquota" + sufixo);
        var baseN = hAPI.getCardValue("baseCalculo" + sufixo);

        tributosFormulario[String(codtrbN).trim()] = {
            valor: valorN ? String(valorN).replace(",", ".") : "0.0000",
            aliquota: aliqN ? String(aliqN).replace(",", ".") : "0.0000",
            basecalculo: baseN ? String(baseN).replace(",", ".") : "0.0000"
        };

        log.info("[G12-AjustarTributos] Tributo do formulario: " + String(codtrbN).trim() + " = " + JSON.stringify(tributosFormulario[String(codtrbN).trim()]));

        i++;
        if (i > 50) break;
    }

    log.info("[G12-AjustarTributos] Total tributos formulario: " + Object.keys(tributosFormulario).length);

    if (Object.keys(tributosFormulario).length === 0) {
        log.warn("[G12-AjustarTributos] Nenhum tributo encontrado. Abortando.");
        return;
    }

    function formatarParaRM(valor) {
        return String(valor).replace(".", ",");
    }

    try {
        var servico = ServiceManager.getService("RMWsDataServer");
        var instancia = servico.instantiate("com.totvs.WsDataServer");
        var ws = instancia.getRMIwsDataServer();

        var properties = {};
        properties['basic.authorization'] = 'true';
        properties['basic.authorization.username'] = usuario_rm;
        properties['basic.authorization.password'] = senha_rm;
        properties['disable.chunking'] = 'true';
        properties['log.soap.messages'] = 'true';
        properties['receive.timeout'] = '180000';

        var authService = servico.getCustomClient(ws, properties, []);
        var contexto = "CODCOLIGADA=" + codColigada + ";CODFILIAL=" + codFilial + ";CODSISTEMA=T;CODUSUARIO=fluig";

        log.info("[G12-AjustarTributos] Fazendo ReadRecord...");
        var xmlAtual = authService.readRecord("MovMovimentoTBCData", codColigada + ";" + idmov, contexto);
        log.info("[G12-AjustarTributos] ReadRecord OK");

        var xmlStr = String(xmlAtual);
        var xmlTributos = "";

        function extrair(tag, texto) {
            var r = new RegExp("<" + tag + ">([^<]*)<\\/" + tag + ">");
            var m = r.exec(texto);
            return m ? m[1].trim() : "";
        }

        var regexBloco = /<TTRBITMMOV>([\s\S]*?)<\/TTRBITMMOV>/g;
        var match;

        while ((match = regexBloco.exec(xmlStr)) !== null) {
            var bloco = match[1];

            var codtrb = extrair("CODTRB", bloco);
            var basecalculo = extrair("BASEDECALCULO", bloco);
            var aliquota = extrair("ALIQUOTA", bloco);
            var valor = extrair("VALOR", bloco);
            var editado = extrair("EDITADO", bloco) || "0";
            var tiporecolh = extrair("TIPORECOLHIMENTO", bloco);
            var extras = tiporecolh ? "<TIPORECOLHIMENTO>" + tiporecolh + "</TIPORECOLHIMENTO>" : "";

            log.info("[G12-AjustarTributos] Tributo lido: " + codtrb + " base=" + basecalculo + " aliq=" + aliquota + " valor=" + valor);

            if (tributosFormulario[codtrb]) {
                basecalculo = tributosFormulario[codtrb].basecalculo;
                aliquota = tributosFormulario[codtrb].aliquota;
                valor = tributosFormulario[codtrb].valor;
                editado = "1";
                log.info("[G12-AjustarTributos] Atualizando tributo: " + codtrb);
            }

            xmlTributos +=
                "<TTRBITMMOV>" +
                "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                "<IDMOV>" + idmov + "</IDMOV>" +
                "<NSEQITMMOV>1</NSEQITMMOV>" +
                "<CODTRB>" + codtrb + "</CODTRB>" +
                "<BASEDECALCULO>" + formatarParaRM(basecalculo) + "</BASEDECALCULO>" +
                "<ALIQUOTA>" + formatarParaRM(aliquota) + "</ALIQUOTA>" +
                "<VALOR>" + formatarParaRM(valor) + "</VALOR>" +
                "<EDITADO>" + editado + "</EDITADO>" +
                extras +
                "</TTRBITMMOV>";
        }

        log.info("[G12-AjustarTributos] xmlTributos montado: " + xmlTributos);

        var xmlFinal =
            "<MovMovimento>" +
            "<TMOV>" +
            "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
            "<IDMOV>" + idmov + "</IDMOV>" +
            "<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>" +
            "</TMOV>" +
            xmlTributos +
            "</MovMovimento>";

        var resultado = authService.saveRecord("MovMovimentoTBCData", xmlFinal, contexto);
        log.info("[G12-AjustarTributos] Resultado SaveRecord: " + resultado);


         if (resultado && String(resultado).indexOf("Exception") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

        if (resultado && String(resultado).indexOf("Error") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

    } catch (e) {
        log.error("[G12-AjustarTributos] Erro: " + String(e));
        throw e;
    }


    try {

        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idmov, idmov, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-CARREGAR-TRIBUTOS", null, [c1, c2], null);


        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum tributo retornado. CodColigada=" + codColigada + " IdMov2=" + idmov);
            return;
        }


        hAPI.setCardValue('tributosNacionais', safe(dataset.getValue(0, "TRIBUTOS_NACIONAIS")));
        hAPI.setCardValue('naturezaOrcamentaria', safe(dataset.getValue(0, "NATUREZA_ORCAMENTARIA")));
        hAPI.setCardValue('irrfDoItem', safe(dataset.getValue(0, "IRRF_DO_ITEM")));
        hAPI.setCardValue('inssDoItem', safe(dataset.getValue(0, "INSS_DO_ITEM")));
        // hAPI.setCardValue('tributosMunicipais', safe(dataset.getValue(0, "TRIBUTOS_MUNICIPAIS")));


    } catch (e) {
        log.error("### Erro ao carregar impostos nacionais e municipias do dataset ->  " + e);
        throw e;
    }

}

function getConstante(param) {
    var oConstantes = DatasetFactory.getDataset('ds_Constantes', null, null, null);
    for (var i = 0; i < oConstantes.rowsCount; i++) {
        if (oConstantes.getValue(i, "id").trim() == param.trim()) {
            return oConstantes.getValue(i, "Valor").trim();
        }
    }
    return '0';
}

function guardarXMLExemplo() {
    var xmlexemplo =
        "<FisTrbMunicipioPrd>" +
        " < DTrbMunicipioPrd >" +
        "<CODCOLIGADA>2</CODCOLIGADA>" +
        "<CODMUNICIPIO>123456</CODMUNICIPIO>" +
        "<CODETDMUNICIPIO>MG</CODETDMUNICIPIO>" +
        "<CODTRB>ISS</CODTRB>" +
        "<IDPRD>100</IDPRD>" +
        "<ALIQUOTA>5.00</ALIQUOTA>" +
        "</DTrbMunicipioPrd >" +
        "</FisTrbMunicipioPrd > "
}