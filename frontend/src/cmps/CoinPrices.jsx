import { useEffect } from "react";
import { useSelector } from "react-redux";
import { loadCoinsMarketData } from "../store/actions/coinGecko.action";
import { CoinRow } from "./CoinRow";

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
                <CoinRow key={coin.id} coin={coin} />
            ))}
        </div >
    )
}