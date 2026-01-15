import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQPageProps {
  userRole: 'teacher' | 'student';
}

export function FAQPage({ userRole }: FAQPageProps) {
  const generalFAQs = [
    {
      question: "Apakah FreeLearning?",
      answer: "FreeLearning adalah platform pembelajaran interaktif yang direka khusus untuk pendidikan HCI (Interaksi Manusia-Komputer). Ia diilhamkan oleh SoloLearn tetapi dibina untuk kegunaan bilik darjah, menyokong kedua-dua guru dan pelajar dengan ciri komprehensif untuk pembelajaran, penilaian, dan kolaborasi."
    },
    {
      question: "Bagaimana saya boleh menetapkan semula kata laluan saya?",
      answer: "Klik pautan 'Lupa Kata Laluan' pada halaman log masuk. Masukkan alamat e-mel anda dan anda akan menerima pautan tetap semula kata laluan. Klik pautan dalam e-mel anda untuk menetapkan kata laluan baru. Pastikan untuk menyemak folder spam anda jika anda tidak melihat e-mel dalam beberapa minit."
    },
    {
      question: "Bolehkah saya bertukar antara mod gelap dan terang?",
      answer: "Ya! Klik butang togol tema di penjuru kanan atas papan pemuka anda (di sebelah butang Log Keluar). Keutamaan tema anda disimpan secara automatik dan akan berterusan merentasi sesi."
    },
    {
      question: "Bagaimana Tutor AI berfungsi?",
      answer: "Tutor AI menggunakan DeepSeek AI melalui OpenRouter untuk memberikan bantuan segera dengan konsep HCI. Hanya taip soalan anda dan AI akan memberikan penjelasan dan panduan. Anda boleh menilai respons untuk membantu memperbaiki sistem."
    },
    {
      question: "Adakah data saya selamat?",
      answer: "Ya! FreeLearning menggunakan Supabase untuk pengesahan selamat dan penyimpanan data. Semua kata laluan disulitkan, dan maklumat peribadi anda dilindungi. Kami tidak pernah berkongsi data anda dengan pihak ketiga."
    },
    {
      question: "Bolehkah saya mengakses FreeLearning pada peranti mudah alih?",
      answer: "Ya! FreeLearning direka untuk responsif dan berfungsi pada komputer desktop, tablet, dan telefon pintar. Walau bagaimanapun, untuk pengalaman terbaik, kami mengesyorkan menggunakan desktop atau tablet untuk mengambil penilaian."
    },
    {
      question: "Pelayar web apa yang disokong?",
      answer: "FreeLearning berfungsi dengan baik pada pelayar moden seperti Chrome, Firefox, Safari, dan Edge. Pastikan pelayar anda dikemas kini untuk pengalaman terbaik."
    }
  ];

  const studentFAQs = [
    {
      question: "Bagaimana saya boleh mengakses bahan pembelajaran?",
      answer: "Klik pada tab 'Belajar' dalam papan pemuka anda untuk melihat semua bahan pembelajaran yang tersedia. Klik pada mana-mana bahan untuk membaca kandungan penuh dan menonton video terbenam jika tersedia."
    },
    {
      question: "Bolehkah saya mencipta bahan pembelajaran saya sendiri?",
      answer: "Ya! Dalam tab 'Belajar', anda boleh klik 'Cipta Bahan' untuk menyerahkan kandungan anda sendiri. Bahan anda akan disemak oleh guru sebelum diterbitkan untuk pelajar lain lihat."
    },
    {
      question: "Bagaimana saya boleh mengambil penilaian?",
      answer: "Pergi ke tab 'Amalan' untuk melihat penilaian yang tersedia. Klik 'Ambil Penilaian' pada mana-mana kuiz untuk memulakan. Baca setiap soalan dengan teliti dan pilih jawapan anda. Sebaik sahaja diserahkan, anda tidak boleh mengambil semula penilaian yang sama."
    },
    {
      question: "Bolehkah saya mengambil semula penilaian?",
      answer: "Tidak, setiap penilaian hanya boleh diambil sekali sahaja. Ini menggalakkan persediaan yang teliti sebelum mengambil kuiz. Gunakan bahan pembelajaran dan Tutor AI untuk belajar sebelum mencuba penilaian."
    },
    {
      question: "Di mana saya boleh melihat gred saya?",
      answer: "Pergi ke tab 'Keputusan Saya' untuk melihat semua penilaian yang anda selesaikan, markah, dan maklum balas guru. Anda juga boleh melihat jawapan terperinci untuk menyemak prestasi anda."
    },
    {
      question: "Bagaimana saya mendapat maklum balas tentang penilaian saya?",
      answer: "Selepas melengkapkan penilaian, guru anda akan menyemak penyerahan anda dan memberikan maklum balas bertulis. Anda boleh melihat maklum balas ini dalam tab 'Keputusan Saya'."
    },
    {
      question: "Bolehkah saya mengedit siaran forum saya?",
      answer: "Ya, anda boleh mengedit siaran forum anda sendiri dengan mengklik butang edit. Walau bagaimanapun, anda tidak boleh mengedit siaran yang dicipta oleh pengguna lain. Guru boleh memoderasi semua siaran."
    },
    {
      question: "Bagaimana saya boleh bertanya soalan?",
      answer: "Anda mempunyai beberapa pilihan: 1) Gunakan Tutor AI untuk bantuan segera, 2) Siarkan di Forum untuk mendapatkan bantuan dari rakan dan guru, atau 3) Tanya guru anda secara langsung semasa kelas."
    }
  ];

  const teacherFAQs = [
    {
      question: "Bagaimana saya boleh mencipta bahan pembelajaran?",
      answer: "Pergi ke tab 'Bahan' dan klik 'Tambah Bahan'. Isikan tajuk, kandungan (dengan format teks kaya), dan secara pilihan tambah URL video. Tandakan bahan sebagai 'Lulus' untuk menjadikannya kelihatan kepada pelajar."
    },
    {
      question: "Bagaimana saya boleh mencipta penilaian?",
      answer: "Navigasi ke tab 'Penilaian' dan klik 'Cipta Penilaian'. Tambahkan soalan (aneka pilihan atau benar/salah), tetapkan jawapan yang betul, dan terbitkan penilaian apabila sudah sedia."
    },
    {
      question: "Bolehkah saya menugaskan penilaian kepada kelas tertentu?",
      answer: "Ya! Semasa mencipta atau mengedit penilaian, anda boleh menugaskannya kepada kelas tertentu. Ini membolehkan anda menyesuaikan kandungan untuk kumpulan pelajar yang berbeza."
    },
    {
      question: "Bagaimana saya boleh memberikan maklum balas kepada pelajar?",
      answer: "Pergi ke tab 'Keputusan' untuk melihat semua penyerahan pelajar. Klik pada penyerahan untuk melihat butiran, kemudian masukkan maklum balas anda dalam kawasan teks yang disediakan. Pelajar akan dapat melihat maklum balas anda dalam tab 'Keputusan Saya' mereka."
    },
    {
      question: "Bagaimana saya boleh mengatur pelajar ke dalam kelas?",
      answer: "Gunakan tab 'Kelas' untuk mencipta kelas baru dan menugaskan pelajar. Anda kemudian boleh menugaskan bahan dan penilaian tertentu kepada setiap kelas dan membandingkan prestasi merentasi kelas yang berbeza."
    },
    {
      question: "Apakah kegunaan Editor Kandungan?",
      answer: "Editor Kandungan (dalam tab 'Kandungan') membolehkan anda menyemak dan meluluskan bahan pembelajaran yang diserahkan oleh pelajar. Ini memastikan kawalan kualiti sambil menggalakkan penyertaan pelajar dalam penciptaan kandungan."
    },
    {
      question: "Bolehkah saya memoderasi perbincangan forum?",
      answer: "Ya! Sebagai guru, anda boleh mengedit mana-mana siaran forum untuk tujuan moderasi. Ini membantu mengekalkan persekitaran pembelajaran yang hormat dan produktif."
    },
    {
      question: "Bagaimana saya boleh menjejak kemajuan pelajar?",
      answer: "Tab 'Kemajuan' menunjukkan metrik terperinci tentang prestasi pelajar, termasuk kadar penyiapan, markah purata, dan kemajuan pelajar individu. Anda boleh menggunakan data ini untuk mengenal pasti pelajar yang mungkin memerlukan sokongan tambahan."
    },
    {
      question: "Bolehkah saya mengeksport data pelajar?",
      answer: "Pada masa ini, anda boleh melihat dan menganalisis data pelajar dalam platform. Untuk keperluan pelaporan tertentu, anda boleh menggunakan ciri Penjejak Kemajuan dan Perbandingan Kelas untuk menjana pandangan."
    }
  ];

  const technicalFAQs = [
    {
      question: "Apa yang perlu saya lakukan jika saya menghadapi ralat?",
      answer: "Cuba muat semula halaman terlebih dahulu. Jika ralat berterusan, log keluar dan log masuk semula. Jika masalah berterusan, kosongkan cache pelayar anda atau cuba pelayar lain. Hubungi pentadbir anda jika masalah berterusan."
    },
    {
      question: "Mengapa saya tidak dapat melihat bahan/penilaian saya?",
      answer: userRole === 'student' 
        ? "Bahan dan penilaian mesti diluluskan oleh guru sebelum ia kelihatan. Jika anda baru sahaja mencipta kandungan, ia mungkin masih dalam semakan."
        : "Jika bahan tidak kelihatan kepada pelajar, semak bahawa ia ditandakan sebagai 'Lulus' dan diterbitkan. Hanya kandungan yang diluluskan kelihatan kepada pelajar."
    },
    {
      question: "Berapa lama sesi saya?",
      answer: "Untuk keselamatan, sesi anda akan kekal aktif selagi anda menggunakan platform. Jika anda tidak aktif untuk tempoh yang panjang, anda mungkin dilog keluar secara automatik. Sentiasa simpan kerja anda dengan kerap!"
    },
    {
      question: "Bolehkah saya mengakses FreeLearning di luar talian?",
      answer: "Tidak, FreeLearning memerlukan sambungan internet untuk berfungsi. Semua data disimpan dengan selamat di awan, jadi anda boleh mengaksesnya dari mana-mana peranti dengan akses internet."
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            <div>
              <CardTitle className="text-3xl">Soalan Lazim</CardTitle>
              <CardDescription>
                Cari jawapan kepada soalan lazim tentang penggunaan FreeLearning
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* General Questions */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Soalan Am</h2>
            <Accordion type="single" collapsible className="w-full">
              {generalFAQs.map((faq, index) => (
                <AccordionItem key={`general-${index}`} value={`general-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Role-Specific Questions */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {userRole === 'student' ? 'Soalan Pelajar' : 'Soalan Guru'}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {(userRole === 'student' ? studentFAQs : teacherFAQs).map((faq, index) => (
                <AccordionItem key={`role-${index}`} value={`role-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Technical Questions */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Soalan Teknikal</h2>
            <Accordion type="single" collapsible className="w-full">
              {technicalFAQs.map((faq, index) => (
                <AccordionItem key={`tech-${index}`} value={`tech-${index}`}>
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-xl font-bold mb-3 text-indigo-900 dark:text-indigo-100">Masih Ada Soalan?</h3>
            <p className="text-indigo-800 dark:text-indigo-200 mb-3">
              Tidak menemui jawapan yang anda cari? Berikut adalah beberapa cara untuk mendapatkan bantuan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-indigo-800 dark:text-indigo-200">
              <li>Tanya Tutor AI - Dapatkan jawapan segera untuk soalan anda</li>
              <li>Siarkan di Forum - Dapatkan bantuan dari komuniti</li>
              {userRole === 'student' && <li>Hubungi guru anda semasa kelas atau waktu pejabat</li>}
              {userRole === 'teacher' && <li>Semak halaman Bantuan untuk dokumentasi terperinci</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
