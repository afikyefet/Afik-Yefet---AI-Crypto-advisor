export function NewsCard({ news }) {
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

    return (
        <article className="news-card">
            <div className="news-card-header">
                <span className="news-tag">{news.kind || 'news'}</span>
                {publishedAt && <span className="news-date">{formatDate(publishedAt)}</span>}
            </div>
            <h2 className="news-title">{news.title}</h2>
            <p className="news-desc">{description}</p>
        </article>
    )
}
