function enableFields(form) {
    var atividade = Number(getValue("WKNumState")) ? Number(getValue("WKNumState")) : 0;
    var mode = form.getFormMode();


    if (atividade != 17) {
        form.setEnabled("ajusteSetorTecnico", false);
    }
    if (atividade != 173) {
        form.setEnabled("ajusteContratosValidacao", false);
        form.setEnabled("CNOPB", false);

    }
    if (atividade != 61) {
        form.setEnabled("numeroNotas", false);
        form.setEnabled("codigoVerificacao", false);
        form.setEnabled("dataEmissao", false);
        form.setEnabled("dataAutorizacao", false);
        form.setEnabled("numeroIdmov2201", false);
    }

    if (atividade != 23) {
        form.setEnabled("ajusteContratos", false);
        form.setEnabled("historicoMovimento", false);

    }

    if (atividade != 268) {
        form.setEnabled("ajusteSetorTecnicoPosNota", false);
        form.setEnabled("valorAlterado", false);
    }

    // Em modo de visualizacao, trava o formulario inteiro (inputs e selects).
    if (mode == "VIEW") {
        var campos = form.getFields();
        for (var i = 0; i < campos.size(); i++) {
            form.setEnabled(campos.get(i), false);
        }
    }


}