function beforeStateEntry(sequenceId) {


    if (sequenceId == 17 || sequenceId == 173 || sequenceId == 23 || sequenceId == 61 || sequenceId == 62 ||
        sequenceId == 13 || sequenceId == 180 || sequenceId == 183 || sequenceId == 71 || sequenceId == 74 ||
        sequenceId == 148 || sequenceId == 193 || sequenceId == 150 || sequenceId == 157 || sequenceId == 158 ||
        sequenceId == 200 || sequenceId == 78 || sequenceId == 81 || sequenceId == 43 || sequenceId == 87 ||
        sequenceId == 108 || sequenceId == 118 || sequenceId == 130 || sequenceId == 223 || sequenceId == 222 ||
        sequenceId == 129 || sequenceId == 117 || sequenceId == 107 || sequenceId == 90 || sequenceId == 30 ||
        sequenceId == 32) {

        var codColigada = hAPI.getCardValue("CodColigada");
        var idprj = hAPI.getCardValue("idprj");
        var idmov = hAPI.getCardValue("IdMov");
        var idContrato = hAPI.getCardValue("idContrato");
        var revisao = hAPI.getCardValue("revisaoProjeto");
        var periodoMedicaoFinal;

        log.info("COLIGADA GED - > " + codColigada);
        log.info("IDPRJ DO GED - > " + idprj);
        log.info("IDMOV DO GED - > " + idmov);
        log.info("ID DO CONTRATO DO GED - > " + idContrato);
        log.info("REVISAO DO GED - > " + revisao);
        log.info("PERIODO DO GED - > " + (periodoMedicaoFinal || "0"));




        try {
            var c1 = DatasetFactory.createConstraint("IDMOV", idmov, idmov, ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);



            var dataset = DatasetFactory.getDataset("G12-PERIODOS-MEDICAO", null, [c1, c2], null);


            if (dataset == null || dataset.rowsCount == 0) {
                log.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idmov=" + idmov + " idContrato=" + idContrato);
                return;
            }

            for (var index = 0; index < dataset.rowsCount; index++) {
                periodoMedicaoFinal = safe(dataset.getValue(index, "PERIODOMED"));




            }

            hAPI.setCardValue("periodoMedicao", periodoMedicaoFinal);



        } catch (error) {
            log.error("G12-GED - > ERRO AO BUSCAR O PERIODO DE MEDICAO DO CONTRATO PARA BUSCA NO GED")
            throw error;
        }

        try {


            var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
            var c2 = DatasetFactory.createConstraint("IDPRJ", idprj, idprj, ConstraintType.MUST);
            var c3 = DatasetFactory.createConstraint("IDCONTRATO", idContrato, idContrato, ConstraintType.MUST);
            var c4 = DatasetFactory.createConstraint("PERIODO", periodoMedicaoFinal, periodoMedicaoFinal, ConstraintType.MUST);
            var c5 = DatasetFactory.createConstraint("REVISAO", revisao, revisao, ConstraintType.MUST);


            log.info("COLIGADA GED 2 - > " + codColigada);
            log.info("IDPRJ DO GED 2 - > " + idprj);
            log.info("IDMOV DO GED 2 - > " + idmov);
            log.info("ID DO CONTRATO DO GED 2 - > " + idContrato);
            log.info("REVISAO DO GED 2 - > " + revisao);
            log.info("PERIODO DO GED 2 - > " + (periodoMedicaoFinal || "0"));

            var valoresGuardados = new Array();

            var dataset = DatasetFactory.getDataset("G12-GED", null, [c1, c2, c3, c4, c5], null);


            if (dataset == null || dataset.rowsCount == 0) {
                log.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idprj=" + idprj + " idContrato=" + idContrato + " periodo=" + periodoMedicaoFinal);
                return;
            }

            for (var index = 0; index < dataset.rowsCount; index++) {
                var nomePasta = safe(dataset.getValue(index, "NOMEPASTA"));
                var codigoDocumento = safe(dataset.getValue(index, "CODDOCUMENTO"));
                var descricao = safe(dataset.getValue(index, "DESCRICAO"));

                var info = nomePasta + "|" + codigoDocumento + "|" + descricao

                valoresGuardados.push(info);

            }

            hAPI.setCardValue("gedInfo", valoresGuardados.join(";"));


        } catch (error) {
            log.error("G12-GED - > ERRO AO BUSCAR OS DADOS")
            throw error;
        }
    }

    if (sequenceId == 242 || sequenceId == 62) {


        log.info("ENTROU DENTRO DO DISPARO DO E-MAIL")

        try {

            var coligadaEmail = hAPI.getCardValue("coligada");
            var filialEmail = hAPI.getCardValue("filial");
            var nomeFilialEmail = hAPI.getCardValue("nome_filial");
            var centroDeCustoEmail = hAPI.getCardValue("centro_de_custo");
            var nomeCentroDeCustoEmail = hAPI.getCardValue("nome_centro_de_custo");
            var codigoProjetoEmail = hAPI.getCardValue("codigo_do_projeto");
            var descricaoProjetoEmail = hAPI.getCardValue("descricao_projeto");

            var nomeClienteEmail = hAPI.getCardValue("nome_cliente");
            var numeroContratoEmail = hAPI.getCardValue("numero_contrato");
            var dataContratoEmail = hAPI.getCardValue("data_contrato");
            var dataInicioContratoEmail = hAPI.getCardValue("data_inicio_contrato");
            var dataTerminoContratoEmail = hAPI.getCardValue("data_termino");
            var valorBrutoOriginalEmail = hAPI.getCardValue("valorBrutoOriginal");

            var numeroSolicitacao = getValue("WKNumProces");

            var link = "https://gennesisengenharia160517.fluig.cloudtotvs.com.br:1650/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + numeroSolicitacao;
            var dataAtual = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss")
                .format(new java.util.Date());

            var cabecalho =
                "<div style='margin-bottom:30px;'>" +

                "<div style='font-size:15px;line-height:1.8;color:#555555;'>" +
                "A solicitação abaixo tem uma atividade atribuida ao setor de contratos." +
                "</div>" +

                "</div>";

            var cardResumo =
                "<table width='100%' cellpadding='0' cellspacing='0' border='0' " +
                "style='background:#f8fbff;border:1px solid #d9e6ff;border-radius:12px;margin-top:20px;margin-bottom:30px;'>" +

                "<tr>" +
                "<td style='padding:25px;'>" +

                "<table width='100%' cellpadding='0' cellspacing='0' border='0'>" +

                "<tr>" +

                "<td style='padding-bottom:15px;'>" +

                "<div style='font-size:20px;font-weight:bold;color:#0d3b82;'>" +
                "Solicitação Nº " + numeroSolicitacao +
                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "<div style='height:1px;background:#dfe8f5;margin:10px 0 25px 0;'></div>" +

                "<table width='100%' cellpadding='0' cellspacing='0' border='0'>" +

                "<tr>" +

                "<td width='50%' valign='top' style='padding-right:20px;'>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Coligada</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + coligadaEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Filial</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + filialEmail + " - " + nomeFilialEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Centro de Custo</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + centroDeCustoEmail + " - " + nomeCentroDeCustoEmail + "</div>" +
                "</div>" +

                "</td>" +

                "<td width='50%' valign='top' style='padding-left:20px;'>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Projeto</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + codigoProjetoEmail + " - " + descricaoProjetoEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Data de Registro</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + dataAtual + "</div>" +
                "</div>" +
                "<div style='text-align:center;margin-top:25px;'>" +

                "<a href='" + link + "' " +
                "style='display:inline-block;background:#28a745;color:#ffffff;padding:12px 24px;border-radius:30px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;text-decoration:none;'>" +

                "IR PARA A SOLICITAÇÃO" +

                "</a>" +

                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +
                "</tr>" +

                "</table>";

            var cardContrato =
                "<table width='100%' cellpadding='0' cellspacing='0' border='0' " +
                "style='background:#ffffff;border:1px solid #e6e6e6;border-radius:12px;margin-bottom:30px;'>" +

                "<tr>" +

                "<td style='padding:25px;'>" +

                "<div style='font-size:18px;font-weight:bold;color:#0d3b82;margin-bottom:20px;'>" +
                "Dados do Contrato" +
                "</div>" +

                "<table width='100%' cellpadding='0' cellspacing='0' border='0'>" +

                "<tr>" +

                "<td width='50%' valign='top' style='padding-right:20px;'>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Cliente</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + nomeClienteEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Número do Contrato</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + numeroContratoEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Valor Bruto Original</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + valorBrutoOriginalEmail + "</div>" +
                "</div>" +

                "</td>" +

                "<td width='50%' valign='top' style='padding-left:20px;'>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Data do Contrato</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + dataContratoEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Início do Contrato</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + dataInicioContratoEmail + "</div>" +
                "</div>" +

                "<div style='margin-bottom:18px;'>" +
                "<div style='font-size:12px;color:#000000;text-transform:uppercase;font-weight:bold;margin-bottom:5px;'><strong>Término do Contrato</strong></div>" +
                "<div style='font-size:14px;color:#333333;'>" + dataTerminoContratoEmail + "</div>" +
                "</div>" +

                "</td>" +

                "</tr>" +

                "</table>" +

                "</td>" +

                "</tr>" +

                "</table>";

            var observacaoFinal =
                "<div style='background:#fff8e8;border:1px solid #ffe2a8;border-left:5px solid #f0ad4e;border-radius:10px;padding:20px;margin-top:10px;'>" +

                "<div style='font-size:16px;font-weight:bold;color:#8a6d3b;margin-bottom:10px;'>" +
                "Importante" +
                "</div>" +

                "<div style='font-size:14px;line-height:1.8;color:#6b5a2b;'>" +
                "Solicitamos que o setor responsável acompanhe a solicitação no Fluig." +
                "</div>" +

                "</div>";

            var corpoEmail =
                cabecalho +
                cardResumo +
                cardContrato +
                observacaoFinal;

            var params = new java.util.HashMap();
            params.put("subject", "Solicitação Nº " + numeroSolicitacao);
            params.put("corpoEmail", corpoEmail);

            var destinatarios = new java.util.ArrayList();

            // E-mail fixo temporário até definição do endereço por setor (financeiro/tecnico).
            destinatarios.add("contratos@engpac.com.br");
            destinatarios.add("contratos@gennesisengenharia.com.br");
            // destinatarios.add("ens4562@gmail.com");

            notifier.notify(
                "admin",
                "G12.TemplateEmail",
                params,
                destinatarios,
                "text/html"
            );

            log.info("E-mail enviado com sucesso para solicitação: " + numeroSolicitacao);

        } catch (e) {

            log.error("Erro ao enviar e-mail da solicitação: " + e);

            throw e;

        }
    }


}