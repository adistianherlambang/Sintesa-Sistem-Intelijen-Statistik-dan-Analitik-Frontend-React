import React, { useState, useEffect, useRef } from "react";
import styles from "./SearchableSelect.module.css";

export default function SearchableSelect({
  value,
  onChange,
  options,
  children,
  placeholder = "Cari...",
  style,
  className = "",
  disabled = false,
  size = "default"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Parse options from either options prop or children
  let parsedOptions = options || [];
  if (!options && children) {
    parsedOptions = React.Children.toArray(children)
      .map((child) => {
        if (!child) return null;
        
        // Handle Select.Option or option tag
        const val = child.props?.value;
        const label = child.props?.children || val;
        return { value: val, label: label };
      })
      .filter(Boolean);
  }

  // Filter options based on search query
  const filteredOptions = parsedOptions.filter((option) =>
    String(option.label || option.value)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Find selected option label
  const selectedOption = parsedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption
    ? selectedOption.label
    : value || "";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keypress Escape to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery("");
    }
  };

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const isSmall = size === "small";

  return (
    <div
      className={`${styles.container} ${className}`}
      style={style}
      ref={containerRef}
    >
      <div
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ""} ${
          disabled ? styles.triggerDisabled : ""
        } ${isSmall ? styles.sizeSmall : ""}`}
        onClick={handleToggle}
      >
        <span className={styles.displayValue}>
          {displayLabel || (disabled ? "Memuat..." : "-- Pilih --")}
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className={`${styles.dropdown} ${isSmall ? styles.dropdownSmall : ""}`}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.optionList}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div
                  key={`${opt.value}-${idx}`}
                  className={`${styles.option} ${
                    value === opt.value ? styles.optionSelected : ""
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className={styles.noOptions}>Tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
