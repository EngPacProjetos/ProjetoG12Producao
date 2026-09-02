function servicetask180(attempt, message) {

    /** * AUTHOR: ENOS DESENVOLVEDOR FLUIG/FULL STACK * CRIADO EM: 06/07/2026 * PROPOSITO: ALTERAR O CAMPO DE CNO DENTRO DO PROJETO NO RM PARA ENVIAR PARA PREFEITURA DE JOAO PESSOA VALIDAR DURANTE A TRANSMISSÃO DA NOTA */
    var codColigada = hAPI.getCardValue("CodColigada");
    var idPrj = hAPI.getCardValue("idprj");
    var cnopb = hAPI.getCardValue("CNOPB");
    var codFilial = hAPI.getCardValue("filial");

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


        if (codColigada == 2) {
            // XML PARA ATUALIZAR O CNO NO LUGAR DO CNPJ - PARAMETRIZACAO ERRADA NO MOMENTO 
            var xmlParams =
                "<PrjPrj>" +
                "<MPrj>" +
                "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                "<IDPRJ>" + idPrj + "</IDPRJ>" +
                "<CGC>" + cnopb + "</CGC>" +
                "</MPrj>" +
                "</PrjPrj>";

            log.info("G12 XML ENVIADO PARA ATUALIZAR CNO PB- > " + xmlParams);

            var resp = authService.saveRecord("PrjPrjData", xmlParams, contexto);

            log.info("G12 ATUALIZAR CNO PB - INFORMACAO RETORNADA DO RM " + resp);

            if (resp && String(resp).indexOf("Exception") !== -1) { throw new Error("Erro retornado pelo RM: " + resp); }
            if (resp && String(resp).indexOf("Error") !== -1) { throw new Error("Erro retornado pelo RM: " + resp); }

        } else {

            //  XML PARA ATUALIZAR O CNO NO LUGAR CORRETO DO PROJETO NO RM
            var xmlParams =
                "<PrjPrj>" +
                "<MPrj>" +
                "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                "<IDPRJ>" + idPrj + "</IDPRJ>" +
                "<CNOPRJ>" + cnopb + "</CNOPRJ>" +
                "</MPrj>" +
                "</PrjPrj>";

            log.info("G12 XML ENVIADO PARA ATUALIZAR CNO PB- > " + xmlParams);

            var resp = authService.saveRecord("PrjPrjData", xmlParams, contexto);

            log.info("G12 ATUALIZAR CNO PB - INFORMACAO RETORNADA DO RM " + resp);

            if (resp && String(resp).indexOf("Exception") !== -1) { throw new Error("Erro retornado pelo RM: " + resp); }
            if (resp && String(resp).indexOf("Error") !== -1) { throw new Error("Erro retornado pelo RM: " + resp); }
        }


    }
    catch (e) { log.error("### Erro: " + e); throw e; }
}


function getConstante(param) {
    var aConstraint = [];
    aConstraint.push(DatasetFactory.createConstraint('id', param, param, ConstraintType.MUST));
    var oConstantes = DatasetFactory.getDataset('ds_Constantes', null, null, null);
    for (var i = 0; i < oConstantes.rowsCount; i++) {
        if (oConstantes.getValue(i, "id").trim() == param.trim()) {
            return oConstantes.getValue(i, "Valor").trim();
        }
    }
    return '0';
}