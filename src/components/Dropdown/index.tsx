'use client';

import { useEffect, useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';

import useDeviceSize from '@/hooks/useDeviceSize';

interface Option {
	label: string;
	value: string;
}

interface DropdownProps {
	className?: string;
	name: string;
	value: string | undefined;
	options: Option[];
	onChange: (name: string, value: string) => void;
	image?: string;
}

/**
 * Dropdown 컴포넌트
 * @param {string} className - 커스텀 클래스
 * @param {string} name - 드롭다운 이름
 * @param {string} value - 드롭다운 값
 * @param {Option[]} options - 드롭다운 옵션
 * @param {(name: string, value: string) => void} onChange - 드롭다운 값 변경 이벤트
 * @return {React.ReactElement}
 * @example
 * <Dropdown
 *  className='w-40'
 *  name='sort'
 *  value={order}
 *  options={[
 * 		{ label: '오름차순', value: 'asc' },
 * 		{ label: '내림차순', value: 'desc' },
 * 	]}
 * 	onChange={(name, value) => setOrder(value)}
 * />
 */
const Dropdown: React.FC<DropdownProps> = ({
	className = '',
	name,
	value,
	options,
	onChange,
	image,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLDivElement | null>(null);

	const deviceSize = useDeviceSize();
	const isMobile = deviceSize === 'mobile';

	const handleInputClick = () => {
		setIsOpen((prevIsOpen) => !prevIsOpen);
	};

	const handleBlur = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (e: Event) => {
			if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		window.addEventListener('click', handleClickOutside);
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const selectedOption = options.find((option) => option.value === value);

	const selectedIcon =
		selectedOption?.value === 'system' ? '◑' : selectedOption?.value === 'light' ? '○' : '●';

	return (
		<div
			className={`relative flex cursor-pointer items-center justify-between gap-2.5 rounded-lg border border-solid border-gray-700 p-2.5 text-left text-base font-normal leading-6 ${isOpen ? 'open' : ''} ${className}`}
			onClick={handleInputClick}
			onBlur={handleBlur}
			ref={inputRef}>
			{isMobile ? (
				image ? (
					<div className='relative h-7 w-7'>
						<Image src={image} alt='이미지' fill />
					</div>
				) : (
					<span>{selectedIcon}</span>
				)
			) : (
				<span>{selectedOption?.label}</span>
			)}
			<span
				className={`transition-transform ${isOpen ? 'rotate-0 transform' : 'rotate-180 transform'}`}>
				▲
			</span>
			{isOpen && (
				<div className='absolute left-0 right-0 top-full z-10 mt-2.5 origin-top transform overflow-hidden rounded-lg border border-solid border-gray-700 bg-_white transition-transform dark:bg-_black mobile:w-28'>
					{options.map((option) => {
						const selected = value === option.value;
						return (
							<div
								className={`cursor-pointer border-b border-solid border-gray-700 p-2 text-base font-normal leading-6 ${selected ? 'bg-gray-300 dark:bg-gray-500' : ''} hover:bg-gray-200 dark:hover:bg-gray-600`}
								key={option.value}
								onClick={() => onChange(name, option.value)}>
								{option.label}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
