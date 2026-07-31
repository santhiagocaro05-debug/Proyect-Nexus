function __nexusMain() {
    'use strict';

    const $ = id => document.getElementById(id);
    const esc = t => {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    };
    let currentUser = null;
    let dark = localStorage.getItem('jv_dark') !== 'false';
    let currentCat = 'all';
    let showAllProducts = false;
    const PRODUCTS_VISIBLE_LIMIT = 6;
    let currentProd = null;
    let adminAuthed = false;
    let profileViewingUser = null;
    let currentImgTab = 'url';
    let pendingImageData = null;

    // ===== CONFIGURACIÓN =====
    // JSONBin ya NO se usa para el foro, solo se mantiene para respaldo de otros datos
    const JSONBIN_KEY = '$2a$10$qLHyIvJZWC03nw6/HVMrb.rsLg/7zD6TsHGHACiY3JdMKQj6W/RAO';
    const JSONBIN_BIN = '6a397ac1f5f4af5e291ea125';

    // ===== PRODUCTOS =====
    const PRODUCT_IMAGES = { jarvis: 'assets/2.jpg', nexus_d: 'assets/a.png', nexus_ds: 'assets/a.png',INY1: 'assets/inyector1.png', INY2: 'assets/inyector1.png', yimmenu: 'assets/yimmenu.png', yimmenu_legacy: 'assets/legacy.jpg', nexus_browser: 'assets/brawser.png'  };
    const PRODUCTS_DEFAULT = [{
        id: 'jarvis',
        name: 'JARVIS AI (Sin soporte)',
        cat: 'free,asistentes',
        price: '$0',
        tag: 'FREE',
        emoji: '🤖',
        color: '#4fd8ff',
        rating: '4.9',
        updatedDate: '03-07-2026',
        author: '157 Team',
        downloads: '50K+',
        commentsCount: '142',
        shortDesc: 'Asistente virtual avanzado con control por voz, integración con Spotify y automatización cognitiva para Windows.',
        desc: 'Asistente virtual de escritorio para Windows.',
        feats: ['Control por voz avanzado', 'Integración nativa con Spotify', 'Asistente contextual', 'Actualizaciones de por vida',
            'Win · Mac · Linux'
        ],
        dl: 'https://github.com/dexter-666/IA_proyect-v1-free/releases/download/v3.0/Jarvis-FreeV3.zip',
        free: true,
        richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">Un poderoso asistente virtual avanzado para escritorio inspirado en la IA de Marvel.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left"><div><h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)"><i class="fas fa-crown" style="color:#4fd8ff;margin-right:8px"></i>Características</h4><ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px"><li><strong>• Interfaz Holográfica:</strong> Orbe reactivo con animaciones dinámicas.</li><li><strong>• Comandos de Voz:</strong> Tecla global Insert para activar.</li><li><strong>• Control del Entorno:</strong> Volumen, brillo, energía.</li><li><strong>• Programación Autónoma:</strong> Auto-escritura de scripts.</li><li><strong>• Multimedia:</strong> YouTube, Spotify.</li></ul></div><div><h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)"><i class="fas fa-microchip" style="margin-right:8px"></i>Tecnologías</h4><p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">Python 3.12, PyQt6, LLMs (Gemini y OpenRouter), Win32 Kernel.</p></div></div>`
    }, {
        id: 'nexus_d',
        name: 'Nexus Demo (Beta)',
        cat: 'free,asistentes',
        price: '$0',
        tag: 'GRATIS',
        emoji: '🧠',
        color: '#3ddc97',
        rating: '4.8',
        updatedDate: '03-07-2026',
        author: '157 Team',
        downloads: '5K+',
        commentsCount: '23',
        shortDesc: 'Asistente de IA que controla tu PC al completo y se conecta a dispositivos inteligentes con Python, C++ y C#.',
        desc: 'Asistente de IA que controla todo tu PC al completo, se conecta a cualquier dispositivo inteligente. Lenguajes: Python, C++ y C#.',
        feats: ['Control total de PC', 'Conexión a dispositivos inteligentes', 'Multi-lenguaje (Python, C++, C#)',
            'Interfaz intuitiva', 'Actualizaciones automáticas'
        ],
        dl: 'https://github.com/santhiagocaro05-debug/NEXUS-INSTALLER/releases/download/installer/Nexus-core-Setup-1.0.0-V3.exe',
        free: true,
        richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">Asistente de IA que controla todo tu PC al completo, se conecta a cualquier dispositivo inteligente. Lenguajes: Python, C++ y C#.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left"><div><h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)"><i class="fas fa-crown" style="color:#3ddc97;margin-right:8px"></i>Características</h4><ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px"><li><strong>• Control Total del PC:</strong> Gestiona archivos, procesos y configuraciones.</li><li><strong>• Dispositivos Inteligentes:</strong> Conéctate a IoT, luces y más.</li><li><strong>• Multi-Idioma:</strong> Desarrollado en Python, C++ y C#.</li><li><strong>• Interfaz Moderna:</strong> Diseño limpio y fluido.</li></ul></div><div><h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)"><i class="fas fa-microchip" style="margin-right:8px"></i>Tecnologías</h4><p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">Python 3.12, C++17, C# .NET 8, APIs REST, WebSockets, IoT Core.</p></div></div>`
    }, {
        id: 'nexus_ds',
        name: 'Nexus Pro (Beta Cerrada)',
        cat: 'premium,asistentes',
        price: '$50.00',
        tag: 'PREMIUM',
        emoji: '⚡',
        color: '#c084fc',
        rating: '5.0',
        updatedDate: '09-07-2026',
        author: '157 Team',
        downloads: '2K+',
        commentsCount: '45',
        shortDesc: 'IA avanzada con redes neuronales, control total de PC y dispositivos inteligentes con soporte prioritario 24/7.',
        desc: 'Versión avanzada con conexión a dispositivos inteligentes, redes neuronales y control total de tu PC.',
        feats: ['Redes neuronales avanzadas', 'Control total de PC y dispositivos', 'Análisis predictivo',
            'Soporte 24/7 prioritario', 'Módulos personalizables'
        ],
        dl: 'https://discord.com/invite/RBBXNZaNDw',
        free: false,
        richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">Versión avanzada con conexión a dispositivos inteligentes, redes neuronales y control total de tu PC.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left"><div><h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)"><i class="fas fa-crown" style="color:#c084fc;margin-right:8px"></i>Características</h4><ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px"><li><strong>• Redes Neuronales:</strong> IA avanzada con aprendizaje continuo.</li><li><strong>• Control Total:</strong> Gestiona PC y dispositivos inteligentes.</li><li><strong>• Análisis Predictivo:</strong> Anticipa tus necesidades.</li><li><strong>• Soporte Prioritario:</strong> Atención 24/7 vía Discord.</li><li><strong>• Módulos Personalizables:</strong> Amplía funcionalidades.</li></ul></div><div><h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)"><i class="fas fa-microchip" style="margin-right:8px"></i>Stack</h4><p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">Python 3.12, TensorFlow, PyTorch, C++17, C# .NET 8, MQTT, WebSockets.</p></div></div>`
    }, {
        id: 'INY1',
        name: 'Inyector 157',
        cat: 'free,windows',
        price: '$0',
        tag: 'GRATIS',
        emoji: '🧬',
        color: '#afc7bd',
        rating: '4.5',
        updatedDate: '09-07-2026',
        author: '157 Team',
        downloads: '500+',
        commentsCount: '5',
        shortDesc: 'Totalmente gratis.',
        desc: 'Inyector potente paara dlls administrar tareas cerrar procesos y mucho mas, que esperas para poder probarlo es total free.',
        feats: ['Característica 1', 'Característica 2'],
        dl: 'https://github.com/SyntaxErrorSx/APPS-VIPS/releases/download/c0nverter/INJECTOR.zip',
        free: true,
        richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">
        <strong style="color:var(--text);">Inyector 157</strong> es una herramienta gratuita diseñada para la gestión avanzada de procesos y la inyección de DLLs en sistemas Windows. Ideal para desarrolladores y entusiastas.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left">
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-crown" style="color:#afc7bd;margin-right:8px"></i>Características
            </h4>
            <ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px">
                <li><strong>• Inyección de DLLs:</strong> Inyecta bibliotecas en procesos en ejecución.</li>
                <li><strong>• Gestión de Procesos:</strong> Administra y cierra procesos fácilmente.</li>
                <li><strong>• Interfaz Intuitiva:</strong> Diseño limpio y fácil de usar.</li>
                <li><strong>• 100% Gratis:</strong> Sin límites ni restricciones.</li>
            </ul>
        </div>
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-microchip" style="margin-right:8px"></i>Requisitos
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                Windows 10/11 · 64 bits · Net Framework 4.8+<br>
                <strong style="color:var(--text);">Tamaño:</strong> ~2.5 MB
            </p>
            <h4 style="color:var(--text);font-size:.95rem;margin-top:14px;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-download" style="margin-right:8px"></i>Instalación
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                1. Descarga el archivo ZIP<br>
                2. Extrae en una carpeta<br>
                3. Ejecuta el instalador<br>
                4. ¡Listo para usar!
            </p>
        </div>
    </div>
    <div style="background:rgba(61,220,151,0.06);border:1px solid rgba(61,220,151,0.12);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">✅</span>
        <span style="font-size:.82rem;color:var(--text-dim);"><strong style="color:var(--success);">100% Gratuito</strong> · Sin límites · Actualizaciones incluidas · Soporte en Discord</span>
    </div>`
    }, {
        id: 'INY2',
        name: 'Inyector Pro',
        cat: 'free,windows',
        price: '$0',
        tag: 'GRATIS',
        emoji: '🧬',
        color: '#afc7bd',
        rating: '4.5',
        updatedDate: '08-07-2026',
        author: '157 Team',
        downloads: '500+',
        commentsCount: '5',
        shortDesc: 'Este inyector es totalmente gratis.',
        desc: 'Inyector potente paara dlls administrar tareas cerrar procesos y mucho mas, que esperas para poder probarlo es total free.',
        feats: ['Inyección avanzada de DLLs', 'Gestión completa de procesos','Modo Stealth','Interfaz moderna',],
        dl: 'https://github.com/SyntaxErrorSx/APPS-VIPS/releases/download/v5/157.Injector.Pro-.exe',
        free: true,
        richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">
        <strong style="color:var(--text);">Inyector Pro</strong> es la versión avanzada del inyector de 157 Team. Diseñado para profesionales y entusiastas que necesitan una herramienta potente y confiable para la gestión de procesos y la inyección de DLLs en sistemas Windows.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left">
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-crown" style="color:#afc7bd;margin-right:8px"></i>Características
            </h4>
            <ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px">
                <li><strong>• Inyección Avanzada:</strong> Soporte para múltiples formatos de DLLs.</li>
                <li><strong>• Gestión de Procesos:</strong> Administra y cierra procesos en tiempo real.</li>
                <li><strong>• Modo Stealth:</strong> Inyección silenciosa sin detección.</li>
                <li><strong>• Interfaz Moderna:</strong> Diseño intuitivo y fácil de usar.</li>
                <li><strong>• 100% Gratis:</strong> Sin límites ni restricciones.</li>
            </ul>
        </div>
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-microchip" style="margin-right:8px"></i>Requisitos
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                Windows 10/11 · 64 bits · Net Framework 4.8+<br>
                <strong style="color:var(--text);">Tamaño:</strong> ~3.2 MB
            </p>
            <h4 style="color:var(--text);font-size:.95rem;margin-top:14px;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-download" style="margin-right:8px"></i>Instalación
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                1. Descarga el archivo .exe<br>
                2. Ejecuta como administrador<br>
                3. Sigue las instrucciones<br>
                4. ¡Listo para usar!
            </p>
        </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:2rem;margin-bottom:6px">💉</div>
            <div style="font-size:.72rem;font-weight:700;color:var(--text);">Inyección Avanzada</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Múltiples formatos DLL</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:2rem;margin-bottom:6px">⚙️</div>
            <div style="font-size:.72rem;font-weight:700;color:var(--text);">Control Total</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Gestión de procesos</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:2rem;margin-bottom:6px">🛡️</div>
            <div style="font-size:.72rem;font-weight:700;color:var(--text);">Modo Stealth</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Inyección silenciosa</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:2rem;margin-bottom:6px">🎯</div>
            <div style="font-size:.72rem;font-weight:700;color:var(--text);">Precisión</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Inyección en tiempo real</div>
        </div>
    </div>
    <div style="background:rgba(61,220,151,0.06);border:1px solid rgba(61,220,151,0.12);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">✅</span>
        <span style="font-size:.82rem;color:var(--text-dim);"><strong style="color:var(--success);">100% Gratuito</strong> · Sin límites · Actualizaciones incluidas · Soporte en Discord</span>
    </div>
    <div style="margin-top:16px;background:rgba(175,199,189,0.04);border:1px solid rgba(175,199,189,0.08);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">🔒</span>
        <span style="font-size:.78rem;color:var(--text-faint);">Versión: <strong style="color:var(--text);">v5.0</strong> · Última actualización: <strong style="color:var(--text);">08-07-2026</strong></span>
    </div>`
    }, {
    id: 'yimmenu',
    name: 'YimMenu Enhanced',
    cat: 'free,windows',
    price: '$0',
    tag: 'GRATIS',
    emoji: '🟣',
    color: '#8b5cf6',
    rating: '4.9',
    updatedDate: '09-07-2026',
    author: '157 Team',
    downloads: '10K+',
    commentsCount: '234',
    shortDesc: 'Menú avanzado con protección anti-detección, estabilidad mejorada y funciones exclusivas para GTA V.',
    desc: 'YimMenu Enhanced es la versión mejorada del famoso menú para GTA V, con protección anti-detección y funciones avanzadas.',
    feats: [
        '🛡️ Anti-Detección Avanzada',
        '⚡ Inyección Instantánea',
        '🎨 Interfaz Morada Personalizada',
        '🔒 Protección contra Ban',
        '📦 Actualizaciones Automáticas',
        '🎮 Compatible con Online y Story Mode'
    ],
    dl: 'https://github.com/santhiagocaro05-debug/NEXUS-INSTALLER/releases/download/installer2/YimMenuForce.dll',
    free: true,
    richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">
        <strong style="color:#8b5cf6;">YimMenu Enhanced</strong> es la versión mejorada del famoso menú para GTA V. Diseñado con un elegante tema morado y características exclusivas que lo convierten en la mejor opción para jugadores que buscan seguridad y rendimiento.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left">
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-crown" style="color:#8b5cf6;margin-right:8px"></i>Características Principales
            </h4>
            <ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px">
                <li><strong style="color:#8b5cf6;">• Anti-Detección:</strong> Sistema avanzado que evade las detecciones de Rockstar.</li>
                <li><strong style="color:#8b5cf6;">• Inyección Rápida:</strong> Inyección instantánea en menos de 2 segundos.</li>
                <li><strong style="color:#8b5cf6;">• Estabilidad Mejorada:</strong> Menos crashes y mejor rendimiento.</li>
                <li><strong style="color:#8b5cf6;">• Protección contra Ban:</strong> Múltiples capas de seguridad.</li>
                <li><strong style="color:#8b5cf6;">• Actualizaciones:</strong> Soporte continuo y actualizaciones automáticas.</li>
                <li><strong style="color:#8b5cf6;">• Multiplataforma:</strong> Funciona en Online y Story Mode.</li>
            </ul>
        </div>
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-microchip" style="color:#8b5cf6;margin-right:8px"></i>Requisitos
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                Windows 10/11 · 64 bits · GTA V (última versión)<br>
                <strong style="color:var(--text);">Tamaño:</strong> ~3.8 MB
            </p>
            <h4 style="color:var(--text);font-size:.95rem;margin-top:14px;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-download" style="color:#8b5cf6;margin-right:8px"></i>Instalación
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                1. Descarga el archivo ZIP<br>
                2. Extrae en una carpeta<br>
                3. Ejecuta el inyector<br>
                4. Inicia GTA V<br>
                5. ¡Disfruta del menú!
            </p>
            <div style="margin-top:12px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.12);border-radius:12px;padding:10px 14px">
                <span style="font-size:.7rem;color:var(--text-faint);">⚠️ <strong style="color:#8b5cf6;">Importante:</strong> Ejecuta siempre como administrador para evitar errores de inyección.</span>
            </div>
        </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;border-color:rgba(139,92,246,0.15)">
            <div style="font-size:2rem;margin-bottom:6px">🛡️</div>
            <div style="font-size:.72rem;font-weight:700;color:#8b5cf6;">Anti-Detección</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Protección avanzada</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;border-color:rgba(139,92,246,0.15)">
            <div style="font-size:2rem;margin-bottom:6px">⚡</div>
            <div style="font-size:.72rem;font-weight:700;color:#8b5cf6;">Inyección Rápida</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Menos de 2 segundos</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;border-color:rgba(139,92,246,0.15)">
            <div style="font-size:2rem;margin-bottom:6px">🎮</div>
            <div style="font-size:.72rem;font-weight:700;color:#8b5cf6;">Multiplataforma</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Online y Story</div>
        </div>
    </div>
    <div style="background:rgba(61,220,151,0.06);border:1px solid rgba(61,220,151,0.12);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">✅</span>
        <span style="font-size:.82rem;color:var(--text-dim);"><strong style="color:var(--success);">100% Gratuito</strong> · Sin límites · Actualizaciones semanales · Soporte en Discord</span>
    </div>
    <div style="margin-top:16px;background:rgba(139,92,246,0.04);border:1px solid rgba(139,92,246,0.08);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">🟣</span>
        <span style="font-size:.78rem;color:var(--text-faint);">Versión: <strong style="color:#8b5cf6;">v5.2.0</strong> · Última actualización: <strong style="color:#8b5cf6;">09-07-2026</strong> · Tema Morado Enhanced</span>
    </div>`
    }, {
        id: 'yimmenu_legacy',
    name: 'YimMenu Legacy',
    cat: 'free,windows',
    price: '$0',
    tag: 'GRATIS',
    emoji: '🟣',
    color: '#5c6bf6',
    rating: '4.9',
    updatedDate: '11-07-2026',
    author: '157 Team',
    downloads: '678+',
    commentsCount: '0',
    shortDesc: 'Menú modular y ligero para GTA V, enfocado en estabilidad y personalización.',
    desc: 'YimMenu Legacy es un menú de modificación para GTA V de código abierto, diseñado para ser fácil de usar, estable y altamente configurable.',
    feats: [
        '🛡️ Protección contra crashes y ataques',
        '🚗 Editor de vehículos (color, turbo, aceleración)',
        '💪 Opciones de jugador (salud, armadura, velocidad)',
        '🔫 Spawn de vehículos y armas',
        '🌍 Menú de mundo (clima, hora, tráfico)',
        '⭐ Sistema de favoritos y perfiles',
        '🎨 Interfaz limpia y personalizable',
        '📦 Actualizaciones frecuentes y soporte comunitario'
    ],
    dl: 'https://github.com/tu-repo/yimmenu-legacy/releases',
    free: true,
    richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">
        <strong style="color:#8b5cf6;">YimMenu Legacy</strong> es un menú de modificación para GTA V de código abierto, diseñado para ser fácil de usar, estable y altamente configurable.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left">
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-crown" style="color:#8b5cf6;margin-right:8px"></i>Características
            </h4>
            <ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px">
                <li><strong style="color:#8b5cf6;">• Protección avanzada:</strong> Anti-crash y anti-ataques.</li>
                <li><strong style="color:#8b5cf6;">• Editor de vehículos:</strong> Color, turbo, aceleración y más.</li>
                <li><strong style="color:#8b5cf6;">• Opciones de jugador:</strong> Salud, armadura, velocidad, invisibilidad.</li>
                <li><strong style="color:#8b5cf6;">• Spawn de objetos:</strong> Vehículos y armas.</li>
                <li><strong style="color:#8b5cf6;">• Menú de mundo:</strong> Clima, hora, tráfico.</li>
                <li><strong style="color:#8b5cf6;">• Interfaz personalizable:</strong> Limpia y modular.</li>
            </ul>
        </div>
    </div>`
    }, {
    id: 'nexus_browser',
    name: 'Nexus Browser',
    cat: 'free,windows',
    price: '$0',
    tag: 'GRATIS',
    emoji: '🌐',
    color: '#3ddc97',
    rating: '4.8',
    updatedDate: '11-07-2026',
    author: '157 Team',
    downloads: '512+',
    commentsCount: '0',
    shortDesc: 'Navegador web ligero, seguro y privado con bloqueador de anuncios integrado y modo oscuro nativo.',
    desc: 'Nexus Browser es un navegador web diseñado para velocidad, privacidad y seguridad. Incluye bloqueador de anuncios, protección contra rastreo y una interfaz minimalista.',
    feats: [
        '🚀 Navegación ultrarrápida',
        '🛡️ Bloqueador de anuncios integrado',
        '🔒 Protección contra rastreo y huellas digitales',
        '🌙 Modo oscuro nativo',
        '📌 Pestañas y marcadores',
        '🔐 Gestor de contraseñas',
        '📥 Descargas seguras',
        '🔄 Sincronización entre dispositivos (próximamente)'
    ],
    dl: 'https://github.com/santhiagocaro05-debug/NEXUS-INSTALLER/releases/download/installer/NEXUS_Browser.exe',
    free: true,
    richHTML: `<p style="margin-bottom:20px;font-size:.9rem;line-height:1.6;color:var(--text-dim)">
        <strong style="color:#3ddc97;">Nexus Browser</strong> es un navegador web moderno, ligero y enfocado en la privacidad del usuario. Diseñado por 157 Team para ofrecer una experiencia de navegación rápida y segura sin sacrificar el rendimiento.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:20px;text-align:left">
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-crown" style="color:#3ddc97;margin-right:8px"></i>Características
            </h4>
            <ul style="list-style:none;padding-left:0;font-size:.82rem;color:var(--text-dim);line-height:1.6;display:flex;flex-direction:column;gap:6px">
                <li><strong style="color:#3ddc97;">• Navegación rápida:</strong> Motor optimizado para carga instantánea.</li>
                <li><strong style="color:#3ddc97;">• Bloqueador de anuncios:</strong> Navega sin interrupciones.</li>
                <li><strong style="color:#3ddc97;">• Privacidad total:</strong> Protección contra rastreo y huellas digitales.</li>
                <li><strong style="color:#3ddc97;">• Modo oscuro:</strong> Interfaz nativa en modo oscuro.</li>
                <li><strong style="color:#3ddc97;">• Gestor de contraseñas:</strong> Guarda y administra tus contraseñas.</li>
                <li><strong style="color:#3ddc97;">• Descargas seguras:</strong> Escáner integrado para archivos descargados.</li>
            </ul>
        </div>
        <div>
            <h4 style="color:var(--text);font-size:.95rem;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-microchip" style="color:#3ddc97;margin-right:8px"></i>Requisitos
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                Windows 10/11 · 64 bits · Linux (próximamente)<br>
                <strong style="color:var(--text);">Tamaño:</strong> ~45 MB
            </p>
            <h4 style="color:var(--text);font-size:.95rem;margin-top:14px;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:4px;font-family:var(--font-display)">
                <i class="fas fa-download" style="color:#3ddc97;margin-right:8px"></i>Instalación
            </h4>
            <p style="font-size:.82rem;color:var(--text-dim);line-height:1.5">
                1. Descarga el instalador<br>
                2. Ejecuta el archivo .exe<br>
                3. Sigue las instrucciones del asistente<br>
                4. ¡Listo para navegar!
            </p>
            <div style="margin-top:12px;background:rgba(61,220,151,0.06);border:1px solid rgba(61,220,151,0.12);border-radius:12px;padding:10px 14px">
                <span style="font-size:.7rem;color:var(--text-faint);">🔒 <strong style="color:#3ddc97;">Privacidad primero:</strong> Sin recolección de datos, sin anuncios, sin compromisos.</span>
            </div>
        </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;border-color:rgba(61,220,151,0.15)">
            <div style="font-size:2rem;margin-bottom:6px">🚀</div>
            <div style="font-size:.72rem;font-weight:700;color:#3ddc97;">Rápido</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Carga instantánea</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;border-color:rgba(61,220,151,0.15)">
            <div style="font-size:2rem;margin-bottom:6px">🛡️</div>
            <div style="font-size:.72rem;font-weight:700;color:#3ddc97;">Seguro</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Bloqueo de rastreadores</div>
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;border-color:rgba(61,220,151,0.15)">
            <div style="font-size:2rem;margin-bottom:6px">🌙</div>
            <div style="font-size:.72rem;font-weight:700;color:#3ddc97;">Modo Oscuro</div>
            <div style="font-size:.68rem;color:var(--text-dim);">Interfaz nativa</div>
        </div>
    </div>
    <div style="background:rgba(61,220,151,0.06);border:1px solid rgba(61,220,151,0.12);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">✅</span>
        <span style="font-size:.82rem;color:var(--text-dim);"><strong style="color:var(--success);">100% Gratuito</strong> · Código abierto · Sin anuncios · Sin rastreo · Soporte en Discord</span>
    </div>
    <div style="margin-top:16px;background:rgba(61,220,151,0.04);border:1px solid rgba(61,220,151,0.08);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.2rem">🌐</span>
        <span style="font-size:.78rem;color:var(--text-faint);">Versión: <strong style="color:#3ddc97;">v1.0.0</strong> · Última actualización: <strong style="color:#3ddc97;">11-07-2026</strong> · Nexus Browser</span>
    </div>`
    }];

    let PRODUCTS = [...PRODUCTS_DEFAULT];
    async function loadProductsFromFirebase() {
    if (!window.fb || !window.fb.getProducts) return;
    const result = await window.fb.getProducts();
    if (result.success && result.data.length) {
        // Combina: productos de Firebase + los "hardcodeados" que quieras conservar
        PRODUCTS = [...PRODUCTS_DEFAULT, ...result.data.map(p => ({ ...p, free: p.price === '$0' || p.price === '0' }))];
    }
    await applySavedProductOrder(); 
    renderProducts();
}
// ✅ AGREGAR ESTA FUNCIÓN COMPLETA
async function applySavedProductOrder() {
    if (!window.fb || !window.fb.getProductOrder) return;
    const res = await window.fb.getProductOrder();
    if (!res.success || !res.order || !res.order.length) return;
    const orderMap = {};
    res.order.forEach((id, i) => orderMap[id] = i);
    PRODUCTS.sort((a, b) => {
        const ai = orderMap.hasOwnProperty(a.id) ? orderMap[a.id] : 9999;
        const bi = orderMap.hasOwnProperty(b.id) ? orderMap[b.id] : 9999;
        return ai - bi;
    });
}
    let userDirectory = {};

    // ===== FUNCIONES JSONBIN (SOLO PARA RESPALDO) =====
    async function getData() {
        try {
            const r = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN}/latest`, { headers: { 'X-Master-Key': JSONBIN_KEY } });
            const d = await r.json();
            return d.record || { comments: [], foro: [], products: [], users: [], userProfiles: {} };
        } catch (e) {
            console.warn('Error al obtener datos:', e);
            return { comments: [], foro: [], products: [], users: [], userProfiles: {} };
        }
    }

    async function saveData(data) {
        try {
            await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY },
                body: JSON.stringify(data)
            });
            return true;
        } catch (e) {
            console.warn('Error al guardar datos:', e);
            return false;
        }
    }

    // ===== AUTENTICACIÓN (FIREBASE) =====
    async function handleRegisterFirebase() {
        const name = $('regName').value.trim();
        const email = $('regEmail').value.trim();
        const pass = $('regPassword').value;

        if (!name || !email || !pass) {
            setAuthStatus('registerStatus', 'Completa todos los campos', 'error');
            return;
        }
        if (pass.length < 6) {
            setAuthStatus('registerStatus', '⚠️ La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setAuthStatus('registerStatus', 'Correo inválido', 'error');
            return;
        }
        if (!window.fb || !window.fb.registerUser) {
            setAuthStatus('registerStatus', '❌ Firebase no disponible', 'error');
            return;
        }

        setAuthStatus('registerStatus', '⏳ Registrando...', '');
        const btn = $('doRegisterBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

        const r = await window.fb.registerUser(email, pass, name);

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Crear cuenta';

        if (!r.success) {
            setAuthStatus('registerStatus', r.error || 'Error al registrar', 'error');
            return;
        }

        // ✅ Guardar en JSONBin (respaldo)
        const data = await getData();
        if (!data.users) data.users = [];
        const existing = data.users.find(u => u.id === r.user.uid);
        if (!existing) {
            data.users.push({
                id: r.user.uid,
                username: name,
                email: email,
                isAdmin: r.user.isAdmin || false,
                createdAt: new Date().toISOString()
            });
            await saveData(data);
        }

        currentUser = {
            uid: r.user.uid,
            username: name,
            email: email,
            isAdmin: r.user.isAdmin || false,
        };
        localStorage.setItem('jv_user', JSON.stringify(currentUser));

        updateAuthUI();
        loadComments();
        loadForo();
        loadProductsFromFirebase(); 
        closeAuthModal();
        setTimeout(syncDockProfile, 50);
        toast(`¡Cuenta creada! Bienvenido, ${name} 🎉`);
        $('regName').value = '';
        $('regEmail').value = '';
        $('regPassword').value = '';
        $('registerStatus').className = 'status-msg';
    }

    async function handleLoginFirebase() {
        const email = $('loginEmail').value.trim();
        const pass = $('loginPassword').value;

        if (!email || !pass) {
            setAuthStatus('loginStatus', 'Completa todos los campos', 'error');
            return;
        }
        if (!window.fb || !window.fb.loginUser) {
            setAuthStatus('loginStatus', '❌ Firebase no disponible', 'error');
            return;
        }

        setAuthStatus('loginStatus', '⏳ Iniciando sesión...', '');
        const btn = $('doLoginBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';

        const r = await window.fb.loginUser(email, pass);

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar sesión';

        if (!r.success) {
            setAuthStatus('loginStatus', r.error || 'Error al iniciar sesión', 'error');
            return;
        }

        const data = await getData();
        if (!data.users) data.users = [];
        const existing = data.users.find(u => u.id === r.user.uid);
        if (!existing) {
            data.users.push({
                id: r.user.uid,
                username: r.user.username || email.split('@')[0],
                email: email,
                isAdmin: r.user.isAdmin || false,
                createdAt: new Date().toISOString()
            });
            await saveData(data);
        }

        currentUser = {
            uid: r.user.uid,
            username: r.user.username || email.split('@')[0],
            email: email,
            isAdmin: r.user.isAdmin || false,
        };
        localStorage.setItem('jv_user', JSON.stringify(currentUser));

        updateAuthUI();
        loadComments();
        loadForo();
        renderProducts();
        closeAuthModal();
        toast(`¡Bienvenido, ${currentUser.username}! 🎉`);
        $('loginEmail').value = '';
        $('loginPassword').value = '';
        $('loginStatus').className = 'status-msg';
    }

    async function handleGoogleLogin() {
        if (!window.fb || !window.fb.loginWithGoogle) {
            setAuthStatus('loginStatus', '❌ Firebase no disponible', 'error');
            return;
        }
        setAuthStatus('loginStatus', '⏳ Abriendo Google...', '');
        const r = await window.fb.loginWithGoogle();
        if (!r.success) {
            setAuthStatus('loginStatus', r.error || 'Error al iniciar con Google', 'error');
            return;
        }
        const data = await getData();
        if (!data.users) data.users = [];
        const existing = data.users.find(u => u.id === r.user.uid);
        if (!existing) {
            data.users.push({
                id: r.user.uid,
                username: r.user.username || r.user.displayName || r.user.email.split('@')[0],
                email: r.user.email,
                isAdmin: r.user.isAdmin || false,
                createdAt: new Date().toISOString()
            });
            await saveData(data);
        }
        currentUser = {
            uid: r.user.uid,
            username: r.user.username || r.user.displayName || r.user.email.split('@')[0],
            email: r.user.email,
            isAdmin: r.user.isAdmin || false,
        };
        localStorage.setItem('jv_user', JSON.stringify(currentUser));
        updateAuthUI();
        loadComments();
        loadForo();
        renderProducts();
        closeAuthModal();
        toast(`¡Bienvenido, ${currentUser.username}! 🎉`);
    }

    async function handleGithubLogin() {
        if (!window.fb || !window.fb.loginWithGithub) {
            setAuthStatus('loginStatus', '❌ Firebase no disponible', 'error');
            return;
        }
        setAuthStatus('loginStatus', '⏳ Abriendo GitHub...', '');
        const r = await window.fb.loginWithGithub();
        if (!r.success) {
            setAuthStatus('loginStatus', r.error || 'Error al iniciar con GitHub', 'error');
            return;
        }
        const data = await getData();
        if (!data.users) data.users = [];
        const existing = data.users.find(u => u.id === r.user.uid);
        if (!existing) {
            data.users.push({
                id: r.user.uid,
                username: r.user.username || r.user.displayName || r.user.email.split('@')[0],
                email: r.user.email,
                isAdmin: r.user.isAdmin || false,
                createdAt: new Date().toISOString()
            });
            await saveData(data);
        }
        currentUser = {
            uid: r.user.uid,
            username: r.user.username || r.user.displayName || r.user.email.split('@')[0],
            email: r.user.email,
            isAdmin: r.user.isAdmin || false,
        };
        localStorage.setItem('jv_user', JSON.stringify(currentUser));
        updateAuthUI();
        loadComments();
        loadForo();
        renderProducts();
        closeAuthModal();
        toast(`¡Bienvenido, ${currentUser.username}! 🎉`);
    }

    async function handleLogout() {
        if (window.fb && window.fb.logoutUser) {
            await window.fb.logoutUser();
        }
        currentUser = null;
        localStorage.removeItem('jv_user');
        updateAuthUI();
        loadComments();
        loadForo();
        adminAuthed = false;
        toast('Sesión cerrada');
    }

    // ===== SESSION RESTORE =====
    function initFirebaseAuth() {
        if (window.fb && window.fb.onAuthChange) {
            window.fb.onAuthChange(async (user) => {
                if (user) {
                    currentUser = {
                        uid: user.uid,
                        username: user.displayName || user.username || user.email.split('@')[0],
                        email: user.email,
                        isAdmin: user.isAdmin || false
                    };
                    localStorage.setItem('jv_user', JSON.stringify(currentUser));
                    await ensureUserInJsonBin(currentUser);
                    updateAuthUI();
                    loadComments();
                    loadForo();
                    renderProducts();
                } else {
                    currentUser = null;
                    localStorage.removeItem('jv_user');
                    updateAuthUI();
                    loadComments();
                    loadForo();
                    renderProducts();
                }
            });
        } else {
            const stored = JSON.parse(localStorage.getItem('jv_user') || 'null');
            if (stored) {
                currentUser = stored;
                updateAuthUI();
                loadComments();
                loadForo();
                renderProducts();
            }
        }
    }

    async function ensureUserInJsonBin(user) {
        const data = await getData();
        if (!data.users) data.users = [];
        const existing = data.users.find(u => u.id === user.uid);
        if (!existing) {
            data.users.push({
                id: user.uid,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin || false,
                isDeveloper: user.isDeveloper || false,
                createdAt: new Date().toISOString()
            });
            await saveData(data);
        }
    }

    // ============================================================
    // ✅ COMENTARIOS - FIRESTORE
    // ============================================================
    async function loadComments() {
        const list = $('commentsList');
        list.innerHTML =
            '<div style="text-align:center;padding:30px;color:var(--text-dim)"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

        if (!window.fb || !window.fb.getComments) {
            list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)">❌ Firebase no disponible</div>';
            return;
        }

        const commentsResult = await window.fb.getComments();
        if (!commentsResult.success) {
            list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)">❌ Error al cargar comentarios</div>';
            return;
        }

        const comments = commentsResult.data || [];

        const usersResult = await window.fb.getAllUsers();
        const users = usersResult.success ? usersResult.data : [];
        const userAvatarMap = {};
        const userProfileCache = {};
        const rankMap = {};
        const nameEffectMap = {};
        const effectColorMap = {};
        const nexusPlusMap = {};
        users.forEach(u => {
            userAvatarMap[u.id] = u.avatar || '';
            nexusPlusMap[u.id] = !!u.nexusPlus || !!u.hasNexusPlus;
            if (u.isAdmin) rankMap[u.id] = 'admin';
            else if (u.rank) rankMap[u.id] = u.rank;
            else rankMap[u.id] = 'member';
            const fx = u.nameEffect || 'none';
            if (fx === 'plusgold' && !u.nexusPlus) nameEffectMap[u.id] = 'none';
            else if (fx === 'devtype' && !u.isDeveloper) nameEffectMap[u.id] = 'none';
            else nameEffectMap[u.id] = fx;
            effectColorMap[u.id] = u.effectColor || '';
        });

        if (!comments.length) {
            list.innerHTML =
            '<div style="text-align:center;padding:40px;color:var(--text-dim)">💬 Sé el primero en comentar</div>';
            return;
        }

        list.innerHTML = comments.map(c => {
            const rank = rankMap[c.authorId] || 'member';
            const rb = getCommentBadge(rank);
            const nameFx = nameEffectMap[c.authorId] || 'none';
            const userFxColor = effectColorMap[c.authorId] || '';
            const isNexusPlus = c.authorNexusPlus || nexusPlusMap[c.authorId];
            const isOwner = currentUser && (c.authorId === currentUser.uid);
            const ul = currentUser && (c.likes || []).includes(currentUser.uid);
            const ud = currentUser && (c.dislikes || []).includes(currentUser.uid);
            const avatarUrl = userAvatarMap[c.authorId] || '';
            const avatarHTML = avatarUrl ?
                `<img src="${avatarUrl}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1)">` :
                (c.author[0] || '?').toUpperCase();
            
            const nPlusHTML = isNexusPlus ? `<span style="color:var(--nexus-gold); font-size:0.75rem; margin-left:4px;" title="Miembro Nexus+"><i class="fas fa-gem"></i></span>` : '';

            return `<div class="comment-item" id="ci-${c.id}">
                      <div class="c-head">
                        <div class="c-avatar" onclick="location.href='perfil.html?u=${c.authorId}'" style="cursor:pointer;overflow:hidden;background:var(--cyan-dim);display:grid;place-items:center;">
  ${avatarHTML}
</div>
<span class="c-author uname uname-${nameFx}" onclick="location.href='perfil.html?u=${c.authorId}'" style="cursor:pointer;${userFxColor ? ` --uname-color: ${userFxColor};` : ''}">${esc(c.author)}${nPlusHTML}</span>
                        ${rb}
                        ${isOwner ? '<span style="font-size:.62rem;background:var(--cyan-dim);color:var(--cyan);padding:2px 8px;border-radius:6px;font-weight:700">Tú</span>' : ''}
                        <span class="c-date">${new Date(c.date).toLocaleString()}</span>
                      </div>
                      <div class="c-text">${esc(c.text)}</div>
                      <div class="c-actions">
                        <button class="like-btn${ul?' active':''}" data-id="${c.id}"><i class="fas fa-thumbs-up"></i> ${(c.likes||[]).length}</button>
                        <button class="dislike-btn${ud?' active':''}" data-id="${c.id}"><i class="fas fa-thumbs-down"></i> ${(c.dislikes||[]).length}</button>
                        <button class="reply-btn" data-id="${c.id}"><i class="fas fa-reply"></i> Responder</button>
                        ${isOwner ? `<button class="edit-comment-btn" data-id="${c.id}" style="color:var(--cyan)"><i class="fas fa-edit"></i> Editar</button>` : ''}
                        ${isOwner ? `<button class="delete-comment-btn" data-id="${c.id}" style="color:var(--danger)"><i class="fas fa-trash"></i> Borrar</button>` : ''}
                      </div>
                      <div class="replies">
                        ${(c.replies||[]).map(r => `
                          <div class="reply-item">
                            <div class="c-head" style="margin-bottom:4px;">
                              <span class="c-author">${esc(r.author)}</span>
                              <span class="c-date">${new Date(r.date).toLocaleString()}</span>
                            </div>
                            <div class="c-text">${esc(r.text)}</div>
                          </div>
                        `).join('')}
                        <div id="rf-${c.id}" style="display:none;gap:8px;margin-top:10px">
                          <input type="text" id="ri-${c.id}" placeholder="Escribe tu respuesta..." style="flex:1;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:9px 14px;color:var(--text);font-family:inherit;font-size:.82rem;outline:none;">
                          <button class="submit-reply-btn btn btn-solid btn-sm" data-id="${c.id}" style="padding:8px 16px;font-size:.75rem;">Enviar</button>
                        </div>
                      </div>
                    </div>`;
        }).join('');

        list.querySelectorAll('.like-btn').forEach(b => b.onclick = () => handleLike(b.dataset.id));
        list.querySelectorAll('.dislike-btn').forEach(b => b.onclick = () => handleDislike(b.dataset.id));
        list.querySelectorAll('.reply-btn').forEach(b => b.onclick = () => toggleReplyForm(b.dataset.id));
        list.querySelectorAll('.submit-reply-btn').forEach(b => b.onclick = () => submitReply(b.dataset.id));
        list.querySelectorAll('.edit-comment-btn').forEach(b => b.onclick = () => editComment(b.dataset.id));
        list.querySelectorAll('.delete-comment-btn').forEach(b => b.onclick = () => deleteComment(b.dataset.id));
    }

    function getCommentBadge(rank) {
        const map = {
            admin: '<span class="badge-tag badge-admin">👑 Admin</span>',
            collaborator: '<span class="badge-tag badge-collab">🤝 Colaborador</span>',
            moderator: '<span class="badge-tag badge-mod">🛡️ Moderador</span>',
            member: ''
        };
        return map[rank] || '';
    }

    function toggleReplyForm(id) {
        if (!currentUser) { openAuthModal(); return; }
        const rf = $(`rf-${id}`);
        rf.style.display = rf.style.display === 'none' ? 'flex' : 'none';
        if (rf.style.display === 'flex') $(`ri-${id}`)?.focus();
    }

    async function submitReply(cid) {
        if (!currentUser) { openAuthModal(); return; }
        const inp = document.getElementById(`ri-${cid}`);
        const text = inp?.value.trim();
        if (!text) return;
        if (!window.fb || !window.fb.db) { toast('❌ Firebase no disponible', 'error'); return; }
        try {
            const commentsResult = await window.fb.getComments();
            if (!commentsResult.success) { toast('Error al obtener comentarios', 'error'); return; }
            const comments = commentsResult.data;
            const c = comments.find(x => x.id === cid);
            if (!c) return;
            if (!c.replies) c.replies = [];
            c.replies.push({
                id: Date.now().toString(),
                author: currentUser.username,
                authorId: currentUser.uid,
                text: text,
                date: new Date().toISOString()
            });
            const commentRef = window.fb.doc(window.fb.db, 'comments', cid);
            await window.fb.updateDoc(commentRef, { replies: c.replies });
            await loadComments();
            toast('✅ Respuesta publicada');
            inp.value = '';
        } catch (error) {
            toast('❌ Error al guardar respuesta: ' + error.message, 'error');
        }
    }

    async function handleLike(id) {
        if (!currentUser) { openAuthModal(); return; }
        if (!window.fb || !window.fb.updateComment) { toast('❌ Firebase no disponible', 'error'); return; }
        const commentsResult = await window.fb.getComments();
        if (!commentsResult.success) return;
        const comment = commentsResult.data.find(c => c.id === id);
        if (!comment) return;
        const likes = comment.likes || [];
        const dislikes = comment.dislikes || [];
        if (likes.includes(currentUser.uid)) {
            await window.fb.updateComment(id, 'likes', currentUser.uid, 'arrayRemove');
        } else {
            if (dislikes.includes(currentUser.uid)) {
                await window.fb.updateComment(id, 'dislikes', currentUser.uid, 'arrayRemove');
            }
            await window.fb.updateComment(id, 'likes', currentUser.uid, 'arrayUnion');
        }
        await loadComments();
    }

    async function handleDislike(id) {
        if (!currentUser) { openAuthModal(); return; }
        if (!window.fb || !window.fb.updateComment) { toast('❌ Firebase no disponible', 'error'); return; }
        const commentsResult = await window.fb.getComments();
        if (!commentsResult.success) return;
        const comment = commentsResult.data.find(c => c.id === id);
        if (!comment) return;
        const likes = comment.likes || [];
        const dislikes = comment.dislikes || [];
        if (dislikes.includes(currentUser.uid)) {
            await window.fb.updateComment(id, 'dislikes', currentUser.uid, 'arrayRemove');
        } else {
            if (likes.includes(currentUser.uid)) {
                await window.fb.updateComment(id, 'likes', currentUser.uid, 'arrayRemove');
            }
            await window.fb.updateComment(id, 'dislikes', currentUser.uid, 'arrayUnion');
        }
        await loadComments();
    }

    async function editComment(id) {
        if (!currentUser) { toast('Inicia sesión para editar', 'error'); return; }
        if (!window.fb || !window.fb.getComments || !window.fb.updateComment) { toast('❌ Firebase no disponible',
                'error'); return; }
        const commentsResult = await window.fb.getComments();
        if (!commentsResult.success) { toast('Error al obtener comentarios', 'error'); return; }
        const c = commentsResult.data.find(x => x.id === id);
        if (!c) { toast('Comentario no encontrado', 'error'); return; }
        if (c.authorId !== currentUser.uid) { toast('No puedes editar este comentario', 'error'); return; }
        const t = prompt('Edita tu comentario:', c.text);
        if (t && t.trim()) {
            const result = await window.fb.updateComment(id, 'text', t.trim(), 'set');
            if (result.success) { await loadComments();
                toast('✅ Comentario editado'); } else { toast('❌ Error: ' + result.error, 'error'); }
        }
    }

    async function deleteComment(id) {
        if (!window.fb || !window.fb.deleteComment) { toast('❌ Firebase no disponible', 'error'); return; }
        showDeleteConfirm({
            title: '¿Eliminar comentario?',
            subtitle: 'Tu comentario será eliminado permanentemente.',
            onConfirm: async () => {
                const result = await window.fb.deleteComment(id, currentUser?.uid);
                if (result.success) { await loadComments();
                    toast('Comentario eliminado'); } else { toast('❌ Error: ' + result.error,
                    'error'); }
            }
        });
    }

    async function addComment(text) {
        if (!currentUser) { openAuthModal(); return false; }
        if (!text.trim()) return false;
        if (!window.fb || !window.fb.addComment) { toast('❌ Firebase no disponible', 'error'); return false; }
        const result = await window.fb.addComment(text.trim(), currentUser.uid, currentUser.username);
        if (result.success) { await loadComments();
            toast('¡Comentario publicado!'); return true; } else { toast('❌ Error: ' + result.error,
            'error'); return false; }
    }

    // ============================================================
    // ✅ FORO - FIRESTORE (¡YA NO USA JSONBIN!)
    // ============================================================
    async function loadForo() {
        const grid = $('foroGrid');
        grid.innerHTML =
            '<div style="text-align:center;padding:30px;color:var(--text-dim);grid-column:1/-1"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

        if (!window.fb || !window.fb.getPosts) {
            grid.innerHTML =
                '<div style="text-align:center;padding:30px;color:var(--text-dim);grid-column:1/-1">❌ Firebase no disponible</div>';
            return;
        }

        const postsResult = await window.fb.getPosts();
        if (!postsResult.success) {
            grid.innerHTML =
                '<div style="text-align:center;padding:30px;color:var(--text-dim);grid-column:1/-1">❌ Error al cargar publicaciones</div>';
            return;
        }

        const posts = postsResult.data || [];

        if (!posts.length) {
            grid.innerHTML =
                '<div style="text-align:center;padding:40px;color:var(--text-dim);grid-column:1/-1">🚀 Sé el primero en crear una publicación</div>';
            return;
        }

        grid.innerHTML = posts.map(p => {
            const isOwner = currentUser && p.authorId === currentUser.uid;
            const imgHtml = p.image ?
                `<img src="${esc(p.image)}" class="forum-img" loading="lazy" onerror="this.outerHTML='<div class=forum-img-ph><i class=fas fa-image style=color:var(--text-faint)></i></div>'">` :
                `<div class="forum-img-ph"><i class="fas fa-image" style="font-size:2.5rem;color:var(--text-faint)"></i></div>`;
            return `<div class="forum-card" style="cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'" onclick="if(!event.target.closest('.forum-actions')) window.openPostDetail('${p.id}')">
                ${isOwner ? `<div class="forum-actions">
                    <button style="background:var(--cyan-dim);color:var(--cyan);" onclick="openEditPost('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button style="background:var(--danger-dim);color:var(--danger);" onclick="deletePost('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>` : ''}
                ${imgHtml}
                <div class="forum-body">
                    <h4>${esc(p.title)}</h4>
                    <p>${esc(p.desc.substring(0, 140))}${p.desc.length > 140 ? '...' : ''}</p>
                    <div class="forum-meta">
                        <span><i class="fas fa-user"></i> ${esc(p.author)}</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(p.date).toLocaleDateString()}</span>
                        <span style="color:var(--cyan);font-weight:600;"><i class="fas fa-comment-alt"></i> Abrir</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    async function addPost(title, desc, image) {
        if (!currentUser) { openAuthModal(); return false; }
        if (!title.trim() || !desc.trim()) return false;
        if (!window.fb || !window.fb.addPost) { toast('❌ Firebase no disponible', 'error'); return false; }

        const result = await window.fb.addPost(
            title.trim(),
            desc.trim(),
            image || '',
            currentUser.uid,
            currentUser.username
        );

        if (result.success) {
            await loadForo();
            toast('¡Publicación creada! 🚀');
            return true;
        } else {
            toast('❌ Error: ' + result.error, 'error');
            return false;
        }
    }

    window.openEditPost = async function(postId) {
        if (!window.fb || !window.fb.getPosts) { toast('❌ Firebase no disponible', 'error'); return; }

        const postsResult = await window.fb.getPosts();
        if (!postsResult.success) { toast('Error al obtener publicaciones', 'error'); return; }

        const post = postsResult.data.find(p => p.id === postId);
        if (!post || post.authorId !== currentUser?.uid) {
            toast('No tienes permiso para editar esta publicación', 'error');
            return;
        }

        $('editPostId').value = postId;
        $('editPostTitle').value = post.title;
        $('editPostDesc').value = post.desc;
        $('editPostImage').value = post.image || '';
        $('editPostOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    window.saveEditPost = async function() {
        const id = $('editPostId').value;
        const title = $('editPostTitle').value.trim();
        const desc = $('editPostDesc').value.trim();
        const image = $('editPostImage').value.trim();

        if (!title || !desc) { toast('Completa título y descripción', 'error'); return; }
        if (!window.fb || !window.fb.getPosts || !window.fb.updateDoc || !window.fb.db) {
            toast('❌ Firebase no disponible', 'error');
            return;
        }

        try {
            const postsResult = await window.fb.getPosts();
            if (!postsResult.success) { toast('Error al obtener publicaciones', 'error'); return; }

            const post = postsResult.data.find(p => p.id === id);
            if (!post || post.authorId !== currentUser?.uid) {
                toast('No tienes permiso para editar esta publicación', 'error');
                return;
            }

            const postRef = window.fb.doc(window.fb.db, 'posts', id);
            await window.fb.updateDoc(postRef, { title, desc, image });

            closeOverlay('editPostOverlay');
            await loadForo();
            toast('✅ Publicación actualizada');
        } catch (e) {
            toast('❌ Error: ' + e.message, 'error');
        }
    };

    window.deletePost = async function(postId) {
        if (!window.fb || !window.fb.deletePost) { toast('❌ Firebase no disponible', 'error'); return; }

        const postsResult = await window.fb.getPosts();
        if (!postsResult.success) { toast('Error al obtener publicaciones', 'error'); return; }

        const post = postsResult.data.find(p => p.id === postId);
        if (!post || post.authorId !== currentUser?.uid) {
            toast('No tienes permiso para eliminar esta publicación', 'error');
            return;
        }

        showDeleteConfirm({
            title: '¿Eliminar publicación?',
            subtitle: 'La publicación será eliminada permanentemente.',
            preview: post.title,
            onConfirm: async () => {
                const result = await window.fb.deletePost(postId, currentUser?.uid);
                if (result.success) {
                    await loadForo();
                    toast('✅ Publicación eliminada');
                } else {
                    toast('❌ Error: ' + result.error, 'error');
                }
            }
        });
    };

    // ============================================================
    // IMAGEN UPLOAD (foro)
    // ============================================================
    window.switchImgTab = function(tab) {
        currentImgTab = tab;
        $('tabImgUrl').classList.toggle('active', tab === 'url');
        $('tabImgFile').classList.toggle('active', tab === 'file');
        $('imgUrlSection').style.display = tab === 'url' ? 'block' : 'none';
        $('imgFileSection').style.display = tab === 'file' ? 'block' : 'none';
        if (tab === 'url') { pendingImageData = null;
            clearImagePreview(); }
    };

    window.handleImageFile = function(file) {
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) { toast('Imagen demasiado grande (máx 8MB)', 'error'); return; }
        if (!file.type.startsWith('image/')) { toast('Solo se permiten imágenes', 'error'); return; }
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let w = img.width,
                    h = img.height;
                if (w > 1920 || h > 1920) {
                    const ratio = Math.min(1920 / w, 1920 / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                pendingImageData = canvas.toDataURL('image/jpeg', 0.92);
                $('foroPreviewImg').src = pendingImageData;
                $('foroPreview').style.display = 'block';
                toast('✅ Imagen cargada');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    window.clearImagePreview = function() {
        pendingImageData = null;
        $('foroPreview').style.display = 'none';
        $('foroPreviewImg').src = '';
        const fi = $('postImageFile');
        if (fi) fi.value = '';
    };

    // ============================================================
// PRODUCTOS - VERSIÓN CORREGIDA (IMÁGENES COMPLETAS)
// ============================================================
function renderProducts() {
    const grid = $('productsGrid');
    const list = currentCat === 'all' ? PRODUCTS : PRODUCTS.filter(p => {
        if (Array.isArray(p.cat)) return p.cat.includes(currentCat);
        if (typeof p.cat === 'string') return p.cat.split(',').map(s=>s.trim()).includes(currentCat);
        return false;
    });

    const isLimited = !showAllProducts && list.length > PRODUCTS_VISIBLE_LIMIT;
    const displayList = isLimited ? list.slice(0, PRODUCTS_VISIBLE_LIMIT) : list;

    grid.innerHTML = displayList.map((p, i) => {
        const imgSrc = p.image || PRODUCT_IMAGES[p.id];
        // ✅ IMAGEN CON object-fit: contain (se ve completa)
        const imgHTML = imgSrc ?
            `<img src="${imgSrc}" class="prod-thumb" alt="${esc(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<span style=font-size:3rem;display:flex;align-items:center;justify-content:center;height:100%;background:#0a0e14;width:100%;'>${p.emoji}</span>'">` :
            `<div class="prod-thumb" style="background:#0a0e14;display:flex;align-items:center;justify-content:center;font-size:3.2rem;height:100%;width:100%;">${p.emoji}</div>`;

        const displayPrice = p.free ? 'Gratis' : convertPrice(p.price, currentCurrency);
        const displayDownloads = (p.realDownloads !== undefined) ? p.realDownloads : p.downloads;
        const displayRating = p.calculatedRating || p.rating;
        const extraDelay = i >= PRODUCTS_VISIBLE_LIMIT ? ((i - PRODUCTS_VISIBLE_LIMIT) % 6) * 0.06 : 0;

        return `<div class="prod-card rv prod-card-anim" data-id="${p.id}" onclick="openProd('${p.id}')" style="animation-delay:${extraDelay}s">
                  <div class="prod-thumb" style="background:#0a0e14;">
                    ${imgHTML}
                    <span class="prod-tag ${p.free?'free':'premium'}">${p.free?'Gratis':'Premium'}</span>
                    <span class="prod-rating"><i class="fas fa-star"></i> ${esc(displayRating)}</span>
                  </div>
                  <div class="prod-body">
                    <h3>${esc(p.name)}</h3>
                    <p>${esc(p.shortDesc)}</p>
                  </div>
                  <div class="prod-foot">
                    <span><i class="fas fa-download"></i> ${esc(displayDownloads)}</span>
                    <span class="prod-price">${esc(displayPrice)}</span>
                  </div>
                </div>`;
    }).join('');

    document.querySelectorAll('.rv').forEach(el => revObs.observe(el));
    renderProductsShowMoreButton(list.length);
}

function renderProductsShowMoreButton(totalCount) {
    const wrap = $('productsShowMoreWrap');
    if (!wrap) return;

    if (totalCount <= PRODUCTS_VISIBLE_LIMIT) {
        wrap.innerHTML = '';
        return;
    }

    wrap.innerHTML = showAllProducts
        ? `<button class="btn btn-ghost" id="toggleProductsBtn"><i class="fas fa-chevron-up"></i> Mostrar menos</button>`
        : `<button class="btn btn-solid" id="toggleProductsBtn"><i class="fas fa-chevron-down"></i> Ver todos (${totalCount - PRODUCTS_VISIBLE_LIMIT} más)</button>`;

    $('toggleProductsBtn').onclick = () => {
        showAllProducts = !showAllProducts;
        renderProducts();
        if (!showAllProducts) {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
}

    function showLoginToDownloadModal(product) {
        let overlay = document.getElementById('loginRequiredOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loginRequiredOverlay';
            overlay.className = 'overlay';
            overlay.innerHTML = `
                        <div class="modal" style="max-width:420px;text-align:center;padding:40px 32px;">
                            <button class="modal-x" onclick="document.getElementById('loginRequiredOverlay').classList.remove('open');document.body.style.overflow='';">
                                <i class="fas fa-times"></i>
                            </button>
                            <div style="font-size:3.2rem;margin-bottom:16px;">🔒</div>
                            <h3 style="font-family:var(--font-display);font-size:1.4rem;font-weight:700;margin-bottom:8px;color:var(--text);">
                                Inicia sesión para descargar
                            </h3>
                            <p style="color:var(--text-dim);font-size:.9rem;line-height:1.6;margin-bottom:8px;">
                                Para descargar <strong style="color:var(--amber);" id="loginReqProductName">${esc(product.name)}</strong> necesitas tener una cuenta activa.
                            </p>
                            <p style="color:var(--text-faint);font-size:.8rem;margin-bottom:24px;">
                                Es rápido y gratuito. ¡Únete a la comunidad de 157 Team!
                            </p>
                            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                                <button onclick="document.getElementById('loginRequiredOverlay').classList.remove('open');document.body.style.overflow='';openAuthModal();" class="btn btn-solid" style="padding:12px 28px;">
                                    <i class="fas fa-sign-in-alt"></i> Iniciar sesión
                                </button>
                                <button onclick="document.getElementById('loginRequiredOverlay').classList.remove('open');document.body.style.overflow='';document.getElementById('tabRegister').click();openAuthModal();" class="btn btn-ghost" style="padding:12px 28px;">
                                    <i class="fas fa-user-plus"></i> Crear cuenta
                                </button>
                            </div>
                        </div>
                    `;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
        }
        const nameEl = document.getElementById('loginReqProductName');
        if (nameEl) { nameEl.textContent = product.name; }
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    window.openProd = function(id) {
        currentProd = PRODUCTS.find(p => p.id === id);
        if (!currentProd) return;

        const imgSrc = currentProd.image || PRODUCT_IMAGES[id];
        const thumb = $('mThumb');
        thumb.style.background = `linear-gradient(135deg,${currentProd.color}33,${currentProd.color}0a)`;

        if (imgSrc) {
            thumb.innerHTML =
                `<img src="${imgSrc}" alt="${esc(currentProd.name)}" onerror="this.parentElement.innerHTML='<span style=font-size:3.5rem>${currentProd.emoji}</span>'" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`;
        } else {
            thumb.innerHTML = `<span style="font-size:3.8rem">${currentProd.emoji}</span>`;
        }

        $('mName').textContent = currentProd.name;
        $('mCategory').textContent = currentProd.cat === 'free' ? 'Gratis' : 'Premium';
        const displayPrice = currentProd.free ? 'Gratis' : convertPrice(currentProd.price, currentCurrency);
        $('mPrice').textContent = displayPrice;

        if (currentProd.richHTML) {
            $('mDesc').innerHTML = currentProd.richHTML;
            $('mFeats').style.display = 'none';
        } else {
            $('mDesc').textContent = currentProd.desc;
            $('mFeats').style.display = '';
            $('mFeats').innerHTML = (currentProd.feats || []).map(f =>
                `<li style="display:flex;align-items:center;gap:10px;font-size:.83rem;color:var(--text-dim);"><i class="fas fa-check-circle" style="color:var(--success);width:14px;font-size:.75rem;"></i>${esc(f)}</li>`
            ).join('');
        }

        if (currentProd.free) {
            $('mPaySection').style.display = 'none';
            $('mFreeSection').style.display = '';
            const downloadBtn = $('mDownloadBtn');
            if (currentUser) {
                downloadBtn.href = currentProd.dl;
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar Gratis';
                downloadBtn.className = 'btn btn-solid btn-block';
                downloadBtn.onclick = function() {
                    if (window.fb) {
                        if (window.fb.addActivityNotification) {
                            window.fb.addActivityNotification(currentUser.uid, currentUser.username, 'download', currentProd.name, currentProd.id);
                        }
                        if (window.fb.incrementDownloadCount) {
                            window.fb.incrementDownloadCount(currentProd.id);
                        }
                    }
                };
            } else {
                downloadBtn.href = 'javascript:void(0)';
                downloadBtn.innerHTML = '<i class="fas fa-lock"></i> Inicia sesión para descargar';
                downloadBtn.className = 'btn btn-ghost btn-block';
                downloadBtn.onclick = function(e) {
                    e.preventDefault();
                    showLoginToDownloadModal(currentProd);
                };
            }
        } else {
            $('mPaySection').style.display = '';
            $('mFreeSection').style.display = 'none';
            $('ppLink').href =
                `https://www.paypal.com/paypalme/157teamai/${currentProd.price.replace('$', '')}`;
            $('daLink').href = `https://dollarapp.net/pagar/157team`;
            $('crLink').href = `https://nowpayments.io/payment?iid=157team-${id}`;
            
            const handlePayClick = function() {
                if (currentUser && window.fb && window.fb.addActivityNotification) {
                    window.fb.addActivityNotification(currentUser.uid, currentUser.username, 'buy', currentProd.name, currentProd.id);
                }
            };
            $('ppLink').onclick = handlePayClick;
            $('daLink').onclick = handlePayClick;
            $('crLink').onclick = handlePayClick;
            $('discordPayBtn').onclick = function() { 
                handlePayClick(); 
                closeOverlay('prodOverlay'); 
                setTimeout(() => document.getElementById('discordOverlay').classList.add('open'), 150);
            };
        }

        $('prodOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';

        // Cargar reseñas
        if (typeof loadProductReviews === 'function') {
            loadProductReviews(id);
        }
    };

    window.adminLogin = async function() {
    // Paso 1: Verificar que el usuario haya iniciado sesión
    if (!currentUser) {
        toast('❌ Primero debes iniciar sesión', 'error');
        document.getElementById('adminLoginError').textContent = '❌ Inicia sesión primero.';
        document.getElementById('adminLoginError').style.display = 'block';
        return;
    }

    // Paso 2: Verificar en Firestore si el usuario es ADMIN
    try {
        if (!window.fb || !window.fb.getDoc || !window.fb.doc || !window.fb.db) {
            throw new Error('Firebase no está disponible');
        }

        // ✅ Intentar obtener el documento del usuario
        let userDoc = null;
        try {
            userDoc = await window.fb.getDoc(window.fb.doc(window.fb.db, "users", currentUser.uid));
        } catch (e) {
            console.warn('Error al obtener documento users:', e);
        }

        let isAdmin = false;
        
        // Verificar si el documento existe y tiene isAdmin: true
        if (userDoc && userDoc.exists()) {
            const userData = userDoc.data();
            isAdmin = userData.isAdmin === true || userData.admin === true;
        }
        
        // Si no existe o no es admin, verificar en la lista de correos (fallback)
        if (!isAdmin && currentUser.email) {
            const adminEmails = [
                'nexuuss7262@gmail.com',
                '157developersteam@gmail.com', 
                'admin@157team.ai',
                'syntaxerror@157team.ai'
            ];
            isAdmin = adminEmails.includes(currentUser.email);
        }

        if (isAdmin) {
            // ✅ Es admin - abrir panel
            adminAuthed = true;
            document.getElementById('adminLoginWrap').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            loadAdminData();
            toast('🔓 Panel de administración abierto');
        } else {
            // ❌ No es admin
            document.getElementById('adminLoginError').textContent = '❌ No tienes permisos de administrador.';
            document.getElementById('adminLoginError').style.display = 'block';
        }
    } catch (error) {
        console.error('Error al verificar admin:', error);
        document.getElementById('adminLoginError').textContent = '❌ Error al verificar permisos: ' + (error.message || 'desconocido');
        document.getElementById('adminLoginError').style.display = 'block';
    }
};

    async function loadAdminData() {
    if (!window.fb || !window.fb.getAllUsers) { toast('❌ Firebase no disponible', 'error'); return; }
    try {
        const usersResult = await window.fb.getAllUsers();
        const users = usersResult.success ? usersResult.data : [];
        const commentsResult = await window.fb.getComments();
        const comments = commentsResult.success ? commentsResult.data : [];
        const postsResult = await window.fb.getPosts();
        const posts = postsResult.success ? postsResult.data : [];

        document.getElementById('adminStats').innerHTML = `
                  <div class="admin-stat"><b>${comments.length}</b><span>Comentarios</span></div>
                  <div class="admin-stat"><b>${posts.length}</b><span>Publicaciones</span></div>
                  <div class="admin-stat"><b>${users.length}</b><span>Usuarios</span></div>
                `;

        // ✅ REEMPLAZA ESTA PARTE COMPLETA
        document.getElementById('adminProductsList').innerHTML = PRODUCTS.map(p => `
            <div class="admin-product-card" draggable="true" data-id="${p.id}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;cursor:grab;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-grip-vertical" style="color:var(--text-faint);"></i>
                    <span style="font-size:2rem;background:var(--bg-card);padding:10px;border-radius:10px;">${p.emoji}</span>
                    <div>
                        <div style="font-weight:700;font-size:1rem;color:var(--text);">${esc(p.name)}</div>
                        <div style="font-size:.75rem;color:var(--text-dim);margin-top:4px;">
                            <span style="background:var(--bg-panel);padding:2px 6px;border-radius:4px;border:1px solid var(--border);">${Array.isArray(p.cat) ? p.cat.join(', ') : p.cat}</span> 
                            <span style="margin-left:8px;color:${p.free ? 'var(--cyan)' : 'var(--amber)'}; font-weight:bold;">${p.price}</span>
                        </div>
                    </div>
                </div>
                <button onclick="editProductAdmin('${p.id}')" class="btn btn-outline btn-sm" style="padding:8px 16px;">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        `).join('') + `<div style="margin-top:16px;text-align:center;">
            <button id="saveProductOrderBtn" class="btn btn-solid" style="display:none;">
                <i class="fas fa-save"></i> Guardar nuevo orden
            </button>
        </div>`;

        initProductDragDrop(); // ✅ LLAMADA A LA FUNCIÓN

        renderAdminComments(comments);
        renderAdminPosts(posts);
        renderAdminUsers(users);
        await loadAdminDevRequests();
        if (window.loadAdminNexusRequests) {
            await window.loadAdminNexusRequests();
        }
    } catch (error) {
        console.error('Error al cargar datos admin:', error);
        toast('Error al cargar datos: ' + error.message, 'error');
    }
}
// ============================================================
// DRAG & DROP PARA PRODUCTOS EN ADMIN (PASO 5)
// ============================================================

function initProductDragDrop() {
    const list = document.getElementById('adminProductsList');
    if (!list) return;
    let dragEl = null;

    list.querySelectorAll('.admin-product-card').forEach(card => {
        card.addEventListener('dragstart', () => { 
            dragEl = card; 
            card.style.opacity = '0.4'; 
        });
        card.addEventListener('dragend', () => { 
            card.style.opacity = '1'; 
            dragEl = null; 
            showSaveOrderButton(); 
        });
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!dragEl) return;
            const afterEl = getDragAfterElement(list, e.clientY);
            const anchor = document.getElementById('saveProductOrderBtn')?.parentElement;
            if (afterEl == null) list.insertBefore(dragEl, anchor);
            else list.insertBefore(dragEl, afterEl);
        });
    });

    const saveBtn = document.getElementById('saveProductOrderBtn');
    if (saveBtn) saveBtn.onclick = async () => {
        const ids = [...list.querySelectorAll('.admin-product-card')].map(c => c.dataset.id);
        const result = await window.fb.saveProductOrder(ids, currentUser.uid);
        if (result.success) {
            toast('✅ Orden guardado');
            saveBtn.style.display = 'none';
            await applySavedProductOrder();
            renderProducts();
        } else {
            toast('❌ Error: ' + result.error, 'error');
        }
    };
}

function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.admin-product-card')].filter(el => el.style.opacity !== '0.4');
    return els.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
    }, { offset: -Infinity }).element;
}

function showSaveOrderButton() {
    const btn = document.getElementById('saveProductOrderBtn');
    if (btn) btn.style.display = 'inline-flex';
}

    function renderAdminComments(comments) {
        const container = document.getElementById('adminCommentsList');
        if (!comments || comments.length === 0) {
            container.innerHTML =
                '<div style="text-align:center;padding:30px;color:var(--text-dim)">No hay comentarios</div>';
            return;
        }
        container.innerHTML = `
                  <table class="adm">
                    <thead><tr><th>Autor</th><th>Comentario</th><th>Fecha</th><th>👍</th><th>Acc</th></tr></thead>
                    <tbody>
                      ${comments.map(c => `
                        <tr>
                          <td><strong>${esc(c.author)}</strong></td>
                          <td class="truncate">${esc(c.text)}</td>
                          <td style="color:var(--text-faint);font-size:.72rem">${new Date(c.date).toLocaleDateString()}</td>
                          <td style="color:var(--success)">${(c.likes || []).length}</td>
                          <td>
                            <div style="display:flex;gap:6px;">
                              <button onclick="adminDeleteComment('${c.id}')" class="btn btn-danger btn-sm" style="padding:5px 10px;font-size:.7rem;">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
    }

    function renderAdminPosts(posts) {
        const container = document.getElementById('adminPostsList');
        if (!posts || posts.length === 0) {
            container.innerHTML =
                '<div style="text-align:center;padding:30px;color:var(--text-dim)">No hay publicaciones</div>';
            return;
        }
        container.innerHTML = `
                  <table class="adm">
                    <thead><tr><th>Título</th><th>Autor</th><th>Fecha</th><th>Acc</th></tr></thead>
                    <tbody>
                      ${posts.map(p => `
                        <tr>
                          <td class="truncate">${esc(p.title)}</td>
                          <td>${esc(p.author)}</td>
                          <td style="color:var(--text-faint);font-size:.72rem">${new Date(p.date).toLocaleDateString()}</td>
                          <td>
                            <div style="display:flex;gap:6px;">
                              <button onclick="adminDeletePostAdmin('${p.id}')" class="btn btn-danger btn-sm" style="padding:5px 10px;font-size:.7rem;">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `;
    }

    function renderAdminUsers(users) {
        const container = document.getElementById('adminUsersList');
        if (!users || users.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)">No hay usuarios registrados</div>';
            return;
        }
        container.innerHTML = `
            <table class="adm">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Registrado</th>
                        <th>Rol</th>
                        <th>Nexus+</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => {
                        const isPlus = !!(u.nexusPlus || u.hasNexusPlus);
                        return `
                            <tr>
                                <td><strong>${esc(u.username)}</strong></td>
                                <td class="truncate">${esc(u.email)}</td>
                                <td style="color:var(--text-faint);font-size:.75rem">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                <td>
                                    <span style="font-size:.6rem;font-weight:700;padding:2px 8px;border-radius:5px;text-transform:uppercase;letter-spacing:.06em;background:${u.isAdmin ? 'var(--danger-dim)' : 'var(--cyan-dim)'};color:${u.isAdmin ? 'var(--danger)' : 'var(--cyan)'};border:1px solid ${u.isAdmin ? 'rgba(255,93,106,.2)' : 'rgba(79,216,255,.2)'};">
                                        ${u.isAdmin ? '👑 Admin' : '👤 User'}
                                    </span>
                                </td>
                                <td>
                                    <button onclick="adminToggleNexusPlus('${u.id}', ${isPlus})" 
                                            class="btn btn-sm" 
                                            style="background:${isPlus ? 'var(--success)' : 'var(--panel-strong)'}; color:${isPlus ? '#04121a' : 'var(--text-dim)'}; border:1px solid ${isPlus ? 'var(--success)' : 'var(--border)'}; padding:4px 12px; border-radius:20px; font-weight:600; font-size:.7rem; cursor:pointer; transition:all .2s;">
                                            ${isPlus ? '✅ Activo' : '⬜ Inactivo'}
                                        </button>
                                </td>
                                <td>
                                    <div style="display:flex;gap:6px;">
                                        <button onclick="adminDeleteUser('${u.id}')" class="btn btn-danger btn-sm" style="padding:5px 10px;font-size:.7rem;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    window.adminSaveProduct = function(id) {
        const price = document.getElementById(`ap-price-${id}`)?.value.trim();
        const dl = document.getElementById(`ap-dl-${id}`)?.value.trim();
        const prod = PRODUCTS.find(p => p.id === id);
        if (!prod) return;
        if (price) prod.price = price;
        if (dl !== undefined) prod.dl = dl;
        prod.free = (prod.price === '$0' || prod.price === '0');
        renderProducts();
        toast(`✅ ${prod.name} actualizado`);
    };

    window.adminDeleteComment = async function(commentId) {
        if (!window.fb || !window.fb.deleteComment) { toast('❌ Firebase no disponible', 'error'); return; }
        showDeleteConfirm({
            title: '¿Eliminar comentario?',
            subtitle: 'Se eliminará del sistema para todos los usuarios.',
            onConfirm: async () => {
                const result = await window.fb.deleteComment(commentId, currentUser?.uid);
                if (result.success) { await loadAdminData();
                    await loadComments();
                    toast('✅ Comentario eliminado'); } else { toast('❌ Error: ' + result.error,
                    'error'); }
            }
        });
    };

    window.adminDeleteAllComments = function() {
        showDeleteConfirm({
            title: '¿Borrar TODOS los comentarios?',
            subtitle: 'Se eliminarán todos los comentarios de todos los usuarios sin excepción.',
            onConfirm: async () => {
                if (!window.fb || !window.fb.getComments || !window.fb.deleteComment) { toast(
                        '❌ Firebase no disponible', 'error'); return; }
                const result = await window.fb.getComments();
                if (!result.success) { toast('❌ Error al obtener comentarios', 'error'); return; }
                const comments = result.data;
                let deleted = 0;
                for (const c of comments) {
                    const delResult = await window.fb.deleteComment(c.id, currentUser?.uid);
                    if (delResult.success) deleted++;
                }
                await loadAdminData();
                await loadComments();
                toast(`✅ ${deleted} comentarios eliminados`);
            }
        });
    };

    window.adminDeletePostAdmin = async function(postId) {
        if (!window.fb || !window.fb.deletePost) { toast('❌ Firebase no disponible', 'error'); return; }
        showDeleteConfirm({
            title: '¿Eliminar publicación?',
            subtitle: 'Se eliminará del foro permanentemente.',
            onConfirm: async () => {
                const result = await window.fb.deletePost(postId, currentUser?.uid);
                if (result.success) { await loadAdminData();
                    await loadForo();
                    toast('✅ Publicación eliminada'); } else { toast('❌ Error: ' + result.error,
                    'error'); }
            }
        });
    };

    window.adminDeleteAllPosts = function() {
        showDeleteConfirm({
            title: '¿Borrar TODAS las publicaciones?',
            subtitle: 'Se eliminarán todas las publicaciones del foro sin excepción.',
            onConfirm: async () => {
                if (!window.fb || !window.fb.getPosts || !window.fb.deletePost) { toast(
                        '❌ Firebase no disponible', 'error'); return; }
                const result = await window.fb.getPosts();
                if (!result.success) { toast('❌ Error al obtener publicaciones', 'error'); return; }
                const posts = result.data;
                let deleted = 0;
                for (const p of posts) {
                    const delResult = await window.fb.deletePost(p.id, currentUser?.uid);
                    if (delResult.success) deleted++;
                }
                await loadAdminData();
                await loadForo();
                toast(`✅ ${deleted} publicaciones eliminadas`);
            }
        });
    };

    window.adminDeleteUser = async function(userId) {
        if (!window.fb || !window.fb.getAllUsers) { toast('❌ Firebase no disponible', 'error'); return; }
        const usersResult = await window.fb.getAllUsers();
        const user = usersResult.success ? usersResult.data.find(u => u.id === userId) : null;
        showDeleteConfirm({
            title: '¿Eliminar usuario?',
            subtitle: 'La cuenta será eliminada permanentemente del sistema.',
            preview: user ? `${user.username} · ${user.email}` : '',
            onConfirm: async () => {
                try {
                    toast('⚠️ Esta función requiere implementación en Firestore. Contacta al desarrollador.',
                        'error');
                } catch (error) { toast('❌ Error: ' + error.message, 'error'); }
            }
        });
    };

    // ============================================================
    // PERFIL
    // ============================================================
    function getRankDisplay(rank) {
        const map = {
            admin: { label: 'Admin', class: 'badge-admin', color: 'var(--danger)' },
            collaborator: { label: 'Colaborador', class: 'badge-collab', color: 'var(--cyan)' },
            moderator: { label: 'Moderador', class: 'badge-mod', color: 'var(--amber)' },
            member: { label: 'Member', class: '', color: 'var(--text-dim)' }
        };
        return map[rank] || map.member;
    }

    // ============================================================
    // ADMIN: GESTIONAR SOLICITUDES
    // ============================================================
    async function loadAdminDevRequests() {
        const container = document.getElementById('adminDevRequestsList');
        if (!container || !window.fb || !window.fb.getDeveloperRequests) {
            if (container) container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)">❌ Firebase no disponible</div>';
            return;
        }

        container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

        try {
            const result = await window.fb.getDeveloperRequests();
            if (!result.success) {
                container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-dim)">❌ Error al cargar solicitudes: ${result.error || ''}</div>`;
                return;
            }
            renderAdminDevRequests(result.data);
        } catch (error) {
            console.error('Error en loadAdminDevRequests:', error);
            container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-dim)">❌ Error inesperado: ${error.message}</div>`;
        }
    }

    function renderAdminDevRequests(requests) {
        const container = document.getElementById('adminDevRequestsList');
        if (!container) return;

        if (!requests || requests.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)">No hay solicitudes</div>';
            return;
        }

        const statusBadge = (status) => {
            if (status === 'pending') return '<span style="background:var(--amber-dim);color:var(--amber);font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:6px;text-transform:uppercase;">⏳ Pendiente</span>';
            if (status === 'approved') return '<span style="background:rgba(61,220,151,.12);color:var(--success);font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:6px;text-transform:uppercase;">✅ Aprobada</span>';
            return '<span style="background:var(--danger-dim);color:var(--danger);font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:6px;text-transform:uppercase;">❌ Rechazada</span>';
        };

        container.innerHTML = requests.map(r => `
            <div style="background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;">
                    <div>
                        <div style="font-weight:700;font-size:.92rem;">${esc(r.username)}</div>
                        <div style="font-size:.72rem;color:var(--text-faint);">${esc(r.email)} · ${new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    ${statusBadge(r.status)}
                </div>
                <p style="font-size:.85rem;color:var(--text-dim);line-height:1.6;margin-bottom:8px;">${esc(r.reason)}</p>
                ${r.portfolioLink ? `<a href="${esc(r.portfolioLink)}" target="_blank" style="font-size:.78rem;color:var(--cyan);display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;"><i class="fas fa-link"></i> ${esc(r.portfolioLink)}</a>` : ''}
                ${r.status === 'pending' ? `
                    <div style="display:flex;gap:8px;margin-top:10px;">
                        <button onclick="approveDevRequestUi('${r.id}')" class="btn btn-solid btn-sm" style="background:var(--success);border-color:var(--success);flex:1;justify-content:center;">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button onclick="rejectDevRequestUi('${r.id}')" class="btn btn-danger btn-sm" style="flex:1;justify-content:center;">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    window.approveDevRequestUi = async function(requestId) {
        if (!currentUser || !currentUser.isAdmin) return;
        if (!window.fb || !window.fb.reviewDeveloperRequest) return;
        const result = await window.fb.reviewDeveloperRequest(requestId, true, currentUser.uid);
        if (result.success) {
            toast('✅ Desarrollador aprobado');
            loadAdminDevRequests();
        } else {
            toast('❌ Error: ' + result.error, 'error');
        }
    };

    window.rejectDevRequestUi = async function(requestId) {
        if (!currentUser || !currentUser.isAdmin) return;
        if (!window.fb || !window.fb.reviewDeveloperRequest) return;
        showDeleteConfirm({
            title: '¿Rechazar solicitud?',
            subtitle: 'El usuario podrá volver a solicitarlo más adelante.',
            onConfirm: async () => {
                const result = await window.fb.reviewDeveloperRequest(requestId, false, currentUser.uid);
                if (result.success) {
                    toast('Solicitud rechazada');
                    loadAdminDevRequests();
                } else {
                    toast('❌ Error: ' + result.error, 'error');
                }
            }
        });
    };

    let devRequestsBadgeUnsub = null;
    function initDevRequestsBadge() {
        if (!window.fb || !window.fb.listenDeveloperRequests) return;
        if (devRequestsBadgeUnsub) return; // ya está escuchando
        devRequestsBadgeUnsub = window.fb.listenDeveloperRequests((requests) => {
            const pendingCount = requests.filter(r => r.status === 'pending').length;
            const badge = document.getElementById('devReqBadge');
            if (!badge) return;
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
            // Si el panel admin está abierto en esa pestaña, refresca la lista también
            const activeTab = document.querySelector('.admin-section#atab-devrequests.active');
            if (activeTab) renderAdminDevRequests(requests);
        });
    }

    async function openProfile(userId) {
        if (!userId) { toast('ID de usuario inválido', 'error'); return; }
        profileViewingUser = userId;
        if (!window.fb || !window.fb.getUserProfile) { toast('Firebase no disponible', 'error'); return; }
        const result = await window.fb.getUserProfile(userId);
        if (!result.success) { toast('Usuario no encontrado en Firebase', 'error'); return; }
        const user = result.data;

        const ac = document.getElementById('profileAvatarContent');
        if (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image'))) {
            ac.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        } else {
            ac.textContent = user.username[0].toUpperCase();
            ac.style.display = 'flex';
            ac.style.alignItems = 'center';
            ac.style.justifyContent = 'center';
            ac.style.fontSize = '2.8rem';
        }

        document.getElementById('profileDisplayName').textContent = user.username;

        const rank = user.rank || 'member';
        const rankInfo = getRankDisplay(rank);
        const roleBadge = document.getElementById('profileRoleBadge');
        roleBadge.textContent = rankInfo.label;
        roleBadge.style.background = `${rankInfo.color}22`;
        roleBadge.style.color = rankInfo.color;

        document.getElementById('profileBio').textContent = user.bio || 'Sin descripción aún';

        const bc = document.getElementById('profileBadges');
        bc.innerHTML = '';
        if (rank === 'admin') {
            bc.innerHTML += `<span class="badge-chip"><i class="fas fa-shield-halved"></i> Admin</span>`;
        } else if (rank === 'collaborator') {
            bc.innerHTML += `<span class="badge-chip"><i class="fas fa-handshake"></i> Colaborador</span>`;
        } else if (rank === 'moderator') {
            bc.innerHTML += `<span class="badge-chip"><i class="fas fa-gavel"></i> Moderador</span>`;
        }
        if (user.badges && user.badges.length) {
            user.badges.forEach(b => { bc.innerHTML += `<span class="badge-chip">${esc(b)}</span>`; });
        }

        const isOwnProfile = currentUser && currentUser.uid === userId;
        const editSection = document.getElementById('profileEditSection');
        if (isOwnProfile) {
            editSection.style.display = 'block';
            document.getElementById('profileBioInput').value = user.bio && user.bio !== 'Sin descripción aún' ? user.bio : '';
            if (document.getElementById('profileDiscord')) document.getElementById('profileDiscord').value = user.discord || '';
            if (document.getElementById('profileTwitter')) document.getElementById('profileTwitter').value = user.twitter || '';
            if (document.getElementById('profileInstagram')) document.getElementById('profileInstagram').value = user.instagram || '';
            if (document.getElementById('profileAccentColor')) document.getElementById('profileAccentColor').value = user.accentColor || '#F2B544';
            
            const profileBannerPreview = document.getElementById('profileBannerPreview');
            if (user.banner) {
                profileBannerPreview.innerHTML = `<img src="${user.banner}" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                profileBannerPreview.innerHTML = `<i class="fas fa-image" style="margin-right:6px;"></i> Subir portada`;
            }
        } else {
            editSection.style.display = 'none';
        }
        // Mostrar/ocultar sección de solicitud developer
       if (isOwnProfile) {
           checkDevStatus(userId);
        } else {
            document.getElementById('devStatusSection').style.display = 'none';
        }

        // Cargar diseño público (banner y color)
        const bannerDisplay = document.getElementById('profileBannerDisplay');
        if (bannerDisplay) {
            if (user.banner) {
                bannerDisplay.style.background = `url(${user.banner}) center/cover no-repeat`;
            } else {
                bannerDisplay.style.background = `linear-gradient(135deg, var(--bg-2), ${user.accentColor || 'var(--panel-strong)'})`;
            }
        }
        
        // Cargar redes sociales en vista pública
        const socialsDiv = document.getElementById('profileSocials');
        if (socialsDiv) {
            socialsDiv.innerHTML = '';
            if (user.discord) {
                socialsDiv.innerHTML += `<a href="javascript:void(0)" onclick="const discordText = '${user.discord}'; navigator.clipboard.writeText(discordText).then(() => toast('Usuario de Discord copiado: ' + discordText));" class="icon-btn" style="color:#5865F2;" title="Copiar Discord: ${user.discord}"><i class="fab fa-discord"></i></a>`;
            }
            if (user.twitter) {
                let twLink = user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter.replace('@','')}`;
                socialsDiv.innerHTML += `<a href="${twLink}" target="_blank" class="icon-btn" style="color:#1DA1F2;" title="Twitter: ${user.twitter}"><i class="fab fa-twitter"></i></a>`;
            }
            if (user.instagram) {
                let igLink = user.instagram.startsWith('http') ? user.instagram : `https://instagram.com/${user.instagram.replace('@','')}`;
                socialsDiv.innerHTML += `<a href="${igLink}" target="_blank" class="icon-btn" style="color:#E1306C;" title="Instagram: ${user.instagram}"><i class="fab fa-instagram"></i></a>`;
            }
        }

        const isAdmin = currentUser && currentUser.isAdmin === true;
        const adminRankSection = document.getElementById('adminRankSection');
        if (adminRankSection) {
            if (isAdmin && !isOwnProfile) {
                adminRankSection.style.display = 'block';
                adminRankSection.querySelectorAll('.rank-btn').forEach(btn => {
                    const btnRank = btn.getAttribute('data-rank');
                    btn.classList.toggle('active', btnRank === rank);
                });
            } else {
                adminRankSection.style.display = 'none';
            }
        }

        document.getElementById('profileOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    async function saveProfile() {
        if (!currentUser) return;
        const bio = $('profileBioInput').value.trim();
        const discord = $('profileDiscord') ? $('profileDiscord').value.trim() : '';
        const twitter = $('profileTwitter') ? $('profileTwitter').value.trim() : '';
        const instagram = $('profileInstagram') ? $('profileInstagram').value.trim() : '';
        const accentColor = $('profileAccentColor') ? $('profileAccentColor').value : '#F2B544';
        
        const badgeItems = $('profileBadges').querySelectorAll('.badge-chip');
        const badges = [];
        badgeItems.forEach(el => {
            const text = el.textContent.trim();
            const isDefault = ['Admin', 'Colaborador', 'Moderador'].some(d => text.includes(d));
            if (!isDefault) badges.push(text);
        });
        
        const data = { 
            bio: bio || 'Sin descripción aún', 
            badges: badges,
            discord: discord,
            twitter: twitter,
            accentColor: accentColor
        };
        
        if (window._tempBanner) {
            data.banner = window._tempBanner;
            delete window._tempBanner;
        }

        if (window._tempAvatar) { data.avatar = window._tempAvatar;
            delete window._tempAvatar; }
        if (window.fb && window.fb.saveUserProfile) {
            const result = await window.fb.saveUserProfile(currentUser.uid, data);
            if (result.success) { toast('Perfil guardado en Firebase ✨'); } else { toast(
                    'Error al guardar perfil: ' + result.error, 'error'); return; }
        }
        const pna = $('profileNavAvatar');
        if (data.avatar && data.avatar.startsWith('data:image')) {
            pna.innerHTML = `<img src="${data.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        } else {
            pna.textContent = currentUser.username[0].toUpperCase();
            pna.style.background = 'var(--cyan-dim)';
            pna.style.color = 'var(--cyan)';
        }
        closeOverlay('profileOverlay');
    }

    function addCustomBadge() {
        const inp = $('profileBadgeInput'),
            text = inp.value.trim();
        if (!text) { toast('Escribe una insignia', 'error'); return; }
        if (text.length > 50) { toast('Máx 50 caracteres', 'error'); return; }
        const bc = $('profileBadges');
        const b = document.createElement('span');
        b.className = 'badge-chip';
        b.textContent = text;
        bc.appendChild(b);
        inp.value = '';
        toast('Insignia agregada (guarda el perfil para guardarla)');
    }

    async function setUserRank(rank) {
        if (!profileViewingUser) { toast('❌ No hay usuario seleccionado', 'error'); return; }
        const isAdmin = currentUser && currentUser.isAdmin === true;
        if (!isAdmin) { toast('❌ Sin permisos. Solo admins pueden asignar rangos.', 'error'); return; }
        if (!window.fb || !window.fb.saveUserProfile) { toast('❌ Firebase no disponible', 'error'); return; }
        try {
            const result = await window.fb.getUserProfile(profileViewingUser);
            if (!result.success) { toast('❌ Error al obtener perfil del usuario', 'error'); return; }
            const updateResult = await window.fb.saveUserProfile(profileViewingUser, { rank });
            if (updateResult.success) {
                toast(`✅ Rango actualizado a: ${rank}`);
                await openProfile(profileViewingUser);
                await loadComments();
                await loadForo();
            } else { toast('❌ Error al actualizar rango: ' + updateResult.error, 'error'); }
        } catch (error) { toast('❌ Error: ' + error.message, 'error'); }
    }

    // ============================================================
    // AUTH UI
    // ============================================================
    function updateAuthUI() {
    const authBtn = $('authBtn'),
        authText = $('authText'),
        adminBtn = $('adminBtn');
    const chatFab = $('chatFab');
    const pnb = $('profileNavBtn'),
        pna = $('profileNavAvatar');
    const cf = $('commentForm'),
        ltc = $('loginToComment');
    const ff = $('foroFormWrap'),
        ltp = $('loginToPost');
    const av = $('userAvatar');

    if (currentUser) {
        pnb.style.display = 'flex';
        (async () => {
            try {
                const res = await window.fb.getUserProfile(currentUser.uid);
                if (res && res.success && res.data) {
                    const prof = res.data;

                    // FIX: sincroniza isDeveloper desde Firestore (nunca se copiaba
                    // desde ningún login), y refresca el botón del panel developer

                    currentUser.isDeveloper = !!prof.isDeveloper;
                    currentUser.hasNexusPlus = !!prof.nexusPlus || !!prof.hasNexusPlus;
                    const devBtn = document.getElementById('devPanelBtn');
                    if (devBtn) {
                        devBtn.style.display = (currentUser.isDeveloper && !currentUser.isAdmin) ? 'flex' : 'none';
                    }

                    if (prof.avatar) {
                        pna.innerHTML = `<img src="${prof.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                        pna.style.background = 'transparent';
                        if (av) {
                            av.innerHTML = `<img src="${prof.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                            av.style.background = 'transparent';
                        }
                        return;
                    }
                }
            } catch (e) { console.error('Error fetching avatar:', e); }
            pna.textContent = currentUser.username[0].toUpperCase();
            pna.style.background = 'var(--cyan-dim)';
            pna.style.color = 'var(--cyan)';
            if (av) {
                av.textContent = currentUser.username[0].toUpperCase();
                av.style.background = 'var(--cyan-dim)';
                av.style.color = 'var(--cyan)';

            }

        })();


        pnb.onclick = () => { location.href = 'perfil.html'; };
        authText.textContent = currentUser.username;
        authBtn.title = 'Cerrar sesión';
        authBtn.className = 'btn btn-ghost btn-sm';
        authBtn.onclick = openLogoutModal;
        if (cf) cf.style.display = 'block';
        if (ltc) ltc.style.display = 'none';
        if (ff) ff.style.display = 'none';
        if (ltp) ltp.style.display = 'none';
        if (adminBtn) adminBtn.style.display = currentUser.isAdmin ? 'flex' : 'none';
        const devPanelBtn = $('devPanelBtn');
        if (devPanelBtn) devPanelBtn.style.display =
            (currentUser.isDeveloper && !currentUser.isAdmin) ? 'flex' : 'none';
        // Si es admin, iniciar el badge de solicitudes
        if (currentUser.isAdmin) {
            initDevRequestsBadge();
        } else if (devRequestsBadgeUnsub) {
             // Si no es admin y había suscripción, limpiarla
            devRequestsBadgeUnsub();
            devRequestsBadgeUnsub = null;
        }
        if (chatFab) chatFab.style.display = 'flex';
        renderProducts();
    } else {
        pnb.style.display = 'none';
        pna.textContent = '?';
        pna.style.background = 'var(--cyan-dim)';
        pna.style.color = 'var(--cyan)';
        authText.textContent = 'Login';
        authBtn.title = 'Iniciar sesión';
        authBtn.className = 'btn btn-solid btn-sm';
        authBtn.onclick = openAuthModal;
        if (av) av.textContent = '?';
        if (cf) cf.style.display = 'none';
        if (ltc) ltc.style.display = 'block';
        if (ff) ff.style.display = 'none';
        if (ltp) ltp.style.display = 'block';
        if (adminBtn) adminBtn.style.display = 'none';
        if (chatFab) chatFab.style.display = 'none';
        const devPanelBtn2 = $('devPanelBtn');
        if (devPanelBtn2) devPanelBtn2.style.display = 'none';
    }
}

    function openAuthModal() { $('authModal').classList.add('open');
        document.body.style.overflow = 'hidden'; }

    function closeAuthModal() { $('authModal').classList.remove('open');
        document.body.style.overflow = ''; }

    function setAuthStatus(id, msg, type) { const el = $(id);
        el.textContent = msg;
        el.className = `status-msg ${type}`; }

    function openLogoutModal() {
        if (!currentUser) return;
        $('logoutUsername').textContent = currentUser.username;
        closeOverlay('profileOverlay');
        setTimeout(() => { $('logoutModal').classList.add('open');
            document.body.style.overflow = 'hidden'; }, 150);
    }

    function toast(msg, type = 'success') {
        const t = document.createElement('div');
        t.className = `toast ${type === 'error' ? 'err' : 'ok'}`;
        t.innerHTML =
            `<i class="fas fa-${type === 'error' ? 'circle-exclamation' : 'circle-check'}"></i> ${esc(msg)}`;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0';
            t.style.transform = 'translateX(40px)';
            t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 350); }, 3000);
    }

    function showDeleteConfirm({ title, subtitle, preview, onConfirm }) {
        document.getElementById('deleteConfirmTitle').textContent = title || '¿Eliminar?';
        document.getElementById('deleteConfirmSubtitle').textContent = subtitle || 'Esta acción no se puede deshacer.';
        const prev = document.getElementById('deleteConfirmPreview');
        if (preview) {
            prev.textContent = '"' + preview.substring(0, 100) + (preview.length > 100 ? '...' : '') + '"';
            prev.style.display = 'block';
        } else { prev.style.display = 'none'; }
        const btn = document.getElementById('deleteConfirmBtn');
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.onclick = () => { closeOverlay('deleteConfirmOverlay');
            onConfirm(); };
        document.getElementById('deleteConfirmOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay(id) { $(id).classList.remove('open');
        document.body.style.overflow = ''; }

    // ============================================================
// CAROUSEL - VERSIÓN CORREGIDA CON <img>
// ============================================================
const SLIDE_IMAGES = [
    { type: 'video', src: 'assets/NEXUSEXPLAIN.mp4', title: 'TRAILER N.E.X.U.S', desc: 'Control total por voz, Spotify, automatización y más.' },
    { type: 'image', src: 'assets/Bts/gif-pr0.gif', title: 'Bot Bloody Chaos', desc: 'Bot avanzado gratis de raid.' },
    { type: 'image', src: 'assets/a.png', title: 'Nexus — Motor Neural Pro', desc: 'Red neuronal multimodal con análisis predictivo.' },
    { type: 'image', src: 'assets/2.jpg', title: 'Jarvis — Asistente Inteligente', desc: 'Control total por voz, Spotify y más.' },

];

let slideCur = 0,
    slideTimer;

window.toggleMute = function(vidId, btn) {
    const vid = document.getElementById(vidId);
    if (!vid) return;
    vid.muted = !vid.muted;
    btn.innerHTML = vid.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
};

function buildCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.getElementById('carouselDots');
    track.innerHTML = '';
    dots.innerHTML = '';
    
    SLIDE_IMAGES.forEach((s, i) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
        const badge =
            `<span class="carousel-badge ${s.type === 'video' ? 'vid' : 'img'}"><i class="fas fa-${s.type === 'video' ? 'play-circle' : 'image'}"></i> ${s.type === 'video' ? 'Video' : 'Foto'}</span>`;
        
        if (s.type === 'video') {
            slide.innerHTML =
                `${badge}<video id="vid-${i}" class="carousel-media" autoplay muted loop playsinline poster="${s.poster||''}"><source src="${s.src}" type="video/mp4"></video><button class="mute-btn" onclick="toggleMute('vid-${i}', this)" aria-label="Toggle Sound"><i class="fas fa-volume-mute"></i></button><div class="carousel-info"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`;
        } else {
            // ✅ CAMBIO IMPORTANTE: Usamos <img> en lugar de <div> con background-image
            slide.innerHTML =
                `${badge}<img class="carousel-media" src="${s.src}" alt="${esc(s.title)}" loading="lazy"><div class="carousel-info"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`;
        }
        track.appendChild(slide);
        
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => { clearInterval(slideTimer);
            goToSlide(i);
            startSlideTimer(); };
        dots.appendChild(dot);
    });
}

function goToSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const cv = slides[slideCur]?.querySelector('video');
    if (cv) cv.pause();
    slides[slideCur]?.classList.remove('active');
    dots[slideCur]?.classList.remove('active');
    slideCur = (n + SLIDE_IMAGES.length) % SLIDE_IMAGES.length;
    slides[slideCur]?.classList.add('active');
    dots[slideCur]?.classList.add('active');
    const nv = slides[slideCur]?.querySelector('video');
    if (nv) nv.play().catch(() => {});
}

function startSlideTimer() { 
    slideTimer = setInterval(() => goToSlide(slideCur + 1), 6000); 
}

document.getElementById('nextSlide').onclick = () => { 
    clearInterval(slideTimer);
    goToSlide(slideCur + 1);
    startSlideTimer(); 
};

document.getElementById('prevSlide').onclick = () => { 
    clearInterval(slideTimer);
    goToSlide(slideCur - 1);
    startSlideTimer(); 
};

buildCarousel();
startSlideTimer();

    // ============================================================
    // CARRITO
    // ============================================================
    const EXCHANGE_RATES = { USD: 1, COP: 3800, EUR: 0.92, BRL: 5.20, MXN: 17.5, ARS: 900, VES: 36 };
    let currentCurrency = 'USD';
    let cart = [];

    function convertPrice(priceStr, currency) {
        if (!priceStr) return priceStr;
        const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
        if (isNaN(num) || num === 0) return priceStr;
        const converted = num * EXCHANGE_RATES[currency];
        const symbols = { USD: '$', COP: 'COP$', EUR: '€', BRL: 'R$', MXN: 'MXN$', ARS: 'ARS$', VES: 'Bs' };
        const decimals = (currency === 'COP' || currency === 'ARS') ? 0 : 2;
        return `${symbols[currency]||'$'} ${converted.toFixed(decimals)}`;
    }

    document.getElementById('currencySelector')?.addEventListener('change', function() {
        currentCurrency = this.value;
        updateAllPrices();
        toast(`Moneda cambiada a ${currentCurrency}`);
    });

    function updateAllPrices() { renderProducts();
        renderCart(); }

    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) { existing.quantity++; } else { cart.push({ ...product, quantity: 1 }); }
        updateCartUI();
        toast(`${product.emoji} ${product.name} añadido al carrito`);
    }

    function removeFromCart(productId) {
        const existing = cart.find(item => item.id === productId);
        if (!existing) return;
        if (existing.quantity > 1) { existing.quantity--; } else { cart = cart.filter(item => item.id !== productId); }
        updateCartUI();
        renderCart();
    }

    function removeAllFromCart(productId) { cart = cart.filter(item => item.id !== productId);
        updateCartUI();
        renderCart(); }

    function getCartTotal() { return cart.reduce((sum, item) => { const num = parseFloat(item.price.replace(/[^0-9.]/g,
            '')); return sum + (isNaN(num) ? 0 : num * item.quantity); }, 0); }

    function renderCart() {
        const body = document.getElementById('cartBody');
        const footer = document.getElementById('cartFooter');
        const empty = body.querySelector('.cart-empty');
        if (cart.length === 0) {
            body.innerHTML = `
                        <div style="text-align:center;padding:50px 0;color:var(--text-dim);">
                            <i class="fas fa-bag-shopping" style="font-size:2.4rem;margin-bottom:14px;display:block;color:var(--text-faint);"></i>
                            <p>Tu carrito está vacío</p>
                            <button class="btn btn-ghost btn-sm" onclick="closeCart()" style="margin-top:12px;">Seguir comprando</button>
                        </div>
                    `;
            footer.style.display = 'none';
            return;
        }
        body.innerHTML = cart.map((item) => `
                      <div class="cart-item">
                        <div class="cart-item-emoji">${item.emoji}</div>
                        <div style="flex:1;">
                          <div style="font-weight:600;font-size:.9rem;">${item.name}</div>
                          <div class="mono" style="color:var(--cyan);font-size:.82rem;">${convertPrice(item.price, currentCurrency)}</div>
                          <div class="qty-row">
                            <button onclick="removeFromCart('${item.id}')"><i class="fas fa-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button onclick="addToCart('${item.id}')"><i class="fas fa-plus"></i></button>
                          </div>
                        </div>
                        <button class="icon-btn" onclick="removeAllFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
                      </div>
                    `).join('');
        const total = getCartTotal();
        document.getElementById('cartTotal').textContent = convertPrice(`$${total.toFixed(2)}`, currentCurrency);
        footer.style.display = 'block';
    }

    function updateCartUI() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const el = document.getElementById('cartCount');
        if (el) { el.textContent = count;
            el.style.opacity = count > 0 ? '1' : '0'; }
    }

    function openCart() { document.getElementById('cartOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
        renderCart(); }

    function closeCart() { document.getElementById('cartOverlay').classList.remove('open');
        document.body.style.overflow = ''; }

    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('cartOverlay')?.addEventListener('click', function(e) { if (e.target === this) closeCart(); });
    document.getElementById('checkoutBtn')?.addEventListener('click', function() {
        if (cart.length === 0) { toast('El carrito está vacío', 'error'); return; }
        document.getElementById('checkoutOverlay').classList.add('open');
        setTimeout(closeCart, 100);
    });

    // ============================================================
    // TEMA
    // ============================================================
    function applyTheme() {
        document.body.classList.toggle('light', !dark);
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
        const particles = document.querySelectorAll('.particle');
        const color = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
        particles.forEach(p => p.style.background = color);
        const banner = document.querySelector('.alert-banner');
        if (banner) {
            banner.style.background = dark ? 'rgba(5,7,12,.92)' : 'rgba(240,244,255,.92)';
            banner.style.borderBottomColor = dark ? 'var(--border)' : 'rgba(10,15,30,.08)';
        }
    }

    document.getElementById('themeBtn').onclick = () => {
        dark = !dark;
        localStorage.setItem('jv_dark', dark);
        applyTheme();
        initParticles();
        injectProductAnimStyles();
    };

    // ============================================================
    // PARTICLES
    // ============================================================
    function initParticles() {
        const cont = document.getElementById('particles');
        if (!cont) return;
        cont.innerHTML = '';
        const starColors = ['#ffffff', '#00ffe5', '#ffc107', '#ff5d6a'];
        for (let i = 0; i < 150; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 2 + 1; // Small dots
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 10;
            const dur = Math.random() * 3 + 2;
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            
            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                top: ${top}%;
                background: ${color};
                box-shadow: 0 0 ${size * 3}px ${color};
                animation: starTwinkle ${dur}s infinite ${delay}s;
                position: absolute;
                border-radius: 50%;
                opacity: 0;
            `;
            cont.appendChild(p);
        }
    }

    // ============================================================
    // REVEAL ON SCROLL
    // ============================================================
    const revObs = new IntersectionObserver(entries => { entries.forEach(x => { if (x.isIntersecting) x.target.classList
                .add('vis'); }); }, { threshold: .1 });
    document.querySelectorAll('.rv').forEach(el => revObs.observe(el));

    // ============================================================
    // EVENTOS
    // ============================================================
    document.getElementById('authModalClose').onclick = closeAuthModal;
    document.getElementById('authModal').onclick = e => { if (e.target === document.getElementById('authModal'))
            closeAuthModal(); };

    document.getElementById('tabLogin').onclick = () => {
        document.getElementById('tabLogin').classList.add('active');
        document.getElementById('tabRegister').classList.remove('active');
        document.getElementById('loginPane').style.display = '';
        document.getElementById('registerPane').style.display = 'none';
        document.getElementById('authModalTitle').textContent = 'Bienvenido de nuevo';
        document.getElementById('authModalSub').textContent = 'Accede a tu cuenta de 157 Team';
    };
    document.getElementById('tabRegister').onclick = () => {
        document.getElementById('tabRegister').classList.add('active');
        document.getElementById('tabLogin').classList.remove('active');
        document.getElementById('loginPane').style.display = 'none';
        document.getElementById('registerPane').style.display = '';
        document.getElementById('authModalTitle').textContent = 'Crear cuenta';
        document.getElementById('authModalSub').textContent = 'Regístrate en 157 Team';
    };

    document.getElementById('switchToRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('tabRegister').click();
    });
    document.getElementById('switchToLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('tabLogin').click();
    });

    document.getElementById('forgotPassword')?.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        if (!email) { setAuthStatus('loginStatus', 'Ingresa tu correo para restablecer contraseña',
                'error'); return; }
        if (window.fb && window.fb.resetPassword) {
            window.fb.resetPassword(email).then(result => {
                if (result.success) { setAuthStatus('loginStatus',
                        '📧 Revisa tu correo para restablecer la contraseña',
                        'success'); } else { setAuthStatus('loginStatus', result.error ||
                        'Error al enviar el correo', 'error'); }
            });
        } else { setAuthStatus('loginStatus', 'Función de restablecimiento no disponible', 'error'); }
    });

    document.getElementById('doLoginBtn').onclick = handleLoginFirebase;
    document.getElementById('doRegisterBtn').onclick = handleRegisterFirebase;
    document.getElementById('loginEmail').onkeydown = document.getElementById('loginPassword').onkeydown = e => {
        if (e.key === 'Enter') handleLoginFirebase();
    };
    document.getElementById('regName').onkeydown = document.getElementById('regEmail').onkeydown = document
        .getElementById('regPassword').onkeydown = e => { if (e.key === 'Enter') handleRegisterFirebase(); };

    document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleLogin);
    document.getElementById('githubLoginBtn')?.addEventListener('click', handleGithubLogin);

    document.getElementById('submitCommentBtn').onclick = async () => {
        const inp = document.getElementById('commentInput'),
            text = inp.value.trim();
        if (!text) return;
        const btn = document.getElementById('submitCommentBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        await addComment(text);
        inp.value = '';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar';
    };


    document.getElementById('logoutModal').onclick = e => { if (e.target === document.getElementById('logoutModal'))
            closeOverlay('logoutModal'); };
    document.getElementById('confirmLogoutBtn').onclick = () => { closeOverlay('logoutModal');
        setTimeout(handleLogout, 200); };
    document.getElementById('prodModalClose').onclick = () => closeOverlay('prodOverlay');
    document.getElementById('prodOverlay').onclick = e => { if (e.target === document.getElementById('prodOverlay'))
            closeOverlay('prodOverlay'); };
    document.getElementById('discordModalClose').onclick = () => closeOverlay('discordOverlay');
    document.getElementById('discordOverlay').onclick = e => { if (e.target === document.getElementById(
                'discordOverlay')) closeOverlay('discordOverlay'); };
    document.getElementById('discordPayBtn').onclick = () => { closeOverlay('prodOverlay');
        setTimeout(() => document.getElementById('discordOverlay').classList.add('open'), 150); };
    document.getElementById('editPostOverlay').onclick = e => { if (e.target === document.getElementById(
                'editPostOverlay')) closeOverlay('editPostOverlay'); };
    document.getElementById('adminOverlay').onclick = e => { if (e.target === document.getElementById(
                'adminOverlay')) closeOverlay('adminOverlay'); };
    document.getElementById('devPanelOverlay').onclick = e => {
    if (e.target === document.getElementById('devPanelOverlay'))
        closeOverlay('devPanelOverlay');
    };
    document.getElementById('donateOverlay').onclick = e => { if (e.target === document.getElementById(
                'donateOverlay')) closeOverlay('donateOverlay'); };
    document.getElementById('profileOverlay').onclick = e => { if (e.target === document.getElementById('profileOverlay')) closeOverlay('profileOverlay'); };
    document.getElementById('postCreateOverlay').onclick = e => { if (e.target === document.getElementById('postCreateOverlay')) closeOverlay('postCreateOverlay'); };
    document.getElementById('postDetailOverlay').onclick = e => { if (e.target === document.getElementById('postDetailOverlay')) closeOverlay('postDetailOverlay'); };
    document.getElementById('adminPassword').onkeydown = e => { if (e.key === 'Enter') window.adminLogin(); };
    document.getElementById('hamburger').onclick = () => document.getElementById('mobileNav').classList.toggle(
        'open');

    document.getElementById('adminBtn').onclick = () => {
        document.getElementById('adminOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    document.getElementById('devPanelBtn').onclick = () => {
        document.getElementById('devPanelOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
        loadMyDevProducts(); 
    };



    document.querySelectorAll('.cat-tab').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        showAllProducts = false;
        renderProducts();
    });

    document.querySelectorAll('[data-atab]').forEach(btn => btn.onclick = () => {
        document.querySelectorAll('[data-atab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`atab-${btn.dataset.atab}`).classList.add('active');
    });

    // ============================================================
    // COOKIES
    // ============================================================
    function initCookies() {
        const banner = document.getElementById('cookieBanner');
        if (localStorage.getItem('cookies_accepted') === 'true') { banner.style.display = 'none'; return; }
        banner.style.display = 'flex';
        document.getElementById('cookieAccept').onclick = () => { localStorage.setItem('cookies_accepted', 'true');
            banner.style.display = 'none';
            toast('Cookies aceptadas'); };
        document.getElementById('cookieReject').onclick = () => { localStorage.setItem('cookies_accepted', 'false');
            banner.style.display = 'none'; };
    }

    // ============================================================
// GOOGLE TRANSLATE
// ============================================================
const NEXUS_LANGUAGES = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: NEXUS_LANGUAGES.map(l => l.code).join(','),
        autoDisplay: false
    }, 'google_translate_element');

    const saved = localStorage.getItem('nexus_lang');
    if (saved && saved !== 'es') {
        setTimeout(() => applyGoogleTranslate(saved, false), 900);
    }
};

function loadGoogleTranslateScript() {
    if (document.getElementById('google-translate-script')) return;
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
}

function applyGoogleTranslate(langCode, showToast = true) {
    let tries = 0;
    const interval = setInterval(() => {
        const combo = document.querySelector('.goog-te-combo');
        tries++;
        if (combo) {
            clearInterval(interval);
            combo.value = langCode;
            combo.dispatchEvent(new Event('change'));
            localStorage.setItem('nexus_lang', langCode);
            updateLangLabel(langCode);
            if (showToast) toast('🌐 Traduciendo página...');
        } else if (tries > 40) {
            clearInterval(interval);
            if (showToast) toast('❌ El traductor no cargó, intenta de nuevo', 'error');
        }
    }, 250);
}

function updateLangLabel(langCode) {
    const lbl = document.getElementById('langLabel');
    if (lbl) lbl.textContent = langCode.split('-')[0].toUpperCase();
}

function resetTranslation() {
    localStorage.removeItem('nexus_lang');
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    location.reload();
}

function buildLangDropdown() {
    const dd = document.getElementById('langDropdown');
    if (!dd) return;
    dd.innerHTML = NEXUS_LANGUAGES.map(l =>
        `<div class="lang-option" data-code="${l.code}"><span>${l.flag}</span><span>${l.label}</span></div>`
    ).join('');
    dd.querySelectorAll('.lang-option').forEach(opt => {
        opt.onclick = () => {
            const code = opt.dataset.code;
            dd.style.display = 'none';
            code === 'es' ? resetTranslation() : applyGoogleTranslate(code);
        };
    });
}

function initLangButton() {
    const btn = document.getElementById('langBtn');
    const dd = document.getElementById('langDropdown');
    if (!btn || !dd) return;
    buildLangDropdown();
    btn.onclick = (e) => {
        e.stopPropagation();
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', (e) => {
        if (!dd.contains(e.target) && e.target !== btn) dd.style.display = 'none';
    });
    const saved = localStorage.getItem('nexus_lang');
    if (saved) updateLangLabel(saved);
}

    // ============================================================
    // CAPTCHA
    // ============================================================
    function initCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let currentCaptcha = '';
        const generateCaptcha = () => {
            let code = '';
            for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
            currentCaptcha = code;
            document.getElementById('captchaText').textContent = code;
        };
        generateCaptcha();
        document.getElementById('captchaRefresh').onclick = generateCaptcha;
        document.getElementById('captchaSubmit').onclick = () => {
            const input = document.getElementById('captchaInput').value.toUpperCase();
            const error = document.getElementById('captchaError');
            const success = document.getElementById('captchaSuccess');
            if (input === currentCaptcha) {
                error.textContent = '';
                success.textContent = '✅ Captcha verificado correctamente';
                setTimeout(() => { document.getElementById('captchaOverlay').style.display = 'none';
                    document.body.style.overflow = ''; }, 500);
            } else {
                error.textContent = '❌ Código incorrecto, intenta de nuevo';
                success.textContent = '';
                generateCaptcha();
                document.getElementById('captchaInput').value = '';
            }
        };
        document.getElementById('captchaInput').onkeydown = e => { if (e.key === 'Enter') document.getElementById(
                'captchaSubmit').click(); };
    }

    // ============================================================
    // LOADER
    // ============================================================
    function initLoader() {
        const bar = document.getElementById('loaderProgressBar');
        const glow = document.getElementById('loaderProgressGlow');
        const percent = document.getElementById('loaderPercent');
        let progress = 0;
        const interval = setInterval(() => {
            if (progress < 30) { progress += Math.random() * 8 + 4; } 
            else if (progress < 60) { progress += Math.random() * 6 + 2; } 
            else if (progress < 85) { progress += Math.random() * 4 + 1; } 
            else if (progress < 98) { progress += Math.random() * 2 + 0.5; } 
            else {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => { document.getElementById('loader').classList.add('hidden'); }, 150);
            }
            if (progress > 100) progress = 100;
            if (bar) bar.style.width = progress + '%';
            if (glow) glow.style.width = progress + '%';
            if (percent) percent.textContent = Math.round(progress) + '%';
        }, 30);
        setTimeout(() => {
            if (progress < 100) {
                clearInterval(interval);
                let fastProgress = progress;
                const fastInterval = setInterval(() => {
                    fastProgress += 15;
                    if (fastProgress >= 100) {
                        fastProgress = 100;
                        clearInterval(fastInterval);
                        if (bar) bar.style.width = '100%';
                        if (percent) percent.textContent = '100%';
                        setTimeout(() => { document.getElementById('loader').classList.add(
                                'hidden'); }, 300);
                    }
                    if (bar) bar.style.width = fastProgress + '%';
                    if (percent) percent.textContent = Math.round(fastProgress) + '%';
                }, 50);
            }
        }, 4000);
    }

    // ============================================================
    // ALERTA BANNER
    // ============================================================
    function initAlertBanner() {
        const DEVELOPMENT_START = new Date(2026, 5, 27, 0, 0, 0);
        const LAUNCH_DATE = new Date(2026, 7, 31, 23, 59, 59);
        const PHASES = [
            { name: 'Optimización de núcleos', min: 0, max: 30, icon: '⚡' },
            { name: 'Pruebas de rendimiento', min: 31, max: 55, icon: '📊' },
            { name: 'Integración de módulos', min: 56, max: 80, icon: '🔗' },
            { name: 'Pulido de interfaz', min: 81, max: 90, icon: '🎨' },
            { name: 'Validación final', min: 91, max: 100, icon: '✅' }
        ];

        function getDaysElapsed() {
            const now = new Date();
            const diff = now - DEVELOPMENT_START;
            return diff <= 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
        }

        function getTotalDays() { const diff = LAUNCH_DATE - DEVELOPMENT_START; return Math.floor(diff / (1000 * 60 *
                    60 * 24)); }

        function getOverallProgress() {
            const days = getDaysElapsed();
            const total = getTotalDays();
            return total <= 0 ? 0 : Math.min(Math.round((days / total) * 100), 100);
        }

        function getCurrentPhase(prog) { for (const p of PHASES) { if (prog >= p.min && prog <= p.max) return p; }
            return PHASES[PHASES.length - 1]; }

        function getTimeRemaining() {
            const now = new Date();
            const diff = LAUNCH_DATE - now;
            if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, isLaunched: true };
            return { days: Math.floor(diff / (1000 * 60 * 60 * 24)), hours: Math.floor((diff % (1000 * 60 * 60 *
                        24)) / (1000 * 60 * 60)), mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((diff % (1000 * 60)) / 1000), isLaunched: false };
        }

        function tick() {
            const days = getDaysElapsed();
            const rem = getTimeRemaining();
            const prog = getOverallProgress();
            const phase = getCurrentPhase(prog);
            document.querySelectorAll('#alertCountdown, #alertCountdown2').forEach(el => { if (el) el.textContent =
                    days.toLocaleString(); });
            document.querySelectorAll('#alertCountdownDays, #alertCountdownDays2').forEach(el => { if (el) el
                    .textContent = rem.isLaunched ? '🎉' : rem.days; });
            document.querySelectorAll('#alertCountdownHours, #alertCountdownHours2').forEach(el => { if (el) el
                    .textContent = rem.isLaunched ? '00' : String(rem.hours).padStart(2, '0'); });
            document.querySelectorAll('#alertCountdownMins, #alertCountdownMins2').forEach(el => { if (el) el
                    .textContent = rem.isLaunched ? '00' : String(rem.mins).padStart(2, '0'); });
            document.querySelectorAll('#alertCountdownSecs, #alertCountdownSecs2').forEach(el => { if (el) el
                    .textContent = rem.isLaunched ? '00' : String(rem.secs).padStart(2, '0'); });
            document.querySelectorAll('#alertProgressText, #alertProgressText2').forEach(el => { if (el) el
                    .textContent = `${prog}%`; });
            document.querySelectorAll('#alertStatus, #alertStatus2').forEach(el => { if (el) el.textContent =
                    `${phase.icon} ${phase.name}`; });
            const pf = document.getElementById('infoProgressFill');
            if (pf) pf.style.width = `${prog}%`;
            const pt = document.getElementById('infoProgressText');
            if (pt) pt.textContent = `${prog}%`;
            const dt = document.getElementById('infoDaysText');
            if (dt) dt.textContent = `${days.toLocaleString()} días`;
            const td = document.getElementById('infoTotalDays');
            if (td) td.textContent = getTotalDays();
            const md = document.getElementById('modalDays');
            if (md) md.textContent = rem.isLaunched ? '🎉' : rem.days;
            const mh = document.getElementById('modalHours');
            if (mh) mh.textContent = rem.isLaunched ? '00' : String(rem.hours).padStart(2, '0');
            const mm = document.getElementById('modalMins');
            if (mm) mm.textContent = rem.isLaunched ? '00' : String(rem.mins).padStart(2, '0');
            const ms = document.getElementById('modalSecs');
            if (ms) ms.textContent = rem.isLaunched ? '00' : String(rem.secs).padStart(2, '0');
        }
        tick();
        setInterval(tick, 1000);
        document.getElementById('alertInfoBtn')?.addEventListener('click', function() {
            tick();
            document.getElementById('infoModal').classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    // ============================================================
    // HUD LATENCY
    // ============================================================
    function initHudLatency() {
        const el = document.getElementById('hudLatency');
        if (!el) return;
        setInterval(() => { el.textContent = `${30 + Math.floor(Math.random() * 25)}ms`; }, 1800);
    }

    // ============================================================
    // BACK TO TOP
    // ============================================================
    function initBackToTop() {
        const backBtn = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            backBtn.style.opacity = window.scrollY > 500 ? '1' : '0';
            backBtn.style.transform = window.scrollY > 500 ? 'scale(1)' : 'scale(.8)';
        });
        backBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================================
    // CURSOR GLOW
    // ============================================================
    function initCursorGlow() {
        const g = document.getElementById('cursorGlow');
        document.addEventListener('mousemove', e => {
            if (g) { g.style.left = e.clientX + 'px';
                g.style.top = e.clientY + 'px'; }
        });
    }

    // ============================================================
    // BLOQUEO DE CLICK DERECHO
    // ============================================================
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) { e.preventDefault(); return false; }
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) { e.preventDefault(); return false; }
    });
    // ============================================================
    // MUSIC PLAYER
    // ============================================================
    function initMusicPlayer() {
        const DEFAULT_TRACKS = [
            { name: 'Nexus Theme', artist: '157 Team', src: 'assets/music/nexus-theme.mp3', removable: false },
            { name: 'Nexus Ambient', artist: '157 Team', src: 'assets/music/nexus-ambient.mp3', removable: false }
        ];

        let playlist = [...DEFAULT_TRACKS];
        let curIndex = -1;
        let isShuffle = false;
        let isLoop = false;

        const audio = $('mpAudio');
        const player = $('musicPlayer');
        if (!audio || !player) return; // No music player on this page
        const playBtn = $('mpPlay');
        const seek = $('mpSeek');
        const volume = $('mpVolume');
        const curTime = $('mpCurTime');
        const durTime = $('mpDurTime');
        const trackName = $('mpTrackName');
        const trackArtist = $('mpTrackArtist');
        const playlistEl = $('mpPlaylist');

        audio.volume = 0.7;

        function fmtTime(s) {
            if (!isFinite(s)) return '0:00';
            const m = Math.floor(s / 60), sec = Math.floor(s % 60);
            return `${m}:${String(sec).padStart(2, '0')}`;
        }

        function renderPlaylist() {
            playlistEl.innerHTML = playlist.map((t, i) => `
                <div class="mp-track-item${i === curIndex ? ' active' : ''}" data-i="${i}">
                    <i class="fas fa-music" style="font-size:.7rem"></i>
                    <span>${esc(t.name)}</span>
                    ${t.removable ? `<i class="fas fa-times mp-remove" data-remove="${i}"></i>` : ''}
                </div>
            `).join('');
            playlistEl.querySelectorAll('.mp-track-item').forEach(el => {
                el.onclick = (e) => {
                    if (e.target.dataset.remove !== undefined) return;
                    loadTrack(parseInt(el.dataset.i));
                    playAudio();
                };
            });
            playlistEl.querySelectorAll('[data-remove]').forEach(el => {
                el.onclick = (e) => {
                    e.stopPropagation();
                    const idx = parseInt(el.dataset.remove);
                    if (idx === curIndex) { audio.pause(); curIndex = -1; }
                    playlist.splice(idx, 1);
                    renderPlaylist();
                };
            });
        }

        function extractVideoID(url) {
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = (url || '').match(regExp);
            return (match && match[7].length == 11) ? match[7] : false;
        }

        let ytPlayer = null;
        let isYtReady = false;
        let ytProgressInterval = null;

        window.onYouTubeIframeAPIReady = function() {
            ytPlayer = new YT.Player('ytIframe', {
                height: '60', width: '60',
                playerVars: { 'autoplay': 0, 'controls': 0, 'disablekb': 1, 'fs': 0, 'rel': 0 },
                events: {
                    'onReady': () => { isYtReady = true; },
                    'onStateChange': onYtStateChange
                }
            });
        };

        function onYtStateChange(e) {
            if (e.data === YT.PlayerState.PLAYING) {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                player.classList.add('playing');
                clearInterval(ytProgressInterval);
                ytProgressInterval = setInterval(updateYtProgress, 500);
            } else {
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                player.classList.remove('playing');
                clearInterval(ytProgressInterval);
            }
            if (e.data === YT.PlayerState.ENDED) {
                isLoop ? ytPlayer.seekTo(0) : nextTrack();
            }
        }

        function updateYtProgress() {
            if(ytPlayer && ytPlayer.getCurrentTime) {
                const cur = ytPlayer.getCurrentTime();
                const dur = ytPlayer.getDuration();
                if(dur) {
                    seek.value = (cur / dur) * 100;
                    curTime.textContent = fmtTime(cur);
                    durTime.textContent = fmtTime(dur);
                }
            }
        }

        function loadTrack(i) {
            if (i < 0 || i >= playlist.length) return;
            curIndex = i;
            const t = playlist[i];
            
            const ytId = extractVideoID(t.src);
            const ytIframeContainer = document.getElementById('ytIframeContainer');
            const mpArt = document.getElementById('mpArt');
            
            if (ytId) {
                audio.pause();
                if(ytIframeContainer) ytIframeContainer.style.display = 'block';
                if(mpArt) mpArt.style.display = 'none';
                if(isYtReady && ytPlayer && ytPlayer.loadVideoById) ytPlayer.loadVideoById(ytId);
            } else {
                if(ytIframeContainer) ytIframeContainer.style.display = 'none';
                if(mpArt) mpArt.style.display = '';
                if(isYtReady && ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();
                audio.src = t.src;
            }
            
            trackName.textContent = t.name;
            trackArtist.textContent = t.artist || 'Pista local';
            renderPlaylist();
        }

        function playAudio() {
            if (curIndex === -1 && playlist.length) loadTrack(0);
            const t = playlist[curIndex];
            if (t && extractVideoID(t.src)) {
                if(isYtReady && ytPlayer && ytPlayer.playVideo) ytPlayer.playVideo();
                return;
            }
            audio.play().catch(() => toast('No se pudo reproducir el audio', 'error'));
        }

        function pauseAudio() { 
            const t = playlist[curIndex];
            if (t && extractVideoID(t.src)) {
                if(isYtReady && ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
            } else {
                audio.pause(); 
            }
        }

        function nextTrack() {
            if (!playlist.length) return;
            let i = isShuffle ? Math.floor(Math.random() * playlist.length) : (curIndex + 1) % playlist.length;
            loadTrack(i);
            playAudio();
        }

        function prevTrack() {
            if (!playlist.length) return;
            let i = (curIndex - 1 + playlist.length) % playlist.length;
            loadTrack(i);
            playAudio();
        }

        playBtn.onclick = () => {
            const t = playlist[curIndex];
            const isYt = t && extractVideoID(t.src);
            if(isYt) {
                if(ytPlayer && ytPlayer.getPlayerState) {
                    ytPlayer.getPlayerState() === YT.PlayerState.PLAYING ? pauseAudio() : playAudio();
                }
            } else {
                audio.paused ? playAudio() : pauseAudio();
            }
        };

        $('mpNext').onclick = nextTrack;
        $('mpPrev').onclick = prevTrack;
        $('mpShuffle').onclick = function() { isShuffle = !isShuffle; this.classList.toggle('active', isShuffle); };
        $('mpLoop').onclick = function() { isLoop = !isLoop; this.classList.toggle('active', isLoop); };

        audio.addEventListener('play', () => {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            player.classList.add('playing');
        });
        audio.addEventListener('pause', () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            player.classList.remove('playing');
        });
        audio.addEventListener('timeupdate', () => {
            const t = playlist[curIndex];
            if (t && extractVideoID(t.src)) return;
            if (!audio.duration) return;
            seek.value = (audio.currentTime / audio.duration) * 100;
            curTime.textContent = fmtTime(audio.currentTime);
            durTime.textContent = fmtTime(audio.duration);
        });
        audio.addEventListener('ended', () => { isLoop ? (audio.currentTime = 0, playAudio()) : nextTrack(); });

        seek.addEventListener('input', () => {
            const t = playlist[curIndex];
            if (t && extractVideoID(t.src)) {
                if(isYtReady && ytPlayer && ytPlayer.getDuration) {
                    ytPlayer.seekTo((seek.value / 100) * ytPlayer.getDuration(), true);
                }
            } else {
                if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
            }
        });
        volume.addEventListener('input', () => { 
            const vol = volume.value;
            audio.volume = vol / 100; 
            if(isYtReady && ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(vol);
        });

        $('mpHeader').onclick = () => player.classList.toggle('collapsed');

        $('mpAddFileBtn').onclick = () => $('mpFileInput').click();
        $('mpFileInput').onchange = function() {
            [...this.files].forEach(file => {
                const url = URL.createObjectURL(file);
                playlist.push({ name: file.name.replace(/\.[^/.]+$/, ''), artist: 'Tu música', src: url, removable: true });
            });
            renderPlaylist();
            toast(`${this.files.length} pista(s) agregada(s)`);
            this.value = '';
        };

        $('mpAddUrlBtn').onclick = () => {
            const url = prompt('Pega el link directo del archivo de audio (mp3, wav...):');
            if (!url) return;
            const name = prompt('Nombre de la canción:', 'Pista externa') || 'Pista externa';
            playlist.push({ name, artist: 'Link externo', src: url, removable: true });
            renderPlaylist();
            toast('Pista agregada por URL');
        };

        renderPlaylist();
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    applyTheme();
    initParticles();
    initCookies();
    initCaptcha();
    initLoader();
    initAlertBanner();
    initHudLatency();
    initBackToTop();
    initCursorGlow();
    initMusicPlayer();
    initLangButton();
    loadGoogleTranslateScript();

    renderProducts();

    function startApp() {
        initFirebaseAuth();
        updateAuthUI();
        loadProductsFromFirebase();
        window.loadAppsFromFirebase();
        loadComments();
        loadForo();
    }

    if (window.fbReady) {
        startApp();
    } else if (window.fbError) {
        console.error('Firebase falló al cargar');
        startApp();
    } else {
        window.addEventListener('fb-ready', startApp, { once: true });
        window.addEventListener('fb-error', startApp, { once: true });
    }
    // ============================================================
// PERFIL: SOLICITAR SER DEVELOPER
// ============================================================

window.openDevRequestModal = function() {
    if (!currentUser) { openAuthModal(); return; }
    document.getElementById('devReqReason').value = '';
    document.getElementById('devReqPortfolio').value = '';
    document.getElementById('devReqReasonCount').textContent = '0 / 500';
    document.getElementById('devReqStatus').textContent = '';
    document.getElementById('devReqStatus').className = 'status-msg';
    document.getElementById('devRequestOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
};

document.getElementById('devReqReason')?.addEventListener('input', function() {
    document.getElementById('devReqReasonCount').textContent = `${this.value.length} / 500`;
});

window.submitDevRequest = async function() {
    if (!currentUser) { openAuthModal(); return; }
    const reason = document.getElementById('devReqReason').value.trim();
    const portfolio = document.getElementById('devReqPortfolio').value.trim();
    const statusEl = document.getElementById('devReqStatus');
    const btn = document.getElementById('devReqSubmitBtn');

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
        currentUser.uid, currentUser.username, currentUser.email, reason, portfolio
    );

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar solicitud';

    if (result.success) {
        toast('✅ Solicitud enviada, te avisaremos cuando la revisemos');
        closeOverlay('devRequestOverlay');
        checkDevStatus(currentUser.uid);
    } else {
        statusEl.textContent = '❌ ' + (result.error || 'Error al enviar la solicitud');
        statusEl.className = 'status-msg error';
    }
};


// Consulta y refleja el estado actual (ninguna / pendiente / rechazada / aprobada)
// en el perfil propio. Se llama al abrir tu propio perfil.
async function checkDevStatus(uid) {
    const section = document.getElementById('devStatusSection');
    const none = document.getElementById('devStateNone');
    const pending = document.getElementById('devStatePending');
    const rejected = document.getElementById('devStateRejected');
    const approved = document.getElementById('devStateApproved');
    if (!section) return;

    [none, pending, rejected, approved].forEach(el => el.style.display = 'none');
    section.style.display = 'block';

    if (!window.fb) return;

    // Si ya es developer aprobado (según su propio doc de usuario), mostrar eso directo
    const isDev = await window.fb.isUserDeveloper(uid);
    if (isDev) {
        approved.style.display = 'flex';
        return;
    }

    if (!window.fb.getMyDeveloperRequestStatus) { none.style.display = 'block'; return; }
    const res = await window.fb.getMyDeveloperRequestStatus(uid);
    if (!res.success || !res.status) {
        none.style.display = 'block';
    } else if (res.status === 'pending') {
        pending.style.display = 'flex';
    } else if (res.status === 'rejected') {
        rejected.style.display = 'block';
    } else {
        none.style.display = 'block';
    }
}

// ============================================================
// FUNCIONES GLOBALES
// ============================================================
window.openAuthModal = openAuthModal;
window.openLogoutModal = openLogoutModal;
window.closeOverlay = closeOverlay;
window.togglePass = function(id, btn) {
    const inp = document.getElementById(id);
    const ic = btn.querySelector('i');
    if (inp.type === 'password') { inp.type = 'text';
        ic.className = 'fas fa-eye-slash'; } else { inp.type = 'password';
        ic.className = 'fas fa-eye'; }
};
window.openProfile = openProfile;
window.saveProfile = saveProfile;
window.addCustomBadge = addCustomBadge;
window.setUserRank = setUserRank;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.removeAllFromCart = removeAllFromCart;
window.closeCart = closeCart;

// ============================================================
// ADMIN: ACTIVAR/DESACTIVAR NEXUS+
// ============================================================
window.adminToggleNexusPlus = async function(userId, currentStatus) {
    if (!currentUser || !currentUser.isAdmin) {
        toast('No tienes permisos para realizar esta acción', 'error');
        return;
    }
    if (!window.fb || !window.fb.saveUserProfile) {
        toast('Firebase no disponible', 'error');
        return;
    }

    const newStatus = !currentStatus;
    const result = await window.fb.saveUserProfile(userId, { nexusPlus: newStatus });

    if (result.success) {
        toast(`Nexus+ ${newStatus ? 'activado' : 'desactivado'} correctamente`);
        loadAdminData();
    } else {
        toast('Error al cambiar el estado: ' + result.error, 'error');
    }
};

console.log('%c157 Team · Nexus Protect', 'color: #4fd8ff; font-size: 16px; font-weight: bold;');
console.log('%c© 2026 157 Developers team - Todos los derechos reservados', 'color: #8a93a6; font-size: 12px;');
console.log('%cCodigo Protegido', 'color: #3ddc97; font-size: 14px; font-weight: bold;');
let pendingProductImage = null;

window.handleNewProductImage = function(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            let w = img.width, h = img.height;
            if (w > 800 || h > 800) {
                const ratio = Math.min(800 / w, 800 / h);
                w = Math.round(w * ratio); h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            pendingProductImage = canvas.toDataURL('image/jpeg', 0.9);
            $('npPreview').src = pendingProductImage;
            $('npPreview').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

    // Lógica para selección múltiple de categorías
    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
        });
    });

window.editProductAdmin = function(productId) {
    const p = PRODUCTS.find(x => x.id === productId);
    if (!p) return;
    $('npEditId').value = p.id;
    $('npFormTitle').innerHTML = '<i class="fas fa-edit"></i> Editar producto';
    $('npSubmitBtnText').textContent = 'Guardar cambios';
    $('npCancelEditBtn').style.display = 'inline-flex';
    
    $('npName').value = p.name || '';
    $('npPrice').value = p.price || '';
    $('npEmoji').value = p.emoji || '';
    $('npId').value = p.id || '';
    $('npShortDesc').value = p.shortDesc || '';
    $('npDesc').value = p.desc || '';
    $('npFeats').value = (p.feats || []).join('\n');
    $('npDl').value = p.dl || '';
    $('npColor').value = p.color || '';
    
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('selected'));
    if (p.cat) {
        let cats = Array.isArray(p.cat) ? p.cat : p.cat.split(',').map(s=>s.trim());
        cats.forEach(c => {
            const chip = document.querySelector(`.cat-chip[data-val="${c}"]`);
            if (chip) chip.classList.add('selected');
        });
    }
    
    pendingProductImage = null;
    if (p.image) {
        $('npPreview').src = p.image;
        $('npPreview').style.display = 'block';
    } else {
        $('npPreview').style.display = 'none';
    }
    
    document.getElementById('atab-products').scrollIntoView({behavior: 'smooth'});
};

window.cancelEditProduct = function() {
    $('npEditId').value = '';
    $('npFormTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Nuevo producto';
    $('npSubmitBtnText').textContent = 'Crear producto';
    $('npCancelEditBtn').style.display = 'none';
    
    $('npName').value = ''; $('npPrice').value = ''; $('npEmoji').value = '';
    $('npId').value = ''; $('npShortDesc').value = ''; $('npDesc').value = ''; 
    $('npFeats').value = ''; $('npDl').value = ''; $('npColor').value = '';
    
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('selected'));
    pendingProductImage = null;
    $('npPreview').style.display = 'none';
};

window.createNewProduct = async function() {
    if (!currentUser || !currentUser.isAdmin) { toast('Sin permisos', 'error'); return; }
    
    const editId = $('npEditId').value;
    const name = $('npName').value.trim();
    
    const selectedChips = Array.from(document.querySelectorAll('.cat-chip.selected')).map(c => c.dataset.val);
    const cat = selectedChips.length > 0 ? selectedChips.join(',') : 'free';
    
    const price = $('npPrice').value.trim();
    const emoji = $('npEmoji').value.trim() || '📦';
    const customId = $('npId').value.trim();
    const customColor = $('npColor').value.trim();
    const shortDesc = $('npShortDesc').value.trim();
    const desc = $('npDesc').value.trim();
    const feats = $('npFeats').value.split('').map(f => f.trim()).filter(Boolean);
    const dl = $('npDl').value.trim();

    if (!name || !price || !shortDesc) { toast('Completa nombre, precio y descripción corta', 'error'); return; }

    const isFree = price === '$0' || price === '0';
    const productData = {
        name, cat, price, emoji,
        color: customColor || '#4fd8ff',
        rating: '5.0',
        tag: isFree ? 'GRATIS' : 'PREMIUM',
        author: '157 Team',
        shortDesc, desc, feats, dl,
        free: isFree
    };
    
    if (pendingProductImage) {
        productData.image = pendingProductImage;
    }

    if (editId) {
        const result = await window.fb.updateProduct(editId, productData, currentUser.uid);
        if (result.success) {
            toast('✅ Producto actualizado');
            window.cancelEditProduct();
            await loadProductsFromFirebase();
            await loadAdminData();
        } else {
            toast('❌ Error: ' + result.error, 'error');
        }
    } else {
        productData.downloads = '0';
        productData.commentsCount = '0';
        productData.image = productData.image || '';
        
        const result = await window.fb.addProduct(productData, currentUser.uid);
        if (result.success) {
            toast('✅ Producto creado');
            window.cancelEditProduct();
            await loadProductsFromFirebase();
            await loadAdminData();
        } else {
            toast('❌ Error: ' + result.error, 'error');
        }
    }
};

// ============================================================
// PANEL DE DESARROLLADOR - GUARDAR PRODUCTO
// ============================================================

let pendingDevProductImage = null;

window.handleDevProductImage = function(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      let w = img.width, h = img.height;
      if (w > 800 || h > 800) {
        const ratio = Math.min(800 / w, 800 / h);
        w = Math.round(w * ratio); h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      pendingDevProductImage = canvas.toDataURL('image/jpeg', 0.9);
      document.getElementById('dpPreview').src = pendingDevProductImage;
      document.getElementById('dpPreview').style.display = 'block';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.saveDevProduct = async function() {
  if (!currentUser) { toast('Inicia sesión primero', 'error'); return; }
  if (!currentUser.isDeveloper) { toast('No tienes permisos de desarrollador', 'error'); return; }

  const editId = document.getElementById('dpEditId').value;
  const name = document.getElementById('dpName').value.trim();
  const price = document.getElementById('dpPrice').value.trim();
  const emoji = document.getElementById('dpEmoji').value.trim() || '📦';
  const customId = document.getElementById('dpId').value.trim();
  const customColor = document.getElementById('dpColor').value.trim();
  const shortDesc = document.getElementById('dpShortDesc').value.trim();
  const desc = document.getElementById('dpDesc').value.trim();
  const feats = document.getElementById('dpFeats').value.split('').map(f => f.trim()).filter(Boolean);
  const dl = document.getElementById('dpDl').value.trim();

  // Categorías seleccionadas
  const selectedChips = Array.from(document.querySelectorAll('#dpCatChips .cat-chip.selected')).map(c => c.dataset.val);
  const cat = selectedChips.length > 0 ? selectedChips.join(',') : 'free';

  if (!name || !price || !shortDesc) {
    toast('Completa nombre, precio y descripción corta', 'error');
    return;
  }

  const isFree = price === '$0' || price === '0';
  const productData = {
    name,
    cat,
    price,
    emoji,
    color: customColor || '#4fd8ff',
    shortDesc,
    desc,
    feats,
    dl,
    free: isFree,
    authorId: currentUser.uid,   // importante: para saber quién lo publicó
    authorName: currentUser.username,
    downloads: '0',
    commentsCount: '0',
  };

  if (pendingDevProductImage) {
    productData.image = pendingDevProductImage;
  }

  try {
    let result;
    if (editId) {
      // Editar producto existente (solo si es el dueño)
      result = await window.fb.updateProduct(editId, productData, currentUser.uid);
    } else {
      // Crear nuevo producto
      result = await window.fb.addProduct(productData, currentUser.uid);
    }

    if (result.success) {
      toast(editId ? '✅ Producto actualizado' : '✅ Producto publicado');
      cancelEditDevProduct();
      await loadProductsFromFirebase();
      await loadMyDevProducts(); // si existe
    } else {
      toast('❌ Error: ' + (result.error || 'desconocido'), 'error');
    }
  } catch (e) {
    toast('❌ Error al guardar: ' + e.message, 'error');
  }
};

window.cancelEditDevProduct = function() {
  document.getElementById('dpEditId').value = '';
  document.getElementById('dpFormTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Nuevo producto';
  document.getElementById('dpSubmitBtnText').textContent = 'Publicar producto';
  document.getElementById('dpCancelEditBtn').style.display = 'none';

  document.getElementById('dpName').value = '';
  document.getElementById('dpPrice').value = '';
  document.getElementById('dpEmoji').value = '';
  document.getElementById('dpId').value = '';
  document.getElementById('dpShortDesc').value = '';
  document.getElementById('dpDesc').value = '';
  document.getElementById('dpFeats').value = '';
  document.getElementById('dpDl').value = '';
  document.getElementById('dpColor').value = '';

  document.querySelectorAll('#dpCatChips .cat-chip').forEach(c => c.classList.remove('selected'));
  pendingDevProductImage = null;
  document.getElementById('dpPreview').style.display = 'none';
};

// Cargar mis productos (para mostrarlos en el panel dev)
window.loadMyDevProducts = async function() {
  if (!currentUser) return;
  const list = document.getElementById('devMyProductsList');
  if (!list) return;

  const result = await window.fb.getProducts();
  if (!result.success) { list.innerHTML = '<div style="color:var(--text-dim);text-align:center;">Error al cargar productos</div>'; return; }

  const myProducts = result.data.filter(p => p.authorId === currentUser.uid);
  if (myProducts.length === 0) {
    list.innerHTML = '<div style="color:var(--text-faint);text-align:center;padding:20px;">Aún no has publicado ningún producto.</div>';
    return;
  }

  list.innerHTML = myProducts.map(p => `
    <div style="background:var(--panel-strong);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <span style="font-size:1.8rem;">${p.emoji || '📦'}</span>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:.92rem;">${esc(p.name)}</div>
        <div style="font-size:.72rem;color:var(--text-dim);">${p.price} · ${Array.isArray(p.cat) ? p.cat.join(', ') : p.cat}</div>
      </div>
      <button onclick="editDevProduct('${p.id}')" class="btn btn-ghost btn-sm"><i class="fas fa-edit"></i></button>
      <button onclick="deleteDevProduct('${p.id}')" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
};

window.editDevProduct = async function(productId) {
  const result = await window.fb.getProducts();
  if (!result.success) { toast('Error al obtener productos', 'error'); return; }
  const p = result.data.find(x => x.id === productId);
  if (!p) { toast('Producto no encontrado', 'error'); return; }
  if (p.authorId !== currentUser.uid) { toast('No puedes editar este producto', 'error'); return; }

  document.getElementById('dpEditId').value = p.id;
  document.getElementById('dpFormTitle').innerHTML = '<i class="fas fa-edit"></i> Editar producto';
  document.getElementById('dpSubmitBtnText').textContent = 'Guardar cambios';
  document.getElementById('dpCancelEditBtn').style.display = 'inline-flex';

  document.getElementById('dpName').value = p.name || '';
  document.getElementById('dpPrice').value = p.price || '';
  document.getElementById('dpEmoji').value = p.emoji || '';
  document.getElementById('dpId').value = p.id || '';
  document.getElementById('dpShortDesc').value = p.shortDesc || '';
  document.getElementById('dpDesc').value = p.desc || '';
  document.getElementById('dpFeats').value = (p.feats || []).join('\n');
  document.getElementById('dpDl').value = p.dl || '';
  document.getElementById('dpColor').value = p.color || '';

  document.querySelectorAll('#dpCatChips .cat-chip').forEach(c => c.classList.remove('selected'));
  if (p.cat) {
    let cats = Array.isArray(p.cat) ? p.cat : p.cat.split(',').map(s=>s.trim());
    cats.forEach(c => {
      const chip = document.querySelector(`#dpCatChips .cat-chip[data-val="${c}"]`);
      if (chip) chip.classList.add('selected');
    });
  }

  if (p.image) {
    document.getElementById('dpPreview').src = p.image;
    document.getElementById('dpPreview').style.display = 'block';
  } else {
    document.getElementById('dpPreview').style.display = 'none';
  }
  document.getElementById('devPanelOverlay').scrollIntoView({behavior: 'smooth'});
};

window.deleteDevProduct = async function(productId) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
  const result = await window.fb.deleteProduct(productId, currentUser.uid);
  if (result.success) {
    toast('Producto eliminado');
    loadMyDevProducts();
    loadProductsFromFirebase();
  } else {
    toast('❌ Error: ' + result.error, 'error');
  }
};

// ============================================================
// RESEÑAS Y NOTIFICACIONES EN TIEMPO REAL
// ============================================================
let currentReviewsUnsubscribe = null;
let currentRatingSelected = 0;
let userReviewId = null; // ID de la reseña del usuario actual si existe

window.loadProductReviews = function(productId) {
    if (currentReviewsUnsubscribe) {
        currentReviewsUnsubscribe();
        currentReviewsUnsubscribe = null;
    }
    
    userReviewId = null;
    currentRatingSelected = 0;
    updateStarSelection(0);
    $('mReviewText').value = '';
    $('mReviewCount').textContent = '0 / 200';
    $('mReviewForm').style.display = 'none';
    $('mReviewLoginMsg').style.display = 'none';
    $('mReviewsList').innerHTML = '<div style="text-align:center;color:var(--text-faint);font-size:.8rem;padding:20px;">Cargando reseñas...</div>';
    $('mReviewsAvg').innerHTML = '';

    if (!window.fb || !window.fb.listenProductReviews) return;

    if (currentUser) {
        $('mReviewForm').style.display = 'block';
        $('mReviewLoginMsg').style.display = 'none';
        $('mReviewFormTitle').textContent = 'Deja tu reseña:';
        $('mReviewCancelBtn').style.display = 'none';
    } else {
        $('mReviewForm').style.display = 'none';
        $('mReviewLoginMsg').style.display = 'block';
    }

    currentReviewsUnsubscribe = window.fb.listenProductReviews(productId, (reviews) => {
        renderReviews(reviews, productId);
    });
};

async function renderReviews(reviews, productId) {
    const list = $('mReviewsList');
    const avgContainer = $('mReviewsAvg');
    
    // Ordenar localmente (descendente por fecha)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (reviews.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-faint);font-size:.8rem;padding:20px;">Aún no hay reseñas. ¡Sé el primero!</div>';
        avgContainer.innerHTML = 'Nuevo';
        updateGlobalProductRating(productId, null);
        return;
    }

    // ✅ NUEVO: traer efectos de nombre / color / Nexus+ de cada autor de reseña
    let nameEffectMap = {}, effectColorMap = {}, nexusPlusMap = {};
    if (window.fb && window.fb.getAllUsers) {
        const usersResult = await window.fb.getAllUsers();
        const users = usersResult.success ? usersResult.data : [];
        users.forEach(u => {
            const isPlus = !!(u.nexusPlus || u.hasNexusPlus); // acepta los dos nombres de campo
            nexusPlusMap[u.id] = isPlus;
            const fx = u.nameEffect || 'none';
            if ((fx === 'plusgold' || fx.startsWith('nexus-')) && !isPlus) nameEffectMap[u.id] = 'none';
            else if (fx === 'devtype' && !u.isDeveloper) nameEffectMap[u.id] = 'none';
            else nameEffectMap[u.id] = fx;
            effectColorMap[u.id] = u.effectColor || '';
        });
    }

    let totalStars = 0;
    let html = '';
    
    // Buscar si el usuario ya comentó
    if (currentUser) {
        const myReview = reviews.find(r => r.userId === currentUser.uid);
        if (myReview) {
            userReviewId = myReview.id;
            $('mReviewFormTitle').textContent = 'Edita tu reseña:';
            $('mReviewText').value = myReview.text;
            $('mReviewCount').textContent = `${myReview.text.length} / 200`;
            currentRatingSelected = myReview.rating;
            updateStarSelection(myReview.rating);
        } else {
            userReviewId = null;
            $('mReviewFormTitle').textContent = 'Deja tu reseña:';
        }
    }

    reviews.forEach(r => {
        totalStars += r.rating;
        const isMine = currentUser && r.userId === currentUser.uid;
        const avatarStr = r.avatar ? `<img src="${r.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : `<i class="fas fa-user"></i>`;

        // ✅ NUEVO: efecto de nombre + gema Nexus+
        const nameFx = nameEffectMap[r.userId] || 'none';
        const userFxColor = effectColorMap[r.userId] || '';
        const isNexusPlus = nexusPlusMap[r.userId];
        const nPlusHTML = isNexusPlus ? `<span style="color:var(--nexus-gold); font-size:0.75rem; margin-left:4px;" title="Miembro Nexus+"><i class="fas fa-gem"></i></span>` : '';
        
        let starsHtml = '';
        for(let i=1; i<=5; i++) {
            starsHtml += `<i class="fas fa-star" style="color:${i <= r.rating ? 'var(--amber)' : 'var(--border)'}"></i>`;
        }
        
        html += `
            <div style="background:var(--panel-strong);border-radius:12px;padding:14px;border:1px solid var(--border);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:28px;height:28px;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;color:var(--text-faint);font-size:.7rem;overflow:hidden;">
                            ${avatarStr}
                        </div>
                        <div>
                            <div style="font-weight:600;font-size:.85rem;">
                                <span class="uname uname-${nameFx}" onclick="location.href='perfil.html?u=${r.userId}'" style="cursor:pointer;${userFxColor ? ` --uname-color: ${userFxColor};` : ''}">${esc(r.username)}</span>${nPlusHTML}
                            </div>
                            <div style="font-size:.7rem;color:var(--text-dim);">${new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <div style="font-size:.7rem;display:flex;gap:2px;">${starsHtml}</div>
                        ${isMine ? `<button onclick="deleteMyReview('${r.id}')" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:4px;opacity:0.7;"><i class="fas fa-trash-alt"></i></button>` : ''}
                    </div>
                </div>
                <p style="font-size:.82rem;color:var(--text);margin:0;line-height:1.5;">${esc(r.text)}</p>
            </div>
        `;
    });

    const avg = (totalStars / reviews.length).toFixed(1);
    avgContainer.innerHTML = `<i class="fas fa-star"></i> ${avg} <span style="font-size:.7rem;color:var(--text-faint);font-weight:400;margin-left:4px;">(${reviews.length})</span>`;
    list.innerHTML = html;
    
    updateGlobalProductRating(productId, avg);
}

function updateGlobalProductRating(productId, avg) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (prod) {
        prod.calculatedRating = avg || prod.rating;
        // Reflejar en la UI si está renderizado (esto requeriría re-renderizar la lista de productos si se quiere ver afuera al instante)
        // Por ahora se actualizará la próxima vez que se renderice.
    }
}

// Funcionalidad del formulario
document.querySelectorAll('#mReviewStars i').forEach(star => {
    star.addEventListener('click', function() {
        currentRatingSelected = parseInt(this.getAttribute('data-val'));
        updateStarSelection(currentRatingSelected);
    });
});

function updateStarSelection(rating) {
    document.querySelectorAll('#mReviewStars i').forEach(star => {
        const val = parseInt(star.getAttribute('data-val'));
        star.style.color = val <= rating ? 'var(--amber)' : 'var(--border)';
    });
}

$('mReviewText').addEventListener('input', function() {
    $('mReviewCount').textContent = `${this.value.length} / 200`;
});

$('mReviewSubmitBtn').onclick = async function() {
    if (!currentUser) return;
    if (currentRatingSelected === 0) { toast('Por favor, selecciona una calificación', 'error'); return; }
    const text = $('mReviewText').value.trim();
    if (text.length < 5) { toast('La reseña es muy corta', 'error'); return; }
    
    const btn = this;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        let result;
        if (userReviewId) {
            result = await window.fb.editProductReview(userReviewId, currentRatingSelected, text, currentUser.uid);
        } else {
            // Obtener avatar actual desde Firebase
            let userAvatar = '';
            const profRes = await window.fb.getUserProfile(currentUser.uid);
            if (profRes.success && profRes.data.avatar) userAvatar = profRes.data.avatar;

            result = await window.fb.addProductReview(currentProd.id, currentRatingSelected, text, currentUser.uid, currentUser.username, userAvatar);
            window.fb.addActivityNotification(currentUser.uid, currentUser.username, 'review', currentProd.name, currentProd.id);
        }
        
        if (result.success) {
            toast(userReviewId ? '✅ Reseña actualizada' : '✅ Reseña publicada');
        } else {
            toast('❌ Error: ' + result.error, 'error');
        }
    } catch (e) {
        toast('❌ Error interno', 'error');
    }
    
    btn.innerHTML = oldText;
    btn.disabled = false;
};

$('mReviewCancelBtn').onclick = function() {
    userReviewId = null;
    $('mReviewText').value = '';
    currentRatingSelected = 0;
    updateStarSelection(0);
    $('mReviewCount').textContent = '0 / 200';
    $('mReviewFormTitle').textContent = 'Deja tu reseña:';
    this.style.display = 'none';
};

window.deleteMyReview = async function(reviewId) {
    if (!confirm('¿Seguro que quieres borrar tu reseña?')) return;
    if (!window.fb.deleteProductReview) return;
    const res = await window.fb.deleteProductReview(reviewId, currentUser.uid);
    if (res.success) {
        toast('Reseña borrada');
        userReviewId = null;
        $('mReviewText').value = '';
        currentRatingSelected = 0;
        updateStarSelection(0);
        $('mReviewCount').textContent = '0 / 200';
        $('mReviewFormTitle').textContent = 'Deja tu reseña:';
    } else {
        toast('Error al borrar', 'error');
    }
};

// ============================================================
// NOTIFICACIONES GLOBALES FLOTANTES
// ============================================================
let activityNotifsContainer = null;
window.addEventListener('fb-ready', () => {
    if (!window.fb || !window.fb.listenActivityNotifications) return;
    
    activityNotifsContainer = document.createElement('div');
    activityNotifsContainer.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(activityNotifsContainer);

    window.fb.listenActivityNotifications((notif) => {
        showActivityNotification(notif);
    });
});

function showActivityNotification(notif) {
    if (!activityNotifsContainer) return;
    
    const el = document.createElement('div');
    const isMobile = window.innerWidth <= 768;
    
    el.style.cssText = `
        background: var(--panel-strong);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border);
        padding: 12px 16px;
        border-radius: 12px;
        color: var(--text);
        font-size: .8rem;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
        opacity: 0;
        max-width: ${isMobile ? '320px' : '380px'};
    `;

    let iconHtml = '';
    let actionText = '';
    
    if (notif.actionType === 'buy') {
        iconHtml = '<div style="width:32px;height:32px;border-radius:50%;background:rgba(255,181,71,.15);color:var(--amber);display:grid;place-items:center;font-size:1rem;"><i class="fas fa-shopping-cart"></i></div>';
        actionText = `acaba de adquirir <strong style="color:var(--amber);">${esc(notif.productName)}</strong>`;
    } else if (notif.actionType === 'download') {
        iconHtml = '<div style="width:32px;height:32px;border-radius:50%;background:rgba(79,216,255,.15);color:var(--cyan);display:grid;place-items:center;font-size:1rem;"><i class="fas fa-download"></i></div>';
        actionText = `descargó <strong style="color:var(--cyan);">${esc(notif.productName)}</strong>`;
    } else if (notif.actionType === 'review') {
        iconHtml = '<div style="width:32px;height:32px;border-radius:50%;background:rgba(216,79,255,.15);color:#d84fff;display:grid;place-items:center;font-size:1rem;"><i class="fas fa-star"></i></div>';
        actionText = `dejó una reseña en <strong>${esc(notif.productName)}</strong>`;
    }

    el.innerHTML = `
        ${iconHtml}
        <div style="line-height:1.4;">
            <div style="font-weight:700;">${esc(notif.username)}</div>
            <div style="color:var(--text-dim);font-size:.75rem;">${actionText}</div>
        </div>
    `;
    
    activityNotifsContainer.appendChild(el);
    
    // Trigger animation
    requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
    });
    
    setTimeout(() => {
        el.style.transform = 'translateX(120%)';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 5000);
}

// Modificar los botones de pago/descarga para emitir notificaciones
const originalDownloadClick = function(currentProd) {
    if (!currentUser) return;
    if (window.fb && window.fb.addActivityNotification) {
        window.fb.addActivityNotification(currentUser.uid, currentUser.username, 'download', currentProd.name, currentProd.id);
    }
};

const originalPayClick = function(currentProd) {
    if (!currentUser) return;
    if (window.fb && window.fb.addActivityNotification) {
        window.fb.addActivityNotification(currentUser.uid, currentUser.username, 'buy', currentProd.name, currentProd.id);
    }
};

window.openPostCreateModal = function() {
    if (!currentUser) { openAuthModal(); return; }
    document.getElementById('postCreateOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.createNewPost = async function() {
    const title = document.getElementById('postTitle').value;
    const desc = document.getElementById('postDesc').value;
    if (!title.trim() || !desc.trim()) { toast('Completa título y descripción', 'error'); return; }
    
    let image = '';
    if (currentImgTab === 'url') { 
        image = document.getElementById('postImage').value.trim(); 
    } else if (pendingImageData) { 
        image = pendingImageData; 
    }
    
    const btn = document.querySelector('#postCreateOverlay .btn-solid.btn-block');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    
    await addPost(title, desc, image);
    
    document.getElementById('postTitle').value = '';
    document.getElementById('postDesc').value = '';
    document.getElementById('postImage').value = '';
    clearImagePreview();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar en la comunidad';
    closeOverlay('postCreateOverlay');
    if (window.loadForo) window.loadForo();
};

let currentOpenPostId = null;
let postCommentsUnsubscribe = null;
let cachedPosts = [];

// Envolver getPosts para cachear resultados, pero de forma segura
function wrapGetPosts() {
    if (!window.fb || window.fb._getPostsWrapped) return;
    const originalGetPosts = window.fb.getPosts;
    window.fb.getPosts = async function() {
        const res = await originalGetPosts();
        if (res.success) cachedPosts = res.data;
        return res;
    };
    window.fb._getPostsWrapped = true;
}

// Llamar cuando Firebase esté listo
if (window.fbReady) {
    wrapGetPosts();
} else {
    window.addEventListener('fb-ready', wrapGetPosts, { once: true });
}

window.openPostDetail = function(postId) {
    const post = cachedPosts.find(p => p.id === postId);
    if(!post) return;
    
    currentOpenPostId = postId;
    document.getElementById('postDetailOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    
    const content = document.getElementById('postDetailContent');
    const imgHtml = post.image ? `<img src="${esc(post.image)}" style="width:100%;max-height:400px;object-fit:contain;border-radius:12px;margin-bottom:20px;background:#000;">` : '';
    
    content.innerHTML = `
        ${imgHtml}
        <h2 style="font-family:var(--font-display);font-size:1.8rem;margin-bottom:12px;">${esc(post.title)}</h2>
        <div style="color:var(--text-dim);font-size:.9rem;margin-bottom:20px;display:flex;gap:15px;">
            <span><i class="fas fa-user"></i> ${esc(post.author)}</span>
            <span><i class="fas fa-calendar"></i> ${new Date(post.date).toLocaleDateString()}</span>
        </div>
        <p style="white-space:pre-wrap;line-height:1.6;color:var(--text);font-size:1.05rem;">${esc(post.desc)}</p>
    `;
    
    if (postCommentsUnsubscribe) postCommentsUnsubscribe();
    if (window.fb && window.fb.listenPostComments) {
        postCommentsUnsubscribe = window.fb.listenPostComments(postId, (comments) => {
            renderPostComments(comments);
        });
    }
};

function renderPostComments(comments) {
    const list = document.getElementById('postCommentsList');
    if (comments.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-faint);padding:10px;">Sé el primero en comentar.</div>';
        return;
    }
    list.innerHTML = comments.map(c => {
        const canDelete = currentUser && (c.userId === currentUser.uid || currentUser.isAdmin);
        return `
            <div style="background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px;position:relative;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    ${c.avatar ? `<img src="${esc(c.avatar)}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">` : `<div style="width:30px;height:30px;border-radius:50%;background:var(--cyan-dim);color:var(--cyan);display:grid;place-items:center;font-weight:bold;">${c.username.charAt(0).toUpperCase()}</div>`}
                    <div>
                        <div style="font-weight:600;font-size:.9rem;">${esc(c.username)}</div>
                        <div style="font-size:.7rem;color:var(--text-faint);">${new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                </div>
                <p style="font-size:.95rem;line-height:1.5;">${esc(c.text)}</p>
                ${canDelete ? `<button onclick="deletePostCommentUi('${c.id}')" style="position:absolute;top:12px;right:12px;background:none;border:none;color:var(--danger);cursor:pointer;"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
    }).join('');
}

window.submitPostComment = async function() {
    if (!currentUser) { openAuthModal(); return; }
    if (!currentOpenPostId) return;
    const inp = document.getElementById('postCommentText');
    const text = inp.value.trim();
    if (!text) return;
    
    const btn = document.getElementById('postCommentSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    if (window.fb && window.fb.addPostComment) {
        // ✅ Obtener avatar actual
        let userAvatar = '';
        const profRes = await window.fb.getUserProfile(currentUser.uid);
        if (profRes.success && profRes.data.avatar) userAvatar = profRes.data.avatar;

        await window.fb.addPostComment(currentOpenPostId, text, currentUser.uid, currentUser.username, userAvatar);
        inp.value = '';
    }
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Comentar';
};

window.deletePostCommentUi = async function(id) {
    if (!currentUser) return;
    if (confirm('¿Seguro que deseas borrar este comentario?')) {
        if (window.fb && window.fb.deletePostComment) {
            const res = await window.fb.deletePostComment(id, currentUser.uid);
            if (!res.success) toast('Error al borrar', 'error');
        }
    }
};
// ============================================================
// SELECTOR DE PAÍS ESTILO BOTÓN
// ============================================================

function initPhoneSelector() {
    const phoneCodeBtn = document.getElementById('phoneCodeBtn');
    const phoneCodeDropdown = document.getElementById('phoneCodeDropdown');
    const selectedPhoneCode = document.getElementById('selectedPhoneCode');

    if (!phoneCodeBtn) return;

    // Abrir/cerrar dropdown
    phoneCodeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = phoneCodeDropdown.style.display === 'block';
        phoneCodeDropdown.style.display = isOpen ? 'none' : 'block';
        
        // Cerrar otros dropdowns
        document.querySelectorAll('.phone-code-dropdown').forEach(el => {
            if (el !== phoneCodeDropdown) el.style.display = 'none';
        });
    });

    // Seleccionar código de país
    document.querySelectorAll('.phone-code-option').forEach(option => {
        option.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const text = this.textContent.trim();
            selectedPhoneCode.textContent = text;
            phoneCodeDropdown.style.display = 'none';
            
            // Guardar el código en el input
            const phoneInput = document.getElementById('regPhone');
            if (phoneInput) {
                phoneInput.dataset.countryCode = code;
            }
        });
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (phoneCodeBtn && !phoneCodeBtn.contains(e.target) && 
            phoneCodeDropdown && !phoneCodeDropdown.contains(e.target)) {
            phoneCodeDropdown.style.display = 'none';
        }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && phoneCodeDropdown) {
            phoneCodeDropdown.style.display = 'none';
        }
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhoneSelector);
} else {
    initPhoneSelector();
}
// ============================================================
// CHAT FUNCIONALIDAD COMPLETA
// ============================================================

let currentChatUser = null; // Usuario con el que se está chateando
let chatMessagesUnsubscribe = null;
let userChatsUnsubscribe = null;
let chatUnreadCount = 0;

// Mostrar/Ocultar panel de chat
window.toggleChatPanel = function() {
    const panel = document.getElementById('chatPanel');
    const isOpen = panel.classList.contains('open');
    
    if (!isOpen && !currentUser) {
        toast('Inicia sesión para usar el chat', 'error');
        return;
    }
    
    if (!isOpen) {
        panel.classList.add('open');
        const badge = document.getElementById('chatUnread');
        badge.style.display = 'none';
        badge.textContent = '0';
        chatUnreadCount = 0;
        loadUserChats();
    } else {
        panel.classList.remove('open');
        if (chatMessagesUnsubscribe) chatMessagesUnsubscribe();
        if (userChatsUnsubscribe) userChatsUnsubscribe();
        document.getElementById('chatActiveView').style.display = 'none';
        document.getElementById('chatListView').style.display = 'block';
        document.getElementById('chatBackBtn').style.display = 'none';
    }
};

async function loadUserChats() {
    if (!currentUser || !window.fb || !window.fb.listenUserChats) return;
    
    const listView = document.getElementById('chatListView');
    listView.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-dim);"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    if (userChatsUnsubscribe) userChatsUnsubscribe();
    
    try {
        userChatsUnsubscribe = window.fb.listenUserChats(currentUser.uid, async (chats) => {
            if (!chats || chats.length === 0) {
                listView.innerHTML = `
                    <div style="text-align:center;padding:40px 20px;color:var(--text-faint);">
                        <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>
                        <p style="font-size:.85rem;">No tienes conversaciones aún</p>
                        <p style="font-size:.75rem;margin-top:4px;">Busca a alguien arriba para empezar</p>
                    </div>
                `;
                return;
            }
            
            try {
                let html = '';
                let globalUnread = 0;
                
                for (const chat of chats) {
                    if (!chat.participantIds) continue;
                    const otherId = chat.participantIds.find(id => id !== currentUser.uid);
                    if (!otherId) continue;
                    
                    // Obtener perfil completo del otro usuario
                    const userResult = await window.fb.getUserById(otherId);
                    const userData = userResult.success ? userResult.data : null;
                    if (!userData) continue;
                    
                    const avatarLetter = userData.username ? userData.username.charAt(0).toUpperCase() : '?';
                    const lastMsg = chat.lastMessage || 'Sin mensajes';
                    const lastTime = chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
                    
                    // --- Efecto de nombre y Nexus+ ---
                    const nameEffect = userData.nameEffect || 'none';
                    const effectColor = userData.effectColor || '';
                    const isNexusPlus = !!(userData.nexusPlus || userData.hasNexusPlus);
                    const gemHTML = isNexusPlus ? `<span style="color:var(--plus-gold-2);font-size:0.7rem;margin-left:4px;" title="Nexus+"><i class="fas fa-gem"></i></span>` : '';
                    
                    html += `
                        <div class="chat-list-item" onclick="openChatWith('${otherId}')">
                            <div class="chat-avatar">${avatarLetter}</div>
                            <div class="chat-info">
                                <div class="chat-name">
                                    <span class="uname uname-${nameEffect}" ${effectColor ? `style="--uname-color: ${effectColor};"` : ''}>
                                        ${esc(userData.username)}
                                    </span>
                                    ${gemHTML}
                                </div>
                                <div class="chat-last-msg">${esc(lastMsg)}</div>
                            </div>
                            <div class="chat-time">${lastTime}</div>
                        </div>
                    `;
                    
                    // Contar no leídos
                    if (chat.lastSenderId && chat.lastSenderId !== currentUser.uid) {
                        globalUnread++;
                    }
                }
                
                chatUnreadCount = globalUnread;
                const badge = document.getElementById('chatUnread');
                const panel = document.getElementById('chatPanel');
                if (chatUnreadCount > 0 && !panel.classList.contains('open')) {
                    badge.style.display = 'flex';
                    badge.textContent = chatUnreadCount > 9 ? '9+' : chatUnreadCount;
                } else {
                    badge.style.display = 'none';
                    badge.textContent = '0';
                }

                listView.innerHTML = html;
            } catch (e) {
                console.error("Error al cargar chats:", e);
                listView.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">Error al cargar chats: ' + e.message + '</div>';
            }
        });
    } catch (err) {
        console.error("Sync Error listenUserChats:", err);
        listView.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">Error fatal: ' + err.message + '</div>';
    }
}

// Buscar usuarios y mostrar resultados
window.searchChatUsers = function(term) {
    const resultsContainer = document.getElementById('chatSearchResults');
    if (!term.trim() || term.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    if (!window.fb || !window.fb.searchUsers) {
        resultsContainer.innerHTML = '<div style="padding:12px;color:var(--text-faint);text-align:center;">Error al buscar</div>';
        resultsContainer.style.display = 'block';
        return;
    }
    
    window.fb.searchUsers(term).then(result => {
        if (!result.success) {
            resultsContainer.innerHTML = '<div style="padding:12px;color:var(--text-faint);text-align:center;">Error al buscar</div>';
            resultsContainer.style.display = 'block';
            return;
        }
        
        const users = result.data.filter(u => u.id !== currentUser?.uid);
        
        if (users.length === 0) {
            resultsContainer.innerHTML = '<div style="padding:12px;color:var(--text-faint);text-align:center;">No se encontraron usuarios</div>';
        } else {
            resultsContainer.innerHTML = users.map(u => `
                <div class="chat-list-item" onclick="openChatWith('${u.id}')">
                    <div class="chat-avatar">${u.username ? u.username.charAt(0).toUpperCase() : '?'}</div>
                    <div class="chat-info">
                        <div class="chat-name">${esc(u.username)}</div>
                        <div class="chat-last-msg">${esc(u.email)}</div>
                    </div>
                </div>
            `).join('');
        }
        resultsContainer.style.display = 'block';
    });
};

// Abrir chat con un usuario específico
window.openChatWith = async function(userId) {
    if (!currentUser) { openAuthModal(); return; }
    if (userId === currentUser.uid) { toast('No puedes chatear contigo mismo', 'error'); return; }
    
    const userResult = await window.fb.getUserById(userId);
    if (!userResult.success) { toast('Usuario no encontrado', 'error'); return; }
    
    currentChatUser = userResult.data;
    const chatResult = await window.fb.getOrCreateChat(currentUser.uid, userId);
    if (!chatResult.success) { toast('Error al abrir chat', 'error'); return; }
    
    const chatId = chatResult.chatId;
    document.getElementById('chatBackBtn').style.display = 'flex';
    document.getElementById('chatListView').style.display = 'none';
    document.getElementById('chatSearchResults').style.display = 'none';
    document.getElementById('chatActiveView').style.display = 'flex';
    
    // ✅ CORREGIDO: El badge no es necesario aquí, así que lo omitimos
    document.getElementById('chatHeaderTitle').innerHTML = `
        <i class="fas fa-user" style="color:var(--cyan);"></i>
        <span style="font-weight:700;font-family:var(--font-display);">${esc(currentChatUser.username)}</span>
    `;
    
    if (chatMessagesUnsubscribe) chatMessagesUnsubscribe();
    if (window.fb.listenChatMessages) {
        chatMessagesUnsubscribe = window.fb.listenChatMessages(chatId, (messages) => {
            renderChatMessages(messages);
        });
    }
};

// Renderizar mensajes en el chat activo
function renderChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!messages || messages.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-faint);font-size:.85rem;">No hay mensajes aún. ¡Envía el primero!</div>';
        return;
    }
    
    container.innerHTML = messages.map(msg => {
        const isSent = msg.senderId === currentUser.uid;
        const senderName = isSent ? 'Tú' : msg.senderName || 'Usuario';
        const time = new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        
        // --- Obtener datos del perfil del remitente ---
        let nameEffect = 'none';
        let effectColor = '';
        let isNexusPlus = false;
        if (!isSent && msg.senderId) {
            if (currentChatUser && currentChatUser.id === msg.senderId) {
                nameEffect = currentChatUser.nameEffect || 'none';
                effectColor = currentChatUser.effectColor || '';
                isNexusPlus = !!(currentChatUser.nexusPlus || currentChatUser.hasNexusPlus);
            } else {
                nameEffect = 'none';
                effectColor = '';
                isNexusPlus = false;
            }
        }
        
        // ✅ AQUÍ AGREGAS EL FRAGMENTO
        const senderIsNexusPlus = isSent ? (currentUser.hasNexusPlus || false) : isNexusPlus;
        const senderGem = senderIsNexusPlus ? `<span class="nexus-gem" style="margin-left:4px;font-size:0.7rem;color:var(--plus-gold-2);"><i class="fas fa-gem"></i></span>` : '';
        
        const gemHTML = (!isSent && isNexusPlus) ? `<span class="nexus-gem"><i class="fas fa-gem"></i></span>` : '';
        const effectClass = isSent ? '' : `uname uname-${nameEffect}`;
        const colorStyle = (effectColor && !isSent) ? `style="--uname-color: ${effectColor};"` : '';
        
        return `
            <div class="chat-msg ${isSent ? 'sent' : 'received'}">
                ${!isSent ? `<div class="msg-sender"><span class="${effectClass}" ${colorStyle}>${esc(senderName)}</span>${gemHTML}</div>` : ''}
                ${esc(msg.text)} ${senderGem}  <!-- ← Aquí se muestra la gema si eres Nexus+ -->
                <span class="msg-time">${time}</span>
            </div>
        `;
    }).join('');
    
    container.scrollTop = container.scrollHeight;
}

// Enviar mensaje
window.sendChatMsg = async function() {
    if (!currentUser || !currentChatUser) return;
    
    const input = document.getElementById('chatMsgInput');
    const text = input.value.trim();
    if (!text) return;
    
    // Obtener chat ID
    const chatResult = await window.fb.getOrCreateChat(currentUser.uid, currentChatUser.id);
    if (!chatResult.success) { toast('Error al enviar mensaje', 'error'); return; }
    
    const result = await window.fb.sendChatMessage(
        chatResult.chatId,
        currentUser.uid,
        currentUser.username,
        text,
        null,
        currentUser.hasNexusPlus || false
    );
    
    if (result.success) {
        input.value = '';
    } else {
        toast('Error al enviar mensaje: ' + result.error, 'error');
    }
};

// Volver a la lista de chats
window.showChatList = function() {
    if (chatMessagesUnsubscribe) chatMessagesUnsubscribe();
    document.getElementById('chatActiveView').style.display = 'none';
    document.getElementById('chatListView').style.display = 'block';
    document.getElementById('chatBackBtn').style.display = 'none';
    
    // ✅ CORREGIDO: Ahora incluye el badge de nuevo
    document.getElementById('chatHeaderTitle').innerHTML = `
        <i class="fas fa-comments" style="color:var(--cyan);"></i>
        <span style="font-weight:700;font-family:var(--font-display);">Mensajes</span>
        <span id="chatUnread" style="display:none;background:var(--danger);color:#fff;font-size:0.6rem;font-weight:700;padding:2px 8px;border-radius:20px;min-width:20px;text-align:center;">0</span>
    `;
    
    loadUserChats();
};
function injectProductAnimStyles() {
    if (document.getElementById('prodCardAnimStyle')) return;
    const style = document.createElement('style');
    style.id = 'prodCardAnimStyle';
    style.textContent = `
        .prod-card-anim { animation: prodCardIn .5s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes prodCardIn { from { opacity:0; transform:translateY(26px) scale(.95);} to {opacity:1; transform:translateY(0) scale(1);} }
        #productsShowMoreWrap .btn:active { transform: scale(.96); }
    `;
    document.head.appendChild(style);
}
(function() {
    const btn = document.getElementById('currencyBtn');
    const dropdown = document.getElementById('currencyDropdown');
    const hiddenSelect = document.getElementById('currencySelector');
    const label = document.getElementById('selectedCurrencyLabel');

    if (!btn || !dropdown || !hiddenSelect) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll('.currency-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const code = opt.dataset.code;
            const flag = opt.dataset.flag;

            hiddenSelect.value = code;
            hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));

            label.textContent = `${flag} ${code}`;
            document.querySelectorAll('.currency-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            dropdown.style.display = 'none';
        });
    });

    document.addEventListener('click', () => { dropdown.style.display = 'none'; });
})();

// ============================================================
// APPS (BOOK UI & ADMIN)
// ============================================================

let appsList = [];
let currentAppPage = 0;

window.saveAdminApp = async function() {
    if (!currentUser || !currentUser.isAdmin) {
        toast('No tienes permisos de administrador', 'error');
        return;
    }
    const name = document.getElementById('adminAppName').value.trim();
    const version = document.getElementById('adminAppVersion').value.trim();
    const desc = document.getElementById('adminAppDesc').value.trim();
    const added = document.getElementById('adminAppAdded').value.trim();
    const fixed = document.getElementById('adminAppFixed').value.trim();
    const image = document.getElementById('adminAppImage') ? document.getElementById('adminAppImage').value.trim() : '';
    const color = document.getElementById('adminAppColor') ? document.getElementById('adminAppColor').value : '#00ffe5';

    if (!name || !desc || !version) {
        toast('El nombre, la versión y la descripción son obligatorios', 'error');
        return;
    }

    try {
        const newUpdate = { 
            name, 
            version, 
            desc, 
            added, 
            fixed, 
            image, 
            color, 
            likes: [], 
            dislikes: [], 
            createdAt: Date.now() 
        };
        const res = await window.fb.addAppUpdate(newUpdate);
        if(!res.success) throw new Error(res.error);
        toast('Actualización publicada correctamente', 'success');
        document.getElementById('adminAppName').value = '';
        document.getElementById('adminAppVersion').value = '';
        document.getElementById('adminAppDesc').value = '';
        document.getElementById('adminAppAdded').value = '';
        document.getElementById('adminAppFixed').value = '';
        if (document.getElementById('adminAppImage')) document.getElementById('adminAppImage').value = '';
        if (document.getElementById('adminAppColor')) document.getElementById('adminAppColor').value = '#00ffe5';
        window.loadAppsFromFirebase();
    } catch (e) {
        console.error(e);
        toast('Error al publicar la actualización', 'error');
    }
};

window.deleteAdminApp = async function(id) {
    if (!currentUser || !currentUser.isAdmin) {
        toast('No tienes permisos de administrador', 'error');
        return;
    }
    if (!confirm('¿Seguro que deseas eliminar esta actualización?')) return;
    try {
        const res = await window.fb.deleteAppUpdate(id);
        if(!res.success) throw new Error(res.error);
        toast('Actualización eliminada', 'success');
        window.loadAppsFromFirebase();
    } catch (e) {
        console.error(e);
        toast('Error al eliminar', 'error');
    }
};

window.loadAppsFromFirebase = async function() {
    try {
        const res = await window.fb.getAppUpdates();
        if(!res.success) throw new Error(res.error);
        appsList = res.data || [];
        renderAppsAdmin();
        renderAppsBook();
    } catch (e) {
        console.error("Error cargando actualizaciones:", e);
    }
}

function renderAppsAdmin() {
    const list = document.getElementById('adminAppsList');
    if (!list) return;
    if (appsList.length === 0) {
        list.innerHTML = '<div style="color:var(--text-faint);text-align:center;padding:20px;">No hay actualizaciones publicadas</div>';
        return;
    }
    list.innerHTML = appsList.map(a => `
        <div style="background:var(--panel-strong);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;align-items:center;gap:12px;">
            <div style="flex:1;">
                <div style="font-weight:700; color:var(--cyan);">${a.name} <span style="color:var(--text-dim);font-weight:normal;font-size:0.8rem;">${a.version}</span></div>
                <div style="font-size:.75rem;color:var(--text-dim);">${a.desc.substring(0,60)}...</div>
            </div>
            <button onclick="deleteAdminApp('${a.id}')" class="btn btn-ghost" style="color:var(--danger);padding:6px;"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function renderAppsBook() {
    const empty = document.getElementById('appsBookEmpty');
    const slider = document.getElementById('appsBookSlider');
    const controls = document.getElementById('appsBookControls');
    
    if (appsList.length === 0) {
        empty.style.display = 'block';
        empty.textContent = 'No hay actualizaciones recientes.';
        slider.style.display = 'none';
        controls.style.display = 'none';
        return;
    }
    
    empty.style.display = 'none';
    slider.style.display = 'block';
    controls.style.display = 'flex';
    
    slider.innerHTML = appsList.map((a, i) => {
        const addedList = (a.added||'').split('\n').filter(l=>l.trim()!=='').map(l=>`<li style="margin-bottom:4px;">${l}</li>`).join('');
        const fixedList = (a.fixed||'').split('\n').filter(l=>l.trim()!=='').map(l=>`<li style="margin-bottom:4px;">${l}</li>`).join('');
        const themeColor = a.color || '#00ffe5';
        
        const ul = currentUser && (a.likes || []).includes(currentUser.uid);
        const ud = currentUser && (a.dislikes || []).includes(currentUser.uid);

        return `
        <div class="book-page ${i===0?'active':(i<currentAppPage?'prev':'next')}" id="appPage-${i}" style="text-align:left; overflow-y:auto; padding:0; background:var(--panel);">
            ${a.image ? `
            <div style="position:relative; width:100%; height:180px; background:url('${a.image}') center/cover no-repeat; border-radius:10px 10px 0 0;">
                <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background:linear-gradient(to top, var(--panel), transparent);"></div>
            </div>` : ''}
            <div style="padding: 24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px; margin-bottom:15px;">
                    <h3 style="margin:0; color:${themeColor}; font-family:var(--font-display); font-size:1.4rem; text-shadow:0 0 10px ${themeColor}40;">${a.name}</h3>
                    <span style="background:${themeColor}15; color:${themeColor}; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:800; border:1px solid ${themeColor}30;">${a.version}</span>
                </div>
                
                <p style="color:var(--text-dim); font-size:0.95rem; margin-bottom:20px; line-height:1.5;">${a.desc}</p>
                
                ${addedList ? `
                <div style="background:rgba(76, 175, 80, 0.05); border-left:3px solid #4caf50; padding:12px; border-radius:4px; margin-bottom:12px;">
                    <h4 style="color:#4caf50; font-size:0.85rem; margin-bottom:8px; margin-top:0; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-plus-circle"></i> Novedades</h4>
                    <ul style="color:var(--text); font-size:0.85rem; padding-left:20px; margin:0;">${addedList}</ul>
                </div>` : ''}
                
                ${fixedList ? `
                <div style="background:rgba(255, 152, 0, 0.05); border-left:3px solid var(--amber); padding:12px; border-radius:4px; margin-bottom:20px;">
                    <h4 style="color:var(--amber); font-size:0.85rem; margin-bottom:8px; margin-top:0; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-bug"></i> Correcciones</h4>
                    <ul style="color:var(--text); font-size:0.85rem; padding-left:20px; margin:0;">${fixedList}</ul>
                </div>` : ''}

                <div style="display:flex; gap:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:15px; margin-top:10px;">
                    <button class="app-like-btn" onclick="handleAppLike('${a.id}')" style="flex:1; background:${ul?'var(--cyan)':'var(--panel-light)'}; color:${ul?'var(--bg)':'var(--text)'}; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="fas fa-thumbs-up"></i> ${(a.likes||[]).length}
                    </button>
                    <button class="app-dislike-btn" onclick="handleAppDislike('${a.id}')" style="flex:1; background:${ud?'var(--danger)':'var(--panel-light)'}; color:${ud?'var(--bg)':'var(--text)'}; border:none; padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="fas fa-thumbs-down"></i> ${(a.dislikes||[]).length}
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    currentAppPage = 0;
    updateAppsBookUI();
}

window.handleAppLike = async function(id) {
    if (!currentUser) { openAuthModal(); return; }
    if (!window.fb || !window.fb.updateAppUpdate) { toast('Firebase no disponible', 'error'); return; }
    const app = appsList.find(a => a.id === id);
    if (!app) return;
    const likes = app.likes || [];
    const dislikes = app.dislikes || [];
    if (likes.includes(currentUser.uid)) {
        await window.fb.updateAppUpdate(id, 'likes', currentUser.uid, 'arrayRemove');
    } else {
        if (dislikes.includes(currentUser.uid)) {
            await window.fb.updateAppUpdate(id, 'dislikes', currentUser.uid, 'arrayRemove');
        }
        await window.fb.updateAppUpdate(id, 'likes', currentUser.uid, 'arrayUnion');
    }
    await window.loadAppsFromFirebase();
};

window.handleAppDislike = async function(id) {
    if (!currentUser) { openAuthModal(); return; }
    if (!window.fb || !window.fb.updateAppUpdate) { toast('Firebase no disponible', 'error'); return; }
    const app = appsList.find(a => a.id === id);
    if (!app) return;
    const likes = app.likes || [];
    const dislikes = app.dislikes || [];
    if (dislikes.includes(currentUser.uid)) {
        await window.fb.updateAppUpdate(id, 'dislikes', currentUser.uid, 'arrayRemove');
    } else {
        if (likes.includes(currentUser.uid)) {
            await window.fb.updateAppUpdate(id, 'likes', currentUser.uid, 'arrayRemove');
        }
        await window.fb.updateAppUpdate(id, 'dislikes', currentUser.uid, 'arrayUnion');
    }
    await window.loadAppsFromFirebase();
};

window.prevAppPage = function() {
    if (currentAppPage > 0) {
        document.getElementById(`appPage-${currentAppPage}`).className = 'book-page next';
        currentAppPage--;
        document.getElementById(`appPage-${currentAppPage}`).className = 'book-page active';
        updateAppsBookUI();
    }
};

window.nextAppPage = function() {
    if (currentAppPage < appsList.length - 1) {
        document.getElementById(`appPage-${currentAppPage}`).className = 'book-page prev';
        currentAppPage++;
        document.getElementById(`appPage-${currentAppPage}`).className = 'book-page active';
        updateAppsBookUI();
    }
};

function updateAppsBookUI() {
    document.getElementById('appPageIndicator').textContent = `${currentAppPage + 1} / ${appsList.length}`;
    document.getElementById('appPrevBtn').disabled = currentAppPage === 0;
    document.getElementById('appNextBtn').disabled = currentAppPage === appsList.length - 1;
    
    document.getElementById('appPrevBtn').style.opacity = currentAppPage === 0 ? '0.3' : '1';
    document.getElementById('appNextBtn').style.opacity = currentAppPage === appsList.length - 1 ? '0.3' : '1';
}

document.addEventListener('DOMContentLoaded', () => {
    const avatarInput = document.getElementById('avatarInput');
    const bannerInput = document.getElementById('bannerInput');
    
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type === 'image/gif' && currentUser && currentUser.hasNexusPlus) {
                if (file.size > 1024 * 1024) {
                    toast('El GIF debe ser menor a 1MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = evt => {
                    window._tempAvatar = evt.target.result;
                    const ac = document.getElementById('profileAvatarContent');
                    if (ac) {
                        ac.innerHTML = `<img src="${window._tempAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    }
                };
                reader.readAsDataURL(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const size = 300;
                    canvas.width = size; canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    
                    const ratio = Math.max(size / img.width, size / img.height);
                    const w = img.width * ratio;
                    const h = img.height * ratio;
                    const x = (size - w) / 2;
                    const y = (size - h) / 2;
                    
                    ctx.drawImage(img, x, y, w, h);
                    window._tempAvatar = canvas.toDataURL('image/jpeg', 0.85);
                    const ac = document.getElementById('profileAvatarContent');
                    if (ac) {
                        ac.innerHTML = `<img src="${window._tempAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
                    }
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (bannerInput) {
        bannerInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type === 'image/gif' && currentUser && currentUser.hasNexusPlus) {
                if (file.size > 1024 * 1024) {
                    toast('El GIF debe ser menor a 1MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = evt => {
                    window._tempBanner = evt.target.result;
                    const pv = document.getElementById('profileBannerPreview');
                    const pb = document.getElementById('profileBannerDisplay');
                    if (pv) pv.innerHTML = `<img src="${window._tempBanner}" style="width:100%;height:100%;object-fit:cover;">`;
                    if (pb) {
                        pb.innerHTML = '';
                        pb.style.background = `url(${window._tempBanner}) center/cover no-repeat`;
                    }
                };
                reader.readAsDataURL(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const width = 800;
                    const ratio = width / img.width;
                    const height = Math.min(img.height * ratio, 400); // Max height 400
                    
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    window._tempBanner = canvas.toDataURL('image/jpeg', 0.85);
                    const pv = document.getElementById('profileBannerPreview');
                    const pb = document.getElementById('profileBannerDisplay');
                    if (pv) pv.innerHTML = `<img src="${window._tempBanner}" style="width:100%;height:100%;object-fit:cover;">`;
                    if (pb) {
                        pb.innerHTML = '';
                        pb.style.background = `url(${window._tempBanner}) center/cover no-repeat`;
                    }
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
});

// NEXUS+ REQUESTS ADMIN LOGIC
let nexusRequestsBadgeUnsub = null;

window.loadAdminNexusRequests = async function() {
    try {
        if (!window.fb || !window.fb.listenNexusPlusRequests) {
            document.getElementById('adminNexusRequestsList').innerHTML = '<div style="color:var(--danger);padding:20px;text-align:center;">Error: listenNexusPlusRequests no está definido. Refresca la caché.</div>';
            console.error("listenNexusPlusRequests is undefined. window.fb:", window.fb);
            return;
        }
        if (nexusRequestsBadgeUnsub) {
            nexusRequestsBadgeUnsub();
        }
        
        nexusRequestsBadgeUnsub = window.fb.listenNexusPlusRequests((requests) => {
            renderAdminNexusRequests(requests);
        });
    } catch (error) {
        console.error("Error in loadAdminNexusRequests:", error);
        document.getElementById('adminNexusRequestsList').innerHTML = `<div style="color:var(--danger);padding:20px;text-align:center;">Excepción: ${error.message}</div>`;
    }
};

function renderAdminNexusRequests(requests) {
    const container = document.getElementById('adminNexusRequestsList');
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim)">No hay solicitudes</div>';
        return;
    }

    if (requests[0] && requests[0].error) {
        container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger)">Error: ${requests[0].error} <br><br> Por favor actualiza las reglas de Firestore en la consola.</div>`;
        return;
    }

    const statusBadge = (status) => {
        if (status === 'pending') return '<span style="background:var(--amber-dim);color:var(--amber);font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:6px;text-transform:uppercase;">⏳ Pendiente</span>';
        if (status === 'approved') return '<span style="background:rgba(61,220,151,.12);color:var(--success);font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:6px;text-transform:uppercase;">✅ Aprobada</span>';
        return '<span style="background:var(--danger-dim);color:var(--danger);font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:6px;text-transform:uppercase;">❌ Rechazada</span>';
    };

    container.innerHTML = requests.map(r => `
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;">
                <div>
                    <div style="font-weight:700;font-size:.92rem;">${esc(r.username)}</div>
                    <div style="font-size:.72rem;color:var(--text-faint);">${esc(r.email)} • ${new Date(r.requestedAt).toLocaleDateString()}</div>
                </div>
                ${statusBadge(r.status)}
            </div>
            ${r.status === 'pending' ? `
                <div style="display:flex;gap:8px;margin-top:12px;">
                    <button onclick="reviewNexusReq('${r.id}', true)" class="btn btn-solid btn-sm" style="flex:1;background:var(--success);color:#fff;border:none;"><i class="fas fa-check"></i> Aprobar</button>
                    <button onclick="reviewNexusReq('${r.id}', false)" class="btn btn-sm" style="flex:1;background:var(--danger-dim);color:var(--danger);border:none;"><i class="fas fa-times"></i> Rechazar</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

window.reviewNexusReq = async function(requestId, approve) {
    if (!currentUser || !currentUser.isAdmin) return;
    const result = await window.fb.reviewNexusPlusRequest(requestId, approve, currentUser.uid);
    if (result.success) {
        toast(approve ? 'Solicitud aprobada' : 'Solicitud rechazada', 'success');
    } else {
        toast('Error: ' + result.error, 'error');
    }
};
// ============================================================
// LIQUID DOCK
// ============================================================
function initLiquidDock() {
    $('dockHomeBtn').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    $('dockCreateBtn').onclick = () => {
        if (!currentUser) { openAuthModal(); return; }
        openPostCreateModal();
    };

    $('dockChatBtn').onclick = () => {
        if (!currentUser) { openAuthModal(); return; }
        toggleChatPanel();
    };

    $('dockProfileBtn').onclick = () => {
        currentUser ? (location.href = 'perfil.html') : openAuthModal();
    };
}

// Llama a esto al final de updateAuthUI(), para reflejar avatar/estado
function syncDockProfile() {
    const wrap = $('dockProfileContent');
    if (!wrap) return;
    if (currentUser) {
        // usa el mismo contenido que ya calculas para pna (profileNavAvatar)
        wrap.innerHTML = $('profileNavAvatar')?.innerHTML || currentUser.username[0].toUpperCase();
    } else {
        wrap.textContent = '?';
    }
}

initLiquidDock();
} // End of __nexusMain

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __nexusMain);
} else {
    __nexusMain();
}
