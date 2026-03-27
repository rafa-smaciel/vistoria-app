// src/components/StarRating.js
// Reusable 1-5 star rating component with optional comment
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaStar, FaPaperPlane } from 'react-icons/fa';

const pop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const Star = styled.button`
  background: none;
  border: none;
  cursor: ${p => p.$disabled ? 'default' : 'pointer'};
  padding: 2px;
  font-size: ${p => p.$size || '20px'};
  color: ${p => p.$filled ? (p.$accentColor || '#f59e0b') : '#d1d5db'};
  transition: color 150ms, transform 150ms;
  ${p => p.$justSelected && css`animation: ${pop} 300ms ease;`}

  &:hover {
    ${p => !p.$disabled && `
      color: ${p.$accentColor || '#f59e0b'};
      transform: scale(1.15);
    `}
  }
`;

const Label = styled.span`
  font-size: 12px;
  color: #888;
  margin-left: 8px;
`;

const CommentRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid ${p => p.$borderColor || '#e5e7eb'};
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: ${p => p.$bg || '#fff'};
  color: ${p => p.$textColor || '#333'};

  &:focus {
    border-color: ${p => p.$accentColor || '#f59e0b'};
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SendBtn = styled.button`
  background: ${p => p.$accentColor || '#f59e0b'};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 150ms;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const ThankYou = styled.div`
  font-size: 13px;
  color: ${p => p.$color || '#10b981'};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

/**
 * StarRating - Reusable star rating component
 *
 * @param {number} value - Current rating (0-5, 0 = unrated)
 * @param {function} onChange - Called with (rating, comment) when submitted
 * @param {boolean} showComment - Show comment input after rating
 * @param {string} accentColor - Color for filled stars and send button
 * @param {string} size - Star font-size (e.g. '20px', '28px')
 * @param {boolean} disabled - Disable interaction (display only)
 * @param {boolean} compact - Hide labels and comment
 * @param {object} inputStyle - Extra style props for comment input ({$bg, $borderColor, $textColor})
 */
const StarRating = ({
  value = 0,
  onChange,
  showComment = true,
  accentColor,
  size = '20px',
  disabled = false,
  compact = false,
  inputStyle = {},
  placeholder = 'Comentário opcional...',
}) => {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(value);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [justSelected, setJustSelected] = useState(0);

  if (submitted) {
    return (
      <ThankYou $color={accentColor || '#10b981'}>
        <FaStar /> Obrigado pela avaliação!
      </ThankYou>
    );
  }

  const handleSelect = (star) => {
    if (disabled) return;
    setSelected(star);
    setJustSelected(star);
    setTimeout(() => setJustSelected(0), 300);

    // If compact (no comment), submit immediately
    if (compact && onChange) {
      onChange(star, '');
      setSubmitted(true);
    }
  };

  const handleSubmit = () => {
    if (!selected || disabled) return;
    if (onChange) onChange(selected, comment);
    setSubmitted(true);
  };

  const displayRating = hover || selected;

  return (
    <Container>
      <StarsRow>
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            $filled={star <= displayRating}
            $accentColor={accentColor}
            $size={size}
            $disabled={disabled}
            $justSelected={star === justSelected}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => handleSelect(star)}
            type="button"
          >
            <FaStar />
          </Star>
        ))}
        {!compact && displayRating > 0 && (
          <Label>{LABELS[displayRating]}</Label>
        )}
      </StarsRow>

      {showComment && !compact && selected > 0 && (
        <CommentRow>
          <CommentInput
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={placeholder}
            $accentColor={accentColor}
            $bg={inputStyle.$bg}
            $borderColor={inputStyle.$borderColor}
            $textColor={inputStyle.$textColor}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <SendBtn
            onClick={handleSubmit}
            $accentColor={accentColor}
            disabled={!selected}
          >
            <FaPaperPlane /> Enviar
          </SendBtn>
        </CommentRow>
      )}
    </Container>
  );
};

export default StarRating;
