import React, { useState, useEffect, useRef } from 'react';
import styles from './AdminFilterPopover.module.css';

interface AdminFilterPopoverProps {
    onApplyFilters: (filters: {
        startDate?: string;
        endDate?: string;
        operators: string[];
        builder?: string;
    }) => void;
    availableOperators: string[];
    availableBuilders: string[];
    initialFilters?: {
        startDate?: string;
        endDate?: string;
        operators: string[];
        builder?: string;
    };
}

const MONTH_NAMES = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export default function AdminFilterPopover({ onApplyFilters, availableOperators, availableBuilders, initialFilters }: AdminFilterPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Form States
    const [startDate, setStartDate] = useState(initialFilters?.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters?.endDate || '');
    const [selectedOperators, setSelectedOperators] = useState<string[]>(initialFilters?.operators || []);
    const [selectedBuilder, setSelectedBuilder] = useState(initialFilters?.builder || '');

    // Custom Calendar States
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

    // Dropdown state for operators
    const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);

    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowStartCalendar(false);
                setShowEndCalendar(false);
                setShowOperatorDropdown(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleApply = () => {
        onApplyFilters({
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            operators: selectedOperators,
            builder: selectedBuilder || undefined
        });
        setIsOpen(false);
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        setSelectedOperators([]);
        setSelectedBuilder('');
        onApplyFilters({ operators: [] });
    };

    const toggleOperator = (op: string) => {
        setSelectedOperators(prev =>
            prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
        );
    };

    // Calendar logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
        const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const handleDateSelect = (day: number | null, isStart: boolean) => {
        if (!day) return;

        // Format YYYY-MM-DD safely
        const m = (calendarMonth + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        const dateStr = `${calendarYear}-${m}-${d}`;

        if (isStart) {
            setStartDate(dateStr);
            setShowStartCalendar(false);
        } else {
            setEndDate(dateStr);
            setShowEndCalendar(false);
        }
    };

    const renderCalendar = (isStart: boolean) => (
        <div className={`${styles.calendarDropdown} ${!isStart ? styles.calendarRight : ''}`}>
            <div className={styles.calendarHeader}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setCalendarMonth(prev => prev === 0 ? 11 : prev - 1); if (calendarMonth === 0) setCalendarYear(prev => prev - 1); }}>&lt;</button>
                <div className={styles.calendarTitle}>
                    <span>{MONTH_NAMES[calendarMonth]}</span>
                    <span className={styles.calendarYear}>{calendarYear}</span>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setCalendarMonth(prev => prev === 11 ? 0 : prev + 1); if (calendarMonth === 11) setCalendarYear(prev => prev + 1); }}>&gt;</button>
            </div>
            <div className={styles.calendarGrid}>
                {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map(d => (
                    <div key={`head-${d}`} className={styles.calendarDayHead}>{d}</div>
                ))}
                {generateCalendarDays().map((day, i) => (
                    <div
                        key={`day-${i}`}
                        className={`${styles.calendarDay} ${!day ? styles.calendarDayEmpty : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleDateSelect(day, isStart) }}
                    >
                        {day || ''}
                    </div>
                ))}
            </div>
        </div>
    );

    const activeFilterCount = (startDate ? 1 : 0) + (endDate ? 1 : 0) + (selectedOperators.length > 0 ? 1 : 0) + (selectedBuilder ? 1 : 0);

    return (
        <div className={styles.popoverContainer} ref={popoverRef}>
            <button
                className={`${styles.filterTrigger} ${activeFilterCount > 0 ? styles.activeTrigger : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Filterlarni ochish"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
                <span>Filtr</span>
            </button>

            {isOpen && (
                <div className={styles.popoverContent}>
                    <div className={styles.popoverHeader}>
                        <h3>Filtrlar</h3>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className={styles.popoverBody}>
                        {/* Dates */}
                        <div className={styles.formGroup}>
                            <label>Sana oralig'i</label>
                            <div className={styles.dateRow}>
                                <div className={styles.dateInputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="Boshlanish"
                                        value={startDate}
                                        readOnly
                                        onClick={() => { setShowStartCalendar(!showStartCalendar); setShowEndCalendar(false); }}
                                    />
                                    {showStartCalendar && renderCalendar(true)}
                                </div>
                                <span className={styles.dateSeparator}>-</span>
                                <div className={styles.dateInputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="Tugash"
                                        value={endDate}
                                        readOnly
                                        onClick={() => { setShowEndCalendar(!showEndCalendar); setShowStartCalendar(false); }}
                                    />
                                    {showEndCalendar && renderCalendar(false)}
                                </div>
                            </div>
                        </div>

                        {/* Operators Multi-Select */}
                        <div className={styles.formGroup}>
                            <label>Operatorlar</label>
                            {availableOperators.length === 0 ? (
                                <div className={styles.emptyItems}>Ma'lumotlar yo'q</div>
                            ) : (
                                <div className={styles.customSelectWrapper}>
                                    <div
                                        className={styles.selectInput}
                                        onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
                                    >
                                        Barchasi
                                        <span className={styles.dropdownArrow}>▼</span>
                                    </div>

                                    {showOperatorDropdown && (
                                        <div className={styles.dropdownMenu}>
                                            {availableOperators.map(op => (
                                                <div
                                                    key={op}
                                                    className={`${styles.dropdownItem} ${selectedOperators.includes(op) ? styles.dropdownItemSelected : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleOperator(op); }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOperators.includes(op)}
                                                        readOnly
                                                        onChange={() => { }}
                                                    />
                                                    <span>{op}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedOperators.length > 0 && (
                                        <div className={styles.selectedChipsContainer}>
                                            {selectedOperators.map(op => (
                                                <div key={`selected-${op}`} className={styles.selectedChip}>
                                                    {op}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleOperator(op)}
                                                        className={styles.removeChipBtn}
                                                    >×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Builder Single Select */}
                        <div className={styles.formGroup}>
                            <label>Quruvchi (Obyekt egasi)</label>
                            <select
                                value={selectedBuilder}
                                onChange={(e) => setSelectedBuilder(e.target.value)}
                                className={styles.selectInput}
                            >
                                <option value="">Barchasi</option>
                                {availableBuilders.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.popoverFooter}>
                        <button className={styles.btnSecondary} onClick={handleClear}>Tozalash</button>
                        <button className={styles.btnPrimary} onClick={handleApply}>Qo'llash</button>
                    </div>
                </div>
            )}
        </div>
    );
}
