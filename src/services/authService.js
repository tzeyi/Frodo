import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth} from '../firebase'
import { GoogleAuthProvider, signInWithRedirect, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { getAllOrganizations } from './seedFirestore'


/**
 * Sign in with Google and create/retrieve user from Firestore
 * @returns {Promise<{user: object, isFirstTimeUser: boolean}>}
 */
export const googleSignIn = async () => {
	try {
		const provider = new GoogleAuthProvider()
		const result = await signInWithPopup(auth, provider)
		const user = result.user

		// Check if user exists in Firestore
		const userDoc = await getDoc(doc(db, 'users', user.uid))
		
		if (!userDoc.exists()) {
			// First-time user - create new user document
			await createUserDocument(user)
			return { user, isFirstTimeUser: true }
		} else {
			// Returning user
			const userData = userDoc.data()
			return { 
				user: { ...user, ...userData }, 
				isFirstTimeUser: !userData.hasCompletedOnboarding 
			}
		}
	} catch (error) {
		// Handle user-cancelled popup gracefully
		if (error.code === 'auth/popup-closed-by-user') {
			console.log('Sign-in popup was closed by user')
			// Return a special object to indicate user cancelled
			return { cancelled: true }
		}
		
		// Handle other auth errors
		if (error.code === 'auth/cancelled-popup-request') {
			console.log('Sign-in popup was cancelled')
			return { cancelled: true }
		}
		
		console.error('Error signing in with Google:', error)
		throw error
	}
}

/**
 * Create a new user document in Firestore
 * @param {object} user - Firebase auth user object
 */
export const createUserDocument = async (user) => {
	try {
		const userRef = doc(db, 'users', user.uid)
		const email = (user.email || '').toLowerCase()

		// Default values for independent volunteers
		let assignedOrganization = null
		let assignedOrganizationId = null
		let assignedRole = 'Volunteer'
		let assignedRoleId = 'role_volunteer'

		// Try to determine if the user belongs to an NGO or volunteer organization by email domain
		try {
			const orgs = await getAllOrganizations()
			const domain = email.split('@')[1]
			
			if (domain) {
				// Match user to organization by email domain
				const matched = orgs.find(o => {
					const orgEmail = (o.contact && o.contact.email) ? o.contact.email.toLowerCase() : ''
					const orgDomain = orgEmail.split('@')[1]
					
					// Match if user's domain matches organization's email domain
					return orgDomain && domain === orgDomain
				})
				
				if (matched) {
					// User is part of an NGO/volunteer organization -> assign Admin role
					assignedOrganization = matched.name || null
					assignedOrganizationId = matched.id || null
					assignedRole = 'Admin'
					assignedRoleId = 'role_admin'
				}
				// If no match found, user remains as independent Volunteer (default values above)
			}
		} catch (err) {
			// If organization lookup fails, fall back to default role (independent volunteer)
			console.warn('Could not determine organization for user:', err)
		}

		const userData = {
			id: user.uid,
			name: user.displayName || '',
			email: email,
			photoURL: user.photoURL || '',
			organization: assignedOrganization,
			organizationId: assignedOrganizationId,
			role: assignedRole,
			roleId: assignedRoleId,
			locations: [],
			hasCompletedOnboarding: false,
			createdAt: new Date().toISOString(),
			lastLogin: new Date().toISOString()
		}

		await setDoc(userRef, userData)
		return userData
	} catch (error) {
		console.error('Error creating user document:', error)
		throw error
	}
}

/**
 * Update user profile after onboarding
 * @param {string} userId - User's UID
 * @param {object} profileData - Profile data from onboarding
 */
export const updateUserProfile = async (userId, profileData) => {
	try {
		const userRef = doc(db, 'users', userId)
		
		// Prepare update data based on user type
		const updateData = {
			hasCompletedOnboarding: true,
			lastUpdated: new Date().toISOString()
		}
		
		if (profileData.userType === 'organization') {
			updateData.organization = profileData.organizationName
			updateData.role = 'Volunteer' // Can be updated later by org admin
		} else if (profileData.userType === 'independent') {
			updateData.organization = 'Independent'
			updateData.role = 'Independent Volunteer'
		}
		
		await updateDoc(userRef, updateData)
		return updateData
	} catch (error) {
		console.error('Error updating user profile:', error)
		throw error
	}
}

/**
 * Get user data from Firestore
 * @param {string} userId - User's UID
 * @returns {Promise<object>} User data
 */
export const getUserData = async (userId) => {
	try {
		const userDoc = await getDoc(doc(db, 'users', userId))
		if (userDoc.exists()) {
			return { id: userDoc.id, ...userDoc.data() }
		}
		return null
	} catch (error) {
		console.error('Error getting user data:', error)
		throw error
	}
}

/**
 * Update user's last login timestamp
 * @param {string} userId - User's UID
 */
export const updateLastLogin = async (userId) => {
	try {
		const userRef = doc(db, 'users', userId)
		await updateDoc(userRef, {
			lastLogin: new Date().toISOString()
		})
	} catch (error) {
		console.error('Error updating last login:', error)
		// Don't throw - this is not critical
	}
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
	try {
		await firebaseSignOut(auth)
	} catch (error) {
		console.error('Error signing out:', error)
		throw error
	}
}
    