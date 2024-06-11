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
					DEFAULT: 'hsl(0, 0%, 7%)',
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
		},
	},
	plugins: [require('@tailwindcss/typography')],
	darkMode: 'class',
};
export default config;
