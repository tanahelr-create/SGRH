import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';

export default function AppShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 min-w-0 min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
