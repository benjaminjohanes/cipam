import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, GraduationCap, Briefcase, User, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import cipamLogo from '@/assets/cipam_logo.jpg';

type AppRole = 'student' | 'professional' | 'patient' | 'admin';

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
});

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }).max(100, { message: "Le nom est trop long" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions: { value: AppRole; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'patient', label: 'Usager', description: 'Accédez aux consultations et services', icon: <User className="h-5 w-5" /> },
  { value: 'student', label: 'Étudiant', description: 'Proposez vos services et suivez des formations', icon: <GraduationCap className="h-5 w-5" /> },
  { value: 'professional', label: 'Professionnel', description: 'Offrez vos services et formations', icon: <Briefcase className="h-5 w-5" /> },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  
  const mode = searchParams.get('mode') || 'login';
  const isLogin = mode === 'login';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' }
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      let message = "Erreur lors de la connexion";
      if (error.message.includes('Invalid login credentials')) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message.includes('Email not confirmed')) {
        message = "Veuillez confirmer votre email avant de vous connecter";
      }
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } else {
      toast({ title: "Connexion réussie", description: "Bienvenue sur CIPAM!" });
      navigate('/');
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, data.fullName, selectedRole);
    
    if (error) {
      let message = "Erreur lors de l'inscription";
      if (error.message.includes('already registered')) {
        message = "Cet email est déjà utilisé";
      } else if (error.message.includes('Password')) {
        message = "Le mot de passe ne respecte pas les critères de sécurité";
      }
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } else {
      toast({ 
        title: "Inscription réussie!", 
        description: "Vérifiez votre email pour confirmer votre compte." 
      });
      navigate('/auth?mode=login');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 bg-background">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <img src={cipamLogo} alt="CIPAM" className="h-12 w-12 rounded-lg object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CIPAM</h1>
                <p className="text-sm text-muted-foreground">Centre International de Psychologie</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isLogin 
                ? 'Accédez à votre espace personnel' 
                : 'Rejoignez notre communauté de professionnels et usagers'}
            </p>

            {/* Toggle Login/Register */}
            <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg">
              <button
                onClick={() => navigate('/auth?mode=login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isLogin 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/auth?mode=register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isLogin 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Inscription
              </button>
            </div>

            {isLogin ? (
              /* Login Form */
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    {...loginForm.register('email')}
                    className="mt-1"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <Label className="mb-3 block">Type de compte</Label>
                  <div className="grid gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedRole(option.value)}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                          selectedRole === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          selectedRole === option.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    {...registerForm.register('fullName')}
                    className="mt-1"
                  />
                  {registerForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    {...registerForm.register('email')}
                    className="mt-1"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...registerForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...registerForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Inscription...' : "S'inscrire"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-cipam-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMTZjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Votre bien-être mental, notre priorité
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Rejoignez une communauté de professionnels qualifiés et accédez à des services de psychologie de qualité.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <span>Professionnels certifiés et vérifiés</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span>Formations et services de qualité</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <span>Accompagnement personnalisé</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
