import { useSelector } from 'react-redux'
import { addVote } from '../store/actions/user.action'

export function CoinRow({ coin }) {
    const { user } = useSelector(storeState => storeState.userModule)
    const priceChange = coin.price_change_percentage_24h ?? 0
    const changeClass = priceChange >= 0 ? 'pos' : 'neg'

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
        <div className="coin-row">
            <span className="cell rank">{coin.market_cap_rank ?? '-'}</span>
            <span className="cell coin">
                <img src={coin.image} alt={coin.name} />
                <span className="coin-meta">
                    <span className="coin-name">{coin.name}</span>
                    <span className="coin-symbol">{coin.symbol ? coin.symbol.toUpperCase() : '--'}</span>
                </span>
            </span>
            <span className="cell price" data-label="Price">{formatMoney(coin.current_price)}</span>
            <span className={`cell change ${changeClass}`} data-label="24h">{formatPercent(priceChange)}</span>
            <span className="cell range" data-label="Range">
                <span className="range-high">H {formatMoney(coin.high_24h)}</span>
                <span className="range-low">L {formatMoney(coin.low_24h)}</span>
            </span>
            <span className="cell market-cap" data-label="Mkt Cap">{formatCompact(coin.market_cap)}</span>
            <span className="cell volume" data-label="Volume">{formatCompact(coin.total_volume)}</span>
            {user && (
                <span className="cell votes" data-label="Vote">
                    <button
                        className={`vote-btn vote-up ${hasUpVote ? 'active' : ''}`}
                        onClick={() => handleVote('up')}
                        title="Thumbs up"
                    >
                        <span className="material-icons">thumb_up</span>
                    </button>
                    <button
                        className={`vote-btn vote-down ${hasDownVote ? 'active' : ''}`}
                        onClick={() => handleVote('down')}
                        title="Thumbs down"
                    >
                        <span className="material-icons">thumb_down</span>
                    </button>
                </span>
            )}
        </div>
    )
}
