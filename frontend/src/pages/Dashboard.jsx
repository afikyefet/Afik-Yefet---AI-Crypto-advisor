import { useSelector } from "react-redux";
import { CoinPrices } from "../cmps/CoinPrices";
import { MarketNews } from "../cmps/MarketNews";
import { Onboarding } from "../cmps/Onboarding";

export function Dashboard() {
    const { user } = useSelector(storeState => storeState.userModule)

    // Show onboarding if user hasn't completed it
    if (user && !user.hasCompletedOnboarding) {
        return <Onboarding />
    }

    return (
        <div className="dashboard-container">
            <MarketNews />
            <CoinPrices />
        </div>
    )
}