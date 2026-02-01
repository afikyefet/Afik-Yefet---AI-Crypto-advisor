import { useState } from "react";
import { useSelector } from "react-redux";
import { AccountSidebar } from "../cmps/AccountSidebar";
import { CoinPrices } from "../cmps/CoinPrices";
import { DailyInsight } from "../cmps/DailyInsight";
import { MarketNews } from "../cmps/MarketNews";
import { MemeButton } from "../cmps/MemeButton";
import { Onboarding } from "../cmps/Onboarding";

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
                    <DailyInsight />
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
