'use client';

import { useState, useEffect } from 'react';

interface CalculatorModalProps {
  onClose: () => void;
}

export default function CalculatorModal({ onClose }: CalculatorModalProps) {
  const [display, setDisplay] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kaa_calc_display') || '0';
    return '0';
  });
  const [previousValue, setPreviousValue] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kaa_calc_prev');
      return saved ? parseFloat(saved) : null;
    }
    return null;
  });
  const [operator, setOperator] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kaa_calc_op') || null;
    return null;
  });
  const [waitingForNewValue, setWaitingForNewValue] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kaa_calc_waiting') === 'true';
    return false;
  });
  
  const inputDigit = (digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let newValue = 0;

      switch (operator) {
        case '+': newValue = currentValue + inputValue; break;
        case '-': newValue = currentValue - inputValue; break;
        case '*': newValue = currentValue * inputValue; break;
        case '/': newValue = currentValue / inputValue; break;
      }

      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const handleEqual = () => {
    if (!operator || previousValue === null) return;
    performOperation(operator);
    setOperator(null);
  };

  const handleBackspace = () => {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  // Save to Cache & Listen for Keyboard events
  useEffect(() => {
    // 1. Save current state to local storage cache
    localStorage.setItem('kaa_calc_display', display);
    if (previousValue !== null) localStorage.setItem('kaa_calc_prev', previousValue.toString());
    else localStorage.removeItem('kaa_calc_prev');
    if (operator) localStorage.setItem('kaa_calc_op', operator);
    else localStorage.removeItem('kaa_calc_op');
    localStorage.setItem('kaa_calc_waiting', String(waitingForNewValue));

    // 2. Map physical keyboard presses to calculator functions
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      
      // Numbers
      if (/[0-9]/.test(key)) {
        e.preventDefault();
        inputDigit(key);
      } 
      // Decimals
      else if (key === '.') {
        e.preventDefault();
        inputDot();
      } 
      // Math Operators
      else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        performOperation(key);
      } 
      // Equals / Enter
      else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEqual();
      } 
      // Backspace
      else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } 
      // Close Modal (Escape key)
      else if (key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operator, waitingForNewValue]);

  // STYLING: Updated for Monochrome Theme
  const buttonClass = "h-14 text-xl font-bold rounded-xl transition-all active:scale-95 shadow-sm";
  const numClass = `${buttonClass} bg-white hover:bg-stone-100 text-stone-800 border border-stone-200`;
  const opClass = `${buttonClass} bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200`;
  const actionClass = `${buttonClass} bg-stone-200 hover:bg-stone-300 text-stone-700 border border-stone-300`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 flex flex-col">
        
        {/* Header & Display */}
        <div className="bg-stone-800 p-6 pb-4 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-stone-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-sm tracking-wider uppercase">Calculator</span>
            </div>
            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>
          <div className="bg-stone-900 rounded-xl p-4 text-right overflow-x-auto shadow-inner border border-stone-700">
            <span className="text-4xl font-mono font-black text-white tracking-tight">
              {display}
            </span>
          </div>
        </div>

        {/* Keypad */}
        <div className="p-5 grid grid-cols-4 gap-3 bg-stone-50 flex-1">
          <button onClick={clearAll} className={actionClass}>AC</button>
          <button onClick={clearEntry} className={actionClass}>CE</button>
          <button onClick={() => performOperation('/')} className={opClass}>÷</button>
          <button onClick={() => performOperation('*')} className={opClass}>×</button>

          <button onClick={() => inputDigit('7')} className={numClass}>7</button>
          <button onClick={() => inputDigit('8')} className={numClass}>8</button>
          <button onClick={() => inputDigit('9')} className={numClass}>9</button>
          <button onClick={() => performOperation('-')} className={opClass}>−</button>

          <button onClick={() => inputDigit('4')} className={numClass}>4</button>
          <button onClick={() => inputDigit('5')} className={numClass}>5</button>
          <button onClick={() => inputDigit('6')} className={numClass}>6</button>
          <button onClick={() => performOperation('+')} className={opClass}>+</button>

          <button onClick={() => inputDigit('1')} className={numClass}>1</button>
          <button onClick={() => inputDigit('2')} className={numClass}>2</button>
          <button onClick={() => inputDigit('3')} className={numClass}>3</button>
          
          {/* Highlighted Equals Button */}
          <button 
            onClick={handleEqual} 
            className={`${buttonClass} bg-stone-800 hover:bg-stone-900 text-white row-span-2 shadow-md border border-stone-800`}
          >
            =
          </button>

          <button onClick={() => inputDigit('0')} className={`${numClass} col-span-2`}>0</button>
          <button onClick={inputDot} className={numClass}>.</button>
        </div>

      </div>
    </div>
  );
}