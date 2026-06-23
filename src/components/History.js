import React, { useState } from 'react'

function History({ salesHistory, isAdmin, onExportData }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDate, setFilterDate] = useState('')

    const totalRevenue = salesHistory.reduce((acc, sale) => acc + sale.total, 0)
    const totalTransactions = salesHistory.length

    // Filtrage des ventes
    const filteredSales = salesHistory.slice().reverse().filter(sale => {
        const matchesSearch = 
            !searchQuery ||
            sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(sale.id).includes(searchQuery) ||
            sale.cashier?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDate = !filterDate || sale.date?.startsWith(filterDate.split('-').reverse().join('/'))
        return matchesSearch && matchesDate
    })

    // Top produits vendus
    const productSales = {}
    salesHistory.forEach(sale => {
        sale.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.amount
        })
    })
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    // Export CSV
    function handleExportCSV() {
        const rows = [
            ['Ticket', 'Date', 'Client', 'Caissier', 'Articles', 'Total (FCFA)'],
            ...salesHistory.map(sale => [
                sale.id,
                sale.date,
                sale.customerName || 'N/A',
                sale.cashier || 'admin',
                sale.items.map(i => `${i.amount}x ${i.name}`).join(' | '),
                sale.total
            ])
        ]
        const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ventepros_ventes_${new Date().toISOString().slice(0,10)}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="animate-fade" style={{ flex: 1, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '2px solid var(--primary)', paddingBottom: '15px', marginBottom: '30px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>
                    Historique & Performance
                </h2>
                {isAdmin && salesHistory.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleExportCSV}
                            style={{ background: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', fontSize: '0.75rem', padding: '8px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <span className="material-icons" style={{ fontSize: '16px' }}>table_view</span>
                            EXPORT CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Dashboard Statistiques */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div className="stat-card">
                    <span className="stat-label">Chiffre d'Affaires</span>
                    <span className="stat-value">{totalRevenue.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="stat-card" style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                    <span className="stat-label" style={{ color: '#666' }}>Transactions</span>
                    <span className="stat-value">{totalTransactions}</span>
                </div>
                {totalTransactions > 0 && (
                    <div className="stat-card" style={{ background: 'white', color: '#7c3aed', border: '1px solid #ede9fe' }}>
                        <span className="stat-label" style={{ color: '#666' }}>Ticket Moyen</span>
                        <span className="stat-value" style={{ color: '#7c3aed' }}>{Math.round(totalRevenue / totalTransactions).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                )}
            </div>

            {/* Top Produits */}
            {topProducts.length > 0 && (
                <div className="glass-card" style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: 'var(--primary)', margin: '0 0 15px 0', fontSize: '1rem' }}>
                        <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px', fontSize: '18px' }}>emoji_events</span>
                        Top Produits Vendus
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {topProducts.map(([name, qty], index) => (
                            <div key={name} style={{ 
                                background: index === 0 ? 'var(--primary-gradient)' : 'rgba(0,139,139,0.08)',
                                color: index === 0 ? 'white' : 'var(--primary)',
                                padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                {index === 0 && <span className="material-icons" style={{ fontSize: '16px' }}>star</span>}
                                <span style={{ textTransform: 'capitalize' }}>{name}</span>
                                <span style={{ opacity: 0.8 }}>({qty})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filtres de recherche */}
            {salesHistory.length > 0 && (
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
                        <span className="material-icons" style={{ position: 'absolute', left: '15px', top: '13px', color: '#999', fontSize: '20px' }}>search</span>
                        <input 
                            type="text"
                            placeholder="Chercher par client, ticket ou caissier..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '45px', borderRadius: '12px', width: '100%' }}
                        />
                    </div>
                    <input 
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ borderRadius: '12px', flex: 1, minWidth: '150px', padding: '10px 15px' }}
                    />
                    {(searchQuery || filterDate) && (
                        <button onClick={() => { setSearchQuery(''); setFilterDate('') }} style={{ background: '#f1f5f9', color: '#64748b', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem' }}>
                            Réinitialiser
                        </button>
                    )}
                </div>
            )}

            {salesHistory.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <span className="material-icons" style={{ fontSize: '48px', color: '#ccc' }}>history</span>
                    <p>Aucune vente enregistrée pour le moment.</p>
                </div>
            ) : filteredSales.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <span className="material-icons" style={{ fontSize: '48px', color: '#ccc' }}>search_off</span>
                    <p>Aucun résultat pour cette recherche.</p>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="pro-table">
                        <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Ticket / Date</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Articles</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Client</th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id}>
                                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: '700' }}>#{sale.id}</div>
                                        <div style={{ opacity: 0.6, fontSize: '0.8rem' }}>{sale.date}</div>
                                        {sale.cashier && (
                                            <div style={{ color: '#888', fontSize: '0.78rem', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <span className="material-icons" style={{ fontSize: '12px' }}>person</span>
                                                {sale.cashier}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {sale.items.map(item => (
                                            <span key={item.id} style={{ display: 'block', fontSize: '0.85rem' }}>
                                                {item.amount}x {item.name}
                                            </span>
                                        ))}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        {sale.customerName 
                                            ? <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>{sale.customerName}</span>
                                            : <span style={{ color: '#ccc', fontSize: '0.8rem' }}>—</span>
                                        }
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                                        {sale.total.toLocaleString('fr-FR')} FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default History
