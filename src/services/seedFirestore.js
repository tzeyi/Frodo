/* Firestore Data Seeding Utility
   Populates Firestore with mock data from data.json */

import { collection, doc, setDoc, writeBatch, getDocs, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import mockData from '../assets/data.json'

/**
 * Seed all collections to Firestore
 */
export const seedAllData = async () => {
	try {
		console.log('🌱 Starting Firestore data seeding...')
		
		await seedLocations()
		await seedOrganizations()
		await seedEvents()
		await seedTickets()
		await seedResources()
		await seedFunding()
		
		console.log('✅ All data seeded successfully!')
		return { success: true, message: 'All data seeded successfully!' }
	} catch (error) {
		console.error('❌ Error seeding data:', error)
		return { success: false, error: error.message }
	}
}

/**
 * Seed locations collection
 */
export const seedLocations = async () => {
	try {
		console.log('📍 Seeding locations...')
		const batch = writeBatch(db)
		
		mockData.locations.forEach((location) => {
			const locationRef = doc(db, 'locations', location.id)
			batch.set(locationRef, {
				...location,
				createdAt: new Date().toISOString()
			})
		})
		
		await batch.commit()
		console.log(`✅ Seeded ${mockData.locations.length} locations`)
		return { success: true, count: mockData.locations.length }
	} catch (error) {
		console.error('Error seeding locations:', error)
		throw error
	}
}

/**
 * Seed organizations collection
 */
export const seedOrganizations = async () => {
	try {
		console.log('🏢 Seeding organizations...')
		const batch = writeBatch(db)
		
		mockData.organizations.forEach((org) => {
			const orgRef = doc(db, 'organizations', org.id)
			batch.set(orgRef, {
				...org,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			})
		})
		
		await batch.commit()
		console.log(`✅ Seeded ${mockData.organizations.length} organizations`)
		return { success: true, count: mockData.organizations.length }
	} catch (error) {
		console.error('Error seeding organizations:', error)
		throw error
	}
}

/**
 * Seed events collection
 */
export const seedEvents = async () => {
	try {
		console.log('📅 Seeding events...')
		const batch = writeBatch(db)
		
		mockData.events.forEach((event) => {
			const eventRef = doc(db, 'events', event.id)
			batch.set(eventRef, {
				...event,
				updatedAt: new Date().toISOString()
			})
		})
		
		await batch.commit()
		console.log(`✅ Seeded ${mockData.events.length} events`)
		return { success: true, count: mockData.events.length }
	} catch (error) {
		console.error('Error seeding events:', error)
		throw error
	}
}

/**
 * Seed tickets collection
 */
export const seedTickets = async () => {
	try {
		console.log('🎫 Seeding tickets...')
		const batch = writeBatch(db)
		
		mockData.tickets.forEach((ticket) => {
			const ticketRef = doc(db, 'tickets', ticket.id)
			batch.set(ticketRef, {
				...ticket,
				createdAt: ticket.timeOpened,
				updatedAt: new Date().toISOString()
			})
		})
		
		await batch.commit()
		console.log(`✅ Seeded ${mockData.tickets.length} tickets`)
		return { success: true, count: mockData.tickets.length }
	} catch (error) {
		console.error('Error seeding tickets:', error)
		throw error
	}
}

/**
 * Seed resources collection (single document with all resources)
 */
export const seedResources = async () => {
	try {
		console.log('📦 Seeding resources...')
		
		const resourcesRef = doc(db, 'resources', 'current')
		await setDoc(resourcesRef, {
			resources: mockData.resources,
			lastUpdated: new Date().toISOString()
		})
		
		console.log(`✅ Seeded ${mockData.resources.length} resource types`)
		return { success: true, count: mockData.resources.length }
	} catch (error) {
		console.error('Error seeding resources:', error)
		throw error
	}
}

/**
 * Seed funding collection (single document)
 */
export const seedFunding = async () => {
	try {
		console.log('💰 Seeding funding data...')
		
		const fundingRef = doc(db, 'funding', 'current')
		await setDoc(fundingRef, {
			...mockData.funding,
			lastUpdated: new Date().toISOString()
		})
		
		console.log('✅ Seeded funding data')
		return { success: true }
	} catch (error) {
		console.error('Error seeding funding:', error)
		throw error
	}
}

/**
 * Clear all seeded data from Firestore
 */
export const clearAllData = async () => {
	try {
		console.log('🗑️  Clearing all seeded data...')
		
		const collections = ['locations', 'organizations', 'events', 'tickets', 'resources', 'funding']
		
		for (const collectionName of collections) {
			const snapshot = await getDocs(collection(db, collectionName))
			const batch = writeBatch(db)
			
			snapshot.docs.forEach((document) => {
				batch.delete(document.ref)
			})
			
			if (snapshot.docs.length > 0) {
				await batch.commit()
				console.log(`✅ Cleared ${snapshot.docs.length} documents from ${collectionName}`)
			}
		}
		
		console.log('✅ All seeded data cleared!')
		return { success: true, message: 'All data cleared successfully!' }
	} catch (error) {
		console.error('❌ Error clearing data:', error)
		return { success: false, error: error.message }
	}
}

/**
 * Check if data already exists in Firestore
 */
export const checkDataExists = async () => {
	try {
		const collections = ['locations', 'organizations', 'events', 'tickets']
		const status = {}
		
		for (const collectionName of collections) {
			const snapshot = await getDocs(collection(db, collectionName))
			status[collectionName] = snapshot.docs.length
		}
		
		return status
	} catch (error) {
		console.error('Error checking data:', error)
		throw error
	}
}

/**
 * Get location by ID
 */
export const getLocationById = async (locationId) => {
	try {
		const locationDoc = await getDoc(doc(db, 'locations', locationId))
		if (locationDoc.exists()) {
			return { id: locationDoc.id, ...locationDoc.data() }
		}
		return null
	} catch (error) {
		console.error('Error getting location:', error)
		throw error
	}
}

/**
 * Get all locations
 */
export const getAllLocations = async () => {
	try {
		const snapshot = await getDocs(collection(db, 'locations'))
		return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
	} catch (error) {
		console.error('Error getting locations:', error)
		throw error
	}
}

/**
 * Get all organizations
 */
export const getAllOrganizations = async () => {
	try {
		const snapshot = await getDocs(collection(db, 'organizations'))
		return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
	} catch (error) {
		console.error('Error getting organizations:', error)
		throw error
	}
}
