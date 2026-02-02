import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { aiService } from "../service/ai.service"
import { addVote } from "../store/actions/user.action"

export function DailyInsight() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [insight, setInsight] = useState(null)
    const [status, setStatus] = useState('idle')
    const [error, setError] = useState(null)

    const loadInsight = (force = false) => {
        let isActive = true

        if (!user?._id) {
            setInsight(null)
            setStatus('idle')
            setError(null)
            return () => { isActive = false }
        }

        setStatus('loading')
        setError(null)

        aiService.getDailyInsight(user._id, { force })
            .then((data) => {
                if (!isActive) return
                setInsight(data?.insight || null)
                setStatus('ready')
            })
            .catch(() => {
                if (!isActive) return
                setInsight(null)
                setStatus('error')
                setError('Could not load insight right now.')
            })

        return () => {
            isActive = false
        }
    }

    useEffect(() => {
        const cleanup = loadInsight()
        return () => {
            if (typeof cleanup === 'function') cleanup()
        }
    }, [user?._id])

    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })

    let displayText = insight
    if (!user?._id) displayText = 'Sign in to unlock your daily insight.'
    if (status === 'loading') displayText = 'Generating your daily insight...'
    if (status === 'error') displayText = 'Insight is unavailable right now.'
    if (status === 'ready' && !insight) displayText = 'Insight is unavailable right now.'

    // Use title as unique identifier for insight
    const insightId = new Date().toISOString().slice(0, 10)
    const insightVote = user?.votes?.length > 0 && user?.votes?.find(v => {
        if (v.type !== 'insight') return false
        // Handle both old format (string) and new format (object)
        const contentId = typeof v.content === 'object'
            ? (v.content?.title || v.content?.id)
            : v.content
        return contentId === insightId
    })
    const hasUpVote = insightVote?.vote === 'up'
    const hasDownVote = insightVote?.vote === 'down'

    function handleVote(vote, e) {
        e.stopPropagation()
        if (!user?._id || !insight) return
        // Pass the entire insight object
        addVote(user._id, vote, 'insight', { id: insightId, text: insight })
    }

    return (
        <div className="daily-insight-container">
            <div className="section-header">
                <div>
                    <h1>AI Insight of the Day</h1>
                    <span className="section-subtitle">Short, personal takeaways based on your preferences</span>
                </div>
            </div>
            <div className={`daily-insight-card ${status === 'loading' ? 'is-loading' : ''}`}>
                <div className="daily-insight-meta">
                    <div className="daily-insight-meta-left">
                        <span className="pill">Updated daily</span>
                        <span>{today}</span>
                    </div>
                    <div className="daily-insight-actions">
                        <button
                            type="button"
                            className="btn-text"
                            onClick={() => loadInsight(true)}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Refreshing...' : 'Refresh insight'}
                        </button>
                    </div>
                </div>
                <p className="daily-insight-text">{displayText}</p>
                {user && (
                    <div className="insight-card-votes" onClick={(e) => e.stopPropagation()}>
                        <button
                            className={`vote-btn vote-up ${hasUpVote ? 'active' : ''}`}
                            onClick={(e) => handleVote('up', e)}
                            title="Thumbs up"
                        >
                            <span className="material-icons">thumb_up</span>
                        </button>
                        <button
                            className={`vote-btn vote-down ${hasDownVote ? 'active' : ''}`}
                            onClick={(e) => handleVote('down', e)}
                            title="Thumbs down"
                        >
                            <span className="material-icons">thumb_down</span>
                        </button>
                    </div>
                )}
                {error && <span className="daily-insight-status">{error}</span>}
            </div>
        </div>
    )
}
