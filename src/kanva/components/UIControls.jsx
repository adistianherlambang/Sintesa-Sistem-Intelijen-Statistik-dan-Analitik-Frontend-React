import React from 'react';
import styles from './UIControls.module.css';
import SearchableSelect from '../../components/SearchableSelect/SearchableSelect';

// Row & Col
export const Row = ({ children, gutter, style, className = '', onClick }) => {
  const gap = Array.isArray(gutter) ? `${gutter[1]}px ${gutter[0]}px` : undefined;
  return (
    <div className={`${styles.row} ${className}`} style={{ gap, ...style }} onClick={onClick}>
      {children}
    </div>
  );
};

export const Col = ({ children, span, onClick, style, title, className = '' }) => {
  const width = span ? `${(span / 24) * 100}%` : undefined;
  return (
    <div
      className={`${styles.col} ${className}`}
      onClick={onClick}
      style={{ width, ...style }}
      title={title}
    >
      {children}
    </div>
  );
};

// Flex
export const Flex = ({ children, align, justify, gap, wrap, style = {}, className = '', onClick }) => {
  const flexStyle = {
    display: 'flex',
    alignItems: align,
    justifyContent: justify,
    gap: gap === true ? '8px' : typeof gap === 'number' ? `${gap}px` : gap,
    flexWrap: wrap === true ? 'wrap' : wrap === 'wrap' ? 'wrap' : undefined,
    ...style
  };
  return (
    <div className={`${styles.flex} ${className}`} style={flexStyle} onClick={onClick}>
      {children}
    </div>
  );
};

// Typography
export const Typography = ({ children, style, className = '' }) => {
  return (
    <div className={`${styles.typography} ${className}`} style={style}>
      {children}
    </div>
  );
};

Typography.Text = ({ children, style, className = '', ellipsis }) => {
  // Simplistic ellipsis
  const textStyle = ellipsis ? {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    ...style
  } : style;
  return (
    <span className={`${styles.typography} ${className}`} style={textStyle}>
      {children}
    </span>
  );
};

Typography.Title = ({ children, level = 1, style, className = '' }) => {
  const Tag = level <= 6 ? `h${level}` : 'h1';
  return (
    <Tag className={`${styles.title} ${className}`} style={style}>
      {children}
    </Tag>
  );
};

// Also export Title and Text as standalone if requested
export const Title = Typography.Title;
export const Text = Typography.Text;

export const InputNumber = ({ value, onChange, min, max, style, className = '', addonBefore }) => {
  const handleChange = (e) => {
    const str = e.target.value;
    if (str === '') {
      onChange(undefined);
      return;
    }
    let val = Number(str);
    if (isNaN(val)) return;
    if (min !== undefined && val < min) val = min;
    if (max !== undefined && val > max) val = max;
    onChange(val);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      {addonBefore && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{addonBefore}</span>}
      <input
        type="number"
        className={`${styles.inputNumber} ${className}`}
        value={value ?? ''}
        onChange={handleChange}
        min={min}
        max={max}
      />
    </div>
  );
};

// Input (text input and search input proxy)
export const Input = ({ value, onChange, placeholder, style, className = '' }) => {
  return (
    <input
      type="text"
      className={`${styles.inputNumber} ${className}`}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
    />
  );
};
Input.Search = Input;


// ColorPicker
export const ColorPicker = ({ value, onChange, style }) => {
  const hexValue = typeof value === 'string' ? value : (value?.toHexString?.() || '#000000');
  const handleChange = (e) => {
    const val = e.target.value;
    onChange({
      toHexString: () => val,
      toRgbString: () => val,
    });
  };
  return (
    <div className={styles.colorPickerWrapper} style={style}>
      <input
        type="color"
        className={styles.colorInput}
        value={hexValue}
        onChange={handleChange}
      />
    </div>
  );
};

// Switch
export const Switch = ({ checked, onChange, size }) => {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.sliderRound}></span>
    </label>
  );
};

// Slider
export const Slider = ({ min = 0, max = 100, step = 1, value, onChange, style }) => {
  return (
    <input
      type="range"
      className={styles.slider}
      min={min}
      max={max}
      step={step}
      value={value ?? min}
      onChange={(e) => onChange(Number(e.target.value))}
      style={style}
    />
  );
};

// Select & Option
export const Select = ({ children, value, onChange, style, size = 'small', className = '', options }) => {
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={options}
      style={style}
      size={size}
      className={className}
    >
      {children}
    </SearchableSelect>
  );
};

Select.Option = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

// Button
export const Button = ({
  type = 'default',
  icon,
  children,
  onClick,
  style,
  block,
  disabled,
  className = '',
  size = 'default'
}) => {
  const typeClass = type === 'primary' ? styles.primary : styles.default;
  const blockClass = block ? styles.block : '';
  return (
    <button
      type="button"
      className={`${styles.btn} ${typeClass} ${blockClass} ${className}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {icon && <span className={styles.btnIcon}>{icon}</span>}
      {children}
    </button>
  );
};

// Divider
export const Divider = ({ children, style }) => {
  return (
    <div className={styles.divider} style={style}>
      {children && <span className={styles.dividerText}>{children}</span>}
    </div>
  );
};

// Spin
export const Spin = () => {
  return <div className={styles.spinner} />;
};

// Empty
export const Empty = ({ description }) => {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyText}>{description || 'No Data'}</div>
    </div>
  );
};

// Space
export const Space = ({ children, direction = 'horizontal', size = 8, style = {} }) => {
  return (
    <div
      className={styles.space}
      style={{
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: typeof size === 'number' ? `${size}px` : size,
        ...style
      }}
    >
      {children}
    </div>
  );
};

// Image
export const Image = ({ src, alt, width, height, style, onClick, preview = false }) => {
  return (
    <img
      className={styles.image}
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ ...style, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    />
  );
};

// Tooltip (simple native hover tooltip proxy)
export const Tooltip = ({ title, children }) => {
  if (!children) return null;
  try {
    return React.cloneElement(children, {
      title: children.props?.title || title
    });
  } catch {
    return children;
  }
};

// Skeleton mockup
export const Skeleton = () => <div className={styles.skeletonInput} />;
Skeleton.Avatar = () => <div className={styles.skeletonAvatar} />;
Skeleton.Button = () => <div className={styles.skeletonButton} />;
Skeleton.Input = () => <div className={styles.skeletonInput} />;

// Upload component
export const Upload = ({ children, multiple, onChange, style }) => {
  const fileInputRef = React.useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newFileList = files.map((file, idx) => ({
      uid: `rc-upload-${Date.now()}-${idx}`,
      name: file.name,
      originFileObj: file,
    }));
    onChange({ fileList: newFileList });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed rgba(255,255,255,0.2)',
        borderRadius: 8,
        cursor: 'pointer',
        padding: 20,
        background: 'rgba(255,255,255,0.03)',
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = '#34B34A')}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
    >
      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      {children}
    </div>
  );
};

// Card
export const Card = ({ children, style, onClick, className = '', hoverable }) => {
  return (
    <div
      className={`${styles.card} ${hoverable ? styles.cardHoverable : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// message toast helper
function showToast(text, type) {
  let container = document.getElementById('ui-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ui-toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: 12px 20px;
    border-radius: 6px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-20px);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  if (type === 'success') {
    toast.style.backgroundColor = '#34B34A';
    toast.innerHTML = `✓ ${text}`;
  } else if (type === 'error') {
    toast.style.backgroundColor = '#ef4444';
    toast.innerHTML = `✗ ${text}`;
  } else if (type === 'warning') {
    toast.style.backgroundColor = '#f59e0b';
    toast.innerHTML = `⚠ ${text}`;
  } else {
    toast.style.backgroundColor = '#3b82f6';
    toast.innerHTML = `ℹ ${text}`;
  }

  container.appendChild(toast);

  // Force reflow
  void toast.offsetHeight;

  // Animate in
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  // Animate out and remove
  setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
      if (container.childNodes.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}

export const message = {
  success: (text) => showToast(text, 'success'),
  error: (text) => showToast(text, 'error'),
  warning: (text) => showToast(text, 'warning'),
  info: (text) => showToast(text, 'info'),
};

