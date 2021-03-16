
const Client = require('fhir-kit-client');
module.exports = { CreateUSCoreR4Immunization };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();
const Axios = require('axios');

const fhirClient = new Client({
    baseUrl: baseUrl,
    customHeaders: {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json"
    }
});



async function CreateUSCoreR4Immunization(baseUrl, PatientIdentifierSystem, PatientIdentifierValue, ImmunizationStatusCode, ImmunizationDateTime, ProductCVXCode, ProductCVXDisplay, ReasonCode) {

    const patient = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: `${PatientIdentifierSystem}|${PatientIdentifierValue}` } });

    if (patient.total > 0) {
        const vacuna =
        {
            "resourceType": "Immunization",
            "id": "imm-1",
            "status": ImmunizationStatusCode,
            "vaccineCode": {
                "coding": []
            },
            "patient": {
                "reference": "Patient/example",
                "display": "Amy Shaw"
            },
            "occurrenceDateTime": ImmunizationDateTime
        }

        if (ProductCVXCode) {
            elem = {
                "system": "http://hl7.org/fhir/sid/cvx",
                "code": ProductCVXCode,
                "display": ProductCVXDisplay
            }
            vacuna.vaccineCode.coding.push(elem);
        };
        if (ReasonCode) {
            elem2 = {
                "coding": [
                    {
                        "code": ReasonCode
                    }
                ]
            }
            vacuna['statusReason'] = elem2;
        }

        return aux = JSON.stringify(vacuna)
    } else {
        return aux = 'Error:Patient_Not_Found';
    }
}

// async function ValidateUSCoreImmunization(server, resourceText) {
//     var urlFHIREndpoint = server;
//     var ResourceClass = "Immunization";
//     var OperationName = "$validate";
//     var FullURL = urlFHIREndpoint + "/" + ResourceClass + "/" + OperationName;
//     //We call the FHIR endpoint with our parameters
//     let result = await Axios.post(
//         FullURL, resourceText, {
//         headers: {
//             "Content-Type": "application/fhir+json",
//             "Accept": "application/fhir+json"
//         }
//     }
//     );
//     return result.statusText;

// }

// async function test() {
//     const PatientIdentifierSystem = Config.PatientIdentifierSystem();
//     const PatientIdentifierValue = 'L04_2_T02';
//     const ImmunizationStatusCode = "not-done";
//     const ImmunizationDateTime = "2021-10-30T10:30:00Z";
//     const ProductCVXCode = "207";
//     const ProductCVXDisplay = "COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5 mL dose";
//     const ReasonCode = "IMMUNE";

//     const immu = await CreateUSCoreR4Immunization(baseUrl, PatientIdentifierSystem, PatientIdentifierValue, ImmunizationStatusCode, ImmunizationDateTime, ProductCVXCode, ProductCVXDisplay, ReasonCode);
//     const resultado = await ValidateUSCoreImmunization(baseUrl, immu);
//     console.log(resultado);
//     return resultado;
// }
// test();