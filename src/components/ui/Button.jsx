const Button = ({ 
  children, 
  variant = 'primary', // 'primary', 'outline', 'ghost'
  type = 'button',
  className = '',
  isLoading = false,
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' : 
                       variant === 'outline' ? 'btn-outline' : 
                       variant === 'google' ? 'btn-google' : '';
  
  return (
    <button 
      type={type} 
      className={`${baseClass} ${variantClass} ${className}`} 
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
