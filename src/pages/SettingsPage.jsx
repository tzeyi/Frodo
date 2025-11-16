import { useState, useEffect } from 'react'
import SideBar from '../components/SideBar'
import { auth } from '../firebase'
import { getUserData, signOut } from '../services/authService'
import { getAllOrganizations, getAllLocations } from '../services/seedFirestore'
import { getUserPreferences, updateUserPreferences } from '../services/resourceService'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'


function SettingsPage() {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editingAccount, setEditingAccount] = useState(false)
    const [editingLocation, setEditingLocation] = useState(false)
    const [accountForm, setAccountForm] = useState({
        name: '',
        organization: '',
        role: ''
    })
    const [selectedLocationId, setSelectedLocationId] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [organizations, setOrganizations] = useState([])
    const [availableLocations, setAvailableLocations] = useState([])
    const [selectedNewLocationId, setSelectedNewLocationId] = useState('')
    const [preferences, setPreferences] = useState({
        theme: 'dark',
        // pushNotifications: true,
        // emailNotifications: true
    })

    // Fetch organizations and locations from Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orgs, locs] = await Promise.all([
                    getAllOrganizations(),
                    getAllLocations()
                ])
                setOrganizations(orgs)
                setAvailableLocations(locs)
            } catch (err) {
                console.error('Error fetching data:', err)
                // Fallback to default list if Firestore fetch fails
                setOrganizations([
                    { id: 'default_1', name: 'Red Cross' },
                    { id: 'default_2', name: 'Doctors Without Borders' },
                    { id: 'default_3', name: 'United Way' },
                    { id: 'default_4', name: 'Salvation Army' },
                    { id: 'default_5', name: 'Habitat for Humanity' },
                    { id: 'default_6', name: 'World Vision' },
                    { id: 'default_7', name: 'Independent' }
                ])
            }
        }
        
        fetchData()
    }, [])

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser
                if (!user) {
                    window.location.href = '/login'
                    return
                }
                
                const [data, prefs] = await Promise.all([
                    getUserData(user.uid),
                    getUserPreferences(user.uid)
                ])
                
                if (data) {
                    setUserData(data)
                    setAccountForm({
                        name: data.name || '',
                        organization: data.organization || '',
                        role: data.role || ''
                    })
                    
                    // Initialize location selection if locations exist
                    if (data.locations && data.locations.length > 0) {
                        setSelectedLocationId(data.locations[0].locationId || data.locations[0].id)
                    }
                }
                
                // Set user preferences and apply theme
                setPreferences(prefs)
                // Apply theme and broadcast to other pages
                const resolvedTheme = resolveTheme(prefs.theme)
                applyAndBroadcastTheme(resolvedTheme)
            } catch (err) {
                console.error('Error fetching user data:', err)
                setError('Failed to load user data')
            } finally {
                setLoading(false)
            }
        }
        
        fetchUserData()
    }, [])

    const getUserLocationDetails = (locationId) => {
        return availableLocations.find(loc => loc.id === locationId)
    }

    // Resolve 'auto' theme to actual theme based on system preference
    const resolveTheme = (theme) => {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            return prefersDark ? 'dark' : 'light'
        }
        return theme
    }

    // Apply theme locally and broadcast to all pages
    const applyAndBroadcastTheme = (theme) => {
        // Broadcast to App.jsx and other listeners
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }))
    }

    const applyTheme = (theme) => {
        const resolvedTheme = resolveTheme(theme)
        const html = document.documentElement
        html.setAttribute('data-theme', resolvedTheme)
    }

    const handleThemeChange = async (newTheme) => {
        try {
            const user = auth.currentUser
            if (!user) throw new Error('No authenticated user')
            
            // Update preferences in state
            const updatedPrefs = { ...preferences, theme: newTheme }
            setPreferences(updatedPrefs)
            
            // Apply theme locally and broadcast to other pages
            const resolvedTheme = resolveTheme(newTheme)
            applyTheme(newTheme)
            applyAndBroadcastTheme(resolvedTheme)
            
            // Save to Firestore
            await updateUserPreferences(user.uid, { theme: newTheme })
            
            setMessage('Theme updated successfully')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            console.error('Error updating theme:', err)
            setError('Failed to update theme')
            setTimeout(() => setError(''), 3000)
        }
    }

    // const handleNotificationToggle = async (notificationType, value) => {
    //     try {
    //         const user = auth.currentUser
    //         if (!user) throw new Error('No authenticated user')
            
    //         // Update preferences in state
    //         const updatedPrefs = { ...preferences, [notificationType]: value }
    //         setPreferences(updatedPrefs)
            
    //         // Save to Firestore
    //         await updateUserPreferences(user.uid, { [notificationType]: value })
            
    //         setMessage('Notification preferences updated')
    //         setTimeout(() => setMessage(''), 3000)
    //     } catch (err) {
    //         console.error('Error updating notifications:', err)
    //         setError('Failed to update notification settings')
    //         setTimeout(() => setError(''), 3000)
    //     }
    // }

    const currentLocation = userData?.locations?.find(loc => 
        (loc.locationId || loc.id) === selectedLocationId
    )
    const currentLocationDetails = currentLocation ? getUserLocationDetails(currentLocation.locationId || currentLocation.id) : null

    const handleAccountSave = async () => {
        setLoading(true)
        setError('')
        
        try {
            const user = auth.currentUser
            if (!user) throw new Error('No authenticated user')
            
            // Update Firestore
            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
                name: accountForm.name,
                organization: accountForm.organization,
                role: accountForm.role,
                lastUpdated: new Date().toISOString()
            })
            
            // Update local state
            setUserData({
                ...userData,
                name: accountForm.name,
                organization: accountForm.organization,
                role: accountForm.role
            })
            
            setEditingAccount(false)
            setMessage('Account settings saved successfully')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            console.error('Error saving account:', err)
            setError('Failed to save account settings')
            setTimeout(() => setError(''), 5000)
        } finally {
            setLoading(false)
        }
    }

    const handleLocationSave = async () => {
        setLoading(true)
        setError('')
        
        try {
            const user = auth.currentUser
            if (!user) throw new Error('No authenticated user')
            
            // Check if this location is already in user's locations
            const locationExists = userData.locations?.some(loc => 
                (loc.locationId || loc.id) === selectedNewLocationId
            )
            
            if (locationExists) {
                setError('This location is already in your list')
                setTimeout(() => setError(''), 3000)
                setLoading(false)
                return
            }
            
            const newLocation = {
                locationId: selectedNewLocationId,
                addedAt: new Date().toISOString()
            }
            
            const updatedLocations = [...(userData.locations || []), newLocation]
            
            // Update Firestore
            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
                locations: updatedLocations,
                lastUpdated: new Date().toISOString()
            })
            
            // Update local state
            setUserData({
                ...userData,
                locations: updatedLocations
            })
            
            setSelectedLocationId(selectedNewLocationId)
            setSelectedNewLocationId('')
            setEditingLocation(false)
            setMessage('Location added successfully')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            console.error('Error saving location:', err)
            setError('Failed to save location')
            setTimeout(() => setError(''), 5000)
        } finally {
            setLoading(false)
        }
    }

    const handleAddLocation = async () => {
        setEditingLocation(true)
        setSelectedNewLocationId('')
    }

    const handleDeleteLocation = async (locationId) => {
        if (!confirm('Are you sure you want to delete this location?')) return
        
        setLoading(true)
        setError('')
        
        try {
            const user = auth.currentUser
            if (!user) throw new Error('No authenticated user')
            
            const updatedLocations = (userData.locations || []).filter(loc => 
                (loc.locationId || loc.id) !== locationId
            )
            
            // Update Firestore
            const userRef = doc(db, 'users', user.uid)
            await updateDoc(userRef, {
                locations: updatedLocations,
                lastUpdated: new Date().toISOString()
            })
            
            // Update local state
            setUserData({
                ...userData,
                locations: updatedLocations
            })
            
            // Reset location selection
            if (updatedLocations.length > 0) {
                setSelectedLocationId(updatedLocations[0].locationId || updatedLocations[0].id)
            } else {
                setSelectedLocationId(null)
            }
            
            setMessage('Location deleted')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            console.error('Error deleting location:', err)
            setError('Failed to delete location')
            setTimeout(() => setError(''), 5000)
        } finally {
            setLoading(false)
        }
    }

    const handleLocationChange = (locationId) => {
        setSelectedLocationId(locationId)
    }

    const handleSignOut = async () => {
        if (!confirm('Are you sure you want to sign out?')) return
        
        try {
            setMessage('Signing out...')
            await signOut()
            window.location.href = '/login'
        } catch (err) {
            console.error('Error signing out:', err)
            setError('Failed to sign out')
            setTimeout(() => setError(''), 3000)
        }
    }

    // Loading state
    if (loading && !userData) {
        return (
            <SideBar pageContent={
                <div className="flex items-center justify-center min-h-screen">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            } />
        )
    }

    // Error state
    if (!userData) {
        return (
            <SideBar pageContent={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="alert alert-error">
                        <span>Failed to load user data. Please try refreshing the page.</span>
                    </div>
                </div>
            } />
        )
    }

    const pageContent = (
        <>
        {/* Header */}
        <h1 className="p-5 text-3xl font-bold text-primary">Settings</h1>
        
        {/* Success Message */}
        {message && (
            <div className="px-5">
                <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{message}</span>
                </div>
            </div>
        )}
        
        {/* Error Message */}
        {error && (
            <div className="px-5">
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        )}

        {/* Account Settings Section */}
        <section className="p-5">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Account Settings</h2>
                    
                    {!editingAccount ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Name</span>
                                    </label>
                                    <p className="text-lg">{userData.name}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Email</span>
                                    </label>
                                    <p className="text-lg">{userData.email}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Organization</span>
                                    </label>
                                    <p className="text-lg">{userData.organization || 'Not set'}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Role</span>
                                    </label>
                                    <p className="text-lg">{userData.role}</p>
                                </div>
                            </div>
                            
                            <div className="card-actions justify-end mt-4">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setEditingAccount(true)}
                                >
                                    Edit Account
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Name</span>
                                    </label>
                                    <input 
                                        type="text"
                                        className="input input-bordered"
                                        value={accountForm.name}
                                        onChange={(e) => setAccountForm({...accountForm, name: e.target.value})}
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Organization</span>
                                    </label>
                                    <select 
                                        className="select select-bordered"
                                        value={accountForm.organization}
                                        onChange={(e) => setAccountForm({...accountForm, organization: e.target.value})}
                                    >
                                        <option value="">Select organization...</option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.name}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Role</span>
                                    </label>
                                    <input 
                                        type="text"
                                        className="input input-bordered"
                                        value={accountForm.role}
                                        onChange={(e) => setAccountForm({...accountForm, role: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="card-actions justify-end mt-4 gap-2">
                                <button 
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setEditingAccount(false)
                                        setAccountForm({
                                            name: userData.name,
                                            organization: userData.organization,
                                            role: userData.role
                                        })
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleAccountSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>

        {/* Location Settings Section */}
        <section className="p-5">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="card-title text-xl">Location Settings</h2>
                        {userData.locations && userData.locations.length > 0 && (
                            <button 
                                className="btn btn-sm btn-primary btn-outline"
                                onClick={handleAddLocation}
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Location
                            </button>
                        )}
                    </div>
                    
                    {!userData.locations || userData.locations.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-base-content/60 mb-4">No locations added yet</p>
                            <button 
                                className="btn btn-primary"
                                onClick={handleAddLocation}
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First Location
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Location Selector */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">Select Location</span>
                                </label>
                                <div className="flex gap-2">
                                    <select 
                                        className="select select-bordered flex-1"
                                        value={selectedLocationId}
                                        onChange={(e) => handleLocationChange(e.target.value)}
                                    >
                                        {userData.locations.map((location) => {
                                            const details = getUserLocationDetails(location.locationId || location.id)
                                            return (
                                                <option key={location.locationId || location.id} value={location.locationId || location.id}>
                                                    {details?.name || 'Unknown Location'}
                                                </option>
                                            )
                                        })}
                                    </select>
                                    {userData.locations.length > 1 && (
                                        <button
                                            className="btn btn-error btn-outline"
                                            onClick={() => handleDeleteLocation(selectedLocationId)}
                                            disabled={loading}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {!editingLocation ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text font-semibold">Location Name</span>
                                            </label>
                                            <p className="text-lg">{currentLocationDetails?.name || 'Unknown'}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="label">
                                                <span className="label-text font-semibold">Latitude</span>
                                            </label>
                                            <p className="text-lg">{currentLocationDetails?.lat || 'N/A'}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="label">
                                                <span className="label-text font-semibold">Longitude</span>
                                            </label>
                                            <p className="text-lg">{currentLocationDetails?.lon || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="card-actions justify-end mt-4">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => setEditingLocation(true)}
                                        >
                                            Edit Location
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold">Select a Location to Add</span>
                                        </label>
                                        <select 
                                            className="select select-bordered"
                                            value={selectedNewLocationId}
                                            onChange={(e) => setSelectedNewLocationId(e.target.value)}
                                        >
                                            <option value="">Choose from available locations...</option>
                                            {availableLocations
                                                .filter(loc => !userData.locations?.some(userLoc => 
                                                    (userLoc.locationId || userLoc.id) === loc.id
                                                ))
                                                .map((location) => (
                                                    <option key={location.id} value={location.id}>
                                                        {location.name} ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    
                                    <div className="card-actions justify-end mt-4 gap-2">
                                        <button 
                                            className="btn btn-ghost"
                                            onClick={() => {
                                                setEditingLocation(false)
                                                setSelectedNewLocationId('')
                                            }}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={handleLocationSave}
                                            disabled={loading || !selectedNewLocationId}
                                        >
                                            {loading ? 'Adding...' : 'Add Location'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>

        {/* App Preferences Section */}
        <section className="p-5">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">App Preferences</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Theme</span>
                            </label>
                            <div className="join">
                                <button 
                                    className={`btn btn-sm join-item ${preferences.theme === 'light' ? 'btn-active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    Light
                                </button>
                                <button 
                                    className={`btn btn-sm join-item ${preferences.theme === 'dark' ? 'btn-active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    Dark
                                </button>
                                <button 
                                    className={`btn btn-sm join-item ${preferences.theme === 'auto' ? 'btn-active' : ''}`}
                                    onClick={() => handleThemeChange('auto')}
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
{/*                         
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Notifications</span>
                            </label>
                            <div className="form-control">
                                <label className="cursor-pointer label justify-start gap-3">
                                    <input 
                                        type="checkbox" 
                                        className="toggle toggle-primary" 
                                        checked={preferences.pushNotifications}
                                        onChange={(e) => handleNotificationToggle('pushNotifications', e.target.checked)}
                                    />
                                    <span className="label-text">Push notifications</span>
                                </label>
                                <label className="cursor-pointer label justify-start gap-3">
                                    <input 
                                        type="checkbox" 
                                        className="toggle toggle-primary" 
                                        checked={preferences.emailNotifications}
                                        onChange={(e) => handleNotificationToggle('emailNotifications', e.target.checked)}
                                    />
                                    <span className="label-text">Email notifications</span>
                                </label>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </section>

        {/* Account Actions Section */}
        <section className="p-5">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Account Actions</h2>
                    
                    <div className="flex flex-col gap-4">
                        <div className="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Signing out will end your current session and require you to log in again.</span>
                        </div>
                        
                        <div className="card-actions justify-start">
                            <button 
                                className="btn btn-error btn-outline"
                                onClick={handleSignOut}
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {loading ? 'Signing out...' : 'Sign Out'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </>
    )
    return <SideBar pageContent={pageContent} />
}


export default SettingsPage