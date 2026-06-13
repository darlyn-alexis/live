// URL de la API local (nuestro proxy Node.js)
const API_URL = "/api/fixtures";
const STREAM_API_URL = "/api/livestream?id=";

// Estado global de la aplicación
let allFixtures = [];
let allLeagues = [];
let allChannels = [];
let allChannels2 = [];
let allChannels3 = [];
let allChannels4 = [];
let allChannels5 = [];
let allChannels6 = [];
let channelLogos = [];
let allAgenda = [];
let allAgenda2 = [];
let currentFilter = 'all'; // 'all', 'live', 'upcoming', 'channels', 'agenda'
let currentLeagueFilter = 'all'; // 'all' or league id
let currentAlphabetFilter = null; // null or 'A', 'B', etc.
let searchQuery = '';

// Elementos del DOM - Dashboard
const fixturesGrid = document.getElementById('fixtures-grid');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.controls-section .filter-btn');
const leaguesCarousel = document.getElementById('leagues-carousel');
const alphabetContainer = document.getElementById('alphabet-container');
const channelsSourcesSection = document.getElementById('channels-sources-section');
const sourceBtns = channelsSourcesSection.querySelectorAll('.filter-btn');
const agendaSourcesSection = document.getElementById('agenda-sources-section');
const agendaSourceBtns = agendaSourcesSection.querySelectorAll('.filter-btn');

let currentChannelSource = 'live_tv_1'; // 'live_tv_1' or 'live_tv_2'
let currentAgendaSource = 'agenda_1'; // 'agenda_1' or 'agenda_2'

// Elementos del DOM - Modal
const streamModal = document.getElementById('stream-modal');
const modalMatchTitle = document.getElementById('modal-match-title');
const modalMatchLeague = document.getElementById('modal-match-league');
const streamOptionsContainer = document.getElementById('stream-options-container');
const playerContainer = document.getElementById('player-container');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalMatchDetails = document.getElementById('modal-match-details');

// Instancia global del reproductor Hls.js
window.currentHlsInstance = null;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupEventListeners();
    await loadLeagues();
    loadChannels(); // No esperamos para que no bloquee los fixtures
    loadAgenda();   // No esperamos para que no bloquee los fixtures
    await loadFixtures();
}

async function loadAgenda() {
    try {
        const [agenda1Res, agenda2Res] = await Promise.all([
            fetch('/api/agenda').catch(() => ({ ok: false })),
            fetch('/api/agenda2').catch(() => ({ ok: false }))
        ]);

        if (agenda1Res.ok) {
            const data1 = await agenda1Res.json();
            if (Array.isArray(data1)) {
                // Agrupar agenda 1
                const grouped = {};
                data1.forEach(evento => {
                    const key = evento.title + (evento.time || '');
                    if (!grouped[key]) {
                        grouped[key] = { ...evento, links: [] };
                    }
                    if (evento.link) {
                        grouped[key].links.push({
                            url: evento.link,
                            language: evento.language || 'Latino'
                        });
                    }
                });
                allAgenda = Object.values(grouped);
            }
        }

        if (agenda2Res.ok) {
            const data2 = await agenda2Res.json();
            if (data2 && Array.isArray(data2.events)) {
                // Mapear agenda 2 al formato estandarizado
                allAgenda2 = data2.events.map(ev => {
                    return {
                        title: ev.title,
                        category: ev.category,
                        time: ev.time,
                        date: '',
                        status: ev.links && ev.links.some(l => l.status === 'live') ? 'En vivo' : 'Próximo',
                        links: (ev.links || []).map(l => ({
                            url: l.url,
                            language: (l.lang && l.lang.label) || 'Latino',
                            name: l.server || 'Opción'
                        }))
                    };
                });
            }
        }
    } catch (error) {
        console.error("Error al cargar agenda:", error);
    }
}

async function loadChannels() {
    try {
        const [channelsRes, logosRes, channels2Res, channels3Res, channels4Res, channels5Res, channels6Res] = await Promise.all([
            fetch('/api/channels').catch(() => ({ ok: false })),
            fetch('/api/channel-logos').catch(() => ({ ok: false })),
            fetch('/api/channels2').catch(() => ({ ok: false })),
            fetch('/api/channels3').catch(() => ({ ok: false })),
            fetch('/api/channels4').catch(() => ({ ok: false })),
            fetch('/api/channels5').catch(() => ({ ok: false })),
            fetch('/api/channels6').catch(() => ({ ok: false }))
        ]);

        if (logosRes.ok) {
            const logosData = await logosRes.json();
            if (logosData && logosData.LATINOAMERICA) {
                channelLogos = logosData.LATINOAMERICA;
            }
        }

        if (channelsRes.ok) {
            const channelsData = await channelsRes.json();
            if (channelsData && channelsData.LATINOAMERICA) {
                allChannels = channelsData.LATINOAMERICA;
            }
        }

        if (channels2Res.ok) {
            const channels2Data = await channels2Res.json();
            if (Array.isArray(channels2Data)) {
                allChannels2 = channels2Data;
            }
        }

        if (channels3Res.ok) {
            const channels3Data = await channels3Res.json();
            if (Array.isArray(channels3Data)) {
                allChannels3 = channels3Data.map(ch => ({
                    Canal: ch.name,
                    Link: ch.url,
                    Estado: 'Activo'
                }));
            }
        }

        if (channels4Res.ok) {
            const channels4Data = await channels4Res.json();
            if (Array.isArray(channels4Data)) {
                allChannels4 = channels4Data.map(ch => {
                    const options = [];
                    Object.keys(ch).forEach(key => {
                        if (key.startsWith('url') && ch[key]) {
                            options.push({
                                name: 'Opción ' + key.replace('url', ''),
                                url: ch[key],
                                language: 'HD'
                            });
                        }
                    });

                    return {
                        Canal: ch.name,
                        Estado: 'Activo',
                        Options: options
                    };
                });
            }
        }

        if (channels5Res.ok) {
            const channels5Data = await channels5Res.json();
            if (Array.isArray(channels5Data)) {
                allChannels5 = channels5Data.map(ch => ({
                    Canal: ch.name,
                    Link: ch.url,
                    Estado: 'Activo'
                }));
            }
        }

        if (channels6Res.ok) {
            const channels6Data = await channels6Res.json();
            if (Array.isArray(channels6Data)) {
                allChannels6 = channels6Data.map(ch => ({
                    Canal: ch.name,
                    Link: ch.url,
                    Estado: 'Activo'
                }));
            }
        }
    } catch (error) {
        console.error("Error al cargar canales:", error);
    }
}

// Configurar escuchas de eventos
function setupEventListeners() {
    // Escucha de búsqueda
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderFixtures();
    });

    // Escucha de botones de filtro
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderFixtures();
        });
    });

    // Escucha de botones de fuentes de canales
    sourceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            sourceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChannelSource = btn.dataset.source;
            renderFixtures();
        });
    });

    // Escucha de botones de fuentes de agenda
    agendaSourceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            agendaSourceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAgendaSource = btn.dataset.source;
            renderFixtures();
        });
    });

    // Escucha para cerrar el modal
    closeModalBtn.addEventListener('click', closeStreamModal);
    
    // Cerrar modal al hacer clic en el fondo oscuro
    streamModal.addEventListener('click', (e) => {
        if (e.target === streamModal) {
            closeStreamModal();
        }
    });

    // Evitar cerrar modal al presionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && streamModal.style.display !== 'none') {
            closeStreamModal();
        }
    });
}

async function loadLeagues() {
    try {
        const response = await fetch('/api/leagues');
        if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                // Sort by priority (descending usually, or ascending depending on API, but let's just take top 20 or all)
                allLeagues = data.data.sort((a, b) => b.priority - a.priority);
                renderAlphabet();
                renderLeagues();
            }
        }
    } catch (error) {
        console.error("Error al obtener las ligas:", error);
    }
}

function renderAlphabet() {
    if (!alphabetContainer) return;
    alphabetContainer.innerHTML = '';

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    // Botón para borrar filtro de alfabeto
    const allAlphaBtn = document.createElement('button');
    allAlphaBtn.className = `alphabet-btn ${currentAlphabetFilter === null ? 'active' : ''}`;
    allAlphaBtn.textContent = 'All';
    allAlphaBtn.style.width = 'auto';
    allAlphaBtn.style.padding = '0 10px';
    allAlphaBtn.onclick = () => {
        currentAlphabetFilter = null;
        renderAlphabet();
        renderLeagues();
    };
    alphabetContainer.appendChild(allAlphaBtn);

    letters.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = `alphabet-btn ${currentAlphabetFilter === letter ? 'active' : ''}`;
        btn.textContent = letter;
        btn.onclick = () => {
            currentAlphabetFilter = letter;
            renderAlphabet();
            renderLeagues();
        };
        alphabetContainer.appendChild(btn);
    });
}

function renderLeagues() {
    if (!leaguesCarousel) return;
    
    leaguesCarousel.innerHTML = '';
    
    // Botón para "Todas" las ligas
    const allBtn = document.createElement('button');
    allBtn.className = `league-btn ${currentLeagueFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = '🏆 Todas las Ligas';
    allBtn.onclick = () => {
        currentLeagueFilter = 'all';
        renderLeagues(); // Para actualizar clases active
        renderFixtures();
    };
    leaguesCarousel.appendChild(allBtn);

    let filteredLeagues = allLeagues;
    
    if (currentAlphabetFilter !== null) {
        filteredLeagues = filteredLeagues.filter(league => {
            if (!league.name) return false;
            return league.name.charAt(0).toUpperCase() === currentAlphabetFilter;
        });
    }

    filteredLeagues.forEach(league => {
        const btn = document.createElement('button');
        btn.className = `league-btn ${currentLeagueFilter === league.id ? 'active' : ''}`;
        btn.textContent = league.name;
        btn.onclick = () => {
            currentLeagueFilter = league.id;
            renderLeagues(); // Update active states
            renderFixtures();
        };
        leaguesCarousel.appendChild(btn);
    });
}

// Cargar fixtures desde los endpoints de proxy locales
async function loadFixtures() {
    showLoading();
    try {
        // Peticiones en paralelo a ambos endpoints
        const [featuredRes, liveRes] = await Promise.all([
            fetch('/api/fixtures').catch(e => ({ ok: false, error: e })),
            fetch('/api/fixtures/livestream').catch(e => ({ ok: false, error: e }))
        ]);

        let combinedData = [];

        if (featuredRes.ok) {
            const result = await featuredRes.json();
            if (result && result.error === 0 && Array.isArray(result.data)) {
                combinedData = combinedData.concat(result.data);
            }
        }

        if (liveRes.ok) {
            const result = await liveRes.json();
            if (result && result.error === 0 && Array.isArray(result.data)) {
                combinedData = combinedData.concat(result.data);
            }
        }

        if (combinedData.length === 0) {
            throw new Error("No se pudieron cargar datos o no hay encuentros disponibles.");
        }

        // Eliminar duplicados por ID de encuentro
        const uniqueFixtures = new Map();
        combinedData.forEach(fixture => {
            uniqueFixtures.set(fixture.id, fixture);
        });
        
        // Convertir de nuevo a array y ordenar por fecha (los más recientes primero) o simplemente dejarlos así
        allFixtures = Array.from(uniqueFixtures.values());
        
        // Ordenar: Los que están en vivo primero, luego por fecha de inicio
        allFixtures.sort((a, b) => {
            if (a.playing && !b.playing) return -1;
            if (!a.playing && b.playing) return 1;
            return a.start_at - b.start_at;
        });

    } catch (error) {
        console.error("Error al obtener los encuentros:", error);
        showError(error.message);
        return;
    }
    renderFixtures();
}

// Mostrar spinner de carga
function showLoading() {
    fixturesGrid.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
            <p style="color: var(--text-secondary)">Obteniendo encuentros reales desde la API...</p>
        </div>
    `;
}

// Mostrar mensaje de error en dashboard
function showError(message) {
    fixturesGrid.innerHTML = `
        <div class="spinner-container" style="grid-column: 1 / -1; text-align: center; gap: 24px;">
            <div style="color: #ef4444; font-size: 3rem;">⚠️</div>
            <div>
                <h3 style="margin-bottom: 8px;">Error al Cargar Datos Reales</h3>
                <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto; font-size: 0.95rem;">
                    No pudimos obtener la información de AX Sports. Asegúrate de que el servidor local <code>server.js</code> esté corriendo.<br>
                    <small style="color: var(--text-muted); display: block; margin-top: 8px;">Detalles: ${message}</small>
                </p>
            </div>
            <button onclick="loadFixtures()" class="filter-btn active" style="margin-top: 10px; cursor: pointer;">Reintentar Conexión</button>
        </div>
    `;
}

// Formatear Timestamp Unix a hora local legible
function formatMatchTime(timestampSeconds) {
    const matchDate = new Date(timestampSeconds * 1000);
    const now = new Date();
    
    // Comparar si es hoy o mañana
    const isToday = matchDate.getDate() === now.getDate() && 
                    matchDate.getMonth() === now.getMonth() && 
                    matchDate.getFullYear() === now.getFullYear();
                    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = matchDate.getDate() === tomorrow.getDate() &&
                       matchDate.getMonth() === tomorrow.getMonth() &&
                       matchDate.getFullYear() === tomorrow.getFullYear();

    const hours = String(matchDate.getHours()).padStart(2, '0');
    const minutes = String(matchDate.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (isToday) {
        return `Hoy, ${timeString}`;
    } else if (isTomorrow) {
        return `Mañana, ${timeString}`;
    } else {
        const options = { day: 'numeric', month: 'short' };
        return `${matchDate.toLocaleDateString('es-ES', options)}, ${timeString}`;
    }
}

// Renderizar las tarjetas filtradas en el DOM
function renderFixtures() {
    if (channelsSourcesSection) {
        channelsSourcesSection.style.display = currentFilter === 'channels' ? 'block' : 'none';
    }

    if (agendaSourcesSection) {
        agendaSourcesSection.style.display = currentFilter === 'agenda' ? 'block' : 'none';
    }

    if (currentFilter === 'channels') {
        renderChannels();
        return;
    }
    
    if (currentFilter === 'agenda') {
        renderAgenda();
        return;
    }

    // Aplicar filtros
    let filtered = allFixtures.filter(fixture => {
        // Filtro de estado
        let matchState = true;
        if (currentFilter === 'live') {
            matchState = fixture.playing === true;
        } else if (currentFilter === 'upcoming') {
            matchState = fixture.playing === false;
        }
        
        // Filtro de liga
        let matchLeague = true;
        if (currentLeagueFilter !== 'all') {
            matchLeague = fixture.league?.id === currentLeagueFilter;
        }
        
        return matchState && matchLeague;
    });

    // Aplicar buscador
    if (searchQuery !== '') {
        filtered = filtered.filter(fixture => {
            const localName = (fixture.localteam?.name || '').toLowerCase();
            const visitorName = (fixture.visitorteam?.name || '').toLowerCase();
            const leagueName = (fixture.league?.name || '').toLowerCase();
            
            return localName.includes(searchQuery) || 
                   visitorName.includes(searchQuery) || 
                   leagueName.includes(searchQuery);
        });
    }

    // Limpiar contenedor
    fixturesGrid.innerHTML = '';

    if (filtered.length === 0) {
        fixturesGrid.innerHTML = `
            <div class="spinner-container" style="grid-column: 1 / -1; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 1.1rem;">No se encontraron partidos reales para esta selección.</p>
            </div>
        `;
        return;
    }

    // Crear tarjetas
    filtered.forEach(fixture => {
        const isLive = fixture.playing;
        const localScore = fixture.scores?.localteam_score ?? 0;
        const visitorScore = fixture.scores?.visitorteam_score ?? 0;
        
        // Determinar ganadores para resaltar scores
        let localWinnerClass = '';
        let visitorWinnerClass = '';
        if (fixture.status === 'FT') { // Finalizado
            if (localScore > visitorScore) localWinnerClass = 'winner';
            else if (visitorScore > localScore) visitorWinnerClass = 'winner';
        }

        const card = document.createElement('div');
        card.className = 'fixture-card';
        card.id = `fixture-${fixture.id}`;
        
        // Agregar evento de click para abrir la transmisión
        card.addEventListener('click', () => openStreamModal(fixture));

        // Construir la URL de los escudos (si existen)
        const localLogo = fixture.localteam?.id 
            ? `https://i0.wp.com/image-ra-1.yeahscore1.com/football/teams/${fixture.localteam.id}.png`
            : 'https://placehold.co/64x64/1a2235/ffffff?text=' + (fixture.localteam?.code || 'LT');

        const visitorLogo = fixture.visitorteam?.id 
            ? `https://i0.wp.com/image-ra-1.yeahscore1.com/football/teams/${fixture.visitorteam.id}.png`
            : 'https://placehold.co/64x64/1a2235/ffffff?text=' + (fixture.visitorteam?.code || 'VT');

        let teamsHtml = '';
        if (fixture.localteam && fixture.visitorteam) {
            // Evento con equipos (Fútbol, etc.)
            teamsHtml = `
                <div class="team-row">
                    <div class="team-details">
                        <img src="${localLogo}" alt="${fixture.localteam?.name}" class="team-logo" onerror="this.src='https://placehold.co/64x64/1a2235/ffffff?text=LT'">
                        <span class="team-name">${fixture.localteam?.name || 'Local'}</span>
                    </div>
                    <span class="team-score ${localWinnerClass}">${isLive || fixture.status === 'FT' ? localScore : '-'}</span>
                </div>
                <div class="team-row">
                    <div class="team-details">
                        <img src="${visitorLogo}" alt="${fixture.visitorteam?.name}" class="team-logo" onerror="this.src='https://placehold.co/64x64/1a2235/ffffff?text=VT'">
                        <span class="team-name">${fixture.visitorteam?.name || 'Visitante'}</span>
                    </div>
                    <span class="team-score ${visitorWinnerClass}">${isLive || fixture.status === 'FT' ? visitorScore : '-'}</span>
                </div>
            `;
        } else {
            // Evento genérico (Tenis, MMA, Motor, etc.)
            teamsHtml = `
                <div class="team-row" style="justify-content: center; padding: 20px 0;">
                    <span class="team-name" style="font-size: 1.2rem; font-weight: 700; text-align: center;">${fixture.name || fixture.slug || 'Evento Deportivo'}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="card-header">
                <div class="league-info">
                    <span class="league-badge">${fixture.league?.country || 'INT'}</span>
                    <span>${fixture.league?.name || 'Liga'}</span>
                </div>
                <div>
                    ${isLive ? `
                        <span class="status-badge live">
                            <span class="live-dot"></span> EN VIVO
                        </span>
                    ` : `
                        <span class="status-badge upcoming">PRÓXIMO</span>
                    `}
                </div>
            </div>
            
            <div class="teams-area">
                ${teamsHtml}
            </div>
            
            <div class="card-footer">
                <div class="match-time">
                    <span>${formatMatchTime(fixture.start_at)}</span>
                </div>
                ${isLive && fixture.minute ? `
                    <span class="live-minute">Min. ${fixture.minute}'</span>
                ` : `
                    <span>${fixture.status === 'FT' ? 'Finalizado' : 'Fútbol'}</span>
                `}
            </div>
        `;
        
        fixturesGrid.appendChild(card);
    });
}

// Abrir el modal y cargar transmisiones
async function openStreamModal(fixture) {
    let titleText = '';
    if (fixture.localteam && fixture.visitorteam) {
        const localName = fixture.localteam?.name || 'Local';
        const visitorName = fixture.visitorteam?.name || 'Visitante';
        titleText = `${localName} vs ${visitorName}`;
    } else {
        titleText = fixture.name || fixture.slug || 'Evento en Directo';
    }
    
    const leagueName = fixture.league?.name || 'Liga Deportiva';
    
    // Configurar metadatos del partido en el modal
    modalMatchTitle.innerText = titleText;
    modalMatchLeague.innerText = leagueName;
    
    // Resetear y ocultar detalles del encuentro por defecto
    const modalMatchDetails = document.getElementById('modal-match-details');
    if (modalMatchDetails) {
        modalMatchDetails.style.display = 'none';
        modalMatchDetails.innerHTML = '';
    }
    
    // Mostrar modal
    streamModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    
    // Iniciar con spinner de carga dentro del reproductor
    playerContainer.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div class="spinner"></div>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Buscando transmisiones en vivo...</p>
        </div>
    `;
    streamOptionsContainer.innerHTML = '';

    try {
        // Ejecutar promesas en paralelo para acelerar la carga
        const streamPromise = fetch(`${STREAM_API_URL}${fixture.id}`);
        const detailsPromise = fetch(`/api/fixture-details?id=${fixture.id}`);

        const [streamResponse, detailsResponse] = await Promise.all([streamPromise, detailsPromise]);
        
        // Manejar datos de la transmisión
        if (streamResponse.ok) {
            const streamResult = await streamResponse.json();
            if (streamResult && streamResult.error === 0 && Array.isArray(streamResult.data) && streamResult.data.length > 0) {
                renderStreamOptions(streamResult.data);
            } else {
                showNoStreamsMessage();
            }
        } else {
            throw new Error("No se pudo conectar con el servidor de streaming");
        }

        // Manejar detalles del encuentro
        if (detailsResponse.ok) {
            const detailsResult = await detailsResponse.json();
            if (detailsResult && detailsResult.error === 0 && detailsResult.data) {
                const details = detailsResult.data;
                const isLive = details.playing;
                const localScore = details.scores?.localteam_score ?? 0;
                const visitorScore = details.scores?.visitorteam_score ?? 0;
                
                if (modalMatchDetails) {
                    if (details.localteam && details.visitorteam) {
                        const localLogo = details.localteam?.id 
                            ? `https://i0.wp.com/image-ra-1.yeahscore1.com/football/teams/${details.localteam.id}.png`
                            : 'https://placehold.co/64x64/1a2235/ffffff?text=' + (details.localteam?.code || 'LT');

                        const visitorLogo = details.visitorteam?.id 
                            ? `https://i0.wp.com/image-ra-1.yeahscore1.com/football/teams/${details.visitorteam.id}.png`
                            : 'https://placehold.co/64x64/1a2235/ffffff?text=' + (details.visitorteam?.code || 'VT');

                        modalMatchDetails.innerHTML = `
                            <div class="modal-team">
                                <img src="${localLogo}" alt="${details.localteam?.name}" onerror="this.src='https://placehold.co/64x64/1a2235/ffffff?text=LT'">
                                <span>${details.localteam?.name || localName}</span>
                            </div>
                            <div class="modal-score">
                                <span class="modal-score-numbers">${isLive || details.status === 'FT' ? `${localScore} - ${visitorScore}` : 'vs'}</span>
                                <span class="modal-match-status ${!isLive ? 'not-live' : ''}">
                                    ${isLive ? (details.minute ? `Min. ${details.minute}'` : 'EN VIVO') : (details.status === 'FT' ? 'Finalizado' : 'Próximo')}
                                </span>
                            </div>
                            <div class="modal-team">
                                <img src="${visitorLogo}" alt="${details.visitorteam?.name}" onerror="this.src='https://placehold.co/64x64/1a2235/ffffff?text=VT'">
                                <span>${details.visitorteam?.name || visitorName}</span>
                            </div>
                        `;
                    } else {
                        // Evento genérico sin equipos
                        modalMatchDetails.innerHTML = `
                            <div class="modal-score">
                                <span class="modal-score-numbers" style="font-size: 1.5rem; margin-bottom: 8px;">${details.name || fixture.name || details.slug || 'Evento en Directo'}</span>
                                <span class="modal-match-status ${!isLive ? 'not-live' : ''}">
                                    ${isLive ? 'EN VIVO' : 'Próximo'}
                                </span>
                            </div>
                        `;
                    }
                    modalMatchDetails.style.display = 'flex';
                }
            }
        }

    } catch (error) {
        console.error("Error al buscar transmisiones o detalles:", error);
        playerContainer.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; padding: 20px;">
                <p style="color: #ef4444; font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">Error de Conexión</p>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">No se pudieron cargar los canales de transmisión para este partido.</p>
            </div>
        `;
    }
}

// Cargar la transmisión en el reproductor (HLS nativo o Iframe fallback)
function loadPlayer(stream) {
    // Detener cualquier instancia activa de Hls.js previa
    if (window.currentHlsInstance) {
        window.currentHlsInstance.destroy();
        window.currentHlsInstance = null;
    }

    const m3u8Url = stream.url;
    const isM3u8 = m3u8Url && (m3u8Url.includes('.m3u8') || m3u8Url.includes('/live_abr/'));

    // Intentar reproducción nativa de HLS si es compatible y es un archivo .m3u8
    if (isM3u8 && typeof Hls !== 'undefined') {
        playerContainer.innerHTML = `
            <video id="video-player" class="player-video" controls autoplay playsinline></video>
            <div style="text-align: center; margin-top: 10px; font-size: 0.85rem; position: absolute; bottom: -30px; left: 0; right: 0;">
                <span style="color: var(--text-secondary);">¿Problemas con el reproductor de red? Intenta:</span> 
                <a href="${stream.iframe || m3u8Url}" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 600; margin-left: 5px;">Abrir Canal Externo ↗</a>
            </div>
        `;
        
        const video = document.getElementById('video-player');
        
        if (Hls.isSupported()) {
            const hls = new Hls({
                maxMaxBufferLength: 10,
                enableWorker: true
            });
            hls.loadSource(m3u8Url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(err => console.log("Autoplay bloqueado por interacción del usuario:", err));
            });
            
            // Manejar errores como restricciones de CORS
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // Intenta recuperar, pero si falla mucho es CORS
                            console.error("HLS Network Error, possibly CORS block.");
                            hls.destroy();
                            showStreamFallbackError(stream.iframe || m3u8Url);
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            showStreamFallbackError(stream.iframe || m3u8Url);
                            break;
                    }
                }
            });
            
            window.currentHlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari tiene soporte nativo para HLS sin biblioteca hls.js
            video.src = m3u8Url;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(err => console.log("Autoplay bloqueado por interacción del usuario:", err));
            });
            video.addEventListener('error', () => {
                showStreamFallbackError(stream.iframe || m3u8Url);
            });
        } else {
            // Si el navegador no puede manejar m3u8, usamos el iframe fallback
            loadPlayerIframe(stream.iframe || m3u8Url);
        }
    } else {
        // En caso contrario, cargar el iframe original directamente
        loadPlayerIframe(stream.iframe || m3u8Url);
    }
}

// Cargar iframe
function loadPlayerIframe(iframeUrl) {
    playerContainer.innerHTML = `
        <iframe 
            src="${iframeUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allowfullscreen 
            scrolling="no"
            referrerpolicy="no-referrer"
            allow="autoplay; encrypted-media"
            style="position: absolute; top: 0; left: 0;">
        </iframe>
    `;
}

// Muestra un error amigable en el reproductor cuando CORS bloquea la reproducción
function showStreamFallbackError(externalUrl) {
    playerContainer.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;">
            <div style="color: #ef4444; font-size: 3rem; margin-bottom: 16px;">⚠️</div>
            <h3 style="color: #fff; margin-bottom: 8px;">El servidor bloquea la reproducción</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 400px; margin-bottom: 24px;">Por motivos de seguridad (CORS), el proveedor de la transmisión no permite reproducir este video directamente aquí.</p>
            <a href="${externalUrl}" target="_blank" rel="noreferrer" style="background: var(--accent); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; transition: background 0.2s;">
                Abrir en una nueva pestaña
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
        </div>
    `;
}

// Renderizar botones de canales/opciones de stream
function renderStreamOptions(streams) {
    streamOptionsContainer.innerHTML = '';
    
    streams.forEach((stream, index) => {
        const btn = document.createElement('button');
        btn.className = `stream-option-btn ${index === 0 ? 'active' : ''}`;
        btn.innerText = `Opción ${index + 1} (${stream.title || 'HD'}) - ${stream.source_type || 'Stream'}`;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.stream-option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadPlayer(stream);
        });
        
        streamOptionsContainer.appendChild(btn);
    });

    // Cargar automáticamente la primera opción
    const firstStream = streams[0];
    loadPlayer(firstStream);
}

// Mostrar mensaje si no hay transmisiones
function showNoStreamsMessage() {
    streamOptionsContainer.innerHTML = '';
    playerContainer.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; padding: 20px; max-width: 80%;">
            <svg style="color: var(--text-muted); margin-bottom: 12px;" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <p style="color: var(--text-primary); font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">Sin Transmisión Disponible</p>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">No se encontraron enlaces activos de livestream de AX Sports para este encuentro en este momento.</p>
        </div>
    `;
}

// Cerrar el modal y liberar el reproductor
function closeStreamModal() {
    streamModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Habilitar scroll de fondo
    
    // Destruir instancia de HLS para liberar memoria y detener el stream
    if (window.currentHlsInstance) {
        window.currentHlsInstance.destroy();
        window.currentHlsInstance = null;
    }
    
    playerContainer.innerHTML = ''; // Vaciar reproductor
    streamOptionsContainer.innerHTML = '';
}

// Renderizar la vista de Canales Online
function renderChannels() {
    fixturesGrid.innerHTML = '';

    let sourceChannels = [];
    if (currentChannelSource === 'live_tv_1') {
        sourceChannels = allChannels;
    } else if (currentChannelSource === 'live_tv_2') {
        sourceChannels = allChannels2;
    } else if (currentChannelSource === 'live_tv_3') {
        sourceChannels = allChannels3;
    } else if (currentChannelSource === 'live_tv_4') {
        sourceChannels = allChannels4;
    } else if (currentChannelSource === 'live_tv_5') {
        sourceChannels = allChannels5;
    } else if (currentChannelSource === 'live_tv_6') {
        sourceChannels = allChannels6;
    }

    if (sourceChannels.length === 0) {
        const message = "Cargando canales o no hay canales disponibles...";
            
        fixturesGrid.innerHTML = `
            <div class="spinner-container" style="grid-column: 1 / -1; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 1.1rem;">${message}</p>
            </div>
        `;
        return;
    }

    // Filtrar canales por la barra de búsqueda si hay texto
    let filteredChannels = sourceChannels;
    if (searchQuery !== '') {
        filteredChannels = filteredChannels.filter(ch => 
            ch.Canal && ch.Canal.toLowerCase().includes(searchQuery)
        );
    }

    if (filteredChannels.length === 0) {
        fixturesGrid.innerHTML = `
            <div class="spinner-container" style="grid-column: 1 / -1; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 1.1rem;">No se encontraron canales que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }

    filteredChannels.forEach(channel => {
        // Buscar el logo en la lista de logos
        const logoData = channelLogos.find(l => l.Canal === channel.Canal);
        const logoUrl = logoData ? logoData.Logo : 'https://placehold.co/64x64/1a2235/ffffff?text=TV';

        const card = document.createElement('div');
        card.className = 'fixture-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'center';
        card.style.padding = '24px';
        card.style.gap = '16px';
        card.style.cursor = 'pointer';

        card.innerHTML = `
            <img src="${logoUrl}" alt="${channel.Canal}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.05); padding: 8px;" onerror="this.src='https://placehold.co/64x64/1a2235/ffffff?text=TV'">
            <div style="font-size: 1.1rem; font-weight: 600; text-align: center;">${channel.Canal}</div>
            <div style="font-size: 0.8rem; color: ${channel.Estado === 'Activo' ? '#10b981' : '#ef4444'}; background: rgba(${channel.Estado === 'Activo' ? '16, 185, 129' : '239, 68, 68'}, 0.1); padding: 4px 12px; border-radius: 12px; font-weight: 500;">
                ${channel.Estado || 'Desconocido'}
            </div>
        `;

        card.addEventListener('click', () => {
            // Reutilizar el modal para mostrar el canal
            openChannelModal(channel, logoUrl);
        });

        fixturesGrid.appendChild(card);
    });
}

function openChannelModal(channel, logoUrl) {
    modalMatchTitle.innerText = channel.Canal;
    modalMatchLeague.innerText = "Canal de TV Online";
    
    // Ocultar detalles del marcador
    if (modalMatchDetails) {
        modalMatchDetails.style.display = 'none';
    }

    streamOptionsContainer.innerHTML = '';
    
    // Cargar enlace único o generar múltiples opciones
    if (channel.Options && channel.Options.length > 0) {
        // Múltiples opciones (como Live TV 4)
        channel.Options.forEach((linkObj) => {
            const btn = document.createElement('button');
            btn.className = 'stream-btn';
            btn.innerHTML = `
                <div class="stream-info">
                    <span class="stream-name">${linkObj.name}</span>
                    <span class="stream-lang">${linkObj.language || 'TV'}</span>
                </div>
            `;
            
            btn.onclick = () => {
                document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const streamData = { url: linkObj.url, iframe: linkObj.url };
                loadPlayer(streamData);
            };
            
            streamOptionsContainer.appendChild(btn);
        });

        // Autoclick en la primera opción
        const firstBtn = streamOptionsContainer.querySelector('.stream-btn');
        if (firstBtn) {
            firstBtn.click();
        }
    } else if (channel.Link) {
        // Enlace directo (Live TV 1 y 3)
        const streamData = {
            url: channel.Link,
            iframe: channel.Link
        };
        loadPlayer(streamData);
    } else if (currentChannelSource === 'live_tv_2') {
        // Generar enlaces para Live TV 2
        const link1 = `https://streamtpday1.xyz/global1.php?stream=${channel.Canal}`;
        const link2 = `https://streamtpday1.xyz/global2.php?stream=${channel.Canal}`;
        
        const links = [
            { url: link1, name: 'Global 1' },
            { url: link2, name: 'Global 2' }
        ];

        links.forEach((linkObj) => {
            const btn = document.createElement('button');
            btn.className = 'stream-btn';
            btn.innerHTML = `
                <div class="stream-info">
                    <span class="stream-name">${linkObj.name}</span>
                    <span class="stream-lang">TV</span>
                </div>
            `;
            
            btn.onclick = () => {
                document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const streamData = { url: linkObj.url, iframe: linkObj.url };
                loadPlayer(streamData);
            };
            
            streamOptionsContainer.appendChild(btn);
        });

        const firstBtn = streamOptionsContainer.querySelector('.stream-btn');
        if (firstBtn) {
            firstBtn.click();
        }
    } else {
        playerContainer.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <p style="color: #ef4444; font-size: 1.25rem;">Enlace no disponible</p>
            </div>
        `;
    }

    streamModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Renderizar la vista de Agenda
function renderAgenda() {
    fixturesGrid.innerHTML = '';

    let sourceAgenda = [];
    if (currentAgendaSource === 'agenda_1') {
        sourceAgenda = allAgenda;
    } else if (currentAgendaSource === 'agenda_2') {
        sourceAgenda = allAgenda2;
    }

    if (sourceAgenda.length === 0) {
        const message = currentAgendaSource === 'agenda_2' 
            ? "Agenda 2 próximamente..." 
            : "Cargando agenda o no hay eventos disponibles...";
            
        fixturesGrid.innerHTML = `
            <div class="spinner-container" style="grid-column: 1 / -1; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 1.1rem;">${message}</p>
            </div>
        `;
        return;
    }

    // Filtrar agenda por la barra de búsqueda si hay texto
    let filteredAgenda = sourceAgenda;
    if (searchQuery !== '') {
        filteredAgenda = filteredAgenda.filter(evento => 
            (evento.title && evento.title.toLowerCase().includes(searchQuery)) ||
            (evento.category && evento.category.toLowerCase().includes(searchQuery))
        );
    }

    const finalAgenda = filteredAgenda;

    if (finalAgenda.length === 0) {
        fixturesGrid.innerHTML = `
            <div class="spinner-container" style="grid-column: 1 / -1; text-align: center;">
                <p style="color: var(--text-secondary); font-size: 1.1rem;">No se encontraron eventos en la agenda que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }

    finalAgenda.forEach(evento => {
        const card = document.createElement('div');
        card.className = 'fixture-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.padding = '20px';
        card.style.gap = '12px';
        card.style.cursor = 'pointer';

        const isLive = evento.status === 'En vivo';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span class="league-badge">${evento.category || 'Deporte'}</span>
                ${isLive ? '<span class="status-badge live">EN VIVO</span>' : `<span class="status-badge" style="background: rgba(255,255,255,0.1); color: var(--text-secondary);">${evento.date} ${evento.time}</span>`}
            </div>
            <div style="font-size: 1.15rem; font-weight: 600; text-align: center; margin: 10px 0;">
                ${evento.title}
            </div>
            <div style="text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
                Opciones: ${evento.links.length}
            </div>
        `;

        card.addEventListener('click', () => {
            openAgendaModal(evento);
        });

        fixturesGrid.appendChild(card);
    });
}

function openAgendaModal(evento) {
    modalMatchTitle.innerText = evento.title;
    modalMatchLeague.innerText = evento.category || 'Evento Deportivo';
    
    // Ocultar detalles del marcador
    if (modalMatchDetails) {
        modalMatchDetails.style.display = 'none';
    }

    streamOptionsContainer.innerHTML = '';
    
    if (evento.links && evento.links.length > 0) {
        // Crear botones para cada enlace disponible
        evento.links.forEach((linkObj, index) => {
            const btn = document.createElement('button');
            btn.className = 'stream-btn';
            btn.innerHTML = `
                <div class="stream-info">
                    <span class="stream-name">${linkObj.name || `Opción ${index + 1}`}</span>
                    <span class="stream-lang">${(linkObj.language || '').toUpperCase()}</span>
                </div>
            `;
            
            btn.onclick = () => {
                // Quitar clase active de todos los botones
                document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const streamData = {
                    url: linkObj.url,
                    iframe: linkObj.url
                };
                loadPlayer(streamData);
            };
            
            streamOptionsContainer.appendChild(btn);
        });

        // Seleccionar y cargar la primera opción por defecto
        const firstBtn = streamOptionsContainer.querySelector('.stream-btn');
        if (firstBtn) {
            firstBtn.click();
        }
    } else {
        playerContainer.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <p style="color: #ef4444; font-size: 1.25rem;">Enlace no disponible</p>
            </div>
        `;
    }

    streamModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
