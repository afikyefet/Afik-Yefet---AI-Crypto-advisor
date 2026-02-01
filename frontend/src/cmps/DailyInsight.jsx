import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { aiService } from "../service/ai.service"

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
                {error && <span className="daily-insight-status">{error}</span>}
            </div>
        </div>
    )
}
