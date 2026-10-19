import React, { useState } from 'react'
import { initiateMoneyFusionPayment, grantMonthlyAccess, MONEY_FUSION_CONFIG } from '../utils/moneyFusion'

function PaymentModal({ isOpen, onClose, subStatus, onRefreshStatus, onActivateKey }) {
    const [clientName, setClientName] = useState('')
    const [clientNumber, setClientNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [activeTab, setActiveTab] = useState('online') // 'online' | 'key'
    const [licenseKeyInput, setLicenseKeyInput] = useState('')

    if (!isOpen) return null

    const price = MONEY_FUSION_CONFIG.monthlyPrice

    async function handlePayOnline(e) {
        e.preventDefault()
        setErrorMsg('')
        setSuccessMsg('')
        setLoading(true)

        try {
            const result = await initiateMoneyFusionPayment({
                clientName: clientName || 'Client Vente Pros',
                clientNumber: clientNumber || '07000000',
                amount: price
            })

            if (result && result.statut && result.url) {
                // Redirection vers la page de paiement sécurisée Money Fusion
                window.location.href = result.url
            } else {
                // Si l'application est en cours de validation par Money Fusion
                const rawMessage = result?.message || "Erreur de paiement"
                if (rawMessage.includes("non approuvée") || rawMessage.includes("non approuvee")) {
                    setErrorMsg("⏳ Solution VENTE PROS en cours de validation par l'équipe Money Fusion. Les paiements réels seront actifs dès que leur équipe aura validé votre compte.")
                } else {
                    setErrorMsg(`Money Fusion : ${rawMessage}`)
                }
            }
        } catch (err) {
            setErrorMsg("Une erreur est survenue lors de l'appel à Money Fusion.")
        } finally {
            setLoading(false)
        }
    }

    function handleDemoUnlock() {
        if (window.confirm("Voulez-vous activer 30 jours d'accès complet (Mode Démo / Test) ?")) {
            grantMonthlyAccess(30)
            onRefreshStatus()
            alert("✅ Accès de 30 jours débloqué avec succès !")
            onClose()
        }
    }

    function handleKeySubmit(e) {
        e.preventDefault()
        if (!licenseKeyInput.trim()) return
        const ok = onActivateKey(licenseKeyInput.trim())
        if (ok) {
            onClose()
        }
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content animate-fade" style={{ maxWidth: '540px', width: '92%', padding: '28px', position: 'relative', borderRadius: '24px' }}>
                {/* Bouton fermer */}
                <button 
                    onClick={onClose}
                    type="button"
                    style={{ position: 'absolute', right: '18px', top: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                >
                    <span className="material-icons">close</span>
                </button>

                {/* En-tête */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,139,139,0.1)', color: 'var(--primary)', padding: '5px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>verified</span>
                        ABONNEMENT VENTE PROS
                    </div>
                    <h2 style={{ margin: '4px 0 6px 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: '800' }}>
                        Accès & Facturation Mensuelle
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        Votre ID Appareil : <strong style={{ color: 'var(--primary)' }}>{subStatus?.deviceId}</strong>
                    </p>
                </div>

                {/* Onglets */}
                <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '18px' }}>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('online')}
                        style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'online' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'online' ? 'var(--primary)' : '#64748b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        ⚡ Paiement Mobile Money
                    </button>
                    <button 
                        type="button"
                        onClick={() => setActiveTab('key')}
                        style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'key' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'key' ? 'var(--primary)' : '#64748b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        🔑 Clé d'Activation
                    </button>
                </div>

                {activeTab === 'online' ? (
                    <div>
                        {/* Carte Offre */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(0,139,139,0.08) 0%, rgba(32,178,170,0.12) 100%)', border: '2px solid var(--primary)', borderRadius: '18px', padding: '16px', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>Abonnement 1 Mois</span>
                                <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>30 JOURS</span>
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '6px' }}>
                                {price.toLocaleString('fr-FR')} {MONEY_FUSION_CONFIG.currency} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>/ mois</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                                Déblocage instantané de l'application dès validation du paiement.
                            </div>
                        </div>

                        {/* Badges opérateurs acceptés */}
                        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Moyens de paiement acceptés via Money Fusion :</span>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700' }}>🌊 Wave</span>
                                <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700' }}>🟠 Orange Money</span>
                                <span style={{ background: '#fef9c3', color: '#a16207', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700' }}>🟡 MTN MoMo</span>
                                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700' }}>🔵 Moov Flooz</span>
                                <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700' }}>💳 Carte Bancaire</span>
                            </div>
                        </div>

                        {/* Formulaire de paiement */}
                        <form onSubmit={handlePayOnline}>
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <span className="material-icons">storefront</span>
                                <input 
                                    type="text" 
                                    placeholder="Nom de votre boutique / client" 
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <span className="material-icons">phone_iphone</span>
                                <input 
                                    type="tel" 
                                    placeholder="Numéro Mobile Money (ex: 0700000000)" 
                                    value={clientNumber}
                                    onChange={(e) => setClientNumber(e.target.value)}
                                    required
                                />
                            </div>

                            {errorMsg && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '14px', lineHeight: '1.4' }}>
                                    {errorMsg}
                                    <div style={{ marginTop: '8px' }}>
                                        <button 
                                            type="button" 
                                            onClick={handleDemoUnlock}
                                            style={{ background: '#0f172a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}
                                        >
                                            Activer 30 jours (Mode Test / Démo)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {successMsg && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '14px' }}>
                                    {successMsg}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn-primary" 
                                style={{ width: '100%', padding: '15px', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '16px' }}
                            >
                                <span className="material-icons">{loading ? 'sync' : 'payment'}</span>
                                {loading ? 'Connexion à Money Fusion...' : `PAYER ${price.toLocaleString('fr-FR')} FCFA`}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px', lineHeight: '1.5' }}>
                            Si vous avez reçu une clé d'activation auprès de votre fournisseur ou payé en espèces, saisissez-la ici :
                        </p>
                        <form onSubmit={handleKeySubmit}>
                            <div className="input-group" style={{ marginBottom: '16px' }}>
                                <span className="material-icons">vpn_key</span>
                                <input 
                                    type="text" 
                                    placeholder="Clé d'activation (ex: KEY-XXXX-XXXX)" 
                                    value={licenseKeyInput}
                                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                                    required
                                    style={{ letterSpacing: '1px' }}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '14px', borderRadius: '16px', fontWeight: '700' }}
                            >
                                DÉBLOQUER LA LICENCE
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PaymentModal
