function exibitInfo() {
    var exibe = $("#exibirCheck").val();

    if (exibe == "") {
        $("#inforChecagem").slideDown(250);
        $("#exibirCheck").val("1");
    } else {
        $("#inforChecagem").slideUp(250);
        $("#exibirCheck").val("");
    }
}

function exibirEdicaoManual() {
    $("#enviarNota input[readonly]").prop('readonly', false);
}
function ajusteCompetencia() {
    $("#dataDeCompetencia").prop('readonly', false);
}
function ajusteCompetenciaSub() {
    $("#dataDeCompetenciaSub").prop('readonly', false);
}


function pickerDate(campo) {

    if (campo.readOnly) return;

    var campo_nome = campo.name.split("___")[0];


    // PICKER DATE PARA DATA DE COMPETENCIA
    var datePickerSelecionado = FLUIGC.calendar(campo, {
        pickDate: true
    });


}

function competenciaMudou() {

    var atividade = $('#atividade').val();

    console.log(atividade)

    if (atividade != 23) return;

    var valueInputCompetencia = $('input#dataDeCompetencia').val();

    if (valueInputCompetencia == null || valueInputCompetencia == "" || valueInputCompetencia == "undefined") return

    var valorInput = $('input#dataDeCompetencia').closest('.alteracao-competencia');

    console.log(valorInput)

    var found = valorInput.find('h5');

    console.log(found)

    if (found.length > 0) return;

    var javaScript = "";

    var div = $("#dataDeCompetencia").closest('.alteracao-competencia');

    console.log(div)

    javaScript += "<h5 style='margin-botton: 10px !important; color: #1eaad9;'>A data de competência já foi alterada ! <h5/>";

    div.append(javaScript);
}

function desabilitarParaAjuste() {
    var atividade = $("#atividade").val();
    console.log("ATIVIDADE DA VEZ -->", atividade)
    if (atividade == 43) {
        var valores = document.querySelectorAll("input, textarea, button, select");
        var valoresTransmissao = document.querySelectorAll(".botaoTransmissao");

        valores.forEach(input => {
            console.log("DESABILITOU")
            $(input).prop("readOnly", true);
            $(input).css("pointer-events", "none");
            if (input.tagName === "BUTTON") {
                $(input).css("background-color", "#6c757d");
                $(input).css("color", "#fff");
            } else {
                $(input).css("background-color", "#f2f2f2");
                $(input).css("color", "#a7a9ac");
            }

        })
        valoresTransmissao.forEach(input => {
            console.log("DESABILITOU")
            $(input).css("pointer-events", "none");
            $(input).css("background-color", "#6c757d");
            $(input).css("color", "#fff");

        })


    }
}


function desabilitarCampos() {

    var atividade = Number($("#atividade").val());

    console.log(typeof atividade);

    console.log("ATIVIDADE DA VEZ CHECAGEM -->", atividade)
    
    $camposDaDiv = $("#checagemDeTransmissao").find("input, textarea, button, select");
    
    $camposDaDivRecebimento = $("#aguardandoRecebimento").find("input, textarea, button, select");

    if (atividade != 242) {

        // Bloqueio da etapa inteira: precisa vencer ate os campos que ficaram com a
        // classe "campo-habilitado"/"textarea-habilitado" de uma selecao anterior
        // (ex.: "erradas" foi marcado antes). Por isso usa setProperty(..., "important"),
        // que tem prioridade maior que qualquer regra de classe no CSS.
        $camposDaDiv.each(function () {
            $(this).prop("readOnly", true);
            this.style.setProperty("pointer-events", "none", "important");
            // Botao ja marcado como "selecionado" mantem a cor de selecao (nao fica
            // cinza) - so perde a possibilidade de clicar, via pointer-events acima.
            if (!$(this).hasClass("selecionado")) {
                if (this.tagName === "BUTTON") {
                    this.style.setProperty("background-color", "#6c757d", "important");
                    this.style.setProperty("color", "#fff", "important");
                } else {
                    this.style.setProperty("background-color", "#f2f2f2", "important");
                    this.style.setProperty("color", "#a7a9ac", "important");
                }
            }
        });
    }else{
         $camposDaDiv.each(function () {
            $(this).prop("readOnly", false);
            // Nao forcar pointer-events/background aqui: dentro da etapa ativa, quem
            // decide se cada campo fica clicavel/editavel sao as classes
            // campo-habilitado/campo-desabilitado (ex.: motivo != "outros" continua bloqueado).
            this.style.removeProperty("pointer-events");
            this.style.removeProperty("background-color");
            this.style.removeProperty("color");
        });
    }

    if (atividade != 62) {

        $camposDaDivRecebimento.each(function () {
            $(this).prop("readOnly", true);
            this.style.setProperty("pointer-events", "none", "important");
            if (!$(this).hasClass("selecionado")) {
                if (this.tagName === "BUTTON") {
                    this.style.setProperty("background-color", "#6c757d", "important");
                    this.style.setProperty("color", "#fff", "important");
                } else {
                    this.style.setProperty("background-color", "#f2f2f2", "important");
                    this.style.setProperty("color", "#a7a9ac", "important");
                }
            }
        });
    } else {
        $camposDaDivRecebimento.each(function () {
            $(this).prop("readOnly", false);
            this.style.removeProperty("pointer-events");
            this.style.removeProperty("background-color");
            this.style.removeProperty("color");
        });
    }
}


function exibirCarregamento() {
    var $carregamento = $("#carregamentoG12");

    var TEMPO_MIN = 900;    
    var TRAVA_MAX = 8000;   
    var inicio = Date.now();
    var jaSaiu = false;

    function esconder() {
        if (jaSaiu) return;
        jaSaiu = true;

        var espera = Math.max(0, TEMPO_MIN - (Date.now() - inicio));
        setTimeout(function () {
            $carregamento.addClass("carregamentoG12");      
            setTimeout(function () { $carregamento.hide(); }, 500);
        }, espera);
    }

    if (document.readyState === "complete") {
        esconder();
    } else {
        $(window).on("load", esconder);
    }
    setTimeout(esconder, TRAVA_MAX);
}



