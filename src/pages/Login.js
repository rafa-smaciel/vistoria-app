// src/modules/VistorIA/pages/Login.js
// Login branded VistorIA — baseado no padrão VIXEM Portal

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { vistoriaColors as colors } from '../components/theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0ea5e9 100%);
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  z-index: 2;

  @media (max-width: 480px) {
    padding: 30px 24px;
    border-radius: 16px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.img`
  height: 48px;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${colors.textSecondary};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 16px;
  color: ${colors.textSecondary};
  font-size: 1rem;
  z-index: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: ${colors.backgroundAlt};
  border: 1.5px solid ${props => props.$hasError ? colors.danger : colors.border};
  border-radius: 12px;
  font-size: 1rem;
  color: ${colors.textPrimary};
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: ${props => props.$hasError ? colors.danger : colors.primary};
    background: #fff;
    box-shadow: 0 0 0 3px ${props => props.$hasError
      ? 'rgba(239, 68, 68, 0.12)'
      : 'rgba(14, 165, 233, 0.15)'
    };
  }

  &::placeholder { color: #94a3b8; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  padding: 10px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  &:hover { color: ${colors.primary}; }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: ${colors.dangerLight};
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: ${colors.danger};
  font-size: 0.85rem;
  line-height: 1.5;
  animation: ${fadeIn} 0.3s ease-out;
  svg { flex-shrink: 0; margin-top: 2px; }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%);
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(14, 165, 233, 0.35);
  }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const BackToSite = styled.a`
  display: block;
  text-align: center;
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  text-decoration: none;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${colors.border};
  cursor: pointer;
  transition: color 0.2s ease;
  &:hover { color: ${colors.primary}; }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0ea5e9 100%);
`;

const LoadingCard = styled.div`
  text-align: center;
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(14, 165, 233, 0.2);
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 16px;
`;

const LoadingText = styled.p`
  color: ${colors.textSecondary};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export default function VistorIALogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Explicit redirect from RouteGuard (?redirect=/checkin) takes priority
  const explicitRedirect = new URLSearchParams(location.search).get('redirect')
    || location.state?.from?.pathname
    || null;

  // Resolve destination based on role + function from vistoria_users
  const resolveDestination = async (authUser) => {
    if (explicitRedirect) return explicitRedirect;

    try {
      // Resolve from vistoria_users table (role + function)
      const { data: vu } = await supabase
        .from('vistoria_users')
        .select('role, function')
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (vu) {
        if (vu.role === 'admin') return '/configuracoes';
        if (vu.role === 'gestor') return '/dashboard';
        // operador — based on function
        if (vu.function === 'expedicao') return '/checkout';
        return '/checkin'; // portaria (default)
      }

      // Fallback: check user_profiles
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('admin_role')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile?.admin_role) {
        if (['super_admin', 'admin'].includes(profile.admin_role)) return '/configuracoes';
        if (profile.admin_role === 'seller') return '/dashboard';
      }
    } catch (_e) {
      // fallback
    }

    return '/checkin'; // default for unknown users
  };

  useEffect(() => {
    document.title = 'VistorIA - Login';
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      resolveDestination(user).then(dest => navigate(dest, { replace: true }));
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (data?.user) {
        const dest = await resolveDestination(data.user);
        navigate(dest, { replace: true });
      }
    } catch (err) {
      let message = 'Ocorreu um erro ao fazer login. Tente novamente.';
      if (err.message?.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos.';
      } else if (err.message?.includes('Email not confirmed')) {
        message = 'Seu email ainda nao foi confirmado. Verifique sua caixa de entrada.';
      } else if (err.message?.includes('Too many requests')) {
        message = 'Muitas tentativas. Aguarde alguns minutos.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <LoadingContainer>
        <LoadingCard>
          <LoadingSpinner />
          <LoadingText>Verificando sessao...</LoadingText>
        </LoadingCard>
      </LoadingContainer>
    );
  }

  if (user) {
    return (
      <LoadingContainer>
        <LoadingCard>
          <LoadingSpinner />
          <LoadingText>Redirecionando...</LoadingText>
        </LoadingCard>
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      <LoginCard>
        <LogoSection>
          <Logo src="/images/logos/vistoria.svg" alt="VistorIA" />
          <Title>Acesso VistorIA</Title>
          <Subtitle>Entre com suas credenciais para continuar</Subtitle>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel htmlFor="email">Email</InputLabel>
            <InputWrapper>
              <InputIcon><FaEnvelope /></InputIcon>
              <StyledInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isLoading}
                $hasError={!!error}
                autoComplete="email"
                autoFocus
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="password">Senha</InputLabel>
            <InputWrapper>
              <InputIcon><FaLock /></InputIcon>
              <StyledInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                disabled={isLoading}
                $hasError={!!error}
                autoComplete="current-password"
              />
              <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              <div>{error}</div>
            </ErrorMessage>
          )}

          <SubmitButton type="submit" disabled={isLoading || !email || !password}>
            {isLoading ? (<><Spinner /> Entrando...</>) : 'Entrar'}
          </SubmitButton>
        </Form>

        <BackToSite onClick={() => navigate('/')}>
          &larr; Voltar para o site
        </BackToSite>
      </LoginCard>
    </PageContainer>
  );
}
