function servicetask343(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idPrj = hAPI.getCardValue("idprj");
    var cnopb = hAPI.getCardValue("CNOPB");
    var codFilial = hAPI.getCardValue("filial");
    var idmovMovimento02 = hAPI.getCardValue("historico2102").split(",").pop().trim();
    var dataDeCompetencia = hAPI.getCardValue("dataDeCompetenciaSub");

    log.info("### INICIANDO SERVIÇO DE ATUALIZAÇÃO DE CNO PB NO RM ###");

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("CODCOLIGADA: " + codColigada + " | IDPRJ: " + idPrj + " | CNOPB: " + cnopb + " | CODFILIAL: " + codFilial);

    try { /* */ var servico = ServiceManager.getService("RMWsDataServer");
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

        log.info("### Servico OK, executando atualização de nota fiscal");

        var xml = '<MovMovimento>' +
            '<TMOV> ' +
            '<CODCOLIGADA>' + codColigada + '</CODCOLIGADA>' +
            '<IDMOV>' + idmovMovimento02 + '</IDMOV>' +
            '</TMOV>' +
            '<TMOVFISCAL>' +
            '<CODCOLIGADA>' + codColigada + '</CODCOLIGADA>' +
            '<IDMOV>' + idmovMovimento02 + '</IDMOV>' +
            '<DTCOMPETENCIASERVICO>' + dataDeCompetencia + '</DTCOMPETENCIASERVICO>' +
            '</TMOVFISCAL>' +
            '</MovMovimento>';

        var resultado = authService.saveRecord("MOVMOVIMENTOTBCDATA", xml, contexto);

        log.info("[G12-AJUSTAR-COMPETENCIA] Resultado " + ": " + resultado);


        if (resultado && String(resultado).indexOf("Exception") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

        if (resultado && String(resultado).indexOf("Error") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

    } catch (error) {
        log.error("ERRO AO JUSTAR COMPETENCIA:  " + error)
        throw ("ERRO AO JUSTAR COMPETENCIA:  " + error);
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

