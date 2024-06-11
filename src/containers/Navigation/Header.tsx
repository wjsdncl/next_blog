'use client';

import Image from 'next/image';
import Link from 'next/link';

import '@/styles/globals.css';
import SortIcon from '@/../public/icons/ic_sort.svg';

import HeaderSpace from './HeaderSpace';
import { ThemeDropdown } from '@/components/ThemeDropdown';

const Header = () => {
	return (
		<>
			<header className='bg-_white dark:bg-_black fixed top-0 z-40 h-14 w-full border-b-2 border-solid border-b-blue-950'>
				<div className='mx-16 flex h-full min-w-full items-center'>
					<Link href='/' className='z-50'>
						<div className='relative h-7 w-7'>
							<Image src={SortIcon} alt='로고' fill />
						</div>
					</Link>

					<div className=''>
						<nav>
							<ul className='mx-5 flex gap-2'>
								<li>
									<Link href='/'>Home</Link>
								</li>

								<li>
									<Link href='/about'>About</Link>
								</li>
							</ul>
						</nav>
					</div>

					<div>
						<ThemeDropdown />
					</div>
				</div>
			</header>
			<HeaderSpace />
		</>
	);
};

export default Header;
