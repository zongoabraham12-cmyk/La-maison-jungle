import React from 'react'

function Receipt({ printData, isOpen, onClose }) {
    if (!isOpen || !printData) return null;

    const { cart, total, customerName, saleId, date } = printData;

    return (
        <div className="modal-overlay receipt-overlay">
            <div className="modal-content receipt-modal-content" style={{ background: '#fff', color: '#000', padding: '30px', maxWidth: '480px', borderRadius: '20px' }}>
                <div id="receipt-container" style={{ fontFamily: "'Courier New', Courier, monospace", width: '100%', margin: '0 auto' }}>
                    {/* En-tête */}
                    <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '15px', marginBottom: '15px' }}>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>VENTE PROS</h1>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#555' }}>Expert en Solutions de Vente</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#333' }}>
                            <span>Ticket n° {saleId}</span>
                            <span>{date}</span>
                        </div>
                        {customerName && (
                            <div style={{ marginTop: '10px', padding: '8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'left' }}>
                                <span style={{ fontSize: '12px' }}>Client : <strong style={{ fontSize: '14px' }}>{customerName.toUpperCase()}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Tableau des articles */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '12px', width: '50%' }}>Produit</th>
                                <th style={{ textAlign: 'center', padding: '6px 0', fontSize: '12px', width: '20%' }}>Qté</th>
                                <th style={{ textAlign: 'right', padding: '6px 0', fontSize: '12px', width: '30%' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '6px 0', fontSize: '12px' }}>{item.name}</td>
                                    <td style={{ textAlign: 'center', fontSize: '12px' }}>{item.amount}</td>
                                    <td style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>{item.amount * item.price} FCFA</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total */}
                    <div style={{ borderTop: '2px solid #000', paddingTop: '10px', textAlign: 'right', marginBottom: '20px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' }}>TOTAL : {total} FCFA</div>
                    </div>

                    {/* Pied de page */}
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                        <p style={{ margin: '3px 0' }}>Merci de votre confiance !</p>
                        <p style={{ margin: '3px 0' }}>À bientôt chez VENTE PROS</p>
                    </div>
                </div>

                {/* Contrôles de la Modal (Masqués à l'impression) */}
                <div className="no-print" style={{ display: 'flex', gap: '15px', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <button 
                        className="btn-primary" 
                        onClick={() => window.print()} 
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontSize: '0.9rem' }}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>print</span>
                        IMPRIMER
                    </button>
                    <button 
                        onClick={onClose} 
                        style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '12px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '700' }}
                    >
                        FERMER
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Receipt
