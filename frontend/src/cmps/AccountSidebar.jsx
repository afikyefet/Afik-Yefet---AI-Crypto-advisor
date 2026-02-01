import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CONTENT_TYPES, getCoinLabel, INVESTOR_TYPES } from '../constants/preferences.constants'
import { memeService } from "../service/meme.service"


export function AccountSidebar() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [meme, setMeme] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadMeme = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const memeData = await memeService.getCryptoMeme()
            setMeme(memeData)
        } catch (err) {
            setError('Could not load meme right now.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMeme()
    }, [loadMeme])

    if (!user) return null

    const preferences = user.preferences || {
        'fav-coins': [],
        'investor-type': [],
        'content-type': []
    }

    const investorTypes = preferences['investor-type'] || []

    const getInvestorLabel = (value) => {
        const type = INVESTOR_TYPES.find(t => t.value === value)
        return type ? type.label : value
    }

    const getContentLabel = (value) => {
        const type = CONTENT_TYPES.find(t => t.value === value)
        return type ? type.label : value
    }

    return (
        <aside className="account-sidebar">
            {meme && (
                <div className="account-section">
                    <h3>Daily Meme</h3>
                    <div className="daily-meme">
                        <div className="meme-image-wrap">
                            <img src={meme.imageUrl} alt={meme.title} />
                        </div>
                        <div className="meme-meta">
                            <h3>{meme.title}</h3>
                            <p>{meme.description}</p>
                        </div>
                        <button type="button" className="btn-text" onClick={loadMeme}>
                            New meme
                        </button>
                    </div>
                </div>
            )}
            <div className="account-section">
                <h3>Account</h3>
                <div className="account-info">
                    <div className="info-item">
                        <span className="info-label">Name</span>
                        <span className="info-value">{user.name || '-'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user.email || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="account-section">
                <h3>Preferences</h3>

                {preferences['fav-coins']?.length > 0 && (
                    <div className="pref-group">
                        <span className="pref-label">Favorite Coins</span>
                        <div className="pref-tags">
                            {preferences['fav-coins'].map((coinId, idx) => (
                                <span key={idx} className="pref-tag">
                                    {getCoinLabel(coinId)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {investorTypes.length > 0 && (
                    <div className="pref-group">
                        <span className="pref-label">Investor Type</span>
                        <div className="pref-tags">
                            {investorTypes.map((type, idx) => (
                                <span key={idx} className="pref-tag">
                                    {getInvestorLabel(type)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {preferences['content-type']?.length > 0 && (
                    <div className="pref-group">
                        <span className="pref-label">Content Types</span>
                        <div className="pref-tags">
                            {preferences['content-type'].map((type, idx) => (
                                <span key={idx} className="pref-tag">
                                    {getContentLabel(type)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {preferences['fav-coins']?.length === 0 &&
                    investorTypes.length === 0 &&
                    preferences['content-type']?.length === 0 && (
                        <p className="pref-empty">No preferences set</p>
                    )}
            </div>
        </aside>
    )
}
