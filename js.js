// Datos en formato JSON (sin id)
import {
    primera_clase,
    segunda_clase,
    etica_aristotelica_3,
    acercaDelAlma3_10,
    etica2_virtud,
    etica3_intelectuales,
    // Puedes importar más temas aquí
} from "./data/etica.js";

// --- Nueva sección: Configuración de temas ---
// Creamos un objeto para mapear nombres de temas con sus datos
// Esto facilita la creación dinámica de botones y la carga de contenido
const temas = {
    'primera_clase': primera_clase,
    'segunda_clase': segunda_clase,
    'etica_aristotelica_3': etica_aristotelica_3,
    'acercaDelAlma3_10': acercaDelAlma3_10,
    'etica2_virtud': etica2_virtud,
    'etica3_intelectuales': etica3_intelectuales,
    // Añade más temas aquí siguiendo el patrón: 'nombreTema': nombreTema
};

let currentlyLoadedButton = null; // Variable para rastrear el botón del tema actualmente cargado

// Función para crear los botones de temas dinámicamente
function createThemeButtons() {
    const themesContainer = document.getElementById('themes-container');
    themesContainer.innerHTML = ''; // Limpiar cualquier contenido previo

    for (const [nombreTema, datosTema] of Object.entries(temas)) {
        // Crear el botón
        const button = document.createElement('button');
        button.className = 'tema'; // Clase CSS
        button.textContent = `Tema: ${nombreTema}`; // Texto del botón
        button.dataset.tema = nombreTema; // Almacenar el nombre del tema en un atributo data

        // Añadir el botón al contenedor
        themesContainer.appendChild(button);
    }
}

// Llamar a la función para crear los botones cuando se cargue el script
createThemeButtons();
// --- Fin de la nueva sección ---

// Función para cargar el contenido basado en el tema seleccionado
function loadContent(paragraphs, buttonElement) { // Añadido buttonElement como parámetro
    const contentContainer = document.getElementById('content-container');
    const speechSynthesis = window.speechSynthesis;
    let activeUtterance = null;
    let activeContainer = null;
    let isPaused = false; // Bandera para controlar el estado de pausa

    // --- Modificación: Resetear botones de temas y estado anterior ---
    resetAllButtons(); // Esto reactivará el botón del tema anterior
    if (currentlyLoadedButton) {
        // Opcionalmente, revertir el texto del botón anterior si se cambió
        // (Ajusta esto según cómo quieras que se vea el botón "cargado")
        if (currentlyLoadedButton.textContent.includes("(Cargado)")) {
             currentlyLoadedButton.textContent = currentlyLoadedButton.textContent.replace(" (Cargado)", "");
        }
    }
    // --- Fin de la modificación ---

    // Limpiar contenido anterior si existe
    contentContainer.innerHTML = '';

    // Renderizar los párrafos desde el JSON recibido como parámetro
    paragraphs.forEach(item => {
        const container = document.createElement('div');
        container.className = 'paragraph-container';

        const paragraph = document.createElement('p');
        // Aplicar mejora: Interpretar HTML dentro del texto
        paragraph.innerHTML = item.text;

        const controls = document.createElement('div');
        controls.className = 'paragraph-controls';

        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.textContent = '▶ Play';

        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'pause-btn';
        pauseBtn.textContent = '⏸ Pausa';
        pauseBtn.disabled = true;

        const stopBtn = document.createElement('button');
        stopBtn.className = 'stop-btn';
        stopBtn.textContent = '⏹ Detener';
        stopBtn.disabled = true;

        controls.appendChild(playBtn);
        controls.appendChild(pauseBtn);
        controls.appendChild(stopBtn);

        container.appendChild(paragraph);
        container.appendChild(controls);
        contentContainer.appendChild(container);

        // Funcionalidad de los botones
        playBtn.addEventListener('click', () => {
            if (isPaused) {
                // Si está pausado, reanudar
                speechSynthesis.resume();
                isPaused = false;
                playBtn.textContent = '▶ Play';
                pauseBtn.textContent = '⏸ Pausa';
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
            } else {
                // Si no está pausado, iniciar nueva lectura
                startReading(container, paragraph, playBtn, pauseBtn, stopBtn);
            }
        });

        pauseBtn.addEventListener('click', () => {
            if (speechSynthesis.speaking && !isPaused) {
                // Pausar la lectura
                speechSynthesis.pause();
                isPaused = true;
                playBtn.textContent = '▶ Reanudar';
                pauseBtn.textContent = '⏹ Detener'; // Cambiar texto a Detener mientras está pausado
            } else if (isPaused) {
                // Si ya está pausado, detener completamente
                stopReading(container, paragraph, playBtn, pauseBtn, stopBtn);
            }
        });

        stopBtn.addEventListener('click', () => stopReading(container, paragraph, playBtn, pauseBtn, stopBtn));
    });

    // Mostrar el contenido
    contentContainer.style.display = 'block';

    // --- Modificación: Cambiar texto y estado del botón específico ---
    if (buttonElement) {
        buttonElement.textContent = `${buttonElement.textContent} (Cargado)`;
        buttonElement.disabled = true;
        currentlyLoadedButton = buttonElement; // Registrar el botón actualmente cargado
    }
    // --- Fin de la modificación ---

    // Función para iniciar lectura
    function startReading(container, paragraph, playBtn, pauseBtn, stopBtn) {
        // Cancelar cualquier lectura activa anterior
        if (activeUtterance) {
            speechSynthesis.cancel();
            resetControlButtons(); // Solo resetear botones de control aquí
        }

        clearAllHighlights();
        paragraph.classList.add('highlight');

        activeUtterance = new SpeechSynthesisUtterance(paragraph.textContent);
        activeContainer = container;
        isPaused = false; // Reiniciar estado de pausa

        // Configurar estado de botones de control
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        playBtn.textContent = '▶ Play'; // Asegurar texto inicial
        pauseBtn.textContent = '⏸ Pausa'; // Asegurar texto inicial

        activeUtterance.onend = () => {
            paragraph.classList.remove('highlight');
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            activeUtterance = null;
            activeContainer = null;
            isPaused = false;
        };

        activeUtterance.onerror = (event) => {
            console.error("Error en la síntesis de voz:", event);
            stopReading(container, paragraph, playBtn, pauseBtn, stopBtn);
        };

        speechSynthesis.speak(activeUtterance);
    }

    // Función para detener lectura (y limpiar estado)
    function stopReading(container, paragraph, playBtn, pauseBtn, stopBtn) {
        speechSynthesis.cancel();
        paragraph.classList.remove('highlight');
        playBtn.disabled = false;
        playBtn.textContent = "▶ Play";
        pauseBtn.disabled = true;
        pauseBtn.textContent = "⏸ Pausa";
        stopBtn.disabled = true;
        activeUtterance = null;
        activeContainer = null;
        isPaused = false; // Reiniciar estado de pausa
    }

    // Función para limpiar resaltados
    function clearAllHighlights() {
        document.querySelectorAll('p').forEach(p => p.classList.remove('highlight'));
    }

    // Función para reiniciar solo los botones de control de audio
    function resetControlButtons() {
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.disabled = false;
            btn.textContent = "▶ Play";
        });
        document.querySelectorAll('.pause-btn').forEach(btn => {
            btn.disabled = true;
            btn.textContent = "⏸ Pausa";
        });
        document.querySelectorAll('.stop-btn').forEach(btn => btn.disabled = true);
    }

    // Función para limpiar resaltados y reiniciar todos los botones (control y temas)
    function resetAllButtons() {
        resetControlButtons();
        // Reactivar todos los botones de tema
        document.querySelectorAll('.tema').forEach(btn => {
            btn.disabled = false;
            // Opcionalmente, revertir el texto si se cambió
            // (Ajusta esto según cómo quieras que se vea el botón "cargado")
             if (btn.textContent.includes("(Cargado)")) {
                 btn.textContent = btn.textContent.replace(" (Cargado)", "");
             }
        });
    }
}

// --- Nueva sección: Event Listener genérico ---
// Añadimos un solo event listener al contenedor de temas
// que manejará los clics en los botones hijos con clase 'tema'
document.getElementById('themes-container').addEventListener('click', (event) => {
    // Verificar si el elemento clickeado es un botón con la clase 'tema'
    if (event.target.classList.contains('tema')) {
        const nombreTema = event.target.dataset.tema; // Obtener el nombre del tema del atributo data
        const datosTema = temas[nombreTema]; // Obtener los datos del tema del objeto 'temas'

        if (datosTema) {
            // Llamar a loadContent pasando los datos del tema y el elemento botón
            loadContent(datosTema, event.target);
        } else {
            console.error(`Tema '${nombreTema}' no encontrado.`);
        }
    }
});
// --- Fin de la nueva sección ---

// Limpiar cualquier lectura activa al salir
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});