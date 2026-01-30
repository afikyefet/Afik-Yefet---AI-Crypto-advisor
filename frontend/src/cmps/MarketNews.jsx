import { useEffect } from "react"
import { useSelector } from "react-redux"
import { loadNews } from "../store/actions/cryptoPanic.action"
import { NewsCard } from "./NewsCard"
export function MarketNews() {
    const { news, isLoading, error } = useSelector(storeState => storeState.cryptoPanicModule)

    useEffect(() => {
        loadNews()
    }, [])

    const newsItems = news?.results || []
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
