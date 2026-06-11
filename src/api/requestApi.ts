import axios from "axios";
import { hasJudicialRecordsSheriff } from "../fuctions/fuctionsSheriff";

const apiUrl = "https://sheriff-snapshot-api-668060986147.southamerica-west1.run.app/api/v1/"
const apiKey = "csync-prod-sheriff-b8f2e91c4b6d8035f1e9a2c7b4d6e8f0";

interface BlackListMatch {
    record: {
        enabled: boolean;
        reason: string;
    };
}

const apiClient = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    timeout: 10000,
    headers: { "X-Cron-Secret": apiKey }
})

export const getDataSheriff = async (identificationCode: string) => {
    try {
        const { data } = await apiClient.get(`sheriff/profiles/${identificationCode}`);

        // fue consultado en cheriff y tiene antecedentes

        let textResp = "";
        let typeResp = "";

        if (data?.found === false) {
            return {
                textResp: `Rut ${identificationCode} no ha sido consultado en Sheriff`,
                typeResp: "normal"
            }
        }

        const respHasJudicialRecordsSheriff = await hasJudicialRecordsSheriff(data);

        if (respHasJudicialRecordsSheriff) {
            return {
                textResp: `Rut ${identificationCode} tiene antecedentes registrados en Sheriff`,
                typeResp: "danger"
            }
        }

        return {
            textResp: `Rut ${identificationCode} no tiene antecedentes en Sheriff`,
            typeResp: "success"
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}


export const getDataBlackListSamanta = async (identificationCode: string) => {
    try {
        const { data } = await apiClient.get(`blacklist/${identificationCode}`);

        //? ----- Tinene antecedentes, activos o inactivos -----
        if (data?.found === true) {
            // tiene causas pendientes
            switch (data?.status) {
                case 1:
                    return {
                        textResp: `Rut ${identificationCode} en lista negra de Samanta`,
                        typeResp: "danger",
                        // detailMotive: data?.reasons?.active?.join("\n") ?? "",
                        detailMotive: data?.reasons?.active?.map((r: string) => `• ${r}`).join("\n\n") ?? "",
                        isBlackList: true
                    }

                case 2:
                    return {
                        textResp: `Rut ${identificationCode} estuvo en la lista negra`,
                        typeResp: "warning",
                        detailMotive: `NOTA: rut ${identificationCode} estuvo en la lista negra`,
                        isBlackList: false
                    }

                default:
                    return {
                        textResp: `Respuesta no esperada para el rut ${identificationCode} `,
                        typeResp: "danger",
                        detailMotive: "",
                        isBlackList: true
                    }
            }
        }

        if (data?.found === false && data?.matches.length === 0 && data?.status === 0) {
            return {
                textResp: `Rut ${identificationCode} no esta en lista negra de Samanta`,
                typeResp: "normal",
                detailMotive: "",
                isBlackList: false
            }
        }

        return {
            textResp: `Error al solicitar datos de la rut ${identificationCode}`,
            typeResp: "danger",
            detailMotive: "Error en solicitar datos a la API",
            isBlackList: true
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
}