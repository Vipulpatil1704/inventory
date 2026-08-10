import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'inventory_auth'

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saved = loadAuth()

const initialState = {
  user: saved?.user || null,
  accessToken: saved?.accessToken || null,
  refreshToken: saved?.refreshToken || null,
}

function persist(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
    })
  )
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      persist(state)
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken)
export default authSlice.reducer
