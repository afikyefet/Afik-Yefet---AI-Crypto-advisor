import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { aiService } from "../service/ai.service"
import { loadNews } from "../store/actions/cryptoPanic.action"
import { NewsCard } from "./NewsCard"

export function MarketNews() {
    const { news, isLoading, error } = useSelector(storeState => storeState.cryptoPanicModule)
    const { user } = useSelector(storeState => storeState.userModule)
    const [sortedNews, setSortedNews] = useState(null)

    useEffect(() => {
        loadNews()
    }, [])

    // Sort news when data or user changes
    useEffect(() => {
        const newsItems = news?.results || []
        if (newsItems.length > 0 && user?._id) {
            aiService.sortNews(user._id, newsItems)
                .then(sorted => setSortedNews(sorted))
                .catch(() => setSortedNews(newsItems)) // Fallback to original
        } else if (newsItems.length > 0) {
            setSortedNews(newsItems)
        }
    }, [news, user?._id])

    const newsItems = sortedNews || news?.results || []
    const loopItems = newsItems.length ? [...newsItems, ...newsItems] : []

    return (
        <div className="market-news-container">
            <div className="section-header">
                <h1>Market News</h1>
                <span className="section-subtitle">Live headlines tuned to your preferences</span>
            </div>
            <div className="market-news-body">
                <div className="news-track">
                    {loopItems.map((newsItem, idx) => (
                        <NewsCard key={`${newsItem.title}-${idx}`} news={newsItem} />
                    ))}
                </div>
            </div>
        </div>
    )
}
