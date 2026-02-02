import { useState } from 'react'
import { useSelector } from 'react-redux'
import { CONTENT_TYPES, INVESTOR_TYPES, QUICK_PICKS } from '../constants/preferences.constants'
import { completeOnboarding, updatePreferences } from '../store/actions/user.action'

export function Onboarding() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [currentStep, setCurrentStep] = useState(0)
    const [preferences, setPreferences] = useState({
        'fav-coins': [],
        'investor-type': [],
        'content-type': []
    })
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const steps = [
        {
            question: 'What crypto assets are you interested in?',
            type: 'fav-coins'
        },
        {
            question: 'What type of investor are you?',
            type: 'investor-type'
        },
        {
            question: 'What kind of content would you like to see?',
            type: 'content-type'
        }
    ]

    function handleToggleCoin(coinId) {
        setPreferences(prev => {
            const current = prev['fav-coins']
            if (current.includes(coinId)) {
                return { ...prev, 'fav-coins': current.filter(id => id !== coinId) }
            } else {
                return { ...prev, 'fav-coins': [...current, coinId] }
            }
        })
    }

    function handleAddCustomCoin() {
        const coinId = searchInput.trim().toLowerCase()
        if (coinId && !preferences['fav-coins'].includes(coinId)) {
            setPreferences(prev => ({
                ...prev,
                'fav-coins': [...prev['fav-coins'], coinId]
            }))
            setSearchInput('')
        }
    }

    function handleRemoveCoin(coinId) {
        setPreferences(prev => ({
            ...prev,
            'fav-coins': prev['fav-coins'].filter(id => id !== coinId)
        }))
    }

    function handleToggleInvestorType(type) {
        setPreferences(prev => {
            const current = prev['investor-type']
            if (current.includes(type)) {
                return prev
            }
            return { ...prev, 'investor-type': [type] }
        })
    }

    function handleToggleContentType(type) {
        setPreferences(prev => {
            const current = prev['content-type']
            if (current.includes(type)) {
                return prev
            }
            return { ...prev, 'content-type': [type] }
        })
    }

    function handleNext() {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    function handleBack() {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    async function handleComplete() {
        setIsLoading(true)
        try {
            await updatePreferences(user._id, preferences)
            await completeOnboarding(user._id)
        } catch (err) {
            console.error('Failed to complete onboarding', err)
        } finally {
            setIsLoading(false)
        }
    }

    function canProceed() {
        const step = steps[currentStep]
        if (step.type === 'fav-coins') {
            return preferences['fav-coins'].length > 0
        }
        if (step.type === 'investor-type') {
            return preferences['investor-type'].length === 1
        }
        if (step.type === 'content-type') {
            return preferences['content-type'].length === 1
        }
        return false
    }


    const currentQuestion = steps[currentStep]

    return (
        <div className="onboarding-container">
            <div className="onboarding-content">
                <div className="onboarding-progress">
                    <span>Question {currentStep + 1} of {steps.length}</span>
                </div>

                <h2>{currentQuestion.question}</h2>

                {currentQuestion.type === 'fav-coins' && (
                    <div className="onboarding-input-section">
                        <div className="quick-picks-section">
                            <div className="quick-picks-grid">
                                {QUICK_PICKS.map(pick => (
                                    <button
                                        key={pick.id}
                                        type="button"
                                        className={`quick-pick-btn ${preferences['fav-coins'].includes(pick.id) ? 'active' : ''}`}
                                        onClick={() => handleToggleCoin(pick.id)}
                                    >
                                        {pick.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="search-add-section">
                            <p className="section-label">Search and add</p>
                            <div className="search-input-group">
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Enter coin ID (e.g., bitcoin, ethereum)"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddCustomCoin()
                                        }
                                    }}
                                />
                                <button type="button" onClick={handleAddCustomCoin}>Add</button>
                            </div>
                            <p className="helper-text">Tip: Use CoinGecko coin IDs (lowercase, e.g., "bitcoin" not "BTC")</p>
                        </div>

                        {preferences['fav-coins'].length > 0 && (
                            <div className="selected-coins">
                                <p className="section-label">Selected ({preferences['fav-coins'].length})</p>
                                <div className="selected-coins-list">
                                    {preferences['fav-coins'].map(coinId => (
                                        <span key={coinId} className="selected-coin-tag">
                                            {coinId}
                                            <button type="button" onClick={() => handleRemoveCoin(coinId)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentQuestion.type === 'investor-type' && (
                    <div className="onboarding-input-section">
                        <p className="section-label">Select 1 option</p>
                        <div className="options-grid">
                            {INVESTOR_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`option-btn ${preferences['investor-type'].includes(type.value) ? 'active' : ''}`}
                                    onClick={() => handleToggleInvestorType(type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        {preferences['investor-type'].length > 0 && (
                            <p className="selection-count">
                                Selected: {preferences['investor-type'].length} / 1
                            </p>
                        )}
                    </div>
                )}

                {currentQuestion.type === 'content-type' && (
                    <div className="onboarding-input-section">
                        <p className="section-label">Select 1 option</p>
                        <div className="options-grid">
                            {CONTENT_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`option-btn ${preferences['content-type'].includes(type.value) ? 'active' : ''}`}
                                    onClick={() => handleToggleContentType(type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        {preferences['content-type'].length > 0 && (
                            <p className="selection-count">
                                Selected: {preferences['content-type'].length} / 1
                            </p>
                        )}
                    </div>
                )}

                <div className="onboarding-actions">
                    {currentStep > 0 && (
                        <button type="button" onClick={handleBack} className="btn-secondary">
                            Back
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceed() || isLoading}
                        className="btn-main"
                    >
                        {currentStep === steps.length - 1 ? (isLoading ? 'Completing...' : 'Complete') : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}
