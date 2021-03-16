const Client = require('fhir-kit-client');
module.exports = { GetMedications };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();
const axios = require('axios').default;

const fhirClient = new Client({
   baseUrl: baseUrl,
   customHeaders: {
      "Content-Type": "application/fhir+json",
      "Accept": "application/fhir+json"
   }
});

async function GetMedications(server, patientidentifiersystem, patientidentifiervalue) {
   try {
      let out = '';
      const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: `${patientidentifiersystem}|${patientidentifiervalue}` } });
      if (response.entry) {
         const entry = response.entry;
         for (const e of entry) {
            let ids = e.resource.identifier;
            for (const i of ids) {
               let query = `http://fhir.hl7fundamentals.org/r4/MedicationRequest?subject.identifier=${i.system}|${i.value}`;
               const result = await axios.get(query);
               const medicationStatement = result.data;
               if (medicationStatement.total > 0) {
                  const entry = medicationStatement.entry;
                  entry.forEach(e => {
                     const recurso = e.resource;
                     out = `${out}${recurso.status}|${recurso.intent}|${recurso.authoredOn}|`;
                     let medication = recurso.medicationCodeableConcept.coding;
                     medication.forEach(m => {
                        out = `${out}${m.code}:${m.display}|`;
                     });
                     out = `${out}${recurso.requester.display}\n`
                  });
               } else {
                  out = 'Error:No_Medications';
               }
            }
         }
         return out;
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      return err;
   }
}

// async function test() {
//    const PatientIdentifierValue = 'L03_2_T03';
//    const resultado = await GetMedications(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue);
//    console.log(resultado);
//    return resultado;
// }

// test();