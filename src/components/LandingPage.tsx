import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, BookOpen, Target, Users, MessageSquare } from 'lucide-react';
import { getServerUrl, createClient, getAnonKey } from '../utils/supabase/client';
import logoImage from 'figma:asset/e6d79e8861bd18ad0650862c9dc2b4cc7c09cf38.png';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToAbout: () => void;
}

export function LandingPage({ onNavigateToLogin, onNavigateToAbout }: LandingPageProps) {
  const [content] = useState({
    heroTitle: 'Selamat Datang ke FreeLearning',
    heroSubtitle: 'Platform pembelajaran HCI interaktif anda',
    featuresTitle: 'Ciri-ciri Platform',
    featuresSubtitle: 'Terokai ciri-ciri utama platform kami',
    howItWorksTitle: 'Bagaimana Ia Berfungsi',
    ctaTitle: 'Mulakan Sekarang',
    ctaSubtitle: 'Sertai komuniti kami dan mula belajar hari ini'
  });

  const features = [
    {
      icon: BookOpen,
      title: 'Bahan Pembelajaran Interaktif',
      description: 'Akses bahan pembelajaran HCI yang komprehensif dengan latihan interaktif dan contoh dunia sebenar.'
    },
    {
      icon: Target,
      title: 'Penilaian & Kuiz',
      description: 'Uji pengetahuan anda dengan kuiz menarik dan jejaki kemajuan anda dari masa ke masa.'
    },
    {
      icon: Users,
      title: 'Bilik Darjah Dipandu Guru',
      description: 'Guru boleh mengurus bahan, mencipta penilaian, dan memantau kemajuan pelajar.'
    },
    {
      icon: MessageSquare,
      title: 'Forum Perbincangan',
      description: 'Bekerjasama dengan rakan sebaya dan pengajar melalui forum perbincangan interaktif.'
    },
    {
      icon: GraduationCap,
      title: 'Penjejakan Kemajuan',
      description: 'Pantau perjalanan pembelajaran anda dengan analitik terperinci dan pandangan prestasi.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="FreeLearning Logo" className="h-10" />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle showLabels={false} variant="ghost" size="icon" />
              <Button variant="ghost" onClick={onNavigateToAbout}>
                Tentang
              </Button>
              <Button onClick={onNavigateToLogin}>
                Log Masuk
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl text-indigo-900 dark:text-indigo-300 mb-6">
            {content.heroTitle}
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            {content.heroSubtitle}
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={onNavigateToLogin}>
              {content.ctaTitle}
            </Button>
            <Button size="lg" variant="outline" onClick={onNavigateToAbout}>
              Ketahui Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl text-center text-gray-900 dark:text-white mb-4">
            {content.featuresTitle}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {content.featuresSubtitle}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl text-center text-gray-900 dark:text-white mb-12">
            {content.howItWorksTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-indigo-600 dark:text-indigo-400">1</span>
                </div>
                <CardTitle>Daftar Akaun</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cipta akaun anda sebagai pelajar atau guru untuk bermula
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-indigo-600 dark:text-indigo-400">2</span>
                </div>
                <CardTitle>Belajar & Berlatih</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Akses bahan pembelajaran dan lengkapkan penilaian interaktif
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-indigo-600 dark:text-indigo-400">3</span>
                </div>
                <CardTitle>Jejaki Kemajuan</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pantau perjalanan pembelajaran anda dan lihat peningkatan anda dari masa ke masa
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 border-0 text-white">
            <CardHeader>
              <CardTitle className="text-3xl text-white">
                {content.ctaTitle}
              </CardTitle>
              <CardDescription className="text-indigo-100 text-lg">
                {content.ctaSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={onNavigateToLogin}
                className="bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
              >
                Daftar Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoImage} alt="FreeLearning Logo" className="h-8" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © 2025 FreeLearning. Platform Pendidikan HCI Interaktif.
          </p>
        </div>
      </footer>
    </div>
  );
}