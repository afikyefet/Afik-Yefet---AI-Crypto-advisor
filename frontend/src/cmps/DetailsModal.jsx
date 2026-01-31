import { useEffect } from 'react'

export function DetailsModal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.()
        }

        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = prevOverflow
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="details-modal-backdrop" onClick={onClose}>
            <div
                className="details-modal-card"
                role="dialog"
                aria-modal="true"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="details-modal-header">
                    <h2>{title}</h2>
                    <button
                        type="button"
                        className="details-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="details-modal-content">{children}</div>
            </div>
        </div>
    )
}
