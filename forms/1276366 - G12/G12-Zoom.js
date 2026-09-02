function setSelectedZoomItem(selectedItem, campoZoomImposto) {

    campoZoomImposto = campoZoomImposto || "impostos_selecao";

    var coligada = $("#CodColigada").val();
    var idmov = $("#idmov2").val();

    var parans = "CODCOLIGADA," + coligada + ",IDMOV," + idmov;

    console.log("PRINTANDO SELECTED ITEM DO ZOOM", selectedItem);



    if (selectedItem && (selectedItem.inputName != "" || selectedItem.inputName != null && selectedItem.inputName != "undefined")) {

        if (selectedItem.inputName.indexOf("ajusteIrrfZoom") != -1) {

            var codigo = selectedItem.CODIGO_IRRF;

            console.log("CODIGO IRRF SELECIONADO", codigo)

            var descricao = selectedItem.DESCRICAO_IRRF;

            console.log("DESCRICAO DE IRRF SELECIONADA", descricao);

            $("#irrfCodigoAjuste").val(codigo);
            $("#irrfDescricaoAjuste").val(descricao);

        }



        if (selectedItem.inputName.indexOf("ajusteInssZoom") != -1) {

            var codigo = selectedItem.CODIGO_INSS;
            var descricao = selectedItem.DESCRICAO_INSS;

            $("#inssCodigoAjuste").val(codigo)
            $("#inssDescricaoAjuste").val(descricao)

        }

        // irrfCodigoAjusteSub / inssCodigoAjusteSub (tblAjusteIrrfSub / tblAjusteInssSub) usam
        // 'displayKey':'DESCRICAO_IRRF'/'DESCRICAO_INSS', então o próprio campo zoom fica com a
        // descrição (ex: "IRRF-PJ Alíquota 1,20%"), não o código. O RM rejeita isso em CODIGOIRRF/
        // CODIGOINSS por estourar o MaxLength. Por isso espelhamos o código real num campo oculto
        // paralelo (irrfCodSub___N / inssCodSub___N), lido pelo servicetask334.
        if (selectedItem.inputName.indexOf("irrfCodigoAjusteSub") != -1) {

            var codigoSub = selectedItem.CODIGO_IRRF;
            var sufixoSub = selectedItem.inputName.replace("irrfCodigoAjusteSub", "");

            console.log("CODIGO IRRF (SUB) SELECIONADO", codigoSub, "SUFIXO", sufixoSub);

            $("[name='irrfCodSub" + sufixoSub + "']").val(codigoSub);

        }

        if (selectedItem.inputName.indexOf("inssCodigoAjusteSub") != -1) {

            var codigoSub = selectedItem.CODIGO_INSS;
            var sufixoSub = selectedItem.inputName.replace("inssCodigoAjusteSub", "");

            console.log("CODIGO INSS (SUB) SELECIONADO", codigoSub, "SUFIXO", sufixoSub);

            $("[name='inssCodSub" + sufixoSub + "']").val(codigoSub);

        }

    } else {

        if (coligada != undefined && coligada != "" && idmov != undefined && idmov != "") {
            setTimeout(function reloadZoom() {
                // Fluig converte type zoom em select via WDK, então nunca filtre esse reload por input ... nao funciona .
                var campos = $("[name^='" + campoZoomImposto + "___']");
                var index = campos.length;
                console.log("Campos zoom encontrados:", campos.length, "→ recarregando índice:", index);
                if (index >= 0) {
                    reloadZoomFilterValues(campoZoomImposto + "___" + index, parans);
                }
            }, 1000);

        }

    }

















}