/**
 * File: admin/layout.tsx
 * Description: This file contains the generic layout for admin dashboart
*/

import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../../../components/admin/sidebar/sidebar';
import '../../../../app/globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body style={{display: 'flex'}}>
        <Sidebar />
        {children}
        <Toaster position='top-center'/>
      </body>
    </html>
  );
}
