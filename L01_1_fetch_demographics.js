const Client = require('fhir-kit-client');
module.exports = { GetPatientPhoneAndEmail };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();

const fhirClient = new Client({
   baseUrl: baseUrl,
   customHeaders: {
      "Content-Type": "application/fhir+json",
      "Accept": "application/fhir+json"
   }
});

async function GetPatientPhoneAndEmail(server, patientidentifiersystem, patientidentifiervalue) {
   try {
      let out = '';
      let emails = '';
      let phones = '';
      const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: patientidentifiersystem + '|' + patientidentifiervalue } });
      if (response.entry) {
         const entry = response.entry;
         entry.forEach(e => {
            const resourceFhir = e.resource;
            // console.log(resourceFhir);
            if (!resourceFhir.telecom) {
               out = 'Emails:-\nPhones:-\n'
            } else {
               // Tiene telecom
               const telecom = resourceFhir.telecom;
               telecom.forEach(t => {
                  if (t.system === 'email') {
                     emails = emails + `${t.value}(${t.use}),`
                  } else if (t.system === 'phone') {
                     phones = phones + `${t.value}(${t.use}),`
                  }
               });
            }
         })
         if (emails !== '' && phones !== '') {
            out = 'Emails:' + emails.slice(0, -1) + '\n' + 'Phones:' + phones.slice(0, -1) + '\n'
         } else if (emails === '' & phones !== '') {
            out = 'Emails:-\n' + 'Phones:' + phones.replace(',', '') + '\n';
         } else if (emails !== '' & phones === '') {
            out = 'Emails:' + emails.replace(',', '') + '\n' + 'Phones:-\n'
         } else {
            out = 'Emails:-\nPhones:-\n'
         }
         return out;
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      return err;
   }
}


// async function asyncPatient() {
//    try {
//       const resultado = await GetPatientPhoneAndEmail(fhirClient, 'http://fhirintermediate.org/patient_id', 'L01_1_T05');
//       console.log(resultado);
//       return resultado
//    } catch (e) {
//       return e
//    }
// }

// asyncPatient();
