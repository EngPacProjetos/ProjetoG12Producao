function servicetask363(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idMov = hAPI.getCardValue("idmov2");

    try {
        var c2 = DatasetFactory.createConstraint("IDMOV", idMov, idMov, ConstraintType.MUST);
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);

        var dataset = null;
        var MAX_TENTATIVAS = 5;
        var INTERVALO_MS = 2000;

        for (var tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
            dataset = DatasetFactory.getDataset("G12-HISTORICO-NFSE", null, [c2, c1], null);

            if (dataset != null && dataset.rowsCount > 0) {
                log.info("[NFSe-Autorizacao] Histórico encontrado na tentativa " + tentativa);
                break;
            }

            log.info("[NFSe-Autorizacao] Tentativa " + tentativa + " sem retorno. Aguardando...");

            if (tentativa < MAX_TENTATIVAS) {
                java.lang.Thread.sleep(INTERVALO_MS);
            }
        }

        if (dataset == null || dataset.rowsCount == 0) {
            hAPI.setCardValue('statusAutorizacao', "VAZIO");
        } else {
            hAPI.setCardValue('errorAoAutorizarNotas', safe(dataset.getValue(0, "HISTORICO")));
            hAPI.setCardValue('statusAutorizacao', safe(dataset.getValue(0, "STATUS")));
        }

    } catch (error) {

        throw ("[G12] Erro ao buscar o histórico e status de autorização da nota fiscal. IdMov=" + idMov + " CodColigada=" + codColigada + ". Erro: " + error);

    }

}