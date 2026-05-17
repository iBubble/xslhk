import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getSystemConfigs } from '../lib/config';

export const metadata = {
  title: '星势力航空科技',
  description: '云南星势力航空科技有限公司官网',
  icons: {
    icon: '/images/fav.png',
  },
};

export default async function RootLayout({ children }) {
  const configs = await getSystemConfigs();

  return (
    <html lang="zh-CN">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header logoUrl={configs.logo_url} />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer configs={configs} />
      </body>
    </html>
  );
}
