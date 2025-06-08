// API 基础配置
const BASE_URL = 'http://localhost:3000'

// 通用请求函数
const request = async (url, options = {}) => {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  if (config.method !== 'GET' && config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 住址管理 API
export const addressAPI = {
  // 获取住址列表
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/addresses/${query ? '?' + query : ''}`)
  },

  // 获取住址树形结构
  getTree: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/addresses/tree${query ? '?' + query : ''}`)
  },

  // 创建住址
  create: (data) => {
    return request('/api/addresses/', {
      method: 'POST',
      body: data
    })
  },

  // 获取住址详情
  getDetail: (id) => {
    return request(`/api/addresses/${id}`)
  },

  // 更新住址
  update: (id, data) => {
    return request(`/api/addresses/${id}`, {
      method: 'PUT',
      body: data
    })
  },

  // 删除住址
  delete: (id) => {
    return request(`/api/addresses/${id}`, {
      method: 'DELETE'
    })
  }
}

// 住户管理 API
export const residentAPI = {
  // 获取住户列表
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/residents/${query ? '?' + query : ''}`)
  },

  // 创建住户
  create: (data) => {
    return request('/api/residents/', {
      method: 'POST',
      body: data
    })
  },

  // 获取住户详情
  getDetail: (id) => {
    return request(`/api/residents/${id}`)
  },

  // 更新住户
  update: (id, data) => {
    return request(`/api/residents/${id}`, {
      method: 'PUT',
      body: data
    })
  },

  // 删除住户
  delete: (id) => {
    return request(`/api/residents/${id}`, {
      method: 'DELETE'
    })
  },

  // 根据住址获取住户
  getByAddress: (addressId) => {
    return request(`/api/residents/by-address/${addressId}`)
  },

  // 住户搬出
  moveOut: (id, data) => {
    return request(`/api/residents/${id}/move-out`, {
      method: 'PUT',
      body: data
    })
  }
}

// 费用管理 API
export const expenseAPI = {
  // 获取费用列表
  getList: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/expenses/${query ? '?' + query : ''}`)
  },

  // 创建费用
  create: (data) => {
    return request('/api/expenses/', {
      method: 'POST',
      body: data
    })
  },

  // 获取费用详情
  getDetail: (id) => {
    return request(`/api/expenses/${id}`)
  },

  // 更新费用
  update: (id, data) => {
    return request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: data
    })
  },

  // 删除费用
  delete: (id) => {
    return request(`/api/expenses/${id}`, {
      method: 'DELETE'
    })
  },

  // 根据住址获取费用
  getByAddress: (addressId) => {
    return request(`/api/expenses/by-address/${addressId}`)
  },

  // 批量创建费用
  batchCreate: (data) => {
    return request('/api/expenses/batch', {
      method: 'POST',
      body: data
    })
  },

  // 缴费
  pay: (id, data) => {
    return request(`/api/expenses/${id}/pay`, {
      method: 'PUT',
      body: data
    })
  },

  // 获取费用统计
  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/api/expenses/stats${query ? '?' + query : ''}`)
  }
}