import { useState, useEffect, useCallback } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [operand, setOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(d => d === '0' ? String(digit) : d.length < 16 ? d + digit : d);
    }
  }, [waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    setDisplay(d => d.includes('.') ? d : d + '.');
  }, [waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setOperand(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => setDisplay(d => String(-parseFloat(d))), []);
  const inputPercent = useCallback(() => setDisplay(d => String(parseFloat(d) / 100)), []);

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  };

  const performOperation = useCallback((nextOp) => {
    const inputValue = parseFloat(display);
    if (operand == null) {
      setOperand(inputValue);
    } else if (operator) {
      const result = calculate(operand, inputValue, operator);
      setDisplay(String(result));
      setOperand(result);
    }
    setWaitingForOperand(true);
    setOperator(nextOp);
  }, [display, operand, operator]);

  const handleEquals = useCallback(() => {
    if (operator && operand != null) {
      const result = calculate(operand, parseFloat(display), operator);
      setDisplay(String(result));
      setOperand(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, operand, operator]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      const target = e.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (e.key >= '0' && e.key <= '9') inputDigit(Number(e.key));
      else if (e.key === '.') inputDecimal();
      else if (e.key === '+') performOperation('+');
      else if (e.key === '-') performOperation('-');
      else if (e.key === '*') performOperation('*');
      else if (e.key === '/') { e.preventDefault(); performOperation('/'); }
      else if (e.key === 'Enter' || e.key === '=') handleEquals();
      else if (e.key === 'Escape') clearAll();
      else if (e.key === '%') inputPercent();
      else if (e.key === 'Backspace') setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputDigit, inputDecimal, performOperation, handleEquals, clearAll, inputPercent]);

  const formatDisplay = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (val.endsWith('.') || val.endsWith('.0')) return val;
    if (val.includes('.') && !waitingForOperand) return val;
    if (String(Math.abs(num)).length > 9) return num.toExponential(5);
    return Number(val).toLocaleString('en-US');
  };

  const isActive = (op) => operator === op && waitingForOperand;

  const fontSize = (() => {
    const len = display.replace(/[^0-9.]/g, '').length;
    if (len > 11) return 40;
    if (len > 9) return 50;
    if (len > 7) return 60;
    return 70;
  })();

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{
        background: 'linear-gradient(180deg, #2b2b2b 0%, #1f1f1f 100%)',
        padding: 10,
        gap: 8,
      }}
    >
      {/* Display */}
      <div className="flex items-end justify-end px-3 pt-4 pb-2 min-h-[110px]">
        <span
          className="text-white tracking-tight truncate text-right w-full tabular-nums"
          style={{
            fontSize,
            fontWeight: 200,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {formatDisplay(display)}
        </span>
      </div>

      {/* Button Grid — rounded buttons, gap-based layout */}
      <div className="grid grid-cols-4 gap-[7px] px-0">
        <CalcBtn label={display !== '0' ? 'C' : 'AC'} onClick={clearAll} type="function" />
        <CalcBtn label="⁺∕₋" onClick={toggleSign} type="function" />
        <CalcBtn label="%" onClick={inputPercent} type="function" />
        <CalcBtn label="÷" onClick={() => performOperation('/')} type="operator" active={isActive('/')} />

        <CalcBtn label="7" onClick={() => inputDigit(7)} />
        <CalcBtn label="8" onClick={() => inputDigit(8)} />
        <CalcBtn label="9" onClick={() => inputDigit(9)} />
        <CalcBtn label="×" onClick={() => performOperation('*')} type="operator" active={isActive('*')} />

        <CalcBtn label="4" onClick={() => inputDigit(4)} />
        <CalcBtn label="5" onClick={() => inputDigit(5)} />
        <CalcBtn label="6" onClick={() => inputDigit(6)} />
        <CalcBtn label="−" onClick={() => performOperation('-')} type="operator" active={isActive('-')} />

        <CalcBtn label="1" onClick={() => inputDigit(1)} />
        <CalcBtn label="2" onClick={() => inputDigit(2)} />
        <CalcBtn label="3" onClick={() => inputDigit(3)} />
        <CalcBtn label="+" onClick={() => performOperation('+')} type="operator" active={isActive('+')} />

        <CalcBtn label="0" onClick={() => inputDigit(0)} wide />
        <CalcBtn label="." onClick={inputDecimal} />
        <CalcBtn label="=" onClick={handleEquals} type="operator" />
      </div>
    </div>
  );
}

function CalcBtn({ label, onClick, type = 'number', wide = false, active = false }) {
  const [pressed, setPressed] = useState(false);
  const colors = {
    number:   {
      bg: 'linear-gradient(180deg, #5A5A5A 0%, #4A4A4A 100%)',
      hover: 'linear-gradient(180deg, #6C6C6C 0%, #5A5A5A 100%)',
      text: '#fff', fontSize: 24, fontWeight: 400,
    },
    function: {
      bg: 'linear-gradient(180deg, #B4B4B4 0%, #9E9E9E 100%)',
      hover: 'linear-gradient(180deg, #C4C4C4 0%, #AEAEAE 100%)',
      text: '#000', fontSize: 20, fontWeight: 400,
    },
    operator: {
      bg: 'linear-gradient(180deg, #FFA726 0%, #FF8E0A 100%)',
      hover: 'linear-gradient(180deg, #FFB74D 0%, #FF9F25 100%)',
      text: '#fff', fontSize: 28, fontWeight: 400,
    },
  };
  const c = colors[type];

  const bg = active ? '#fff' : c.bg;
  const hoverBg = active ? '#f5f5f5' : c.hover;
  const textColor = active ? '#FF8E0A' : c.text;

  return (
    <button
      className={`flex items-center transition-all duration-75 cursor-default select-none ${wide ? 'col-span-2 justify-start pl-7' : 'justify-center'}`}
      style={{
        background: bg,
        color: textColor,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        height: 50,
        borderRadius: 10,
        border: '0.5px solid rgba(0,0,0,0.35)',
        boxShadow: pressed
          ? 'inset 0 1.5px 4px rgba(0,0,0,0.35)'
          : '0 1px 0 rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.25)',
        transform: pressed ? 'translateY(0.5px)' : 'translateY(0)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = hoverBg}
      onMouseLeave={e => e.currentTarget.style.background = bg}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
