
const Client = require('fhir-kit-client');
module.exports = { CreateUSCoreR4LabObservation };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();
// const Axios = require('axios');

const fhirClient = new Client({
  baseUrl: baseUrl,
  customHeaders: {
    "Content-Type": "application/fhir+json",
    "Accept": "application/fhir+json"
  }
});

async function CreateUSCoreR4LabObservation(baseUrl, PatientIdentifierSystem, PatientIdentifierValue
  , ObservationStatusCode, ObservationDateTime, ObservationLOINCCode, ObservationLOINCDisplay, ResultType,
  NumericResultValue, NumericResultUCUMUnit, CodedResultSNOMEDCode, CodedResultSNOMEDDisplay) {

  const patient = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: `${PatientIdentifierSystem}|${PatientIdentifierValue}` } });

  if (patient.total > 0) {
    const labObservation = {
      "resourceType": "Observation",
      "text": {
        "status": "generated",
        "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative</b></p><p></p><p><b>category</b>: <span title=\"Codes: {http://terminology.hl7.org/CodeSystem/observation-category laboratory}\">Laboratory</span></p><p><b>code</b>: <span title=\"Codes: {http://loinc.org 2339-0}\">Glucose Bld-mCnc</span></p><p><b>subject</b>: <a href=\"Patient-example.html\">Amy Shaw. Generated Summary: Medical Record Number: 1032702 (USUAL); active; Amy V. Shaw , Amy V. Baxter ; Phone: 555-555-5555, amy.shaw@example.com; gender: female; birthDate: 1987-02-20</a></p><p><b>effective</b>: 2005-07-05</p><p><b>value</b>: 76.0 mg/dL</p><h3>ReferenceRanges</h3><table class=\"grid\"><tr><td>-</td><td><b>Low</b></td><td><b>High</b></td><td><b>AppliesTo</b></td></tr><tr><td>*</td><td>40.0 mg/dL</td><td>109.0 mg/dL</td><td><span title=\"Codes: {http://terminology.hl7.org/CodeSystem/referencerange-meaning normal}\">Normal Range</span></td></tr></table></div>"
      },
      "status": ObservationStatusCode,
      "category": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/observation-category",
              "code": "laboratory",
              "display": "Laboratory"
            }
          ],
          "text": "Laboratory"
        }
      ],
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": ObservationLOINCCode,
            "display": ObservationLOINCDisplay
          }
        ],
        "text": "Glucose Bld-mCnc"
      },
      "subject": {
        "reference": "Patient/example",
        "display": "Amy Shaw"
      },
      "effectiveDateTime": ObservationDateTime,
    };
    // Some verifications
    if (CodedResultSNOMEDCode) {
      const snomed = {
        "system": "http://snomed.sct",
        "code": CodedResultSNOMEDCode,
        "display": CodedResultSNOMEDDisplay
      };
      labObservation.code.coding.push(snomed);
    }
    if (NumericResultValue) {
      const quantity = {
        "value": NumericResultValue,
        "unit": NumericResultUCUMUnit,
        "system": "http://unitsofmeasure.org"
      }
      labObservation['valueQuantity'] = quantity;
    }

    if (ResultType === 'Coded') {
      const codeable = {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": CodedResultSNOMEDCode,
            "display": CodedResultSNOMEDDisplay
          }
        ],
        "text": CodedResultSNOMEDDisplay
      };
      labObservation['valueCodeableConcept'] = codeable;
    }

    return aux = JSON.stringify(labObservation)
  } else {
    return aux = 'Error:Patient_Not_Found';
  }
}

// async function ValidateUSCoreObservation(server, resourceText) {
//   var urlFHIREndpoint = server;
//   var ResourceClass = "Observation";
//   var OperationName = "$validate";
//   var FullURL = urlFHIREndpoint + "/" + ResourceClass + "/" + OperationName;
//   //We call the FHIR endpoint with our parameters
//   let result = await Axios.post(
//     FullURL, resourceText, {
//     headers: {
//       "Content-Type": "application/fhir+json",
//       "Accept": "application/fhir+json"
//     }
//   }
//   );
//   var status = "OK";
//   result = result.data.issue[0].details.text;
//   if (result != "Validation successful, no issues found") { status = result; }

//   return status;

// }

// async function test() {
//   const PatientIdentifierSystem = Config.PatientIdentifierSystem();
//   const PatientIdentifierValue = 'L04_1_T02';
//   const ObservationStatusCode = "final";
//   const ObservationDateTime = "2020-10-11T20:30:00Z";
//   const ObservationLOINCCode = "1975-2";
//   const ObservationLOINCDisplay = "Bilirubin, serum";
//   const ResultType = "numeric";
//   const NumericResultValue = 8.6;
//   const NumericResultUCUMUnit = "mg/dl";
//   const CodedResultSNOMEDCode = "";
//   const CodedResultSNOMEDDisplay = "";
//   console.log('aca');
//   const labOb = await CreateUSCoreR4LabObservation(baseUrl, PatientIdentifierSystem, PatientIdentifierValue, ObservationStatusCode, ObservationDateTime, ObservationLOINCCode, ObservationLOINCDisplay, ResultType, NumericResultValue, NumericResultUCUMUnit, CodedResultSNOMEDCode, CodedResultSNOMEDDisplay);
//   console.log('antes de validar');
//   const resultado = await ValidateUSCoreObservation(baseUrl, labOb);
//   console.log(resultado);
//   return labOb;
// }
// test();