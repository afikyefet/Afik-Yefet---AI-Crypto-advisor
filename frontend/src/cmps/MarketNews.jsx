import { useEffect } from "react"
import { useSelector } from "react-redux"
import { loadNews } from "../store/actions/cryptoPanic.action"
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
                    <div className="market-news-item" key={idx}>
                        <h2>{news.title}</h2>
                        <p>{news.content}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}