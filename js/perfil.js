// ============================================================
// PERFIL.JS — Dashboard de perfil / Ficha de Operador
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

// ============================================================
// FORMATO DE BIOGRAFÍA (negrita, cursiva, saltos)
// ============================================================
function formatBio(text) {
    if (!text) return '';
    return esc(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function getIsPlus(data) {
    return !!(data && (data.nexusPlus || data.hasNexusPlus));
}

let authUser = null;       // usuario logueado actualmente (o null)
let viewUid = null;        // uid del perfil que se está mostrando
let isOwnProfile = false;
let profileData = null;    // doc completo de users/{viewUid}
let authIsAdmin = false;   // si el usuario logueado es admin (para controles sobre OTROS perfiles)
let currentPlusPlan = 'monthly'; // plan seleccionado dentro del modal Nexus+

// ============================================================
// TEMAS DE PERFIL (para la portada)
// ============================================================
const PROFILE_THEMES = [
    { id: 'default',  label: 'Nexus',    grad: 'linear-gradient(135deg, var(--bg-2), var(--panel-strong))' },
    { id: 'cyan',     label: 'Cian',     grad: 'linear-gradient(135deg, rgba(79,216,255,.18), var(--panel-strong))' },
    { id: 'sunset',   label: 'Atardecer',grad: 'linear-gradient(135deg, rgba(255,93,106,.16), rgba(255,179,71,.12))' },
    { id: 'violet',   label: 'Violeta',  grad: 'linear-gradient(135deg, rgba(185,140,255,.18), var(--panel-strong))' },
    { id: 'matrix',   label: 'Matrix',   grad: 'linear-gradient(135deg, rgba(61,220,151,.16), var(--panel-strong))' },
    { id: 'plus',     label: 'Nexus+ Gold', grad: 'linear-gradient(135deg, rgba(255,233,184,.16), rgba(185,140,255,.14))', plusOnly: true }
];

// ============================================================
// EFECTOS DE NOMBRE
// ============================================================
const NAME_EFFECTS = [
    { id: 'none', label: 'Sin efecto' },
    { id: 'gradient', label: 'Degradado' },
    { id: 'glow', label: 'Resplandor' },
    { id: 'rainbow', label: 'Arcoíris' },
    { id: 'shimmer', label: 'Destello' },
    { id: 'neon', label: 'Neón' },
    { id: 'hologram', label: 'Holograma' },
    { id: 'typewriter', label: '<i class="fas fa-keyboard"></i> Máquina de escribir' },
    { id: 'wave', label: '<i class="fas fa-water"></i> Onda' },
    { id: 'pulse', label: '<i class="fas fa-heart-pulse"></i> Pulso' },
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
    { id: 'nexus-stardust', label: '<i class="fas fa-sparkles"></i> Stardust', plusOnly: true },
    { id: 'nexus-royal', label: '<i class="fas fa-crown"></i> Realeza', plusOnly: true },
    { id: 'nexus-void', label: '<i class="fas fa-circle-notch"></i> Vacío', plusOnly: true }
];

const RANK_DISPLAY = {
    admin: { label: 'Admin', bg: 'var(--danger-dim)', color: 'var(--danger)' },
    collaborator: { label: 'Colaborador', bg: 'var(--cyan-dim)', color: 'var(--cyan)' },
    moderator: { label: 'Moderador', bg: 'var(--amber-dim)', color: 'var(--amber)' },
    member: { label: 'Member', bg: 'var(--panel-strong)', color: 'var(--text-dim)' }
};

// Precios de los planes Nexus+
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
    renderXpAndBadges();
    await renderStatsAndActivity();
    setupTabs();

    if (isOwnProfile) {
        $('opTabAjustesBtn').style.display = 'inline-block';
        renderEffectSwatches();
        renderThemeSwatches();

        $('opTabDevBtn').style.display = 'inline-block';
        await checkDevStatus();

        setupOwnEditControls();

        // Cargar valores de redes en inputs
        if (document.getElementById('opDiscordInput')) $('opDiscordInput').value = profileData.discord || '';
        if (document.getElementById('opTwitterInput')) $('opTwitterInput').value = profileData.twitter || '';
        if (document.getElementById('opInstagramInput')) $('opInstagramInput').value = profileData.instagram || '';
        if (document.getElementById('opYoutubeInput')) $('opYoutubeInput').value = profileData.youtube || '';
        if (document.getElementById('opTiktokInput')) $('opTiktokInput').value = profileData.tiktok || '';
        if (document.getElementById('opGithubInput')) $('opGithubInput').value = profileData.github || '';
        if (document.getElementById('opTwitchInput')) $('opTwitchInput').value = profileData.twitch || '';
        if (document.getElementById('opWebsiteInput')) $('opWebsiteInput').value = profileData.website || '';
    } else {
        await checkAdminPlusControl();
    }
}

function renderIdentity() {
    const isPlus = getIsPlus(profileData);

    // Avatar
    const avatarEl = $('opAvatar');
    if (profileData.avatar) {
        avatarEl.innerHTML = `<img src="${esc(profileData.avatar)}">`;
    } else {
        avatarEl.textContent = (profileData.username || '?')[0].toUpperCase();
    }
    avatarEl.classList.toggle('plus', isPlus);

    // Banner
    const bannerEl = $('opBanner');
    const editBtn = $('opBannerEditBtn');
    if (profileData.banner) {
        bannerEl.style.background = `url(${profileData.banner}) center/cover no-repeat`;
    } else {
        const themeDef = PROFILE_THEMES.find(t => t.id === (profileData.profileTheme || 'default')) || PROFILE_THEMES[0];
        if (profileData.accentColor) {
            bannerEl.style.background = `linear-gradient(135deg, var(--bg-2), ${profileData.accentColor})`;
        } else {
            bannerEl.style.background = themeDef.grad;
        }
    }
    bannerEl.appendChild(editBtn);

    // Nombre con efecto
    const nameSpan = $('opNameSpan');
    nameSpan.textContent = profileData.username || 'Usuario';
    nameSpan.className = `uname uname-${profileData.nameEffect || 'none'}`;
    if (profileData.effectColor) {
        nameSpan.style.setProperty('--uname-color', profileData.effectColor);
    } else {
        nameSpan.style.removeProperty('--uname-color');
    }

    // Pin Nexus+
    $('opPlusPin').style.display = isPlus ? 'inline-flex' : 'none';
    $('opCard').classList.toggle('is-plus', isPlus);

    // ===== NUEVO: Insignia de verificación — Nexus+ o Developer aprobado =====
    const isVerified = isPlus || !!profileData.isDeveloper;
    const vb = $('opVerifiedBadge');
    if (vb) {
        vb.style.display = isVerified ? 'inline-flex' : 'none';
        vb.classList.toggle('dev', !!profileData.isDeveloper && !isPlus);
        vb.title = profileData.isDeveloper
            ? 'Cuenta verificada por Proyect Nexus · Desarrollador'
            : 'Cuenta verificada por Proyect Nexus';
    }

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

    // Bio (con formato)
    $('opBio').innerHTML = profileData.bio ? formatBio(profileData.bio) : 'Sin descripción aún';

    // Banner de invitación a Nexus+
    $('opPlusBanner').style.display = (isOwnProfile && !isPlus) ? 'flex' : 'none';

    // Controles de edición
    if (isOwnProfile) {
        $('opAvatarEditBtn').style.display = 'flex';
        $('opBannerEditBtn').style.display = 'flex';
    }
}

function renderGeneral() {
    const isPlus = getIsPlus(profileData);

    // Bio con formato
    $('opBioReadonly').innerHTML = profileData.bio ? formatBio(profileData.bio) : 'Sin descripción aún';

    const badgesRow = $('opBadgesRow');
    badgesRow.innerHTML = '';
    const rank = profileData.rank || 'member';
    if (rank === 'admin') badgesRow.innerHTML += badgeChip('👑 Admin');
    else if (rank === 'collaborator') badgesRow.innerHTML += badgeChip('🤝 Colaborador');
    else if (rank === 'moderator') badgesRow.innerHTML += badgeChip('🛡️ Moderador');
    if (isPlus) badgesRow.innerHTML += badgeChip('💎 Nexus+', true);
    if (profileData.isDeveloper) badgesRow.innerHTML += badgeChip('👨‍💻 Developer');
    (profileData.badges || []).forEach(b => { badgesRow.innerHTML += badgeChip(b); });

    $('opStatBadges').textContent = (profileData.badges || []).length + (profileData.isDeveloper ? 1 : 0) + (isPlus ? 1 : 0);

    if (isOwnProfile) {
        $('opGeneralView').style.display = 'none';
        $('opGeneralEdit').style.display = 'block';
        $('opBioInput').value = profileData.bio && profileData.bio !== 'Sin descripción aún' ? profileData.bio : '';
        // Actualizar contador
        const counter = $('opBioCount');
        if (counter) counter.textContent = `${$('opBioInput').value.length} / 300`;
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

    const socials = [
        { key: 'discord', icon: 'fab fa-discord', color: '#5865F2', label: 'Discord', copy: true },
        { key: 'twitter', icon: 'fab fa-twitter', color: '#1DA1F2', label: 'Twitter / X' },
        { key: 'instagram', icon: 'fab fa-instagram', color: '#E1306C', label: 'Instagram' },
        { key: 'youtube', icon: 'fab fa-youtube', color: '#FF0000', label: 'YouTube' },
        { key: 'tiktok', icon: 'fab fa-tiktok', color: '#e0e0e0', label: 'TikTok' },
        { key: 'github', icon: 'fab fa-github', color: '#c9c9c9', label: 'GitHub' },
        { key: 'twitch', icon: 'fab fa-twitch', color: '#9146FF', label: 'Twitch' },
        { key: 'website', icon: 'fas fa-globe', color: 'var(--cyan)', label: 'Sitio web' }
    ];

    socials.forEach(s => {
        const value = profileData[s.key];
        if (!value) return;
        any = true;

        let content = '';
        if (s.copy) {
            content = `<div onclick="navigator.clipboard.writeText('${esc(value)}').then(()=>toast('${esc(s.label)} copiado: ${esc(value)}'))" style="cursor:pointer;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px 18px;width:100%;box-sizing:border-box;">
                <i class="${s.icon}" style="color:${s.color};font-size:1.1rem;"></i>
                <div><div style="font-size:.72rem;color:var(--text-faint);">${esc(s.label)}</div><div style="font-size:.85rem;font-weight:600;">${esc(value)}</div></div>
            </div>`;
        } else {
            const link = value.startsWith('http') ? value : `https://${s.key === 'twitter' ? 'twitter.com' : s.key === 'instagram' ? 'instagram.com' : s.key === 'youtube' ? 'youtube.com' : s.key === 'tiktok' ? 'tiktok.com' : s.key === 'twitch' ? 'twitch.tv' : 'github.com'}/${value.replace('@','')}`;
            content = `<a href="${esc(link)}" target="_blank" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px 18px;width:100%;box-sizing:border-box;">
                <i class="${s.icon}" style="color:${s.color};font-size:1.1rem;"></i>
                <div><div style="font-size:.72rem;color:var(--text-faint);">${esc(s.label)}</div><div style="font-size:.85rem;font-weight:600;">${esc(value)}</div></div>
            </a>`;
        }
        view.innerHTML += content;
    });

    if (!any && !isOwnProfile) {
        view.innerHTML = '<div class="op-empty" style="width:100%;"><i class="fas fa-link-slash"></i>Sin redes sociales enlazadas</div>';
    }

    if (isOwnProfile) {
        $('opRedesEdit').style.display = 'block';
        $('opDiscordInput').value = profileData.discord || '';
        $('opTwitterInput').value = profileData.twitter || '';
        $('opInstagramInput').value = profileData.instagram || '';
        $('opYoutubeInput').value = profileData.youtube || '';
        $('opTiktokInput').value = profileData.tiktok || '';
        $('opGithubInput').value = profileData.github || '';
        $('opTwitchInput').value = profileData.twitch || '';
        $('opWebsiteInput').value = profileData.website || '';
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

function renderXpAndBadges() {
    if (!window.fb.xpForLevel) return;

    const xp = profileData.xp || 0;
    const level = profileData.level || window.fb.levelFromXp(xp);
    const floor = window.fb.xpForLevel(level);
    const ceil = window.fb.xpForLevel(level + 1);
    const span = ceil - floor;
    const progress = span > 0 ? Math.max(0, Math.min(100, ((xp - floor) / span) * 100)) : 100;

    $('opXpLevelNum').textContent = level;
    $('opXpNumText').textContent = `${xp} / ${ceil} XP`;
    $('opXpFill').style.width = progress + '%';

    const grid = $('opAchievementsGrid');
    if (!grid) return;
    const unlocked = new Set(profileData.unlockedBadges || []);
    grid.innerHTML = window.fb.BADGE_DEFS.map(b => {
        const has = unlocked.has(b.id);
        return `
            <div title="${esc(b.desc)}" style="text-align:center;padding:12px 8px;border-radius:12px;
                background:${has ? 'var(--panel-strong)' : 'var(--panel)'};
                border:1px solid ${has ? 'var(--border-strong)' : 'var(--border)'};
                opacity:${has ? '1' : '.4'};">
                <i class="fas ${b.icon}" style="font-size:1.3rem;color:${has ? 'var(--cyan)' : 'var(--text-faint)'};margin-bottom:6px;display:block;"></i>
                <div style="font-size:.7rem;font-weight:700;color:${has ? 'var(--text)' : 'var(--text-faint)'};">${esc(b.name)}</div>
            </div>`;
    }).join('');
}

// ============================================================
// SELECTOR DE TEMAS DE PERFIL (pestaña Ajustes)
// ============================================================

function renderThemeSwatches() {
    const container = $('opThemeSwatches');
    if (!container) return;
    const isPlus = getIsPlus(profileData);
    const current = profileData.profileTheme || 'default';
    const available = PROFILE_THEMES.filter(t => !t.plusOnly || isPlus);

    container.innerHTML = available.map(t => `
        <div class="theme-swatch ${t.id === current ? 'selected' : ''}" data-theme="${t.id}"
             style="height:52px;border-radius:12px;background:${t.grad};border:2px solid ${t.id === current ? 'var(--cyan)' : 'var(--border)'};cursor:pointer;display:flex;align-items:flex-end;padding:6px;transition:all .2s;position:relative;">
            <span style="font-size:.66rem;font-weight:700;background:rgba(5,7,12,.6);padding:2px 6px;border-radius:6px;color:var(--text);">${t.label}</span>
        </div>
    `).join('');

    container.querySelectorAll('.theme-swatch').forEach(el => {
        el.onclick = async () => {
            const theme = el.dataset.theme;
            const result = await window.fb.saveUserProfile(viewUid, { profileTheme: theme });
            if (result.success) {
                profileData.profileTheme = theme;
                renderThemeSwatches();
                renderIdentity();
                toast('Tema de portada actualizado');
            } else {
                toast('Error: ' + result.error, 'error');
            }
        };
    });
}


// ============================================================
// EDICIÓN (solo dueño del perfil)
// ============================================================

function setupOwnEditControls() {
    $('opAvatarEditBtn').onclick = () => $('opAvatarInput').click();
    $('opBannerEditBtn').onclick = () => $('opBannerInput').click();

    // Contador de caracteres para la biografía
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'opBioInput') {
            const count = e.target.value.length;
            const counter = $('opBioCount');
            if (counter) counter.textContent = `${count} / 300`;
        }
    });

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
    if (file.type === 'image/gif' && currentUser && getIsPlus(currentUser)) {
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
    const youtube = $('opYoutubeInput').value.trim();
    const tiktok = $('opTiktokInput').value.trim();
    const github = $('opGithubInput').value.trim();
    const twitch = $('opTwitchInput').value.trim();
    const website = $('opWebsiteInput').value.trim();

    const result = await window.fb.saveUserProfile(viewUid, {
        discord, twitter, instagram, youtube, tiktok, github, twitch, website
    });

    if (result.success) {
        profileData.discord = discord;
        profileData.twitter = twitter;
        profileData.instagram = instagram;
        profileData.youtube = youtube;
        profileData.tiktok = tiktok;
        profileData.github = github;
        profileData.twitch = twitch;
        profileData.website = website;
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
    const isPlus = getIsPlus(profileData);
    const available = NAME_EFFECTS.filter(fx =>
        (!fx.plusOnly || isPlus) &&
        (!fx.devOnly  || profileData.isDeveloper)
    );

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

    if (!getIsPlus(profileData)) {
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
        renderEffectSwatches();
        renderIdentity();
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

    const amount = PLUS_PLANS[plan].amount;
    const ppLink = $('plusPpLink');
    const daLink = $('plusDaLink');
    if (ppLink) ppLink.href = `https://www.paypal.com/paypalme/157teamai/${amount}`;
    if (daLink) daLink.href = `https://dollarapp.net/pagar/157team?monto=${amount}`;
};

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
    const isPlus = getIsPlus(profileData);
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
// SOLICITUD DEVELOPER
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
