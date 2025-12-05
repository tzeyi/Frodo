// https://medium.com/@unosega/to-do-list-web-app-vite-react-and-firebase-3c1798eb28c5
// https://firebase.google.com/docs/web/setup

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import mockData from '../assets/data.json'

// Resource Types Configuration
/**
 * Get all resource types with their available units
 */
export const getResourceTypes = () => {
    return mockData.resourceTypes || [
        { id: 'water', name: 'Water', units: ['bottles', 'liters', 'gallons', 'ml', 'cases', 'other'] },
        { id: 'food', name: 'Food', units: ['meals', 'kg', 'lbs', 'boxes', 'cans', 'packages', 'other'] },
        { id: 'labor', name: 'Labor/Volunteers', units: ['volunteers', 'hours', 'days', 'other'] },
        { id: 'other', name: 'Other', units: ['other'] }
    ]
}

/**
 * Get units for a specific resource type
 */
export const getUnitsForResourceType = (resourceTypeId) => {
    const resourceType = getResourceTypes().find(rt => rt.id === resourceTypeId)
    return resourceType ? resourceType.units : ['other']
}

// Resources
export const addResourceToFirestore = async (resource) => {
    try {
        const docRef = await addDoc(collection(db, "resources"), resource);
        return {id: docRef.id, ...resource}
    } catch (error) {
        console.error("Error adding resource: ", error)
    }
}

export const fetchResources = async (setResources, setResourceLoading) => {
    const docSnap = await getDoc(doc(db, "resources", "current"));
    const resources = docSnap.data().resources

    console.log(resources)

    setResources(resources)
    setResourceLoading(false)
}


// Fundings
export const fetchFunding = async (setFunding, setFundingLoading) => {
    const docSnap = await getDoc(doc(db, "funding", "current"));

    if (!docSnap.empty) {
        const funding = docSnap.data(); // Get first document
        setFunding(funding);
    } else {
        console.log("No funding documents found");
    }
    
    setFundingLoading(false);
}


// Events
export const fetchEvents = async (setEvents, setEventsLoading) => {
    try {
        const docSnap = await getDocs(collection(db, "events"));
        
        const events = docSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    
        console.log(events);
        setEvents(events);
        setEventsLoading(false);
    } catch (error) {
        console.error("Error fetching events:", error);
        setEventsLoading(false);
    }
}

/**
 * Get all events from Firestore
 */
export const getAllEvents = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'events'))
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
        console.error('Error getting events:', error)
        throw error
    }
}

/**
 * Get a single event by ID
 */
export const getEventById = async (eventId) => {
    try {
        const eventDoc = await getDoc(doc(db, 'events', eventId))
        if (eventDoc.exists()) {
            return { id: eventDoc.id, ...eventDoc.data() }
        }
        return null
    } catch (error) {
        console.error('Error getting event:', error)
        throw error
    }
}

/**
 * Get the next available event ID
 */
const getNextEventId = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'events'))
        if (snapshot.empty) {
            return 1
        }
        
        const ids = snapshot.docs.map(doc => {
            const id = doc.id
            const numId = parseInt(id)
            return isNaN(numId) ? 0 : numId
        })
        
        const maxId = Math.max(...ids)
        return maxId + 1
    } catch (error) {
        console.error('Error getting next event ID:', error)
        return 1
    }
}

/**
 * Create a new event
 */
export const createEvent = async (eventData) => {
    try {
        const nextId = await getNextEventId()
        const eventRef = doc(db, 'events', String(nextId))
        
        const newEvent = {
            ...eventData,
            status: eventData.status || 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        
        await setDoc(eventRef, newEvent)
        return { id: nextId, ...newEvent }
    } catch (error) {
        console.error('Error creating event:', error)
        throw error
    }
}

/**
 * Update an event
 */
export const updateEvent = async (eventId, updates) => {
    try {
        const eventRef = doc(db, 'events', eventId)
        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        }
        
        await updateDoc(eventRef, updateData)
        return { id: eventId, ...updateData }
    } catch (error) {
        console.error('Error updating event:', error)
        throw error
    }
}

/**
 * Delete an event
 */
export const deleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, 'events', eventId))
        return { success: true, id: eventId }
    } catch (error) {
        console.error('Error deleting event:', error)
        throw error
    }
}

/**
 * Get events by organization ID
 */
export const getEventsByOrganization = async (organizationId) => {
    try {
        const snapshot = await getDocs(collection(db, 'events'))
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return events.filter(event => event.organizationId === organizationId)
    } catch (error) {
        console.error('Error getting events by organization:', error)
        throw error
    }
}


// Tickets
export const fetchTickets = async (setTickets, setTicketsLoading) => {
    try {
        const docSnap = await getDocs(collection(db, "tickets"))

        const tickets = docSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        console.log(tickets)
        setTickets(tickets)
        setTicketsLoading(false)
    } catch (error) {
        console.error("Error fetching tickets:", error)
        setTicketsLoading(false)
    }
}

/**
 * Get all tickets from Firestore
 */
export const getAllTickets = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'tickets'))
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
        console.error('Error getting tickets:', error)
        throw error
    }
}

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (ticketId) => {
    try {
        const ticketDoc = await getDoc(doc(db, 'tickets', String(ticketId)))
        if (ticketDoc.exists()) {
            return { id: ticketDoc.id, ...ticketDoc.data() }
        }
        return null
    } catch (error) {
        console.error('Error getting ticket:', error)
        throw error
    }
}

/**
 * Get the next available ticket ID
 */
const getNextTicketId = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'tickets'))
        if (snapshot.empty) {
            return 1
        }
        
        // Find the highest numeric ID
        const ids = snapshot.docs.map(doc => {
            const id = doc.id
            // Handle both string and numeric IDs during migration
            const numId = parseInt(id)
            return isNaN(numId) ? 0 : numId
        })
        
        const maxId = Math.max(...ids)
        return maxId + 1
    } catch (error) {
        console.error('Error getting next ticket ID:', error)
        return 1
    }
}

/**
 * Create a new ticket
 */
export const createTicket = async (ticketData) => {
    try {
        const nextId = await getNextTicketId()
        const ticketRef = doc(db, 'tickets', String(nextId))
        
        const newTicket = {
            ...ticketData,
            amountAchieved: ticketData.amountAchieved || 0,
            status: ticketData.status || 'open',
            timeOpened: new Date().toISOString(),
            timeClosed: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        
        await setDoc(ticketRef, newTicket)
        return { id: nextId, ...newTicket }
    } catch (error) {
        console.error('Error creating ticket:', error)
        throw error
    }
}

/**
 * Update a ticket
 */
export const updateTicket = async (ticketId, updates) => {
    try {
        const ticketRef = doc(db, 'tickets', ticketId)
        const updateData = {
            ...updates,
            updatedAt: new Date().toISOString()
        }
        
        // If status is being changed to closed, set timeClosed
        if (updates.status === 'closed' && !updates.timeClosed) {
            updateData.timeClosed = new Date().toISOString()
        }
        
        await updateDoc(ticketRef, updateData)
        return { id: ticketId, ...updateData }
    } catch (error) {
        console.error('Error updating ticket:', error)
        throw error
    }
}

/**
 * Update ticket status
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
    try {
        return await updateTicket(ticketId, { status: newStatus })
    } catch (error) {
        console.error('Error updating ticket status:', error)
        throw error
    }
}

/**
 * Get tickets by event ID
 */
export const getTicketsByEvent = async (eventId) => {
    try {
        const snapshot = await getDocs(collection(db, 'tickets'))
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return tickets.filter(ticket => ticket.eventId === eventId)
    } catch (error) {
        console.error('Error getting tickets by event:', error)
        throw error
    }
}

/**
 * Get tickets by organization ID
 */
export const getTicketsByOrganization = async (organizationId) => {
    try {
        const snapshot = await getDocs(collection(db, 'tickets'))
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        return tickets.filter(ticket => ticket.organizationId === organizationId)
    } catch (error) {
        console.error('Error getting tickets by organization:', error)
        throw error
    }
}

/**
 * Delete a ticket
 */
export const deleteTicket = async (ticketId) => {
    try {
        await deleteDoc(doc(db, 'tickets', ticketId))
        return { success: true, id: ticketId }
    } catch (error) {
        console.error('Error deleting ticket:', error)
        throw error
    }
}

// Contributions
/**
 * Get the next available contribution ID
 */
const getNextContributionId = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'contributions'))
        if (snapshot.empty) {
            return 1
        }
        
        const ids = snapshot.docs.map(doc => {
            const id = doc.id
            const numId = parseInt(id)
            return isNaN(numId) ? 0 : numId
        })
        
        const maxId = Math.max(...ids)
        return maxId + 1
    } catch (error) {
        console.error('Error getting next contribution ID:', error)
        return 1
    }
}

/**
 * Create a new contribution for a ticket or update existing one
 * Each user can only have one contribution per ticket
 */
export const createContribution = async (contributionData) => {
    try {
        // Check if user already has a contribution for this ticket
        const contributions = await getContributionsByTicket(contributionData.ticketId)
        const existingContribution = contributions.find(c => c.userId === contributionData.userId)
        
        if (existingContribution) {
            // Update existing contribution
            return await updateContribution(existingContribution.id, contributionData.amount)
        }
        
        // Create new contribution
        const nextId = await getNextContributionId()
        const contributionRef = doc(db, 'contributions', String(nextId))
        
        const newContribution = {
            ...contributionData,
            createdAt: new Date().toISOString()
        }
        
        await setDoc(contributionRef, newContribution)
        
        // Update ticket's amountAchieved
        await updateTicketAmountAchieved(contributionData.ticketId)
        
        return { id: nextId, ...newContribution }
    } catch (error) {
        console.error('Error creating contribution:', error)
        throw error
    }
}

/**
 * Update an existing contribution's amount
 */
export const updateContribution = async (contributionId, newAmount) => {
    try {
        const contributionRef = doc(db, 'contributions', String(contributionId))
        const contributionSnap = await getDoc(contributionRef)
        
        if (!contributionSnap.exists()) {
            throw new Error('Contribution not found')
        }
        
        const contributionData = contributionSnap.data()
        
        await updateDoc(contributionRef, {
            amount: newAmount,
            updatedAt: new Date().toISOString()
        })
        
        // Update ticket's amountAchieved
        await updateTicketAmountAchieved(contributionData.ticketId)
        
        return { id: contributionId, ...contributionData, amount: newAmount }
    } catch (error) {
        console.error('Error updating contribution:', error)
        throw error
    }
}

/**
 * Get all contributions for a specific ticket
 */
export const getContributionsByTicket = async (ticketId) => {
    try {
        const contributionsRef = collection(db, 'contributions')
        const snapshot = await getDocs(contributionsRef)
        const contributions = []
        
        snapshot.forEach((doc) => {
            const data = doc.data()
            // Compare as numbers since ticketId is stored as integer
            if (Number(data.ticketId) === Number(ticketId)) {
                contributions.push({ id: doc.id, ...data })
            }
        })
        
        return contributions
    } catch (error) {
        console.error('Error getting contributions:', error)
        throw error
    }
}

/**
 * Get user's contribution for a specific ticket
 * Since there's only one contribution per user per ticket, this returns that single contribution
 */
export const getUserContributionForTicket = async (ticketId, userId) => {
    try {
        const contributions = await getContributionsByTicket(ticketId)
        const userContribution = contributions.find(c => c.userId === userId)
        return {
            amount: userContribution?.amount || 0,
            contribution: userContribution || null
        }
    } catch (error) {
        console.error('Error getting user contribution:', error)
        throw error
    }
}

/**
 * Get all contributions made by a specific user across all tickets
 */
export const getUserContributions = async (userId) => {
    try {
        const contributionsRef = collection(db, 'contributions')
        const snapshot = await getDocs(contributionsRef)
        const userContributions = []
        
        snapshot.forEach((doc) => {
            const data = doc.data()
            if (data.userId === userId) {
                userContributions.push({ id: doc.id, ...data })
            }
        })
        
        return userContributions
    } catch (error) {
        console.error('Error getting user contributions:', error)
        throw error
    }
}

/**
 * Update ticket's amountAchieved by summing all contributions
 */
export const updateTicketAmountAchieved = async (ticketId) => {
    try {
        const contributions = await getContributionsByTicket(ticketId)
        const totalContributed = contributions.reduce((sum, contrib) => sum + (contrib.amount || 0), 0)
        
        // Get ticket to check amountRequested
        const ticket = await getTicketById(ticketId)
        
        // Determine new status
        let newStatus = ticket.status
        if (totalContributed >= ticket.amountRequested) {
            newStatus = 'closed'
        } else if (totalContributed > 0 && ticket.status === 'open') {
            newStatus = 'in-progress'
        }
        
        // Update ticket
        await updateDoc(doc(db, 'tickets', String(ticketId)), {
            amountAchieved: totalContributed,
            status: newStatus
        })
        
        return { amountAchieved: totalContributed, status: newStatus }
    } catch (error) {
        console.error('Error updating ticket amount achieved:', error)
        throw error
    }
}


// User Preferences Functions
export const getUserPreferences = async (userId) => {
    try {
        const prefsRef = doc(db, 'userPreferences', userId);
        const prefsSnap = await getDoc(prefsRef);
        
        if (prefsSnap.exists()) {
            return prefsSnap.data();
        } else {
            // Return default preferences if none exist
            return {
                theme: 'dark',
                pushNotifications: true,
                emailNotifications: true
            };
        }
    } catch (error) {
        console.error("Error getting user preferences: ", error);
        return {
            theme: 'dark',
            pushNotifications: true,
            emailNotifications: true
        };
    }
}

export const updateUserPreferences = async (userId, preferences) => {
    try {
        const prefsRef = doc(db, 'userPreferences', userId);
        const prefsSnap = await getDoc(prefsRef);
        
        if (prefsSnap.exists()) {
            // Update existing preferences
            await updateDoc(prefsRef, {
                ...preferences,
                lastUpdated: new Date().toISOString()
            });
        } else {
            // Create new preferences document
            await setDoc(prefsRef, {
                userId,
                ...preferences,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error updating user preferences: ", error);
        throw error;
    }
}

// Forum Posts Functions
/**
 * Get the next available post ID
 */
const getNextPostId = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'posts'))
        if (snapshot.empty) {
            return 1
        }
        
        const ids = snapshot.docs.map(doc => {
            const id = doc.id
            const numId = parseInt(id)
            return isNaN(numId) ? 0 : numId
        })
        
        const maxId = Math.max(...ids)
        return maxId + 1
    } catch (error) {
        console.error('Error getting next post ID:', error)
        return 1
    }
}

/**
 * Create a new forum post
 */
export const createPost = async (postData) => {
    try {
        const nextId = await getNextPostId()
        const postRef = doc(db, 'posts', String(nextId))
        
        const newPost = {
            ...postData,
            status: 'open',
            createdAt: new Date().toISOString()
        }
        
        await setDoc(postRef, newPost)
        
        return { id: nextId, ...newPost }
    } catch (error) {
        console.error('Error creating post:', error)
        throw error
    }
}

/**
 * Get all forum posts
 */
export const getAllPosts = async () => {
    try {
        const postsRef = collection(db, 'posts')
        const snapshot = await getDocs(postsRef)
        const posts = []
        
        snapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() })
        })
        
        // Sort by createdAt descending (newest first)
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        return posts
    } catch (error) {
        console.error('Error getting posts:', error)
        throw error
    }
}

/**
 * Get post by ID
 */
export const getPostById = async (postId) => {
    try {
        const postRef = doc(db, 'posts', String(postId))
        const postSnap = await getDoc(postRef)
        
        if (!postSnap.exists()) {
            throw new Error('Post not found')
        }
        
        return { id: postSnap.id, ...postSnap.data() }
    } catch (error) {
        console.error('Error getting post:', error)
        throw error
    }
}

/**
 * Update post status
 */
export const updatePostStatus = async (postId, status) => {
    try {
        const postRef = doc(db, 'posts', String(postId))
        await updateDoc(postRef, {
            status,
            updatedAt: new Date().toISOString()
        })
        
        return { success: true }
    } catch (error) {
        console.error('Error updating post status:', error)
        throw error
    }
}

/**
 * Update post content (title and/or content)
 */
export const updatePost = async (postId, updates) => {
    try {
        const postRef = doc(db, 'posts', String(postId))
        await updateDoc(postRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        })
        
        return { success: true }
    } catch (error) {
        console.error('Error updating post:', error)
        throw error
    }
}

// Forum Replies Functions
/**
 * Get the next available reply ID
 */
const getNextReplyId = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'replies'))
        if (snapshot.empty) {
            return 1
        }
        
        const ids = snapshot.docs.map(doc => {
            const id = doc.id
            const numId = parseInt(id)
            return isNaN(numId) ? 0 : numId
        })
        
        const maxId = Math.max(...ids)
        return maxId + 1
    } catch (error) {
        console.error('Error getting next reply ID:', error)
        return 1
    }
}

/**
 * Create a new reply
 */
export const createReply = async (replyData) => {
    try {
        const nextId = await getNextReplyId()
        const replyRef = doc(db, 'replies', String(nextId))
        
        const newReply = {
            ...replyData,
            createdAt: new Date().toISOString()
        }
        
        await setDoc(replyRef, newReply)
        
        // Update post status if needed
        await updatePostStatusOnReply(replyData.postId, replyData.authorId)
        
        return { id: nextId, ...newReply }
    } catch (error) {
        console.error('Error creating reply:', error)
        throw error
    }
}

/**
 * Get all replies for a post
 */
export const getRepliesByPost = async (postId) => {
    try {
        const repliesRef = collection(db, 'replies')
        const snapshot = await getDocs(repliesRef)
        const replies = []
        
        snapshot.forEach((doc) => {
            const data = doc.data()
            if (Number(data.postId) === Number(postId)) {
                replies.push({ id: doc.id, ...data })
            }
        })
        
        // Sort by createdAt ascending (oldest first)
        replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        
        return replies
    } catch (error) {
        console.error('Error getting replies:', error)
        throw error
    }
}

/**
 * Get all replies
 */
export const getAllReplies = async () => {
    try {
        const repliesRef = collection(db, 'replies')
        const snapshot = await getDocs(repliesRef)
        const replies = []
        
        snapshot.forEach((doc) => {
            replies.push({ id: doc.id, ...doc.data() })
        })
        
        return replies
    } catch (error) {
        console.error('Error getting all replies:', error)
        throw error
    }
}

/**
 * Update post status when a reply is added
 * Post moves to in-progress when another user replies
 */
const updatePostStatusOnReply = async (postId, replyAuthorId) => {
    try {
        const post = await getPostById(postId)
        
        // If post is open and reply is from a different user, move to in-progress
        if (post.status === 'open' && post.authorId !== replyAuthorId) {
            await updatePostStatus(postId, 'in-progress')
        }
    } catch (error) {
        console.error('Error updating post status on reply:', error)
    }
}

/**
 * Get posts by user ID (posts created by user)
 */
export const getPostsByUser = async (userId) => {
    try {
        const postsRef = collection(db, 'posts')
        const snapshot = await getDocs(postsRef)
        const userPosts = []
        
        snapshot.forEach((doc) => {
            const data = doc.data()
            if (data.authorId === userId) {
                userPosts.push({ id: doc.id, ...data })
            }
        })
        
        userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        return userPosts
    } catch (error) {
        console.error('Error getting user posts:', error)
        throw error
    }
}

/**
 * Get posts where user has participated (replied to)
 */
export const getPostsUserParticipatedIn = async (userId) => {
    try {
        // Get all replies by user
        const repliesRef = collection(db, 'replies')
        const snapshot = await getDocs(repliesRef)
        const postIds = new Set()
        
        snapshot.forEach((doc) => {
            const data = doc.data()
            if (data.authorId === userId) {
                postIds.add(String(data.postId))
            }
        })
        
        // Get posts for these IDs
        const posts = []
        for (const postId of postIds) {
            try {
                const post = await getPostById(postId)
                posts.push(post)
            } catch (error) {
                console.error(`Error getting post ${postId}:`, error)
            }
        }
        
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        return posts
    } catch (error) {
        console.error('Error getting participated posts:', error)
        throw error
    }
}
