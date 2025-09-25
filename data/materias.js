// ./data/materias.js
import { temas as eticaAristotelicaTemas } from "./etica/etica_aristotelica.js";
import { temas as eticaEstoicaTemas } from "./etica/etica_estoica.js";
import { temas as eticaHumeTemas } from "./etica/etica_hume.js";
import { temas as economiaPrimeraClaseTemas } from "./economia/primera_clase.js";

// Puedes importar temas de otras materias también
// import { temas as filosofiaTemas } from "./filosofia/temas_basicos.js";

export const materias = {
    // 'etica' ahora apunta a un array de objetos 'temas'
    'ética': [
        eticaAristotelicaTemas,
        eticaEstoicaTemas,
        eticaHumeTemas
        // eticaModernaTemas, // Descomenta cuando lo tengas
    ],
    'ética 2':[
        eticaEstoicaTemas,
    ]
    // 'filosofia': [
    //    filosofiaTemas,
    // ],
    // Añade más materias y sus arrays de temas aquí
};
