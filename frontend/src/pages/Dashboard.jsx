import { useState } from "react";
import { useSelector } from "react-redux";
import { CoinPrices } from "../cmps/CoinPrices";
import { MarketNews } from "../cmps/MarketNews";
import { Onboarding } from "../cmps/Onboarding";
import { MemeButton } from "../cmps/MemeButton";
import { AccountSidebar } from "../cmps/AccountSidebar";

export function Dashboard() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [aiSummary, setAiSummary] = useState(null)

    // Show onboarding if user hasn't completed it
    if (user && !user.hasCompletedOnboarding) {
        return <Onboarding />
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-main">
                <AccountSidebar />
                <div className="dashboard-content">
                    <MarketNews onSummaryChange={setAiSummary} />
                    <CoinPrices onSummaryChange={setAiSummary} />
                </div>
            </div>
            {aiSummary && (
                <div className="ai-summary">
                    <p className="ai-summary-text">{aiSummary}</p>
                </div>
            )}
            <MemeButton />
        </div>
    )
}
