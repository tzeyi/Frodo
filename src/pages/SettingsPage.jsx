import { useState } from 'react'
import data from '../assets/data.json'
import SideBar from '../components/SideBar'


function SettingsPage() {
    const [selectedAccount, setSelectedAccount] = useState(data.accounts[0])
    const [editingAccount, setEditingAccount] = useState(false)
    const [editingLocation, setEditingLocation] = useState(false)
    const [accountForm, setAccountForm] = useState({
        name: selectedAccount.name,
        organization: selectedAccount.organization,
        role: selectedAccount.role
    })
    const [selectedLocationId, setSelectedLocationId] = useState(selectedAccount.locations[0]?.id || 1)
    const [locationForm, setLocationForm] = useState({
        name: selectedAccount.locations[0]?.name || '',
        lat: selectedAccount.locations[0]?.lat || '',
        lon: selectedAccount.locations[0]?.lon || ''
    })
    const [message, setMessage] = useState('')

    const availableOrganizations = [...new Set(data.accounts.map(acc => acc.organization))]
    const currentLocation = selectedAccount.locations.find(loc => loc.id === selectedLocationId) || selectedAccount.locations[0]

    const handleAccountSave = () => {
        setSelectedAccount({
            ...selectedAccount,
            name: accountForm.name,
            organization: accountForm.organization,
            role: accountForm.role
        })
        setEditingAccount(false)
        setMessage('Account settings saved')
        setTimeout(() => setMessage(''), 3000)
    }

    const handleLocationSave = () => {
        const updatedLocations = selectedAccount.locations.map(loc => 
            loc.id === selectedLocationId 
                ? { ...loc, name: locationForm.name, lat: parseFloat(locationForm.lat), lon: parseFloat(locationForm.lon) }
                : loc
        )
        setSelectedAccount({
            ...selectedAccount,
            locations: updatedLocations
        })
        setEditingLocation(false)
        setMessage('Location settings saved')
        setTimeout(() => setMessage(''), 3000)
    }

    const handleLocationChange = (locationId) => {
        const location = selectedAccount.locations.find(loc => loc.id === locationId)
        setSelectedLocationId(locationId)
        setLocationForm({
            name: location.name,
            lat: location.lat,
            lon: location.lon
        })
    }

    const handleOrganizationChange = (org) => {
        setAccountForm({
            ...accountForm,
            organization: org
        })
    }

    const pageContent = (
        <>
        {/* Header */}
        <h1 className="p-5 text-3xl font-bold text-primary">Settings</h1>
        
        {/* Success Message */}
        {message && (
            <div className="px-5">
                <div className="alert alert-success">
                    <span>{message}</span>
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
                                    <p className="text-lg">{selectedAccount.name}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Organization</span>
                                    </label>
                                    <p className="text-lg">{selectedAccount.organization}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Role</span>
                                    </label>
                                    <p className="text-lg">{selectedAccount.role}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Account ID</span>
                                    </label>
                                    <p className="text-lg">#{selectedAccount.id}</p>
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
                                        onChange={(e) => handleOrganizationChange(e.target.value)}
                                    >
                                        {availableOrganizations.map((org, index) => (
                                            <option key={index} value={org}>{org}</option>
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
                                            name: selectedAccount.name,
                                            organization: selectedAccount.organization,
                                            role: selectedAccount.role
                                        })
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleAccountSave}
                                >
                                    Save Changes
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
                    <h2 className="card-title text-xl mb-4">Location Settings</h2>
                    
                    {/* Location Selector */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-semibold">Select Location</span>
                        </label>
                        <select 
                            className="select select-bordered"
                            value={selectedLocationId}
                            onChange={(e) => handleLocationChange(parseInt(e.target.value))}
                        >
                            {selectedAccount.locations.map((location) => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {!editingLocation ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Location Name</span>
                                    </label>
                                    <p className="text-lg">{currentLocation?.name}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Latitude</span>
                                    </label>
                                    <p className="text-lg">{currentLocation?.lat}</p>
                                </div>
                                
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Longitude</span>
                                    </label>
                                    <p className="text-lg">{currentLocation?.lon}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Location Name</span>
                                    </label>
                                    <input 
                                        type="text"
                                        className="input input-bordered"
                                        value={locationForm.name}
                                        onChange={(e) => setLocationForm({...locationForm, name: e.target.value})}
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Latitude</span>
                                    </label>
                                    <input 
                                        type="number"
                                        step="any"
                                        className="input input-bordered"
                                        value={locationForm.lat}
                                        onChange={(e) => setLocationForm({...locationForm, lat: e.target.value})}
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Longitude</span>
                                    </label>
                                    <input 
                                        type="number"
                                        step="any"
                                        className="input input-bordered"
                                        value={locationForm.lon}
                                        onChange={(e) => setLocationForm({...locationForm, lon: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="card-actions justify-end mt-4 gap-2">
                                <button 
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setEditingLocation(false)
                                        setLocationForm({
                                            name: currentLocation.name,
                                            lat: currentLocation.lat,
                                            lon: currentLocation.lon
                                        })
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleLocationSave}
                                >
                                    Save Changes
                                </button>
                            </div>
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
                                <button className="btn btn-sm join-item">Light</button>
                                <button className="btn btn-sm btn-active join-item">Dark</button>
                                <button className="btn btn-sm join-item">Auto</button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="label">
                                <span className="label-text font-semibold">Notifications</span>
                            </label>
                            <div className="form-control">
                                <label className="cursor-pointer label justify-start gap-3">
                                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                                    <span className="label-text">Push notifications</span>
                                </label>
                                <label className="cursor-pointer label justify-start gap-3">
                                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                                    <span className="label-text">Email notifications</span>
                                </label>
                            </div>
                        </div>
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
                                onClick={() => {
                                    if (confirm('Are you sure you want to sign out?')) {
                                        setMessage('Signing out...')
                                        setTimeout(() => {
                                            // In a real app, this would handle authentication logout
                                            window.location.href = '/login'
                                        }, 1500)
                                    }
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
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