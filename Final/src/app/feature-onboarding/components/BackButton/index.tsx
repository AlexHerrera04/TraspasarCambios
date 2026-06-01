import arrowLeft from 'src/assets/icons/arrow-left.svg';
const BackButton = (props: any) => {
  const { className, onClick } = props;
  return (
    <span
      className={`${className} flex gap-2 text-base font-semibold cursor-pointer`}
      onClick={onClick}
    >
      <img src={arrowLeft} alt="back-button" />
      Volver
    </span>
  );
};

export default BackButton;
