import Link from 'next/link';

import '@/styles/globals.css';

import { ThemeDropdown } from '@/components/ThemeDropdown';

const Header = () => {
	return (
		<>
			<header className='min-h-[220px] bg-_white dark:bg-_black'>
				<div className='z-40 mx-auto gap-6 border-b-2 border-solid border-b-gray-600 bg-_white pb-6 pt-16 dark:border-b-gray-300 dark:bg-_black mobile:w-mobile tablet:w-tablet desktop:w-desktop'>
					<div className='flex flex-col gap-10 px-8'>
						<div className='flex flex-row items-center justify-between'>
							<Link href='/' className='z-50'>
								<span className='text-6xl'>wjsdncl Blog</span>
							</Link>

							<div className='flex flex-row gap-4'>
								<ThemeDropdown />
								{/* <button className='w-20 rounded-lg border-2 border-gray-600 px-4 dark:border-gray-400'>
									로그인
								</button> */}
							</div>
						</div>

						<div className='flex h-full w-full items-center'>
							<div className=''>
								<nav>
									<ul className='mx-5 flex gap-4 text-lg font-semibold'>
										<li>
											<Link href='/'>Home</Link>
										</li>

										<li>
											<Link href='/blog'>Blog</Link>
										</li>

										<li>
											<Link href='/about'>About</Link>
										</li>
									</ul>
								</nav>
							</div>
						</div>
					</div>
				</div>
			</header>
		</>
	);
};

export default Header;
