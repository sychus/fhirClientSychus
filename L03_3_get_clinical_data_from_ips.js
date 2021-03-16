const Client = require('fhir-kit-client');
module.exports = { GetIPSMedications, GetIPSImmunizations };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();

const fhirClient = new Client({
   baseUrl: baseUrl,
   customHeaders: {
      "Content-Type": "application/fhir+json",
      "Accept": "application/fhir+json"
   }
});

function GetResultsMedicationsFromIps(OneDoc, ipsType) {
   let aux = '';
   let medicationReference = false;
   OneDoc.entry.forEach(
      (e) => {
         let oneP = e.resource;
         if (oneP.resourceType == ipsType) {
            let medicationText = '';
            if (oneP.medicationReference) {
               let medicationRef = oneP.medicationReference.reference.split('/')[1];
               medicationReference = true;
               OneDoc.entry.forEach(elemnt => {
                  let id = elemnt.fullUrl.split('urn:uuid:')[1];
                  if (id === medicationRef) {
                     const codings = elemnt.resource.code.coding;
                     codings.forEach(mc => {
                        if (mc.system.toString() === 'http://snomed.info/sct') {
                           medicationText = `${mc.code}:${mc.display}`
                        }
                     });
                  }
               });
               aux = `${aux}${e.resource.status}|${e.resource.effectivePeriod.start}|${medicationText}\n`;
            }
         }
      });
   if (medicationReference) {
      return aux;
   } else {
      return aux = 'Active||no-medication-info:No information about medications\n';
   }
}

function GetResultsImmunizationsFromIps(OneDoc, ipsType) {
   let aux = '';
   let immunizations = false;
   OneDoc.entry.forEach(
      (e) => {
         let oneP = e.resource;
         if (oneP.resourceType == ipsType) {
            immunizations = true;
            let snomedImmunization = '';
            oneP.vaccineCode.coding.forEach(immu => {
               if (immu.system === 'http://snomed.info/sct') {
                  snomedImmunization = `${immu.code}:${immu.display}`;
               }
            });
            aux = `${aux}${oneP.status}|${oneP.occurrenceDateTime}|${snomedImmunization}\n`;
         }
      });
   if (immunizations) {
      return aux;
   } else {
      return aux = 'Error:IPS_No_Immunizations';
   }
}

async function getIPS(server, patient, ipsType) {
   const fhirClient = new Client({
      baseUrl: server
   });
   let searchResponse = await fhirClient.search({ resourceType: 'Bundle', searchParams: { 'composition.patient': patient.id } });
   let entries = searchResponse.entry;
   if (entries) {
      aux = '';
      for (let e of entries) {
         OneDoc = e.resource;
         if (OneDoc) {
            if (ipsType === 'Immunization') {
               aux = `${aux}${GetResultsImmunizationsFromIps(OneDoc, ipsType)}`;
            } else { // en este caso no tenemos otro que medications (para simplificar)
               aux = `${aux}${GetResultsMedicationsFromIps(OneDoc, ipsType)}`;
            }
         }
      }
   } else {
      aux = 'Error:No_IPS';
   }
   return aux;
}

async function GetIPSMedications(server, patientidentifiersystem, patientidentifiervalue) {
   try {
      let out = '';
      const patient = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: `${patientidentifiersystem}|${patientidentifiervalue}` } });
      if (patient.total > 0) {
         let pac = patient.entry[0].resource;
         out = await getIPS(server, pac, 'MedicationStatement');
         return out;
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      return err;
   }
}

async function GetIPSImmunizations(server, patientidentifiersystem, patientidentifiervalue) {
   try {
      let out = '';
      const patient = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: `${patientidentifiersystem}|${patientidentifiervalue}` } });
      if (patient.total > 0) {
         let pac = patient.entry[0].resource;
         out = await getIPS(server, pac, 'Immunization');
         return out;
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      return err;
   }
}


// async function test() {
//    const PatientIdentifierValue = 'L03_3_T04';
//    // const resultadoIPSMedication = await GetIPSMedications(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue);
//    const resultadoIPSImmunization = await GetIPSImmunizations(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue);
//    // console.log(resultadoIPSMedication);
//    // console.log(resultadoIPSImmunization);
//    // return resultado;
//    console.log(resultadoIPSImmunization);
//    return resultadoIPSImmunization;
// }

// test();