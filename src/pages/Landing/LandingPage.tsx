import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Leaf,
  Brain,
  Heart,
  Shield,
  Stethoscope,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced algorithms analyze your symptoms to provide accurate health insights based on Ayurvedic principles.',
    },
    {
      icon: Leaf,
      title: 'Herbal Recommendations',
      description: 'Receive personalized herbal remedies and natural treatments tailored to your unique constitution.',
    },
    {
      icon: Heart,
      title: 'Holistic Approach',
      description: 'Address mind, body, and spirit with comprehensive lifestyle and dietary recommendations.',
    },
    {
      icon: Shield,
      title: 'Safe & Natural',
      description: 'All recommendations are based on time-tested Ayurvedic practices with no side effects.',
    },
  ];

  const howItWorks = [
    { step: '1', title: 'Create Account', description: 'Sign up and complete your health profile' },
    { step: '2', title: 'Enter Symptoms', description: 'Select your symptoms and health concerns' },
    { step: '3', title: 'Get Analysis', description: 'Receive AI-powered disease prediction' },
    { step: '4', title: 'Follow Remedies', description: 'Implement personalized Ayurvedic treatments' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0 leaf-pattern" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Ayurvedic Health System</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up">
              Discover Your Path to <br />
              <span className="text-herb-light">Natural Wellness</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Experience the wisdom of ancient Ayurveda combined with modern AI technology.
              Get personalized health recommendations based on your unique constitution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/knowledge-base">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Knowledge Base
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose E-Ayurveda?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system combines the best of traditional Ayurvedic medicine with
              cutting-edge AI to provide you with accurate, personalized health guidance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your personalized Ayurvedic health recommendations in just four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Comprehensive Health Services
              </h2>
              <p className="text-muted-foreground mb-8">
                Our platform offers a complete suite of Ayurvedic health services designed
                to address your wellness needs holistically.
              </p>
              <ul className="space-y-4">
                {[
                  'Online symptom analysis and consultation',
                  'AI-assisted disease prediction',
                  'Personalized herbal remedies',
                  'Dietary and lifestyle recommendations',
                  'Yoga and meditation guidance',
                  'Doctor consultation booking',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" asChild>
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-herb/20 p-8">
                <div className="h-full w-full rounded-xl bg-card shadow-elevated flex items-center justify-center">
                  <div className="text-center p-8">
                    <Stethoscope className="h-20 w-20 text-primary mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                      Expert Care
                    </h3>
                    <p className="text-muted-foreground">
                      Backed by Ayurvedic practitioners and modern technology
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-accent/20 animate-float" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-primary/10 animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient relative overflow-hidden" id="contact">
        <div className="absolute inset-0 leaf-pattern opacity-50" />
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Join thousands of users who have discovered the power of personalized
            Ayurvedic health recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-muted/50" id="about">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              About E-Ayurveda
            </h2>
            <p className="text-muted-foreground mb-6">
              E-Ayurveda is an innovative health platform that bridges the gap between
              ancient Ayurvedic wisdom and modern technology. Our mission is to make
              traditional healing accessible to everyone, everywhere.
            </p>
            <p className="text-muted-foreground">
              Founded by a team of Ayurvedic practitioners and technology experts,
              we are committed to providing accurate, personalized health recommendations
              that respect the time-tested principles of Ayurveda while leveraging
              the power of artificial intelligence.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
