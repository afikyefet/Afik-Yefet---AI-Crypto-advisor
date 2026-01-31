import { useSelector } from 'react-redux'
import { getCoinLabel, INVESTOR_TYPES, CONTENT_TYPES } from '../constants/preferences.constants'

export function AccountSidebar() {
    const { user } = useSelector(storeState => storeState.userModule)

    if (!user) return null

    const preferences = user.preferences || {
        'fav-coins': [],
        'investor-type': [],
        'content-type': []
    }

    const investorTypes = preferences['investor-type'] || []

    const getInvestorLabel = (value) => {
        const type = INVESTOR_TYPES.find(t => t.value === value)
        return type ? type.label : value
    }

    const getContentLabel = (value) => {
        const type = CONTENT_TYPES.find(t => t.value === value)
        return type ? type.label : value
    }

    return (
        <aside className="account-sidebar">
            <div className="account-section">
                <h3>Account</h3>
                <div className="account-info">
                    <div className="info-item">
                        <span className="info-label">Name</span>
                        <span className="info-value">{user.name || '-'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user.email || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="account-section">
                <h3>Preferences</h3>
                
                {preferences['fav-coins']?.length > 0 && (
                    <div className="pref-group">
                        <span className="pref-label">Favorite Coins</span>
                        <div className="pref-tags">
                            {preferences['fav-coins'].map((coinId, idx) => (
                                <span key={idx} className="pref-tag">
                                    {getCoinLabel(coinId)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {investorTypes.length > 0 && (
                    <div className="pref-group">
                        <span className="pref-label">Investor Type</span>
                        <div className="pref-tags">
                            {investorTypes.map((type, idx) => (
                                <span key={idx} className="pref-tag">
                                    {getInvestorLabel(type)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {preferences['content-type']?.length > 0 && (
                    <div className="pref-group">
                        <span className="pref-label">Content Types</span>
                        <div className="pref-tags">
                            {preferences['content-type'].map((type, idx) => (
                                <span key={idx} className="pref-tag">
                                    {getContentLabel(type)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {preferences['fav-coins']?.length === 0 && 
                 investorTypes.length === 0 && 
                 preferences['content-type']?.length === 0 && (
                    <p className="pref-empty">No preferences set</p>
                )}
            </div>
        </aside>
    )
}
