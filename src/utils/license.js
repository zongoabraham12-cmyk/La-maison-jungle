// Utilitaires de licence et de signature machine pour VENTE PROS

const SECRET_SALT = "VENTEPROS_2026_MASTER_SECURITY_KEY";

/**
 * Récupère ou génère un ID unique propre à l'appareil de l'utilisateur
 */
export function getOrCreateDeviceId() {
    try {
        let deviceId = localStorage.getItem('app_device_id');
        if (!deviceId || !deviceId.startsWith('VP-')) {
            const p1 = Math.floor(0x1000 + Math.random() * 0xEFFF).toString(16).toUpperCase();
            const p2 = Math.floor(0x1000 + Math.random() * 0xEFFF).toString(16).toUpperCase();
            deviceId = `VP-${p1}-${p2}`;
            localStorage.setItem('app_device_id', deviceId);
        }
        return deviceId;
    } catch (e) {
        return 'VP-DEFAULT-DEV1';
    }
}

/**
 * Fonction interne de hachage mathématique déterministe
 */
function hashString(str) {
    let h1 = 0x811c9dc5;
    let h2 = 0x5bd1e995;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 0x01000193);
        h2 = Math.imul(h2 ^ c, 0x5bd1e995);
    }
    const hex1 = Math.abs(h1).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    const hex2 = Math.abs(h2).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    const sig4 = Math.abs(h1 ^ h2).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    return { hex1, hex2, sig: `${hex1}-${hex2}`, sig4 };
}

/**
 * Liste des clés déjà utilisées sur cet appareil pour éviter le rejouage
 */
export function getUsedLicenseKeys() {
    try {
        const saved = localStorage.getItem('used_license_keys');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

export function markLicenseKeyAsUsed(key) {
    try {
        const cleanKey = key.trim().toUpperCase();
        const keys = getUsedLicenseKeys();
        if (!keys.includes(cleanKey)) {
            keys.push(cleanKey);
            localStorage.setItem('used_license_keys', JSON.stringify(keys));
        }
    } catch (e) {
        console.error('Erreur markLicenseKeyAsUsed:', e);
    }
}

/**
 * Calcule la clé de licence unique mathématiquement liée au deviceId et au forfait choisi
 * @param {string} deviceId - ID de l'appareil (ex: VP-A1B2-C3D4)
 * @param {string} plan - '1M' (30 jours) | '3M' (90 jours) | 'LIFETIME' (À vie / admin uniquement)
 */
export function generateLicenseKey(deviceId, plan = '1M') {
    if (!deviceId) return '';
    const cleanId = deviceId.trim().toUpperCase();

    // Licence Définitive (À vie - Format historique préservé)
    if (plan === 'LIFETIME') {
        const h = hashString(`${cleanId}:${SECRET_SALT}`);
        return `KEY-${h.sig}`;
    }

    // Licences à durée (1 Mois ou 3 Mois) avec token aléatoire unique pour chaque renouvellement
    const token = Math.floor(0x1000 + Math.random() * 0xEFFF).toString(16).toUpperCase();
    const planTag = plan === '3M' ? '3M' : '1M';
    const h = hashString(`${cleanId}:${planTag}:${token}:${SECRET_SALT}`);

    return `KEY-${planTag}-${token}-${h.sig4}`;
}

/**
 * Vérifie si une clé saisie correspond au deviceId donné et renvoie les détails de l'offre
 * @returns {{ valid: boolean, type?: string, days?: number, error?: string }}
 */
export function verifyLicenseKey(deviceId, enteredKey) {
    if (!deviceId || !enteredKey) {
        return { valid: false, error: "Veuillez saisir une clé valide." };
    }

    const cleanId = deviceId.trim().toUpperCase();
    const cleanKey = enteredKey.trim().toUpperCase();

    // Vérification anti-rejouage (sauf pour la clé à vie déjà activée)
    const usedKeys = getUsedLicenseKeys();
    if (usedKeys.includes(cleanKey)) {
        return { valid: false, error: "Cette clé de réabonnement a déjà été activée sur cet appareil." };
    }

    // 1. Vérification Licence Définitive / À vie (Ancien format KEY-XXXX-YYYY ou KEY-LIFE-...)
    const lifeH = hashString(`${cleanId}:${SECRET_SALT}`);
    if (cleanKey === `KEY-${lifeH.sig}` || cleanKey === `KEY-LIFE-${lifeH.sig}`) {
        return { valid: true, type: 'LIFETIME', days: 0 };
    }

    // 2. Vérification Clé 1 Mois (Format : KEY-1M-TOKEN-SIG)
    if (cleanKey.startsWith('KEY-1M-')) {
        const parts = cleanKey.split('-');
        if (parts.length === 4) {
            const token = parts[2];
            const sig = parts[3];
            const expectedH = hashString(`${cleanId}:1M:${token}:${SECRET_SALT}`);
            if (expectedH.sig4 === sig) {
                markLicenseKeyAsUsed(cleanKey);
                return { valid: true, type: '1M', days: 30 };
            }
        }
    }

    // 3. Vérification Clé 3 Mois (Format : KEY-3M-TOKEN-SIG)
    if (cleanKey.startsWith('KEY-3M-')) {
        const parts = cleanKey.split('-');
        if (parts.length === 4) {
            const token = parts[2];
            const sig = parts[3];
            const expectedH = hashString(`${cleanId}:3M:${token}:${SECRET_SALT}`);
            if (expectedH.sig4 === sig) {
                markLicenseKeyAsUsed(cleanKey);
                return { valid: true, type: '3M', days: 90 };
            }
        }
    }

    return { valid: false, error: "Clé invalide pour cet appareil. Vérifiez le code machine ou contactez le support." };
}
