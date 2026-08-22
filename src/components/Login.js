import { useState } from 'react'

function Login({ onLogin, users, onUpdateUserProfile, onRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [mode, setMode] = useState('login') // 'login', 'recovery', or 'register'
    
    // Recovery states
    const [recoveryUsername, setRecoveryUsername] = useState('')
    const [recoveryStep, setRecoveryStep] = useState(1) // 1: identify user, 2: answer question, 3: set new password
    const [targetUser, setTargetUser] = useState(null)
    const [recoveryAnswer, setRecoveryAnswer] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    
    // Register states
    const [registerRole, setRegisterRole] = useState('admin')
    const [registerUsername, setRegisterUsername] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')
    const [registerQuestion, setRegisterQuestion] = useState("Nom de votre premier animal de compagnie ?")
    const [registerAnswer, setRegisterAnswer] = useState('')
    const [showRegisterPassword, setShowRegisterPassword] = useState(false)
    
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    function handleRegisterSubmit(e) {
        e.preventDefault()
        if (registerPassword.length < 4) {
            setError('Le mot de passe doit contenir au moins 4 caractères.')
            return
        }
        if (!registerQuestion.trim() || !registerAnswer.trim()) {
            setError('Veuillez renseigner la question de sécurité et sa réponse.')
            return
        }
        const isRegistered = onRegister(registerRole, registerUsername, registerPassword, registerQuestion.trim(), registerAnswer.trim())
        if (isRegistered) {
            setSuccess('Compte créé et connecté avec succès !')
            setError('')
            setRegisterUsername('')
            setRegisterPassword('')
            setRegisterAnswer('')
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        const user = (users || []).find(u => u && u.username && u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password)
        
        if (user) {
            onLogin(user)
        } else {
            setError('Identifiants incorrects. Veuillez réessayer.')
            const form = e.target
            form.style.animation = 'none'
            setTimeout(() => {
                form.style.animation = 'shake 0.5s ease-in-out'
            }, 10)
        }
    }

    function handleRecoveryIdentify(e) {
        e.preventDefault()
        const user = users.find(u => u.username.toLowerCase() === recoveryUsername.toLowerCase().trim())
        if (user) {
            setTargetUser(user)
            setRecoveryStep(2)
            setError('')
        } else {
            setError('Utilisateur non trouvé.')
        }
    }

    function handleRecoveryVerify(e) {
        e.preventDefault()
        if (recoveryAnswer.toLowerCase().trim() === targetUser.answer.toLowerCase()) {
            setRecoveryStep(3)
            setError('')
        } else {
            setError('Réponse incorrecte.')
        }
    }

    function handleRecoveryResetPassword(e) {
        e.preventDefault()
        if (newPassword !== confirmNewPassword) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        if (newPassword.length < 4) {
            setError('Le mot de passe doit contenir au moins 4 caractères.')
            return
        }
        
        // Mettre à jour le mot de passe dans l'état global
        onUpdateUserProfile(targetUser.role, targetUser.username, newPassword)
        
        setSuccess(`Le mot de passe de ${targetUser.username} a été mis à jour avec succès !`)
        setError('')
        
        // Retour au mode connexion
        setMode('login')
        setRecoveryStep(1)
        setTargetUser(null)
        setRecoveryAnswer('')
        setNewPassword('')
        setConfirmNewPassword('')
    }

    function toggleMode(newMode) {
        setMode(newMode)
        setError('')
        setSuccess('')
        setRecoveryStep(1)
        setTargetUser(null)
        setNewPassword('')
        setConfirmNewPassword('')
    }

    return (
        <div className="login-overlay">
            <style>
                {`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                .login-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--bg-color);
                    background-image: 
                        radial-gradient(at 0% 0%, hsla(180, 100%, 80%, 0.8) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, hsla(190, 100%, 80%, 0.8) 0px, transparent 50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    overflow-y: auto;
                }
                .login-card {
                    width: 100%;
                    max-width: 450px;
                    padding: 50px 30px;
                    text-align: center;
                }
                @media (max-width: 480px) {
                    .login-card { padding: 30px 20px; }
                    .login-icon { width: 80px; height: 80px; font-size: 40px; }
                }
                .login-icon {
                    width: 100px;
                    height: 100px;
                    background: var(--primary-gradient);
                    color: white;
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 30px auto;
                    box-shadow: 0 15px 35px rgba(0, 139, 139, 0.3);
                    font-size: 50px;
                }
                .login-input-group {
                    position: relative;
                    margin-bottom: 20px;
                    text-align: left;
                }
                .login-input-group .input-icon {
                    position: absolute;
                    left: 20px;
                    top: 15px;
                    color: var(--primary);
                    pointer-events: none;
                }
                .login-input {
                    width: 100%;
                    padding: 15px 50px 15px 55px;
                    border-radius: 18px;
                    border: 2px solid transparent;
                    background: rgba(255, 255, 255, 0.8);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    outline: none;
                    font-family: 'Outfit', sans-serif;
                }
                @media (max-width: 480px) {
                    .login-input { padding: 12px 40px 12px 45px; font-size: 0.9rem; }
                    .login-input-group .input-icon { left: 15px; top: 12px; font-size: 20px; }
                    .password-toggle { right: 12px; top: 12px; font-size: 20px; }
                }
                .password-toggle {
                    position: absolute;
                    right: 15px;
                    top: 15px;
                    color: #999;
                    cursor: pointer;
                    user-select: none;
                }
                .login-input:focus {
                    border-color: var(--primary-light);
                    background: white;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
                }
                .login-error {
                    color: #e74c3c;
                    background: rgba(231, 76, 60, 0.1);
                    padding: 10px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }
                .login-success {
                    color: #27ae60;
                    background: rgba(39, 174, 96, 0.1);
                    padding: 10px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                }
                .forgot-link {
                    display: block;
                    margin-top: 15px;
                    color: #999;
                    font-size: 0.9rem;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .forgot-link:hover { color: var(--primary); }
                `}
            </style>
            
            <div className="glass-card login-card animate-fade">
                <div style={{ marginBottom: '20px' }}>
                    <img src="logo512.png" alt="Logo VENTE PROS" style={{ width: '120px', height: '120px', borderRadius: '30px', boxShadow: '0 15px 35px rgba(0,139,139,0.3)' }} />
                </div>
                
                <h1 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '2.2rem', fontWeight: '900' }}>VENTE PROS</h1>
                
                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success">{success}</div>}

                {mode === 'login' && (
                    <>
                        <p style={{ color: '#666', marginBottom: '40px', fontWeight: '600' }}>Connectez-vous pour continuer</p>
                        <form onSubmit={handleSubmit} autoComplete="on">
                            <div className="login-input-group">
                                <span className="material-icons input-icon">person</span>
                                <input 
                                    className="login-input"
                                    type="text" 
                                    placeholder="Nom d'utilisateur" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">lock</span>
                                <input 
                                    className="login-input"
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Mot de passe" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    spellCheck="false"
                                />
                                <span className="material-icons password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>SE CONNECTER</button>
                        </form>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px', flexWrap: 'wrap' }}>
                            <span className="forgot-link" style={{ margin: 0 }} onClick={() => toggleMode('recovery')}>Mot de passe oublié ?</span>
                            <span className="forgot-link" style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }} onClick={() => toggleMode('register')}>Créer un compte</span>
                        </div>
                    </>
                )}

                {mode === 'register' && (
                    <>
                        <p style={{ color: '#666', marginBottom: '30px', fontWeight: '600' }}>Créer un nouveau compte</p>
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">badge</span>
                                <select 
                                    className="login-input"
                                    value={registerRole}
                                    onChange={(e) => setRegisterRole(e.target.value)}
                                    style={{ appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: '40px' }}
                                >
                                    <option value="admin">Administrateur (Gestion complète)</option>
                                    <option value="cashier">Vendeur / Caissier (Ventes uniquement)</option>
                                </select>
                                <span className="material-icons" style={{ position: 'absolute', right: '15px', top: '15px', pointerEvents: 'none', color: '#999' }}>arrow_drop_down</span>
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">person</span>
                                <input 
                                    className="login-input"
                                    type="text" 
                                    placeholder="Nom d'utilisateur" 
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">lock</span>
                                <input 
                                    className="login-input"
                                    type={showRegisterPassword ? "text" : "password"} 
                                    placeholder="Mot de passe" 
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    spellCheck="false"
                                />
                                <span className="material-icons password-toggle" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>
                                    {showRegisterPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">help_outline</span>
                                <input 
                                    className="login-input"
                                    type="text" 
                                    placeholder="Question de sécurité" 
                                    value={registerQuestion}
                                    onChange={(e) => setRegisterQuestion(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">edit</span>
                                <input 
                                    className="login-input"
                                    type="text" 
                                    placeholder="Réponse à la question" 
                                    value={registerAnswer}
                                    onChange={(e) => setRegisterAnswer(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>CRÉER LE COMPTE</button>
                        </form>
                        <span className="forgot-link" onClick={() => toggleMode('login')}>Retour à la connexion</span>
                    </>
                )}

                {mode === 'recovery' && (
                    <>
                        <p style={{ color: '#666', marginBottom: '30px', fontWeight: '600' }}>Récupération du compte</p>
                        
                        {recoveryStep === 1 ? (
                            <form onSubmit={handleRecoveryIdentify}>
                                <div className="login-input-group">
                                    <span className="material-icons input-icon">person</span>
                                    <input className="login-input" placeholder="Votre nom d'utilisateur" value={recoveryUsername} onChange={(e) => setRecoveryUsername(e.target.value)} required autoComplete="username" />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>SUIVANT</button>
                            </form>
                        ) : recoveryStep === 2 ? (
                            <form onSubmit={handleRecoveryVerify}>
                                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Question pour {targetUser.username} :</label>
                                    <p style={{ margin: '10px 0', fontWeight: '700' }}>{targetUser.question}</p>
                                </div>
                                <div className="login-input-group">
                                    <span className="material-icons input-icon">edit</span>
                                    <input className="login-input" placeholder="Votre réponse" value={recoveryAnswer} onChange={(e) => setRecoveryAnswer(e.target.value)} required />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>VÉRIFIER</button>
                            </form>
                        ) : (
                            <form onSubmit={handleRecoveryResetPassword}>
                                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                                    <p style={{ margin: '0 0 10px 0', fontWeight: '700', color: 'var(--primary)' }}>Saisissez votre nouveau mot de passe :</p>
                                </div>
                                <div className="login-input-group">
                                    <span className="material-icons input-icon">lock</span>
                                    <input className="login-input" type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="login-input-group">
                                    <span className="material-icons input-icon">lock_reset</span>
                                    <input className="login-input" type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>ENREGISTRER LE NOUVEAU CODE</button>
                            </form>
                        )}
                        <span className="forgot-link" onClick={() => toggleMode('login')}>Retour à la connexion</span>
                    </>
                )}
                
                <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#999' }}>&copy; 2024 VENTE PROS - Tous droits réservés</p>
            </div>
        </div>
    )
}

export default Login
