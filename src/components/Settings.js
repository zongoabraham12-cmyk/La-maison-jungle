import React, { useState } from 'react'
import { generateLicenseBatch } from '../utils/license'

function Settings({ onExportData, onImportData, onResetInventory, onClearHistory, currentUser, activationStatus, onActivateApp, users, onUpdateUserProfile, receiptConfig, onUpdateReceiptConfig }) {
    const [localConfig, setLocalConfig] = useState(receiptConfig || {
        storeName: 'VENTE PROS',
        storeAddress: '',
        storePhone: '',
        storeSlogan: 'Expert en Solutions de Vente',
        footerMessage: 'Merci de votre confiance ! À bientôt chez nous.'
    })
    const [generatedKeys, setGeneratedKeys] = useState([])
    const [batchSize, setBatchSize] = useState(5)
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

    function handleGenerateBatch() {
        const keys = generateLicenseBatch(batchSize)
        setGeneratedKeys(keys)
        setCopiedState('')
    }

    const isActivated = activationStatus?.isLifetime || localStorage.getItem('app_activated') === 'true'

    return (
        <div className="animate-fade" style={{ flex: 1, padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ marginBottom: '30px', padding: '20px 30px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons">settings</span>
                    PARAMÈTRES ADMINISTRATEUR
                </h2>
                <p style={{ color: '#666', marginTop: '10px', fontSize: '0.9rem' }}>
                    Espace réservé à la gestion globale des données, à la sécurité et à la génération des licences de vente.
                </p>
            </div>

            {/* Section Statut Licence de CET appareil */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '25px 30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                    <span className="material-icons">vpn_key</span>
                    Statut de cet Appareil
                </h3>

                {isActivated ? (
                    <div style={{ background: '#e8f5e9', border: '2px solid #4caf50', color: '#2e7d32', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700' }}>
                        <span className="material-icons" style={{ fontSize: '28px' }}>check_circle</span>
                        <div>
                            <div>VERSION ACTIVÉE DÉFINITIVEMENT (À VIE)</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#1b5e20' }}>Cet appareil est débloqué sans limite de temps.</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: '#fff3e0', color: '#e65100', padding: '15px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                            <span className="material-icons" style={{ fontSize: '24px' }}>hourglass_empty</span>
                            <span>VERSION D'ESSAI : {activationStatus?.trialDaysLeft ?? 0} JOURS RESTANTS</span>
                        </div>
                        <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>
                            Saisissez votre clé de licence définitive à vie pour débloquer cet appareil :
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
                                <input name="key" placeholder="Entrez la clé (ex: VP-ABCD-1234-EF56)" required style={{ width: '100%', textTransform: 'uppercase' }} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ padding: '14px 24px', fontSize: '0.85rem' }}>ACTIVER</button>
                        </form>
                    </div>
                )}
            </div>

            {/* Section Générateur de Licences Clients (Admin uniquement) */}
            <div className="glass-card" style={{ marginBottom: '30px', padding: '25px 30px', border: '2px solid #7b1fa2' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
                        <span className="material-icons">local_offer</span>
                        Générateur de Clés de Licence (À vie)
                    </h3>
                    <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                        ESPACE VENDEUR
                    </span>
                </div>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 18px 0', lineHeight: '1.5' }}>
                    Générez des clés officielles prêtes à être vendues. Chaque clé est <strong>universelle</strong> et <strong>débloque l'application à vie</strong> sur l'appareil du client.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 5, 10].map(qty => (
                            <button
                                key={qty}
                                type="button"
                                onClick={() => setBatchSize(qty)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    border: batchSize === qty ? '2px solid #7b1fa2' : '1px solid #ccc',
                                    background: batchSize === qty ? '#f3e5f5' : 'white',
                                    color: batchSize === qty ? '#4a148c' : '#555',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {qty} {qty > 1 ? 'Clés' : 'Clé'}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateBatch}
                        className="btn-primary"
                        style={{ padding: '10px 20px', background: '#7b1fa2', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>bolt</span>
                        Générer {batchSize} Licence{batchSize > 1 ? 's' : ''}
                    </button>
                </div>

                {generatedKeys.length > 0 && (
                    <div style={{ background: '#faf5ff', border: '2px solid #ce93d8', borderRadius: '18px', padding: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#4a148c', textTransform: 'uppercase' }}>
                                Clés générées prêtes à l'emploi ({generatedKeys.length})
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const allText = generatedKeys.map((k, i) => `Licence ${i + 1} : ${k}`).join('\n')
                                    navigator.clipboard.writeText(allText)
                                    setCopiedState('all')
                                    setTimeout(() => setCopiedState(''), 2000)
                                }}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <span className="material-icons" style={{ fontSize: '15px' }}>
                                    {copiedState === 'all' ? 'check' : 'content_copy'}
                                </span>
                                {copiedState === 'all' ? 'Tout copié !' : 'Copier tout le lot'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {generatedKeys.map((key, index) => (
                                <div 
                                    key={key} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        background: 'white', 
                                        border: '1px solid #e9d5ff', 
                                        padding: '10px 14px', 
                                        borderRadius: '12px', 
                                        flexWrap: 'wrap', 
                                        gap: '8px' 
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#7b1fa2', fontWeight: '800', width: '20px' }}>#{index + 1}</span>
                                        <code style={{ fontSize: '1.05rem', fontWeight: '800', color: '#4a148c', letterSpacing: '1.5px' }}>
                                            {key}
                                        </code>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(key)
                                                setCopiedState(key)
                                                setTimeout(() => setCopiedState(''), 2000)
                                            }}
                                            className="btn-secondary"
                                            style={{ padding: '6px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <span className="material-icons" style={{ fontSize: '14px' }}>
                                                {copiedState === key ? 'check' : 'content_copy'}
                                            </span>
                                            {copiedState === key ? 'Copié' : 'Copier'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const msg = `Bonjour ! Voici votre clé de licence définitive VENTE PROS (À vie) :\n\n🔑 *${key}*\n\nPour l'activer :\n1. Ouvrez l'application VENTE PROS\n2. Collez cette clé dans la fenêtre d'activation\n3. Cliquez sur Débloquer.\n\nVotre application sera utilisable à vie sans limite de temps. Merci pour votre confiance !`
                                                navigator.clipboard.writeText(msg)
                                                setCopiedState(`wa_${key}`)
                                                setTimeout(() => setCopiedState(''), 2000)
                                            }}
                                            className="btn-primary"
                                            style={{ padding: '6px 10px', fontSize: '0.72rem', background: '#25D366', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <span className="material-icons" style={{ fontSize: '14px' }}>
                                                {copiedState === `wa_${key}` ? 'check' : 'chat'}
                                            </span>
                                            {copiedState === `wa_${key}` ? 'Message Copié !' : 'WhatsApp'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

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
