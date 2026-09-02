function selecionarBotaoTransmissao(botao, sufixo) {
    sufixo = sufixo || "";

    var idInfoCorreta = "#infoTransmOK" + sufixo;
    $(idInfoCorreta).val("");

    $(botao).addClass('selecionado');
    $(botao).siblings().removeClass('selecionado');

    var $financeiro = $("#financeiroReponsavel" + sufixo);
    var $tecnico = $("#tecnicoReponsavel" + sufixo);
    var $motivo = $("#motivoReemissao" + sufixo);
    var $ajuste = $("#ajusteTransmissao" + sufixo);

    var idCorretas = "infoNfseCorretas" + sufixo;
    var idErradas = "infoNfseErradas" + sufixo;


    if (botao.id === idCorretas) {
        $(idInfoCorreta).val("sim");

        $financeiro.removeClass('campo-habilitado').addClass('campo-desabilitado');
        $tecnico.removeClass('campo-habilitado').addClass('campo-desabilitado');
        $motivo.removeClass('campo-habilitado').addClass('campo-desabilitado');
        $ajuste.removeClass('textarea-habilitado').addClass('textarea-desabilitado');

    } else if (botao.id === idErradas) {
        $(idInfoCorreta).val("nao");

        $financeiro.removeClass('campo-desabilitado').addClass('campo-habilitado');
        $tecnico.removeClass('campo-desabilitado').addClass('campo-habilitado');
        $motivo.removeClass('campo-desabilitado').addClass('campo-habilitado');

        // Ao entrar em "erradas" o textarea precisa refletir o motivo ja selecionado
        // (ou a ausencia dele): so fica editavel quando o motivo for "outros". Sem
        // isso o textarea ficava sem nenhuma classe e, portanto, sempre editavel.
        var valorMotivoAtual = String($motivo.val() || "").trim();
        if (valorMotivoAtual === "outros") {
            $ajuste.removeClass('textarea-desabilitado').addClass('textarea-habilitado');
        } else {
            $ajuste.removeClass('textarea-habilitado').addClass('textarea-desabilitado');
        }

    }
}

function selecionarBotaoTransmissaoSetor(botao, sufixo) {
    sufixo = sufixo || "";

    $(botao).addClass('selecionado');
    $(botao).siblings().removeClass('selecionado');

    var idInfoSetor = "#infoSetorAjuste" + sufixo;
    var idFinanceiro = "financeiroReponsavel" + sufixo;
    var idTecnico = "tecnicoReponsavel" + sufixo;

    if (botao.id === idFinanceiro) {
        $(idInfoSetor).val("financeiro");
    } else if (botao.id === idTecnico) {
        $(idInfoSetor).val("tecnico");
    }
}

function restaurarSelecaoTransmissao(sufixo) {
    sufixo = sufixo || "";

    var infoTransm = $("#infoTransmOK" + sufixo).val();
    var idBotaoTransm = null;
    if (infoTransm === "sim") idBotaoTransm = "infoNfseCorretas" + sufixo;
    else if (infoTransm === "nao") idBotaoTransm = "infoNfseErradas" + sufixo;

    if (idBotaoTransm) {
        var botaoTransm = document.getElementById(idBotaoTransm);
        if (botaoTransm) selecionarBotaoTransmissao(botaoTransm, sufixo);
    }

    var infoSetor = $("#infoSetorAjuste" + sufixo).val();
    var idBotaoSetor = null;
    if (infoSetor === "financeiro") idBotaoSetor = "financeiroReponsavel" + sufixo;
    else if (infoSetor === "tecnico") idBotaoSetor = "tecnicoReponsavel" + sufixo;

    if (idBotaoSetor) {
        var botaoSetor = document.getElementById(idBotaoSetor);
        if (botaoSetor) selecionarBotaoTransmissaoSetor(botaoSetor, sufixo);
    }
}

// Restaura o estado visual "selecionado" dos botoes de Checagem de transmissao e
// Aguardando Recebimento ao reabrir o formulario, pois a classe so era aplicada no
// clique e se perdia a cada novo carregamento da pagina. Se infoTransmOK/infoSetorAjuste
// estiverem vazios (ex.: apos serem limpos na fase de ajuste financeiro do 2.2.01),
// nenhum botao fica marcado, preservando esse comportamento de limpeza.
function restaurarBotoesTransmissao() {
    restaurarSelecaoTransmissao("");
    restaurarSelecaoTransmissao("Recebimento");
}

function chagenSelect(select) {
    var $select = $(select);
    var valueSelect = String(select.value).trim();
    var sufixo = select.id.indexOf("Recebimento") !== -1 ? "Recebimento" : "";

    var $textarea = $select
        .closest('div')
        .siblings('.form-group')
        .find("#ajusteTransmissao" + sufixo);

    if (valueSelect === "outros") {
        $textarea.removeClass('textarea-desabilitado').addClass('textarea-habilitado');
    } else {
        $textarea.removeClass('textarea-habilitado').addClass('textarea-desabilitado');
    }
}