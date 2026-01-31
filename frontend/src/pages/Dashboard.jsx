import { useState } from "react";
import { useSelector } from "react-redux";
import { CoinPrices } from "../cmps/CoinPrices";
import { MarketNews } from "../cmps/MarketNews";
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
            <MarketNews onSummaryChange={setAiSummary} />
            <CoinPrices onSummaryChange={setAiSummary} />
            {aiSummary && (
                <div className="ai-summary">
                    <p className="ai-summary-text">{aiSummary}</p>
                </div>
            )}
        </div>
    )
}