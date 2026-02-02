import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CONTENT_TYPES, INVESTOR_TYPES, QUICK_PICKS } from '../constants/preferences.constants'
import { updatePreferences } from '../store/actions/user.action'

export function Preferences() {
    const navigate = useNavigate()
    const { user } = useSelector(storeState => storeState.userModule)
    const [preferences, setPreferences] = useState({
        'fav-coins': [],
        'investor-type': [],
        'content-type': []
    })
    const [originalPreferences, setOriginalPreferences] = useState({
        'fav-coins': [],
        'investor-type': [],
        'content-type': []
    })
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user?.preferences) {
            const prefs = {
                'fav-coins': user.preferences['fav-coins'] || [],
                'investor-type': user.preferences['investor-type'] || [],
                'content-type': user.preferences['content-type'] || []
            }
            setPreferences(prefs)
            setOriginalPreferences(JSON.parse(JSON.stringify(prefs)))
        }
    }, [user])

    const hasUnsavedChanges = JSON.stringify(preferences) !== JSON.stringify(originalPreferences)

    useEffect(() => {
        if (!hasUnsavedChanges) return

        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    function handleToggleCoin(coinId) {
        setPreferences(prev => {
            const current = prev['fav-coins']
            if (current.includes(coinId)) {
                return { ...prev, 'fav-coins': current.filter(id => id !== coinId) }
            } else {
                return { ...prev, 'fav-coins': [...current, coinId] }
            }
        })
    }

    function handleAddCustomCoin() {
        const coinId = searchInput.trim().toLowerCase()
        if (coinId && !preferences['fav-coins'].includes(coinId)) {
            setPreferences(prev => ({
                ...prev,
                'fav-coins': [...prev['fav-coins'], coinId]
            }))
            setSearchInput('')
        }
    }

    function handleRemoveCoin(coinId) {
        setPreferences(prev => ({
            ...prev,
            'fav-coins': prev['fav-coins'].filter(id => id !== coinId)
        }))
    }

    function handleToggleInvestorType(type) {
        setPreferences(prev => {
            const current = prev['investor-type']
            if (current.includes(type)) {
                return prev
            }
            return { ...prev, 'investor-type': [type] }
        })
    }

    function handleToggleContentType(type) {
        setPreferences(prev => {
            const current = prev['content-type']
            if (current.includes(type)) {
                return prev
            }
            return { ...prev, 'content-type': [type] }
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setErrorMsg('')
        setSuccessMsg('')
        setIsLoading(true)

        try {
            await updatePreferences(user._id, preferences)
            setOriginalPreferences(JSON.parse(JSON.stringify(preferences)))
            setSuccessMsg('Preferences updated successfully!')
            setErrorMsg('')
        } catch (err) {
            setErrorMsg(typeof err === 'string' ? err : 'Failed to update preferences')
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="preferences-container">
                <button
                    type="button"
                    className="btn-back"
                    onClick={() => navigate('/')}
                    aria-label="Back to dashboard"
                >
                    ← Back to Dashboard
                </button>
                <div className="preferences-empty">
                    <h1>Preferences</h1>
                    <p>Please log in to update your preferences.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="preferences-container">
            <button
                type="button"
                className="btn-back"
                onClick={() => navigate('/')}
                aria-label="Back to dashboard"
            >
                ← Back to Dashboard
            </button>
            <div className="preferences-header">
                <div>
                    <h1>Preferences</h1>
                    <p>Personalize your daily crypto brief.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {hasUnsavedChanges && (
                        <span className="pill pill--unsaved">Unsaved Changes</span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="preferences-form">
                <section className="preference-card">
                    <div className="preference-card-header">
                        <div>
                            <h2>Favorite Coins</h2>
                            <p>Add coins you track daily.</p>
                        </div>
                    </div>
                    <div className="preference-block">
                        <div className="quick-picks-section">
                            <p className="section-label">Quick picks</p>
                            <div className="quick-picks-grid">
                                {QUICK_PICKS.map(pick => (
                                    <button
                                        key={pick.id}
                                        type="button"
                                        className={`quick-pick-btn ${preferences['fav-coins'].includes(pick.id) ? 'active' : ''}`}
                                        onClick={() => handleToggleCoin(pick.id)}
                                    >
                                        {pick.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="advanced-section">
                            <button
                                type="button"
                                className="toggle-advanced"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                {showAdvanced ? '▼' : '▶'} Advanced: Search and add
                            </button>

                            {showAdvanced && (
                                <div className="advanced-options">
                                    <div className="search-add-section">
                                        <div className="search-input-group">
                                            <input
                                                type="text"
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                placeholder="Enter coin ID (e.g., bitcoin, ethereum)"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        handleAddCustomCoin()
                                                    }
                                                }}
                                            />
                                            <button type="button" onClick={handleAddCustomCoin}>Add</button>
                                        </div>
                                        <p className="helper-text">Tip: Use CoinGecko coin IDs (lowercase, e.g., "bitcoin" not "BTC")</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {preferences['fav-coins'].length > 0 && (
                            <div className="selected-coins">
                                <p className="section-label">Selected ({preferences['fav-coins'].length})</p>
                                <div className="selected-coins-list">
                                    {preferences['fav-coins'].map(coinId => (
                                        <span key={coinId} className="selected-coin-tag">
                                            {coinId}
                                            <button type="button" onClick={() => handleRemoveCoin(coinId)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="preference-card">
                    <div className="preference-card-header">
                        <div>
                            <h2>Investor Type</h2>
                            <p>Select 1 option that best describes you.</p>
                        </div>
                    </div>
                    <div className="preference-block">
                        <div className="options-grid">
                            {INVESTOR_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`option-btn ${preferences['investor-type'].includes(type.value) ? 'active' : ''}`}
                                    onClick={() => handleToggleInvestorType(type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="preference-card">
                    <div className="preference-card-header">
                        <div>
                            <h2>Content Types</h2>
                            <p>Select 1 option for your feed.</p>
                        </div>
                    </div>
                    <div className="preference-block">
                        <div className="options-grid">
                            {CONTENT_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`option-btn ${preferences['content-type'].includes(type.value) ? 'active' : ''}`}
                                    onClick={() => handleToggleContentType(type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {errorMsg && <p className="error">{errorMsg}</p>}
                {successMsg && <p className="success">{successMsg}</p>}

                <div className="preferences-actions">
                    <button
                        type="submit"
                        disabled={isLoading || !hasUnsavedChanges}
                        className={`btn-main ${hasUnsavedChanges ? 'btn-main--unsaved' : ''}`}
                    >
                        {isLoading ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'All Saved'}
                    </button>
                </div>
            </form>
        </div>
    )
}
