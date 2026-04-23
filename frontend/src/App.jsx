import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'

// ── Layouts ───────────────────────────────────────────────────────────────────
import Navbar            from './components/Navbar/Navbar'
import Footer            from './pages/Footer'
import ScrollToTopButton from './pages/ScrollToTopButton'

// ── Public pages ──────────────────────────────────────────────────────────────
import Home           from './pages/Home'
import Blog           from './pages/Blog'
import BlogDetail     from './pages/BlogDetail'
import News           from './pages/News'
import NewsDetail     from './pages/NewsDetail'
import Category       from './pages/Category'
import Technology     from './pages/Technology'
import StockDashboard from './pages/StockDashboard'
import Rashifalhome   from './pages/Rashifalhome'   // capitalized import name fixes the JSX warning
import Notfound from './pages/Notfound' 

// ── Auth & Admin ──────────────────────────────────────────────────────────────
import { AuthProvider }  from './context/AuthContext'
import AdminNavbar       from './admin/admincomponents/AdminNavbar'
import AdminLogin        from './admin/AdminLogin'
import ProtectedRoute    from './admin/ProtectedRoute'
import AdminDashboard    from './admin/AdminDashboard'
import NewsList          from './admin/NewsList'
import CreateNews        from './admin/CreateNews'
import Categories        from './admin/Categories'
import BlogList          from './admin/Bloglist'
import CreateBlog        from './admin/Createblog'
import EditBlog          from './admin/EditBlog'
import VideoList         from './admin/Videolist'
import CreateVideo       from './admin/Createvideo'
import AdsList  from './admin/AdsList';
import CreateAd from './admin/CreateAd';

// ── Shared layout wrappers ────────────────────────────────────────────────────
// MainLayout wraps every public page — keeps App.jsx clean
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <ScrollToTopButton />
    {children}
    <Footer />
  </>
)

// AdminLayout includes the sidebar navbar once and renders admin content via outlet
const AdminLayout = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
    <AdminNavbar />
    <main style={{ marginLeft: 260, padding: '24px 20px 40px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Outlet />
    </main>
  </div>
)

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
          <Route path="/blog/:id" element={<MainLayout><BlogDetail /></MainLayout>} />
          <Route path="/news" element={<MainLayout><News /></MainLayout>} />
          <Route path="/news/:id" element={<MainLayout><NewsDetail /></MainLayout>} />
          <Route path="/category/:categoryName" element={<MainLayout><Category /></MainLayout>} />
          <Route path="/technology" element={<MainLayout><Technology /></MainLayout>} />
          <Route path="/stockDashboard" element={<MainLayout><StockDashboard /></MainLayout>} />
          <Route path="/rashifalhome" element={<MainLayout><Rashifalhome /></MainLayout>} />
          <Route path="*" element={<MainLayout><Notfound /></MainLayout>} />
         

          {/* ── Admin login (no layout) ── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Protected admin routes ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index               element={<AdminDashboard />} />
            <Route path="dashboard"    element={<AdminDashboard />} />
            <Route path="news"         element={<NewsList />} />
            <Route path="news/create"  element={<CreateNews />} />
            <Route path="news/:id"     element={<CreateNews />} />
            <Route path="categories"   element={<Categories />} />
            <Route path="blogs"        element={<BlogList />} />
            <Route path="blogs/create" element={<CreateBlog />} />
            <Route path="blogs/:id"    element={<EditBlog />} />
            <Route path="videos"        element={<VideoList />} />
            <Route path="videos/create" element={<CreateVideo />} />
             <Route path="ads"        element={<AdsList />} />
            <Route path="ads/create" element={<CreateAd />} />
<Route path="ads/:id"    element={<CreateAd />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App