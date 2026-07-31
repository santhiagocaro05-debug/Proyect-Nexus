// ============================================================
// PERFIL.JS — Dashboard de perfil / Ficha de Operador
//
// Requiere que index.html apunte el botón de perfil aquí en vez
// de abrir el overlay. Ver instrucciones al final de este archivo.
// ============================================================

// ===== APLICAR TEMA GUARDADO =====
function applyTheme() {
    const dark = localStorage.getItem('jv_dark') !== 'false';
    document.body.classList.toggle('light', !dark);
}
applyTheme();

const $ = id => document.getElementById(id);
const esc = t => {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
};

let authUser = null;       // usuario logueado actualmente (o null)
let viewUid = null;        // uid del perfil que se está mostrando
let isOwnProfile = false;
let profileData = null;    // doc completo de users/{viewUid}
let authIsAdmin = false;   // si el usuario logueado es admin (para controles sobre OTROS perfiles)
let currentPlusPlan = 'monthly'; // plan seleccionado dentro del modal Nexus+

const NAME_EFFECTS = [
    { id: 'none', label: 'Sin efecto' },
    { id: 'gradient', label: 'Degradado' },
    { id: 'glow', label: 'Resplandor' },
    { id: 'rainbow', label: 'Arcoíris' },
    { id: 'shimmer', label: 'Destello' },
    { id: 'neon', label: 'Neón' },
    { id: 'hologram', label: 'Holograma' },
    { id: 'devtype', label: '<i class="fas fa-terminal"></i> Verificado', devOnly: true },
    { id: 'plusgold', label: '<i class="fas fa-gem"></i> Gold Plus', plusOnly: true },
    { id: 'nexus-cosmic', label: '<i class="fas fa-meteor"></i> Cósmico', plusOnly: true },
    { id: 'nexus-fire', label: '<i class="fas fa-fire"></i> Fuego', plusOnly: true },
    { id: 'nexus-diamond', label: '<i class="fas fa-gem"></i> Diamante', plusOnly: true },
    { id: 'nexus-plasma', label: '<i class="fas fa-water"></i> Plasma', plusOnly: true },
    { id: 'nexus-electric', label: '<i class="fas fa-bolt"></i> Eléctrico', plusOnly: true },
    { id: 'nexus-crystal', label: '<i class="fas fa-cube"></i> Cristal', plusOnly: true },
    { id: 'nexus-aurora', label: '<i class="fas fa-star-and-crescent"></i> Aurora', plusOnly: true },
    { id: 'nexus-glitch', label: '<i class="fas fa-bug"></i> Glitch', plusOnly: true },
    { id: 'nexus-stardust', label: '<i class="fas fa-sparkles"></i> Stardust', plusOnly: true }
];

const RANK_DISPLAY = {
    admin: { label: 'Admin', bg: 'var(--danger-dim)', color: 'var(--danger)' },
    collaborator: { label: 'Colaborador', bg: 'var(--cyan-dim)', color: 'var(--cyan)' },
    moderator: { label: 'Moderador', bg: 'var(--amber-dim)', color: 'var(--amber)' },
    member: { label: 'Member', bg: 'var(--panel-strong)', color: 'var(--text-dim)' }
};

// Precios de los planes Nexus+ — se usan tanto para el texto del modal
// como para armar los links de pago con el monto ya cargado.
const PLUS_PLANS = {
    monthly: { amount: '4.99', label: 'mensual' },
    yearly: { amount: '39.99', label: 'anual' }
};

function toast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'err' : 'ok'}`;
    t.innerHTML = `<i class="fas fa-${type === 'error' ? 'circle-exclamation' : 'circle-check'}"></i> ${esc(msg)}`;
    document.body.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(40px)';
        t.style.transition = 'all .3s';
        setTimeout(() => t.remove(), 350);
    }, 3000);
}

window.closeOverlay = function(id) {
    $(id).classList.remove('open');
    document.body.style.overflow = '';
};


// ============================================================
// ARRANQUE
// ============================================================

function boot() {
    if (!window.fb || !window.fb.onAuthChange) {
        toast('No se pudo conectar con Firebase', 'error');
        return;
    }
    window.fb.onAuthChange(async (user) => {
        authUser = user;
        const params = new URLSearchParams(location.search);
        viewUid = params.get('u') || (user ? user.uid : null);

        if (!viewUid) {
            $('opNotLoggedIn').style.display = 'block';
            $('opContent').style.display = 'none';
            return;
        }

        isOwnProfile = !!(authUser && authUser.uid === viewUid);
        $('opNotLoggedIn').style.display = 'none';
        $('opContent').style.display = 'block';
        await loadProfile();
    });
}

if (window.fbReady) boot();
else if (window.fbError) toast('Firebase no disponible', 'error');
else {
    window.addEventListener('fb-ready', boot, { once: true });
    window.addEventListener('fb-error', () => toast('Firebase no disponible', 'error'), { once: true });
}


// ============================================================
// CARGA Y RENDER DEL PERFIL
// ============================================================

async function loadProfile() {
    const result = await window.fb.getUserProfile(viewUid);
    if (!result.success) {
        toast('No se encontró ese perfil', 'error');
        return;
    }
    profileData = result.data;
    renderIdentity();
    renderGeneral();
    renderRedes();
    await renderStatsAndActivity();
    setupTabs();

    if (isOwnProfile) {
        $('opTabAjustesBtn').style.display = 'inline-block';
        renderEffectSwatches();

        $('opTabDevBtn').style.display = 'inline-block';
        await checkDevStatus();

        setupOwnEditControls();
    } else {
        await checkAdminPlusControl();
    }
}

function renderIdentity() {
    // Avatar
    const avatarEl = $('opAvatar');
    if (profileData.avatar) {
        avatarEl.innerHTML = `<img src="${esc(profileData.avatar)}">`;
    } else {
        avatarEl.textContent = (profileData.username || '?')[0].toUpperCase();
    }
    avatarEl.classList.toggle('plus', !!profileData.nexusPlus);

    // Banner
    const bannerEl = $('opBanner');
    const editBtn = $('opBannerEditBtn');
    if (profileData.banner) {
        bannerEl.style.background = `url(${profileData.banner}) center/cover no-repeat`;
    } else {
        bannerEl.style.background = `linear-gradient(135deg, var(--bg-2), ${profileData.accentColor || 'var(--panel-strong)'})`;
    }
    bannerEl.appendChild(editBtn); // conservar el botón encima del banner

    // Nombre con efecto
    const nameSpan = $('opNameSpan');
    nameSpan.textContent = profileData.username || 'Usuario';
    nameSpan.className = `uname uname-${profileData.nameEffect || 'none'}`;
    if (profileData.effectColor) {
        nameSpan.style.setProperty('--uname-color', profileData.effectColor);
    } else {
        nameSpan.style.removeProperty('--uname-color');
    }

    // Pin Nexus+ junto al nombre
    $('opPlusPin').style.display = (profileData.nexusPlus || profileData.hasNexusPlus) ? 'inline-flex' : 'none';

    // Tarjeta con marco dorado si es suscriptor
    $('opCard').classList.toggle('is-plus', !!profileData.nexusPlus);

    // Meta line
    $('opUidShort').textContent = 'OP-' + viewUid.substring(0, 6).toUpperCase();
    if (profileData.createdAt) {
        $('opJoinedLine').textContent = 'operador desde ' + new Date(profileData.createdAt).toLocaleDateString();
    }

    // Rank badge
    const rank = profileData.rank || 'member';
    const rankInfo = RANK_DISPLAY[rank] || RANK_DISPLAY.member;
    const badge = $('opRankBadge');
    badge.textContent = rankInfo.label;
    badge.style.background = rankInfo.bg;
    badge.style.color = rankInfo.color;

    // Bio (header)
    $('opBio').textContent = profileData.bio || 'Sin descripción aún';

    // Banner de invitación a Nexus+ — solo en tu propio perfil y si aún no eres suscriptor
    $('opPlusBanner').style.display = (isOwnProfile && !(profileData.nexusPlus || profileData.hasNexusPlus)) ? 'flex' : 'none';

    // Controles de edición (solo dueño)
    if (isOwnProfile) {
        $('opAvatarEditBtn').style.display = 'flex';
        $('opBannerEditBtn').style.display = 'flex';
    }
}

function renderGeneral() {
    $('opBioReadonly').textContent = profileData.bio || 'Sin descripción aún';

    const badgesRow = $('opBadgesRow');
    badgesRow.innerHTML = '';
    const rank = profileData.rank || 'member';
    if (rank === 'admin') badgesRow.innerHTML += badgeChip('👑 Admin');
    else if (rank === 'collaborator') badgesRow.innerHTML += badgeChip('🤝 Colaborador');
    else if (rank === 'moderator') badgesRow.innerHTML += badgeChip('🛡️ Moderador');
    if (profileData.nexusPlus) badgesRow.innerHTML += badgeChip('💎 Nexus+', true);
    if (profileData.isDeveloper) badgesRow.innerHTML += badgeChip('👨‍💻 Developer');
    (profileData.badges || []).forEach(b => { badgesRow.innerHTML += badgeChip(b); });

    $('opStatBadges').textContent = (profileData.badges || []).length + (profileData.isDeveloper ? 1 : 0) + (profileData.nexusPlus ? 1 : 0);

    if (isOwnProfile) {
        $('opGeneralView').style.display = 'none';
        $('opGeneralEdit').style.display = 'block';
        $('opBioInput').value = profileData.bio && profileData.bio !== 'Sin descripción aún' ? profileData.bio : '';
        $('opAccentColor').value = profileData.accentColor || '#F2B544';
    }
}

function badgeChip(text, plus = false) {
    return `<span class="badge-chip${plus ? ' plus' : ''}">${esc(text)}</span>`;
}

function renderRedes() {
    const view = $('opRedesView');
    view.innerHTML = '';
    let any = false;

    if (profileData.discord) {
        any = true;
        view.innerHTML += `<div onclick="navigator.clipboard.writeText('${esc(profileData.discord)}').then(()=>toast('Discord copiado: ${esc(profileData.discord)}'))" style="cursor:pointer;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px 18px;">
            <i class="fab fa-discord" style="color:#5865F2;font-size:1.1rem;"></i>
            <div><div style="font-size:.72rem;color:var(--text-faint);">Discord</div><div style="font-size:.85rem;font-weight:600;">${esc(profileData.discord)}</div></div>
        </div>`;
    }
    if (profileData.twitter) {
        any = true;
        const link = profileData.twitter.startsWith('http') ? profileData.twitter : `https://twitter.com/${profileData.twitter.replace('@','')}`;
        view.innerHTML += `<a href="${esc(link)}" target="_blank" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px 18px;">
            <i class="fab fa-twitter" style="color:#1DA1F2;font-size:1.1rem;"></i>
            <div><div style="font-size:.72rem;color:var(--text-faint);">Twitter</div><div style="font-size:.85rem;font-weight:600;">${esc(profileData.twitter)}</div></div>
        </a>`;
    }
    if (profileData.instagram) {
        any = true;
        const link = profileData.instagram.startsWith('http') ? profileData.instagram : `https://instagram.com/${profileData.instagram.replace('@','')}`;
        view.innerHTML += `<a href="${esc(link)}" target="_blank" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px 18px;">
            <i class="fab fa-instagram" style="color:#E1306C;font-size:1.1rem;"></i>
            <div><div style="font-size:.72rem;color:var(--text-faint);">Instagram</div><div style="font-size:.85rem;font-weight:600;">${esc(profileData.instagram)}</div></div>
        </a>`;
    }
    if (!any && !isOwnProfile) {
        view.innerHTML = '<div class="op-empty" style="width:100%;"><i class="fas fa-link-slash"></i>Sin redes sociales enlazadas</div>';
    }

    if (isOwnProfile) {
        $('opRedesEdit').style.display = 'block';
        $('opDiscordInput').value = profileData.discord || '';
        $('opTwitterInput').value = profileData.twitter || '';
        $('opInstagramInput').value = profileData.instagram || '';
    }
}

async function renderStatsAndActivity() {
    const list = $('opActivityList');
    list.innerHTML = '<div class="op-empty"><i class="fas fa-spinner fa-spin"></i>Cargando actividad...</div>';

    const [postsRes, commentsRes, productsRes] = await Promise.all([
        window.fb.getPosts ? window.fb.getPosts() : { success: false },
        window.fb.getComments ? window.fb.getComments() : { success: false },
        window.fb.getProducts ? window.fb.getProducts() : { success: false }
    ]);

    const myPosts = postsRes.success ? postsRes.data.filter(p => p.authorId === viewUid) : [];
    const myComments = commentsRes.success ? commentsRes.data.filter(c => c.authorId === viewUid) : [];
    const myProducts = productsRes.success ? productsRes.data.filter(p => p.authorId === viewUid) : [];

    $('opStatPosts').textContent = myPosts.length;
    $('opStatComments').textContent = myComments.length;
    $('opStatProducts').textContent = myProducts.length;

    const items = [
        ...myPosts.map(p => ({ kind: 'Publicación', txt: p.title, date: p.date })),
        ...myComments.map(c => ({ kind: 'Comentario', txt: c.text, date: c.date })),
        ...myProducts.map(p => ({ kind: 'Producto publicado', txt: p.name, date: p.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (items.length === 0) {
        list.innerHTML = '<div class="op-empty"><i class="fas fa-satellite-dish"></i>Sin actividad registrada aún</div>';
        return;
    }

    list.innerHTML = items.map(it => `
        <div class="op-activity-item">
            <span class="kind">${esc(it.kind)}</span>
            <div class="txt">${esc((it.txt || '').substring(0, 200))}</div>
            <div class="when">${it.date ? new Date(it.date).toLocaleString() : ''}</div>
        </div>
    `).join('');
}


// ============================================================
// TABS
// ============================================================

function setupTabs() {
    document.querySelectorAll('.op-tab').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.op-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.op-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panelMap = { general: 'opPanelGeneral', redes: 'opPanelRedes', actividad: 'opPanelActividad', dev: 'opPanelDev', ajustes: 'opPanelAjustes' };
            $(panelMap[btn.dataset.tab]).classList.add('active');
        };
    });
}


// ============================================================
// EDICIÓN (solo dueño del perfil)
// ============================================================

function setupOwnEditControls() {
    $('opAvatarEditBtn').onclick = () => $('opAvatarInput').click();
    $('opBannerEditBtn').onclick = () => $('opBannerInput').click();

    $('opAvatarInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        resizeImage(file, 300, 300, true, async (dataUrl) => {
            const result = await window.fb.saveUserProfile(viewUid, { avatar: dataUrl });
            if (result.success) {
                profileData.avatar = dataUrl;
                renderIdentity();
                toast('Foto de perfil actualizada');
            } else {
                toast('Error al guardar: ' + result.error, 'error');
            }
        });
    });

    $('opBannerInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        resizeImage(file, 900, 300, false, async (dataUrl) => {
            const result = await window.fb.saveUserProfile(viewUid, { banner: dataUrl });
            if (result.success) {
                profileData.banner = dataUrl;
                renderIdentity();
                toast('Portada actualizada');
            } else {
                toast('Error al guardar: ' + result.error, 'error');
            }
        });
    });
}

function resizeImage(file, maxW, maxH, square, callback) {
    if (file.type === 'image/gif' && currentUser && currentUser.hasNexusPlus) {
        if (file.size > 1024 * 1024) {
            toast('El GIF debe ser menor a 1MB para proteger el rendimiento', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = e => callback(e.target.result);
        reader.readAsDataURL(file);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let w, h;
            if (square) {
                w = h = Math.min(maxW, maxH);
                const ratio = Math.max(w / img.width, h / img.height);
                const sw = img.width * ratio, sh = img.height * ratio;
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
            } else {
                const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
                w = img.width * ratio; h = img.height * ratio;
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            }
            callback(canvas.toDataURL('image/jpeg', 0.87));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

window.addOpBadge = function() {
    const input = $('opBadgeInput');
    const text = input.value.trim();
    if (!text) { toast('Escribe una insignia', 'error'); return; }
    if (text.length > 50) { toast('Máx 50 caracteres', 'error'); return; }
    const row = $('opBadgesRow');
    row.insertAdjacentHTML('beforeend', badgeChip(text));
    input.value = '';
    toast('Insignia agregada — recuerda guardar');
};

window.saveOpGeneral = async function() {
    const bio = $('opBioInput').value.trim();
    const accentColor = $('opAccentColor').value;
    const badges = Array.from($('opBadgesRow').children)
        .map(el => el.textContent.trim())
        .filter(t => !['👑 Admin', '🤝 Colaborador', '🛡️ Moderador', '👨‍💻 Developer', '💎 Nexus+'].includes(t));

    const result = await window.fb.saveUserProfile(viewUid, {
        bio: bio || 'Sin descripción aún',
        accentColor,
        badges
    });
    if (result.success) {
        profileData.bio = bio || 'Sin descripción aún';
        profileData.accentColor = accentColor;
        profileData.badges = badges;
        renderIdentity();
        renderGeneral();
        toast('Perfil actualizado');
    } else {
        toast('Error: ' + result.error, 'error');
    }
};

window.saveOpRedes = async function() {
    const discord = $('opDiscordInput').value.trim();
    const twitter = $('opTwitterInput').value.trim();
    const instagram = $('opInstagramInput').value.trim();

    const result = await window.fb.saveUserProfile(viewUid, { discord, twitter, instagram });
    if (result.success) {
        profileData.discord = discord;
        profileData.twitter = twitter;
        profileData.instagram = instagram;
        renderRedes();
        toast('Redes sociales actualizadas');
    } else {
        toast('Error: ' + result.error, 'error');
    }
};


// ============================================================
// EFECTOS DE NOMBRE (pestaña Ajustes)
// ============================================================

function renderEffectSwatches() {
    const container = $('opEffectSwatches');
    const current = profileData.nameEffect || 'none';
    // Los efectos marcados como plusOnly (ej. el oro de Nexus+) solo se
    // ofrecen a quien ya es suscriptor, y los marcados como devOnly (el
    // efecto "Developer Verificado") solo se ofrecen a quien tiene
    // isDeveloper === true, para que ambos sean beneficios reales y no
    // cualquiera pueda ponerse el efecto exclusivo de otro tier.
    const available = NAME_EFFECTS.filter(fx =>
        (!fx.plusOnly || profileData.nexusPlus) &&
        (!fx.devOnly  || profileData.isDeveloper)
    );

    // Si el usuario tenía puesto un efecto exclusivo y luego perdió el
    // beneficio (le quitaron Nexus+ o el rol de developer), lo regresamos
    // a "none" para que no se quede con un efecto que ya no le corresponde.
    const stillHasCurrent = available.some(fx => fx.id === current);
    if (!stillHasCurrent && current !== 'none') {
        profileData.nameEffect = 'none';
        window.fb.saveUserProfile(viewUid, { nameEffect: 'none' });
    }
    const effectiveCurrent = stillHasCurrent ? current : 'none';

    container.innerHTML = available.map(fx => {
        let styleAttr = '';
        if (profileData.effectColor) {
            styleAttr = `style="--uname-color: ${profileData.effectColor}; font-size:1rem;"`;
        } else {
            styleAttr = `style="font-size:1rem;"`;
        }
        return `
        <div class="effect-swatch ${fx.id === effectiveCurrent ? 'selected' : ''}" data-fx="${fx.id}">
            <span class="uname uname-${fx.id}" ${styleAttr}>${esc(profileData.username || 'Nombre')}</span>
        </div>
    `}).join('');

    container.querySelectorAll('.effect-swatch').forEach(el => {
        el.onclick = async () => {
            const fx = el.dataset.fx;
            const result = await window.fb.saveUserProfile(viewUid, { nameEffect: fx });
            if (result.success) {
                profileData.nameEffect = fx;
                container.querySelectorAll('.effect-swatch').forEach(s => s.classList.remove('selected'));
                el.classList.add('selected');
                renderIdentity();
                toast('Efecto de nombre actualizado');
            } else {
                toast('Error: ' + result.error, 'error');
            }
        };
    });

    renderColorPicker();
}

function renderColorPicker() {
    const cpContainer = $('opColorPicker');
    if (!cpContainer) return;
    
    if (!profileData.nexusPlus && !profileData.hasNexusPlus) {
        cpContainer.innerHTML = '';
        return;
    }

    const COLORS = [
        '#4fd8ff', '#ff5d6a', '#ffc107', '#3ddc97', 
        '#c084fc', '#ff6b9d', '#ffb347', '#00e5ff', 
        '#e040fb', '#76ff03', '#ff1744', '#ffffff'
    ];

    const currentFxColor = profileData.effectColor || '';

    let html = `
        <div class="effect-color-section">
            <div class="section-title"><i class="fas fa-palette"></i> Color base (Exclusivo Nexus+)</div>
            <div class="effect-color-palette">
                <button class="color-dot-reset ${!currentFxColor ? 'selected' : ''}" title="Por defecto" onclick="selectEffectColor('')">
                    <i class="fas fa-ban"></i>
                </button>
    `;

    COLORS.forEach(c => {
        const isSelected = currentFxColor.toLowerCase() === c.toLowerCase();
        html += `<div class="color-dot ${isSelected ? 'selected' : ''}" style="background-color: ${c}" onclick="selectEffectColor('${c}')"></div>`;
    });

    html += `
                <div class="custom-color-wrap">
                    <input type="color" id="fxCustomColor" class="custom-color-input ${currentFxColor && !COLORS.includes(currentFxColor.toLowerCase()) ? 'selected' : ''}" value="${currentFxColor || '#4fd8ff'}" onchange="selectEffectColor(this.value)">
                </div>
            </div>
        </div>
    `;

    cpContainer.innerHTML = html;
}

window.selectEffectColor = async function(color) {
    const result = await window.fb.saveUserProfile(viewUid, { effectColor: color });
    if (result.success) {
        profileData.effectColor = color;
        renderEffectSwatches(); // Re-renderiza las cajas con el color
        renderIdentity(); // Actualiza el banner principal
        toast(color ? 'Color base actualizado' : 'Color por defecto restaurado');
    } else {
        toast('Error: ' + result.error, 'error');
    }
}


// ============================================================
// NEXUS+ — modal informativo/de compra y control de admin
// ============================================================

window.openNexusPlusModal = function() {
    selectPlusPlan(currentPlusPlan || 'monthly');
    $('nexusPlusOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.selectPlusPlan = function(plan) {
    if (!PLUS_PLANS[plan]) return;
    currentPlusPlan = plan;

    $('planMonthly').classList.toggle('selected', plan === 'monthly');
    $('planYearly').classList.toggle('selected', plan === 'yearly');

    // Actualiza los links de pago con el monto del plan elegido, para que
    // la persona no tenga que escribirlo a mano en PayPal / Dólar App.
    const amount = PLUS_PLANS[plan].amount;
    const ppLink = $('plusPpLink');
    const daLink = $('plusDaLink');
    if (ppLink) ppLink.href = `https://www.paypal.com/paypalme/157teamai/${amount}`;
    if (daLink) daLink.href = `https://dollarapp.net/pagar/157team?monto=${amount}`;
};

// Control manual para que un admin active/quite Nexus+ en OTRO perfil.
// La verificación real de permisos ocurre siempre en el backend (reglas
// de Firestore / función), esto solo evita mostrar el botón a quien no
// debería verlo.
async function checkAdminPlusControl() {
    const section = $('opAdminPlusSectionView');
    section.style.display = 'none';
    if (!authUser) return;

    try {
        const authRes = await window.fb.getUserProfile(authUser.uid);
        authIsAdmin = !!(authRes.success && authRes.data && authRes.data.rank === 'admin');
    } catch (e) {
        authIsAdmin = false;
    }

    if (!authIsAdmin) return;

    section.style.display = 'block';
    updatePlusToggleButtons();
}

function updatePlusToggleButtons() {
    const onBtn = $('opPlusOnBtnView');
    const offBtn = $('opPlusOffBtnView');
    if (!onBtn || !offBtn) return;
    const isPlus = !!profileData.nexusPlus;
    onBtn.classList.toggle('active', isPlus);
    onBtn.classList.toggle('on', true);
    offBtn.classList.toggle('active', !isPlus);
    offBtn.classList.toggle('off', true);
}

window.setOpNexusPlus = async function(value) {
    const result = await window.fb.saveUserProfile(viewUid, { nexusPlus: !!value });
    if (result.success) {
        profileData.nexusPlus = !!value;
        renderIdentity();
        renderGeneral();
        updatePlusToggleButtons();
        toast(value ? 'Nexus+ activado para este operador' : 'Nexus+ retirado de este operador');
    } else {
        toast('Error: ' + result.error, 'error');
    }
};


// ============================================================
// SOLICITUD DEVELOPER (mismo flujo del paso 2, adaptado a esta página)
// ============================================================

async function checkDevStatus() {
    const none = $('devStateNone'), pending = $('devStatePending'),
          rejected = $('devStateRejected'), approved = $('devStateApproved');
    [none, pending, rejected, approved].forEach(el => el.style.display = 'none');

    if (profileData.isDeveloper) { approved.style.display = 'flex'; return; }
    if (!window.fb.getMyDeveloperRequestStatus) { none.style.display = 'block'; return; }

    const res = await window.fb.getMyDeveloperRequestStatus(viewUid);
    if (!res.success || !res.status) none.style.display = 'block';
    else if (res.status === 'pending') pending.style.display = 'flex';
    else if (res.status === 'rejected') rejected.style.display = 'block';
    else none.style.display = 'block';
}

window.openDevRequestModal = function() {
    $('devReqReason').value = '';
    $('devReqPortfolio').value = '';
    $('devReqReasonCount').textContent = '0 / 500';
    $('devReqStatus').textContent = '';
    $('devReqStatus').className = 'status-msg';
    $('devRequestOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
};

document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'devReqReason') {
        $('devReqReasonCount').textContent = `${e.target.value.length} / 500`;
    }
});

window.submitDevRequest = async function() {
    const reason = $('devReqReason').value.trim();
    const portfolio = $('devReqPortfolio').value.trim();
    const statusEl = $('devReqStatus');
    const btn = $('devReqSubmitBtn');

    if (reason.length < 10) {
        statusEl.textContent = 'Escribe una razón un poco más detallada';
        statusEl.className = 'status-msg error';
        return;
    }
    if (!window.fb || !window.fb.requestDeveloperStatus) {
        statusEl.textContent = '❌ Firebase no disponible';
        statusEl.className = 'status-msg error';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const result = await window.fb.requestDeveloperStatus(
        viewUid, profileData.username, profileData.email, reason, portfolio
    );

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar solicitud';

    if (result.success) {
        toast('✅ Solicitud enviada');
        closeOverlay('devRequestOverlay');
        await checkDevStatus();
    } else {
        statusEl.textContent = '❌ ' + (result.error || 'Error al enviar la solicitud');
        statusEl.className = 'status-msg error';
    }
};

document.getElementById('devRequestOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeOverlay('devRequestOverlay');
});


// ============================================================
// ⬇️ INSTRUCCIONES DE INTEGRACIÓN CON index.html / script.js ⬇️
//
// 1) En script.js, dentro de updateAuthUI(), busca:
//        pnb.onclick = () => openProfile(currentUser.uid);
//    y cámbialo por:
//        pnb.onclick = () => { location.href = 'perfil.html'; };
//
// 2) En cualquier lugar donde abras el perfil de OTRO usuario
//    (por ejemplo el onclick="openProfile('${c.authorId}')" en
//    comentarios, o el onclick de avatares en el chat), cambia
//    la llamada a openProfile(uid) por:
//        location.href = 'perfil.html?u=' + uid
//    Puedes mantener la función openProfile() vieja (el overlay)
//    como respaldo si prefieres una transición gradual — no es
//    obligatorio borrarla.
//
// 3) Copia css/username-effects.css (del bloque anterior, más el
//    bloque nuevo .uname-devtype que te pasé para el efecto de
//    "Developer Verificado") a tu carpeta css/, junto a style.css.
//
// 4) Asegúrate de que firebase-config.js exporte también
//    requestDeveloperStatus y getMyDeveloperRequestStatus del
//    paso 2, e isUserDeveloper/isUserAdmin del paso 1 — perfil.js
//    los usa vía window.fb.
//
// 5) Nexus+: guarda el estado como un booleano `nexusPlus` en el
//    documento de cada usuario (users/{uid}.nexusPlus). No hace
//    falta ninguna función nueva en firebase-config.js: el botón
//    de admin usa el mismo saveUserProfile(uid, campos) que ya
//    usa el resto de la página. IMPORTANTE: protege ese campo con
//    tus reglas de seguridad de Firestore para que solo un admin
//    pueda escribirlo en el documento de otro usuario — el botón
//    aquí solo oculta la opción, no reemplaza esa validación.
//
// 6) FIX aplicado en este archivo: renderEffectSwatches() ahora
//    también filtra por `devOnly`, así que el efecto "Developer
//    Verificado" (devtype) solo aparece en la lista de swatches
//    de un usuario con isDeveloper === true — antes cualquier
//    usuario podía verlo y seleccionarlo. Además, si a alguien le
//    quitan Nexus+ o el rol developer mientras tenía puesto un
//    efecto exclusivo, ahora se le resetea a "none" automáticamente
//    la próxima vez que abre su ficha (protección en frontend;
//    igual protege el campo `nameEffect` en tus reglas de Firestore
//    si quieres blindarlo también del lado del servidor).
// ============================================================

window.requestNexusPlusEarlyAccess = async function() {
    if (!authUser) {
        toast('Inicia sesión para pedir acceso', 'error');
        return;
    }
    const email = document.getElementById('nexusPlusEarlyEmail').value.trim();
    if (!email || !email.includes('@')) {
        toast('Por favor ingresa un correo válido', 'error');
        return;
    }
    const btn = document.getElementById('nexusPlusEarlyBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const username = profileData ? profileData.username : 'Usuario';
        const result = await window.fb.requestNexusPlusAccess(authUser.uid, email, username);
        if (result.success) {
            toast('Solicitud enviada correctamente', 'success');
            document.getElementById('nexusPlusEarlyEmail').value = '';
        } else {
            toast('Error: ' + result.error, 'error');
        }
    } catch (e) {
        toast('Error al solicitar', 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Solicitar';
};

