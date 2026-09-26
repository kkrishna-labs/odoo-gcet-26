import { Outlet } from 'react-router';
import Header from '../components/layout/Header.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="w-full px-4 py-7 sm:px-6 lg:px-10 xl:px-14 fade-in">
        <Outlet />
      </main>
    </div>
  );
}
