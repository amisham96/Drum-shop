import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import '../../../app/globals.css'
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import { Toaster } from 'react-hot-toast';
import SetCartCookie from '../../components/setCartCookie/setCartCookie';
import { getUser } from '../../../helpers/auth/getUser';

// add the required fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

// title and description (meta tag) at home page
export const metadata: Metadata = {
  title: 'The Bangalore Drum Shop',
  description: 'Ultimate place to get all your musical instruments',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userData = await getUser();

  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body>
        <Header cart={userData?.cart || null} />

        {/* dummy component to add cookies */}
        <SetCartCookie cart={userData?.cart || null} />

        {children}
        <Toaster position='top-center'/>
        <Footer />
      </body>
    </html>
  );
}
