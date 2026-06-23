import { useState, useEffect } from 'react'
import Banner from './Banner'
import Cart from './Cart'
import ShoppingList from './ShoppingList'
import Inventory from './Inventory'
import History from './History'
import Receipt from './Receipt'
import Login from './Login'
import Settings from './Settings'

function App() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)

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
    const [activeTab, setActiveTab] = useState('sales')
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
        const rawUsers = getSavedData('users', [{ username: 'admin', password: 'admin', role: 'admin', question: 'Nom du créateur ?', answer: 'admin' }])
        return rawUsers.map(u => {
            if (u && !u.role) {
                return { ...u, role: u.username.toLowerCase() === 'admin' ? 'admin' : 'cashier' }
            }
            return u
        })
    })

    const [receiptData, setReceiptData] = useState(null)
    const [isReceiptOpen, setIsReceiptOpen] = useState(false)

    // Sauvegardes automatiques
    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(plants))
    }, [plants])

    useEffect(() => {
        localStorage.setItem('sales_history', JSON.stringify(salesHistory))
    }, [salesHistory])

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users))
    }, [users])

    function handlePayment() {
        if (cart.length === 0) return alert("Rien à encaisser !")

        const total = cart.reduce((acc, item) => acc + item.amount * item.price, 0)
        
        const newSale = {
            id: Math.floor(Math.random() * 9000) + 1000,
            date: new Date().toLocaleString('fr-FR'),
            customerName: customerName,
            cashier: currentUser ? currentUser.username : 'admin',
            items: [...cart],
            total: total
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

    function handleLogout() {
        if (window.confirm("Voulez-vous vous déconnecter ?")) {
            setIsLoggedIn(false)
            localStorage.removeItem('isLoggedIn')
            setCurrentUser(null)
            localStorage.removeItem('currentUser')
        }
    }

    function handleRegister(newUser) {
        setUsers([...users, newUser])
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

    const isAdmin = currentUser && currentUser.role === 'admin'

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} users={users} onRegister={handleRegister} />
    }

    return (
        <div>
            <Banner 
                isLoggedIn={isLoggedIn} 
                onLogout={handleLogout} 
                onInstall={handleInstallApp}
                showInstallButton={!!deferredPrompt}
                currentUser={currentUser}
            />
            
            <div className="tab-nav no-print">
                <button 
                    className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                    style={activeTab === 'sales' ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}
                >
                    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>shopping_cart</span>
                    VENTES
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                    style={activeTab === 'stock' ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}
                >
                    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>inventory_2</span>
                    STOCK
                </button>
                {isAdmin && (
                    <>
                        <button 
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                            style={activeTab === 'history' ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}
                        >
                            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>history</span>
                            HISTORIQUE
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                            style={activeTab === 'settings' ? { boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' } : {}}
                        >
                            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>settings</span>
                            PARAMÈTRES
                        </button>
                    </>
                )}
            </div>

            {activeTab !== 'history' && activeTab !== 'settings' && (plants || []).length > 0 && (
                <div className="no-print" style={{ display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                        <span className="material-icons" style={{ position: 'absolute', left: '15px', top: '22px', color: '#999' }}>search</span>
                        <input 
                            type="text" 
                            placeholder="Rechercher un produit..." 
                            style={{ paddingLeft: '45px', borderRadius: '50px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <main className="main-container no-print">
                {(plants || []).length === 0 && activeTab === 'sales' ? (
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
                    <>
                        {activeTab === 'sales' ? (
                            <>
                                <div className="cart-container" style={{ width: '350px' }}>
                                    <Cart 
                                        cart={cart} 
                                        updateCart={updateCart} 
                                        onPayment={handlePayment} 
                                        customerName={customerName}
                                        setCustomerName={setCustomerName}
                                    />
                                </div>
                                <div className="list-container" style={{ flex: 1 }}>
                                    <ShoppingList 
                                        plantList={(plants || []).filter(p => p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
                                        cart={cart} 
                                        updateCart={updateCart} 
                                    />
                                </div>
                            </>
                        ) : activeTab === 'stock' ? (
                            <Inventory 
                                plants={(plants || []).filter(p => p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
                                updatePlants={updatePlants} 
                                onAddClick={() => setModalOpen(true)}
                                isAdmin={isAdmin}
                                onUpdateProduct={handleUpdateProduct}
                            />
                        ) : activeTab === 'history' ? (
                            <History salesHistory={salesHistory} isAdmin={isAdmin} onExportData={handleExportData} />
                        ) : (
                            <Settings 
                                onExportData={handleExportData} 
                                onImportData={handleImportData} 
                                onResetInventory={handleResetInventory} 
                                currentUser={currentUser} 
                            />
                        )}
                    </>
                )}
            </main>

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
            />
        </div>
    )
}


export default App