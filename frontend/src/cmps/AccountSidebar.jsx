import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { memeService } from "../service/meme.service"
import { addVote } from "../store/actions/user.action"

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

    const memeId = meme?.imageUrl
    const memeVote = memeId && user?.votes?.find(v => {
        if (v.type !== 'meme') return false
        const contentId = typeof v.content === 'object'
            ? (v.content?.id ?? v.content?.imageUrl ?? v.content?.title)
            : v.content
        return contentId === memeId
    })

    function handleMemeVote(vote, e) {
        e.stopPropagation()
        if (!user?._id || !meme) return
        addVote(user._id, vote, 'meme', { id: meme.imageUrl, title: meme.title, imageUrl: meme.imageUrl })
    }

    if (!user) return null

    const preferences = user.preferences || {
        'fav-coins': [],
        'investor-type': [],
        'content-type': []
    }

    const investorTypes = preferences['investor-type'] || []

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
                            {meme.description && <p>{meme.description}</p>}
                        </div>
                        <div className="meme-sidebar-actions">
                            {user && (
                                <div className="meme-card-votes" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        className={`vote-btn vote-up ${memeVote?.vote === 'up' ? 'active' : ''}`}
                                        onClick={(e) => handleMemeVote('up', e)}
                                        title="Thumbs up"
                                    >
                                        <span className="material-icons">thumb_up</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`vote-btn vote-down ${memeVote?.vote === 'down' ? 'active' : ''}`}
                                        onClick={(e) => handleMemeVote('down', e)}
                                        title="Thumbs down"
                                    >
                                        <span className="material-icons">thumb_down</span>
                                    </button>
                                </div>
                            )}
                            <button type="button" className="btn-text" onClick={loadMeme}>
                                New meme
                            </button>
                        </div>
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
                                    {coinId}
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
                                    {type}
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
                                    {type}
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
