import React from 'react'

function ShoppingList({ plantList, cart, updateCart }) {
    function addToCart(name, price, id, stock) {
        const currentPlantInCart = cart.find((plant) => plant.id === id)
        const currentAmount = currentPlantInCart ? currentPlantInCart.amount : 0

        if (currentAmount >= stock) {
            alert(`Stock insuffisant pour ${name} !`)
            return
        }

        if (currentPlantInCart) {
            const cartFilteredCurrentPlant = cart.filter(
                (plant) => plant.id !== id
            )
            updateCart([
                ...cartFilteredCurrentPlant,
                { id, name, price, amount: currentAmount + 1 }
            ])
        } else {
            updateCart([...cart, { id, name, price, amount: 1 }])
        }
    }

    return (
        <div className="no-print" style={{ flex: 1, padding: '20px' }}>
            <h2 style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '10px' }}>
                Catalogue Produits
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px', marginTop: '20px' }}>
                {plantList.map((plant) => (
                    <div 
                        key={plant.id} 
                        className="glass-card animate-fade" 
                        style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                        onClick={() => addToCart(plant.name, plant.price, plant.id, plant.stock)}
                    >
                        {plant.isSpecialOffer && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                right: '-30px', 
                                background: 'var(--secondary)', 
                                color: 'white', 
                                padding: '5px 40px',
                                transform: 'rotate(45deg)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                OFFRE
                            </div>
                        )}
                        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>{plant.name}</h3>
                        <p style={{ margin: '5px 0', fontSize: '1.2rem', fontWeight: '700' }}>{plant.price} FCFA</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                            <span style={{ 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                background: plant.stock > 0 ? '#e8f5e9' : '#ffebee',
                                color: plant.stock > 0 ? '#2e7d32' : '#c62828',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                {plant.stock > 0 ? `${plant.stock} en stock` : 'Rupture'}
                            </span>
                            <button className="btn-primary" style={{ padding: '8px 15px' }}>
                                Ajouter +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ShoppingList