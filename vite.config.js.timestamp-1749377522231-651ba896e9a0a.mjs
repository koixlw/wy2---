// vite.config.js
import { defineConfig } from "file:///E:/wy2-%E5%89%8D%E7%AB%AF/node_modules/.pnpm/vite@5.4.19/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/wy2-%E5%89%8D%E7%AB%AF/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@5.4.19_vue@3.5.16/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import UnoCSS from "file:///E:/wy2-%E5%89%8D%E7%AB%AF/node_modules/.pnpm/unocss@0.58.9_postcss@8.5.4_rollup@4.42.0_vite@5.4.19/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///E:/wy2-%E5%89%8D%E7%AB%AF/node_modules/.pnpm/unplugin-auto-import@0.17.8_4aa12fe6f6a1b661272580b14258c703/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///E:/wy2-%E5%89%8D%E7%AB%AF/node_modules/.pnpm/unplugin-vue-components@0.2_5cfadd37cf806b8fe99adfd0b9b9a35f/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///E:/wy2-%E5%89%8D%E7%AB%AF/node_modules/.pnpm/unplugin-vue-components@0.2_5cfadd37cf806b8fe99adfd0b9b9a35f/node_modules/unplugin-vue-components/dist/resolvers.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "E:\\wy2-\u524D\u7AEF";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ["vue", "vue-router", "pinia"],
      dts: true
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        (componentName) => {
          if (componentName.startsWith("ep-")) {
            const iconName = componentName.slice(3).split("-").map(
              (word) => word.charAt(0).toUpperCase() + word.slice(1)
            ).join("");
            return { name: iconName, from: "@element-plus/icons-vue" };
          }
        }
      ]
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx3eTItXHU1MjREXHU3QUVGXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFx3eTItXHU1MjREXHU3QUVGXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi93eTItJUU1JTg5JThEJUU3JUFCJUFGL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcblxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBVbm9DU1MoKSxcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXG4gICAgICBkdHM6IHRydWVcbiAgICB9KSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBFbGVtZW50UGx1c1Jlc29sdmVyKCksXG4gICAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NTZGRVx1NjgwN1x1N0VDNFx1NEVGNlxuICAgICAgICAoY29tcG9uZW50TmFtZSkgPT4ge1xuICAgICAgICAgIGlmIChjb21wb25lbnROYW1lLnN0YXJ0c1dpdGgoJ2VwLScpKSB7XG4gICAgICAgICAgICAvLyBcdTVDMDYgZXAtc2VhcmNoIFx1OEY2Q1x1NjM2Mlx1NEUzQSBTZWFyY2hcbiAgICAgICAgICAgIGNvbnN0IGljb25OYW1lID0gY29tcG9uZW50TmFtZS5zbGljZSgzKS5zcGxpdCgnLScpLm1hcCh3b3JkID0+XG4gICAgICAgICAgICAgIHdvcmQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnNsaWNlKDEpXG4gICAgICAgICAgICApLmpvaW4oJycpXG4gICAgICAgICAgICByZXR1cm4geyBuYW1lOiBpY29uTmFtZSwgZnJvbTogJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSlcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJylcbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpTyxTQUFTLG9CQUFvQjtBQUM5UCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBRXBDLFNBQVMsZUFBZTtBQVB4QixJQUFNLG1DQUFtQztBQVN6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNqQyxTQUFTLENBQUMsT0FBTyxjQUFjLE9BQU87QUFBQSxNQUN0QyxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxXQUFXO0FBQUEsUUFDVCxvQkFBb0I7QUFBQTtBQUFBLFFBRXBCLENBQUMsa0JBQWtCO0FBQ2pCLGNBQUksY0FBYyxXQUFXLEtBQUssR0FBRztBQUVuQyxrQkFBTSxXQUFXLGNBQWMsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFBQSxjQUFJLFVBQ3JELEtBQUssT0FBTyxDQUFDLEVBQUUsWUFBWSxJQUFJLEtBQUssTUFBTSxDQUFDO0FBQUEsWUFDN0MsRUFBRSxLQUFLLEVBQUU7QUFDVCxtQkFBTyxFQUFFLE1BQU0sVUFBVSxNQUFNLDBCQUEwQjtBQUFBLFVBQzNEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLElBQy9CO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
