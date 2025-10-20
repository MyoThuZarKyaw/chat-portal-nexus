import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { loginSchema } from '@/lib/validation';
import { z } from 'zod';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate inputs
    try {
      loginSchema.parse({ username, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { username?: string; password?: string } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as 'username' | 'password';
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      await login(username.trim(), password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
      navigate('/chat');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid username or password';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-[hsl(250,70%,3%)]">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 gap-3">
          <div className="bg-primary p-3 rounded-2xl shadow-[var(--shadow-glow)]">
            <MessageCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ChatHub
          </h1>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-[var(--shadow-elevation)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your chats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  required
                  className={`bg-input border-border ${errors.username ? 'border-destructive' : ''}`}
                  maxLength={150}
                />
                {errors.username && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                  className={`bg-input border-border ${errors.password ? 'border-destructive' : ''}`}
                  maxLength={128}
                />
                {errors.password && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Connect with your team in real-time
        </p>
      </div>
    </div>
  );
};

export default Login;
