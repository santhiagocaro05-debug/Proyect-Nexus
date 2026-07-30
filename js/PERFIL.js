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

const NAME_EFFECTS = [
    { id: 'none', label: 'Sin efecto' },
    { id: 'gradient', label: 'Degradado' },
    { id: 'glow', label: 'Resplandor' },
    { id: 'rainbow', label: 'Arcoíris' },
    { id: 'shimmer', label: 'Destello' }
];

const RANK_DISPLAY = {
    admin: { label: 'Admin', bg: 'var(--danger-dim)', color: 'var(--danger)' },
    collaborator: { label: 'Colaborador', bg: 'var(--cyan-dim)', color: 'var(--cyan)' },
    moderator: { label: 'Moderador', bg: 'var(--amber-dim)', color: 'var(--amber)' },
    member: { label: 'Member', bg: 'var(--panel-strong)', color: 'var(--text-dim)' }
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
    if (profileData.isDeveloper) badgesRow.innerHTML += badgeChip('👨‍💻 Developer');
    (profileData.badges || []).forEach(b => { badgesRow.innerHTML += badgeChip(b); });

    $('opStatBadges').textContent = (profileData.badges || []).length + (profileData.isDeveloper ? 1 : 0);

    if (isOwnProfile) {
        $('opGeneralView').style.display = 'none';
        $('opGeneralEdit').style.display = 'block';
        $('opBioInput').value = profileData.bio && profileData.bio !== 'Sin descripción aún' ? profileData.bio : '';
        $('opAccentColor').value = profileData.accentColor || '#F2B544';
    }
}

function badgeChip(text) {
    return `<span style="background:var(--panel-strong);border:1px solid var(--border);color:var(--text-dim);font-size:.75rem;font-weight:600;padding:5px 12px;border-radius:20px;">${esc(text)}</span>`;
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
        .filter(t => !['👑 Admin', '🤝 Colaborador', '🛡️ Moderador', '👨‍💻 Developer'].includes(t));

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
    container.innerHTML = NAME_EFFECTS.map(fx => `
        <div class="effect-swatch ${fx.id === current ? 'selected' : ''}" data-fx="${fx.id}">
            <span class="uname uname-${fx.id}" style="font-size:1rem;">${esc(profileData.username || 'Nombre')}</span>
        </div>
    `).join('');

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
}


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
// 3) Copia css/username-effects.css (del bloque anterior) a tu
//    carpeta css/, junto a style.css.
//
// 4) Asegúrate de que firebase-config.js exporte también
//    requestDeveloperStatus y getMyDeveloperRequestStatus del
//    paso 2, e isUserDeveloper/isUserAdmin del paso 1 — perfil.js
//    los usa vía window.fb.
// ============================================================