// src/modules/VistorIA/components/DemoLoginModal.js
// Modal fake de login para fluxo demo — sem Supabase Auth
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaLock, FaSpinner } from 'react-icons/fa';
import { vistoriaColors as colors } from './theme';

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); }`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px; animation: ${fadeIn} 0.2s ease;
`;

const Card = styled.div`
  background: #fff; border-radius: 20px; padding: 36px 28px;
  max-width: 380px; width: 100%; text-align: center;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15);
  animation: ${slideUp} 0.3s ease;
`;

const Logo = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-bottom: 24px;
  img { height: 32px; }
`;

const Title = styled.h2`
  font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 4px;
`;

const Subtitle = styled.p`
  font-size: 13px; color: #64748b; margin: 0 0 24px;
`;

const Field = styled.div`
  text-align: left; margin-bottom: 14px;
  label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
`;

const Input = styled.input`
  width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0;
  border-radius: 10px; font-size: 14px; color: #1e293b;
  background: #f8fafc; outline: none; box-sizing: border-box;
  &:focus { border-color: ${colors.primary}; }
`;

const Button = styled.button`
  width: 100%; padding: 12px; border: none; border-radius: 12px;
  background: ${colors.primary}; color: #fff; font-size: 15px;
  font-weight: 700; cursor: pointer; margin-top: 8px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const Spinner = styled(FaSpinner)`animation: ${spin} 0.8s linear infinite;`;

export default function DemoLoginModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <Overlay onClick={onClose}>
      <Card onClick={e => e.stopPropagation()}>
        <Logo>
          <img src="/images/logos/vistoria.svg" alt="VistorIA" />
        </Logo>
        <Title>Acesso ao Sistema</Title>
        <Subtitle>Inspeção veicular inteligente</Subtitle>
        <form onSubmit={handleSubmit}>
          <Field>
            <label>E-mail</label>
            <Input type="email" value="operador@autoomatic.com.br" readOnly />
          </Field>
          <Field>
            <label>Senha</label>
            <Input type="password" value="••••••••" readOnly />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? <><Spinner /> Autenticando...</> : <><FaLock size={13} /> Iniciar Teste</>}
          </Button>
        </form>
      </Card>
    </Overlay>
  );
}
