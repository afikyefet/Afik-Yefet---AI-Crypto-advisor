import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
// import { aiService } from "../service/ai.service"; // AI BYPASSED
import { loadCoinsMarketData } from "../store/actions/coinGecko.action";
import { CoinRow } from "./CoinRow";
import { DetailsModal } from "./DetailsModal";

export function CoinPrices({ onSummaryChange }) {
    const { coinsMarketData, isLoading, error } = useSelector(storeState => storeState.coinGeckoModule)
    const { user } = useSelector(storeState => storeState.userModule)
    const [showAll, setShowAll] = useState(false)
    const [sortedCoins, setSortedCoins] = useState(null)
    const [coinsSummary, setCoinsSummary] = useState(null)
    const [selectedCoin, setSelectedCoin] = useState(null)

    useEffect(() => {
        loadCoinsMarketData()
    }, [])

    // Sort coins when data or user changes
    // AI BYPASSED - Using original data directly
    useEffect(() => {
        if (coinsMarketData) {
            setSortedCoins(coinsMarketData)
            setCoinsSummary(null)
        }
        // AI sorting bypassed - uncomment below to re-enable
        // if (coinsMarketData && coinsMarketData.length > 0 && user?._id) {
        //     aiService.sortCoins(user._id, coinsMarketData)
        //         .then(result => {
        //             setSortedCoins(result.coins)
        //             setCoinsSummary(result.summary)
        //             if (result.summary && onSummaryChange) {
        //                 onSummaryChange(result.summary)
        //             }
        //         })
        //         .catch(() => {
        //             setSortedCoins(coinsMarketData)
        //             setCoinsSummary(null)
        //         })
        // } else if (coinsMarketData) {
        //     setSortedCoins(coinsMarketData)
        //     setCoinsSummary(null)
        // }
    }, [coinsMarketData, user?._id])

    const visibleCoins = useMemo(() => {
        const coins = sortedCoins || coinsMarketData || []
        return showAll ? coins : coins.slice(0, 20)
    }, [sortedCoins, coinsMarketData, showAll])

    const priceFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    }), [])

    const compactFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2
    }), [])

    const formatMoney = (value) => {
        if (value === null || value === undefined) return '-'
        return priceFormatter.format(value)
    }

    const formatCompact = (value) => {
        if (value === null || value === undefined) return '-'
        return compactFormatter.format(value)
    }

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
                        <CoinRow key={coin.id} coin={coin} onSelect={setSelectedCoin} />
                    ))}
                </div>
            </div>

            <DetailsModal
                isOpen={!!selectedCoin}
                onClose={() => setSelectedCoin(null)}
                title="Coin Details"
            >
                {selectedCoin && (
                    <div className="details-layout">
                        <div className="details-meta">
                            <span className="pill">{selectedCoin.symbol?.toUpperCase() || 'COIN'}</span>
                            <span className="details-date">Rank #{selectedCoin.market_cap_rank ?? '-'}</span>
                        </div>
                        <div className="details-hero">
                            <img src={selectedCoin.image} alt={selectedCoin.name} />
                            <div>
                                <h3>{selectedCoin.name}</h3>
                                <p>{formatMoney(selectedCoin.current_price)}</p>
                            </div>
                        </div>
                        <div className="details-grid">
                            <div>
                                <span>24h Change</span>
                                <strong>{selectedCoin.price_change_percentage_24h?.toFixed(2) ?? '-'}%</strong>
                            </div>
                            <div>
                                <span>Market Cap</span>
                                <strong>{formatCompact(selectedCoin.market_cap)}</strong>
                            </div>
                            <div>
                                <span>Volume</span>
                                <strong>{formatCompact(selectedCoin.total_volume)}</strong>
                            </div>
                            <div>
                                <span>24h Range</span>
                                <strong>
                                    {formatMoney(selectedCoin.low_24h)} - {formatMoney(selectedCoin.high_24h)}
                                </strong>
                            </div>
                            <div>
                                <span>ATH</span>
                                <strong>{formatMoney(selectedCoin.ath)}</strong>
                            </div>
                            <div>
                                <span>ATL</span>
                                <strong>{formatMoney(selectedCoin.atl)}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </DetailsModal>
        </div >
    )
}
