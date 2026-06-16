import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData)
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Order creation failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const fetchMyOrders = createAsyncThunk('orders/myOrders', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders/my-orders', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`)
    return data.order
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/orders/${id}/cancel`, { reason })
    toast.success('Order cancelled')
    return data.order
  } catch (err) {
    const msg = err.response?.data?.message || 'Cannot cancel order'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const createPaymentOrder = createAsyncThunk('orders/createPayment', async (orderId, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payment/create-order', { orderId })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const verifyPayment = createAsyncThunk('orders/verifyPayment', async (paymentData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payment/verify', paymentData)
    toast.success('Payment successful! 🎉')
    return data
  } catch (err) {
    const msg = err.response?.data?.message || 'Payment verification failed'
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    order: null,
    total: 0,
    pages: 1,
    loading: false,
    orderLoading: false,
    error: null,
    paymentData: null,
  },
  reducers: {
    clearOrder: (state) => { state.order = null },
    clearPaymentData: (state) => { state.paymentData = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.orderLoading = true })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderLoading = false; state.order = action.payload.order
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderLoading = false; state.error = action.payload
      })

      .addCase(fetchMyOrders.pending, (state) => { state.loading = true })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.total = action.payload.total
        state.pages = action.payload.pages
      })
      .addCase(fetchMyOrders.rejected, (state) => { state.loading = false })

      .addCase(fetchOrder.pending, (state) => { state.orderLoading = true })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.orderLoading = false; state.order = action.payload
      })
      .addCase(fetchOrder.rejected, (state) => { state.orderLoading = false })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.order = action.payload
        const idx = state.orders.findIndex((o) => o._id === action.payload._id)
        if (idx !== -1) state.orders[idx] = action.payload
      })

      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.paymentData = action.payload
      })
  },
})

export const { clearOrder, clearPaymentData } = orderSlice.actions
export default orderSlice.reducer
