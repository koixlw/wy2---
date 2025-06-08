import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      collections: {
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default)
      }
    })
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded inline-block bg-blue-500 text-white cursor-pointer hover:bg-blue-600 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    'btn-primary': 'btn bg-blue-500 hover:bg-blue-600',
    'btn-success': 'btn bg-green-500 hover:bg-green-600',
    'btn-warning': 'btn bg-yellow-500 hover:bg-yellow-600',
    'btn-danger': 'btn bg-red-500 hover:bg-red-600',
    'card': 'bg-white rounded-lg shadow-md p-4',
    'form-item': 'mb-4',
    'form-label': 'block text-sm font-medium text-gray-700 mb-1',
    'form-input': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
  },
  theme: {
    colors: {
      primary: '#409eff',
      success: '#67c23a',
      warning: '#e6a23c',
      danger: '#f56c6c',
      info: '#909399'
    }
  }
})