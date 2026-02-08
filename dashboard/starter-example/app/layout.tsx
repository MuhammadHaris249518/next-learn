import '@/app/ui/global.css';
import { inter } from './lib/font';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
     
      <body className={`${inter.className} anitaliased`}>{children}</body>
    </html>
  );
}
