
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Database,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider
} from '@/components/ui/sidebar';

interface CMSLayoutProps {
  children: React.ReactNode;
}

export function CMSLayout({ children }: CMSLayoutProps) {
  const { isAuthenticated, user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState(false);

  // Handle authentication check
  React.useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      console.log('Checking auth status...');

      // Debug: Check localStorage directly
      const localStorageToken = localStorage.getItem('cms_token');
      console.log('Token in localStorage:', localStorageToken ? 'exists' : 'not found');
      console.log('Token in store:', token ? 'exists' : 'not found');

      // Check if we have a token in store
      if (!token) {
        console.log('No token in store, redirecting to login');
        navigate('/login');
        setIsLoading(false);
        return;
      }

      // We have a token, validate format
      try {
        // Simple validation - check if token looks like JWT (has two dots)
        if (typeof token !== 'string' || !token.includes('.') || token.split('.').length !== 3) {
          console.log('Invalid token format, redirecting to login');
          logout();
          navigate('/login');
          return;
        }

        console.log('Token is valid format, user is authenticated');
        setIsAuthed(true);
      } catch (error) {
        console.error('Auth validation error:', error);
        logout();
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token, logout, navigate]);

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out');
    logout();
    toast.info('You have been logged out');
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      title: 'Content-Type Builder',
      icon: Database,
      path: '/content-types',
    },
    {
      title: 'Content Manager',
      icon: FileText,
      path: '/content-manager',
    },
    {
      title: 'Components',
      icon: Layers,
      path: '/components',
    },
    {
      title: 'Media Library',
      icon: Boxes,
      path: '/media-library',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  // Skip layout for auth pages
  if (location.pathname.includes('/login') || location.pathname.includes('/register')) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthed) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
              <Database className="h-6 w-6" />
              <span className="text-xl">Content CMS</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className={`w-full ${
                        location.pathname.includes(item.path) ? 'bg-sidebar-accent' : ''
                      }`}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span>{user?.username || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-destructive hover:text-destructive/80 transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-4 font-semibold">
              {navItems.find((item) => location.pathname.includes(item.path))?.title || 'Dashboard'}
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
