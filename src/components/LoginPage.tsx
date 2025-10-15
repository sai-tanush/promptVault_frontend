import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, Lock, Sparkles, ArrowRight, Shield } from "lucide-react";

// Define the validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    console.log("Logging in with:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Welcome back!", {
      description: "You have successfully logged in.",
    });
    
    navigate("/dashboard");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden p-4">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400/20 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 12}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-emerald-700/70 text-sm font-medium">Sign in to continue your journey</p>
        </motion.div>

        <Card className="bg-white/80 backdrop-blur-xl border-emerald-200/50 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-emerald-900">Sign In</CardTitle>
            <CardDescription className="text-emerald-700/60">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-emerald-900 text-sm font-semibold">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 z-10 group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="relative pl-11 bg-white/90 border-emerald-200 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 h-12 rounded-lg"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-medium"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-emerald-900 text-sm font-semibold">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 z-10 group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className="relative pl-11 bg-white/90 border-emerald-200 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 h-12 rounded-lg"
                  />
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm font-medium"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  className="relative w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold h-12 rounded-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 group overflow-hidden"
                  disabled={isSubmitting}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 relative z-10">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-3 text-emerald-600 font-medium">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors group"
                >
                  Create a new account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-emerald-700/70"
        >
          <Shield className="w-4 h-4" />
          <span className="font-medium">Protected by enterprise-grade security</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;