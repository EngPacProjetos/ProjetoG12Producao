function checkAllInfo() {
    var divProjeto = $("#identificacaoProjetoDiv");
    var inputs = divProjeto.find('input');
    var divContrato = $("#detalhesContrato");
    var inputsContrato = divContrato.find('input');
    var divCheck = $("#inforChecagem");
    var atividade = $("#atividade").val();
    var cnoPB = $("#CNOPB").val();
    var cno = $("#cno").val();
    var centroDeCusto = $("#centro_de_custo").val();
    var competencia = $("#dataDeCompetencia").val();
    var competenciaValidacao = new Date(competencia).toLocaleString('pt-BR');


    var numeroDaNota = $("#numeroNotas");
    var codigoDaNota = $("#codigoVerificacao");
    var dataDeEmissaoDaNota = $("#dataEmissao");
    var dataDeAutorizacaoDaNota = $("#dataAutorizacao");
    var idmovRps = $("#numeroIdmov2201");
    var anexoDeNotaFaltando = $("#fnnotaFiscal");



    var isCompetenciaInvalid = valiodateCompetencia(competenciaValidacao);
    var mensagens = "";

    var centrosParaiba = [
        "02.01.01.01.001"
        , "02.01.01.01.003"
        , "02.01.01.01.004"
        , "02.01.01.01.008"
        , "02.01.01.01.010"
        , "02.01.01.01.011"
        , "02.01.01.01.012"
        , "02.01.01.02.001"
        , "02.01.01.02.003"
        , "02.01.01.02.004"
        , "02.01.01.02.005"
        , "02.01.01.02.007"

    ]

    inputs.each(function () {
        var campo = $(this);

        if (campo.val() === "") {
            var idCampo = campo.attr('id');
            var label = $("label[for='" + idCampo + "']");
            var valorLabel = label.length ? label.text() : idCampo;

            console.log(valorLabel)



            if (mensagens.indexOf("Campos do projeto não preenchidos:") === -1) {
                mensagens += "<h5>🟥 Campos do projeto não preenchidos:</h5>";

            }

            mensagens += "<h5>❌  " + valorLabel + "</h5>";
        }
    });

    inputsContrato.each(function () {
        var campo = $(this);

        if (campo.val() === "") {
            var idCampo = campo.attr('id');
            var label = $("label[for='" + idCampo + "']");
            var valorLabel = label.length ? label.text() : "";

            if (mensagens.indexOf("Campos não preenchidos") === -1) {
                mensagens += "<h5>🟥 Campos do contrato não preenchidos:</h5>";
            }

            mensagens += "<h5>❌  " + (valorLabel || idCampo) + "</h5>";
        }
    });


    if (atividade == 173) {
        if (centrosParaiba.indexOf(centroDeCusto) !== -1) {
            if (cno == "" && cnoPB == "") {
                mensagens += "<h5>❌  CNO PB </h5>";
            }
        }
    }
    if (atividade == 23) {
        if (competencia == null || competencia == "" || competencia == "undefined") {
            mensagens += "<h5>❌  Data de competência </h5>";
        }
        if (isCompetenciaInvalid == true) {
            mensagens += "<h5>🟥 Campos inválidos:</h5>";
            mensagens += "<h5>❌  Data de competência - Data inferior ao dia de Hoje </h5>";
        }
    }
    if (atividade == 61) {

        var numeroNotaText = $('label[for=' + numeroDaNota.attr('id') + ']').text();
        var numeroNotaValue = $(numeroDaNota).val();


        var codigoDaNotaText = $('label[for=' + codigoDaNota.attr('id') + ']').text();
        var codigoDaNotaValue = $(codigoDaNota).val();


        var dataDeEmissaoDaNotaText = $('label[for=' + dataDeEmissaoDaNota.attr('id') + ']').text();
        var dataDeEmissaoDaNotaValue = $(dataDeEmissaoDaNota).val();


        var dataDeAutorizacaoDaNotaText = $('label[for=' + dataDeAutorizacaoDaNota.attr('id') + ']').text();
        var dataDeAutorizacaoDaNotaValue = $(dataDeAutorizacaoDaNota).val();


        var idmovRpsText = $('label[for=' + idmovRps.attr('id') + ']').text();
        var idmovRpsValue = $(idmovRps).val();


        var anexoDeNotaFaltandoText = $('label[for=' + anexoDeNotaFaltando.attr('id') + ']').text();
        var anexoDeNotaFaltandoValue = $(anexoDeNotaFaltando).val();


        var invalido = ['undefined', null, ''];

        var camposNota = [
            { valor: numeroNotaValue, label: numeroNotaText },
            { valor: codigoDaNotaValue, label: codigoDaNotaText },
            { valor: dataDeEmissaoDaNotaValue, label: dataDeEmissaoDaNotaText },
            { valor: dataDeAutorizacaoDaNotaValue, label: dataDeAutorizacaoDaNotaText },
            { valor: idmovRpsValue, label: idmovRpsText },
            { valor: anexoDeNotaFaltandoValue, label: anexoDeNotaFaltandoText }
        ];

        camposNota.forEach(function (campo) {
            if (invalido.includes(campo.valor)) {
                if (mensagens.indexOf("Campos de nota fiscal inválidos") === -1) {
                    mensagens += "<h5>🟥 Campos de nota fiscal inválidos:</h5>";
                }

                if (campo.label == "") {
                    mensagens += "<h5>❌ DANFE NFSE </h5>";
                    return
                }
                mensagens += "<h5>❌  " + campo.label + "</h5>";
            }
        });
    }




    setTimeout(() => {
        var tabelaTributos = $("#tabelaTributosNacionais");
        var linhasTributos = tabelaTributos.find('tbody tr');

        linhasTributos.each(function () {
            var linha = $(this);
            var celulas = linha.find('td');

            var codigo = celulas.eq(0).text().trim();

            var valor = celulas.eq(1).text().trim();

            var aliquota = celulas.eq(2).text().trim();

            var baseCalculo = celulas.eq(3).text().trim();


            if (valor === "" || aliquota === "" || baseCalculo === "" || valor === "-" || aliquota === "-" || baseCalculo === "-" || valor == "0.0000" || aliquota == "0.0000" || baseCalculo == "0.0000") {
                if (mensagens.indexOf("Tributos do movimento com campos inválidos ou zerados") !== -1) {

                } else {
                    mensagens += "<h5 style='margin-top: 20px'>🟥 Tributos do movimento com campos inválidos ou zerados:</h5>";
                }
                mensagens += "<h5>❌  " + codigo; + "</h5>"
            }


        })

        var tabelaTributosMunicipais = $("#tabelaTributosMunicipais");
        var linhasTributosMunicipais = tabelaTributosMunicipais.find('tbody tr');

        linhasTributosMunicipais.each(function () {
            var linha = $(this);
            var celulas = linha.find('td');

            var codigo = celulas.eq(0).text().trim();
            var aliquota = celulas.eq(1).text().trim();
            var baseReducao = celulas.eq(2).text().trim();

            if (
                aliquota === "" || aliquota === "-" || aliquota === "—" || aliquota === "0.0000"
                || baseReducao === "" || baseReducao === "-" || baseReducao === "—" || baseReducao === "0.0000"
            ) {
                if (mensagens.indexOf("Tributos municipais com campos inválidos ou zerados") !== -1) {

                } else {

                    mensagens += "<h5 style='margin-top: 20px'>🟥 Tributos municipais com campos inválidos ou zerados:</h5>";
                    mensagens += "<h5>❌  " + codigo + "</h5>";
                }
            }
        });




        divCheck.html(mensagens);
    }, 1000);

    divCheck.html(mensagens);
}


function valiodateCompetencia(data) {
    console.log("ENTROU NA FUNCAO EM QUESTAO -- >")
    console.log("DATA DA COMPETENCIA PASSADA --->", data)
    var hoje = new Date().toLocaleDateString('pt-BR');
    console.log("DATA DE HOJE CRIADA -> ", hoje)
    var result = data < hoje ? true
        : false;
    console.log("VALOR DO TERNARIO PASSAOD - >", result)
    return result
}