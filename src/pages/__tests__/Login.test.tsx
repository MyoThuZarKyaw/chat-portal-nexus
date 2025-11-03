import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { loginSchema } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

// Mock the validation schema
vi.mock('@/lib/validation', () => ({
  loginSchema: {
    parse: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MessageCircle: () => <div data-testid="message-circle">MessageCircle</div>,
  AlertCircle: () => <span data-testid="alert-circle">AlertCircle</span>,
}));

// Mock the Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

// Mock the Button and Input components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <button {...props} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: { [key: string]: any }) => (
    <input data-testid="input" {...props} />
  ),
}));

// Mock the Label component
vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <label {...props} data-testid="label">
      {children}
    </label>
  ),
}));

describe('Login Component', () => {
  const mockLogin = vi.fn().mockResolvedValue({});
  const mockToast = vi.fn();

  beforeAll(() => {
    // Mock console.error to avoid unnecessary error logs during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks
    useAuth.mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      token: null,
      userId: null,
      isAuthenticated: false,
    });

    useToast.mockReturnValue({
      toast: mockToast,
    });
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('renders login form with all required elements', () => {
    renderLogin();
    
    // Check for main elements
    expect(screen.getByTestId('message-circle')).toBeInTheDocument();
    expect(screen.getByText('ChatHub')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Connect with your team in real-time')).toBeInTheDocument();
  });

  it('handles username and password input changes', () => {
    renderLogin();
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
    
    expect(usernameInput).toHaveValue('admin');
    expect(passwordInput).toHaveValue('Password@123');
  });

  it('calls login function with correct credentials on form submission', async () => {
    const testUser = {
      username: 'admin',
      password: 'Password@123',
    };

    mockLogin.mockResolvedValueOnce({});
    loginSchema.parse.mockReturnValueOnce(testUser);

    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: testUser.username },
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: testUser.password },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginSchema.parse).toHaveBeenCalledWith(testUser);
      expect(mockLogin).toHaveBeenCalledWith(testUser.username.trim(), testUser.password);
    });
  });

  it('shows success toast and navigates on successful login', async () => {
    const testUser = {
      username: 'admin',
      password: 'Password@123',
    };

    mockLogin.mockResolvedValueOnce({});
    loginSchema.parse.mockReturnValueOnce(testUser);

    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: testUser.username },
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: testUser.password },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });

  it('shows error toast when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    loginSchema.parse.mockReturnValueOnce({
      username: 'wronguser',
      password: 'wrongpass',
    });

    renderLogin();
    
    // Fill in the form with incorrect credentials
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'wronguser' },
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpass' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    });
  });

});
