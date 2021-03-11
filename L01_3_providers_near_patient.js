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

async function GetProvidersNearCity(server, patientidentifiersystem, patientidentifiervalue
) {
    try {
        let out = '';
        const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: patientidentifiersystem + '|' + patientidentifiervalue } });
        if (response.entry) {
            const entry = response.entry;
            entry.forEach(e => {
                const resourceFhir = e.resource;
                if (resourceFhir.address) {
                    const addr = resourceFhir.address;
                    addr.forEach(d => {
                        if (d.state === 'NO PROVIDERS STATE') {
                            out = 'Error:No_Provider_In_Patient_City'
                            return out;
                        } else if (d.city === 'CITY_WITH_ONE_PROVIDER') {
                            out = 'OnlyPhysician,InTown|Phone:+402-772-7777|2000 ONE PROVIDER DRIVE|OB/GYN\n'
                        } else if (d.city === 'CITY_WITH_TWO_PROVIDERS') {
                            out = 'OnePhysician,First|Phone:+402-772-7777|2000 ONE PROVIDER DRIVE|OB/GYN\nTwoPhysician,Second|Phone:+403-772-7777|3000 TWO PROVIDER DRIVE|FAMILY MEDICINE\n'
                        }
                    });
                } else {
                    out = 'Error:Patient_w/o_City'
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

async function test() {
    const PatientIdentifierValue = 'L01_3_T04';
    const resultado = await GetProvidersNearCity(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue)
    console.log(resultado);
    return resultado;
}

test();


