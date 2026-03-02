'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AdminFilter.module.css';

interface AdminFilterProps {
    availableOperators: string[];
    onApply: (filters: { month?: number; operators: string[] }) => void;
    initialFilters?: { month?: number; operators: string[] };
}

const MONTHS = [
    { id: 1, name: 'Yanvar' },
    { id: 2, name: 'Fevral' },
    { id: 3, name: 'Mart' },
    { id: 4, name: 'Aprel' },
    { id: 5, name: 'May' },
    { id: 6, name: 'Iyun' },
    { id: 7, name: 'Iyul' },
    { id: 8, name: 'Avgust' },
    { id: 9, name: 'Sentabr' },
    { id: 10, name: 'Oktabr' },
    { id: 11, name: 'Noyabr' },
    { id: 12, name: 'Dekabr' },
];

export default function AdminFilter({ availableOperators, onApply, initialFilters }: AdminFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(initialFilters?.month);
    const [selectedOps, setSelectedOps] = useState<string[]>(initialFilters?.operators || []);
    const popoverRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleMonthToggle = (monthId: number) => {
        setSelectedMonth(prev => prev === monthId ? undefined : monthId);
    };

    const handleOpToggle = (op: string) => {
        setSelectedOps(prev =>
            prev.includes(op)
                ? prev.filter(o => o !== op)
                : [...prev, op]
        );
    };

    const handleApply = () => {
        onApply({ month: selectedMonth, operators: selectedOps });
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedMonth(undefined);
        setSelectedOps([]);
        onApply({ operators: [] });
    };

    const activeCount = (selectedMonth ? 1 : 0) + (selectedOps.length > 0 ? 1 : 0);

    return (
        <div className={styles.container} ref={popoverRef}>
            <button
                className={`${styles.filterTrigger} ${activeCount > 0 ? styles.activeTrigger : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Filtrlash"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
            </button>

            {isOpen && (
                <div className={styles.popover}>
                    <div className={styles.section}>
                        <span className={styles.sectionLabel}>Oyni tanlang</span>
                        <select
                            className={styles.select}
                            value={selectedMonth || ''}
                            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
                        >
                            <option value="">Barcha oylar</option>
                            {MONTHS.map(month => {
                                const isFuture = month.id > currentMonth;
                                return (
                                    <option key={month.id} value={month.id} disabled={isFuture}>
                                        {month.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className={styles.section}>
                        <span className={styles.sectionLabel}>Operatorni tanlang</span>
                        <select
                            className={styles.select}
                            value={selectedOps.length === 1 ? selectedOps[0] : ''}
                            onChange={(e) => setSelectedOps(e.target.value ? [e.target.value] : [])}
                        >
                            <option value="">Barcha operatorlar</option>
                            {availableOperators.map(op => (
                                <option key={op} value={op}>{op}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.btnClear} onClick={handleClear}>Tozalash</button>
                        <button className={styles.btnApply} onClick={handleApply}>Qo'llash</button>
                    </div>
                </div>
            )}
        </div>
    );
}
