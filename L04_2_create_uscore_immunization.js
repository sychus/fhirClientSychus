
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
            "text": {
                "status": "generated",
                "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p></p><p><b>category</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/observation-category laboratory}\">Laboratory</span></p><p><b>code</b>: <span title=\"Codes: {http://loinc.org 2339-0}\">Glucose Bld-mCnc</span></p><p><b>subject</b>: <a href=\"Patient-example.html\">Amy Shaw. Generated Summary: Medical Record Number: 1032702 (USUAL); active; Amy V. Shaw , Amy V. Baxter ; Phone: 555-555-5555, amy.shaw@example.com; gender: female; birthDate: 1987-02-20</a></p><p><b>effective</b>: 2005-07-05</p><p><b>value</b>: 76.0 mg/dL</p><h3>ReferenceRanges</h3><table class=\"grid\"><tr><td>-</td><td><b>Low</b></td><td><b>High</b></td><td><b>AppliesTo</b></td></tr><tr><td>*</td><td>40.0 mg/dL</td><td>109.0 mg/dL</td><td><span title=\"Codes: {http://terminology.hl7.org/CodeSystem/referencerange-meaning normal}\">Normal Range</span></td></tr></table></div>"
            },
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