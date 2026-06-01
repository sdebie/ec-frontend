import path from 'path';

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
function buildStorefrontConfigVirtualModule(): string {
  return `
const configModules = import.meta.glob('/src/tenants/*/config.ts', { eager: true });

const toTenantId = (modulePath) => {
  const match = /^\\/src\\/tenants\\/([^/]+)\\/config\\.ts$/.exec(modulePath);
  return match ? match[1] : null;
};

const readDefaultExport = (moduleValue) => {
  if (!moduleValue || typeof moduleValue !== 'object') return undefined;
  if ('defaultStorefrontConfig' in moduleValue) return moduleValue.defaultStorefrontConfig;
  if ('clientUvhStorefrontConfig' in moduleValue) return moduleValue.clientUvhStorefrontConfig;
  const firstConfig = Object.values(moduleValue).find((value) => value && typeof value === 'object' && 'id' in value);
  return firstConfig;
};

const resolvedConfigImports = Object.entries(configModules).reduce((registry, [modulePath, moduleValue]) => {
  const tenantId = toTenantId(modulePath);
  if (!tenantId) return registry;
  const config = readDefaultExport(moduleValue);
  if (!config) return registry;
  return { ...registry, [tenantId]: config };
}, {});

const normalizeTenantFilter = (rawTenant) => {
  const tenant = (rawTenant ?? '').trim().toLowerCase();
  if (!tenant || tenant === 'all') return null;
  return tenant === 'default' ? ['default'] : ['default', tenant];
};

const allowedTenants = normalizeTenantFilter(import.meta.env.VITE_STORE_FRONT);

export const storefrontConfigImports = allowedTenants
  ? Object.fromEntries(Object.entries(resolvedConfigImports).filter(([tenantId]) => allowedTenants.includes(tenantId)))
  : resolvedConfigImports;
`;
}

function buildStorefrontPageVirtualModule(): string {
  return `
const pageModules = import.meta.glob('/src/tenants/*/pages/*/page.tsx');

const normalizeTenantFilter = (rawTenant) => {
  const tenant = (rawTenant ?? '').trim().toLowerCase();
  if (!tenant || tenant === 'all') return null;
  return tenant === 'default' ? ['default'] : ['default', tenant];
};

const allowedTenants = normalizeTenantFilter(import.meta.env.VITE_STORE_FRONT);

const toPageImportKey = (modulePath) => {
  const match = /^\\/src\\/tenants\\/([^/]+)\\/pages\\/([^/]+)\\/page\\.tsx$/.exec(modulePath);
  if (!match) return null;
  const [, tenantId, pageKey] = match;
  return { tenantId, pageKey };
};

export const storefrontPageImports = Object.entries(pageModules).reduce((registry, [modulePath, loader]) => {
  const parsed = toPageImportKey(modulePath);
  if (!parsed) return registry;
  if (allowedTenants && !allowedTenants.includes(parsed.tenantId)) return registry;
  return {
    ...registry,
    [\`\${parsed.tenantId}/\${parsed.pageKey}\`]: loader,
  };
}, {});
`;
}

const storefrontVirtualModules = () => {
  const configVirtualId = 'virtual:storefront-config-map';
  const pageVirtualId = 'virtual:storefront-page-map';
  const resolvedConfigVirtualId = `\0${configVirtualId}`;
  const resolvedPageVirtualId = `\0${pageVirtualId}`;
  return {
    name: 'storefront-virtual-modules',
    resolveId(id: string) {
      if (id === configVirtualId) return resolvedConfigVirtualId;
      if (id === pageVirtualId) return resolvedPageVirtualId;
      return null;
    },
    load(id: string) {
      if (id === resolvedConfigVirtualId) {
        return buildStorefrontConfigVirtualModule();
      }
      if (id === resolvedPageVirtualId) {
        return buildStorefrontPageVirtualModule();
      }
      return null;
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [storefrontVirtualModules(), react(), dynamicImport()],
    assetsInclude: ['**/*.md'],
    optimizeDeps: {
      include: [
        'react-hook-form',
        'zod',
        '@hookform/resolvers',
        '@hookform/resolvers/zod'
      ]
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    server: {
      host: true, // Crucial: Allows access from outside the container
      port: 3000,
      strictPort: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '192.168.1.16' // Add your domain here
      ],
      proxy: {
        // Directs frontend calls to the backend service
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        },
        '/static': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false
        }
      },
      watch: {
        usePolling: true, // Necessary for file changes to sync on Proxmox/VMs
      }
    },
    build: {
      outDir: 'build',
      sourcemap: false // Disable source maps for production builds to avoid DevTools errors
    }
  }
})