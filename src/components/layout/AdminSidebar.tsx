import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Thermometer,
  Activity,
  Pill,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Thermometer, label: 'Symptoms', path: '/admin/symptoms' },
    { icon: Activity, label: 'Diseases', path: '/admin/diseases' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: FileText, label: 'Consultations', path: '/admin/consultations' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-sidebar-primary" />
              <span className="font-serif text-lg font-semibold text-sidebar-foreground">
                Admin
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Admin Info */}
        {!isCollapsed && (
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sidebar-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-accent truncate">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
