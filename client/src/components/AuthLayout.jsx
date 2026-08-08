import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full -ml-16 -mb-16" />
        <div className="relative z-10">
           <h1 className="text-3xl font-bold tracking-tight">SimuLearn</h1>
           <p className="mt-4 text-indigo-100 text-lg">Immersive Learning Through Simulation</p>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Expert-led Courses</h3>
              <p className="text-indigo-100 text-sm mt-1">Learn from industry professionals with hands-on projects and real-world scenarios.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Certified Learning</h3>
              <p className="text-indigo-100 text-sm mt-1">Earn recognized certificates upon completion to boost your career.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Interactive Labs</h3>
              <p className="text-indigo-100 text-sm mt-1">Practice in real environments with guided labs and instant feedback.</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-indigo-200">
          &copy; {new Date().getFullYear()} SimuLearn. All rights reserved.
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SimuLearn</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Immersive Learning Through Simulation</p>
          </div>
          {title && <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-500 dark:text-gray-400 mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}