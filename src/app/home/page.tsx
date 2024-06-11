'use client';

import Dropdown from '@/components/Dropdown';
import Image from 'next/image';
import { useState } from 'react';

export default function HomePage() {
	return (
		<main className='min-h-screen bg-_white dark:bg-_black'>
			<article className='desktop:w-desktop tablet:w-tablet mobile:w-mobile mx-auto my-0 min-h-screen bg-_white dark:bg-_black'>
				<span className=''>홈페이지입니다</span>
			</article>
		</main>
	);
}
