import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GraduationCap, Target, Heart, Lightbulb, Users, Award, Sparkles, Rocket } from 'lucide-react';
import { getServerUrl, createClient, getAnonKey } from '../utils/supabase/client';
import logoImage from 'figma:asset/e6d79e8861bd18ad0650862c9dc2b4cc7c09cf38.png';
import { ThemeToggle } from './ThemeToggle';

interface AboutPageProps {
  onNavigateToHome: () => void;
  onNavigateToLogin: () => void;
}

export function AboutPage({ onNavigateToHome, onNavigateToLogin }: AboutPageProps) {
  const [content] = useState({
    pageTitle: 'Tentang FreeLearning',
    pageSubtitle: 'FreeLearning adalah platform pendidikan HCI interaktif yang direka untuk merevolusi cara pelajar mempelajari Interaksi Manusia-Komputer. Dibina dengan teknologi web moden dan dikuasakan oleh AI, kami menyediakan pengalaman pembelajaran komprehensif yang menggabungkan kurikulum berstruktur dengan penglibatan interaktif.',
    missionTitle: 'Misi Kami',
    missionDescription: 'Misi kami adalah untuk menjadikan pendidikan HCI mudah diakses, menarik, dan berkesan untuk semua orang.',
    missionContent: 'Kami percaya bahawa pembelajaran harus interaktif, kolaboratif, dan diperibadikan mengikut keperluan setiap pelajar.',
    differenceTitle: 'Apa Yang Membezakan Kami',
    technologyTitle: 'Teknologi Termaju',
    technologyDescription: 'Platform kami dibina menggunakan teknologi terkini termasuk React, Supabase, dan ciri berkuasa AI untuk menyampaikan pengalaman pembelajaran moden.',
    capabilitiesTitle: 'Keupayaan Platform',
    teachersTitle: 'Untuk Guru',
    teachersDescription: 'Berikan kuasa kepada pelajar anda dengan alat untuk mencipta dan mengurus bahan pembelajaran, mereka bentuk penilaian tersuai, menjejaki kemajuan pelajar secara masa nyata, dan mengurus forum perbincangan.',
    studentsTitle: 'Untuk Pelajar',
    studentsDescription: 'Belajar HCI dengan mudah dan cekap melalui bahan pembelajaran interaktif, kuiz menarik dengan maklum balas segera, pembantu pembelajaran berkuasa AI, dan forum perbincangan kolaboratif.',
    aboutCtaTitle: 'Sertai Kami',
    aboutCtaSubtitle: 'Alami masa depan pendidikan HCI'
  });

  const values = [
    {
      icon: Target,
      title: 'Berpusatkan Pelajar',
      description: 'Segala yang kami bina direka dengan mengutamakan pengalaman pembelajaran pelajar.'
    },
    {
      icon: Heart,
      title: 'Pengajaran Bersemangat',
      description: 'Kami memberi kuasa kepada guru dengan alat untuk mencipta pengalaman pembelajaran yang menarik dan berkesan.'
    },
    {
      icon: Lightbulb,
      title: 'Inovasi',
      description: 'Memanfaatkan teknologi terkini untuk menjadikan pembelajaran lebih interaktif dan berkesan.'
    },
    {
      icon: Users,
      title: 'Komuniti',
      description: 'Membina persekitaran kolaboratif di mana pelajar dan guru belajar bersama.'
    }
  ];

  const stats = [
    { label: 'Pelajaran Interaktif', value: '100+' },
    { label: 'Kuiz Latihan', value: '500+' },
    { label: 'Topik Pembelajaran', value: '50+' },
    { label: 'Bantuan Berkuasa AI', value: '24/7' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateToHome}>
              <img src={logoImage} alt="FreeLearning Logo" className="h-10" />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle showLabels={false} variant="ghost" size="icon" />
              <Button variant="ghost" onClick={onNavigateToHome}>
                Laman Utama
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl text-indigo-900 dark:text-indigo-300 mb-6">
            {content.pageTitle}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            {content.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 border-0 text-white">
            <CardHeader>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-3xl text-white">{content.missionTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-indigo-100 leading-relaxed">
                {content.missionDescription}
              </p>
              <p className="text-lg text-indigo-100 leading-relaxed">
                {content.missionContent}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="text-4xl text-indigo-600 dark:text-indigo-400 mb-2">
                    {stat.value}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl text-center text-gray-900 dark:text-white mb-4">
            {content.differenceTitle}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Prinsip yang membimbing segala yang kami lakukan
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-gray-900 dark:text-white mb-4">
              {content.technologyTitle}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {content.technologyDescription}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>{content.teachersTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  {content.teachersDescription}
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                    <span>Cipta dan urus bahan pembelajaran</span>
                  </li>
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                    <span>Reka bentuk kuiz dan penilaian tersuai</span>
                  </li>
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                    <span>Jejaki kemajuan pelajar secara masa nyata</span>
                  </li>
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                    <span>Urus forum perbincangan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>{content.studentsTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  {content.studentsDescription}
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                    <span>Bahan pembelajaran interaktif</span>
                  </li>
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                    <span>Kuiz menarik dengan maklum balas segera</span>
                  </li>
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                    <span>Pembantu pembelajaran berkuasa AI</span>
                  </li>
                  <li className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                    <span>Forum perbincangan kolaboratif</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl text-gray-900 dark:text-white mb-6">
            {content.aboutCtaTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {content.aboutCtaSubtitle}
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={onNavigateToLogin}>
              Mulakan Sekarang
            </Button>
            <Button size="lg" variant="outline" onClick={onNavigateToHome}>
              Kembali ke Laman Utama
            </Button>
          </div>
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