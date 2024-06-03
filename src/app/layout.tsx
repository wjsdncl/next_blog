import type { Metadata } from 'next';
import '@/styles/globals.scss';

import localFont from 'next/font/local';
import Header from '@/containers/Navigation/Header';
import Footer from '@/containers/Navigation/Footer';

const pretendard = localFont({
	src: '../../public/fonts/PretendardVariable.woff2',
	display: 'swap',
	weight: '45 920',
	variable: '--font-pretendard',
});

export const metadata: Metadata = {
	title: '개발 블로그',
	description: 'next.js로 만든 개발 블로그입니다.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ko' className={`${pretendard.variable}`}>
			<body className='font-pretendard'>
				<Header />
				{children}
				<Footer />
			</body>
		</html>
	);
}
