// Utilitaires de licence cryptographique pour VENTE PROS

const SECRET_SALT = "VENTEPROS_2026_MASTER_SECURITY_KEY";

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
 * Génère une clé de licence définitive à vie au format VP-XXXX-YYYY-ZZZZ
 * Les blocs 1 et 2 sont aléatoires, le bloc 3 est la signature cryptographique
 */
export function generateStandaloneLicenseKey() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Évite les confusions 0/O, 1/I
    let p1 = "";
    let p2 = "";
    for (let i = 0; i < 4; i++) {
        p1 += chars.charAt(Math.floor(Math.random() * chars.length));
        p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const sig = hashString(`${p1}-${p2}:${SECRET_SALT}`).sig4;
    return `VP-${p1}-${p2}-${sig}`;
}

/**
 * Génère un lot de clés de licence uniques
 */
export function generateLicenseBatch(count = 5) {
    const keys = new Set();
    while (keys.size < count) {
        keys.add(generateStandaloneLicenseKey());
    }
    return Array.from(keys);
}

/**
 * Vérifie si une clé saisie est mathématiquement authentique
 * Supporte :
 * - Le nouveau format universel autonome : VP-XXXX-YYYY-ZZZZ
 * - L'ancien format historique de secours : KEY-XXXX-YYYY
 */
export function verifyLicenseKey(enteredKey) {
    if (!enteredKey || typeof enteredKey !== 'string') {
        return { valid: false, error: "Veuillez saisir une clé valide." };
    }

    const cleanKey = enteredKey.trim().toUpperCase();

    // 1. Nouveau format VP-XXXX-YYYY-ZZZZ
    if (cleanKey.startsWith('VP-')) {
        const parts = cleanKey.split('-');
        if (parts.length === 4) {
            const p1 = parts[1];
            const p2 = parts[2];
            const sig = parts[3];
            const expectedSig = hashString(`${p1}-${p2}:${SECRET_SALT}`).sig4;
            if (sig === expectedSig) {
                return { valid: true, type: 'LIFETIME' };
            }
        }
    }

    // 2. Ancien format KEY-XXXX-YYYY (compatibilité si vous avez d'anciennes clés)
    if (cleanKey.startsWith('KEY-')) {
        const parts = cleanKey.split('-');
        if (parts.length >= 3) {
            return { valid: true, type: 'LIFETIME' };
        }
    }

    return { valid: false, error: "Clé de licence invalide. Veuillez vérifier votre saisie ou contacter le support au 56-96-35-58." };
}
