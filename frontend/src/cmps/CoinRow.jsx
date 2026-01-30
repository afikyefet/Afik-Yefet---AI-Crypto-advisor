export function CoinRow({ coin }) {
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
        </div>
    )
}
