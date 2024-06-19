import { table } from 'console';
import _ from 'lodash';
import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			fontFamily: {
				pretendard: ['var(--font-pretendard)'],
			},
			colors: {
				_white: {
					DEFAULT: 'hsl(210, 40%, 95%)',
				},
				_black: {
					DEFAULT: '#212121',
				},
				_gray: {
					DEFAULT: 'hsl(0, 0%, 50%)',
					100: 'hsl(0, 0%, 90%)',
					200: 'hsl(0, 0%, 80%)',
					300: 'hsl(0, 0%, 70%)',
					400: 'hsl(0, 0%, 60%)',
					500: 'hsl(0, 0%, 50%)',
					600: 'hsl(0, 0%, 40%)',
					700: 'hsl(0, 0%, 30%)',
					800: 'hsl(0, 0%, 20%)',
					900: 'hsl(0, 0%, 10%)',
				},
				primary: {
					DEFAULT: 'hsl(270, 100%, 80%)',
					50: 'hsl(269, 92%, 95%)',
					100: 'hsl(269, 91%, 88%)',
					200: 'hsl(272, 100%, 85%)',
					300: 'hsl(270, 100%, 80%)',
					400: 'hsl(267, 95%, 76%)',
					500: 'hsl(270, 20%, 30%)',
					600: 'hsl(270, 20%, 25%)',
					700: 'hsl(270, 20%, 20%)',
					800: 'hsl(270, 20%, 15%)',
					900: 'hsl(270, 20%, 10%)',
				},
			},
			width: {
				mobile: '360px',
				tablet: '760px',
				desktop: '1200px',
			},
			screens: {
				mobile: '375px',
				tablet: '768px',
				desktop: '1280px',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
	darkMode: 'class',
};
export default config;
