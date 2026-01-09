import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-center p-8">
      <h1 className="text-7xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">404</h1>
      <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Page Not Found</h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <span className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all">Go Home</span>
      </Link>
    </div>
  );
}
