/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { 
  Play, 
  Star, 
  Users, 
  Award, 
  Zap, 
  Brain, 
  Target,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  BarChart3,
  Shield
} from 'lucide-react';

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      rating: 5,
      text: "Interview-IQ completely transformed my interview preparation. The AI feedback was incredibly detailed and helped me land my dream job at Google!"
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager at Meta",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "The realistic interview scenarios and instant feedback gave me the confidence I needed. Highly recommend to anyone serious about career growth!"
    },
    {
      name: "Emily Johnson",
      role: "Data Scientist at Netflix",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "Amazing platform! The AI interviewer asks questions just like real interviewers. It's like having a personal interview coach 24/7."
    },
    {
      name: "David Kim",
      role: "DevOps Engineer at Amazon",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      rating: 5,
      text: "The technical interview practice sessions are phenomenal. I went from nervous wreck to confident candidate in just 2 weeks!"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Interviews",
      description: "Experience realistic interview scenarios powered by advanced AI technology"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Detailed Analytics",
      description: "Get comprehensive feedback on your performance with actionable insights"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Practice",
      description: "Tailored questions based on your role, experience level, and industry"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe Environment",
      description: "Practice without pressure in a judgment-free, secure environment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-60 h-60 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-8 animate-bounce">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Interview Practice
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8">
                Master Your 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Dream Interview
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Practice with our AI interviewer, get instant feedback, and land your dream job. 
                Join thousands of professionals who've transformed their interview skills.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-2xl">
                  Continue Practice
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-full text-lg font-semibold border border-white/20 hover:bg-white/20 transition-all">
                  <Play className="inline-block mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start mt-12 space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-400" />
                  50K+ Users
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-400" />
                  98% Success Rate
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  4.9/5 Rating
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl border border-white/10 p-8 shadow-2xl">
                <img 
                  src="https://cdn.dribbble.com/userupload/27415727/file/original-b6a0d494d6ea9043e56dffd584c3a60a.gif" 
                  alt="AI Interview Practice"
                  className="w-full rounded-2xl shadow-lg "
                />
                <div className="absolute top-4 right-4 bg-red-500 rounded-full w-4 h-4 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-1 text-white text-sm">
                  🤖 AI Interviewer Active
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 bg-green-500 rounded-lg p-3 shadow-lg animate-bounce delay-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-500 rounded-lg p-3 shadow-lg animate-bounce delay-700">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Choose Interview-IQ?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our cutting-edge AI technology provides the most realistic interview experience possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-purple-400 mb-4 group-hover:text-purple-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands who've transformed their careers with Interview-IQ
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 lg:p-12 shadow-2xl">
              <div className="flex items-center mb-6">
                <img 
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full mr-4 border-2 border-purple-500"
                />
                <div>
                  <h4 className="text-xl font-semibold text-white">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-purple-300">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl text-gray-300 leading-relaxed italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-purple-500 w-8' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join over 50,000 professionals who've landed their dream jobs with Interview-IQ
          </p>
          <button className="group px-10 py-4 bg-white text-purple-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
            Start Your Free Practice Now
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-purple-200 mt-4">No credit card required • 3 free practice sessions</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Interview-IQ</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering professionals worldwide to master their interview skills with AI-powered practice sessions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2025 Interview-IQ. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-purple-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-purple-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}