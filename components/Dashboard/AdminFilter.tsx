'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AdminFilter.module.css';

interface AdminFilterProps {
    onApply: (filters: { month?: number; sortBy: 'kpi' | 'sales' }) => void;
    initialFilters: { month?: number; sortBy: 'kpi' | 'sales' };
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

export default function AdminFilter({ onApply, initialFilters }: AdminFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(initialFilters.month);
    const [selectedSort, setSelectedSort] = useState<'kpi' | 'sales'>(initialFilters.sortBy || 'kpi');
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentMonth = new Date().getMonth() + 1;

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

    const handleApply = () => {
        onApply({ month: selectedMonth, sortBy: selectedSort });
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedMonth(initialFilters.month);
        setSelectedSort(initialFilters.sortBy);
        onApply({ month: undefined, sortBy: initialFilters.sortBy });
        setIsOpen(false);
    };

    const activeCount = (selectedMonth ? 1 : 0) + (selectedSort !== initialFilters.sortBy ? 1 : 0);

    return (
        <div className={styles.container} ref={popoverRef}>
            <button
                className={`${styles.filterTrigger} ${activeCount > 0 ? styles.activeTrigger : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Filtrlash va Saralash"
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
                        <span className={styles.sectionLabel}>Saralash</span>
                        <select
                            className={styles.select}
                            value={selectedSort}
                            onChange={(e) => setSelectedSort(e.target.value as 'kpi' | 'sales')}
                        >
                            <option value="kpi">KPI summasi bo'yicha</option>
                            <option value="sales">Sotuvlar soni bo'yicha</option>
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
