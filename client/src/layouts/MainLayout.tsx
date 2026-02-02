import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { VirtualCursor } from '../components/VirtualCursor';

export const MainLayout = () => {
  return (
    <div className="main-layout">
      <VirtualCursor />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
