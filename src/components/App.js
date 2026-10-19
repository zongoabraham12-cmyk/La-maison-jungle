import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import Cart from './Cart'
import ShoppingList from './ShoppingList'
import Inventory from './Inventory'
import History from './History'
import Receipt from './Receipt'
import Login from './Login'
import Settings from './Settings'
import PaymentModal from './PaymentModal'
import { getOrCreateDeviceId, verifyLicenseKey } from '../utils/license'
import { getSubscriptionStatus, grantMonthlyAccess } from '../utils/moneyFusion'

function App() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

    // Détection automatique du retour après un paiement réussi sur Money Fusion
    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search)
            if (urlParams.get('payment') === 'success') {
                grantMonthlyAccess(30)
                setActivationStatus(getSubscriptionStatus())
                alert("🎉 Félicitations ! Votre paiement a été validé avec succès. Votre abonnement VENTE PROS est actif pour 30 jours !")
                window.history.replaceState({}, document.title, window.location.pathname)
            }
        } catch (e) {
            console.error("Erreur vérification retour paiement:", e)
        }
    }, [])

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, [])

    const handleInstallApp = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };
    // Initialisation : on commence vide par défaut pour laisser l'utilisateur créer ses produits
    const getSavedData = (key, defaultValue) => {
        try {
            const saved = localStorage.getItem(key)
            if (!saved || saved === 'null' || saved === 'undefined') {
                return defaultValue
            }
            const parsed = JSON.parse(saved)
            // Si on attend un tableau (cas de plants, history, users), on vérifie que c'est bien un tableau
            if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
                return defaultValue
            }
            return parsed
        } catch (e) {
            console.error(`Error loading ${key} from localStorage:`, e)
            return defaultValue
        }
    }

    const [plants, updatePlants] = useState(() => getSavedData('inventory', []))
    const [salesHistory, setSalesHistory] = useState(() => getSavedData('sales_history', []))
    const [cart, updateCart] = useState([])
    const [activeTab, setActiveTab] = useState('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isModalOpen, setModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true')
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('currentUser')
            if (saved && saved !== 'null' && saved !== 'undefined') {
                const user = JSON.parse(saved)
                if (user && !user.role) {
                    user.role = user.username.toLowerCase() === 'admin' ? 'admin' : 'cashier'
                }
                return user
            }
            if (localStorage.getItem('isLoggedIn') === 'true') {
                return { username: 'admin', role: 'admin' }
            }
            return null
        } catch (e) {
            console.error("Error parsing currentUser:", e)
            return null
        }
    })
    const [customerName, setCustomerName] = useState('')
    const [users, setUsers] = useState(() => {
        const defaultUsers = [
            { username: 'admin', password: 'admin', role: 'admin', question: 'Nom du créateur ?', answer: 'admin' },
            { username: 'vendeuse', password: 'vendeuse', role: 'cashier', question: 'Nom de la vendeuse ?', answer: 'vendeuse' }
        ]
        const rawUsers = getSavedData('users', defaultUsers)
        
        let mergedUsers = [...rawUsers]
        const hasAdmin = mergedUsers.some(u => u && u.role === 'admin')
        const hasVendeuse = mergedUsers.some(u => u && u.role === 'cashier')
        
        if (!hasAdmin) {
            mergedUsers.push(defaultUsers[0])
        }
        if (!hasVendeuse) {
            mergedUsers.push(defaultUsers[1])
        }
        
        // Verrouiller la liste aux deux seuls rôles autorisés (un admin, une vendeuse)
        mergedUsers = mergedUsers.filter(u => u && (u.role === 'admin' || u.role === 'cashier'))
        
        return mergedUsers
    })

    const [receiptData, setReceiptData] = useState(null)
    const [isReceiptOpen, setIsReceiptOpen] = useState(false)
    const [receiptConfig, setReceiptConfig] = useState(() => getSavedData('receipt_config', {
        storeName: 'VENTE PROS',
        storeAddress: '',
        storePhone: '',
        storeSlogan: 'Expert en Solutions de Vente',
        footerMessage: 'Merci de votre confiance ! À bientôt chez nous.'
    }))

    // Sauvegardes automatiques
    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(plants))
    }, [plants])

    useEffect(() => {
        localStorage.setItem('sales_history', JSON.stringify(salesHistory))
    }, [salesHistory])

    useEffect(() => {
        localStorage.setItem('receipt_config', JSON.stringify(receiptConfig))
    }, [receiptConfig])

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users))
    }, [users])

    function handlePayment() {
        if (cart.length === 0) return alert("Rien à encaisser !")

        const total = cart.reduce((acc, item) => acc + item.amount * item.price, 0)
        const totalProfit = cart.reduce((acc, item) => acc + item.amount * (item.profit || 0), 0)
        
        const newSale = {
            id: Math.floor(Math.random() * 9000) + 1000,
            date: new Date().toLocaleString('fr-FR'),
            customerName: customerName,
            cashier: currentUser ? currentUser.username : 'admin',
            items: [...cart],
            total: total,
            totalProfit: totalProfit
        }

        const newPlants = plants.map(p => {
            const itemInCart = cart.find(item => item.id === p.id)
            return itemInCart ? { ...p, stock: p.stock - itemInCart.amount } : p
        })

        setReceiptData({
            cart: [...cart],
            total: total,
            customerName: customerName,
            saleId: newSale.id,
            date: newSale.date
        })

        updatePlants(newPlants)
        setSalesHistory([...salesHistory, newSale])
        setIsReceiptOpen(true)
    }

    function handleCloseReceipt() {
        setIsReceiptOpen(false)
        updateCart([])
        setCustomerName('')
        setReceiptData(null)
    }

    function addProduct(newProduct) {
        updatePlants([...plants, { ...newProduct, id: Date.now().toString() }])
        setModalOpen(false)
    }

    function handleLogin(user) {
        setIsLoggedIn(true)
        localStorage.setItem('isLoggedIn', 'true')
        setCurrentUser(user)
        localStorage.setItem('currentUser', JSON.stringify(user))
    }

    function handleRegister(role, username, password, question, answer) {
        if (!username || !username.trim()) {
            alert("Le nom d'utilisateur ne peut pas être vide.")
            return false
        }
        
        const usernameTrimmed = username.trim()
        const isTaken = users.some(u => u.role !== role && u.username.toLowerCase() === usernameTrimmed.toLowerCase())
        if (isTaken) {
            alert("Ce nom d'utilisateur est déjà pris par un autre compte.")
            return false
        }

        const registeredUser = { username: usernameTrimmed, password, role, question, answer }

        setUsers(prev => prev.map(u => {
            if (u.role === role) {
                return registeredUser
            }
            return u
        }))

        handleLogin(registeredUser)
        return true
    }

    function handleLogout() {
        if (window.confirm("Voulez-vous vous déconnecter ?")) {
            setIsLoggedIn(false)
            localStorage.removeItem('isLoggedIn')
            setCurrentUser(null)
            localStorage.removeItem('currentUser')
        }
    }

    function handleUpdateUserProfile(role, newUsername, newPassword) {
        if (!newUsername || !newUsername.trim()) {
            alert("Le nom d'utilisateur ne peut pas être vide.")
            return false
        }
        
        const usernameTrimmed = newUsername.trim()
        const isTaken = users.some(u => u.role !== role && u.username.toLowerCase() === usernameTrimmed.toLowerCase())
        if (isTaken) {
            alert("Ce nom d'utilisateur est déjà pris par l'autre compte.")
            return false
        }

        setUsers(prev => prev.map(u => {
            if (u.role === role) {
                return { ...u, username: usernameTrimmed, password: newPassword }
            }
            return u
        }))

        if (currentUser && currentUser.role === role) {
            const updatedUser = { ...currentUser, username: usernameTrimmed, password: newPassword }
            setCurrentUser(updatedUser)
            localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        }
        
        alert("✅ Identifiants mis à jour avec succès !")
        return true
    }

    // Gestion unifiée de l'abonnement mensuel (5 000 FCFA), de l'essai gratuit (7j) et de la licence
    const [activationStatus, setActivationStatus] = useState(() => getSubscriptionStatus())

    function handleActivateApp(key) {
        if (!key || !key.trim()) {
            alert("Veuillez saisir une clé d'activation.")
            return false
        }
        if (verifyLicenseKey(activationStatus.deviceId, key.trim())) {
            localStorage.setItem('app_activated', 'true')
            setActivationStatus(getSubscriptionStatus())
            alert("✅ Activation réussie ! Votre licence VENTE PROS est débloquée.")
            return true
        } else {
            alert("❌ Clé d'activation invalide pour cet appareil. Veuillez vérifier avec votre fournisseur.")
            return false
        }
    }

    // --- Export Backup (Admin) ---
    function handleExportData() {
        const data = {
            inventory: plants,
            sales_history: salesHistory,
            users: users,
            exportedAt: new Date().toLocaleString('fr-FR')
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ventepros_backup_${new Date().toISOString().slice(0,10)}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    // --- Import Backup (Admin) ---
    function handleImportData(e) {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result)
                if (data.inventory) updatePlants(data.inventory)
                if (data.sales_history) setSalesHistory(data.sales_history)
                if (data.users) setUsers(data.users)
                alert('✅ Données restaurées avec succès !')
            } catch (err) {
                alert('❌ Fichier invalide. Veuillez sélectionner un fichier de sauvegarde VENTE PROS.')
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    // --- Modifier un produit (Admin) ---
    function handleUpdateProduct(updatedProduct) {
        updatePlants(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
    }

    function handleResetInventory() {
        if (window.confirm("Voulez-vous vraiment supprimer TOUS les produits et recommencer à zéro ?")) {
            updatePlants([])
            localStorage.removeItem('inventory')
        }
    }

    function handleClearHistory() {
        if (window.confirm("Voulez-vous vraiment supprimer TOUT l'historique des ventes ? Cette action est irréversible.")) {
            setSalesHistory([])
            localStorage.removeItem('sales_history')
            alert("✅ Historique des ventes effacé avec succès.")
        }
    }

    function handleUpdateReceiptConfig(newConfig) {
        setReceiptConfig(newConfig)
        alert("✅ Personnalisation du reçu enregistrée !")
    }

    const isAdmin = currentUser && currentUser.role === 'admin'

    // Écran de blocage si la période d'essai est expirée et l'application n'est pas activée
    if (activationStatus.isExpired) {
        return (
            <div className="login-overlay">
                <div className="glass-card login-card animate-fade" style={{ maxWidth: '520px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <span className="material-icons notranslate" translate="no" style={{ fontSize: '64px', color: '#e74c3c' }}>warning</span>
                    </div>
                    <h1 style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '1.8rem', fontWeight: '900' }}>ESSAI EXPIRÉ</h1>
                    <p style={{ color: '#666', marginBottom: '20px', fontWeight: '600', lineHeight: '1.6' }}>
                        Votre période d'essai gratuite de 7 jours est terminée. 
                        Renouvelez votre accès par Mobile Money (5 000 FCFA/mois) ou contactez le support.
                    </p>

                    {/* Bouton Paiement Money Fusion 5000 FCFA */}
                    <button 
                        type="button"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="btn-primary" 
                        style={{ width: '100%', padding: '16px', fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px', background: 'linear-gradient(135deg, var(--primary) 0%, #00a8a8 100%)', boxShadow: '0 8px 20px rgba(0,139,139,0.3)', borderRadius: '18px' }}
                    >
                        <span className="material-icons">payments</span>
                        ⚡ PAYER PAR MOBILE MONEY (5 000 FCFA)
                    </button>

                    <div style={{ background: 'rgba(0, 139, 139, 0.08)', border: '1px solid rgba(0, 139, 139, 0.2)', padding: '15px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '5px' }}>Votre Code Machine Unique :</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '1.3rem', letterSpacing: '2px', color: 'var(--primary)' }}>{activationStatus.deviceId}</strong>
                            <button 
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(activationStatus.deviceId);
                                    alert("✅ Code Machine copié !");
                                }}
                                style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '8px' }}
                            >
                                Copier
                            </button>
                        </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const data = new FormData(e.target)
                        handleActivateApp(data.get('key'))
                    }}>
                        <div className="login-input-group" style={{ position: 'relative', marginBottom: '20px' }}>
                            <span className="material-icons notranslate input-icon" translate="no" style={{ position: 'absolute', left: '20px', top: '15px', color: 'var(--primary)' }}>vpn_key</span>
                            <input 
                                className="login-input" 
                                name="key" 
                                placeholder="J'ai une clé d'activation (ex: KEY-...)" 
                                required 
                                autoComplete="off" 
                                style={{ width: '100%', padding: '15px 15px 15px 50px', border: '1px solid #ccc', borderRadius: '18px', background: 'rgba(255,255,255,0.8)' }}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', padding: '16px', background: '#0f172a', borderRadius: '18px', fontWeight: '700' }}>
                            ACTIVER AVEC LA CLÉ
                        </button>
                    </form>

                    <PaymentModal 
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        subStatus={activationStatus}
                        onRefreshStatus={() => setActivationStatus(getSubscriptionStatus())}
                        onActivateKey={handleActivateApp}
                    />
                </div>
            </div>
        )
    }

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} users={users} onUpdateUserProfile={handleUpdateUserProfile} onRegister={handleRegister} />
    }

    return (
        <div className="app-layout">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isAdmin={isAdmin} 
                onLogout={handleLogout} 
                currentUser={currentUser} 
                onInstall={handleInstallApp} 
                showInstallButton={!!deferredPrompt}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activationStatus={activationStatus}
                onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            />

            <div className="content-layout">
                {/* Barre de recherche (visible sur les onglets sales ou stock) */}
                {activeTab !== 'dashboard' && activeTab !== 'history' && activeTab !== 'settings' && (plants || []).length > 0 && (
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 20px 0' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                            <span className="material-icons" style={{ position: 'absolute', left: '15px', top: '14px', color: '#999' }}>search</span>
                            <input 
                                type="text" 
                                placeholder="Rechercher un produit..." 
                                style={{ paddingLeft: '45px', borderRadius: '50px', width: '100%', height: '48px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <main style={{ minHeight: '100%' }}>
                    {activeTab === 'dashboard' ? (
                        <Dashboard 
                            plants={plants} 
                            salesHistory={salesHistory} 
                            isAdmin={isAdmin} 
                            setActiveTab={setActiveTab}
                            setModalOpen={setModalOpen}
                            onExportData={handleExportData}
                        />
                    ) : (plants || []).length === 0 && activeTab === 'sales' ? (
                        <div className="glass-card animate-fade" style={{ flex: 1, textAlign: 'center', padding: '60px 20px', margin: '20px' }}>
                            <span className="material-icons" style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '20px' }}>add_business</span>
                            <h2>Bienvenue dans votre gestionnaire de vente !</h2>
                            <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto 30px auto' }}>
                                Votre inventaire est vide. Pour commencer, allez dans l'onglet <strong>STOCK</strong> et cliquez sur le bouton <strong>"+"</strong> en bas à droite pour ajouter votre premier produit.
                            </p>
                            {activeTab === 'sales' && (
                                <button className="btn-primary" onClick={() => setActiveTab('stock')}>Aller au Stock</button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                            {activeTab === 'sales' ? (
                                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap-reverse' }}>
                                    <div className="cart-container" style={{ width: '350px', flexShrink: 0 }}>
                                        <Cart 
                                            cart={cart} 
                                            updateCart={updateCart} 
                                            onPayment={handlePayment} 
                                            customerName={customerName}
                                            setCustomerName={setCustomerName}
                                            plants={plants}
                                        />
                                    </div>
                                    <div className="list-container" style={{ flex: 1, minWidth: '300px' }}>
                                        <ShoppingList 
                                            plantList={(plants || []).filter(p => p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
                                            cart={cart} 
                                            updateCart={updateCart} 
                                        />
                                    </div>
                                </div>
                            ) : activeTab === 'stock' ? (
                                <Inventory 
                                    plants={(plants || []).filter(p => p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
                                    updatePlants={updatePlants} 
                                    onAddClick={() => setModalOpen(true)}
                                    isAdmin={isAdmin}
                                    onUpdateProduct={handleUpdateProduct}
                                    onResetInventory={handleResetInventory}
                                />
                            ) : activeTab === 'history' ? (
                                <History salesHistory={salesHistory} isAdmin={isAdmin} onExportData={handleExportData} />
                            ) : (
                                <Settings 
                                    onExportData={handleExportData} 
                                    onImportData={handleImportData} 
                                    onResetInventory={handleResetInventory}
                                    onClearHistory={handleClearHistory}
                                    currentUser={currentUser} 
                                    activationStatus={activationStatus}
                                    onActivateApp={handleActivateApp}
                                    users={users}
                                    onUpdateUserProfile={handleUpdateUserProfile}
                                    receiptConfig={receiptConfig}
                                    onUpdateReceiptConfig={handleUpdateReceiptConfig}
                                />
                            )}
                        </div>
                    )}
                </main>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ color: 'var(--primary)', marginBottom: '30px', textAlign: 'center', fontSize: '1.8rem' }}>Nouveau Produit</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const data = new FormData(e.target)
                            addProduct({
                                name: data.get('name'),
                                price: parseInt(data.get('price')),
                                profit: parseInt(data.get('profit')) || 0,
                                stock: parseInt(data.get('stock')),
                                category: 'personnalisé'
                            })
                        }}>
                            <div className="input-group">
                                <span className="material-icons">inventory</span>
                                <input name="name" placeholder="Nom du produit" required />
                            </div>
                            <div className="input-group">
                                <span className="material-icons">payments</span>
                                <input name="price" type="number" placeholder="Prix de vente (FCFA)" required />
                            </div>
                            <div className="input-group">
                                <span className="material-icons">trending_up</span>
                                <input name="profit" type="number" placeholder="Bénéfice par unité (FCFA)" required />
                            </div>
                            <div className="input-group">
                                <span className="material-icons">reorder</span>
                                <input name="stock" type="number" placeholder="Quantité initiale en stock" required />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '15px' }}>CRÉER LE PRODUIT</button>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', padding: '15px' }}>ANNULER</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Receipt 
                printData={receiptData} 
                isOpen={isReceiptOpen} 
                onClose={handleCloseReceipt}
                receiptConfig={receiptConfig}
            />

            {/* Modal de Paiement Money Fusion (5 000 FCFA / mois) & Licence */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                subStatus={activationStatus}
                onRefreshStatus={() => setActivationStatus(getSubscriptionStatus())}
                onActivateKey={handleActivateApp}
            />
        </div>
    )
}


export default App