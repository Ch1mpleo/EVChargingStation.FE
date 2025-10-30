import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../station/auth/slice'
import sessionsReducer from '../station/sessions/slice'
import invoicesReducer from '../station/invoices/slice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        sessions: sessionsReducer,
        invoices: invoicesReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


