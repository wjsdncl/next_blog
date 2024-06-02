import { useEffect, useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';

import styles from '@/styles/common/Dropdown.module.css';

import useDeviceSize from '@/hooks/useDeviceSize';

import ic_sort from '@/assets/images/items/ic_sort.svg';

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

	const classNames = `${styles.input} ${isOpen ? styles.opened : ''} ${className}`;
	const selectedOption = options.find((option) => option.value === value);

	return (
		<div className={classNames} onClick={handleInputClick} onBlur={handleBlur} ref={inputRef}>
			{isMobile ? (
				<div className={styles.sort}>
					<Image src={ic_sort} alt='정렬' fill />
				</div>
			) : (
				<span>{selectedOption?.label}</span>
			)}
			<span className={styles.arrow}>▲</span>
			{isOpen && (
				<div className={styles.options}>
					{options.map((option) => {
						const selected = value === option.value;
						const optionClassName = `${styles.option} ${selected ? styles.selected : ''}`;
						return (
							<div
								className={optionClassName}
								key={option.value}
								onClick={() => onChange(name, option.value)}
							>
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
