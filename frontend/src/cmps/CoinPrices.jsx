import { useEffect } from "react";
import { useSelector } from "react-redux";
import { loadCoinsMarketData } from "../store/actions/coinGecko.action";

export function CoinPrices() {
    const { coinsMarketData, isLoading, error } = useSelector(storeState => storeState.coinGeckoModule)

    useEffect(() => {
        loadCoinsMarketData()
    }, [])

    console.log(coinsMarketData);
    return (
        <div className="coin-prices-container">
            <h1>Coin Prices</h1>
            {coinsMarketData && coinsMarketData.map((coin) => (
                <div key={coin.id}>
                    <h2>{coin.name}</h2>
                    <p>{coin.current_price}</p>
                </div>
            ))}
        </div >
    )
}