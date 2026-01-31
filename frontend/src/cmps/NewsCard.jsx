import { useSelector } from 'react-redux'
import { addVote } from '../store/actions/user.action'

export function NewsCard({ news, onSelect }) {
    const { user } = useSelector(storeState => storeState.userModule)
    const description = news.description || news.content || 'No summary available.'
    const publishedAt = news.published_at || news.created_at

    function formatDate(value) {
        if (!value) return ''
        const date = new Date(value)
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    // Use title as unique identifier for news
    const newsId = news.title || news.id
    // Check if user has voted for this news (check by title or id)
    const newsVote = user?.votes?.length > 0 && user?.votes?.find(v => {
        if (v.type !== 'news') return false
        // Handle both old format (string) and new format (object)
        const contentId = typeof v.content === 'object'
            ? (v.content?.title || v.content?.id)
            : v.content
        return contentId === newsId
    })
    const hasUpVote = newsVote?.vote === 'up'
    const hasDownVote = newsVote?.vote === 'down'

    function handleVote(vote, e) {
        e.stopPropagation()
        if (!user?._id || !newsId) return
        // Pass the entire news object
        addVote(user._id, vote, 'news', news)
    }

    function handleCardClick() {
        if (onSelect) {
            onSelect(news)
        }
    }

    return (
        <article 
            className={`news-card ${onSelect ? 'is-clickable' : ''}`}
            onClick={handleCardClick}
        >
            <div className="news-card-header">
                <span className="news-tag">{news.kind || 'news'}</span>
                {publishedAt && <span className="news-date">{formatDate(publishedAt)}</span>}
            </div>
            <h2 className="news-title">{news.title}</h2>
            <p className="news-desc">{description}</p>
            {user && (
                <div className="news-card-votes" onClick={(e) => e.stopPropagation()}>
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
        </article>
    )
}
