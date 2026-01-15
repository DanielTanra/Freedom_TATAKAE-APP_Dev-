import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { BookOpen, ClipboardList, Users, MessageSquare, Bot, FileCheck, BarChart, Award, Settings, LogOut } from 'lucide-react';

interface HelpPageProps {
  userRole: 'teacher' | 'student';
}

export function HelpPage({ userRole }: HelpPageProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Bantuan & Dokumentasi</CardTitle>
          <CardDescription>
            Pelajari cara menggunakan FreeLearning dengan berkesan. Cari arahan dan maklumat tentang fungsi penting platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Selamat Datang ke FreeLearning!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              FreeLearning adalah platform pembelajaran interaktif yang direka untuk pendidikan HCI. 
              {userRole === 'teacher' 
                ? ' Sebagai guru, anda boleh mencipta dan mengurus bahan pembelajaran, penilaian, menjejak kemajuan pelajar, dan memudahkan perbincangan.'
                : ' Sebagai pelajar, anda boleh mengakses bahan pembelajaran, mengambil penilaian, menjejak kemajuan anda, dan berhubung dengan rakan dan tutor AI anda.'}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {userRole === 'teacher' ? (
              <>
                <AccordionItem value="materials">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Pengurusan Bahan</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Cipta, edit, dan atur bahan pembelajaran untuk pelajar anda.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Klik "Tambah Bahan" untuk mencipta kandungan baru</li>
                      <li>Isikan tajuk, kandungan, dan URL video pilihan</li>
                      <li>Tandakan bahan sebagai "Lulus" untuk menjadikannya kelihatan kepada pelajar</li>
                      <li>Gunakan editor teks kaya untuk memformat kandungan anda</li>
                      <li>Edit atau padam bahan menggunakan butang tindakan</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="assessments">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Penilaian & Kuiz</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Cipta penilaian untuk menilai pemahaman pelajar.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Klik "Cipta Penilaian" untuk memulakan kuiz baru</li>
                      <li>Tambahkan soalan aneka pilihan atau benar/salah</li>
                      <li>Tetapkan jawapan yang betul untuk setiap soalan</li>
                      <li>Tugaskan penilaian kepada kelas tertentu jika perlu</li>
                      <li>Terbitkan penilaian untuk menjadikannya tersedia untuk pelajar</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="results">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Keputusan Penilaian & Maklum Balas</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Semak penyerahan pelajar dan berikan maklum balas.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Lihat semua penyerahan pelajar dengan markah</li>
                      <li>Klik pada penyerahan untuk melihat jawapan terperinci</li>
                      <li>Berikan maklum balas bertulis untuk setiap penyerahan</li>
                      <li>Jejak pelajar yang telah melengkapkan setiap penilaian</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="progress">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Penjejakan Kemajuan Pelajar</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Pantau kemajuan individu dan seluruh kelas pelajar.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Lihat metrik prestasi kelas keseluruhan</li>
                      <li>Jejak kemajuan pelajar individu</li>
                      <li>Kenal pasti pelajar yang mungkin memerlukan sokongan tambahan</li>
                      <li>Eksport laporan kemajuan untuk analisis</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="classes">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Pengurusan Kelas</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Atur pelajar ke dalam kelas dan bandingkan prestasi kelas.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cipta kelas baru untuk kumpulan pelajar yang berbeza</li>
                      <li>Tugaskan pelajar kepada kelas tertentu</li>
                      <li>Tugaskan bahan dan penilaian kepada kelas</li>
                      <li>Bandingkan prestasi merentasi kelas yang berbeza</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="content">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Editor Kandungan & Penyerahan Pengguna</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Semak dan luluskan bahan pembelajaran yang diserahkan oleh pelajar.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Lihat semua bahan yang diserahkan pengguna yang menunggu kelulusan</li>
                      <li>Semak kandungan untuk kualiti dan relevansi</li>
                      <li>Luluskan bahan untuk menjadikannya kelihatan kepada semua pelajar</li>
                      <li>Tolak atau minta edit untuk bahan yang memerlukan penambahbaikan</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </>
            ) : (
              <>
                <AccordionItem value="learn">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Bahan Pembelajaran</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Akses dan kaji bahan pembelajaran HCI.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Semak bahan pembelajaran yang tersedia</li>
                      <li>Klik pada bahan untuk melihat kandungan penuh</li>
                      <li>Tonton video terbenam apabila tersedia</li>
                      <li>Cipta bahan anda sendiri untuk berkongsi dengan orang lain</li>
                      <li>Bahan yang anda cipta akan disemak oleh guru sebelum diterbitkan</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="practice">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Amalan & Ambil Penilaian</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Uji pengetahuan anda dengan kuiz dan penilaian.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Lihat penilaian yang tersedia yang ditugaskan kepada anda</li>
                      <li>Klik "Ambil Penilaian" untuk memulakan kuiz</li>
                      <li>Baca setiap soalan dengan teliti dan pilih jawapan anda</li>
                      <li>Serahkan penilaian anda apabila selesai</li>
                      <li>Anda hanya boleh mengambil setiap penilaian sekali sahaja</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="results">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Keputusan Saya</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Lihat markah penilaian dan maklum balas guru anda.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Lihat semua penilaian yang telah anda selesaikan</li>
                      <li>Lihat markah anda untuk setiap penilaian</li>
                      <li>Baca maklum balas dari guru anda</li>
                      <li>Semak jawapan anda untuk belajar dari kesilapan</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="progress">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-indigo-600" />
                      <span className="font-semibold">Kemajuan Saya</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Tujuan:</strong> Jejak kemajuan pembelajaran anda dari masa ke masa.</p>
                    <p><strong>Cara penggunaan:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Lihat metrik prestasi keseluruhan anda</li>
                      <li>Lihat bahan yang telah anda selesaikan</li>
                      <li>Jejak markah penilaian anda dari masa ke masa</li>
                      <li>Kenal pasti bidang yang memerlukan lebih banyak amalan</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}

            <AccordionItem value="ai-tutor">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">Tutor AI</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Tujuan:</strong> Dapatkan bantuan dan penjelasan segera dari pembantu AI.</p>
                <p><strong>Cara penggunaan:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Taip soalan anda dalam kotak sembang</li>
                  <li>Minta penjelasan tentang konsep HCI</li>
                  <li>Minta bantuan dengan topik tertentu</li>
                  <li>Nilaikan respons AI untuk membantu memperbaiki sistem</li>
                  <li>Gunakan soalan yang jelas dan khusus untuk hasil terbaik</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="forum">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">Forum Perbincangan</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Tujuan:</strong> Libatkan diri dalam perbincangan dengan rakan dan pengajar.</p>
                <p><strong>Cara penggunaan:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Klik "Cipta Topik" untuk memulakan perbincangan baru</li>
                  <li>Semak topik sedia ada dan klik untuk melihat butiran</li>
                  <li>Balas topik untuk menyertai perbualan</li>
                  <li>Edit siaran anda sendiri (pelajar hanya boleh edit siaran sendiri, guru boleh memoderasi)</li>
                  <li>Bersikap hormat dan membina dalam perbincangan anda</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profile">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">Tetapan Profil</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Tujuan:</strong> Urus maklumat akaun dan preferensi anda.</p>
                <p><strong>Cara penggunaan:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Perbarui nama paparan anda</li>
                  <li>Tambahkan bio untuk memperkenalkan diri anda</li>
                  <li>Tukar kata laluan anda untuk keselamatan</li>
                  <li>Lihat maklumat akaun anda</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="theme">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">Tetapan Tema</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Tujuan:</strong> Sesuaikan pengalaman visual anda.</p>
                <p><strong>Cara penggunaan:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Klik butang togol tema di pengepala</li>
                  <li>Tukar antara mod cahaya dan gelap</li>
                  <li>Keutamaan anda disimpan secara automatik</li>
                  <li>Tema berterusan merentasi sesi</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logout">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold">Log Keluar</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Tujuan:</strong> Tamatkan sesi anda dengan selamat.</p>
                <p><strong>Cara penggunaan:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Klik butang "Log Keluar" di penjuru kanan atas</li>
                  <li>Anda akan dikembalikan ke halaman utama</li>
                  <li>Sentiasa log keluar pada komputer yang dikongsi</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">Perlukan Lebih Banyak Bantuan?</h3>
            <p className="text-blue-800 dark:text-blue-200">
              Jika anda mempunyai soalan yang tidak diliputi dalam panduan ini, cuba tanya Tutor AI atau siarkan di Forum. 
              {userRole === 'teacher' && ' Anda juga boleh menghubungi pentadbir platform untuk sokongan teknikal.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
