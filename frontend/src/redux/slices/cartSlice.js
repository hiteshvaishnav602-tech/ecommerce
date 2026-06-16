import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart')
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const addToCart = createAsyncThunk('cart/add', async (item, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart', item)
    toast.success('Added to cart! 🛒')
    return data.cart
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to add to cart'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/${itemId}`, { quantity })
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/${itemId}`)
    toast.success('Item removed')
    return data.cart
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart')
    return null
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const applyCoupon = createAsyncThunk('cart/applyCoupon', async (code, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/coupon', { code })
    toast.success(data.message)
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Invalid coupon'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart/coupon/remove')
    toast.success('Coupon removed')
    return null
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    loading: false,
    actionLoading: false,
    error: null,
    couponDiscount: 0,
    appliedCoupon: null,
  },
  reducers: {
    resetCart: (state) => {
      state.cart = null
      state.couponDiscount = 0
      state.appliedCoupon = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.cart = action.payload
        // Sync coupon state from cart data loaded from DB
        if (action.payload?.couponDiscount > 0) {
          state.couponDiscount = action.payload.couponDiscount
        }
        if (action.payload?.coupon && !state.appliedCoupon) {
          // coupon field from DB is populated (has code) or just an ID
          state.appliedCoupon = action.payload.coupon?.code
            ? { code: action.payload.coupon.code }
            : null
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })

      .addCase(addToCart.pending, (state) => { state.actionLoading = true })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.actionLoading = false; state.cart = action.payload
      })
      .addCase(addToCart.rejected, (state) => { state.actionLoading = false })

      .addCase(updateCartItem.fulfilled, (state, action) => { state.cart = action.payload })
      .addCase(removeCartItem.fulfilled, (state, action) => { state.cart = action.payload })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null; state.couponDiscount = 0; state.appliedCoupon = null
      })

      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponDiscount = action.payload.discount
        state.appliedCoupon = action.payload.coupon
      })
      .addCase(removeCoupon.fulfilled, (state) => {
        state.couponDiscount = 0; state.appliedCoupon = null
      })
  },
})

export const { resetCart } = cartSlice.actions

// Selectors
export const selectCartItems = (state) => state.cart.cart?.items || []
export const selectCartItemCount = (state) =>
  (state.cart.cart?.items || []).reduce((acc, item) => acc + item.quantity, 0)
export const selectCartSubtotal = (state) =>
  (state.cart.cart?.items || []).reduce((acc, item) => acc + item.price * item.quantity, 0)

export default cartSlice.reducer
