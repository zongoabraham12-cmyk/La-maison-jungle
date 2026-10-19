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
 * Calcule la clé de licence unique mathématiquement liée à un code machine (deviceId)
 */
export function generateLicenseKey(deviceId) {
    if (!deviceId) return '';
    const cleanId = deviceId.trim().toUpperCase();
    const combined = `${cleanId}:${SECRET_SALT}`;
    
    // Hachage déterministe
    let h1 = 0x811c9dc5;
    let h2 = 0x5bd1e995;
    for (let i = 0; i < combined.length; i++) {
        const c = combined.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 0x01000193);
        h2 = Math.imul(h2 ^ c, 0x5bd1e995);
    }
    
    const hex1 = Math.abs(h1).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    const hex2 = Math.abs(h2).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    
    return `KEY-${hex1}-${hex2}`;
}

/**
 * Vérifie si une clé saisie correspond au deviceId donné
 */
export function verifyLicenseKey(deviceId, enteredKey) {
    if (!deviceId || !enteredKey) return false;
    const expectedKey = generateLicenseKey(deviceId);
    return enteredKey.trim().toUpperCase() === expectedKey;
}
