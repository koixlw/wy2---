<template>
  <div class="residents-page">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input 
            v-model="searchForm.name" 
            placeholder="请输入住户姓名" 
            clearable
          />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input 
            v-model="searchForm.phone" 
            placeholder="请输入手机号" 
            clearable
          />
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
        
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在住" value="active" />
            <el-option label="已迁出" value="moved_out" />
          </el-select>
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
            新增住户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="addressFullName" label="住址" min-width="200" />
        <el-table-column prop="moveInDate" label="入住日期" width="120" />
        <el-table-column prop="moveOutDate" label="迁出日期" width="120">
          <template #default="{ row }">
            <span v-if="row.moveOutDate">{{ row.moveOutDate }}</span>
            <el-tag v-else type="success" size="small">在住</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isOwner" label="是否业主" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isOwner ? 'success' : 'info'" size="small">
              {{ row.isOwner ? '业主' : '租户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="emergencyContact" label="紧急联系人" width="120" />
        <el-table-column prop="emergencyPhone" label="紧急联系电话" width="140" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><ep-edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              v-if="!row.moveOutDate" 
              type="warning" 
              size="small" 
              @click="handleMoveOut(row)"
            >
              <el-icon><ep-switch-button /></el-icon>
              迁出
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="formRules" 
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入住日期" prop="moveInDate">
              <el-date-picker
                v-model="form.moveInDate"
                type="date"
                placeholder="请选择入住日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否业主">
              <el-switch 
                v-model="form.isOwner" 
                active-text="业主" 
                inactive-text="租户"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人">
              <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系电话">
              <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注">
          <el-input 
            v-model="form.notes" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注"
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
    
    <!-- 迁出对话框 -->
    <el-dialog 
      v-model="moveOutDialogVisible" 
      title="住户迁出" 
      width="400px"
    >
      <el-form 
        ref="moveOutFormRef" 
        :model="moveOutForm" 
        :rules="moveOutFormRules" 
        label-width="100px"
      >
        <el-form-item label="迁出日期" prop="moveOutDate">
          <el-date-picker
            v-model="moveOutForm.moveOutDate"
            type="date"
            placeholder="请选择迁出日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="迁出原因">
          <el-input 
            v-model="moveOutForm.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入迁出原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="moveOutDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleMoveOutSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import { residentAPI, addressAPI } from '@/api'

const route = useRoute()

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  addressId: '',
  status: ''
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
  name: '',
  phone: '',
  idCard: '',
  addressId: '',
  moveInDate: '',
  isOwner: false,
  emergencyContact: '',
  emergencyPhone: '',
  notes: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  addressId: [{ required: true, message: '请选择住址', trigger: 'change' }],
  moveInDate: [{ required: true, message: '请选择入住日期', trigger: 'change' }]
}

// 迁出对话框
const moveOutDialogVisible = ref(false)
const moveOutFormRef = ref()
const moveOutForm = reactive({
  residentId: null,
  moveOutDate: '',
  reason: ''
})

// 迁出表单验证规则
const moveOutFormRules = {
  moveOutDate: [{ required: true, message: '请选择迁出日期', trigger: 'change' }]
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

// 加载表格数据
const loadTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await residentAPI.getList(params)
    
    if (response.code === 200) {
      tableData.value = response.data.residents || []
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
    name: '',
    phone: '',
    addressId: '',
    status: ''
  })
  pagination.page = 1
  loadTableData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增住户'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑住户'
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

// 迁出
const handleMoveOut = (row) => {
  moveOutForm.residentId = row.id
  moveOutForm.moveOutDate = ''
  moveOutForm.reason = ''
  moveOutDialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除住户 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await residentAPI.delete(row.id)
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadTableData()
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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const response = isEdit.value 
      ? await residentAPI.update(form.id, form)
      : await residentAPI.create(form)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadTableData()
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

// 提交迁出
const handleMoveOutSubmit = async () => {
  if (!moveOutFormRef.value) return
  
  try {
    await moveOutFormRef.value.validate()
    
    submitting.value = true
    
    const response = await residentAPI.moveOut(moveOutForm.residentId, {
      moveOutDate: moveOutForm.moveOutDate,
      reason: moveOutForm.reason
    })
    
    if (response.code === 200) {
      ElMessage.success('迁出成功')
      moveOutDialogVisible.value = false
      loadTableData()
    } else {
      ElMessage.error(response.msg || '迁出失败')
    }
  } catch (error) {
    console.error('迁出失败:', error)
    ElMessage.error('迁出失败')
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
    name: '',
    phone: '',
    idCard: '',
    addressId: '',
    moveInDate: '',
    isOwner: false,
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  })
  
  if (formRef.value) {
    formRef.value.clearValidate()
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
})
</script>

<style scoped>
.residents-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>