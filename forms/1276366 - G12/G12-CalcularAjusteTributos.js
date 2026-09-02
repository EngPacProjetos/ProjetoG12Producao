function ajustarValorTributo(campo) {

    console.log(campo);

    var index = campo.id.split("___")[1];

    if (campo.value == "" || campo.value == null || campo.value == undefined) {
        return;
    }

    var valorRaw = campo.value.replace(/\./g, "").replace(",", ".");
    console.log("Valor bruto do campo:", valorRaw);

    var $tr = $(campo).closest("tr");
    var $aliquota = $tr.find("input[name^='aliquota']");
    var $valorImposto = $tr.find("input[name^='valorImposto']");

    if ($aliquota.length === 0 || $valorImposto.length === 0) {
        console.warn("PAROU: não achou aliquota ou valorImposto nessa linha");
        return;
    }

    var aliquotaRaw = $aliquota.val().replace(/\./g, "").replace(",", ".");
    console.log("Alíquota bruta do campo:", aliquotaRaw);

    var valor = parseFloat(valorRaw);
    var aliquota = parseFloat(aliquotaRaw) / 100;

    console.log("Valor da base de cálculo:", valor);
    console.log("Valor da alíquota:", aliquota);

    if (isNaN(valor) || isNaN(aliquota)) {
        console.warn("Valor ou alíquota inválidos — abortando cálculo");
        return;
    }

    var resultado = valor * aliquota;
    console.log("RESULTADO FINAL DO CALCULO", resultado);

    var resultadoStr = resultado.toString();
    var partes = resultadoStr.split(".");
    var inteiro = partes[0];
    var decimal = partes[1] ? partes[1].substring(0, 4).padEnd(4, "0") : "0000";
    var formatado = inteiro + "," + decimal;

    console.log("VALOR FORMATADO:", formatado);

    $valorImposto.val(formatado);

    var inteiroBase = valorRaw.split(".")[0];
    var decimalBase = valorRaw.split(".")[1] ? valorRaw.split(".")[1].substring(0, 4).padEnd(4, "0") : "0000";
    $(campo).val(inteiroBase + "," + decimalBase);

    var aliquotaFormatada = aliquotaRaw.split(".")[0] + "," + (aliquotaRaw.split(".")[1] ? aliquotaRaw.split(".")[1].substring(0, 4).padEnd(4, "0") : "0000");
    console.log("ALÍQUOTA FORMATADA", aliquotaFormatada);

    $aliquota.val(aliquotaFormatada);
}

function ajustarValorDoSetorTecnico(campo) {

    if (campo.value == "" || campo.value == null || campo.value == undefined) {
        return;
    }


    var valorLimpo = String(campo.value).replace(/[^0-9.,]/g, "");
    var valorRaw = valorLimpo.replace(/\./g, "").replace(",", ".");

    var resultado = parseFloat(valorRaw);

    if (isNaN(resultado)) {
        console.warn("Valor inválido digitado em valorAlterado — abortando formatação");
        $(campo).val("");
        return;
    }

    var resultadoStr = resultado.toString();
    var partes = resultadoStr.split(".");
    var inteiro = partes[0];
    var decimal = partes[1] ? partes[1].substring(0, 4).padEnd(4, "0") : "0000";
    var formatado = inteiro + "," + decimal;

    console.log("VALOR FORMATADO:", formatado);

    $(campo).val(formatado)

    verificarVariacaoValorAlterado(resultado);
}


function verificarVariacaoValorAlterado(valorAlteradoNumerico) {

    var valorOriginalRaw = String($("#valorBrutoOriginal").val() || "")
        .replace(/[^0-9.,]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    var valorOriginal = parseFloat(valorOriginalRaw);

    var $aviso = $("#avisoVariacaoValorDiv");
    var $flagAcimaDe1 = $("[name='valorAcimaDe1']");

    $aviso.empty();

    if (isNaN(valorOriginal) || valorOriginal === 0 || isNaN(valorAlteradoNumerico)) {
        $flagAcimaDe1.val("");
        return;
    }

    var variacaoPercentual = Math.abs((valorAlteradoNumerico - valorOriginal) / valorOriginal) * 100;

    console.log("VARIACAO PERCENTUAL DO VALOR ALTERADO:", variacaoPercentual);

    if (variacaoPercentual >= 1) {
        $flagAcimaDe1.val("SIM");

        $aviso.append(
            $("<div></div>")
                .addClass("aviso-variacao-valor")
                .text("Variação no valor da nota igual ou maior que 1%, notificar ao diretor técnico")
        );
    } else {
        $flagAcimaDe1.val("");
    }
}

// Reaplica o aviso de variacao de valor ao reabrir o formulario, pois o aviso e
// montado so via jQuery (nao fica salvo no card) - sem isso ele sumia ao sair e
// voltar, mesmo com o hidden valorAcimaDe1 ainda marcado como "SIM".
function restaurarAvisoVariacaoValor() {
    var valorAlteradoRaw = String($("#valorAlterado").val() || "")
        .replace(/[^0-9.,]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    var valorAlteradoNumerico = parseFloat(valorAlteradoRaw);

    if (isNaN(valorAlteradoNumerico)) return;

    verificarVariacaoValorAlterado(valorAlteradoNumerico);
}