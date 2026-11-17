import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts & Guards (Static for instant shell render)
import { PublicLayout } from '../components/layout/PublicLayout'
import { AppLayout } from '../components/layout/AppLayout'
import { RouteGuard } from './RouteGuard'

// Customer Pages (Lazy Loaded)
const HomePage = lazy(() => import('../portals/customer/pages/HomePage').then((m) => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('../portals/customer/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const InsuranceCatalogPage = lazy(() => import('../portals/customer/pages/InsuranceCatalogPage').then((m) => ({ default: m.InsuranceCatalogPage })))
const ProductDetailPage = lazy(() => import('../portals/customer/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const ComparePage = lazy(() => import('../portals/customer/pages/ComparePage').then((m) => ({ default: m.ComparePage })))
const AssessmentPage = lazy(() => import('../portals/customer/pages/AssessmentPage').then((m) => ({ default: m.AssessmentPage })))
const ContactPage = lazy(() => import('../portals/customer/pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const LoginPage = lazy(() => import('../portals/customer/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../portals/customer/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))

// Employee Pages (Lazy Loaded)
const OverviewPage = lazy(() => import('../portals/employee/pages/OverviewPage').then((m) => ({ default: m.OverviewPage })))
const LeadsPage = lazy(() => import('../portals/employee/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })))
const CustomersPage = lazy(() => import('../portals/employee/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })))
const AssessmentsPage = lazy(() => import('../portals/employee/pages/AssessmentsPage').then((m) => ({ default: m.AssessmentsPage })))
const QuotationsPage = lazy(() => import('../portals/employee/pages/QuotationsPage').then((m) => ({ default: m.QuotationsPage })))
const ApplicationsPage = lazy(() => import('../portals/employee/pages/ApplicationsPage').then((m) => ({ default: m.ApplicationsPage })))
const TasksPage = lazy(() => import('../portals/employee/pages/TasksPage').then((m) => ({ default: m.TasksPage })))
const DocumentsPage = lazy(() => import('../portals/employee/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })))
const InsurersPage = lazy(() => import('../portals/employee/pages/InsurersPage').then((m) => ({ default: m.InsurersPage })))
const ProductsPage = lazy(() => import('../portals/employee/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })))

// Manager Pages (Lazy Loaded)
const ManagerDashboardPage = lazy(() => import('../portals/manager/pages/ManagerDashboardPage').then((m) => ({ default: m.ManagerDashboardPage })))
const EmployeeAnalyticsPage = lazy(() => import('../portals/manager/pages/EmployeeAnalyticsPage').then((m) => ({ default: m.EmployeeAnalyticsPage })))
const InsurerAnalyticsPage = lazy(() => import('../portals/manager/pages/InsurerAnalyticsPage').then((m) => ({ default: m.InsurerAnalyticsPage })))
const ProductAnalyticsPage = lazy(() => import('../portals/manager/pages/ProductAnalyticsPage').then((m) => ({ default: m.ProductAnalyticsPage })))
const LostLeadIntelligencePage = lazy(() => import('../portals/manager/pages/LostLeadIntelligencePage').then((m) => ({ default: m.LostLeadIntelligencePage })))
const AdminPanelPage = lazy(() => import('../portals/manager/pages/AdminPanelPage').then((m) => ({ default: m.AdminPanelPage })))
const ModelMonitoringPage = lazy(() => import('../portals/manager/pages/ModelMonitoringPage').then((m) => ({ default: m.ModelMonitoringPage })))

// Shared Pages (Lazy Loaded)
const DesignSystemPage = lazy(() => import('../pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

const RouteLoadingFallback = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3">
    <div className="w-8 h-8 border-2 border-[#16856D] border-t-transparent rounded-full animate-spin" />
    <span className="text-[11px] font-bold text-[#142D4E] tracking-wider uppercase font-['Manrope']">
      Loading FINCORE Module...
    </span>
  </div>
)

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* 1. Public Customer Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/insurance" element={<InsuranceCatalogPage />} />
          <Route path="/insurance/:productId" element={<ProductDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/design-system" element={<DesignSystemPage />} />
        </Route>

        {/* 2. Internal Employee Application Routes */}
        <Route
          path="/app"
          element={
            <RouteGuard requireEmployee={true}>
              <AppLayout />
            </RouteGuard>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="overview" element={<Navigate to="/app" replace />} />

          {/* Sales, Manager, Admin */}
          <Route
            path="leads"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin']}>
                <LeadsPage />
              </RouteGuard>
            }
          />

          {/* Customer 360 */}
          <Route
            path="customers"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'operations', 'compliance']}>
                <CustomersPage />
              </RouteGuard>
            }
          />

          {/* Assessments */}
          <Route
            path="assessments"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'compliance']}>
                <AssessmentsPage />
              </RouteGuard>
            }
          />

          {/* Quotations */}
          <Route
            path="quotations"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'operations', 'finance', 'compliance']}>
                <QuotationsPage />
              </RouteGuard>
            }
          />

          {/* Applications */}
          <Route
            path="applications"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'operations', 'finance', 'compliance']}>
                <ApplicationsPage />
              </RouteGuard>
            }
          />

          {/* Tasks */}
          <Route
            path="tasks"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'operations']}>
                <TasksPage />
              </RouteGuard>
            }
          />

          {/* Documents */}
          <Route
            path="documents"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'operations', 'compliance']}>
                <DocumentsPage />
              </RouteGuard>
            }
          />

          {/* Insurers Directory */}
          <Route
            path="insurers"
            element={
              <RouteGuard allowedRoles={['manager', 'admin', 'operations', 'finance', 'compliance']}>
                <InsurersPage />
              </RouteGuard>
            }
          />

          {/* Products Catalogue Admin */}
          <Route
            path="products"
            element={
              <RouteGuard allowedRoles={['sales', 'manager', 'admin', 'operations', 'compliance']}>
                <ProductsPage />
              </RouteGuard>
            }
          />

          {/* Manager BI Dashboard */}
          <Route
            path="analytics"
            element={
              <RouteGuard allowedRoles={['manager', 'admin', 'finance']}>
                <ManagerDashboardPage />
              </RouteGuard>
            }
          />

          {/* Admin sub-routes */}
          <Route
            path="admin/employees"
            element={
              <RouteGuard allowedRoles={['manager', 'admin']}>
                <EmployeeAnalyticsPage />
              </RouteGuard>
            }
          />
          <Route
            path="admin/insurers-analytics"
            element={
              <RouteGuard allowedRoles={['manager', 'admin', 'finance']}>
                <InsurerAnalyticsPage />
              </RouteGuard>
            }
          />
          <Route
            path="admin/products-analytics"
            element={
              <RouteGuard allowedRoles={['manager', 'admin']}>
                <ProductAnalyticsPage />
              </RouteGuard>
            }
          />
          <Route
            path="admin/lost-leads"
            element={
              <RouteGuard allowedRoles={['manager', 'admin']}>
                <LostLeadIntelligencePage />
              </RouteGuard>
            }
          />
          <Route
            path="admin/models"
            element={
              <RouteGuard allowedRoles={['manager', 'admin']}>
                <ModelMonitoringPage />
              </RouteGuard>
            }
          />

          {/* Settings */}
          <Route
            path="settings"
            element={
              <RouteGuard allowedRoles={['admin', 'manager', 'compliance']}>
                <AdminPanelPage />
              </RouteGuard>
            }
          />
        </Route>

        {/* 3. 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
