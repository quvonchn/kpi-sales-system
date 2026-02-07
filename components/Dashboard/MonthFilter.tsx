'use client';

import React from 'react';
import styles from './MonthFilter.module.css';

interface MonthFilterProps {
    selectedMonth: number;
    onMonthChange: (month: number) => void;
    currentYear: number;
}

const MONTH_NAMES = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export default function MonthFilter({ selectedMonth, onMonthChange, currentYear }: MonthFilterProps) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const isCurrentYear = currentYear === today.getFullYear();

    return (
        <div className={styles.container}>
            <div className={styles.monthGrid}>
                {MONTH_NAMES.map((name, index) => {
                    const month = index + 1;
                    const isFuture = isCurrentYear && month > currentMonth;
                    const isActive = month === selectedMonth;

                    return (
                        <button
                            key={month}
                            className={`${styles.monthBtn} ${isActive ? styles.active : ''} ${isFuture ? styles.disabled : ''}`}
                            onClick={() => !isFuture && onMonthChange(month)}
                            disabled={isFuture}
                            title={isFuture ? 'Bu oy hali kelmagan' : name}
                        >
                            {name.substring(0, 3)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
