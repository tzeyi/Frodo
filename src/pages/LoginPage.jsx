/* Firebase Google SSO login page for Frodo emergency response platform.
   Self-contained Firebase setup with role selection and clean UI. */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleGoogleSignIn } from '../services/authService'


function LoginPage() {
	const navigate = useNavigate()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	const onGoogleClick = async () => {
    	setLoading(true);
    	await handleGoogleSignIn(navigate);
    	setLoading(false);
  	};

	const pageContent = (
		<div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
			<div className="w-full max-w-lg">
				<div className="text-center mb-8">
					<div className="avatar placeholder w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary font-bold text-2xl">F</div>
				</div>
				<div className="card bg-base-100 shadow-xl p-8">
					<div className="text-center mb-6">
						<h1 className="text-2xl font-bold text-base-content mb-2">Sign in to Frodo</h1>
						<p className="text-base-content/70">Emergency response coordination platform</p>
					</div>

					<div className="space-y-4">
						<button
							className="btn btn-outline w-full h-12 flex items-center justify-center gap-3 text-base normal-case"
							onClick={onGoogleClick}
							disabled={loading}
						>
							{/* Google icon */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" aria-hidden>
								<path fill="#fbc02d" d="M43.6 20.5H42V20H24v8h11.3C34.7 32.4 30.9 35 26 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C35.9 2.9 31.2 1 26 1 12.7 1 2 11.7 2 25s10.7 24 24 24c12 0 23-9 23-24 0-1.6-.2-3.1-.4-4.5z"/>
								<path fill="#e53935" d="M6.3 14.2l6.6 4.8C14 15.2 19.6 11 26 11c3.3 0 6.3 1.2 8.6 3.2l6-6C35.9 2.9 31.2 1 26 1 17.6 1 10.1 5.6 6.3 14.2z"/>
								<path fill="#4caf50" d="M26 47c5.1 0 9.9-1.8 13.5-4.8l-6.6-5.5C30.8 36.9 28.5 37.7 26 37.7c-4.9 0-9-2.6-11.6-6.4l-6.8 5.2C8 43.1 16.7 47 26 47z"/>
								<path fill="#1565c0" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.2 5.6-6 7.5 0 .1 0 .1 0 .1 4.9 0 9.7-2.6 13.3-6.5 0 0 .1-.1.3-.6 0 0 .1-.3.1-.4l.9-3.6z"/>
							</svg>
							{loading ? 'Signing in...' : 'Sign in with Google'}
						</button>

						{error && (
							<div className="alert alert-error">
								<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span>{error}</span>
							</div>
						)}
					</div>

					<div className="divider my-6"></div>

					<div className="text-center">
						<p className="text-sm text-base-content/60 mb-4">
							New to emergency response coordination?
						</p>
						<button className="btn btn-ghost btn-sm">
							Create new organization
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						</button>
					</div>
				</div>

				<div className="text-center mt-6">
					<p className="text-xs text-base-content/50">
						By signing in, you agree to our Terms of Service and Privacy Policy
					</p>
				</div>

				{/* Testing button - remove in production */}
				<div className="text-center mt-4">
					<button 
						className="btn btn-xs btn-error btn-outline"
						onClick={() => {
							localStorage.clear()
							window.location.reload()
						}}
					>
						Clear & Reload (Testing)
					</button>
				</div>
			</div>
		</div>
	)

	return pageContent
}

export default LoginPage
