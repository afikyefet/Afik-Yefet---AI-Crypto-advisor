import { useEffect } from "react"
import { useSelector } from "react-redux"
import { loadNews } from "../store/actions/cryptoPanic.action"
import { NewsCard } from "./NewsCard"
export function MarketNews() {
    const { news, isLoading, error } = useSelector(storeState => storeState.cryptoPanicModule)

    useEffect(() => {
        loadNews()
    }, [])

    console.log(news);



    return (
        <div className="market-news-container">
            <div className="market-news-header">
                <h1>Market News</h1>
            </div>
            <div className="market-news-body">
                {news && news.results && news.results.map((news, idx) => (
                    <NewsCard key={idx} news={news} />
                ))}
            </div>
        </div>
    )
}