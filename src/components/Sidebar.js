import React from 'react'

function Sidebar({ activeTab, setActiveTab, isAdmin, onLogout, currentUser, onInstall, showInstallButton, sidebarOpen, setSidebarOpen }) {
    const tabs = [
        { id: 'dashboard', label: 'TABLEAU DE BORD', icon: 'space_dashboard', visible: true },
        { id: 'sales', label: 'CAISSE (VENTES)', icon: 'shopping_cart', visible: true },
        { id: 'stock', label: 'STOCK', icon: 'inventory_2', visible: true },
        { id: 'history', label: 'HISTORIQUE', icon: 'history', visible: isAdmin },
        { id: 'settings', label: 'PARAMÈTRES', icon: 'settings', visible: isAdmin },
    ]

    return (
        <>
            {/* Bouton Hamburger Mobile */}
            <div className="mobile-header no-print">
                <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                    <span className="material-icons">menu</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="logo192.png" alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '8px' }} />
                    <span style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--primary)', letterSpacing: '1px' }}>VENTE PROS</span>
                </div>
                <div style={{ width: '36px' }}></div> {/* Équilibrage visuel */}
            </div>

            {/* Overlay d'arrière-plan sur Mobile */}
            {sidebarOpen && (
                <div className="sidebar-overlay no-print" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Barre latérale principale */}
            <div className={`sidebar no-print ${sidebarOpen ? 'open' : ''}`}>
                
                {/* Logo & Titre */}
                <div className="sidebar-brand">
                    <img src="logo512.png" alt="Logo" className="brand-logo" />
                    <div>
                        <h1 className="brand-title">VENTE PROS</h1>
                        <span className="brand-subtitle">GESTION PRO</span>
                    </div>
                </div>

                {/* Session Active */}
                {currentUser && (
                    <div className="sidebar-session">
                        <span className="material-icons notranslate" translate="no" style={{ fontSize: '18px', color: 'var(--primary-light)' }}>person</span>
                        <div className="session-info">
                            <span className="session-name">{currentUser.username}</span>
                            <span className="session-role">{currentUser.role === 'admin' ? 'Administrateur' : 'Caissier'}</span>
                        </div>
                    </div>
                )}

                {/* Liens de Navigation */}
                <nav className="sidebar-nav">
                    {tabs.filter(t => t.visible).map(t => (
                        <button
                            key={t.id}
                            className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(t.id)
                                setSidebarOpen(false) // Ferme la sidebar sur mobile après sélection
                            }}
                        >
                            <span className="material-icons nav-icon notranslate" translate="no">{t.icon}</span>
                            <span className="nav-label">{t.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Bas de Sidebar (Boutons PWA & Déconnexion) */}
                <div className="sidebar-footer">
                    {showInstallButton && (
                        <button onClick={onInstall} className="footer-btn install-btn">
                            <span className="material-icons notranslate" translate="no">download</span>
                            <span>INSTALLER L'APP</span>
                        </button>
                    )}
                    
                    <button onClick={onLogout} className="footer-btn logout-btn">
                        <span className="material-icons notranslate" translate="no">logout</span>
                        <span>DÉCONNEXION</span>
                    </button>

                    <div className="footer-copyright">
                        &copy; 2026 VENTE PROS
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar
