import React, { useState } from 'react'
import { generateLicenseKey } from '../utils/license'

function Settings({ onExportData, onImportData, onResetInventory, onClearHistory, currentUser, activationStatus, onActivateApp, users, onUpdateUserProfile, receiptConfig, onUpdateReceiptConfig }) {
    const [localConfig, setLocalConfig] = useState(receiptConfig || {
        storeName: 'VENTE PROS',
        storeAddress: '',
        storePhone: '',
        storeSlogan: 'Expert en Solutions de Vente',
        footerMessage: 'Merci de votre confiance ! À bientôt chez nous.'
    })
    const [clientDeviceId, setClientDeviceId] = useState('')
    const [selectedPlan, setSelectedPlan] = useState('1M')
    const [generatedKey, setGeneratedKey] = useState('')
    const [copiedState, setCopiedState] = useState('')

    const adminUser = (users || []).find(u => u.role === 'admin') || { username: 'admin', password: 'admin' }
    const cashierUser = (users || []).find(u => u.role === 'cashier') || { username: 'vendeuse', password: 'vendeuse' }

    function handleConfigChange(e) {
        setLocalConfig(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleConfigSubmit(e) {
        e.preventDefault()
        onUpdateReceiptConfig(localConfig)
    }

    return (
        <div className="animate-fade" style={{ flex: 1, padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ marginBottom: '30px', padding: '20px 30px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons">settings</span>
                    PARAMÈTRES ADMINISTRATEUR
                </h2>
                <p style={{ color: '#666', marginTop: '10px', fontSize: '0.9rem' }}>
                    Espace réservé à la gestion globale des données et à la sécurité de l'application. Ces options ne sont pas visibles par les caissiers.
                </p>
            </div>

            {/* Section Licence */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '25px 30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                    <span className="material-icons">vpn_key</span>
                    Statut de la Licence
                </h3>

                {/* Code Machine de cet appareil */}
                {activationStatus.deviceId && (
                    <div style={{ background: '#f3e5f5', border: '1px solid #ce93d8', borderRadius: '16px', padding: '15px 20px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#7b1fa2', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '5px' }}>computer</span>
                            Code Machine de cet Appareil
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <code style={{ fontSize: '1.3rem', fontWeight: '800', color: '#4a148c', letterSpacing: '2px', background: 'white', padding: '8px 16px', borderRadius: '10px', border: '2px solid #ce93d8' }}>
                                {activationStatus.deviceId}
                            </code>
                            <button
                                className="btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => {
                                    navigator.clipboard.writeText(activationStatus.deviceId)
                                    setCopiedState('device')
                                    setTimeout(() => setCopiedState(''), 2000)
                                }}
                            >
                                <span className="material-icons" style={{ fontSize: '16px' }}>
                                    {copiedState === 'device' ? 'check' : 'content_copy'}
                                </span>
                                {copiedState === 'device' ? 'Copié !' : 'Copier'}
                            </button>
                        </div>
                        <p style={{ color: '#7b1fa2', fontSize: '0.78rem', margin: 0 }}>
                            Communiquez ce code à votre fournisseur pour obtenir votre clé d'activation personnelle.
                        </p>
                    </div>
                )}

                {activationStatus.isActivated ? (
                    <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '15px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                        <span className="material-icons" style={{ fontSize: '24px' }}>check_circle</span>
                        <span>VERSION ACTIVÉE DÉFINITIVEMENT</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: '#fff3e0', color: '#e65100', padding: '15px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                            <span className="material-icons" style={{ fontSize: '24px' }}>hourglass_empty</span>
                            <span>VERSION D'ESSAI : {activationStatus.daysLeft} JOURS RESTANTS</span>
                        </div>
                        <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                            Saisissez la clé de licence définitive fournie pour débloquer l'application sans limite de temps.
                        </p>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault()
                                const data = new FormData(e.target)
                                if (onActivateApp(data.get('key'))) {
                                    e.target.reset()
                                }
                            }}
                            style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}
                        >
                            <div className="input-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
                                <span className="material-icons">vpn_key</span>
                                <input name="key" placeholder="Entrez la clé d'activation" required style={{ width: '100%' }} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ padding: '14px 24px', fontSize: '0.85rem' }}>ACTIVER</button>
                        </form>
                    </div>
                )}
            </div>

            {/* Section Générateur de Clés — Admin uniquement */}
            {currentUser && currentUser.role === 'admin' && (
                <div className="glass-card" style={{ marginBottom: '30px', padding: '25px 30px', border: '2px solid #7b1fa2' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                        <span className="material-icons">admin_panel_settings</span>
                        Générateur de Clés Client (Abonnements & Licences)
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                        Le client vous envoie son <strong>Code Machine</strong> et son règlement → Choisissez la durée → Cliquez sur Générer → Envoyez la clé par WhatsApp.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Choix de la formule */}
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4a148c', display: 'block', marginBottom: '8px' }}>
                                Type d'Abonnement à générer :
                            </label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedPlan('1M'); setGeneratedKey(''); }}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        border: selectedPlan === '1M' ? '2px solid #2e7d32' : '1px solid #ccc',
                                        background: selectedPlan === '1M' ? '#e8f5e9' : 'white',
                                        color: selectedPlan === '1M' ? '#1b5e20' : '#444',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: '18px' }}>calendar_today</span>
                                    1 Mois (+30 Jours)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setSelectedPlan('3M'); setGeneratedKey(''); }}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        border: selectedPlan === '3M' ? '2px solid #1565c0' : '1px solid #ccc',
                                        background: selectedPlan === '3M' ? '#e3f2fd' : 'white',
                                        color: selectedPlan === '3M' ? '#0d47a1' : '#444',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: '18px' }}>date_range</span>
                                    3 Mois (+90 Jours)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setSelectedPlan('LIFETIME'); setGeneratedKey(''); }}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        border: selectedPlan === 'LIFETIME' ? '2px solid #7b1fa2' : '1px solid #ccc',
                                        background: selectedPlan === 'LIFETIME' ? '#f3e5f5' : 'white',
                                        color: selectedPlan === 'LIFETIME' ? '#4a148c' : '#777',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: '18px' }}>lock_clock</span>
                                    À vie (Secret / Admin)
                                </button>
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <span className="material-icons">computer</span>
                            <input
                                placeholder="Code Machine du client (ex: VP-1A2B-3C4D)"
                                value={clientDeviceId}
                                onChange={(e) => {
                                    setClientDeviceId(e.target.value.toUpperCase())
                                    setGeneratedKey('')
                                }}
                                style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '1px' }}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => {
                                const trimmed = clientDeviceId.trim()
                                if (!trimmed) return alert("Veuillez saisir le Code Machine du client.")
                                const key = generateLicenseKey(trimmed, selectedPlan)
                                setGeneratedKey(key)
                                setCopiedState('')
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: '18px' }}>key</span>
                            Générer la Clé ({selectedPlan === '1M' ? '1 Mois' : selectedPlan === '3M' ? '3 Mois' : 'À vie'})
                        </button>

                        {generatedKey && (
                            <div style={{ background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: '16px', padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: '700', textTransform: 'uppercase' }}>
                                    Clé {selectedPlan === '1M' ? '1 Mois (+30 jours)' : selectedPlan === '3M' ? '3 Mois (+90 jours)' : 'À vie'} générée pour {clientDeviceId}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <code style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1b5e20', letterSpacing: '2px', background: 'white', padding: '8px 16px', borderRadius: '10px', border: '2px solid #4caf50' }}>
                                        {generatedKey}
                                    </code>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedKey)
                                            setCopiedState('key')
                                            setTimeout(() => setCopiedState(''), 2000)
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '16px' }}>
                                            {copiedState === 'key' ? 'check' : 'content_copy'}
                                        </span>
                                        {copiedState === 'key' ? 'Copié !' : 'Copier Clé'}
                                    </button>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366' }}
                                        onClick={() => {
                                            const durationText = selectedPlan === '1M' ? '1 Mois (30 jours)' : selectedPlan === '3M' ? '3 Mois (90 jours)' : 'Définitive (À vie)';
                                            const message = `Bonjour ! Voici votre clé d'abonnement VENTE PROS (${durationText}) :\n\n🔑 *${generatedKey}*\n\nPour l'activer :\n1. Ouvrez l'application VENTE PROS\n2. Allez dans 'Abonnement'\n3. Collez votre clé et cliquez sur Valider.\n\nMerci pour votre confiance !`;
                                            navigator.clipboard.writeText(message)
                                            setCopiedState('whatsapp')
                                            setTimeout(() => setCopiedState(''), 2000)
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '16px' }}>
                                            {copiedState === 'whatsapp' ? 'check' : 'chat'}
                                        </span>
                                        {copiedState === 'whatsapp' ? 'Message Copié !' : 'Copier Message WhatsApp'}
                                    </button>
                                </div>
                                <p style={{ color: '#2e7d32', fontSize: '0.78rem', margin: 0 }}>
                                    ✅ Cette clé est unique et ne fonctionnera <strong>que sur l'appareil {clientDeviceId}</strong>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section Personnalisation du Reçu */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '25px 30px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                    <span className="material-icons">receipt_long</span>
                    Personnalisation du Reçu
                </h3>
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '20px', marginTop: 0 }}>
                    Ces informations apparaîtront sur tous les reçus imprimés ou téléchargés.
                </p>
                <form onSubmit={handleConfigSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Nom de la boutique *
                            </label>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <span className="material-icons">store</span>
                                <input
                                    name="storeName"
                                    value={localConfig.storeName}
                                    onChange={handleConfigChange}
                                    placeholder="Ex: VENTE PROS"
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Slogan / Sous-titre
                            </label>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <span className="material-icons">format_quote</span>
                                <input
                                    name="storeSlogan"
                                    value={localConfig.storeSlogan}
                                    onChange={handleConfigChange}
                                    placeholder="Ex: Expert en Solutions de Vente"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Adresse
                            </label>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <span className="material-icons">location_on</span>
                                <input
                                    name="storeAddress"
                                    value={localConfig.storeAddress}
                                    onChange={handleConfigChange}
                                    placeholder="Ex: Rue du Commerce, Abidjan"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Téléphone
                            </label>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <span className="material-icons">phone</span>
                                <input
                                    name="storePhone"
                                    value={localConfig.storePhone}
                                    onChange={handleConfigChange}
                                    placeholder="Ex: +225 07 00 00 00"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Message de bas de reçu
                            </label>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <span className="material-icons">chat_bubble_outline</span>
                                <input
                                    name="footerMessage"
                                    value={localConfig.footerMessage}
                                    onChange={handleConfigChange}
                                    placeholder="Ex: Merci de votre confiance !"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">save</span>
                        ENREGISTRER LA PERSONNALISATION
                    </button>
                </form>
            </div>

            {/* Section Gestion des Comptes */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '25px 30px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                    <span className="material-icons">manage_accounts</span>
                    Sécurité &amp; Profils Utilisateurs
                </h3>
                <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '20px', marginTop: 0 }}>
                    Personnalisez les identifiants de connexion et les mots de passe des deux comptes.
                </p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Changer profil Admin */}
                    <div style={{ flex: 1, minWidth: '280px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '0.95rem', color: '#333' }}>Compte Administrateur</h4>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const data = new FormData(e.target)
                            onUpdateUserProfile('admin', data.get('username'), data.get('password'))
                        }}>
                            <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Nom d'utilisateur</label>
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <span className="material-icons">person</span>
                                <input name="username" defaultValue={adminUser.username} placeholder="Username" required style={{ width: '100%' }} />
                            </div>
                            <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Mot de passe</label>
                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <span className="material-icons">lock</span>
                                <input name="password" type="password" defaultValue={adminUser.password} placeholder="Mot de passe" required style={{ width: '100%' }} />
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}>Mettre à jour admin</button>
                        </form>
                    </div>

                    {/* Changer profil Vendeuse */}
                    <div style={{ flex: 1, minWidth: '280px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 15px 0', fontSize: '0.95rem', color: '#333' }}>Compte Vendeuse</h4>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const data = new FormData(e.target)
                            onUpdateUserProfile('cashier', data.get('username'), data.get('password'))
                        }}>
                            <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Nom d'utilisateur</label>
                            <div className="input-group" style={{ marginBottom: '12px' }}>
                                <span className="material-icons">person</span>
                                <input name="username" defaultValue={cashierUser.username} placeholder="Username" required style={{ width: '100%' }} />
                            </div>
                            <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Mot de passe</label>
                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <span className="material-icons">lock</span>
                                <input name="password" type="password" defaultValue={cashierUser.password} placeholder="Mot de passe" required style={{ width: '100%' }} />
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}>Mettre à jour vendeuse</button>
                        </form>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Carte Sauvegarde */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <span className="material-icons">backup</span>
                        Sauvegarde &amp; Données
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', flex: 1 }}>
                        Téléchargez une copie complète de vos données (produits, stocks, historique et utilisateurs) pour la mettre en sécurité.
                    </p>
                    <button 
                        onClick={onExportData}
                        className="btn-primary"
                        style={{ padding: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <span className="material-icons">download</span>
                        EXPORTER LA SAUVEGARDE
                    </button>
                </div>

                {/* Carte Restauration */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: '#1565c0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <span className="material-icons">restore</span>
                        Restauration
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', flex: 1 }}>
                        Restaurez vos données à partir d'un fichier de sauvegarde VENTE PROS au format JSON. Attention, cela remplacera vos données actuelles.
                    </p>
                    <label style={{ 
                        background: 'var(--primary-gradient)', 
                        color: 'white', 
                        padding: '12px', 
                        borderRadius: '18px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        fontWeight: '700', 
                        fontSize: '0.8rem',
                        boxShadow: '0 8px 20px rgba(0, 139, 139, 0.3)',
                        textAlign: 'center'
                    }}>
                        <span className="material-icons">upload</span>
                        IMPORTER UN FICHIER
                        <input type="file" accept=".json" onChange={onImportData} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Carte Effacer l'Historique */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <span className="material-icons">delete_sweep</span>
                        Effacer l'Historique
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', flex: 1 }}>
                        Supprime définitivement tout l'historique des ventes enregistrées. Cette action est irréversible. Pensez à exporter une sauvegarde avant.
                    </p>
                    <button 
                        onClick={onClearHistory}
                        style={{ 
                            background: 'linear-gradient(135deg, #c62828, #e53935)',
                            color: 'white',
                            padding: '12px', 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            border: 'none',
                            borderRadius: '18px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            boxShadow: '0 8px 20px rgba(198, 40, 40, 0.3)'
                        }}
                    >
                        <span className="material-icons">delete_forever</span>
                        EFFACER L'HISTORIQUE
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                    Identifiant de session : <strong>{currentUser.username}</strong> | Rôle : <strong>{currentUser.role.toUpperCase()}</strong>
                </span>
            </div>
        </div>
    )
}

export default Settings
