// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute';
// import Home from './pages/Home';
// import About from './pages/About';
// import Services from './pages/Services';
// import Training from './pages/Training';
// import Shop from './pages/Shop';
// import Contact from './pages/Contact';
// import Login from './pages/auth/Login';
// import SignUp from './pages/auth/SignUp';
// import Dashboard from './pages/Dashboard';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import MyCart from './pages/MyCart';

// function AppContent() {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-grow">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/services" element={<Services />} />
//           <Route path="/training" element={<Training />} />
//           <Route path="/shop" element={<Shop />} />
          
//           {/* ---> NEW CART ROUTE ADDED HERE <--- */}
//           <Route 
//             path="/cart" 
//             element={
//               <ProtectedRoute>
//                 <MyCart />
//               </ProtectedRoute>
//             } 
//           />

//           <Route path="/contact" element={<Contact />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<SignUp />} />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute adminOnly>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </main>
//       <Footer />
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppContent />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;