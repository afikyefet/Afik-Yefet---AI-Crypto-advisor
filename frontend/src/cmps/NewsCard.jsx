export function NewsCard({ news }) {
    return (
        <div className="news-card">
            <h2>{news.title}</h2>
            <p>{news.content}</p>
        </div>
    )
}