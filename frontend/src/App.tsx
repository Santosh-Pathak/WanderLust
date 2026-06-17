import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import HomePage from '@/pages/home-page';
import AddBlog from '@/pages/add-blog';
import DetailsPage from '@/pages/details-page';
import SignIn from '@/pages/signin-page';
import SignUp from '@/pages/signup-page';
import DashboardPage from '@/pages/dashboard-page';
import AdminPage from '@/pages/admin-page';
import ScrollToTop from '@/components/scroll-to-top';
import Footer from '@/layouts/footer-layout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Routes>
            <Route path="/">
              <Route index element={<HomePage />} />
              <Route path="add-blog" element={<AddBlog />} />
              <Route path="details-page/:title/:postId" element={<DetailsPage />} />
              <Route path="signin" element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
