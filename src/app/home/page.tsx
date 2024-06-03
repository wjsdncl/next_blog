'use client';

import Dropdown from '@/components/Dropdown';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
	const [order, setOrder] = useState('recent');
	return (
		<main className='flex min-h-screen flex-col items-center p-24'>
			<span>홈페이지입니다</span>
			<Dropdown
				name='order'
				value={order}
				onChange={(name, value) => setOrder(value)}
				options={[
					{ label: '최신순', value: 'recent' },
					{ label: '좋아요순', value: 'like' },
				]}
			/>
		</main>
	);
}
