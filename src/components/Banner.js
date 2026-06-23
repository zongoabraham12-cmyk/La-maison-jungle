function Banner({ isLoggedIn, onLogout, onInstall, showInstallButton, currentUser }) {
    const title = "VENTE PROS"
    return (
        <div className="no-print" style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            background: 'var(--primary-gradient)', 
            color: 'white',
            boxShadow: '0 15px 45px rgba(0,139,139,0.3)',
            borderRadius: '0 0 60px 60px',
            marginBottom: '30px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Bouton Installation PWA */}
            {showInstallButton && (
                <button 
                    onClick={onInstall}
                    style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        left: '20px', 
                        background: 'rgba(255,255,255,0.2)', 
                        color: 'white', 
                        padding: '10px 20px', 
                        fontSize: '0.8rem',
                        boxShadow: 'none',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <span className="material-icons" style={{ fontSize: '18px' }}>download</span>
                    INSTALLER L'APP
                </button>
            )}

            {/* Bouton Déconnexion */}
            {isLoggedIn && (
                <button 
                    onClick={onLogout}
                    style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '20px', 
                        background: 'rgba(255,255,255,0.2)', 
                        color: 'white', 
                        padding: '10px 20px', 
                        fontSize: '0.8rem',
                        boxShadow: 'none',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <span className="material-icons" style={{ fontSize: '18px' }}>logout</span>
                    DÉCONNEXION
                </button>
            )}

            {/* Décoration abstraite */}
            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '15px', justifyContent: 'center' }}>
                <img src="logo192.png" alt="Logo VENTE PROS" style={{ width: 'clamp(40px, 8vw, 60px)', height: 'auto', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }} />
                <h1 style={{ 
                    margin: 0, 
                    fontSize: 'clamp(1.8rem, 8vw, 3.5rem)', 
                    fontWeight: '900', 
                    letterSpacing: 'clamp(2px, 2vw, 5px)',
                    fontFamily: 'Outfit, sans-serif',
                    textShadow: '0 10px 20px rgba(0,0,0,0.2)',
                    lineHeight: 1
                }}>
                    {title}
                </h1>
            </div>
            <p style={{ 
                opacity: 0.9, 
                letterSpacing: 'clamp(2px, 1vw, 6px)', 
                marginTop: '10px', 
                fontWeight: '700', 
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                marginBottom: 0
            }}>
                SOLUTION DE VENTE PROFESSIONNELLE
            </p>

            {currentUser && (
                <div style={{ 
                    marginTop: '15px', 
                    fontSize: '0.85rem', 
                    background: 'rgba(255,255,255,0.15)', 
                    padding: '6px 16px', 
                    borderRadius: '50px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(5px)'
                }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>person</span>
                    <span>Session : <strong>{currentUser.username}</strong> ({currentUser.role === 'admin' ? 'Administrateur' : 'Caissier'})</span>
                </div>
            )}
        </div>
    )
}



export default Banner