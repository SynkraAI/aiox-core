interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div
      className="w-full h-1 rounded-full bg-cria-bg-elevated overflow-hidden"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className="h-full bg-cria-accent rounded-full"
        style={{
          width: `${percentage}%`,
          transition: 'width 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </div>
  );
};

export default ProgressBar;
