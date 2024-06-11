'use client';

import Dropdown from '@/components/Dropdown';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
	const [order, setOrder] = useState('recent');

	return (
		<main className='bg-_white dark:bg-_black flex min-h-screen flex-col items-center p-24'>
			<span className=''>홈페이지입니다</span>
			<Dropdown
				className='w-40'
				name='sort'
				value={order}
				options={[
					{ label: '최신순', value: 'recent' },
					{ label: '오래된순', value: 'old' },
				]}
				onChange={(name, value) => setOrder(value)}
			/>
		</main>
	);
}
