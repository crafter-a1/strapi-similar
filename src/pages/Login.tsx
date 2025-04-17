
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // Set up form with react-hook-form and zod validation
  const formMethods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Check if already authenticated on mount
  React.useEffect(() => {
    const token = localStorage.getItem('cms_token');
    if (token) {
      console.log('Already have token, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log('Attempting login with:', data.username);

    try {
      console.log('Making login API call to backend...');
      const response = await authApi.login(data.username, data.password);
      console.log('Login API response:', response.data);

      // The backend returns { accessToken: "token_value" }
      if (!response.data || !response.data.accessToken) {
        throw new Error('Invalid response: Missing token');
      }

      // Create a user object from the token (in a real app, you might want to decode the JWT)
      const user = {
        id: data.username, // Using username as ID for now
        username: data.username,
        email: '' // We don't have this from the login response
      };

      // Save token and user info
      console.log('Saving token to auth store and localStorage');
      login(response.data.accessToken, user);

      // Also save to localStorage directly for debugging
      localStorage.setItem('cms_token', response.data.accessToken);

      // Verify token was stored correctly
      const storedToken = localStorage.getItem('cms_token');
      console.log('Login successful, token stored:', storedToken ? 'Yes' : 'No');
      console.log('Token format valid:', storedToken?.includes('.') && storedToken?.split('.').length === 3 ? 'Yes' : 'No');

      toast({
        title: 'Login successful',
        description: 'Welcome back to the CMS',
      });

      sonnerToast.success('Login successful', {
        description: 'Welcome back to the CMS'
      });

      // Small delay before navigation to ensure token is stored
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage = error.response?.data?.message ||
                          (error.message || 'Unable to connect to the server');

      console.log('Login failed:', errorMessage);

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });

      sonnerToast.error('Login failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex justify-center mb-6">
            <div className="flex items-center rounded-lg bg-primary p-2 text-primary-foreground">
              <Database className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Content CMS</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={formMethods.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formMethods.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
