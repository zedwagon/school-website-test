interface SectionHeaderProps {
  className?: string;
  hasMargin?: boolean;
  title: string;
}

export function SectionHeader({
  title,
  className = "",
  hasMargin = true,
}: SectionHeaderProps) {
  const renderTitle = () => {
    const words = title.trim().split(/\s+/);
    if (words.length <= 1) {
      return <span className="text-red-600">{title}</span>;
    }
    const firstWord = words[0];
    const rest = words.slice(1).join(" ");
    return (
      <>
        <span className="text-gray-900 dark:text-white">{firstWord}</span>{" "}
        <span className="text-red-600">{rest}</span>
      </>
    );
  };

  return (
    <div className={`text-center ${hasMargin ? "mb-16" : ""} ${className}`}>
      <h2 className="mb-4 font-black tracking-tight text-3xl sm:text-5xl">
        {renderTitle()}
      </h2>
    </div>
  );
}
