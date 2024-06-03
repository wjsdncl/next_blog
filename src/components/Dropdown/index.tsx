'use client';

import { useEffect, useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';

import useDeviceSize from '@/hooks/useDeviceSize';

import SortIcon from '@/../public/icons/ic_sort.svg';

interface Option {
	label: string;
	value: string;
}

interface DropdownProps {
	className?: string;
	name: string;
	value: string;
	options: Option[];
	onChange: (name: string, value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ className = '', name, value, options, onChange }) => {
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

	const classNames = `flex relative justify-between items-center cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 gap-2.5 text-base font-normal leading-6 text-left text-gray-800 ${isOpen ? 'open' : ''} ${className}`;
	const selectedOption = options.find((option) => option.value === value);

	return (
		<div className={classNames} onClick={handleInputClick} onBlur={handleBlur} ref={inputRef}>
			{isMobile ? (
				<div className='relative w-7 h-7'>
					<Image src={SortIcon} alt='정렬' fill />
				</div>
			) : (
				<span>{selectedOption?.label}</span>
			)}
			<span
				className={`transition-transform ${isOpen ? 'transform rotate-0' : 'transform rotate-180'}`}>
				▲
			</span>
			{isOpen && (
				<div className='absolute top-full right-0 left-0 mt-2.5 z-10 transform origin-top transition-transform bg-white rounded-lg border border-gray-200 overflow-hidden'>
					{options.map((option) => {
						const selected = value === option.value;
						const optionClassName = `cursor-pointer p-2 border-b border-gray-200 text-base font-normal leading-6 text-gray-800 ${selected ? 'bg-gray-100' : ''} hover:bg-gray-100`;
						return (
							<div
								className={optionClassName}
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
