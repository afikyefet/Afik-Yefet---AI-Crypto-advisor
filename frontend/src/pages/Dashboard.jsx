import { CoinPrices } from "../cmps/CoinPrices";
import { MarketNews } from "../cmps/MarketNews";

export function Dashboard() {
    return (
        <div className="dashboard-container">
            <MarketNews />
            <CoinPrices />
        </div>
    )
}