import axios from "axios";
import { hasJudicialRecords } from "../fuctions/fuctionsSheriff";


const apiUrl = "https://sheriff-snapshot-api-668060986147.southamerica-west1.run.app/api/v1/sheriff/profiles/"
const apiKey = "csync-prod-sheriff-b8f2e91c4b6d8035f1e9a2c7b4d6e8f0";

const apiClient = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    timeout: 10000,
    headers: { "X-Cron-Secret": apiKey }
})

export const getDataSheriff = async (identificationCode: string) => {
    try {
        const { data } = await apiClient.get(identificationCode);

        // fue consultado en cheriff y tiene antecedentes

        let textResp = "";
        let typeResp = "";

        if (data?.found === false) {
            return {
                textResp: `Persona rut ${identificationCode} no ha sido consultado en Sheriff`,
                typeResp: "normal"
            }
        }

        const respHasJudicialRecords = await hasJudicialRecords(data);

        if (respHasJudicialRecords) {
            return {
                textResp: `Persona rut ${identificationCode} tiene antecedentes registrados en Sheriff`,
                typeResp: "warning"
            }
        }

        return {
            textResp: `Persona rut ${identificationCode} no tiene antecedentes en Sheriff`,
            typeResp: "sussess"
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}