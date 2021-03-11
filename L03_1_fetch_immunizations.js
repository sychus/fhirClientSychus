const Client = require('fhir-kit-client');
module.exports = { GetImmunizations };
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

async function GetImmunizations(server, patientidentifiersystem, patientidentifiervalue) {
   try {
      let out = '';
      const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: `${patientidentifiersystem}|${patientidentifiervalue}` } });
      if (response.entry) {
         const entry = response.entry;
         for (const e of entry) {
            let ids = e.resource.identifier;
            for (const i of ids) {
               let query = `http://fhir.hl7fundamentals.org/r4/Immunization?patient.identifier=${i.system}|${i.value}`;
               const result = await axios.get(query);
               const immunizations = result.data;
               if (immunizations.total > 0) {
                  const entry = immunizations.entry;
                  entry.forEach(e => {
                     const recurso = e.resource;
                     out = `${out}${recurso.status}|`;
                     let dataVaccines = recurso.vaccineCode.coding;
                     dataVaccines.forEach(dv => {
                        out = `${out}${dv.code}:${dv.display}|${recurso.occurrenceDateTime}\n`;
                     });
                  });
               } else {
                  out = 'Error:No_Immunizations';
               }
            }
         }
         return out;
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      console.log('entro por palo?', err);
      return err;
   }
}

async function test() {
   const PatientIdentifierValue = 'L03_1_T04';
   const resultado = await GetImmunizations(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue);
   return resultado;
}

test();

