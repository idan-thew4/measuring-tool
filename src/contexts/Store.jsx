import React, { createContext, useContext } from 'react'


const ApiContext = createContext([])

function useStore() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useStore should be used within ApiContext only');
    }
    return context;
}
