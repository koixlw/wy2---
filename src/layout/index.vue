<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <el-icon v-if="isCollapse" size="24"><ep-office-building /></el-icon>
        <span v-else class="logo-text">物业管理系统</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><ep-home-filled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="/addresses">
          <template #title>
            <el-icon><HomeFilled /></el-icon>
            <el-icon><office-building /></el-icon>
            <span>住址管理</span>
          </template>
          <el-menu-item index="/addresses/list">
            <el-icon><ep-list /></el-icon>
            <template #title>住址列表</template>
          </el-menu-item>
          <el-menu-item index="/addresses/tree">
            <el-icon><ep-share /></el-icon>
            <template #title>住址树形</template>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/residents">
          <template #title>
            <el-icon><ep-user /></el-icon>
            <span>住户管理</span>
          </template>
          <el-menu-item index="/residents/list">
            <el-icon><ep-list /></el-icon>
            <template #title>住户列表</template>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/expenses">
          <template #title>
            <el-icon><ep-money /></el-icon>
            <span>费用管理</span>
          </template>
          <el-menu-item index="/expenses/list">
            <el-icon><ep-list /></el-icon>
            <template #title>费用列表</template>
          </el-menu-item>
          <el-menu-item index="/expenses/stats">
            <el-icon><ep-data-analysis /></el-icon>
            <template #title>费用统计</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button 
            link 
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon size="20">
              <ep-expand v-if="isCollapse" />
              <ep-fold v-else />
            </el-icon>
          </el-button>
          
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><ep-user /></el-icon>
              <span>管理员</span>
              <el-icon><ep-arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)

// 面包屑导航
const breadcrumbs = computed(() => {
  const pathMap = {
    '/dashboard': [{ title: '首页', path: '/dashboard' }],
    '/addresses/list': [{ title: '住址管理', path: '/addresses' }, { title: '住址列表', path: '/addresses/list' }],
    '/addresses/tree': [{ title: '住址管理', path: '/addresses' }, { title: '住址树形', path: '/addresses/tree' }],
    '/residents/list': [{ title: '住户管理', path: '/residents' }, { title: '住户列表', path: '/residents/list' }],
    '/expenses/list': [{ title: '费用管理', path: '/expenses' }, { title: '费用列表', path: '/expenses/list' }],
    '/expenses/stats': [{ title: '费用管理', path: '/expenses' }, { title: '费用统计', path: '/expenses/stats' }]
  }
  return pathMap[route.path] || [{ title: '首页', path: '/dashboard' }]
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  background-color: #2c5530;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1e3a21;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.logo-text {
  margin-left: 8px;
}

.sidebar-menu {
  border: none;
  background-color: #2c5530;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #e8f5e8;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: #1e3a21;
  color: #67c23a;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #67c23a;
  color: white;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 20px;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info span {
  margin: 0 4px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>