/* Admin Data Seeding Page
   UI for seeding Firestore with mock data */

import { useState, useEffect } from 'react'
import { 
	seedAllData, 
	clearAllData, 
	checkDataExists,
	seedLocations,
	seedUsers,
	seedOrganizations,
	seedEvents,
	seedTickets,
	seedContributions,
	seedResources,
	seedFunding,
	seedPosts,
	seedReplies
} from '../services/seedFirestore'

function DataSeedingPage() {
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [dataStatus, setDataStatus] = useState(null)

	useEffect(() => {
		checkStatus()
	}, [])

	const checkStatus = async () => {
		try {
			const status = await checkDataExists()
			setDataStatus(status)
		} catch (err) {
			console.error('Error checking status:', err)
		}
	}

	const handleSeedAll = async () => {
		setLoading(true)
		setMessage('')
		setError('')
		
		try {
			const result = await seedAllData()
			if (result.success) {
				setMessage(result.message)
				await checkStatus()
			} else {
				setError(result.error)
			}
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const handleClearAll = async () => {
		if (!confirm('⚠️ This will delete all seeded data from Firestore. Are you sure?')) return
		
		setLoading(true)
		setMessage('')
		setError('')
		
		try {
			const result = await clearAllData()
			if (result.success) {
				setMessage(result.message)
				await checkStatus()
			} else {
				setError(result.error)
			}
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const handleSeedIndividual = async (seedFunction, name) => {
		setLoading(true)
		setMessage('')
		setError('')
		
		try {
			const result = await seedFunction()
			setMessage(`✅ ${name} seeded successfully! (${result.count} items)`)
			await checkStatus()
		} catch (err) {
			setError(`Failed to seed ${name}: ${err.message}`)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-base-200 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-primary mb-8">🌱 Firestore Data Seeding</h1>
				
				{/* Status Messages */}
				{message && (
					<div className="alert alert-success mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{message}</span>
					</div>
				)}
				
				{error && (
					<div className="alert alert-error mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{error}</span>
					</div>
				)}

				{/* Current Status */}
				{dataStatus && (
					<div className="card bg-base-100 shadow-xl mb-6">
						<div className="card-body">
							<h2 className="card-title">📊 Current Data Status</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
								<div className="stat bg-base-200 rounded-lg">
									<div className="stat-title">Locations</div>
									<div className="stat-value text-primary">{dataStatus.locations || 0}</div>
								</div>
								<div className="stat bg-base-200 rounded-lg">
									<div className="stat-title">Organizations</div>
									<div className="stat-value text-secondary">{dataStatus.organizations || 0}</div>
								</div>
								<div className="stat bg-base-200 rounded-lg">
									<div className="stat-title">Events</div>
									<div className="stat-value text-accent">{dataStatus.events || 0}</div>
								</div>
								<div className="stat bg-base-200 rounded-lg">
									<div className="stat-title">Tickets</div>
									<div className="stat-value text-info">{dataStatus.tickets || 0}</div>
								</div>
							</div>
							<button 
								className="btn btn-ghost btn-sm mt-4"
								onClick={checkStatus}
								disabled={loading}
							>
								🔄 Refresh Status
							</button>
						</div>
					</div>
				)}

				{/* Bulk Operations */}
				<div className="card bg-base-100 shadow-xl mb-6">
					<div className="card-body">
						<h2 className="card-title">⚡ Bulk Operations</h2>
						<p className="text-base-content/70 mb-4">
							Seed or clear all collections at once
						</p>
						<div className="flex gap-4">
							<button 
								className="btn btn-primary flex-1"
								onClick={handleSeedAll}
								disabled={loading}
							>
								{loading ? (
									<span className="loading loading-spinner"></span>
								) : (
									<>🌱 Seed All Data</>
								)}
							</button>
							<button 
								className="btn btn-error btn-outline flex-1"
								onClick={handleClearAll}
								disabled={loading}
							>
								🗑️ Clear All Data
							</button>
						</div>
					</div>
				</div>

				{/* Individual Collection Seeding */}
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<h2 className="card-title">🎯 Seed Individual Collections</h2>
						<p className="text-base-content/70 mb-4">
							Seed specific collections one at a time
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedLocations, 'Locations')}
								disabled={loading}
							>
								📍 Seed Locations
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedUsers, 'Users')}
								disabled={loading}
							>
								👥 Seed Users
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedOrganizations, 'Organizations')}
								disabled={loading}
							>
								🏢 Seed Organizations
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedEvents, 'Events')}
								disabled={loading}
							>
								📅 Seed Events
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedTickets, 'Tickets')}
								disabled={loading}
							>
								🎫 Seed Tickets
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedContributions, 'Contributions')}
								disabled={loading}
							>
								🤝 Seed Contributions
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedResources, 'Resources')}
								disabled={loading}
							>
								📦 Seed Resources
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedFunding, 'Funding')}
								disabled={loading}
							>
								💰 Seed Funding
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedPosts, 'Posts')}
								disabled={loading}
							>
								💬 Seed Posts
							</button>
							<button 
								className="btn btn-outline"
								onClick={() => handleSeedIndividual(seedReplies, 'Replies')}
								disabled={loading}
							>
								💭 Seed Replies
							</button>
						</div>
					</div>
				</div>

				{/* Info Card */}
				<div className="alert alert-info mt-6">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<div>
						<h3 className="font-bold">About Data Seeding</h3>
						<div className="text-sm">
							This tool populates Firestore with mock data from <code className="bg-base-300 px-1 rounded">data.json</code>.
							Use this for development and testing. Data includes locations (Ann Arbor & Detroit),
							organizations, events, tickets, resources, and funding information.
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DataSeedingPage
