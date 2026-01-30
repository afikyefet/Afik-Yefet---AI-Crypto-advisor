import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, signup, toggleIsSignup } from '../store/actions/user.action'

const EMPTY_CREDENTIALS = {
    email: '',
    name: '',
    password: ''
}

export function Login() {
    const { user, isSignup } = useSelector(storeState => storeState.userModule)
    const [credentials, setCredentials] = useState(EMPTY_CREDENTIALS)
    const [errorMsg, setErrorMsg] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (user) navigate('/')
    }, [user, navigate])

    function handleChange({ target }) {
        const { name, value } = target
        setCredentials(prev => ({ ...prev, [name]: value }))
    }

    async function onSubmit(ev) {
        ev.preventDefault()
        setErrorMsg('')

        const { email, name, password } = credentials
        if (!email || !password || (isSignup && !name)) {
            setErrorMsg('Please fill in all required fields')
            return
        }

        try {
            if (isSignup) {
                await signup({ email, name, password })
            } else {
                await login({ email, password })
            }
            navigate('/')
        } catch (err) {
            setErrorMsg(typeof err === 'string' ? err : 'Something went wrong')
        }
    }

    function onToggleMode() {
        toggleIsSignup()
        setErrorMsg('')
    }

    return (
        <div className="login-container">
            <h1>{isSignup ? 'Sign up' : 'Login'}</h1>

            <form onSubmit={onSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                </label>

                {isSignup && (
                    <label>
                        Full name
                        <input
                            type="text"
                            name="name"
                            value={credentials.name}
                            onChange={handleChange}
                            required
                        />
                    </label>
                )}

                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </label>

                <button className="btn-main">
                    {isSignup ? 'Create account' : 'Login'}
                </button>
                <button type="button" className="btn-text" onClick={onToggleMode}>
                    {isSignup ? 'Have an account? Login' : 'New here? Sign up'}
                </button>
            </form>

            {errorMsg && <p className="error">{errorMsg}</p>}
        </div>
    )
}
