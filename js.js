// js.js

// --- Constantes para las etiquetas de los botones ---
const LABEL_PLAY = '▶ Play';
const LABEL_PAUSE = '⏸ Pausa';
const LABEL_RESUME = '▶ Reanudar';
const LABEL_STOP = '⏹ Detener';
const LABEL_HIDE_FOLDERS = ' (Ocultar carpetas)';
const LABEL_HIDE_THEMES = ' (Ocultar temas)';
const LABEL_LOADED = ' (Cargado)';

// --- Importar las materias ---
// Se asume que materias.js exporta un objeto con la estructura:
// { 'nombre_materia_key': [ { tema: 'Nombre Carpeta 1', temas: { ... } }, ... ], ... }
import { materias } from "./data/materias.js";

let currentlyLoadedButton = null; // Variable para rastrear el botón del tema actualmente cargado
let activeMateriaKey = null; // Variable para rastrear la materia cuyas carpetas se muestran

// --- Nueva sección: Crear estructura principal ---
function initializeApp() {
    // Obtener los contenedores ya definidos en el HTML
    const mainMateriasContainer = document.getElementById('main-materias-container');
    const selectedFoldersContainer = document.getElementById('selected-folders-container');
    const selectedThemesContainer = document.getElementById('selected-themes-container');
    const contentContainer = document.getElementById('content-container');

    // Verificaciones de seguridad
    if (!mainMateriasContainer || !selectedFoldersContainer || !selectedThemesContainer || !contentContainer) {
        console.error("No se encontraron uno o más contenedores necesarios en el HTML.");
        return;
    }

    // Limpiar cualquier contenido residual en los contenedores
    mainMateriasContainer.innerHTML = '';
    selectedFoldersContainer.innerHTML = '';
    selectedThemesContainer.innerHTML = '';
    contentContainer.innerHTML = '';
    contentContainer.style.display = 'none'; // Asegurar que esté oculto

    // Iterar sobre cada materia importada
    for (const [nombreMateriaKey, arrayOfFolderObjects] of Object.entries(materias)) {

        // Crear el botón principal para la materia
        const mainButton = document.createElement('button');
        mainButton.className = 'tema principal';
        mainButton.textContent = nombreMateriaKey; // Usar directamente la clave
        mainButton.id = `main-materia-button-${nombreMateriaKey.replace(/\s+/g, '_')}`;
        mainButton.dataset.materia = nombreMateriaKey.replace(/\s+/g, '_');

        // Añadir el botón al contenedor de materias
        mainMateriasContainer.appendChild(mainButton);

        // --- Evento para mostrar/ocultar carpetas de la materia ---
        mainButton.addEventListener('click', () => {
            const isSelected = activeMateriaKey === nombreMateriaKey.replace(/\s+/g, '_');

            // Limpiar selección anterior de botones de materia
            document.querySelectorAll('#main-materias-container .tema.principal').forEach(btn => {
                btn.classList.remove('active');
            });

            if (isSelected) {
                // Si se hace clic en la materia ya activa, ocultar carpetas y temas
                selectedFoldersContainer.style.display = 'none';
                selectedFoldersContainer.innerHTML = '';
                selectedThemesContainer.style.display = 'none';
                selectedThemesContainer.innerHTML = '';
                // Ocultar también el contenido
                contentContainer.style.display = 'none';
                contentContainer.innerHTML = '';
                activeMateriaKey = null;

            } else {
                // Seleccionar nueva materia
                mainButton.classList.add('active');
                activeMateriaKey = nombreMateriaKey.replace(/\s+/g, '_');

                // Limpiar y preparar el contenedor de carpetas seleccionadas
                selectedFoldersContainer.innerHTML = '';
                const title = document.createElement('h2');
                title.id = 'selected-folders-title';
                title.textContent = `Carpetas en "${nombreMateriaKey}"`;
                selectedFoldersContainer.appendChild(title);

                const foldersWrapper = document.createElement('div');
                foldersWrapper.className = 'folders-container';
                foldersWrapper.id = `folders-wrapper-${nombreMateriaKey.replace(/\s+/g, '_')}`;
                selectedFoldersContainer.appendChild(foldersWrapper);

                selectedFoldersContainer.style.display = 'block';

                // Limpiar contenedor de temas y contenido
                selectedThemesContainer.style.display = 'none';
                selectedThemesContainer.innerHTML = '';
                // Ocultar contenido
                contentContainer.style.display = 'none';
                contentContainer.innerHTML = '';

                // Crear los botones de carpetas
                const foldersArray = Array.isArray(arrayOfFolderObjects) ? arrayOfFolderObjects : [arrayOfFolderObjects];
                foldersArray.forEach(folderObject => {
                    if (!folderObject || typeof folderObject !== 'object' || !folderObject.temas) {
                        console.error("Objeto de carpeta inválido encontrado para la materia:", nombreMateriaKey, folderObject);
                        return;
                    }
                    // Pasar el nombre de la materia y el objeto de la carpeta
                    createFolderButtons(nombreMateriaKey.replace(/\s+/g, '_'), folderObject, foldersWrapper);
                });
            }
        });
        // --- Fin del evento ---
    }
}
// --- Fin de la nueva sección ---

// Función para crear los botones de carpetas dinámicamente
function createFolderButtons(nombreMateriaKey, folderObject, container) {
    // Crear un botón para la carpeta
    const folderButton = document.createElement('button');
    folderButton.className = 'tema carpeta';
    // Usar el nombre de la carpeta del objeto, o un nombre genérico si no existe
    folderButton.textContent = folderObject.tema || `Carpeta (${Object.keys(folderObject.temas || {}).length} temas)`;
    folderButton.dataset.materia = nombreMateriaKey;
    // Crear un identificador único para la carpeta
    const folderId = folderObject.tema ? folderObject.tema.replace(/\s+/g, '_') : `carpeta_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    folderButton.dataset.folder = folderId;

    folderButton.addEventListener('click', () => {
        // Limpiar contenedor de temas
        const selectedThemesContainer = document.getElementById('selected-themes-container');
        // Limpiar también el contenido al cambiar de carpeta
        const contentContainer = document.getElementById('content-container');
        contentContainer.style.display = 'none';
        contentContainer.innerHTML = '';

        selectedThemesContainer.style.display = 'none';
        selectedThemesContainer.innerHTML = '';

        // Mostrar título de la carpeta
        const title = document.createElement('h3');
        title.id = 'selected-themes-title';
        title.textContent = `Temas en "${folderButton.textContent}"`;
        selectedThemesContainer.appendChild(title);

        const themesWrapper = document.createElement('div');
        themesWrapper.className = 'themes-container';
        themesWrapper.id = `themes-wrapper-${nombreMateriaKey}-${folderId}`;
        selectedThemesContainer.appendChild(themesWrapper);

        selectedThemesContainer.style.display = 'block';

        // Crear botones de temas dentro de esta carpeta
        for (const [nombreTema, datosTema] of Object.entries(folderObject.temas)) {
            const themeButton = document.createElement('button');
            themeButton.className = 'tema subtema';
            themeButton.textContent = nombreTema.replace(/_/g, ' ');
            themeButton.dataset.materia = nombreMateriaKey;
            themeButton.dataset.folder = folderId;
            themeButton.dataset.tema = nombreTema;

            themeButton.addEventListener('click', () => {
                themeButton.disabled = true;
                loadContent(nombreMateriaKey, folderId, nombreTema, datosTema, themeButton);
            });

            themesWrapper.appendChild(themeButton);
        }
    });

    container.appendChild(folderButton);
}

// Función para cargar el contenido basado en el tema seleccionado
function loadContent(nombreMateriaKey, folderId, nombreTema, paragraphs, buttonElement) {
    // Obtener el contenedor de contenido ya existente del HTML
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) {
        console.error("No se encontró el contenedor de contenido #content-container");
        if(buttonElement) buttonElement.disabled = false;
        return;
    }

    // Asociar el contenido mostrado con la materia y carpeta para facilitar el reseteo
    contentContainer.dataset.materia = nombreMateriaKey;
    contentContainer.dataset.folder = folderId;
    const speechSynthesis = window.speechSynthesis;
    let activeUtterance = null;
    let activeContainer = null;
    let isPaused = false;

    // Limpiar contenido anterior si existe
    contentContainer.innerHTML = '';

    // Renderizar los párrafos
    paragraphs.forEach(item => {
        const container = document.createElement('div');
        container.className = 'paragraph-container';

        const paragraph = document.createElement('p');
        paragraph.innerHTML = item.text;

        const controls = document.createElement('div');
        controls.className = 'paragraph-controls';

        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.textContent = LABEL_PLAY;

        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'pause-btn';
        pauseBtn.textContent = LABEL_PAUSE;
        pauseBtn.disabled = true;

        const stopBtn = document.createElement('button');
        stopBtn.className = 'stop-btn';
        stopBtn.textContent = LABEL_STOP;
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
                speechSynthesis.resume();
                isPaused = false;
                playBtn.textContent = LABEL_PLAY;
                pauseBtn.textContent = LABEL_PAUSE;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
            } else {
                startReading(container, paragraph, playBtn, pauseBtn, stopBtn);
            }
        });

        pauseBtn.addEventListener('click', () => {
            if (speechSynthesis.speaking && !isPaused) {
                speechSynthesis.pause();
                isPaused = true;
                playBtn.textContent = LABEL_RESUME;
                pauseBtn.textContent = LABEL_STOP; // Cambiar texto a Detener mientras está pausado
            } else if (isPaused) {
                stopReading(container, paragraph, playBtn, pauseBtn, stopBtn);
            }
        });

        stopBtn.addEventListener('click', () => stopReading(container, paragraph, playBtn, pauseBtn, stopBtn));
    });

    // Mostrar el contenido
    contentContainer.style.display = 'block';

    // --- Modificación: Cambiar texto y estado del botón específico ---
    if (buttonElement) {
        // Resetear otros botones de temas en esta carpeta
        const themesWrapper = document.getElementById(`themes-wrapper-${nombreMateriaKey}-${folderId}`);
        if (themesWrapper) {
            themesWrapper.querySelectorAll('.tema.subtema').forEach(btn => {
                btn.disabled = false;
                if (btn.textContent.endsWith(LABEL_LOADED)) {
                    btn.textContent = btn.textContent.slice(0, -LABEL_LOADED.length);
                }
            });
        }
        buttonElement.textContent = `${buttonElement.textContent}${LABEL_LOADED}`;
        currentlyLoadedButton = buttonElement;
        // Reactivar el botón al finalizar la carga (aunque es síncrono aquí)
        buttonElement.disabled = false;
    }
    // --- Fin de la modificación ---

    function startReading(container, paragraph, playBtn, pauseBtn, stopBtn) {
        if (activeUtterance) {
            speechSynthesis.cancel();
            resetControlButtons(); // Resetear solo botones de control
        }

        clearAllHighlights();
        paragraph.classList.add('highlight');

        activeUtterance = new SpeechSynthesisUtterance(paragraph.textContent);
        activeContainer = container;
        isPaused = false;

        playBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        playBtn.textContent = LABEL_PLAY;
        pauseBtn.textContent = LABEL_PAUSE;

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

    function stopReading(container, paragraph, playBtn, pauseBtn, stopBtn) {
        speechSynthesis.cancel();
        paragraph.classList.remove('highlight');
        playBtn.disabled = false;
        playBtn.textContent = LABEL_PLAY;
        pauseBtn.disabled = true;
        pauseBtn.textContent = LABEL_PAUSE;
        stopBtn.disabled = true;
        activeUtterance = null;
        activeContainer = null;
        isPaused = false;
    }

    function clearAllHighlights() {
        document.querySelectorAll('p').forEach(p => p.classList.remove('highlight'));
    }

    function resetControlButtons() {
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.disabled = false;
            btn.textContent = LABEL_PLAY;
        });
        document.querySelectorAll('.pause-btn').forEach(btn => {
            btn.disabled = true;
            btn.textContent = LABEL_PAUSE;
        });
        document.querySelectorAll('.stop-btn').forEach(btn => btn.disabled = true);
    }
}

// --- Inicializar la aplicación al cargar ---
document.addEventListener('DOMContentLoaded', initializeApp);

// Limpiar cualquier lectura activa al salir
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});