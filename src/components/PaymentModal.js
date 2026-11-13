import React, { useState } from 'react'
import { CONTACT_CONFIG } from '../utils/moneyFusion'

function PaymentModal({ isOpen, onClose, subStatus, onActivateKey }) {
    const [licenseKeyInput, setLicenseKeyInput] = useState('')

    if (!isOpen) return null

    const waText = encodeURIComponent(
        `Bonjour ! Je souhaite acheter la clé de licence définitive (À vie) pour l'application VENTE PROS.`
    )
    const waUrl = `https://wa.me/${CONTACT_CONFIG.waNumber}?text=${waText}`

    function handleKeySubmit(e) {
        e.preventDefault()
        if (!licenseKeyInput.trim()) return
        const ok = onActivateKey(licenseKeyInput.trim())
        if (ok) {
            onClose()
        }
    }

    const isActivated = subStatus?.isLifetime || localStorage.getItem('app_activated') === 'true'

    return (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content animate-fade" style={{ maxWidth: '500px', width: '92%', padding: '26px', position: 'relative', borderRadius: '24px' }}>
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
                        LICENCE VENTE PROS
                    </div>
                    <h2 style={{ margin: '4px 0 6px 0', fontSize: '1.45rem', color: '#0f172a', fontWeight: '800' }}>
                        {isActivated ? "Application Activée" : "Activer la Version Complète"}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        {isActivated 
                            ? "Votre licence est active à vie sans aucune restriction." 
                            : `Période d'essai : ${subStatus?.trialDaysLeft ?? 0} jour(s) restant(s)`}
                    </p>
                </div>

                {isActivated ? (
                    <div style={{ background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: '18px', padding: '20px', textAlign: 'center', marginBottom: '10px' }}>
                        <span className="material-icons" style={{ fontSize: '48px', color: '#2e7d32', marginBottom: '10px' }}>check_circle</span>
                        <h3 style={{ color: '#1b5e20', margin: '0 0 6px 0' }}>LICENCE DÉFINITIVE ACTIVE</h3>
                        <p style={{ color: '#2e7d32', fontSize: '0.85rem', margin: 0 }}>
                            Merci pour votre achat ! Votre application fonctionne sans limite de temps et sans connexion internet requise.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Section Contact WhatsApp (uniquement si NON activé) */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '18px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span className="material-icons" style={{ color: '#16a34a', fontSize: '22px' }}>phone_in_talk</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#166534' }}>
                                    WhatsApp / Orange : {CONTACT_CONFIG.phone}
                                </span>
                            </div>
                            <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#15803d', lineHeight: '1.4' }}>
                                Pour acheter votre licence à vie, contactez directement le support sur WhatsApp pour recevoir votre clé d'activation immédiate :
                            </p>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: '#25D366',
                                    color: 'white',
                                    textDecoration: 'none',
                                    padding: '12px',
                                    borderRadius: '14px',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '20px' }}>chat</span>
                                Acheter ma Clé sur WhatsApp
                            </a>
                        </div>

                        {/* Saisie de la clé */}
                        <form onSubmit={handleKeySubmit}>
                            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                                🔑 Vous avez votre clé ? Saisissez-la ci-dessous :
                            </div>
                            <div className="input-group" style={{ marginBottom: '14px' }}>
                                <span className="material-icons">vpn_key</span>
                                <input 
                                    type="text" 
                                    placeholder="Ex: VP-ABCD-1234-EF56" 
                                    value={licenseKeyInput}
                                    onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                                    required
                                    style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '14px', borderRadius: '16px', fontWeight: '800', fontSize: '0.92rem' }}
                            >
                                DÉBLOQUER DÉFINITIVEMENT
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

export default PaymentModal
