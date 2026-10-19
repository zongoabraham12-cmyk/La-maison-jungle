function Cart({ cart, updateCart, onPayment, customerName, setCustomerName, plants }) {
    const total = cart.reduce((acc, item) => acc + item.amount * item.price, 0)

    function increaseQuantity(id) {
        const product = (plants || []).find(p => p.id === id)
        updateCart(prevCart => prevCart.map(item => {
            if (item.id === id) {
                if (product && item.amount >= product.stock) {
                    alert(`Stock maximum disponible atteint (${product.stock}) pour ${item.name} !`)
                    return item
                }
                return { ...item, amount: item.amount + 1 }
            }
            return item
        }))
    }

    function decreaseQuantity(id) {
        updateCart(prevCart => prevCart.map(item => {
            if (item.id === id) {
                return { ...item, amount: item.amount - 1 }
            }
            return item
        }).filter(item => item.amount > 0))
    }

    function removeFromCart(id) {
        updateCart(prevCart => prevCart.filter(item => item.id !== id))
    }

    if (cart.length === 0) {
        return (
            <div className="glass-card no-print animate-fade" style={{ margin: '20px' }}>
                <h2 style={{ color: 'var(--primary)' }}>Caisse</h2>
                <p>Votre panier est vide.</p>
            </div>
        )
    }

    return (
        <div className="glass-card no-print animate-fade" style={{ margin: '20px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '10px' }}>
                Caisse
            </h2>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                {cart.map(({ name, price, amount, id }) => (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee', gap: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={name}>{name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{price.toLocaleString('fr-FR')} FCFA / u</div>
                            <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem', marginTop: '2px' }}>
                                {(price * amount).toLocaleString('fr-FR')} FCFA
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', padding: '3px' }}>
                                <button 
                                    onClick={() => decreaseQuantity(id)}
                                    title="Diminuer la quantité (-1)"
                                    style={{ width: '28px', height: '28px', padding: 0, borderRadius: '8px', background: 'white', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                                >
                                    -
                                </button>
                                <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                                    {amount}
                                </span>
                                <button 
                                    onClick={() => increaseQuantity(id)}
                                    title="Augmenter la quantité (+1)"
                                    style={{ width: '28px', height: '28px', padding: 0, borderRadius: '8px', background: 'white', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                                >
                                    +
                                </button>
                            </div>

                            <button 
                                onClick={() => removeFromCart(id)}
                                title="Supprimer cet article"
                                style={{ width: '32px', height: '32px', padding: 0, borderRadius: '10px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}
                            >
                                <span className="material-icons notranslate" translate="no" style={{ fontSize: '18px' }}>delete_outline</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ borderTop: '2px solid var(--primary)', paddingTop: '15px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <span className="material-icons">person</span>
                        <input 
                            type="text" 
                            placeholder="Nom du client (optionnel)" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '20px' }}>
                    <span>Total</span>
                    <span>{total} FCFA</span>
                </div>
                <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                    onClick={onPayment}
                >
                    ENCAISSER & REÇU
                </button>
                <button 
                    style={{ width: '100%', marginTop: '10px', background: 'transparent', color: '#e74c3c' }}
                    onClick={() => updateCart([])}
                >
                    Vider le panier
                </button>
            </div>
        </div>
    )
}

export default Cart
