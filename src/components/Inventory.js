import React, { useState } from 'react'

function Inventory({ plants, updatePlants, onAddClick, isAdmin, onUpdateProduct, onResetInventory }) {
    const [editingProduct, setEditingProduct] = useState(null)

    function handleStockChange(id, delta) {
        updatePlants(prevPlants => prevPlants.map(p => {
            if (p.id === id) {
                const newStock = Math.max(0, p.stock + delta)
                return { ...p, stock: newStock }
            }
            return p
        }))
    }

    function deleteProduct(id) {
        if (window.confirm("Supprimer ce produit définitivement ?")) {
            updatePlants(prevPlants => prevPlants.filter(p => p.id !== id))
        }
    }

    function getStockStatus(stock) {
        if (stock === 0) return { color: '#c62828', bg: '#ffebee', label: 'Rupture', icon: 'error' }
        if (stock <= 5) return { color: '#e65100', bg: '#fff3e0', label: `${stock} — Stock bas !`, icon: 'warning' }
        return { color: '#2e7d32', bg: '#e8f5e9', label: `${stock} en stock`, icon: 'check_circle' }
    }

    return (
        <div style={{ flex: 1, padding: '20px', position: 'relative' }}>
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '15px 30px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem' }}>
                    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '10px' }}>inventory_2</span>
                    GESTION DES STOCKS
                </h2>
                {isAdmin && (
                    <button 
                        onClick={onResetInventory} 
                        style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', fontSize: '0.75rem', padding: '8px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '16px' }}>delete_sweep</span>
                        RÉINITIALISER
                    </button>
                )}
            </div>

            {/* Modal d'édition de produit */}
            {editingProduct && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ color: 'var(--primary)', marginBottom: '25px', textAlign: 'center', fontSize: '1.5rem' }}>
                            <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>edit</span>
                            Modifier le Produit
                        </h2>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const data = new FormData(e.target)
                            onUpdateProduct({
                                ...editingProduct,
                                name: data.get('name'),
                                price: parseInt(data.get('price')),
                                stock: parseInt(data.get('stock')),
                                category: data.get('category') || editingProduct.category || 'personnalisé'
                            })
                            setEditingProduct(null)
                        }}>
                            <div className="input-group">
                                <span className="material-icons">inventory</span>
                                <input name="name" defaultValue={editingProduct.name} placeholder="Nom du produit" required />
                            </div>
                            <div className="input-group">
                                <span className="material-icons">payments</span>
                                <input name="price" type="number" defaultValue={editingProduct.price} placeholder="Prix de vente (FCFA)" required />
                            </div>
                            <div className="input-group">
                                <span className="material-icons">reorder</span>
                                <input name="stock" type="number" defaultValue={editingProduct.stock} placeholder="Quantité en stock" required />
                            </div>
                            <div className="input-group">
                                <span className="material-icons">category</span>
                                <input name="category" defaultValue={editingProduct.category || ''} placeholder="Catégorie (ex: boissons)" />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px' }}>ENREGISTRER</button>
                                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', padding: '14px' }}>ANNULER</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {plants.map(plant => {
                    const status = getStockStatus(plant.stock)
                    return (
                        <div key={plant.id} className="glass-card animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                            {/* Alerte stock bas */}
                            {plant.stock <= 5 && (
                                <div style={{ 
                                    position: 'absolute', top: 0, left: 0, right: 0, 
                                    background: plant.stock === 0 ? '#c62828' : '#e65100', 
                                    color: 'white', fontSize: '0.7rem', fontWeight: '700', 
                                    padding: '4px 12px', textAlign: 'center', letterSpacing: '1px' 
                                }}>
                                    {plant.stock === 0 ? '⚠️ RUPTURE DE STOCK' : '⚠️ STOCK BAS'}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: plant.stock <= 5 ? '22px' : '0' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.15rem', textTransform: 'capitalize' }}>{plant.name}</h3>
                                    {plant.category && <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px', textTransform: 'uppercase' }}>{plant.category}</div>}
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '6px' }}>{plant.price} FCFA</div>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {isAdmin && (
                                        <button onClick={() => setEditingProduct(plant)} style={{ background: 'rgba(0,139,139,0.08)', color: 'var(--primary)', padding: '7px', boxShadow: 'none', borderRadius: '10px' }}>
                                            <span className="material-icons" style={{ fontSize: '18px' }}>edit</span>
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => deleteProduct(plant.id)} style={{ background: 'transparent', color: '#ccc', padding: '7px', boxShadow: 'none', borderRadius: '10px' }}>
                                            <span className="material-icons" style={{ fontSize: '18px' }}>delete_outline</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '15px', borderRadius: '18px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>Stock Actuel</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                    <button 
                                        onClick={() => handleStockChange(plant.id, -1)}
                                        style={{ background: 'white', color: 'var(--primary)', width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}
                                    >-</button>
                                    <span style={{ fontSize: '1.8rem', fontWeight: '800', minWidth: '60px', color: status.color }}>
                                        {plant.stock}
                                    </span>
                                    <button 
                                        onClick={() => handleStockChange(plant.id, 1)}
                                        style={{ background: 'white', color: 'var(--primary)', width: '40px', height: '40px', padding: 0, borderRadius: '12px' }}
                                    >+</button>
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '0.78rem', padding: '4px 12px', background: status.bg, color: status.color, borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                    <span className="material-icons" style={{ fontSize: '14px' }}>{status.icon}</span>
                                    {status.label}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Bouton flottant style Flutter */}
            <button className="fab no-print" onClick={onAddClick}>
                +
            </button>
        </div>
    )
}

export default Inventory
