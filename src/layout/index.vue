<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '56px' : '220px'" class="sidebar">
      <div class="logo-area">
        <el-icon class="logo-icon" size="28"><ep-office-building /></el-icon>
        <transition name="fade">
          <span v-if="!isCollapse" class="logo-title">物业管理系统</span>
        </transition>
      </div>
      
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-sub-menu index="/addresses">
          <template #title>
       
            <el-icon><office-building /></el-icon>
            <span>住址管理</span>
          </template>
          <el-menu-item index="/addresses/list">
            <el-icon><list /></el-icon>
            <template #title>住址列表</template>
          </el-menu-item>
          <el-menu-item index="/addresses/tree">
            <el-icon><share /></el-icon>
            <template #title>住址树形</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/residents">
          <template #title>
            <el-icon><user /></el-icon>
            <span>住户管理</span>
          </template>
          <el-menu-item index="/residents/list">
            <el-icon><list /></el-icon>
            <template #title>住户列表</template>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="/expenses">
          <template #title>
          <el-icon><Money /></el-icon>
            <span>费用管理</span>
          </template>
          <el-menu-item index="/expenses/list">
            <el-icon><list /></el-icon>
            <template #title>费用列表</template>
          </el-menu-item>
          <el-menu-item index="/expenses/stats">
            <el-icon><data-analysis /></el-icon>
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
              <expand v-if="isCollapse" />
              <fold v-else />
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
              <el-icon><user /></el-icon>
              <span>管理员</span>
              <el-icon><arrow-down /></el-icon>
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
  background: transparent;
  transition: width 0.2s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
  box-shadow: none;
  border-radius: 0;
  min-height: 100vh;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  color: #233d2b;
  font-size: 20px;
  font-weight: bold;
  padding-left: 18px;
  border-bottom: 1px solid #e0e6ed;
}
.logo-icon {
  margin-right: 10px;
  transition: margin 0.2s;
}
.logo-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.sidebar-menu {
  border: none;
  background: transparent;
  margin-top: 8px;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #233d2b;
  border-radius: 8px;
  margin: 0 8px;
  height: 46px;
  line-height: 46px;
  font-size: 16px;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background: rgba(35,61,43,0.08);
  color: #1a3a22;
  box-shadow: 0 2px 8px 0 rgba(35,61,43,0.08);
}
.sidebar-menu .el-menu-item.is-active {
  background: #e3f0ff;
  color: #1761a0;
  border-right: 4px solid #1761a0;
  font-weight: bold;
  box-shadow: 0 2px 8px 0 rgba(23,97,160,0.08);
}
.sidebar-menu .el-menu-item .el-icon,
.sidebar-menu .el-sub-menu__title .el-icon {
  margin-right: 10px;
  font-size: 18px;
  color: #1761a0;
}
.sidebar-menu .el-sub-menu__title {
  font-weight: 500;
}
.sidebar-menu .el-menu-item {
  padding-left: 32px !important;
}
.sidebar-menu .el-menu--inline {
  background: transparent !important;
}
.sidebar-menu .el-menu-item.is-active .el-icon {
  color: #1761a0;
}
.sidebar-menu .el-menu-item .el-icon {
  color: #1761a0;
}
.sidebar-menu .el-menu-item.is-active .el-icon {
  color: #1761a0;
}
.sidebar-menu .el-menu-item {
  border-radius: 8px;
}
.sidebar-menu .el-menu-item:not(.is-active):hover .el-icon {
  color: #1a3a22;
}
.sidebar-menu .el-menu--inline .el-menu-item {
  padding-left: 48px !important;
}
.sidebar-menu .el-menu--inline .el-menu-item .el-icon {
  font-size: 16px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(90deg, #f7fafc 60%, #e3f0ff 100%);
  border-bottom: 1px solid #e0e6ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  box-shadow: 0 2px 8px 0 rgba(0, 21, 41, 0.06);
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
  background: linear-gradient(180deg, #fafdff 80%, #eaf3fb 100%);
  padding: 28px 28px 0 28px;
  min-height: 0;
  overflow-y: auto;
}
</style>
