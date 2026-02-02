import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { AccountSidebar } from "../cmps/AccountSidebar";
import { CoinPrices } from "../cmps/CoinPrices";
import { DailyInsight } from "../cmps/DailyInsight";
import { MarketNews } from "../cmps/MarketNews";
import { MemeButton } from "../cmps/MemeButton";

export function Dashboard() {
    const { user } = useSelector(storeState => storeState.userModule)

    // Redirect to onboarding if user hasn't completed it
    if (user && !user.hasCompletedOnboarding) {
        return <Navigate to="/onboarding" replace />
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-main">
                <AccountSidebar />
                <div className="dashboard-content">
                    <DailyInsight />
                    <MarketNews />
                    <CoinPrices />
                </div>
            </div>
            <MemeButton />
        </div>
    )
}
