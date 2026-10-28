import React, { useState } from 'react'

function PaymentModal({ isOpen, onClose, subStatus, onRefreshStatus, onActivateKey }) {
    const [licenseKeyInput, setLicenseKeyInput] = useState('')
    const [copiedDevice, setCopiedDevice] = useState(false)
    const [selectedOffer, setSelectedOffer] = useState('1M') // '1M' | '3M'

    if (!isOpen) return null

    const deviceId = subStatus?.deviceId || 'VP-DEFAULT'
    const orangePhone = '07 56 96 35 58'
    const waNumber = '2250756963558' // Format international WhatsApp Côte d'Ivoire

    const waText = encodeURIComponent(
        `Bonjour ! Je souhaite renouveler mon abonnement VENTE PROS (${selectedOffer === '1M' ? '1 Mois - 5 000 FCFA' : '3 Mois - 14 000 FCFA'}).\nMon Code Machine est : ${deviceId}`
    )
    const waUrl = `https://wa.me/${waNumber}?text=${waText}`

    function handleKeySubmit(e) {
        e.preventDefault()
        if (!licenseKeyInput.trim()) return
        const ok = onActivateKey(licenseKeyInput.trim())
        if (ok) {
            onClose()
        }
    }

    function handleCopyDevice() {
        navigator.clipboard.writeText(deviceId)
        setCopiedDevice(true)
        setTimeout(() => setCopiedDevice(false), 2000)
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content animate-fade" style={{ maxWidth: '540px', width: '92%', padding: '26px', position: 'relative', borderRadius: '24px' }}>
                {/* Bouton fermer */}
                <button 
                    onClick={onClose}
                    type="button"
                    style={{ position: 'absolute', right: '18px', top: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                >
                    <span className="material-icons">close</span>
                </button>

                {/* En-tête */}
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,139,139,0.1)', color: 'var(--primary)', padding: '5px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>verified</span>
                        ABONNEMENT VENTE PROS
                    </div>
                    <h2 style={{ margin: '4px 0 6px 0', fontSize: '1.45rem', color: '#0f172a', fontWeight: '800' }}>
                        Renouveler mon Accès
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        Statut actuel : <strong style={{ color: subStatus?.isSubscribed ? '#16a34a' : '#ea580c' }}>{subStatus?.planLabel || 'Essai en cours'}</strong>
                    </p>
                </div>

                {/* Code Machine Client */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Votre Code Machine (Appareil)
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>
                            {deviceId}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleCopyDevice}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <span className="material-icons" style={{ fontSize: '15px' }}>
                            {copiedDevice ? 'check' : 'content_copy'}
                        </span>
                        {copiedDevice ? 'Copié !' : 'Copier'}
                    </button>
                </div>

                {/* Choix des formules (1 Mois ou 3 Mois uniquement) */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                        Choisissez votre formule de réabonnement :
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* Offre 1 Mois */}
                        <div
                            onClick={() => setSelectedOffer('1M')}
                            style={{
                                border: selectedOffer === '1M' ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                                background: selectedOffer === '1M' ? 'rgba(0,139,139,0.06)' : 'white',
                                borderRadius: '16px',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>1 MOIS</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)', margin: '4px 0' }}>
                                5 000 <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>FCFA</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>30 Jours d'accès</div>
                        </div>

                        {/* Offre 3 Mois */}
                        <div
                            onClick={() => setSelectedOffer('3M')}
                            style={{
                                border: selectedOffer === '3M' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                background: selectedOffer === '3M' ? 'rgba(37,99,235,0.06)' : 'white',
                                borderRadius: '16px',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                position: 'relative'
                            }}
                        >
                            <span style={{ position: 'absolute', top: '-8px', right: '10px', background: '#e11d48', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                                -1 000 F
                            </span>
                            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>3 MOIS</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>
                                14 000 <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>FCFA</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>90 Jours d'accès</div>
                        </div>
                    </div>
                </div>

                {/* Section Contact & Paiement WhatsApp */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '14px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="material-icons" style={{ color: '#16a34a', fontSize: '20px' }}>phone_in_talk</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534' }}>
                            Orange Money / WhatsApp : {orangePhone}
                        </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#15803d', lineHeight: '1.4' }}>
                        Envoyez votre règlement par Orange Money, Wave ou espèces, puis cliquez ci-dessous pour recevoir votre clé d'activation immédiate :
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
                            padding: '11px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '0.88rem',
                            boxShadow: '0 2px 8px rgba(37,211,102,0.3)'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>chat</span>
                        Commander ma clé sur WhatsApp
                    </a>
                </div>

                {/* Formulaire de saisie de la clé */}
                <form onSubmit={handleKeySubmit} style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                        🔑 Vous avez déjà reçu votre clé ? Saisissez-la ici :
                    </div>
                    <div className="input-group" style={{ marginBottom: '12px' }}>
                        <span className="material-icons">vpn_key</span>
                        <input 
                            type="text" 
                            placeholder="Ex: KEY-1M-XXXX-YYYY" 
                            value={licenseKeyInput}
                            onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                            required
                            style={{ letterSpacing: '1px', textTransform: 'uppercase' }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '13px', borderRadius: '14px', fontWeight: '800', fontSize: '0.9rem' }}
                    >
                        ACTIVER MON ABONNEMENT
                    </button>
                </form>
            </div>
        </div>
    )
}

export default PaymentModal
