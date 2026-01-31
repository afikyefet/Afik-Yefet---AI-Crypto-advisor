// Quick picks with CoinGecko IDs
export const QUICK_PICKS = [
    { id: 'bitcoin', label: 'BTC (Bitcoin)' },
    { id: 'ethereum', label: 'ETH (Ethereum)' },
    { id: 'solana', label: 'SOL (Solana)' },
    { id: 'ripple', label: 'XRP' },
    { id: 'binancecoin', label: 'BNB' },
    { id: 'cardano', label: 'ADA' },
    { id: 'dogecoin', label: 'DOGE' },
    { id: 'tether', label: 'USDT / USDC (Stablecoins)' },
    { id: 'category-defi', label: 'DeFi', isCategory: true },
    { id: 'category-ai', label: 'AI coins', isCategory: true },
    { id: 'category-meme', label: 'Memecoins', isCategory: true },
    { id: 'category-l2', label: 'L2 / Scaling (ARB, OP, etc.)', isCategory: true }
]

// L2 coins for category selection
export const L2_COINS = [
    { id: 'arbitrum', label: 'ARB (Arbitrum)' },
    { id: 'optimism', label: 'OP (Optimism)' },
    { id: 'polygon', label: 'MATIC (Polygon)' }
]

export const INVESTOR_TYPES = [
    { value: 'hodl', label: 'Long-term (HODL)' },
    { value: 'swing-trader', label: 'Swing trader (days/weeks)' },
    { value: 'day-trader', label: 'Day trader' },
    { value: 'dca', label: 'DCA investor' },
    { value: 'defi-user', label: 'DeFi user' },
    { value: 'nft-collector', label: 'NFT collector' },
    { value: 'tech-builder', label: 'Tech / Builder (cares about dev + ecosystem)' },
    { value: 'meme-high-risk', label: 'Meme / high-risk' },
    { value: 'beginner', label: 'Beginner (show simpler content)' }
]

export const CONTENT_TYPES = [
    { value: 'market-news', label: 'Market news (headlines)' },
    { value: 'price-watchlist', label: 'Price watchlist (my coins)' },
    { value: 'charts-movements', label: 'Charts / movements (gainers/losers)' },
    { value: 'on-chain-fundamentals', label: 'On-chain / fundamentals' },
    { value: 'social-sentiment', label: 'Social sentiment' },
    { value: 'learning-explainers', label: 'Learning / explainers (beginner mode)' },
    { value: 'fun', label: 'Fun (memes / trivia)' },
    { value: 'alerts', label: 'Alerts' }
]

// Helper function to get coin label from ID
export function getCoinLabel(coinId) {
    const quickPick = QUICK_PICKS.find(p => p.id === coinId)
    if (quickPick) return quickPick.label
    
    const l2Coin = L2_COINS.find(c => c.id === coinId)
    if (l2Coin) return l2Coin.label
    
    return coinId
}

// Helper function to normalize investor-type (always returns array)
export function normalizeInvestorType(investorType) {
    if (!investorType) return []
    if (Array.isArray(investorType)) return investorType
    return []
}
