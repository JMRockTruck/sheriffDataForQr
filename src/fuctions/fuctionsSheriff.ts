export const hasJudicialRecords = async (data: string) => {
    try {
        const FIELDS = [
            "casosCivilesActivos",
            "casosCivilesPresentados",
            "casosCivilesConcluidos",
            "cobranzaActivos",
            "cobranzaPresentados",
            "cobranzaConcluidos",
            "laboralActivos",
            "laboralPresentados",
            "laboralConcluidos",
            "casosActuales",
            "casosArchivados",
            "casosConcluidos",
            "todosLosCasos",
            "casosQuiebra",
        ] as const;

        type judicialRecord = {
            [K in (typeof FIELDS)[number]]?: number | string | null;
        };

        type Item = {
            ultimo_snapshot?: {
                extracted_summary?: {
                    antecedentes?: {
                        judicial?: judicialRecord
                    };
                };
            };
        };

        type ParsedData = {
            by_profile_tipo?: Item[];
        };

        const typed = data as ParsedData;

        const hasJudicialRecord = (typed?.by_profile_tipo ?? []).some((item) => {
            const ant = item?.ultimo_snapshot?.extracted_summary?.antecedentes?.judicial;
            if (!ant) return false;

            return FIELDS.some((k) => Number(ant[k] ?? 0) > 0);
        });

        return hasJudicialRecord;
        
    } catch (error) {
        console.error("Error parsing data:", error);
        throw error;
    }
};