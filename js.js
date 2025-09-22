// Datos en formato JSON (sin id)
import {
    etica1
    // Puedes importar más temas aquí
} from "./data/etica.js";

// Función para cargar el contenido basado en el tema seleccionado
function loadContent(paragraphs) {
    const contentContainer = document.getElementById('content-container');
    const speechSynthesis = window.speechSynthesis;
    let activeUtterance = null;
    let activeContainer = null;
    let isPaused = false; // Bandera para controlar el estado de pausa

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

    // Función para iniciar lectura
    function startReading(container, paragraph, playBtn, pauseBtn, stopBtn) {
        // Cancelar cualquier lectura activa anterior
        if (activeUtterance) {
            speechSynthesis.cancel();
            resetAllButtons();
        }

        clearAllHighlights();
        paragraph.classList.add('highlight');

        activeUtterance = new SpeechSynthesisUtterance(paragraph.textContent);
        activeContainer = container;
        isPaused = false; // Reiniciar estado de pausa

        // Configurar estado de botones
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

    // Función para reiniciar todos los botones a su estado inicial
    function resetAllButtons() {
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
}

// Añadir el evento listener al botón de tema
document.getElementById('etica1').addEventListener('click', () => {
    loadContent(etica1);
    // Opcional: Cambiar el texto del botón después de cargar
    const btn = document.getElementById('etica1');
    btn.textContent = 'Tema 1 (Cargado)';
    btn.disabled = true;
});

// Limpiar cualquier lectura activa al salir
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});