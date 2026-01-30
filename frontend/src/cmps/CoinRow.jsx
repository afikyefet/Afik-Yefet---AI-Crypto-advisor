export function CoinRow({ coin }) {
    return (
        <div className="coin-row">
            <h2>{coin.name}</h2>
            <p>{coin.price}</p>
        </div>
    )
}