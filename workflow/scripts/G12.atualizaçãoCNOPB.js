/***********************************************************************************************
 * @author 		Enos Rocha - Desenvolvedor FLUIG
 * @data   		06/07/2026
 * @Versao
 * @Descricao	Mecanismo para decidir em qual grupo de validacao de contratos o processo deve ser encaminhado.
 ***********************************************************************************************/
function gerAtualizacaoCNOPB() {
    try {

        var CentroDeCusto = hAPI.getCardValue('centro_de_custo');
        var CodColigada = hAPI.getCardValue('coligada');

        if (!CodColigada) throw ("Nenhum centro de custo encontrado no formulário ");
        if (!CentroDeCusto) throw ("Nenhum centro de custo encontrado no formulário ");

        if (CodColigada == 2) {
            if (CentroDeCusto == "02.01.01.01.001" /* ADM REGIONAL JOAO PESSOA */
                || CentroDeCusto == "02.01.01.01.003" /* SEECT PB ITEM 1 */
                || CentroDeCusto == "02.01.01.01.004" /* SEECT PB ITEM 2 */
                || CentroDeCusto == "02.01.01.01.008" /* ADM REGIONAL PARAIBA */
                || CentroDeCusto == "02.01.01.01.010" /* SEINFRA PB - REFORMA ESCOLAS */
                || CentroDeCusto == "02.01.01.01.011" /* ICMBIO - PB */
                || CentroDeCusto == "02.01.01.01.012" /* SUPLAN - PB */
                || CentroDeCusto == "02.01.01.02.001" /* ADM REGIONAL CAMPINA GRANDE */
                || CentroDeCusto == "02.01.01.02.003" /* SEECT PB ITEM 3 */
                || CentroDeCusto == "02.01.01.02.004" /* SEECT PB ITEM 4 */
                || CentroDeCusto == "02.01.01.02.005" /* SEECT PB ITEM 5 */
                || CentroDeCusto == "02.01.01.02.007" /* SEDUC - PB */) {
                return true;
            }
        }

        return false;

    } catch (e) {
        log.error("Erro na funcao resolve: " + e.message);
        throw e;
    }


}




