import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../station/auth/slice'
import plansReducer from '../station/plans/slice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        plans: plansReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


