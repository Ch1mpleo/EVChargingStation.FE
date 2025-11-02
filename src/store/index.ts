import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../station/auth/slice'
import stationsReducer from '../station/stations/slice'
import reservationsReducer from '../station/reservations/slice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        stations: stationsReducer,
        reservations: reservationsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


