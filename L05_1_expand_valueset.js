const Axios = require('axios');
module.exports = { ExpandValueSetForCombo };
const Config = require('./config.js');
const baseUrl = Config.TerminologyServerEndpoint();


async function ExpandValueSetForCombo(baseUrl, Url, Filter) {
    let urlFHIREndpoint = baseUrl;
    let ResourceClass = 'ValueSet';
    let OperationName = "$expand"
    let Parameters = "url=" + Url
    if (Filter != "") { Parameters = Parameters + "&" + "filter=" + Filter; }
    let FullURL = `${urlFHIREndpoint}/${ResourceClass}/${OperationName}?${Parameters}`;
    try {
        let result = await Axios.get(FullURL);
        let aux = '';
        if (result.data.expansion.contains) {
            result.data.expansion.contains.forEach((ec) => {
                aux += ec.code + "|" + ec.display + "\n";
            });
        }
        if (aux == "") { aux = "Error:ValueSet_Filter_Not_Found"; }
        return aux;
    } catch (err) {
        return err
    }


}



// async function test() {
//     const url = "http://snomed.info/sct?fhir_vs=isa/73211009";
//     const filter = "Drug-induced diabetes";
//     const c = await ExpandValueSetForCombo(baseUrl, url, filter);
//     return c;
// }
// test();







