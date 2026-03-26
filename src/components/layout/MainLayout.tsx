import { ReactNode } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
