import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
// import { aiService } from "../service/ai.service" // AI BYPASSED
import { loadNews } from "../store/actions/cryptoPanic.action"
import { NewsCard } from "./NewsCard"
import { DetailsModal } from "./DetailsModal"

export function MarketNews({ onSummaryChange }) {
    const { news, isLoading, error } = useSelector(storeState => storeState.cryptoPanicModule)
    const { user } = useSelector(storeState => storeState.userModule)
    const [sortedNews, setSortedNews] = useState(null)
    const [selectedNews, setSelectedNews] = useState(null)
    const [newsSummary, setNewsSummary] = useState(null)

    useEffect(() => {
        loadNews()
    }, [])

    // Sort news when data or user changes
    // AI BYPASSED - Using original data directly
    useEffect(() => {
        const newsItems = news?.results || []
        if (newsItems.length > 0) {
            setSortedNews(newsItems)
            setNewsSummary(null)
        }
        // AI sorting bypassed - uncomment below to re-enable
        // if (newsItems.length > 0 && user?._id) {
        //     aiService.sortNews(user._id, newsItems)
        //         .then(result => {
        //             setSortedNews(result.news)
        //             setNewsSummary(result.summary)
        //             if (result.summary && onSummaryChange) {
        //                 onSummaryChange(result.summary)
        //             }
        //         })
        //         .catch(() => {
        //             setSortedNews(newsItems)
        //             setNewsSummary(null)
        //         })
        // } else if (newsItems.length > 0) {
        //     setSortedNews(newsItems)
        //     setNewsSummary(null)
        // }
    }, [news, user?._id])

    const newsItems = sortedNews || news?.results || []
    const loopItems = newsItems.length ? [...newsItems, ...newsItems] : []
    const selectedDate = selectedNews?.published_at || selectedNews?.created_at
    const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : 'Unknown'

    return (
        <div className="market-news-container">
            <div className="section-header">
                <h1>Market News</h1>
                <span className="section-subtitle">Live headlines tuned to your preferences</span>
            </div>
            <div className="market-news-body">
                <div className="news-track">
                    {loopItems.map((newsItem, idx) => (
                        <NewsCard
                            key={`${newsItem.title}-${idx}`}
                            news={newsItem}
                            onSelect={setSelectedNews}
                        />
                    ))}
                </div>
            </div>

            <DetailsModal
                isOpen={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                title="News Details"
            >
                {selectedNews && (
                    <div className="details-layout">
                        <div className="details-meta">
                            <span className="pill">{selectedNews.kind || 'news'}</span>
                            <span className="details-date">{formattedDate}</span>
                        </div>
                        <h3>{selectedNews.title}</h3>
                        <p>{selectedNews.description || selectedNews.content || 'No summary available.'}</p>
                    </div>
                )}
            </DetailsModal>
        </div>
    )
}
