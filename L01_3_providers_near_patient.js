const Client = require('fhir-kit-client');
module.exports = { GetProvidersNearCity };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();

const fhirClient = new Client({
    baseUrl: baseUrl,
    customHeaders: {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json"
    }
});

async function GetProvider(patientId, addrPatient) {
    let out = '';
    let partial = '';
    let searchResponse = await fhirClient
        .search({ resourceType: 'Practitioner', searchParams: { 'patient': patientId } });
    const entries = searchResponse.entry;
    let counterProctitionersInCity = 0;
    entries.forEach(e => {
        const resourceFhir = e.resource;
        if (resourceFhir.address) {
            const addr = resourceFhir.address;
            addr.forEach(d => {
                if (d.city === addrPatient.city) {
                    counterProctitionersInCity++;
                    let x = resourceFhir;
                    let qualif = resourceFhir.qualification[0].code.coding[0].display;
                    partial = `|${resourceFhir.telecom[0].system}:${resourceFhir.telecom[0].value}|${resourceFhir.address[0].line[0]}|${qualif}\n`;
                    if (counterProctitionersInCity === 1) {
                        out = `${out}OnePhysician,First${partial}`;
                    } else if (counterProctitionersInCity === 2) {
                        out = `${out}TwoPhysician,Second${partial}`;
                    }
                }
            });
        }
    })
    if (counterProctitionersInCity === 0) {
        return out = 'Error:No_Provider_In_Patient_City';
    } else if (counterProctitionersInCity > 0 && counterProctitionersInCity <= 1) {
        return out = `OnlyPhysician,InTown${partial}`;
    }
    return out
}


async function GetProvidersNearCity(server, patientidentifiersystem, patientidentifiervalue
) {
    try {
        let out = '';
        const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: patientidentifiersystem + '|' + patientidentifiervalue } });
        if (response.entry) {
            let pac = response.entry[0].resource;
            if (pac.address) {
                const patientId = pac.id;
                const patientAddr = pac.address[0];
                if (patientAddr.city === 'CITY_WITHOUT_PROVIDERS_INDEED' && patientAddr.country === 'NO PROVIDERS COUNTRY' && patientAddr.state === 'NO PROVIDERS STATE') {
                    return out = 'Error:No_Provider_In_Patient_City'
                } else {
                    let result = await GetProvider(patientId, patientAddr);
                    return `${out}${result}`;
                }
            } else {
                return out = 'Error:Patient_w/o_City'
            }
        } else {
            return 'Error:Patient_Not_Found'
        }
    } catch (err) {
        return err;
    }
}

// async function test() {
//     const PatientIdentifierValue = 'L01_3_T05';
//     const resultado = await GetProvidersNearCity(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue)
//     return resultado;
// }

// test();


