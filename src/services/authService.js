import React, { useState } from 'react'
import { auth } from '../firebase'
import { GoogleAuthProvider, signInWithRedirect, signInWithPopup } from 'firebase/auth'
import { useNavigate } from "react-router-dom";


export const handleGoogleSignIn = async (navigate) => {
    try {
        const provider = new GoogleAuthProvider()
        // const result = await signInWithRedirect(auth, provider)
        const result = await signInWithPopup(auth, provider)
        const user = result.user

        // Check if user exists in localStorage (returning user)
        const existingUser = localStorage.getItem('frodo_user')
        console.log(existingUser)
        const isFirstTime = !existingUser

        // Persist user data locally
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            hasCompletedOnboarding: !isFirstTime
        }

        localStorage.setItem('frodo_user', JSON.stringify(userData))

        // Navigate based on first-time status
        if (isFirstTime) {
            navigate('/onboarding')
        } else {
            navigate('/')
        }
    } catch (err) {
        console.log("handleGoogleSignIn Fail", err)
    }
        // catch (err) {
		// 	console.error('Google sign-in error', err)
		// 	setError(err.message || 'Sign-in failed')
		// } finally {
		// 	setLoading(false)
		// }
	}
    