const NotFoundPage = () => {
	return (
		<main className='min-h-screen bg-_white dark:bg-_black'>
			<article className='desktop:w-desktop tablet:w-tablet mobile:w-mobile mx-auto flex items-center justify-center py-40'>
				<span className='text-3xl'>해당 페이지를 찾을 수 없습니다!</span>
			</article>
		</main>
	);
};

export default NotFoundPage;
