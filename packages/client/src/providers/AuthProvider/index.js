import React, { useState, useEffect, useContext, createContext } from 'react';

import { Auth,Db } from '../FirebaseProvider';
import { getUser, createMentorWithEmail, createParentWithEmail, getUserDetailByEmail, getRequests, acceptStudentRequest, updateSessionHours, updateRatingss } from '../../api';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export const AUTH_STATES  = {
    LOGGED_OUT: 'LOGGED_OUT',
    LOGGED_IN:  'LOGGED_IN',
    UNINITIALIZED: 'UNINITIALIZED',
    CREATING_USER: 'CREATING_USER',
};

const authContext = createContext(null);

/**
 * AuthProvider class to inject the UserContext into child components
 */
const AuthProvider = ({ children, fallback }) => {
    const auth = useAuthProvider();

    // this renders the fallback component until firebase has initialized
    return (
        <authContext.Provider value={auth}>
            <authContext.Consumer>
               { value => value.auth !== AUTH_STATES.UNINITIALIZED ? children : fallback }
            </authContext.Consumer>
        </authContext.Provider>
    )
}

const useAuth = () => {
    return useContext(authContext);
}



const useAuthProvider = () => {
    const [authState, setAuthState] = useState(AUTH_STATES.UNINITIALIZED);
    const [auth, setAuth] = useState(null);
    const [user, setUser] = useState(null);
    const [request, setRequest] = useState(null);
    const [requestOther, setRequestOther] = useState(null);
    /**
     * Signs a user in. This triggers pulling the correct user information.
     * @param {string} email
     * @param {string} password
     *
     * @return {Promise<firebase.auth.UserCredential>} the user credentials
     */
    const signin = (email, password) => {
        setAuthState(AUTH_STATES.LOGGED_IN);
        return Auth.signInWithEmailAndPassword(email, password).catch(() => {
            setAuthState(AUTH_STATES.LOGGED_OUT);
        });
    };

    const signup = async (email, password, user) => {
        if (user.role !== 'MENTOR' && user.role !== 'PARENT') {
            throw Error(`Role invariant broken, unexpected role type: ${user.role}`)
        }
        setAuthState(AUTH_STATES.CREATING_USER);
        if (user.role === 'MENTOR') {
            await createMentorWithEmail(email, password, user);
        } else {
            await createParentWithEmail(email, password, user);
        }
        setAuthState(AUTH_STATES.LOGGED_IN);
    }

    /**
     * Signs the current user out.
     */
    const signout = () => {
        Auth.signOut()
            .then(() => {
                setUser(null);
                setAuthState(AUTH_STATES.LOGGED_OUT);
            });
    };

    /**
     * Gets the current user if possible
     *
     * @return {Promise<Mentor|Parent>} the current logged in user
     */
    const getCurrentUser = async () => {
        if (authState !== AUTH_STATES.LOGGED_IN) {
            return Promise.reject('No user currently logged in.');
        }
        // Query for the user if not cached.
        if (user) {
            return Promise.resolve(user);
        }
        return getUser();

    };
    const getUserDataByEmail = async (email) => {
        await getUserDetailByEmail(email);
    }
   
    const getRequestList = async() => {
        await getRequests(["Pending"])
        .then((request) => setRequest(request))
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
            setRequest(null);
        });
    }

    const getRequestListOther = async() => {
        await getRequests(["Pending"])
        .then((request) => setRequestOther(request))
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
            setRequestOther(null);
        });
    }

    const acceptRequest = async (messageID, status, studentName) => {
        console.log('await',messageID)
        await acceptStudentRequest(messageID, status, studentName)
        .then(() => {
            console.log('request Accepted'); 
            var a = getRequests(["Pending"])
            .then((request) => setRequest(request))
            .catch((err) => {
                console.log(`Error fetching Request: ${err}`);
                setRequest(null);
            });
            alert("Request accepted successfully.");
        })
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
        });
    }

    const archiveRequest = async (messageID, status, studentName) => {
        console.log('await',messageID)
        await acceptStudentRequest(messageID, status, studentName)
        .then(() => {console.log('request Archived'); 
        var a = getRequests(["Pending"])
        .then((request) => setRequest(request))
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
            setRequest(null);
        });
        alert("Request archived successfully.");})
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
        });
    }

    const rejectRequest = async (messageID, status, studentName) => {
        console.log('await',messageID)
        await acceptStudentRequest(messageID, status, studentName)
        .then(() => {console.log('request Rejected'); 
        var a = getRequests(["Pending"])
        .then((request) => setRequest(request))
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
            setRequest(null);
        });
        alert("Request rejected successfully.");})
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
        });
    }

    const updateSessionHoursss = async (messageID, hours, studentName) => {
        await updateSessionHours(messageID, hours, studentName)
        .then(() => {console.log('session hours updated'); 
        var a = getRequests(["Pending"])
        .then((request) => setRequest(request))
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
            setRequest(null);
        });
        alert("Session hours was updated successfully.");})
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
        });
    }

    const updateRatings = async (messageID, ratings, studentName) => {
        await updateRatingss(messageID, ratings, studentName)
        .then(() => {console.log('ratings updated'); 
        var a = getRequests(["Pending"])
        .then((request) => setRequest(request))
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
            setRequest(null);
        });
        alert("Ratings was added successfully.");})
        .catch((err) => {
            console.log(`Error fetching Request: ${err}`);
        });
    }


    // TODO this may have to be done synchronously
    // Register firebase state handler
    // Note that this only gets called once on mount
    useEffect(() => {
        const unsubscribe = Auth.onAuthStateChanged( async (auth) => {
            if (authState === AUTH_STATES.CREATING_USER) {
                // Avoids race-condition between firebase and firestore user creation.
                return;
            }
            if (auth != null) {
                setAuth(auth);
                setAuthState(AUTH_STATES.LOGGED_IN);
            } else {
                setAuthState(AUTH_STATES.LOGGED_OUT);
            }
        });
        return () => unsubscribe();
    }, [authState]);

    // Attempt to fetch the user on update
    useEffect(() => {
        if (authState !== AUTH_STATES.LOGGED_IN) return;

        getCurrentUser()
            .then((user) => setUser(user))
            .catch((err) => {
                console.log(`Error fetching user: ${err}`);
                setUser(null);
            });
            getRequestList();
            getRequestListOther();
    }, [authState, auth]);

    return {
        auth,
        authState,
        user,
        getUserDataByEmail,
        signin,
        signup,
        signout,
        request,
        requestOther,
        getRequestList,
        acceptRequest,
        rejectRequest,
        archiveRequest,
        updateRatings,
        updateSessionHoursss,
        getRequestListOther
    };
}

export { useAuth as default, AuthProvider };
