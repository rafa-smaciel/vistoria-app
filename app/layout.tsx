import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VistorIA | Inspeção Veicular com IA - ProAgentes',
  description: 'Inspeção veicular automática com inteligência artificial. Checkin por vídeo, checkout por fotos, laudo completo com evidência auditável em menos de 45 segundos. Por vistoria, sem mensalidade.',
  keywords: 'inspeção veicular, vistoria IA, checkin automático, checkout automático, laudo veicular, visão computacional, logística, centro distribuição, ProAgentes, Vega Robotics',
  authors: [{ name: 'Vega Robotics' }],
  openGraph: {
    title: 'VistorIA | Inspeção Veicular com IA',
    description: 'Laudo completo com evidência auditável em menos de 45 segundos. R$ 39,90 por vistoria.',
    url: 'https://vistoria.proagentes.ai',
    siteName: 'VistorIA by ProAgentes',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
