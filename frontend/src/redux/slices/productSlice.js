import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`)
    return data.product
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured')
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchTrendingProducts = createAsyncThunk('products/trending', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/trending')
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchNewArrivals = createAsyncThunk('products/newArrivals', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/new-arrivals')
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchBestSellers = createAsyncThunk('products/bestSellers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/best-sellers')
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchRelatedProducts = createAsyncThunk('products/related', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}/related`)
    return data.products
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/categories')
    return data.categories
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchBanners = createAsyncThunk('products/banners', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/banners', { params })
    return data.banners
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    featured: [],
    trending: [],
    newArrivals: [],
    bestSellers: [],
    related: [],
    categories: [],
    banners: [],
    bannersLoading: true,
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    productLoading: false,
    error: null,
    filters: {
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      color: '',
      size: '',
      rating: '',
      gender: '',
      sort: 'newest',
      page: 1,
      limit: 12,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 }
    },
    setPage: (state, action) => {
      state.filters.page = action.payload
    },
    clearFilters: (state) => {
      state.filters = {
        keyword: '', category: '', minPrice: '', maxPrice: '',
        color: '', size: '', rating: '', gender: '', sort: 'newest', page: 1, limit: 12,
      }
    },
    clearProduct: (state) => { state.product = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.total = action.payload.total
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })

      .addCase(fetchProduct.pending, (state) => { state.productLoading = true; state.error = null })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.productLoading = false; state.product = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.productLoading = false; state.error = action.payload
      })

      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featured = action.payload })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => { state.trending = action.payload })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => { state.newArrivals = action.payload })
      .addCase(fetchBestSellers.fulfilled, (state, action) => { state.bestSellers = action.payload })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => { state.related = action.payload })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload })
      .addCase(fetchBanners.pending, (state) => { state.bannersLoading = true })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.bannersLoading = false
        state.banners = action.payload
      })
      .addCase(fetchBanners.rejected, (state) => { state.bannersLoading = false })
  },
})

export const { setFilters, setPage, clearFilters, clearProduct } = productSlice.actions
export default productSlice.reducer
