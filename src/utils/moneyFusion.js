// Module d'intégration Money Fusion et gestion de l'abonnement mensuel pour VENTE PROS
import { getOrCreateDeviceId } from './license'

export const MONEY_FUSION_CONFIG = {
    solutionName: 'VENTE_PROS',
    endpointUrl: 'https://pay.moneyfusion.net/VENTE_PROS/bae9e3dfc8a7bd6b/pay/',
    monthlyPrice: 5000,
    currency: 'FCFA',
    returnUrl: 'https://melodic-pie-21bdc4.netlify.app'
}

/**
 * Récupère le statut complet de la licence / abonnement
 */
export function getSubscriptionStatus() {
    try {
        const deviceId = getOrCreateDeviceId()
        const isLifetime = localStorage.getItem('app_activated') === 'true'
        
        // Vérification de l'abonnement mensuel
        const subExpiresStr = localStorage.getItem('subscription_expires_at')
        let isSubscribed = false
        let subDaysLeft = 0
        let subExpiryDate = null
        
        if (subExpiresStr) {
            const expDate = new Date(subExpiresStr)
            const now = new Date()
            const diffTime = expDate - now
            subDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            if (subDaysLeft > 0) {
                isSubscribed = true
                subExpiryDate = expDate.toLocaleDateString('fr-FR')
            }
        }
        
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
        
        const isAccessGranted = isLifetime || isSubscribed || trialDaysLeft > 0
        const isExpired = !isAccessGranted
        
        return {
            deviceId,
            isLifetime,
            isSubscribed,
            subDaysLeft,
            subExpiryDate,
            trialDaysLeft,
            isAccessGranted,
            isExpired,
            planLabel: isLifetime 
                ? 'Licence Définitive' 
                : isSubscribed 
                    ? `Abonnement Actif (${subDaysLeft}j)` 
                    : trialDaysLeft > 0 
                        ? `Essai Gratuit (${trialDaysLeft}j)` 
                        : 'Abonnement Expiré'
        }
    } catch (e) {
        console.error('Erreur getSubscriptionStatus:', e)
        return {
            deviceId: 'VP-DEFAULT-DEV1',
            isLifetime: false,
            isSubscribed: false,
            subDaysLeft: 0,
            trialDaysLeft: 7,
            isAccessGranted: true,
            isExpired: false,
            planLabel: 'Essai Gratuit'
        }
    }
}

/**
 * Prolonge ou active l'abonnement pour une durée donnée (défaut 30 jours)
 */
export function grantMonthlyAccess(days = 30) {
    try {
        const currentExpStr = localStorage.getItem('subscription_expires_at')
        let baseDate = new Date()
        
        if (currentExpStr) {
            const currentExp = new Date(currentExpStr)
            if (currentExp > baseDate) {
                baseDate = currentExp // On ajoute 30 jours à la fin de l'abonnement actuel
            }
        }
        
        const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
        localStorage.setItem('subscription_expires_at', newExpiry.toISOString())
        localStorage.setItem('last_payment_date', new Date().toISOString())
        localStorage.setItem('last_payment_amount', '5000')
        return { success: true, expiry: newExpiry }
    } catch (e) {
        console.error('Erreur grantMonthlyAccess:', e)
        return { success: false }
    }
}

/**
 * Lance une requête de paiement auprès de Money Fusion
 */
export async function initiateMoneyFusionPayment({ clientName, clientNumber, amount = 5000 }) {
    try {
        const payload = {
            total_price: Number(amount),
            articles: [
                {
                    name: 'Abonnement VENTE PROS (1 Mois)',
                    price: Number(amount),
                    quantity: 1
                }
            ],
            nom_client: (clientName || 'Client Vente Pros').trim(),
            numero_send: (clientNumber || '00000000').trim(),
            return_url: `${window.location.origin}${window.location.pathname}?payment=success`,
            webhook_url: 'https://melodic-pie-21bdc4.netlify.app'
        }

        const response = await fetch(MONEY_FUSION_CONFIG.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Erreur initiateMoneyFusionPayment:', error)
        return {
            statut: false,
            message: "Impossible de joindre le serveur Money Fusion. Vérifiez votre connexion."
        }
    }
}
