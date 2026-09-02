function displayFields(form, customHTML) {


    // form.setShowDisabledFields(true);
    // form.setHidePrintLink(true);

    var atividade = Number(getValue("WKNumState"));
    var mode = form.getFormMode();
    var mobile = form.getMobile();

    var innerHtml = "<script>";

    form.setValue("atividade", atividade);


    var recebimentoFluxo = form.getValue("controleDeFluxo");


    if (mode == "MOD") {


        if (atividade == 17) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').hide();"
            innerHtml += "$('#clienteFornecedor').hide();"
            innerHtml += "$('#faturarNotas').hide();"
            innerHtml += "$('#tributacao').hide();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"


        } else if (atividade == 173) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').hide();"
            innerHtml += "$('#faturarNotas').hide();"
            innerHtml += "$('#tributacao').hide();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"
        } else if (atividade == 23) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"

        } else if (atividade == 150) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').show();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"

        } else if (atividade == 158) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').show();"
            innerHtml += "$('#enviarNota').hide();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"


        } else if (atividade == 61) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').show();"
            innerHtml += "$('#checagemDeTransmissao').hide();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"
        } else if (atividade == 242) {
            innerHtml += "$('#identificacaoProjetoDiv').show();"
            innerHtml += "$('#detalhesContrato').show();"
            innerHtml += "$('#aprovacaoSetorTecnico').show();"
            innerHtml += "$('#historicoMovimento').show();"
            innerHtml += "$('#validacaoContratos').show();"
            innerHtml += "$('#clienteFornecedor').show();"
            innerHtml += "$('#faturarNotas').show();"
            innerHtml += "$('#tributacao').show();"
            innerHtml += "$('#anexosRm').show();"
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#enviarNota').show();"
            innerHtml += "$('#checagemDeTransmissao').show();"

            innerHtml += "$('#ajusteFinanceiro').hide();"
            innerHtml += "$('#aguardandoRecebimento').hide();"
            innerHtml += "$('#ajusteSetorTecnicoPosNotaEmitida').hide();"


            form.setValue("controleDeFluxo", "1");



        } else if (atividade == 250) {

            if (recebimentoFluxo == "2") {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#ajusteFinanceiro').show();"
                innerHtml += "$('#aguardandoRecebimento').show();"

            } else if (recebimentoFluxo == "1") {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#ajusteFinanceiro').show();"
                innerHtml += "$('#aguardandoRecebimento').hide();"
            }
            form.setValue("controleDeFluxo", "3");

        } else if (atividade == 62) {

            if (recebimentoFluxo == "3") {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#aguardandoRecebimento').show();"


                innerHtml += "$('#ajusteFinanceiro').show();"
            } else {
                innerHtml += "$('#identificacaoProjetoDiv').show();"
                innerHtml += "$('#detalhesContrato').show();"
                innerHtml += "$('#aprovacaoSetorTecnico').show();"
                innerHtml += "$('#historicoMovimento').show();"
                innerHtml += "$('#validacaoContratos').show();"
                innerHtml += "$('#clienteFornecedor').show();"
                innerHtml += "$('#faturarNotas').show();"
                innerHtml += "$('#tributacao').show();"
                innerHtml += "$('#anexosRm').show();"
                innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
                innerHtml += "$('#erroAutorizarNotas').hide();"
                innerHtml += "$('#enviarNota').show();"
                innerHtml += "$('#checagemDeTransmissao').show();"

                innerHtml += "$('#aguardandoRecebimento').show();"


                innerHtml += "$('#ajusteFinanceiro').hide();"
            }



            form.setValue("controleDeFluxo", "2");
        } else if (atividade == 268) {
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#ajusteFinanceiro').hide();"

            if (recebimentoFluxo == "1") {
                innerHtml += "$('#aguardandoRecebimento').hide();"

            }

            if (recebimentoFluxo == "2") {
                innerHtml += "$('#ajusteFinanceiro').show();"
            }

        } else if (atividade == 278) {
            innerHtml += "$('#erroEnvioDeNotasDiv').hide();"
            innerHtml += "$('#erroAutorizarNotas').hide();"
            innerHtml += "$('#ajusteFinanceiro').hide();"

            if (recebimentoFluxo == "1") {
                innerHtml += "$('#aguardandoRecebimento').hide();"
            }

            if (recebimentoFluxo == "2") {
                innerHtml += "$('#ajusteFinanceiro').show();"
            }
        }

        if (atividade != 23) {
            innerHtml += "$('#botoesTributos button').css('pointer-events', 'none');";
            innerHtml += "$('#botoesTributos button').css('background-color', '#6c757d');";
            innerHtml += "$('#botoesTributos button').css('color', '#fff');";
        }

        if (atividade != 61) {
            innerHtml += "$('button[onclick=\"exibirEdicaoManual()\"]').css('pointer-events', 'none');";
            innerHtml += "$('button[onclick=\"exibirEdicaoManual()\"]').css('background-color', '#6c757d');";
            innerHtml += "$('button[onclick=\"exibirEdicaoManual()\"]').css('color', '#fff');";
            innerHtml += "$('.portaisNfseWrap a').css('pointer-events', 'none');";
            innerHtml += "$('.portaisNfseWrap a').each(function(){ this.style.setProperty('background-color', '#6c757d', 'important'); this.style.setProperty('color', '#fff', 'important'); });";
        }

        if (atividade != 250) {
            innerHtml += "$('#ajusteFinanceiro button').css('pointer-events', 'none');";
            innerHtml += "$('#ajusteFinanceiro button').css('background-color', '#6c757d');";
            innerHtml += "$('#ajusteFinanceiro button').css('color', '#fff');";
            innerHtml += "$('#ajusteFinanceiro').find('input').css('pointer-events','none');";
            innerHtml += "$('#ajusteFinanceiro').find('input').css('background-color','#f2f2f2');";
            innerHtml += "$('#ajusteFinanceiro').find('input').css('color','#a7a9ac');";

        }


        innerHtml += "function getAtividade(){ return '" + atividade + "'};";
        innerHtml += "function getMode(){ return '" + mode + "'};";
        innerHtml += "function getMobile(){ return " + mobile + "};";

        innerHtml += "</script>";

        customHTML.append(innerHtml);
    }


    if (mode == "VIEW") {
        var viewJs = "<script>";
        viewJs += "function g12TravarView(){";
        viewJs += "  var raiz = $('.fluig-style-guide');";
        viewJs += "  raiz.addClass('g12-view-lock');";
        viewJs += "  raiz.find('button, a, input[type=button], input[type=submit]').each(function(){";
        viewJs += "    try { this.disabled = true; } catch(e) {}";
        viewJs += "    $(this).attr('tabindex', '-1').removeAttr('href');";
        viewJs += "  });";
        viewJs += "  raiz.find('input, select, textarea').each(function(){";
        viewJs += "    if (this.type === 'hidden') return;";
        viewJs += "    $(this).prop('readonly', true).attr('tabindex', '-1').addClass('campo-desabilitado');";
        viewJs += "    if (this.tagName === 'SELECT') { this.disabled = true; }";
        viewJs += "  });";
        viewJs += "}";
     
        
        viewJs += "$(function(){ g12TravarView(); setTimeout(g12TravarView, 400); });";
        viewJs += "function getAtividade(){ return '" + atividade + "'};";
        viewJs += "function getMode(){ return '" + mode + "'};";
        viewJs += "function getMobile(){ return " + mobile + "};";
        viewJs += "</script>";

        customHTML.append(viewJs);
    }

}
