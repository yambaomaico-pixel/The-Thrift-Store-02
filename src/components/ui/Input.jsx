const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{label}</label>}
      <input className="input" {...props} />
      {error && <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)' }}>{error}</span>}
    </div>
  );
};

export default Input;
