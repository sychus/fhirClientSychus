const Client = require('fhir-kit-client');
module.exports = { GetDemographicComparison };
const Config = require('./config.js');
const baseUrl = Config.ServerEndpoint();

const fhirClient = new Client({
    baseUrl: baseUrl,
    customHeaders: {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json"
    }
});

function match(param, original) {
    return (param === original) ? 'green' : 'red'
}

async function GetDemographicComparison(server, patientidentifiersystem, patientidentifiervalue
    , myFamily, myGiven, myGender, myBirthDate
) {
    try {
        let apellidos = '';
        let nombres = '';
        let fechaNac = '';
        let genero = '';
        const response = await fhirClient.search({ resourceType: 'Patient', searchParams: { identifier: patientidentifiersystem + '|' + patientidentifiervalue } });
        if (response.entry) {
            const entry = response.entry;
            entry.forEach(e => {
                const resourceFhir = e.resource;
                if (resourceFhir.name) {
                    const names = resourceFhir.name;
                    names.forEach(n => {
                        apellidos = `{family}|${myFamily}|${n.family}|{${match(myFamily, n.family)}}\n`;
                        const givens = n.given;
                        let Nameprefix = `{given}|${myGiven}|`;
                        givens.forEach(g => {
                            nombres = `${nombres}${g} `;
                        });
                        nombres = nombres.slice(0, -1);
                        nombres = `${Nameprefix}${nombres}|{${match(myGiven, nombres)}}\n`;
                    });
                    genero = `{gender}|${myGender}|${resourceFhir.gender}|{${match(myGender, resourceFhir.gender)}}\n`;
                    fechaNac = `{birthDate}|${myBirthDate}|${resourceFhir.birthDate}|{${match(myBirthDate, resourceFhir.birthDate)}}\n`;
                }
            })
            return `${apellidos}${nombres}${genero}${fechaNac}`;
        } else {
            return 'Error:Patient_Not_Found'
        }
    } catch (err) {
        return err;
    }
}

// async function test() {
//     const PatientIdentifierValue = 'L01_2_T02';
//     const myFamily = "Dougras";
//     const myGiven = "Jamieson Harris";
//     const myGender = "male";
//     const myBirth = "1968-07-23";
//     const resultado = await GetDemographicComparison(baseUrl, 'http://fhirintermediate.org/patient_id', PatientIdentifierValue, myFamily, myGiven, myGender, myBirth)
//     console.log(resultado);
//     return resultado;
// }

// test();