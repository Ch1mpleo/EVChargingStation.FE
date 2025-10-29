import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../station/auth/slice'
import locationsReducer from '../station/locations/slice'
import stationsReducer from '../station/stations/slice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        locations: locationsReducer,
        stations: stationsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


