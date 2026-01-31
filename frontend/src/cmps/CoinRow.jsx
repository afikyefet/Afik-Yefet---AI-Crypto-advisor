import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { useSelector } from 'react-redux'
import { addVote } from '../store/actions/user.action'

export function CoinRow({ coin, onSelect, changeMode = 'percent' }) {
    const { user } = useSelector(storeState => storeState.userModule)
    const priceChange = coin.price_change_percentage_24h ?? null
    const amountChange = coin.price_change_24h ?? null
    const changeValue = changeMode === 'amount' ? amountChange : priceChange
    const changeClass = changeValue === null || changeValue === undefined
        ? ''
        : changeValue >= 0
            ? 'pos'
            : 'neg'
    const priceData = Array.isArray(coin.sparkline_in_7d?.price)
        ? coin.sparkline_in_7d.price
        : []
    const minPrice = priceData.length ? Math.min(...priceData) : 0
    const maxPrice = priceData.length ? Math.max(...priceData) : 0
    const priceRange = maxPrice - minPrice
    const rangePadding = priceRange === 0 ? (maxPrice || 1) * 0.005 : priceRange * 0.15
    const yMin = minPrice - rangePadding
    const yMax = maxPrice + rangePadding
    const trendChange = priceData.length > 1 && priceData[0]
        ? ((priceData[priceData.length - 1] - priceData[0]) / priceData[0]) * 100
        : null
    const trendBasis = trendChange ?? priceChange
    const lineColor = trendBasis === null || trendBasis === undefined
        ? '#9aa4b2'
        : trendBasis >= 0
            ? '#34d399'
            : '#f87171'

    const priceFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    })

    const compactFormatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2
    })

    const formatMoney = (value) => {
        if (value === null || value === undefined) return '-'
        return priceFormatter.format(value)
    }

    const formatCompact = (value) => {
        if (value === null || value === undefined) return '-'
        return compactFormatter.format(value)
    }

    const formatPercent = (value) => {
        if (value === null || value === undefined) return '-'
        return `${value.toFixed(2)}%`
    }

    // Check if user has voted for this coin (check by coin.id)
    const coinVote = user?.votes?.length > 0 && user?.votes?.find(v => {
        if (v.type !== 'coin') return false
        // Handle both old format (string) and new format (object)
        const contentId = typeof v.content === 'object' ? v.content?.id : v.content
        return contentId === coin.id
    })
    const hasUpVote = coinVote?.vote === 'up'
    const hasDownVote = coinVote?.vote === 'down'

    function handleVote(vote) {
        if (!user?._id) return
        // Pass the entire coin object
        addVote(user._id, vote, 'coin', coin)
    }

    return (
        <div
            className={`coin-row ${onSelect ? 'is-clickable' : ''}`}
            onClick={() => onSelect?.(coin)}
            onKeyDown={(e) => {
                if (!onSelect) return
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(coin)
                }
            }}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
        >
            <span className="cell rank">{coin.market_cap_rank ?? '-'}</span>
            <span className="cell coin">
                <img src={coin.image} alt={coin.name} />
                <span className="coin-meta">
                    <span className="coin-name" title={coin.name}>{coin.name}</span>
                    <span className="coin-symbol">{coin.symbol ? coin.symbol.toUpperCase() : '--'}</span>
                </span>
            </span>
            <span className="cell price" data-label="Price">{formatMoney(coin.current_price)}</span>
            <span className={`cell change ${changeClass}`} data-label="24h">
                {changeMode === 'amount' ? formatMoney(changeValue) : formatPercent(changeValue)}
            </span>
            <span className="cell range" data-label="Range">
                <span className="range-high">H {formatMoney(coin.high_24h)}</span>
                <span className="range-low">L {formatMoney(coin.low_24h)}</span>
            </span>
            <span className="cell market-cap" data-label="Mkt Cap">{formatCompact(coin.market_cap)}</span>
            <span className="cell volume" data-label="Volume">{formatCompact(coin.total_volume)}</span>
            <span className="cell sparkline" data-label="Trend">
                {priceData.length > 0 ? (
                    <div className="sparkline-wrap">
                        <SparkLineChart
                            data={priceData}
                            height={30}
                            width={110}
                            area
                            showHighlight
                            showTooltip
                            colors={[lineColor]}
                            valueFormatter={(value) => formatMoney(value)}
                            yAxis={{ min: yMin, max: yMax }}
                            margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
                            curve="linear"
                            sx={{
                                '& .MuiAreaElement-root': {
                                    opacity: 0.1
                                }
                            }}
                        />
                        {trendChange !== null && trendChange !== undefined && (
                            <span className={`sparkline-label ${trendChange >= 0 ? 'pos' : 'neg'}`}>
                                {formatPercent(trendChange)}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="sparkline-empty">--</span>
                )}
            </span>
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
    )
}
