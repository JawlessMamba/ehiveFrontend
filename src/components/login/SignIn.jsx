import { useForm } from "react-hook-form";
import { useSignIn } from "../../../api/client/user";
import { useNavigate } from "react-router-dom";
import { 
  Eye, EyeOff, Lock, Mail, Zap, Shield, Star, Sparkles, Trophy, Rocket, Heart, Award, 
  Laptop, Phone, Smartphone, Cable, Monitor, Server, Wifi, HardDrive, Mouse, Keyboard,
  Database, Router, Cpu, MemoryStick, Printer, Camera, Headphones, Gamepad2,
  Flower, Leaf, Bird, Trees, Feather
} from "lucide-react";
import { useState } from "react";

export default function SignIn() {
  const { register, handleSubmit, reset } = useForm();
  const mutation = useSignIn();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  // Enhanced floating elements with nature and hardware icons
  const floatingElements = [
    // Hardware Icons
    { Icon: Laptop, delay: 0, duration: 18, size: 28, color: "text-blue-400" },
    { Icon: Shield, delay: 1.5, duration: 22, size: 32, color: "text-indigo-400" },
    { Icon: Phone, delay: 3, duration: 20, size: 26, color: "text-cyan-400" },
    { Icon: Monitor, delay: 4.5, duration: 24, size: 30, color: "text-blue-500" },
    { Icon: Server, delay: 6, duration: 19, size: 28, color: "text-indigo-500" },
    { Icon: Smartphone, delay: 7.5, duration: 21, size: 24, color: "text-blue-300" },
    { Icon: Router, delay: 9, duration: 23, size: 26, color: "text-cyan-500" },
    { Icon: HardDrive, delay: 10.5, duration: 20, size: 28, color: "text-indigo-400" },
    { Icon: Database, delay: 12, duration: 22, size: 30, color: "text-blue-400" },
    { Icon: Wifi, delay: 13.5, duration: 18, size: 24, color: "text-cyan-400" },
    { Icon: Cpu, delay: 15, duration: 25, size: 28, color: "text-indigo-500" },
    { Icon: Cable, delay: 16.5, duration: 19, size: 22, color: "text-blue-500" },
    { Icon: Mouse, delay: 18, duration: 21, size: 24, color: "text-cyan-400" },
    { Icon: Keyboard, delay: 19.5, duration: 23, size: 26, color: "text-indigo-400" },
    { Icon: MemoryStick, delay: 21, duration: 20, size: 22, color: "text-blue-400" },
    { Icon: Printer, delay: 22.5, duration: 24, size: 28, color: "text-cyan-500" },
    { Icon: Camera, delay: 24, duration: 18, size: 26, color: "text-indigo-500" },
    { Icon: Headphones, delay: 25.5, duration: 22, size: 24, color: "text-blue-500" },
    { Icon: Gamepad2, delay: 27, duration: 21, size: 26, color: "text-cyan-400" },
    
    // Nature Elements
    { Icon: Bird, delay: 2, duration: 25, size: 24, color: "text-emerald-400" },
    { Icon: Bird, delay: 8, duration: 27, size: 26, color: "text-teal-400" },
    { Icon: Bird, delay: 14, duration: 23, size: 22, color: "text-green-400" },
    { Icon: Feather, delay: 5, duration: 26, size: 20, color: "text-emerald-300" },
    { Icon: Feather, delay: 11, duration: 24, size: 22, color: "text-teal-300" },
    { Icon: Feather, delay: 17, duration: 28, size: 24, color: "text-green-300" },
    { Icon: Flower, delay: 7, duration: 29, size: 26, color: "text-pink-400" },
    { Icon: Flower, delay: 13, duration: 22, size: 24, color: "text-rose-400" },
    { Icon: Flower, delay: 19, duration: 26, size: 28, color: "text-pink-300" },
    { Icon: Leaf, delay: 4, duration: 24, size: 22, color: "text-green-400" },
    { Icon: Leaf, delay: 10, duration: 27, size: 24, color: "text-emerald-400" },
    { Icon: Leaf, delay: 16, duration: 25, size: 26, color: "text-teal-400" },
    { Icon: Trees, delay: 12.5, duration: 30, size: 32, color: "text-green-500" },
    { Icon: Trees, delay: 23, duration: 28, size: 30, color: "text-emerald-500" },
    
    // Additional tech elements
    { Icon: Sparkles, delay: 1, duration: 20, size: 24, color: "text-purple-400" },
    { Icon: Rocket, delay: 8.5, duration: 22, size: 28, color: "text-orange-400" },
    { Icon: Award, delay: 15.5, duration: 24, size: 26, color: "text-yellow-400" },
    { Icon: Trophy, delay: 20, duration: 26, size: 28, color: "text-amber-400" },
    { Icon: Star, delay: 26, duration: 21, size: 22, color: "text-yellow-500" }
  ];

  const onSubmit = (data) => {
    mutation.mutate(data, {
      onSuccess: (res) => {
        navigate("/");
        reset();
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      
      {/* Enhanced Floating Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingElements.map(({ Icon, delay, duration, size, color }, i) => (
          <div
            key={`floating-${i}`}
            className={`absolute opacity-25 ${color} will-change-transform`}
            style={{
              top: `${8 + (i * 3.5)}%`,
              left: '-80px',
              animation: `floatAcross ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              animationFillMode: 'both'
            }}
          >
            <Icon size={size} />
          </div>
        ))}
      </div>

      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-8">
        <svg width="80" height="80" className="absolute top-16 left-16 text-indigo-300">
          <circle cx="40" cy="40" r="3" fill="currentColor" />
        </svg>
        <svg width="80" height="80" className="absolute top-32 right-24 text-blue-300">
          <circle cx="40" cy="40" r="3" fill="currentColor" />
        </svg>
        <svg width="80" height="80" className="absolute bottom-32 left-24 text-cyan-300">
          <circle cx="40" cy="40" r="3" fill="currentColor" />
        </svg>
        <svg width="80" height="80" className="absolute bottom-48 right-32 text-emerald-300">
          <circle cx="40" cy="40" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Left Side - Branding */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 lg:px-8">
          <div className="max-w-xl text-center space-y-6">
            
            {/* Logo/Brand Area */}
            <div className="relative">
              <img
                src="/logoo2.png"
                alt="eHIVE Logo"
                className="mx-auto h-40 w-auto mb-6 drop-shadow-2xl"
              />
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
            </div>
            
            {/* Welcome Content */}
            <div className="space-y-6">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent leading-tight">
                <span className="text-4xl lg:text-5xl">Step Into the Hive!</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-md mx-auto">
                Streamlining your IT assets with ease, intelligence, and security. <span className="font-semibold text-blue-600">All your assets. One Hive. Zero hassle.</span>
              </p>

              <div className="flex justify-center items-center space-x-4 text-xs text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Shield className="text-blue-500" size={14} />
                  <span>Ultra-Secure Access</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Zap className="text-indigo-500" size={14} />
                  <span>Real-time</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Laptop className="text-blue-500" size={14} />
                  <span>Smart tracking</span>
                </div>
              </div>
            </div>

            {/* Animated Dots */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 lg:px-8">
          <div className="w-full max-w-sm">
            
            {/* Main Form Container */}
            <div className="relative">
              
              {/* Glassmorphism Form */}
              <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
                
                {/* Form Header */}
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Sign In
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Sign in to access the Hive 🚀
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Email Input */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 text-blue-500 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                      <input
                        type="email"
                        placeholder="you@engro.com"
                        {...register("email", { required: true })}
                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-300 bg-white/90 text-base placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 text-blue-500 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Your Hive Key"
                        {...register("password", { required: true })}
                        className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-300 bg-white/90 text-base placeholder-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors z-10"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="relative group pt-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/40 to-indigo-600/40 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition duration-500"></div>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3.5 rounded-2xl text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {mutation.isPending ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Entering the HIVE...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>Enter the HIVE</span>
                          <Zap size={18} />
                        </span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-slate-50/80 px-3 py-1.5 rounded-full border border-slate-200/50">
                    <Shield size={14} className="text-blue-500" />
                    <span>Protected by enterprise security</span>
                  </div>
                </div>

                {/* Fun Footer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-400">
                    Made with <Heart size={12} className="inline text-red-400" /> by Muhammad Harmain Ansari
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes floatAcross {
          0% {
            transform: translateX(0) translateY(0px) rotate(0deg);
            opacity: 0;
          }
          3% {
            opacity: 0.25;
          }
          97% {
            opacity: 0.25;
          }
          100% {
            transform: translateX(calc(100vw + 80px)) translateY(-20px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .will-change-transform {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}