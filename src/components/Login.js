import { useState } from 'react'

function Login({ onLogin, users, onRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [mode, setMode] = useState('login') // 'login', 'recovery', or 'signup'
    
    // Recovery states
    const [recoveryUsername, setRecoveryUsername] = useState('')
    const [recoveryStep, setRecoveryStep] = useState(1) // 1: identify user, 2: answer question
    const [targetUser, setTargetUser] = useState(null)
    const [recoveryAnswer, setRecoveryAnswer] = useState('')
    const [revealedPassword, setRevealedPassword] = useState('')
    
    // Signup states
    const [newUsername, setNewUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newQuestion, setNewQuestion] = useState('')
    const [newAnswer, setNewAnswer] = useState('')
    const [newRole, setNewRole] = useState('cashier')
    
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

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

    function handleRegisterSubmit(e) {
        e.preventDefault()
        if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase().trim())) {
            return setError('Ce nom d\'utilisateur existe déjà.')
        }

        onRegister({
            username: newUsername.trim(),
            password: newPassword,
            question: newQuestion,
            answer: newAnswer.toLowerCase().trim(),
            role: newRole
        })

        setSuccess('Compte créé avec succès ! Connectez-vous.')
        setMode('login')
        setUsername(newUsername)
        setNewUsername('')
        setNewPassword('')
        setNewQuestion('')
        setNewAnswer('')
        setNewRole('cashier')
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
            setRevealedPassword(targetUser.password)
            setError('')
        } else {
            setError('Réponse incorrecte.')
        }
    }

    function toggleMode(newMode) {
        setMode(newMode)
        setError('')
        setSuccess('')
        setRecoveryStep(1)
        setTargetUser(null)
        setRevealedPassword('')
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
                        <span className="forgot-link" onClick={() => toggleMode('signup')}>Créer un compte</span>
                        <span className="forgot-link" onClick={() => toggleMode('recovery')}>Mot de passe oublié ?</span>
                    </>
                )}

                {mode === 'signup' && (
                    <>
                        <p style={{ color: '#666', marginBottom: '30px', fontWeight: '600' }}>Nouvel Utilisateur</p>
                        <form onSubmit={handleRegisterSubmit} autoComplete="on">
                            <div className="login-input-group">
                                <span className="material-icons input-icon">person</span>
                                <input className="login-input" placeholder="Nom d'utilisateur" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required autoComplete="username" />
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">lock</span>
                                <input className="login-input" type="password" placeholder="Mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" />
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">help</span>
                                <input className="login-input" placeholder="Question secrète" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} required />
                            </div>
                            <div className="login-input-group">
                                <span className="material-icons input-icon">verified_user</span>
                                <input className="login-input" placeholder="Votre réponse" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} required />
                            </div>
                            <div className="login-input-group" style={{ position: 'relative' }}>
                                <span className="material-icons input-icon">badge</span>
                                <select 
                                    className="login-input" 
                                    value={newRole} 
                                    onChange={(e) => setNewRole(e.target.value)}
                                    required
                                    style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', background: 'rgba(255, 255, 255, 0.8)' }}
                                >
                                    <option value="cashier">Caissier</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                                <span className="material-icons" style={{ position: 'absolute', right: '20px', top: '15px', color: 'var(--primary)', pointerEvents: 'none' }}>expand_more</span>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>S'INSCRIRE</button>
                        </form>
                        <span className="forgot-link" onClick={() => toggleMode('login')}>Déjà un compte ? Se connecter</span>
                    </>
                )}

                {mode === 'recovery' && (
                    <>
                        <p style={{ color: '#666', marginBottom: '30px', fontWeight: '600' }}>Récupération</p>
                        
                        {revealedPassword ? (
                            <div className="login-success" style={{ padding: '20px' }}>
                                Votre mot de passe est : <br/>
                                <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{revealedPassword}</strong>
                            </div>
                        ) : recoveryStep === 1 ? (
                            <form onSubmit={handleRecoveryIdentify}>
                                <div className="login-input-group">
                                    <span className="material-icons input-icon">person</span>
                                    <input className="login-input" placeholder="Votre nom d'utilisateur" value={recoveryUsername} onChange={(e) => setRecoveryUsername(e.target.value)} required autoComplete="username" />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '18px' }}>SUIVANT</button>
                            </form>
                        ) : (
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
