import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

// Load from localStorage
const userFromStorage = localStorage.getItem('bewakoof_user')
  ? JSON.parse(localStorage.getItem('bewakoof_user'))
  : null

const tokenFromStorage = localStorage.getItem('bewakoof_token') || null

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData)
    localStorage.setItem('bewakoof_token', data.token)
    localStorage.setItem('bewakoof_user', JSON.stringify(data.user))
    toast.success(data.message || 'Registered successfully!')
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Registration failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('bewakoof_token', data.token)
    localStorage.setItem('bewakoof_user', JSON.stringify(data.user))
    toast.success(data.message || 'Logged in successfully!')
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const googleLogin = createAsyncThunk('auth/googleLogin', async (accessToken, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google-login', { accessToken })
    localStorage.setItem('bewakoof_token', data.token)
    localStorage.setItem('bewakoof_user', JSON.stringify(data.user))
    toast.success(data.message || 'Logged in successfully with Google!')
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Google login failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout')
  } catch (_) { }
  localStorage.removeItem('bewakoof_token')
  localStorage.removeItem('bewakoof_user')
  toast.success('Logged out successfully')
})

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to get profile')
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/profile', profileData)
    localStorage.setItem('bewakoof_user', JSON.stringify(data.user))
    toast.success('Profile updated!')
    return data.user
  } catch (err) {
    const msg = err.response?.data?.message || 'Update failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const changePassword = createAsyncThunk('auth/changePassword', async (passwords, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/auth/change-password', passwords)
    toast.success('Password changed!')
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Password change failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email })
    toast.success(data.message)
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const addAddress = createAsyncThunk('auth/addAddress', async (address, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/addresses', address)
    toast.success('Address added!')
    return data.addresses
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to add address'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ id, address }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/auth/addresses/${id}`, address)
    toast.success('Address updated!')
    return data.addresses
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/auth/addresses/${id}`)
    toast.success('Address deleted')
    return data.addresses
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    loading: false,
    error: null,
    profileLoading: false,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    setUser: (state, action) => {
      state.user = action.payload
      localStorage.setItem('bewakoof_user', JSON.stringify(action.payload))
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
    })
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // Login
    builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // Google Login
    builder.addCase(googleLogin.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(googleLogin.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
    })
    builder.addCase(googleLogin.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.token = null
    })

    // Get Profile
    builder.addCase(getProfile.pending, (state) => { state.profileLoading = true })
    builder.addCase(getProfile.fulfilled, (state, action) => {
      state.profileLoading = false
      state.user = action.payload
    })
    builder.addCase(getProfile.rejected, (state) => { state.profileLoading = false })

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload })

    // Addresses
    builder.addCase(addAddress.fulfilled, (state, action) => {
      if (state.user) state.user.addresses = action.payload
    })
    builder.addCase(updateAddress.fulfilled, (state, action) => {
      if (state.user) state.user.addresses = action.payload
    })
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      if (state.user) state.user.addresses = action.payload
    })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
