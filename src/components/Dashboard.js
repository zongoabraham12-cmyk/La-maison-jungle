import React from 'react'

function Dashboard({ plants, salesHistory, isAdmin, setActiveTab, setModalOpen, onExportData }) {
    // 1. Calcul des indicateurs rapides
    const totalProducts = plants.length
    
    // Alertes stock (bas <= 5 ou rupture = 0)
    const alertProducts = plants.filter(p => p.stock <= 5)
    const stockAlertCount = alertProducts.length
    const outOfStockCount = plants.filter(p => p.stock === 0).length

    // Ventes et bénéfices du jour
    const todayStr = new Date().toLocaleDateString('fr-FR')
    const todaySales = salesHistory.filter(sale => {
        if (!sale.date) return false
        return sale.date.split(' ')[0] === todayStr
    })
    
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
    const todayProfit = todaySales.reduce((sum, s) => sum + (s.totalProfit || 0), 0)
    const todayTransactions = todaySales.length

    // 2. Statistiques des 7 derniers jours pour le graphique
    const getLast7DaysStats = () => {
        const stats = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toLocaleDateString('fr-FR')
            
            const daySales = salesHistory.filter(sale => {
                if (!sale.date) return false
                return sale.date.split(' ')[0] === dateStr
            })
            
            const revenue = daySales.reduce((sum, s) => sum + s.total, 0)
            const profit = daySales.reduce((sum, s) => sum + (s.totalProfit || 0), 0)
            const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' })
            
            stats.push({
                dayName: dayName.toUpperCase().replace('.', ''),
                revenue,
                profit
            })
        }
        return stats
    }

    const chartData = getLast7DaysStats()
    const maxVal = Math.max(...chartData.map(d => isAdmin ? Math.max(d.revenue, d.profit) : d.revenue), 10000)

    // Coordonnées pour tracer les courbes SVG
    const width = 500
    const height = 180
    const padding = 25

    const getCoordinates = (type) => {
        return chartData.map((d, index) => {
            const x = padding + (index * (width - padding * 2) / (chartData.length - 1))
            const val = type === 'revenue' ? d.revenue : d.profit
            const y = height - padding - (val * (height - padding * 2) / maxVal)
            return { x, y }
        })
    }

    const revenueCoords = getCoordinates('revenue')
    const profitCoords = getCoordinates('profit')

    const createPathD = (coords) => {
        if (coords.length === 0) return ''
        return `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ')
    }

    const revenuePath = createPathD(revenueCoords)
    const profitPath = createPathD(profitCoords)

    return (
        <div className="animate-fade" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Titre Accueil */}
            <div className="glass-card" style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="material-icons">space_dashboard</span>
                        Tableau de bord
                    </h2>
                    <p style={{ color: '#666', marginTop: '6px', fontSize: '0.9rem', margin: 0 }}>
                        Suivi rapide des ventes, stocks et alertes critiques.
                    </p>
                </div>
                <div style={{ background: 'rgba(0,139,139,0.08)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
                    Aujourd'hui : {todayStr}
                </div>
            </div>

            {/* Statistiques Rapides */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {/* Produits catalogue */}
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                    <div style={{ background: 'rgba(0, 139, 139, 0.1)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '30px' }}>inventory_2</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>Produits</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: 'var(--text-dark)' }}>{totalProducts}</span>
                    </div>
                </div>

                {/* Stock Alerte */}
                <div 
                    className="glass-card" 
                    onClick={() => setActiveTab('stock')}
                    style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', cursor: 'pointer', border: stockAlertCount > 0 ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid var(--glass-border)' }}
                >
                    <div style={{ 
                        background: stockAlertCount > 0 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 125, 50, 0.1)', 
                        color: stockAlertCount > 0 ? '#e74c3c' : '#2e7d32', 
                        width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <span className="material-icons" style={{ fontSize: '30px' }}>{stockAlertCount > 0 ? 'notification_important' : 'check_circle'}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>Stock Faible</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: stockAlertCount > 0 ? '#e74c3c' : 'var(--text-dark)' }}>{stockAlertCount}</span>
                    </div>
                </div>

                {/* Ventes du Jour */}
                <div 
                    className="glass-card" 
                    onClick={() => isAdmin ? setActiveTab('history') : setActiveTab('sales')}
                    style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', cursor: 'pointer' }}
                >
                    <div style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '30px' }}>point_of_sale</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', textTransform: 'uppercase' }}>Ventes du jour</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: '800', display: 'block', color: '#7c3aed' }}>{todayTransactions}</span>
                    </div>
                </div>

                {/* Chiffre d'Affaires du Jour / Bénéfice */}
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'var(--primary-gradient)', color: 'white' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', width: '60px', height: '60px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-icons" style={{ fontSize: '30px' }}>payments</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600', textTransform: 'uppercase' }}>
                            {isAdmin ? "Bénéfice du Jour" : "C.A. du Jour"}
                        </span>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', display: 'block' }}>
                            {isAdmin ? todayProfit.toLocaleString('fr-FR') : todayRevenue.toLocaleString('fr-FR')} FCFA
                        </span>
                    </div>
                </div>
            </div>

            {/* Zone Graphiques & Alertes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
                
                {/* Graphique d'évolution des ventes */}
                <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-icons">show_chart</span>
                            Activité des 7 derniers jours
                        </h3>
                        {isAdmin && (
                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', fontWeight: '600' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span> C.A.
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2e7d32' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2e7d32', display: 'inline-block' }}></span> Bénéfice
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* SVG Chart */}
                    <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            {/* Grilles horizontales */}
                            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                                const y = padding + r * (height - padding * 2)
                                const labelVal = Math.round(maxVal - r * maxVal)
                                return (
                                    <g key={i}>
                                        <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                                        <text x={padding - 5} y={y + 4} fontSize="8" textAnchor="end" fill="#94a3b8">{labelVal}</text>
                                    </g>
                                )
                            })}

                            {/* Courbe Chiffre d'Affaires */}
                            {revenueCoords.length > 0 && (
                                <>
                                    <path d={revenuePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    {revenueCoords.map((c, i) => (
                                        <circle key={i} cx={c.x} cy={c.y} r="4" fill="var(--primary)" stroke="white" strokeWidth="1.5" />
                                    ))}
                                </>
                            )}

                            {/* Courbe Bénéfice (Admin seulement) */}
                            {isAdmin && profitCoords.length > 0 && (
                                <>
                                    <path d={profitPath} fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    {profitCoords.map((c, i) => (
                                        <circle key={i} cx={c.x} cy={c.y} r="4" fill="#2e7d32" stroke="white" strokeWidth="1.5" />
                                    ))}
                                </>
                            )}

                            {/* Libellés de date (X) */}
                            {chartData.map((d, i) => {
                                const x = padding + (i * (width - padding * 2) / (chartData.length - 1))
                                return (
                                    <text key={i} x={x} y={height - 5} fontSize="9" fontWeight="600" textAnchor="middle" fill="#64748b">
                                        {d.dayName}
                                    </text>
                                )
                            })}
                        </svg>
                    </div>
                </div>

                {/* Section Alertes critiques & Priorités */}
                <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, color: '#c62828', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">assignment_late</span>
                        Tâches et alertes stock
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', maxHeight: '180px' }}>
                        {outOfStockCount > 0 && (
                            <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 15px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '700' }}>
                                <span className="material-icons">error</span>
                                <span>{outOfStockCount} produit(s) en rupture totale de stock !</span>
                            </div>
                        )}

                        {alertProducts.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#64748b', gap: '10px', padding: '20px 0' }}>
                                <span className="material-icons" style={{ fontSize: '36px', color: '#2e7d32' }}>verified</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Tous les stocks sont au vert ! Aucun produit critique.</span>
                            </div>
                        ) : (
                            alertProducts.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '10px 15px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.04)' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'capitalize' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: p.stock === 0 ? '#c62828' : '#e65100', fontWeight: '600' }}>
                                            {p.stock === 0 ? 'En Rupture' : `${p.stock} unités restantes`}
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => setActiveTab('stock')}
                                            style={{ padding: '6px 12px', fontSize: '0.7rem', background: 'var(--primary)', color: 'white', borderRadius: '8px' }}
                                        >
                                            RÉAPPROVISIONNER
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modules Principaux (Raccourcis rapides) */}
            <div className="glass-card" style={{ padding: '25px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons">bolt</span>
                    Modules et actions rapides
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                    {/* Nouvelle Vente */}
                    <button 
                        onClick={() => setActiveTab('sales')}
                        className="btn-primary"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 15px', borderRadius: '20px', textTransform: 'none', letterSpacing: '0' }}
                    >
                        <span className="material-icons" style={{ fontSize: '28px' }}>add_shopping_cart</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Nouvelle Vente</span>
                    </button>

                    {/* Stock */}
                    <button 
                        onClick={() => setActiveTab('stock')}
                        style={{ background: 'white', border: '1px solid #cbd5e1', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 15px', borderRadius: '20px', textTransform: 'none', letterSpacing: '0' }}
                    >
                        <span className="material-icons" style={{ fontSize: '28px' }}>inventory_2</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Gérer le Stock</span>
                    </button>

                    {/* Historique */}
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveTab('history')}
                            style={{ background: 'white', border: '1px solid #cbd5e1', color: '#7c3aed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 15px', borderRadius: '20px', textTransform: 'none', letterSpacing: '0' }}
                        >
                            <span className="material-icons" style={{ fontSize: '28px' }}>history</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Historique</span>
                        </button>
                    )}

                    {/* Sauvegarde */}
                    {isAdmin && (
                        <button 
                            onClick={onExportData}
                            style={{ background: 'white', border: '1px solid #cbd5e1', color: '#2e7d32', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px 15px', borderRadius: '20px', textTransform: 'none', letterSpacing: '0' }}
                        >
                            <span className="material-icons" style={{ fontSize: '28px' }}>cloud_download</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Sauvegarde</span>
                        </button>
                    )}
                </div>
            </div>

        </div>
    )
}

export default Dashboard
