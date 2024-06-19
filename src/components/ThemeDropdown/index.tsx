import { useEffect, useState } from 'react';
import Dropdown from '../Dropdown';
import { useTheme } from 'next-themes';

export function ThemeDropdown() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<Dropdown
			className='h-10 mobile:w-16 tablet:w-32 desktop:w-32'
			name='theme'
			value={theme}
			options={[
				{ label: '◑ System', value: 'system' },
				{ label: '○ Light', value: 'light' },
				{ label: '● Dark', value: 'dark' },
			]}
			onChange={(name, value) => setTheme(value)}
		/>
	);
}
