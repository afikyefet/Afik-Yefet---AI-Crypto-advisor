import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { memeService } from "../service/meme.service"
import { addVote } from "../store/actions/user.action"
import { DetailsModal } from "./DetailsModal"

export function MemeButton() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [meme, setMeme] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
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

    return (
        <div className="meme-fab-wrapper">
            <button
                type="button"
                className="meme-fab"
                onClick={() => setIsOpen(true)}
                aria-label="Open crypto meme"
            >
                <span>Meme</span>
            </button>

            <DetailsModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Funny Crypto Meme"
            >
                <div className="meme-modal">
                    {isLoading && (
                        <div className="meme-status">
                            <p>Loading meme...</p>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="meme-status">
                            <p>{error}</p>
                            <button type="button" className="btn-main" onClick={loadMeme}>
                                Try again
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && meme && (
                        <>
                            <div className="meme-image-wrap">
                                <img src={meme.imageUrl} alt={meme.title} />
                            </div>
                            <div className="meme-meta">
                                <h3>{meme.title}</h3>
                                <div className="meme-actions meme-actions-row">
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
                        </>
                    )}
                </div>
            </DetailsModal>
        </div>
    )
}
