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
    if (len > 11) return 28;
    if (len > 9) return 32;
    if (len > 7) return 38;
    return 48;
  })();

  return (
    <div className="flex flex-col h-full select-none" style={{ background: '#232323' }}>
      {/* Display */}
      <div className="flex-1 flex items-end justify-end px-5 pb-2 min-h-[80px]" style={{ background: 'linear-gradient(to bottom, #232323, #1e1e1e)' }}>
        <span
          className="text-white tracking-tight truncate"
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

      {/* Button Grid — exact macOS layout */}
      <div className="grid grid-cols-4 gap-[1px] p-[1px]" style={{ background: '#131313' }}>
        {/* Row 1: AC, +/−, %, ÷ */}
        <CalcBtn label={display !== '0' ? 'C' : 'AC'} onClick={clearAll} type="function" />
        <CalcBtn label="⁺∕₋" onClick={toggleSign} type="function" />
        <CalcBtn label="%" onClick={inputPercent} type="function" />
        <CalcBtn label="÷" onClick={() => performOperation('/')} type="operator" active={isActive('/')} />

        {/* Row 2 */}
        <CalcBtn label="7" onClick={() => inputDigit(7)} />
        <CalcBtn label="8" onClick={() => inputDigit(8)} />
        <CalcBtn label="9" onClick={() => inputDigit(9)} />
        <CalcBtn label="×" onClick={() => performOperation('*')} type="operator" active={isActive('*')} />

        {/* Row 3 */}
        <CalcBtn label="4" onClick={() => inputDigit(4)} />
        <CalcBtn label="5" onClick={() => inputDigit(5)} />
        <CalcBtn label="6" onClick={() => inputDigit(6)} />
        <CalcBtn label="−" onClick={() => performOperation('-')} type="operator" active={isActive('-')} />

        {/* Row 4 */}
        <CalcBtn label="1" onClick={() => inputDigit(1)} />
        <CalcBtn label="2" onClick={() => inputDigit(2)} />
        <CalcBtn label="3" onClick={() => inputDigit(3)} />
        <CalcBtn label="+" onClick={() => performOperation('+')} type="operator" active={isActive('+')} />

        {/* Row 5: 0 (wide), ., = */}
        <CalcBtn label="0" onClick={() => inputDigit(0)} wide />
        <CalcBtn label="." onClick={inputDecimal} />
        <CalcBtn label="=" onClick={handleEquals} type="operator" />
      </div>
    </div>
  );
}

function CalcBtn({ label, onClick, type = 'number', wide = false, active = false }) {
  const colors = {
    number:   { bg: '#505050', hover: '#616161', text: '#fff', fontSize: 22, fontWeight: 300 },
    function: { bg: '#a5a5a5', hover: '#b8b8b8', text: '#000', fontSize: 17, fontWeight: 400 },
    operator: { bg: '#FF9F0A', hover: '#FFB340', text: '#fff', fontSize: 28, fontWeight: 300 },
  };
  const c = colors[type];

  const bg = active ? '#fff' : c.bg;
  const hoverBg = active ? '#e8e8e8' : c.hover;
  const textColor = active ? '#FF9F0A' : c.text;

  return (
    <button
      className={`flex items-center transition-colors duration-50 cursor-default select-none ${wide ? 'col-span-2 justify-start pl-[22px]' : 'justify-center'}`}
      style={{
        background: bg,
        color: textColor,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        height: 50,
        borderRadius: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.background = hoverBg}
      onMouseLeave={e => e.currentTarget.style.background = bg}
      onMouseDown={e => e.currentTarget.style.opacity = '0.8'}
      onMouseUp={e => e.currentTarget.style.opacity = '1'}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
