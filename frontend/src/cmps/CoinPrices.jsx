import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { aiService } from "../service/ai.service";
import { loadCoinsMarketData } from "../store/actions/coinGecko.action";
import { CoinRow } from "./CoinRow";

export function CoinPrices() {
    const { coinsMarketData, isLoading, error } = useSelector(storeState => storeState.coinGeckoModule)
    const { user } = useSelector(storeState => storeState.userModule)
    const [showAll, setShowAll] = useState(false)
    const [sortedCoins, setSortedCoins] = useState(null)

    useEffect(() => {
        loadCoinsMarketData()
    }, [])

    // Sort coins when data or user changes
    useEffect(() => {
        if (coinsMarketData && coinsMarketData.length > 0 && user?._id) {
            aiService.sortCoins(user._id, coinsMarketData)
                .then(sorted => setSortedCoins(sorted))
                .catch(() => setSortedCoins(coinsMarketData)) // Fallback to original
        } else if (coinsMarketData) {
            setSortedCoins(coinsMarketData)
        }
    }, [coinsMarketData, user?._id])

    const visibleCoins = useMemo(() => {
        const coins = sortedCoins || coinsMarketData || []
        return showAll ? coins : coins.slice(0, 20)
    }, [sortedCoins, coinsMarketData, showAll])

    return (
        <div className="coin-prices-container">
            <div className="section-header">
                <div>
                    <h1>Coin Prices</h1>
                    <span className="section-subtitle">Real-time market snapshot</span>
                </div>
                {coinsMarketData?.length > 20 && (
                    <button
                        type="button"
                        className="coin-table-toggle"
                        onClick={() => setShowAll(prev => !prev)}
                    >
                        {showAll ? 'Show top 20' : 'Show all'}
                    </button>
                )}
            </div>
            <div className="coin-table">
                <div className="coin-table-body">
                    <div className="coin-row coin-row--head">
                        <span className="cell rank">#</span>
                        <span className="cell coin">Coin</span>
                        <span className="cell price">Price</span>
                        <span className="cell change">24h</span>
                        <span className="cell range">High / Low</span>
                        <span className="cell market-cap">Market Cap</span>
                        <span className="cell volume">Volume</span>
                        {user && <span className="cell votes">Vote</span>}
                    </div>
                    {visibleCoins.map((coin) => (
                        <CoinRow key={coin.id} coin={coin} />
                    ))}
                </div>
            </div>
        </div >
    )
}
