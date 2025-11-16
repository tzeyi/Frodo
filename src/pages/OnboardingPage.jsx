/* Onboarding flow for new users after first login */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { updateUserProfile } from '../services/authService'
import { getAllOrganizations } from '../services/seedFirestore'

function OnboardingPage() {
	const navigate = useNavigate()
	const [step, setStep] = useState('role') // 'role', 'organization'
	const [userType, setUserType] = useState(null)
	const [selectedOrganization, setSelectedOrganization] = useState('')
	const [newOrganizationName, setNewOrganizationName] = useState('')
	const [showNewOrgForm, setShowNewOrgForm] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [organizations, setOrganizations] = useState([])
	const [loadingOrgs, setLoadingOrgs] = useState(false)

	// Fetch organizations from Firestore on component mount
	useEffect(() => {
		const fetchOrganizations = async () => {
			setLoadingOrgs(true)
			try {
				const orgs = await getAllOrganizations()
				setOrganizations(orgs)
			} catch (err) {
				console.error('Error fetching organizations:', err)
				// Fallback to default organizations if Firestore fetch fails
				setOrganizations([
					{ id: 'default_1', name: 'Red Cross' },
					{ id: 'default_2', name: 'Doctors Without Borders' },
					{ id: 'default_3', name: 'United Way' },
					{ id: 'default_4', name: 'Salvation Army' },
					{ id: 'default_5', name: 'Habitat for Humanity' },
					{ id: 'default_6', name: 'World Vision' }
				])
			} finally {
				setLoadingOrgs(false)
			}
		}
		
		fetchOrganizations()
	}, [])

	const handleRoleSelection = (type) => {
		setUserType(type)
		if (type === 'independent') {
			// Independent volunteers go directly to dashboard
			completeOnboarding({ userType: 'independent' })
		} else {
			// Organization members need to select/create org
			setStep('organization')
		}
	}

	const handleOrganizationSelection = () => {
		const orgName = showNewOrgForm ? newOrganizationName : selectedOrganization
		
		if (!orgName.trim()) {
			return // Validation - require organization name
		}

		completeOnboarding({
			userType: 'organization',
			organizationName: orgName,
			isNewOrg: showNewOrgForm
		})
	}

	const completeOnboarding = async (profileData) => {
		setLoading(true)
		setError(null)
		
		try {
			// Get current user from Firebase Auth
			const user = auth.currentUser
			
			if (!user) {
				throw new Error('No authenticated user found')
			}
			
			// Update user profile in Firestore
			await updateUserProfile(user.uid, profileData)
			
			// Navigate to dashboard
			navigate('/')
		} catch (err) {
			console.error('Error completing onboarding:', err)
			setError(err.message || 'Failed to complete onboarding. Please try again.')
			setLoading(false)
		}
	}

	const renderRoleSelection = () => (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-base-content mb-2">Welcome to Frodo!</h2>
				<p className="text-base-content/70">Tell us a bit about yourself to get started</p>
			</div>

			{error && (
				<div className="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			)}

			<div className="space-y-4">
				<button
					className="btn btn-outline w-full h-16 flex flex-col items-center justify-center gap-2 text-left normal-case hover:btn-primary"
					onClick={() => handleRoleSelection('organization')}
				>
					<div className="font-semibold">I'm part of an NGO or volunteer organization</div>
					<div className="text-sm opacity-60">I represent or work with an established organization</div>
				</button>

				<button
					className="btn btn-outline w-full h-16 flex flex-col items-center justify-center gap-2 text-left normal-case hover:btn-primary"
					onClick={() => handleRoleSelection('independent')}
				>
					<div className="font-semibold">I'm an independent volunteer</div>
					<div className="text-sm opacity-60">I want to help but I'm not affiliated with any organization</div>
				</button>
			</div>
		</div>
	)

	const renderOrganizationSelection = () => (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-base-content mb-2">Find your organization</h2>
				<p className="text-base-content/70">Select your organization or create a new one</p>
			</div>

			{error && (
				<div className="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			)}

			{!showNewOrgForm ? (
				<div className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">Select your organization</span>
						</label>
						{loadingOrgs ? (
							<div className="flex justify-center p-4">
								<span className="loading loading-spinner loading-md"></span>
							</div>
						) : (
							<select
								className="select select-bordered w-full"
								value={selectedOrganization}
								onChange={(e) => setSelectedOrganization(e.target.value)}
							>
								<option value="">Choose an organization...</option>
								{organizations.map((org) => (
									<option key={org.id} value={org.name}>{org.name}</option>
								))}
							</select>
						)}
					</div>

					<div className="divider">OR</div>

					<button
						className="btn btn-ghost w-full"
						onClick={() => setShowNewOrgForm(true)}
					>
						Create new organization
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</button>

					<button
						className="btn btn-primary w-full"
						onClick={handleOrganizationSelection}
						disabled={!selectedOrganization || loading}
					>
						{loading ? 'Saving...' : 'Continue'}
					</button>
				</div>
			) : (
				<div className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">Organization name</span>
						</label>
						<input
							type="text"
							placeholder="Enter your organization name"
							className="input input-bordered w-full"
							value={newOrganizationName}
							onChange={(e) => setNewOrganizationName(e.target.value)}
						/>
					</div>

					<div className="flex gap-2">
						<button
							className="btn btn-ghost flex-1"
							onClick={() => {
								setShowNewOrgForm(false)
								setNewOrganizationName('')
							}}
							disabled={loading}
						>
							Back
						</button>
						<button
							className="btn btn-primary flex-1"
							onClick={handleOrganizationSelection}
							disabled={!newOrganizationName.trim() || loading}
						>
							{loading ? 'Creating...' : 'Create & Continue'}
						</button>
					</div>
				</div>
			)}
		</div>
	)

	return (
		<div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
			<div className="w-full max-w-lg">
				<div className="text-center mb-8">
					<div className="avatar placeholder w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center text-primary font-bold text-2xl">F</div>
				</div>
				
				<div className="card bg-base-100 shadow-xl p-8">
					{step === 'role' && renderRoleSelection()}
					{step === 'organization' && renderOrganizationSelection()}
				</div>

				<div className="text-center mt-4">
					<p className="text-xs text-base-content/50">
						You can change these settings later in your profile
					</p>
				</div>
			</div>
		</div>
	)
}

export default OnboardingPage