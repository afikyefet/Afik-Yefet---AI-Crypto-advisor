import { useState } from 'react'
import { useSelector } from 'react-redux'
import { completeOnboarding, updatePreferences } from '../store/actions/user.action'

export function Onboarding() {
    const { user } = useSelector(storeState => storeState.userModule)
    const [currentStep, setCurrentStep] = useState(0)
    const [preferences, setPreferences] = useState({
        'fav-coins': [],
        'investor-type': '',
        'content-type': []
    })
    const [favCoinInput, setFavCoinInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const steps = [
        {
            question: 'What are your favorite cryptocurrencies?',
            type: 'fav-coins'
        },
        {
            question: 'What type of investor are you?',
            type: 'investor-type'
        },
        {
            question: 'What content types interest you?',
            type: 'content-type'
        }
    ]

    function handleAddFavCoin() {
        if (favCoinInput.trim() && !preferences['fav-coins'].includes(favCoinInput.trim())) {
            setPreferences(prev => ({
                ...prev,
                'fav-coins': [...prev['fav-coins'], favCoinInput.trim()]
            }))
            setFavCoinInput('')
        }
    }

    function handleRemoveFavCoin(coin) {
        setPreferences(prev => ({
            ...prev,
            'fav-coins': prev['fav-coins'].filter(c => c !== coin)
        }))
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
            return preferences['investor-type'] !== ''
        }
        if (step.type === 'content-type') {
            return preferences['content-type'].length > 0
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
                        <div className="fav-coins-input">
                            <input
                                type="text"
                                value={favCoinInput}
                                onChange={(e) => setFavCoinInput(e.target.value)}
                                placeholder="Enter coin name (e.g., bitcoin)"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddFavCoin()
                                    }
                                }}
                            />
                            <button type="button" onClick={handleAddFavCoin}>Add</button>
                        </div>
                        <div className="fav-coins-list">
                            {preferences['fav-coins'].map((coin, idx) => (
                                <span key={idx} className="fav-coin-tag">
                                    {coin}
                                    <button type="button" onClick={() => handleRemoveFavCoin(coin)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {currentQuestion.type === 'investor-type' && (
                    <div className="onboarding-input-section">
                        <select
                            value={preferences['investor-type']}
                            onChange={(e) => setPreferences(prev => ({ ...prev, 'investor-type': e.target.value }))}
                        >
                            <option value="">Select investor type</option>
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </div>
                )}

                {currentQuestion.type === 'content-type' && (
                    <div className="onboarding-input-section">
                        <label>
                            <input
                                type="checkbox"
                                value="news"
                                checked={preferences['content-type'].includes('news')}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setPreferences(prev => ({
                                        ...prev,
                                        'content-type': checked
                                            ? [...prev['content-type'], 'news']
                                            : prev['content-type'].filter(type => type !== 'news')
                                    }))
                                }}
                            />
                            News
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                value="analysis"
                                checked={preferences['content-type'].includes('analysis')}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setPreferences(prev => ({
                                        ...prev,
                                        'content-type': checked
                                            ? [...prev['content-type'], 'analysis']
                                            : prev['content-type'].filter(type => type !== 'analysis')
                                    }))
                                }}
                            />
                            Analysis
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                value="memes"
                                checked={preferences['content-type'].includes('memes')}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setPreferences(prev => ({
                                        ...prev,
                                        'content-type': checked
                                            ? [...prev['content-type'], 'memes']
                                            : prev['content-type'].filter(type => type !== 'memes')
                                    }))
                                }}
                            />
                            Memes
                        </label>
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
