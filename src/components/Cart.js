function Cart({ cart, updateCart, onPayment, customerName, setCustomerName }) {
    const total = cart.reduce((acc, item) => acc + item.amount * item.price, 0)

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
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        <div>
                            <div style={{ fontWeight: '600' }}>{name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{price} FCFA x {amount}</div>
                        </div>
                        <div style={{ fontWeight: '700' }}>{price * amount} FCFA</div>
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
