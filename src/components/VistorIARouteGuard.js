import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../config/supabase';

const ROLE_HIERARCHY = { admin: 3, gestor: 2, operador: 1 };

const ROLE_LABEL = { admin: 'Administrador', gestor: 'Gestor', operador: 'Operador' };

// Demo bypass — ?demo=1 na URL ou flag em localStorage
function isDemoMode(location) {
  return new URLSearchParams(location.search).get('demo') === '1'
    || localStorage.getItem('vistoria_demo_active') === 'true';
}

// ── Animations ──────────────────────────────────────────────────────────────
const spin = keyframes`to { transform: rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

// ── Shared layout ────────────────────────────────────────────────────────────
const Screen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
  padding: 32px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 40px 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08);
  animation: ${fadeIn} 0.3s ease;
`;

const Logo = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0EA5E9;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 28px;
  opacity: 0.7;
`;

const IconWrap = styled.div`
  font-size: 52px;
  margin-bottom: 16px;
  line-height: 1;
`;

const Title = styled.h2`
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 28px;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${p => p.$required ? '#fef3c7' : '#e0f2fe'};
  color: ${p => p.$required ? '#92400e' : '#0369a1'};
  margin: 0 3px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Btn = styled.button`
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
  background: ${p => p.$outline ? 'transparent' : '#0EA5E9'};
  color: ${p => p.$outline ? '#64748b' : '#fff'};
  border: ${p => p.$outline ? '1.5px solid #e2e8f0' : 'none'};
`;

// ── Loading spinner ──────────────────────────────────────────────────────────
const SpinnerRing = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #0EA5E9;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 16px;
`;

const CheckingText = styled.p`
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
`;

// ── Guard ────────────────────────────────────────────────────────────────────
const VistorIARouteGuard = ({ children, minRole = 'operador' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDemo = isDemoMode(location);
  const [state, setState] = useState({ status: 'loading', user: null, role: null });

  const resolveRole = useCallback(async (user) => {
    try {
      const { data: vu } = await supabase
        .from('vistoria_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (vu?.role) return vu.role;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('admin_role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.admin_role) {
        const map = { super_admin: 'admin', admin: 'admin', seller: 'gestor', viewer: 'operador' };
        return map[profile.admin_role] || 'operador';
      }
    } catch (_) {}
    return 'operador';
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) setState({ status: 'unauthenticated', user: null, role: null });
          return;
        }
        const role = await resolveRole(session.user);
        if (isMounted) setState({ status: 'ok', user: session.user, role });
      } catch (err) {
        if (isMounted) setState({ status: 'unauthenticated', user: null, role: null });
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const role = await resolveRole(session.user);
        if (isMounted) setState({ status: 'ok', user: session.user, role });
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setState({ status: 'unauthenticated', user: null, role: null });
      }
    });

    // Timeout: após 10s sem sessão, mostra tela de login em vez de spinner eterno
    const timeout = setTimeout(() => {
      if (isMounted) {
        setState(prev => prev.status === 'loading' ? { status: 'unauthenticated', user: null, role: null } : prev);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, [resolveRole]);

  // ── Demo bypass ──────────────────────────────────────────────────────────
  if (isDemo) return children;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <Screen>
        <Card>
          <Logo>VistorIA</Logo>
          <SpinnerRing />
          <CheckingText>Verificando acesso...</CheckingText>
        </Card>
      </Screen>
    );
  }

  // ── Sem sessão ─────────────────────────────────────────────────────────────
  if (state.status === 'unauthenticated') {
    return (
      <Screen>
        <Card>
          <Logo>VistorIA</Logo>
          <IconWrap>🔒</IconWrap>
          <Title>Sessão não encontrada</Title>
          <Subtitle>
            Para acessar esta página, faça login com suas credenciais VistorIA.
          </Subtitle>
          <ButtonRow>
            <Btn onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}>
              Fazer Login
            </Btn>
          </ButtonRow>
        </Card>
      </Screen>
    );
  }

  // ── Role insuficiente ──────────────────────────────────────────────────────
  const userLevel = ROLE_HIERARCHY[state.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

  if (userLevel < requiredLevel) {
    return (
      <Screen>
        <Card>
          <Logo>VistorIA</Logo>
          <IconWrap>🚫</IconWrap>
          <Title>Acesso restrito</Title>
          <Subtitle>
            Esta tela requer perfil{' '}
            <RoleBadge $required>{ROLE_LABEL[minRole] || minRole}</RoleBadge>
            <br />
            Seu perfil atual:{' '}
            <RoleBadge>{ROLE_LABEL[state.role] || state.role}</RoleBadge>
          </Subtitle>
          <ButtonRow>
            <Btn onClick={() => navigate(-1)}>Voltar</Btn>
            <Btn $outline onClick={() => {
              const subject = encodeURIComponent('Solicitação de acesso VistorIA');
              const body = encodeURIComponent(`Olá,\n\nSolicito acesso à tela que requer perfil "${ROLE_LABEL[minRole]}".\n\nMeu e-mail: ${state.user?.email}`);
              window.open(`mailto:suporte@vegarobotics.com.br?subject=${subject}&body=${body}`);
            }}>
              Falar com Administrador
            </Btn>
          </ButtonRow>
        </Card>
      </Screen>
    );
  }

  // ── Autorizado ─────────────────────────────────────────────────────────────
  return typeof children === 'function'
    ? children({ user: state.user, role: state.role })
    : children;
};

export default VistorIARouteGuard;
