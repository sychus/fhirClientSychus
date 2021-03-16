const Client = require('fhir-kit-client');
module.exports = { GetEthnicity };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();

const fhirClient = new Client({
   baseUrl: baseUrl,
   customHeaders: {
      "Content-Type": "application/fhir+json",
      "Accept": "application/fhir+json"
   }
});

async function GetEthnicity(server, patientidentifiersystem, patientidentifiervalue) {
   try {
      let out = '';
      let conformant = false;
      const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: patientidentifiersystem + '|' + patientidentifiervalue } });
      if (response.entry) {
         const entry = response.entry;
         entry.forEach(e => {
            const resourceFhir = e.resource;
            if (resourceFhir.extension) {
               const ext = resourceFhir.extension;
               ext.forEach(e => {
                  if (e.extension) {
                     let extension = e.extension;
                     if (extension.length > 0) {
                        let vcoding = '';
                        let vstring = '';
                        extension.forEach(ext => {
                           if ((ext.url && ext.valueCoding) || ext.valueString) {
                              if (ext.valueCoding) {
                                 if (ext.url === 'ombCategory') {
                                    vcoding = vcoding + `CODE|${ext.valueCoding.code}:${ext.valueCoding.display}\n`
                                 } else {
                                    vcoding = vcoding + `DETAIL|${ext.valueCoding.code}:${ext.valueCoding.display}\n`
                                 }
                              } else {
                                 conformant = true;
                                 vstring = `${ext.url}|${ext.valueString}\n`
                              }
                           } else {
                              return out = 'ERROR:NON_CONFORMANT_US-CORE-ETHNICITY_EXTENSION'
                           }
                        });
                        if (conformant) {
                           out = vstring + vcoding;
                        } else {
                           return out = 'ERROR:NON_CONFORMANT_US-CORE-ETHNICITY_EXTENSION'
                        }
                     } else {
                        out = 'ERROR:NON_CONFORMANT_US-CORE-ETHNICITY_EXTENSION'
                     }
                  } else {
                     out = 'ERROR:NO_US-CORE-ETHNICITY_EXTENSION'
                  }
               });
            } else {
               out = 'ERROR:NO_US-CORE-ETHNICITY_EXTENSION'
            }
         })
         return out
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      return err;
   }
}

// async function test() {
//    const PatientIdentifierValue = 'L02_1_T03';
//    const resultado = await GetEthnicity(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue)
//    console.log(resultado);
//    return resultado;
// }

// test();

