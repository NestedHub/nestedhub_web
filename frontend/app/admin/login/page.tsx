// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { authApi } from '@/lib/api/auth';
// import { useAuth } from '@/app/providers/AuthProvider';

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { login } = useAuth();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (error) setError('');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const response = await authApi.login(formData.email, formData.password);
      
//       // Check if we have valid authentication
//       if (!response.access_token || !response.user) {
//         throw new Error('Invalid response from server');
//       }

//       // Verify admin role
//       if (response.user.role !== 'admin') {
//         throw new Error('Access denied. Admin privileges required.');
//       }

//       // Call the login function from AuthProvider
//       await login(response.access_token, response.user);
      
//       // Redirect to dashboard
//       router.replace('/admin/dashboard');
//     } catch (err) {
//       console.error('Admin login error:', err);
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('An unexpected error occurred');
//       }
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-green-800 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
//         <div className="flex justify-center mb-8">
//           <Image 
//             src="/logogreen.png" 
//             alt="NestedHub Logo" 
//             width={200} 
//             height={60} 
//             priority 
//             style={{ width: 'auto', height: 'auto' }}
//           />
//         </div>

//         <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>

//         {error && (
//           <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//               disabled={isLoading}
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//               disabled={isLoading}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full py-2 px-4 rounded-md text-white font-medium ${
//               isLoading
//                 ? 'bg-green-600 cursor-not-allowed'
//                 : 'bg-green-800 hover:bg-green-700'
//             }`}
//           >
//             {isLoading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// } 