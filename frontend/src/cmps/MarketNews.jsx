import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
// import { aiService } from "../service/ai.service" // AI BYPASSED
import { loadNews } from "../store/actions/cryptoPanic.action"
import { addVote } from "../store/actions/user.action"
import { DetailsModal } from "./DetailsModal"
import { NewsCard } from "./NewsCard"

export function MarketNews() {
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

    // Check if user has voted for this news (check by title or id)
    const newsVote = user?.votes?.length > 0 && user?.votes?.find(v => {
        if (v.type !== 'news') return false
        // Handle both old format (string) and new format (object)
        const contentId = typeof v.content === 'object'
            ? (v.content?.title || v.content?.id)
            : v.content
        return contentId === selectedNews?.title
    })
    const hasUpVote = newsVote?.vote === 'up'
    const hasDownVote = newsVote?.vote === 'down'

    function handleVote(vote, e) {
        e.stopPropagation()
        if (!user?._id || !selectedNews?.title) return
        // Pass the entire news object
        addVote(user._id, vote, 'news', selectedNews)
    }

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
                    </div>
                )}
            </DetailsModal>
        </div>
    )
}
