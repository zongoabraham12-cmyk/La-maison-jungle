import React from 'react'

function Settings({ onExportData, onImportData, onResetInventory, currentUser }) {
    return (
        <div className="animate-fade" style={{ flex: 1, padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ marginBottom: '30px', padding: '20px 30px', hover: { transform: 'none' } }}>
                <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-icons">settings</span>
                    PARAMÈTRES ADMINISTRATEUR
                </h2>
                <p style={{ color: '#666', marginTop: '10px', fontSize: '0.9rem' }}>
                    Espace réservé à la gestion globale des données de l'application. Ces options ne sont pas visibles par les caissiers.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Carte Sauvegarde */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <span className="material-icons">backup</span>
                        Sauvegarde & Données
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

                {/* Carte Danger Zone */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                    <h3 style={{ margin: 0, color: '#c62828', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                        <span className="material-icons">warning_amber</span>
                        Zone de Danger
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', flex: 1 }}>
                        Supprimez définitivement tous les produits de votre stock et réinitialisez l'application. Cette action est irréversible.
                    </p>
                    <button 
                        onClick={onResetInventory}
                        style={{ 
                            background: 'rgba(231, 76, 60, 0.1)', 
                            color: '#e74c3c', 
                            padding: '12px', 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            border: '2px solid transparent'
                        }}
                    >
                        <span className="material-icons">delete_forever</span>
                        RÉINITIALISER TOUT LE STOCK
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ marginTop: '30px', padding: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                    Identifiant de session : <strong>{currentUser.username}</strong> | Rôle : <strong>{currentUser.role.toUpperCase()}</strong>
                </span>
            </div>
        </div>
    )
}

export default Settings
