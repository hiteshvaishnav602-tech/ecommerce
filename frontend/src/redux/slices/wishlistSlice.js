import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/wishlist')
    return data.wishlist
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/wishlist/toggle/${productId}`)
    if (data.isInWishlist) toast.success('Added to wishlist ❤️')
    else toast.success('Removed from wishlist')
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const clearWishlist = createAsyncThunk('wishlist/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/wishlist')
    toast.success('Wishlist cleared')
    return null
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlist: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetWishlist: (state) => { state.wishlist = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false; state.wishlist = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        // optimistic update handled by re-fetch
      })
      .addCase(clearWishlist.fulfilled, (state) => { state.wishlist = null })
  },
})

export const { resetWishlist } = wishlistSlice.actions

export const selectWishlistProductIds = (state) =>
  (state.wishlist.wishlist?.products || []).map((p) => (typeof p === 'object' ? p._id : p))

export default wishlistSlice.reducer
