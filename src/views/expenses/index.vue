<template>
  <div class="expenses-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="费用类型">
          <el-select v-model="searchForm.type" placeholder="请选择费用类型" clearable>
            <el-option label="物业费" value="property" />
            <el-option label="水费" value="water" />
            <el-option label="电费" value="electricity" />
            <el-option label="燃气费" value="gas" />
            <el-option label="停车费" value="parking" />
            <el-option label="维修费" value="maintenance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="住址">
          <el-select 
            v-model="searchForm.addressId" 
            placeholder="请选择住址" 
            clearable
            filterable
            remote
            :remote-method="searchAddresses"
            :loading="addressLoading"
          >
            <el-option 
              v-for="address in addressOptions"
              :key="address.id"
              :label="address.fullName"
              :value="address.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="缴费状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待缴费" value="pending" />
            <el-option label="已缴费" value="paid" />
            <el-option label="已逾期" value="overdue" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="费用期间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><ep-search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><ep-refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><ep-plus /></el-icon>
            新增费用
          </el-button>
          <el-button type="warning" @click="handleBatchCreate">
            <el-icon><ep-document-add /></el-icon>
            批量生成
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon pending">
              <el-icon><ep-clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatMoney(stats.pendingAmount) }}</div>
              <div class="stats-label">待缴费金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon paid">
              <el-icon><ep-check /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatMoney(stats.paidAmount) }}</div>
              <div class="stats-label">已缴费金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon overdue">
              <el-icon><ep-warning /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatMoney(stats.overdueAmount) }}</div>
              <div class="stats-label">逾期金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><ep-money /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ formatMoney(stats.totalAmount) }}</div>
              <div class="stats-label">总金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="type" label="费用类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addressFullName" label="住址" min-width="200" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount-text">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="billingPeriod" label="计费期间" width="120" />
        <el-table-column prop="dueDate" label="到期日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paidDate" label="缴费日期" width="120">
          <template #default="{ row }">
            <span v-if="row.paidDate">{{ row.paidDate }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><ep-edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small" 
              @click="handlePay(row)"
            >
              <el-icon><ep-check /></el-icon>
              缴费
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><ep-delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="formRules" 
        label-width="100px"
      >
        <el-form-item label="费用类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择费用类型">
            <el-option label="物业费" value="property" />
            <el-option label="水费" value="water" />
            <el-option label="电费" value="electricity" />
            <el-option label="燃气费" value="gas" />
            <el-option label="停车费" value="parking" />
            <el-option label="维修费" value="maintenance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="住址" prop="addressId">
          <el-select 
            v-model="form.addressId" 
            placeholder="请选择住址" 
            filterable
            remote
            :remote-method="searchAddresses"
            :loading="addressLoading"
            style="width: 100%"
          >
            <el-option 
              v-for="address in addressOptions"
              :key="address.id"
              :label="address.fullName"
              :value="address.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input-number 
            v-model="form.amount" 
            :min="0" 
            :precision="2" 
            placeholder="请输入金额"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="计费期间" prop="billingPeriod">
          <el-date-picker
            v-model="form.billingPeriod"
            type="month"
            placeholder="请选择计费期间"
            style="width: 100%"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        
        <el-form-item label="到期日期" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="请选择到期日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量生成对话框 -->
    <el-dialog 
      v-model="batchDialogVisible" 
      title="批量生成费用" 
      width="600px"
    >
      <el-form 
        ref="batchFormRef" 
        :model="batchForm" 
        :rules="batchFormRules" 
        label-width="100px"
      >
        <el-form-item label="费用类型" prop="type">
          <el-select v-model="batchForm.type" placeholder="请选择费用类型">
            <el-option label="物业费" value="property" />
            <el-option label="水费" value="water" />
            <el-option label="电费" value="electricity" />
            <el-option label="燃气费" value="gas" />
            <el-option label="停车费" value="parking" />
            <el-option label="维修费" value="maintenance" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="住址范围" prop="addressIds">
          <el-select 
            v-model="batchForm.addressIds" 
            placeholder="请选择住址" 
            multiple
            filterable
            remote
            :remote-method="searchAddresses"
            :loading="addressLoading"
            style="width: 100%"
          >
            <el-option 
              v-for="address in addressOptions"
              :key="address.id"
              :label="address.fullName"
              :value="address.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="金额" prop="amount">
          <el-input-number 
            v-model="batchForm.amount" 
            :min="0" 
            :precision="2" 
            placeholder="请输入金额"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="计费期间" prop="billingPeriod">
          <el-date-picker
            v-model="batchForm.billingPeriod"
            type="month"
            placeholder="请选择计费期间"
            style="width: 100%"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        
        <el-form-item label="到期日期" prop="dueDate">
          <el-date-picker
            v-model="batchForm.dueDate"
            type="date"
            placeholder="请选择到期日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input 
            v-model="batchForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import { expenseAPI, addressAPI } from '@/api'

const route = useRoute()

// 搜索表单
const searchForm = reactive({
  type: '',
  addressId: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  pendingAmount: 0,
  paidAmount: 0,
  overdueAmount: 0,
  totalAmount: 0
})

// 住址选项
const addressOptions = ref([])
const addressLoading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitting = ref(false)

// 表单
const formRef = ref()
const form = reactive({
  id: null,
  type: '',
  addressId: '',
  amount: null,
  billingPeriod: '',
  dueDate: '',
  description: ''
})

// 表单验证规则
const formRules = {
  type: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
  addressId: [{ required: true, message: '请选择住址', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  billingPeriod: [{ required: true, message: '请选择计费期间', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

// 批量生成对话框
const batchDialogVisible = ref(false)
const batchFormRef = ref()
const batchForm = reactive({
  type: '',
  addressIds: [],
  amount: null,
  billingPeriod: '',
  dueDate: '',
  description: ''
})

// 批量表单验证规则
const batchFormRules = {
  type: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
  addressIds: [{ required: true, message: '请选择住址', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  billingPeriod: [{ required: true, message: '请选择计费期间', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

// 格式化金额
const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return '¥0.00'
  return `¥${Number(amount).toFixed(2)}`
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    property: 'primary',
    water: 'info',
    electricity: 'warning',
    gas: 'danger',
    parking: 'success',
    maintenance: '',
    other: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    property: '物业费',
    water: '水费',
    electricity: '电费',
    gas: '燃气费',
    parking: '停车费',
    maintenance: '维修费',
    other: '其他'
  }
  return typeMap[type] || type
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    pending: 'warning',
    paid: 'success',
    overdue: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    pending: '待缴费',
    paid: '已缴费',
    overdue: '已逾期'
  }
  return statusMap[status] || status
}

// 搜索住址
const searchAddresses = async (query) => {
  if (!query) {
    addressOptions.value = []
    return
  }
  
  addressLoading.value = true
  try {
    const response = await addressAPI.getList({ search: query, size: 50 })
    if (response.code === 200) {
      addressOptions.value = response.data.addresses || []
    }
  } catch (error) {
    console.error('搜索住址失败:', error)
  } finally {
    addressLoading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await expenseAPI.getStats()
    if (response.code === 200) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载表格数据
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    
    // 处理日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
      delete params.dateRange
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await expenseAPI.getList(params)
    
    if (response.code === 200) {
      tableData.value = response.data.expenses || []
      pagination.total = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadTableData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    type: '',
    addressId: '',
    status: '',
    dateRange: []
  })
  pagination.page = 1
  loadTableData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增费用'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑费用'
  Object.assign(form, row)
  
  // 如果有住址信息，添加到选项中
  if (row.addressId && row.addressFullName) {
    const existingOption = addressOptions.value.find(option => option.id === row.addressId)
    if (!existingOption) {
      addressOptions.value.push({
        id: row.addressId,
        fullName: row.addressFullName
      })
    }
  }
  
  dialogVisible.value = true
}

// 缴费
const handlePay = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要为 "${row.addressFullName}" 缴费 ${formatMoney(row.amount)} 吗？`,
      '确认缴费',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await expenseAPI.pay(row.id)
    
    if (response.code === 200) {
      ElMessage.success('缴费成功')
      loadTableData()
      loadStats()
    } else {
      ElMessage.error(response.msg || '缴费失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('缴费失败:', error)
      ElMessage.error('缴费失败')
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条费用记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await expenseAPI.delete(row.id)
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadTableData()
      loadStats()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量生成
const handleBatchCreate = () => {
  resetBatchForm()
  batchDialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const response = isEdit.value 
      ? await expenseAPI.update(form.id, form)
      : await expenseAPI.create(form)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadTableData()
      loadStats()
    } else {
      ElMessage.error(response.msg || '操作失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 提交批量生成
const handleBatchSubmit = async () => {
  if (!batchFormRef.value) return
  
  try {
    await batchFormRef.value.validate()
    
    submitting.value = true
    
    const response = await expenseAPI.batchCreate(batchForm)
    
    if (response.code === 200) {
      ElMessage.success('批量生成成功')
      batchDialogVisible.value = false
      loadTableData()
      loadStats()
    } else {
      ElMessage.error(response.msg || '批量生成失败')
    }
  } catch (error) {
    console.error('批量生成失败:', error)
    ElMessage.error('批量生成失败')
  } finally {
    submitting.value = false
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadTableData()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.page = page
  loadTableData()
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    type: '',
    addressId: '',
    amount: null,
    billingPeriod: '',
    dueDate: '',
    description: ''
  })
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 重置批量表单
const resetBatchForm = () => {
  Object.assign(batchForm, {
    type: '',
    addressIds: [],
    amount: null,
    billingPeriod: '',
    dueDate: '',
    description: ''
  })
  
  if (batchFormRef.value) {
    batchFormRef.value.clearValidate()
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 页面加载时获取数据
onMounted(() => {
  // 如果路由中有 addressId 参数，设置默认搜索条件
  if (route.query.addressId) {
    searchForm.addressId = route.query.addressId
  }
  
  loadTableData()
  loadStats()
})
</script>

<style scoped>
.expenses-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stats-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.paid {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.overdue {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.total {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

.table-card {
  margin-bottom: 20px;
}

.amount-text {
  font-weight: bold;
  color: #e6a23c;
}

.text-muted {
  color: #c0c4cc;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>