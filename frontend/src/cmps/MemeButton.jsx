import { useCallback, useEffect, useState } from "react"
import { memeService } from "../service/meme.service"
import { DetailsModal } from "./DetailsModal"

export function MemeButton() {
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
                                <div className="meme-actions">
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
