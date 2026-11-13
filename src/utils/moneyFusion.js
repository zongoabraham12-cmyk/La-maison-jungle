// Gestion de la licence définitive et de la période d'essai de 7 jours

export const CONTACT_CONFIG = {
    phone: "56-96-35-58",
    orangePhone: "07 56 96 35 58",
    waNumber: "2250756963558"
};

/**
 * Récupère le statut complet de la licence / essai
 */
export function getSubscriptionStatus() {
    try {
        const isLifetime = localStorage.getItem('app_activated') === 'true'
        
        // Période d'essai gratuite de 7 jours
        let trialStart = localStorage.getItem('trial_start')
        if (!trialStart) {
            trialStart = new Date().toISOString()
            localStorage.setItem('trial_start', trialStart)
        }
        const startDate = new Date(trialStart)
        const diffTrial = new Date() - startDate
        const diffTrialDays = Math.floor(diffTrial / (1000 * 60 * 60 * 24))
        const trialDaysLeft = Math.max(0, 7 - diffTrialDays)
        
        const isAccessGranted = isLifetime || trialDaysLeft > 0
        const isExpired = !isAccessGranted
        
        return {
            isLifetime,
            trialDaysLeft,
            isAccessGranted,
            isExpired,
            planLabel: isLifetime ? 'Licence Définitive (À vie)' : `Essai Gratuit (${trialDaysLeft}j)`
        }
    } catch (e) {
        console.error('Erreur getSubscriptionStatus:', e)
        return {
            isLifetime: false,
            trialDaysLeft: 7,
            isAccessGranted: true,
            isExpired: false,
            planLabel: 'Essai Gratuit'
        }
    }
}
