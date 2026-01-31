import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { updatePreferences } from '../store/actions/user.action'

export function Preferences() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [preferences, setPreferences] = useState({
        'fav-coins': [],
        'investor-type': '',
        'content-type': []
    })
    const [originalPreferences, setOriginalPreferences] = useState({
        'fav-coins': [],
        'investor-type': '',
        'content-type': []
    })
    const [favCoinInput, setFavCoinInput] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user?.preferences) {
            const prefs = {
                'fav-coins': user.preferences['fav-coins'] || [],
                'investor-type': user.preferences['investor-type'] || '',
                'content-type': user.preferences['content-type'] || []
            }
            setPreferences(prefs)
            setOriginalPreferences(prefs)
        }
    }, [user])

    // Check if preferences have changed
    const hasUnsavedChanges = JSON.stringify(preferences) !== JSON.stringify(originalPreferences)

    // Warn before leaving with unsaved changes
    useEffect(() => {
        if (!hasUnsavedChanges) return

        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    function handleInvestorTypeChange(e) {
        setPreferences(prev => ({
            ...prev,
            'investor-type': e.target.value
        }))
    }

    function handleContentTypeChange(e) {
        const value = e.target.value
        const checked = e.target.checked
        setPreferences(prev => ({
            ...prev,
            'content-type': checked
                ? [...prev['content-type'], value]
                : prev['content-type'].filter(type => type !== value)
        }))
    }

    function handleAddFavCoin() {
        if (favCoinInput.trim() && !preferences['fav-coins'].includes(favCoinInput.trim())) {
            setPreferences(prev => ({
                ...prev,
                'fav-coins': [...prev['fav-coins'], favCoinInput.trim()]
            }))
            setFavCoinInput('')
        }
    }

    function handleRemoveFavCoin(coin) {
        setPreferences(prev => ({
            ...prev,
            'fav-coins': prev['fav-coins'].filter(c => c !== coin)
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setErrorMsg('')
        setSuccessMsg('')
        setIsLoading(true)

        try {
            await updatePreferences(user._id, preferences)
            setOriginalPreferences(preferences) // Update original after successful save
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
                <div className="preferences-empty">
                    <h1>Preferences</h1>
                    <p>Please log in to update your preferences.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="preferences-container">
            <div className="preferences-header">
                <div>
                    <h1>Preferences</h1>
                    <p>Personalize your daily crypto brief.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {hasUnsavedChanges && (
                        <span className="pill pill--unsaved">Unsaved Changes</span>
                    )}
                    <span className="pill">Onboarding</span>
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
                    <label className="preference-block">
                        <div className="fav-coins-input">
                            <input
                                type="text"
                                value={favCoinInput}
                                onChange={(e) => setFavCoinInput(e.target.value)}
                                placeholder="Enter coin name (e.g., bitcoin)"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddFavCoin()
                                    }
                                }}
                            />
                            <button type="button" onClick={handleAddFavCoin}>Add</button>
                        </div>
                        <div className="fav-coins-list">
                            {preferences['fav-coins'].map((coin, idx) => (
                                <span key={idx} className="fav-coin-tag">
                                    {coin}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFavCoin(coin)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </label>
                </section>

                <section className="preference-card">
                    <div className="preference-card-header">
                        <div>
                            <h2>Investor Type</h2>
                            <p>Tell us your risk profile.</p>
                        </div>
                    </div>
                    <label className="preference-block">
                        <select
                            value={preferences['investor-type']}
                            onChange={handleInvestorTypeChange}
                        >
                            <option value="">Select investor type</option>
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </label>
                </section>

                <section className="preference-card">
                    <div className="preference-card-header">
                        <div>
                            <h2>Content Types</h2>
                            <p>Pick what shows up in your feed.</p>
                        </div>
                    </div>
                    <label className="preference-block">
                        <div className="content-type-options">
                            <label>
                                <input
                                    type="checkbox"
                                    value="news"
                                    checked={preferences['content-type'].includes('news')}
                                    onChange={handleContentTypeChange}
                                />
                                News
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="analysis"
                                    checked={preferences['content-type'].includes('analysis')}
                                    onChange={handleContentTypeChange}
                                />
                                Analysis
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    value="memes"
                                    checked={preferences['content-type'].includes('memes')}
                                    onChange={handleContentTypeChange}
                                />
                                Memes
                            </label>
                        </div>
                    </label>
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
