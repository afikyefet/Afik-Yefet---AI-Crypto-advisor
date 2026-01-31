import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
// import { aiService } from "../service/ai.service"; // AI BYPASSED
import { LineChart } from "@mui/x-charts/LineChart";
import { loadCoinsMarketData } from "../store/actions/coinGecko.action";
import { addVote } from "../store/actions/user.action";
import { CoinRow } from "./CoinRow";
import { DetailsModal } from "./DetailsModal";

export function CoinPrices({ onSummaryChange }) {
    const { coinsMarketData, isLoading, error } = useSelector(storeState => storeState.coinGeckoModule)
    const { user } = useSelector(storeState => storeState.userModule)
    const [showAll, setShowAll] = useState(false)
    const [changeMode, setChangeMode] = useState('percent')
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

    const trendData = selectedCoin?.sparkline_in_7d?.price || []
    const trendColor = (selectedCoin?.price_change_percentage_24h ?? 0) >= 0
        ? '#34d399'
        : '#f87171'
    const lastTrendIndex = trendData.length > 0 ? trendData.length - 1 : 0
    const trendMin = trendData.length ? Math.min(...trendData) : 0
    const trendMax = trendData.length ? Math.max(...trendData) : 0
    const trendRange = trendMax - trendMin
    const trendPadding = trendRange === 0 ? (trendMax || 1) * 0.005 : trendRange * 0.15
    const trendTimestamps = trendData.map((_, idx) => {
        const hoursAgo = lastTrendIndex - idx
        return new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
    })
    const formatDate = (value) => {
        if (!value) return ''
        const date = value instanceof Date ? value : new Date(value)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit'
        })
    }

    const formatDateTime = (value) => {
        if (!value) return ''
        const date = value instanceof Date ? value : new Date(value)
        return date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    // Check if user has voted for this coin (check by coin.id)
    const coinVote = user?.votes?.length > 0 && user?.votes?.find(v => {
        if (v.type !== 'coin') return false
        // Handle both old format (string) and new format (object)
        const contentId = typeof v.content === 'object' ? v.content?.id : v.content
        return contentId === selectedCoin?.id
    })
    const hasUpVote = coinVote?.vote === 'up'
    const hasDownVote = coinVote?.vote === 'down'

    function handleVote(vote) {
        if (!user?._id) return
        // Pass the entire coin object
        addVote(user._id, vote, 'coin', selectedCoin)
    }

    return (
        <div className="coin-prices-container">
            <div className="section-header">
                <div>
                    <h1>Coin Prices</h1>
                    <span className="section-subtitle">Real-time market snapshot</span>
                </div>
                <div className="section-header-actions">
                    <button onClick={() => loadCoinsMarketData()}>
                        <span className="material-icons">refresh</span>
                    </button>
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
            </div>
            <div className="coin-table">
                <div className="coin-table-body">
                    <div className="coin-row coin-row--head">
                        <span className="cell rank">#</span>
                        <span className="cell coin">Coin</span>
                        <span className="cell price">Price</span>
                        <span className="cell change">
                            <button
                                type="button"
                                className="change-toggle-btn"
                                onClick={() => setChangeMode(prev => prev === 'percent' ? 'amount' : 'percent')}
                                title={`Switch to ${changeMode === 'percent' ? 'amount' : 'percent'} view`}
                            >
                                {changeMode === 'percent' ? '24h %' : '24h $'}
                            </button>
                        </span>
                        <span className="cell range">High / Low</span>
                        <span className="cell market-cap">Market Cap</span>
                        <span className="cell volume">Volume</span>
                        <span className="cell sparkline">Trend</span>
                        {user && <span className="cell votes">Vote</span>}
                    </div>
                    {visibleCoins.map((coin) => (
                        <CoinRow key={coin.id} coin={coin} onSelect={setSelectedCoin} changeMode={changeMode} />
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
                        <div className="details-chart">
                            {trendData.length > 0 ? (
                                <LineChart
                                    height={220}
                                    margin={{ top: 20, right: 20, bottom: 40, left: 70 }}
                                    series={[
                                        {
                                            data: trendData,
                                            showMark: false,
                                            area: true,
                                            curve: 'linear',
                                            valueFormatter: (value) => formatMoney(value)
                                        }
                                    ]}
                                    xAxis={[
                                        {
                                            data: trendTimestamps,
                                            scaleType: 'point',
                                            tickLabelInterval: (_value, index) => index % 24 === 0,
                                            tickLabelStyle: { fill: '#9aa4b2', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
                                            valueFormatter: (value, context) => {
                                                if (context?.location === 'tooltip') return formatDateTime(value)
                                                return formatDate(value)
                                            },
                                            label: 'Date'
                                        }
                                    ]}
                                    yAxis={[
                                        {
                                            min: trendMin - trendPadding,
                                            max: trendMax + trendPadding,
                                            tickNumber: 5,
                                            tickLabelStyle: { fill: '#9aa4b2', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
                                            valueFormatter: (value) => formatMoney(value),
                                            label: 'Price (USD)'
                                        }
                                    ]}
                                    grid={{ horizontal: true, vertical: false }}
                                    colors={[trendColor]}
                                    axisHighlight={{ x: 'line', y: 'line' }}
                                    tooltip={{ trigger: 'axis' }}
                                    sx={{
                                        '& .MuiAreaElement-root': {
                                            opacity: 0.1
                                        }
                                    }}
                                />
                            ) : (
                                <p className="details-chart-empty">No trend data available.</p>
                            )}
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
                        {user && (
                            <span className="cell votes" data-label="Vote">
                                <button
                                    className={`vote-btn vote-up ${hasUpVote ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleVote('up')
                                    }}
                                    title="Thumbs up"
                                >
                                    <span className="material-icons">thumb_up</span>
                                </button>
                                <button
                                    className={`vote-btn vote-down ${hasDownVote ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleVote('down')
                                    }}
                                    title="Thumbs down"
                                >
                                    <span className="material-icons">thumb_down</span>
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </DetailsModal>
        </div >
    )
}
