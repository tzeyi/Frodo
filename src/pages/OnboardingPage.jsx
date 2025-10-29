/* Onboarding flow for new users after first login */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OnboardingPage() {
	const navigate = useNavigate()
	const [step, setStep] = useState('role') // 'role', 'organization'
	const [userType, setUserType] = useState(null)
	const [selectedOrganization, setSelectedOrganization] = useState('')
	const [newOrganizationName, setNewOrganizationName] = useState('')
	const [showNewOrgForm, setShowNewOrgForm] = useState(false)

	// Mock existing organizations - in real app, fetch from Firestore
	const existingOrganizations = [
		'Red Cross',
		'Doctors Without Borders',
		'United Way',
		'Salvation Army',
		'Habitat for Humanity',
		'World Vision'
	]

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

	const completeOnboarding = (profileData) => {
		try {
			// Get existing user data from localStorage
			const existingUser = JSON.parse(localStorage.getItem('frodo_user'))
			
			// Add onboarding profile data
			const updatedUser = {
				...existingUser,
				...profileData,
				hasCompletedOnboarding: true
			}
			
			// Save updated user profile
			localStorage.setItem('frodo_user', JSON.stringify(updatedUser))
			
			// Navigate to dashboard
			navigate('/')
		} catch (error) {
			console.error('Error completing onboarding:', error)
		}
	}

	const renderRoleSelection = () => (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-base-content mb-2">Welcome to Frodo!</h2>
				<p className="text-base-content/70">Tell us a bit about yourself to get started</p>
			</div>

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

			{!showNewOrgForm ? (
				<div className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">Select your organization</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={selectedOrganization}
							onChange={(e) => setSelectedOrganization(e.target.value)}
						>
							<option value="">Choose an organization...</option>
							{existingOrganizations.map((org, index) => (
								<option key={index} value={org}>{org}</option>
							))}
						</select>
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
						disabled={!selectedOrganization}
					>
						Continue
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
						>
							Back
						</button>
						<button
							className="btn btn-primary flex-1"
							onClick={handleOrganizationSelection}
							disabled={!newOrganizationName.trim()}
						>
							Create & Continue
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