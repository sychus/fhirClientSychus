const Client = require('fhir-kit-client');
module.exports = { GetIPSMedications, GetIPSImmunizations };
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

function GetMedicationResultsFromIps(OneDoc) {
   let aux = '';
   let medicationReference = false;
   OneDoc.entry.forEach(
      (e) => {
         let oneP = e.resource;
         if (oneP.resourceType == "MedicationStatement") {
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
      console.log(aux);
      return aux;
   } else {
      return aux = 'Active||no-medication-info:No information about medications\n';
   }
}

async function getIPS(server, patient) {
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
            aux = `${aux}${GetMedicationResultsFromIps(OneDoc)}`;
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
         out = await getIPS(server, pac);
         return out;
      } else {
         return 'Error:Patient_Not_Found'
      }
   } catch (err) {
      return err;
   }
}

async function test() {
   const PatientIdentifierValue = 'L03_3_T04';
   const resultadoIPSMedication = await GetIPSMedications(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue);
   // const resultadoIPSImmunization = await GetIPSImmunizations(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue);
   // console.log(resultadoIPSMedication);
   // console.log(resultadoIPSImmunization);
   // return resultado;
   return resultadoIPSMedication;
}

test();


async function GetIPSImmunizations(server, patientidentifiersystem, patientidentifiervalue) {
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




/*
const entryP = patient.entry;
      for (const e of entryP) {
         let id = e.id;
         const bundle = await fhirClient.search({ resourceType: 'Bundle', searchParams: { 'composition.patient': id } });
         console.log('bundleeeee: ', bundle);
         if (bundle) {
            const entradas = bundle.entry;
            entradas.forEach(entrada => {
               const entries = entrada.resource.entry;
               entries.forEach(recur => {
                  if (recur.resource) {
                     let r = recur.resource;
                     if (r.resourceType.toString() === 'MedicationStatement') {
                        if (r.medicationReference) {
                           const ref = r.medicationReference.reference;
                           let idMedication = ref.split('/')[1];
                           const ipsMed = {
                              status: r.status,
                              date: r.effectivePeriod.start,
                              medicationID: idMedication,
                              medication: searchMedications(entries, idMedication)
                           };
                           let nonexists = true;
                           let i = 0;
                           if (data.length) {
                              while (i < data.length && nonexists) {
                                 if (data[i].medicationID === ipsMed.medicationID) {
                                    nonexists = false;
                                 }
                                 i++;
                              }
                              if (nonexists) {
                                 data.push(ipsMed);
                              }
                           } else {
                              data.push(ipsMed);
                           }
                        }
                     }
                  }
               });
            });
         } else {
            return 'Error:No_IPS';
         }
      }
      data.forEach(d => {
         out = `${out}${d.status}|${d.date}|${d.medication}\n`;
      });
      console.log(out);
      return out;
*/
