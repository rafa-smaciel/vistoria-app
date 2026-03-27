// src/modules/VistorIA/index.js
// Landing page para vistoria.proagentes.ai

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaTruck, FaCamera, FaBrain, FaChartBar, FaCheckCircle,
  FaArrowRight, FaClock, FaShieldAlt, FaRobot, FaPlay,
  FaExclamationTriangle, FaSignInAlt, FaEye, FaEyeSlash,
  FaSpinner, FaEnvelope, FaClipboardCheck, FaVial, FaCode, FaDatabase,
  FaRocket, FaHandshake, FaWhatsapp
} from 'react-icons/fa';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { vistoriaColors as colors } from '../components/theme';
import DemoLoginModal from '../components/DemoLoginModal';

// ============================================================
// ANIMATIONS
// ============================================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(14, 165, 233, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

// ============================================================
// STYLED COMPONENTS
// ============================================================
const Page = styled.div`
  min-height: 100vh;
  background: ${colors.background};
  color: ${colors.textPrimary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid ${colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  @media (min-width: 768px) { padding: 16px 48px; }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: ${colors.primaryDark};
  span { color: ${colors.accent}; }
  img { height: 32px; }
`;

const NavActions = styled.div`
  display: flex;
  gap: 12px;
`;

const NavButton = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$primary ? colors.primary : 'transparent'};
  color: ${p => p.$primary ? '#fff' : colors.primary};
  border: ${p => p.$primary ? 'none' : `2px solid ${colors.primary}`};
  &:hover { transform: translateY(-1px); }
`;

// Hero
const Hero = styled.section`
  padding: 60px 24px;
  text-align: center;
  background: linear-gradient(135deg, ${colors.backgroundAlt} 0%, #fff 50%, #f0f9ff 100%);
  @media (min-width: 768px) { padding: 100px 48px; }
`;

const HeroTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px 0;
  animation: ${fadeIn} 0.6s ease;
  @media (min-width: 768px) { font-size: 48px; }
  span { color: ${colors.primary}; }
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: ${colors.textSecondary};
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
  animation: ${fadeIn} 0.6s ease 0.1s both;
`;

const HeroCTA = styled.button`
  padding: 16px 40px;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  animation: ${pulse} 2s ease-in-out infinite, ${fadeIn} 0.6s ease 0.2s both;
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
`;

const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 48px;
  animation: ${fadeIn} 0.6s ease 0.3s both;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  text-align: center;
  .value {
    font-size: 28px;
    font-weight: 800;
    color: ${colors.primary};
  }
  .label {
    font-size: 13px;
    color: ${colors.textSecondary};
    margin-top: 2px;
  }
`;

// Problem
const Section = styled.section`
  padding: 60px 24px;
  @media (min-width: 768px) { padding: 80px 48px; }
  text-align: ${p => p.$center ? 'center' : 'left'};
  background: ${p => p.$alt ? colors.backgroundAlt : '#fff'};
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
  @media (min-width: 768px) { font-size: 36px; }
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: ${colors.textSecondary};
  max-width: 600px;
  margin: 0 auto 40px;
  text-align: center;
  line-height: 1.6;
`;

// Steps
const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); }
`;

const StepCard = styled.div`
  text-align: center;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid ${colors.border};
  box-shadow: ${colors.cardShadow};
  transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }

  .number {
    width: 48px; height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: ${colors.textSecondary};
    margin: 0;
    line-height: 1.5;
  }
`;

// Requisitos
const ReqList = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ReqCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-left: 4px solid ${p =>
    p.$status === 'ok' ? colors.success :
    p.$status === 'future' ? '#f59e0b' :
    colors.danger
  };
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: ${colors.cardShadow};

  .req-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .req-label {
    font-size: 13px;
    font-weight: 700;
    color: ${colors.textPrimary};
  }

  .req-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    background: ${p =>
      p.$status === 'ok' ? colors.successLight :
      p.$status === 'future' ? '#fef3c7' :
      colors.dangerLight
    };
    color: ${p =>
      p.$status === 'ok' ? colors.success :
      p.$status === 'future' ? '#92400e' :
      colors.danger
    };
  }

  .req-detail {
    font-size: 13px;
    color: ${colors.textSecondary};
    margin: 0;
    line-height: 1.5;
  }

  .req-items {
    list-style: none;
    padding: 0;
    margin: 6px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  .req-items li {
    font-size: 12px;
    color: ${colors.textSecondary};
    padding: 2px 8px;
    background: ${colors.backgroundAlt};
    border-radius: 4px;
  }
`;

const ScopeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const ScopeCard = styled.div`
  padding: 24px;
  border-radius: 12px;
  background: ${p => p.$included ? colors.successLight : colors.backgroundAlt};
  border: 1px solid ${p => p.$included ? '#6ee7b7' : colors.border};

  h3 {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: ${p => p.$included ? colors.success : colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 6px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 13px;
    color: ${colors.textPrimary};
    padding: 4px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    &::before {
      content: '${p => p.$included ? '✔' : '✖'}';
      color: ${p => p.$included ? colors.success : colors.textSecondary};
      font-size: 12px;
    }
  }
`;

// Modules
const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const ModuleCard = styled.div`
  padding: 32px;
  border-radius: 16px;
  background: #fff;
  border: 2px solid ${p => p.$accent ? colors.accent : colors.primary};
  box-shadow: ${colors.cardShadow};

  .icon {
    width: 56px; height: 56px;
    border-radius: 14px;
    background: ${p => p.$accent
      ? `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`
      : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
    };
    color: #fff;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: ${colors.textSecondary};
    line-height: 1.6;
    margin: 0;
  }
`;

// Auth
const AuthSection = styled.section`
  padding: 60px 24px;
  background: ${colors.backgroundDark};
  text-align: center;
`;

const AuthCard = styled.div`
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
`;

const AuthTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${colors.textPrimary};
`;

const AuthSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 0 0 24px 0;
`;

const AuthInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid ${colors.border};
  border-radius: 10px;
  font-size: 16px;
  margin-bottom: 12px;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${colors.primary}; }
`;

const AuthButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  &:disabled { opacity: 0.5; }
`;

const AuthError = styled.p`
  color: ${colors.danger};
  font-size: 13px;
  margin: 8px 0 0;
`;

const PasswordWrapper = styled.div`
  position: relative;
  button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${colors.textSecondary};
    cursor: pointer;
    padding: 4px;
    margin-top: -6px;
  }
`;

// Evidence / Demo Steps
const EvidenceSection = styled.section`
  padding: 60px 24px;
  background: ${colors.backgroundDark};
  @media (min-width: 768px) { padding: 80px 48px; }
`;

const EvidenceSectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
  color: #f1f5f9;
  @media (min-width: 768px) { font-size: 36px; }
`;

const EvidenceSectionSubtitle = styled.p`
  font-size: 15px;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 40px;
  text-align: center;
  line-height: 1.6;
`;

const EvidenceSteps = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const EvidenceStep = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  align-items: start;
  @media (min-width: 768px) {
    grid-template-columns: ${p => p.$reverse ? '1fr 1fr' : '1fr 1fr'};
    direction: ${p => p.$reverse ? 'rtl' : 'ltr'};
    > * { direction: ltr; }
  }
`;

const EvidenceStepInfo = styled.div`
  padding: 8px 0;
`;

const EvidenceStepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${colors.primary};
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const EvidenceStepTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px 0;
`;

const EvidenceStepDesc = styled.p`
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const EvidenceTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const EvidenceTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(14, 165, 233, 0.15);
  color: ${colors.primary};
  border: 1px solid rgba(14, 165, 233, 0.3);
`;

const EvidenceScreenshot = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  background: #1e293b;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: scale(1.02); }

  img {
    width: 100%;
    display: block;
  }

  .caption {
    padding: 8px 12px;
    font-size: 11px;
    color: #64748b;
    background: #0f172a;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
`;

const EvidenceScreenshotGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

// Video Evidence Section
const VideoSection = styled.section`
  padding: 60px 24px;
  background: ${colors.background};
  @media (min-width: 768px) { padding: 80px 48px; }
`;

const VideoGrid = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const VideoCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  background: #1e293b;

  video {
    width: 100%;
    display: block;
    max-height: 320px;
    object-fit: cover;
  }

  .video-label {
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    background: #0f172a;
    border-top: 1px solid rgba(255,255,255,0.05);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// Footer
const Footer = styled.footer`
  padding: 24px;
  text-align: center;
  background: ${colors.backgroundDark};
  color: ${colors.textSecondary};
  font-size: 13px;
  border-top: 1px solid rgba(255,255,255,0.1);
  a { color: ${colors.primary}; text-decoration: none; }
`;

// Terms of Use
const termsFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const TermsOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
`;

const TermsCard = styled.div`
  background: #fff;
  border-radius: 16px;
  max-width: 540px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 32px 24px;
  animation: ${termsFadeIn} 0.3s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const TermsLogo = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #0EA5E9;
  text-align: center;
  margin-bottom: 4px;
`;

const TermsTitle = styled.h2`
  font-size: 18px;
  color: #1e293b;
  text-align: center;
  margin: 0 0 16px;
`;

const TermsBody = styled.div`
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  p { margin: 0 0 12px; }
  ol { padding-left: 20px; margin: 0 0 16px; }
  li { margin-bottom: 10px; }
  strong { color: #1e293b; }
`;

const TermsActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const TermsButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : '1px solid #e2e8f0'};
  background: ${p => p.$primary ? '#0EA5E9' : '#fff'};
  color: ${p => p.$primary ? '#fff' : '#64748b'};
  &:hover {
    background: ${p => p.$primary ? '#0284c7' : '#f8fafc'};
  }
`;

// Commercial Sections (Pricing, Scope, SLA, Roadmap)
const CommercialGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const PriceCard = styled.div`
  padding: 32px 24px;
  border-radius: 16px;
  background: ${p => p.$highlight ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` : '#fff'};
  color: ${p => p.$highlight ? '#fff' : colors.textPrimary};
  border: ${p => p.$highlight ? 'none' : `1px solid ${colors.border}`};
  box-shadow: ${p => p.$highlight ? '0 8px 32px rgba(14,165,233,0.3)' : colors.cardShadow};
  text-align: center;
  .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; margin-bottom: 8px; }
  .price { font-size: 36px; font-weight: 800; margin: 8px 0 4px; }
  .sub { font-size: 14px; font-weight: 600; }
  .desc { font-size: 13px; line-height: 1.5; opacity: 0.8; margin-top: 12px; }
`;

const IncludeGrid = styled.div`
  max-width: 700px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; gap: 10px; }
`;

const IncludeRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: ${colors.backgroundAlt};
  font-size: 13px;
  line-height: 1.5;
  svg { color: ${colors.success}; margin-top: 3px; flex-shrink: 0; }
`;

const SlaGrid2 = styled.div`
  max-width: 700px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const SlaCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid ${colors.border};
  box-shadow: ${colors.cardShadow};
  .sla-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
    color: #fff; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 16px;
  }
  .sla-info { display: flex; flex-direction: column; gap: 2px; }
  .sla-title { font-size: 13px; color: ${colors.textSecondary}; }
  .sla-value { font-size: 15px; font-weight: 700; color: ${colors.textPrimary}; }
`;

const RoadmapTimeline = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const RoadmapItem = styled.div`
  display: flex;
  gap: 16px;
  padding-bottom: ${p => p.$last ? '0' : '24px'};
`;

const RoadmapDot = styled.div`
  width: 36px; height: 36px;
  border-radius: 50%;
  background: ${p => p.$active ? colors.primary : '#fff'};
  color: ${p => p.$active ? '#fff' : colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0;
  border: 2px solid ${p => p.$active ? colors.primary : colors.border};
`;

const RoadmapContent = styled.div`
  flex: 1;
  .rm-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${p => p.$active ? colors.primary : colors.textSecondary}; margin-bottom: 4px; }
  .rm-title { font-size: 16px; font-weight: 700; color: ${colors.textPrimary}; margin-bottom: 6px; }
  .rm-desc { font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5; margin-bottom: 6px; }
  .rm-price { font-size: 13px; font-weight: 700; color: ${colors.primary}; }
`;

// Data for commercial sections
const LANDING_INCLUDES = [
  'Checkin com vídeo — placa OCR + checklist de integridade',
  'Checkout com fotos — detecção e classificação de carga',
  'Laudo auditável permanente (URL por inspeção)',
  'Dashboard gestor — pendentes, completas, expiradas',
  'Configurações de IA — prompts, thresholds, taxonomia',
  'API REST para integração TMS/ERP',
  'Armazenamento de evidências em nuvem (90 dias)',
  'Documentação técnica completa',
  'Painel admin — usuários, CDs, roles por função',
  'Suporte via canal dedicado (WhatsApp ou e-mail)',
];

const LANDING_SLA = [
  { icon: <FaClock />, title: 'Laudo completo (checkin + checkout)', value: '≤ 45 segundos' },
  { icon: <FaShieldAlt />, title: 'Disponibilidade mensal', value: '99,5%' },
  { icon: <FaBrain />, title: 'Modelo de IA', value: 'Gemini 2.5 Pro + GPT-4V fallback' },
  { icon: <FaHandshake />, title: 'Resposta de suporte', value: '4h em dias úteis' },
  { icon: <FaRocket />, title: 'Prazo de ativação do piloto', value: '5–10 dias úteis' },
  { icon: <FaChartBar />, title: 'Retenção de evidências', value: '90 dias (configurável)' },
];

const LANDING_PHASES = [
  { tag: 'Agora — Piloto', title: 'Validação no 1º CD', desc: 'Ativação completa da plataforma. Sem custo de setup — o piloto é nosso investimento na parceria. Você valida a ferramenta e dá feedback. Cobrança apenas por vistoria realizada.', price: 'Setup: ZERO | R$ 39,90 por vistoria', active: true },
  { tag: 'Mês 1–2 — Feedback', title: 'Reunião de resultados', desc: 'Revisão conjunta de métricas: acurácia OCR, taxa de conciliação, tempo médio de laudo e ROI real. Ajustes finos nos prompts e configurações.', price: 'Incluído', active: false },
  { tag: 'Pós-validação — Contrato', title: 'Formalização + expansão', desc: 'Validação aprovada → contrato formal. Possibilidade de pacotes com desconto por volume. Expansão para outros CDs.', price: 'R$ 35–39,90/vistoria (conforme volume)', active: false },
  { tag: 'Fase Futura', title: 'Detecção de Avarias (Módulo 2)', desc: 'Detecção automática de avarias no manuseio entre CDs — validação de danos e atribuição de responsabilidades por IA.', price: 'Proposta separada', active: false, last: true },
];

// ============================================================
// COMPONENT
// ============================================================
export default function VistorIALanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'VistorIA';
  }, []);

  const [showDemoLogin, setShowDemoLogin] = useState(false);

  // Terms of Use — shown once on first visit
  const [termsAccepted, setTermsAccepted] = useState(() =>
    localStorage.getItem('vistoria_terms_accepted') === 'true'
  );
  const handleAcceptTerms = () => {
    localStorage.setItem('vistoria_terms_accepted', 'true');
    setTermsAccepted(true);
  };

  const [showAuth, setShowAuth] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) throw error;
      navigate('/dashboard');
      // Login inline succeeded — redirect handled by auth state
    } catch (err) {
      setAuthError(err.message || 'Erro no login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleDemoCheckin = () => setShowDemoLogin(true);
  const handleDemoCheckout = () => navigate('/checkout?demo=1');

  return (
    <Page>
      {/* Nav */}
      <Nav>
        <Brand>
          <img src="/images/logos/vistoria.svg" alt="VistorIA" />
        </Brand>
        <NavActions>
          {user ? (
            <>
              <NavButton onClick={() => navigate('/dashboard')}>Painel</NavButton>
              <NavButton onClick={() => navigate('/checkin')}>Checkin</NavButton>
              <NavButton $primary onClick={() => navigate('/checkout')}>Checkout</NavButton>
            </>
          ) : (
            <NavButton $primary onClick={() => setShowDemoLogin(true)}>
              <FaSignInAlt /> Iniciar Teste
            </NavButton>
          )}
        </NavActions>
      </Nav>

      {/* Hero — Comercial */}
      <Hero>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.15)', color: '#38bdf8', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700, marginBottom: 16, border: '1px solid rgba(56,189,248,0.3)' }}>
          <FaBrain /> Inteligência Artificial para Logística
        </div>
        <HeroTitle>
          Inspeção veicular<br /><span>automática com IA</span>
        </HeroTitle>
        <HeroSubtitle>
          Elimine conferências manuais, reduza prejuízos com avarias não documentadas
          e tenha laudos completos com evidência visual em menos de 45 segundos.
        </HeroSubtitle>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <HeroCTA onClick={handleDemoCheckin}>
            <FaTruck /> Testar Checkin
          </HeroCTA>
          <HeroCTA onClick={handleDemoCheckout} style={{ background: '#fff', color: colors.primary, border: `2px solid ${colors.primary}` }}>
            <FaCamera /> Testar Checkout
          </HeroCTA>
        </div>
        <HeroStats>
          <Stat><div className="value">&lt;45s</div><div className="label">Laudo completo</div></Stat>
          <Stat><div className="value">R$ 39,90</div><div className="label">por vistoria</div></Stat>
          <Stat><div className="value">7</div><div className="label">Verificações por inspeção</div></Stat>
          <Stat><div className="value">100%</div><div className="label">Evidência auditável</div></Stat>
        </HeroStats>
      </Hero>

      {/* Problema → Solução (comercial) */}
      <Section $alt>
        <SectionTitle>O problema</SectionTitle>
        <SectionSubtitle>
          Conferências manuais geram prejuízos invisíveis
        </SectionSubtitle>
        <ReqList>
          <ReqCard $status="alert">
            <div className="req-header">
              <span className="req-label"><FaExclamationTriangle /> Avarias não documentadas</span>
            </div>
            <p className="req-detail">Sem registro visual, não há como provar quando e onde o dano ocorreu. O custo fica com quem não deveria.</p>
          </ReqCard>
          <ReqCard $status="alert">
            <div className="req-header">
              <span className="req-label"><FaExclamationTriangle /> Conferência lenta e inconsistente</span>
            </div>
            <p className="req-detail">Cada operador faz de um jeito. Sem padronização, itens passam despercebidos e disputas são frequentes.</p>
          </ReqCard>
          <ReqCard $status="alert">
            <div className="req-header">
              <span className="req-label"><FaExclamationTriangle /> Sem rastreabilidade</span>
            </div>
            <p className="req-detail">Quando o problema aparece, não há como auditar o que aconteceu. Decisões ficam na palavra do operador.</p>
          </ReqCard>
        </ReqList>
      </Section>

      <Section>
        <SectionTitle>A solução</SectionTitle>
        <SectionSubtitle>
          IA analisa vídeo e fotos em tempo real — laudo completo com evidência auditável
        </SectionSubtitle>
        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaTruck /> Checkin automático (portaria)</span>
              <span className="req-badge"><FaCheckCircle /> Operando</span>
            </div>
            <p className="req-detail">Operador filma o veículo → IA lê a placa (OCR), avalia integridade visual (carroceria, pneus, lanternas, assoalho, parabrisa) e gera relatório em ~30s.</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaCamera /> Checkout automático (expedição)</span>
              <span className="req-badge"><FaCheckCircle /> Operando</span>
            </div>
            <p className="req-detail">Operador fotografa veículo carregado → IA detecta e classifica a carga, compara com o checkin (conciliação) e gera laudo final com score.</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaShieldAlt /> Laudo auditável com evidências</span>
              <span className="req-badge"><FaCheckCircle /> Operando</span>
            </div>
            <p className="req-detail">Cada decisão da IA vem com foto/frame de referência, bounding box e nível de confiança. Retido por 90 dias para auditoria.</p>
          </ReqCard>
        </ReqList>
      </Section>

      {/* Investimento */}
      <Section $alt>
        <SectionTitle>Investimento</SectionTitle>
        <SectionSubtitle>
          Modelo conforme uso — pague apenas pelo que usar, sem mensalidade fixa
        </SectionSubtitle>
        <CommercialGrid>
          <PriceCard>
            <div className="label">Piloto</div>
            <div className="price">ZERO</div>
            <div className="sub">sem custo de setup</div>
            <div className="desc">
              Configuração da plataforma, criação de usuários e CDs,
              ajuste de prompts e treinamento remoto dos operadores.
            </div>
          </PriceCard>
          <PriceCard $highlight>
            <div className="label">Por vistoria completa</div>
            <div className="price">R$ 39,90</div>
            <div className="sub">checkin + checkout + laudo</div>
            <div className="desc">
              Sem mínimo, sem contrato longo, cancele quando quiser.
              Cada inspeção inclui análise de IA com evidência auditável.
            </div>
          </PriceCard>
        </CommercialGrid>
      </Section>

      {/* Escopo do Piloto */}
      <Section>
        <SectionTitle>O que está incluído</SectionTitle>
        <SectionSubtitle>
          Plataforma VistorIA completa para o seu Centro de Distribuição
        </SectionSubtitle>
        <IncludeGrid>
          {LANDING_INCLUDES.map((item, i) => (
            <IncludeRow key={i}>
              <FaCheckCircle />
              <span>{item}</span>
            </IncludeRow>
          ))}
        </IncludeGrid>
      </Section>

      {/* Compromissos SLA */}
      <Section $alt>
        <SectionTitle>Compromissos</SectionTitle>
        <SectionSubtitle>
          Métricas de performance garantidas durante o piloto
        </SectionSubtitle>
        <SlaGrid2>
          {LANDING_SLA.map((item, i) => (
            <SlaCard key={i}>
              <div className="sla-icon">{item.icon}</div>
              <div className="sla-info">
                <span className="sla-title">{item.title}</span>
                <span className="sla-value">{item.value}</span>
              </div>
            </SlaCard>
          ))}
        </SlaGrid2>
      </Section>

      {/* Roadmap */}
      <Section>
        <SectionTitle>Próximos passos</SectionTitle>
        <SectionSubtitle>
          Da prova de conceito à operação em escala
        </SectionSubtitle>
        <RoadmapTimeline>
          {LANDING_PHASES.map((p, i) => (
            <RoadmapItem key={i} $last={p.last}>
              <RoadmapDot $active={p.active}>{i + 1}</RoadmapDot>
              <RoadmapContent $active={p.active}>
                <div className="rm-tag">{p.tag}</div>
                <div className="rm-title">{p.title}</div>
                <div className="rm-desc">{p.desc}</div>
                <div className="rm-price">{p.price}</div>
              </RoadmapContent>
            </RoadmapItem>
          ))}
        </RoadmapTimeline>
      </Section>

      {/* CTA Comercial */}
      <Section $alt style={{ textAlign: 'center' }}>
        <SectionTitle>Pronto para começar?</SectionTitle>
        <SectionSubtitle>
          Ativação em 5–10 dias úteis. A plataforma já está em produção — basta configurar o tenant.
        </SectionSubtitle>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <HeroCTA as="a" href="https://wa.me/5511944271000" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <FaWhatsapp /> Falar com a equipe
          </HeroCTA>
          <HeroCTA onClick={handleDemoCheckin} style={{ background: '#fff', color: colors.primary, border: `2px solid ${colors.primary}` }}>
            <FaTruck /> Testar agora
          </HeroCTA>
        </div>
      </Section>

      {/* Documentação técnica (colapsável) */}
      <Section $alt>
        <div
          onClick={() => setShowTechnical(prev => !prev)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <SectionTitle style={{ margin: 0 }}>
            <FaCode style={{ marginRight: 8 }} />
            Documentação Técnica Completa
          </SectionTitle>
          <span style={{ fontSize: 20, color: '#94a3b8' }}>
            {showTechnical ? '▲' : '▼'}
          </span>
        </div>
        <SectionSubtitle style={{ textAlign: 'center', marginTop: 8 }}>
          {showTechnical ? 'Clique para recolher' : '12 seções · Requisitos Funcionais · Não Funcionais · Métricas · Testes'}
        </SectionSubtitle>
      </Section>

      {showTechnical && (
      <>
      {/* 1. Objetivo */}
      <Section>
        <SectionTitle>1. Objetivo</SectionTitle>
        <SectionSubtitle>
          Solução de Visão Computacional / IA capaz de:
        </SectionSubtitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">1. Validar checklist operacional em vídeo</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">2. Avaliar integridade visual do veículo</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">3. Conciliar vídeo × fotos</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">4. Detectar presença de carga</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">5. Classificar tipo de carga</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 2. Escopo do MVP */}
      <Section>
        <SectionTitle>2. Escopo do MVP</SectionTitle>

        <ScopeGrid>
          <ScopeCard $included>
            <h3><FaCheckCircle /> Incluído</h3>
            <ul>
              <li>Leitura de placa em vídeo</li>
              <li>Verificação de consistência do veículo</li>
              <li>Inspeção visual básica de integridade</li>
              <li>Matching entre vídeo e fotos</li>
              <li>Detecção de carga</li>
              <li>Classificação por categorias padronizadas</li>
              <li>Geração de evidências auditáveis</li>
            </ul>
          </ScopeCard>
          <ScopeCard>
            <h3>Excluído (fases futuras)</h3>
            <ul>
              <li>Medições dimensionais precisas</li>
              <li>Estimativa de peso</li>
              <li>Reconhecimento de avarias microscópicas</li>
              <li>Integrações complexas (ERP/TMS em tempo real)</li>
            </ul>
          </ScopeCard>
        </ScopeGrid>
      </Section>

      {/* 3. Entradas do Sistema */}
      <Section $alt>
        <SectionTitle>3. Entradas do Sistema</SectionTitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Vídeo checklist</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Vídeo contendo varredura visual do veículo</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Fotos checkout</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Fotos do veículo carregado</p>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Metadados (opcional)</span>
              <span className="req-badge"><FaClock /> Fase futura</span>
            </div>
            <p className="req-detail">OS, CT-e, data/hora, tipo de veículo esperado</p>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 4. Saídas Obrigatórias */}
      <Section>
        <SectionTitle>4. Saídas Obrigatórias</SectionTitle>
        <SectionSubtitle>A IA deve retornar:</SectionSubtitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Placa identificada + confiança</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Status de validação do vídeo</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Checklist de integridade por item</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Resultado de conciliação vídeo × fotos</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Presença de carga (Sim / Não / Inconclusivo)</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Classificação da carga + confiança</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Evidências visuais (frames/fotos)</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 5. Requisitos Funcionais */}
      <Section $alt>
        <SectionTitle>5. Requisitos Funcionais</SectionTitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-01 — Leitura de Placa (OCR)</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Detectar e ler placa no vídeo. Retornar string + nível de confiança. Informar frames usados.</p>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-02 — Validação do Vídeo pelo Veículo</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Confirmar que o vídeo representa um único veículo. Detectar trocas/inconsistências visuais.</p>
            <ul className="req-items">
              <li>APROVADO</li><li>REPROVADO</li><li>INCONCLUSIVO</li>
            </ul>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-03 — Checklist de Integridade (Visual)</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Cada decisão com evidência visual. Status: OK / NÃO OK / INCONCLUSIVO</p>
            <ul className="req-items">
              <li>Carroceria</li><li>Assoalho</li><li>Pneus</li><li>Lanternas</li><li>Parabrisa</li>
            </ul>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-04 — Conciliação Vídeo × Fotos</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Comparar assinaturas visuais. Saída: MESMO VEÍCULO / PROVÁVEL / NÃO / INCONCLUSIVO</p>
            <ul className="req-items">
              <li>Cor predominante</li><li>Tipo de implemento</li><li>Qtd. eixos</li>
              <li>Lanternas / para-choque</li><li>Adesivos / logotipos</li><li>Marcas visuais permanentes</li>
            </ul>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-05 — Detecção de Carga</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Critério: evidência clara de volume/material.</p>
            <ul className="req-items">
              <li>SIM</li><li>NÃO</li><li>INCONCLUSIVO</li>
            </ul>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-06 — Classificação da Carga</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Classe + confiança + evidência. Taxonomia mínima:</p>
            <ul className="req-items">
              <li>Container</li><li>Caixotes/engradados</li><li>Tambores/bombonas</li>
              <li>Carga paletizada</li><li>Big bag</li><li>Sacaria</li>
              <li>Volumes avulsos</li><li>Tubos/perfis</li><li>Máquinas/equipamentos</li><li>Outros</li>
            </ul>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-07 — Evidência Auditável</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Toda decisão contém:</p>
            <ul className="req-items">
              <li>Frame/foto âncora</li><li>Confiança do modelo</li>
            </ul>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RF-07 — Bounding Box</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Frame âncora com região destacada (bounding box) entregue em cada evidência visual do laudo</p>
          </ReqCard>

          <ReqCard $status="ok" style={{ borderLeft: '4px solid #7c3aed' }}>
            <div className="req-header">
              <span className="req-label">RF-08 — Credenciamento de Motoristas</span>
              <span className="req-badge" style={{ background: '#ede9fe', color: '#5b21b6' }}><FaCheckCircle /> Além da Spec — Atendido</span>
            </div>
            <p className="req-detail">Cadastro e gestão de motoristas integrada ao fluxo de vistoria:</p>
            <ul className="req-items">
              <li>Registro com foto, CPF e placa habitual</li>
              <li>Busca por motorista no checkin</li>
              <li>Histórico de vistorias por motorista</li>
            </ul>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 6. Requisitos Não Funcionais */}
      <Section>
        <SectionTitle>6. Requisitos Não Funcionais</SectionTitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RNF-01 — Tempo operacional aceitável</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Laudo completo em menos de 30 segundos</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RNF-02 — Registro de logs e versão do modelo</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Cada validação registrada com ID, versão do motor e timestamp</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RNF-03 — Armazenamento de evidências</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Fotos e resultados armazenados em nuvem para auditoria</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">RNF-04 — Tratamento de baixa qualidade</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Imagens de baixa qualidade retornam INCONCLUSIVO + solicitação de recaptura</p>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">RNF-05 — Conformidade com LGPD</span>
              <span className="req-badge"><FaClock /> Fase futura</span>
            </div>
            <p className="req-detail">Quando aplicável — a definir contratualmente</p>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 7. Tratamento de Exceções */}
      <Section $alt>
        <SectionTitle>7. Tratamento de Exceções</SectionTitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Placa ilegível</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">INCONCLUSIVO + solicitar recaptura</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Vídeo insuficiente</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">INCONCLUSIVO</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Foto sem área de carga visível</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">INCONCLUSIVO</p>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Conflitos visuais fortes</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">NÃO É O MESMO VEÍCULO</p>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 8-9. Métricas e Critérios de Aceite */}
      <Section>
        <SectionTitle>8–9. Métricas e Critérios de Aceite</SectionTitle>
        <SectionSubtitle>Percentuais a definir contratualmente.</SectionSubtitle>

        <ReqList>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">OCR Placa — Acurácia por placa completa</span>
              <span className="req-badge"><FaClock /> A definir</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Matching veículo — Taxa de acerto em pares rotulados</span>
              <span className="req-badge"><FaClock /> A definir</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Checklist integridade — Precisão / Recall por item</span>
              <span className="req-badge"><FaClock /> A definir</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Classificação carga — Matriz de confusão</span>
              <span className="req-badge"><FaClock /> A definir</span>
            </div>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 10. Entregáveis do MVP */}
      <Section $alt>
        <SectionTitle>10. Entregáveis do MVP</SectionTitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Modelo treinado / ajustado</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Estrutura de retorno (JSON)</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Logs / auditoria</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">API para integração direta com TMS</span>
              <span className="req-badge"><FaClock /> Fase futura</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Documentação técnica</span>
              <span className="req-badge"><FaCheckCircle /> Atendido</span>
            </div>
            <p className="req-detail">Disponível em <a href="/docs" style={{ color: colors.primary }}>vistoria.proagentes.ai/docs</a></p>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 11. Evoluções Futuras */}
      <Section>
        <SectionTitle>11. Evoluções Futuras (Roadmap)</SectionTitle>

        <ReqList>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Detecção de avarias avançadas</span>
              <span className="req-badge"><FaClock /> Roadmap</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Medição dimensional automática</span>
              <span className="req-badge"><FaClock /> Roadmap</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Estimativa de volumetria</span>
              <span className="req-badge"><FaClock /> Roadmap</span>
            </div>
          </ReqCard>
          <ReqCard $status="future">
            <div className="req-header">
              <span className="req-label">Alertas automáticos / workflow</span>
              <span className="req-badge"><FaClock /> Roadmap</span>
            </div>
          </ReqCard>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label">Painel administrativo</span>
              <span className="req-badge"><FaCheckCircle /> Implementado</span>
            </div>
            <p className="req-detail">Gestão de motoristas, histórico de vistorias, configurações de IA e prompts — disponível em produção.</p>
          </ReqCard>
        </ReqList>
      </Section>

      {/* 12. Cobertura de Testes */}
      <Section $alt>
        <SectionTitle>12. Cobertura de Testes</SectionTitle>
        <SectionSubtitle>
          59 testes automatizados validam a lógica de negócio e a integração com o banco em produção.
          Executados em 17/03/2026 — 59/59 passando.
        </SectionSubtitle>

        <ReqList>
          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaCode style={{ marginRight: 6 }} />Lógica de Checkin — 35 testes unitários</span>
              <span className="req-badge"><FaCheckCircle /> 35/35 passando</span>
            </div>
            <p className="req-detail">
              normalizePlate (17 casos — placas Mercosul + antigas, OCR corrections) ·
              calculatePartialScore (6 casos) · buildConfigSnapshot (3 casos) ·
              withTimeout (3 casos) · validação de payload (6 casos — limite 50 frames, 50 MB)
            </p>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaCode style={{ marginRight: 6 }} />Lógica de Checkout — 18 testes unitários</span>
              <span className="req-badge"><FaCheckCircle /> 18/18 passando</span>
            </div>
            <p className="req-detail">
              calculateScore (9 casos — pesos RF01–RF06, thresholds customizados, conciliação PROVAVEL) ·
              validação de payload (5 casos — limite 40 fotos) ·
              RF-04 conciliação fallback (3 casos — PROVAVEL, INCONCLUSIVO, AI) ·
              buildConfigSnapshot checkout (1 caso)
            </p>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaDatabase style={{ marginRight: 6 }} />Integração Supabase — 6 testes E2E</span>
              <span className="req-badge"><FaCheckCircle /> 6/6 passando</span>
            </div>
            <p className="req-detail">
              vistoria_inspections · vistoria_users · vistoria_clients · vistoria_config ·
              RPC vistoria_expire_inspections · RLS anon (tabela protegida por row-level security)
            </p>
          </ReqCard>

          <ReqCard $status="ok">
            <div className="req-header">
              <span className="req-label"><FaVial style={{ marginRight: 6 }} />Resultado consolidado</span>
              <span className="req-badge"><FaCheckCircle /> 59/59 — 0 falhas</span>
            </div>
            <p className="req-detail">
              Sem mocks de banco de dados — integração roda contra Supabase real.
              Lógica pura testada sem dependências externas (Node.js built-in test runner).
            </p>
          </ReqCard>
        </ReqList>
      </Section>

      </>
      )}

      {/* Evidências E2E */}
      <EvidenceSection>
        <EvidenceSectionTitle>Como funciona na prática</EvidenceSectionTitle>
        <EvidenceSectionSubtitle>
          Ciclo completo gravado em produção — demos reais em{' '}
          <strong style={{ color: '#e2e8f0' }}>vistoria.proagentes.ai</strong>
        </EvidenceSectionSubtitle>

        <EvidenceSteps>
          {/* Step 1: Checkin */}
          <EvidenceStep>
            <EvidenceStepInfo>
              <EvidenceStepNumber>Passo 1 — Portaria</EvidenceStepNumber>
              <EvidenceStepTitle>Checkin: vídeo do veículo</EvidenceStepTitle>
              <EvidenceStepDesc>
                O operador da portaria filma o veículo usando a câmera do celular. A IA extrai frames automaticamente,
                lê a placa por OCR e avalia o checklist de integridade visual. O resultado fica disponível em ~30s.
              </EvidenceStepDesc>
              <EvidenceTags>
                <EvidenceTag>RF-01 Placa OCR ✓</EvidenceTag>
                <EvidenceTag>RF-02 Validação ✓</EvidenceTag>
                <EvidenceTag>RF-03 Checklist ✓</EvidenceTag>
              </EvidenceTags>
            </EvidenceStepInfo>
            <VideoCard>
              <video autoPlay muted loop playsInline>
                <source src="https://rotohdtbuqpeymjaiybu.supabase.co/storage/v1/object/public/project-files/vistoria/evidence-video/01-checkin-portaria.webm" type="video/webm" />
              </video>
              <div className="video-label">Tela de checkin — portaria registra entrada do veículo</div>
            </VideoCard>
          </EvidenceStep>

          {/* Step 2: Checkout */}
          <EvidenceStep $reverse>
            <EvidenceStepInfo>
              <EvidenceStepNumber>Passo 2 — Expedição</EvidenceStepNumber>
              <EvidenceStepTitle>Checkout: fotos do veículo carregado</EvidenceStepTitle>
              <EvidenceStepDesc>
                O operador da expedição seleciona o veículo pendente e fotografa o veículo carregado.
                A IA analisa a carga, faz a conciliação com o vídeo do checkin e gera o laudo completo.
              </EvidenceStepDesc>
              <EvidenceTags>
                <EvidenceTag>RF-04 Conciliação ✓</EvidenceTag>
                <EvidenceTag>RF-05 Detecção de carga ✓</EvidenceTag>
                <EvidenceTag>RF-06 Classificação ✓</EvidenceTag>
              </EvidenceTags>
            </EvidenceStepInfo>
            <VideoCard>
              <video autoPlay muted loop playsInline>
                <source src="https://rotohdtbuqpeymjaiybu.supabase.co/storage/v1/object/public/project-files/vistoria/evidence-video/02-checkout-expedicao.webm" type="video/webm" />
              </video>
              <div className="video-label">Tela de checkout — expedição seleciona veículo e registra saída</div>
            </VideoCard>
          </EvidenceStep>

          {/* Step 3: Laudo */}
          <EvidenceStep>
            <EvidenceStepInfo>
              <EvidenceStepNumber>Passo 3 — Laudo</EvidenceStepNumber>
              <EvidenceStepTitle>Laudo completo com evidências</EvidenceStepTitle>
              <EvidenceStepDesc>
                O laudo digital reúne todas as saídas obrigatórias da spec: placa, checklist por item,
                resultado da conciliação e classificação de carga — cada decisão com nível de confiança e evidência visual.
              </EvidenceStepDesc>
              <EvidenceTags>
                <EvidenceTag>RF-07 Evidência auditável ✓</EvidenceTag>
                <EvidenceTag>RNF-02 Logs + versão do modelo ✓</EvidenceTag>
                <EvidenceTag>RNF-03 Armazenamento em nuvem ✓</EvidenceTag>
              </EvidenceTags>
            </EvidenceStepInfo>
            <VideoCard>
              <video autoPlay muted loop playsInline>
                <source src="https://rotohdtbuqpeymjaiybu.supabase.co/storage/v1/object/public/project-files/vistoria/evidence-video/03-laudo-bbox.webm" type="video/webm" />
              </video>
              <div className="video-label">Laudo completo — RF-01 a RF-06 com bounding boxes em cada foto avaliada</div>
            </VideoCard>
          </EvidenceStep>

          {/* Step 4: Dashboard */}
          <EvidenceStep $reverse>
            <EvidenceStepInfo>
              <EvidenceStepNumber>Passo 4 — Gestor</EvidenceStepNumber>
              <EvidenceStepTitle>Dashboard de acompanhamento</EvidenceStepTitle>
              <EvidenceStepDesc>
                O gestor acompanha todas as inspeções em tempo real: pendentes, completas e expiradas.
                Acesso ao histórico completo com filtros por status e data.
              </EvidenceStepDesc>
              <EvidenceTags>
                <EvidenceTag>Multi-tenant ✓</EvidenceTag>
                <EvidenceTag>Histórico auditável ✓</EvidenceTag>
                <EvidenceTag>Tempo real ✓</EvidenceTag>
              </EvidenceTags>
            </EvidenceStepInfo>
            <VideoCard>
              <video autoPlay muted loop playsInline>
                <source src="https://rotohdtbuqpeymjaiybu.supabase.co/storage/v1/object/public/project-files/vistoria/evidence-video/04-dashboard.webm" type="video/webm" />
              </video>
              <div className="video-label">Dashboard do gestor — histórico de inspeções em tempo real</div>
            </VideoCard>
          </EvidenceStep>
        </EvidenceSteps>
      </EvidenceSection>

      {/* CTA */}
      <AuthSection>
        <AuthCard>
          <AuthTitle>Demonstracao por Persona</AuthTitle>
          <AuthSubtitle>
            Teste cada momento da inspecao com dados reais.
          </AuthSubtitle>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <AuthButton onClick={handleDemoCheckin} style={{ flex: 1, minWidth: 180 }}>
              <FaTruck /> Portaria (Checkin)
            </AuthButton>
            <AuthButton onClick={handleDemoCheckout} style={{ flex: 1, minWidth: 180 }}>
              <FaCamera /> Expedicao (Checkout)
            </AuthButton>
          </div>
          <AuthSubtitle style={{ marginTop: 12, fontSize: 12 }}>
            Ou acesse o fluxo legado:
          </AuthSubtitle>
          <AuthButton onClick={handleCTA} style={{ background: 'transparent', color: colors.primary, border: `1px solid ${colors.primary}` }}>
            <FaPlay /> {user ? 'Validacao Legada' : 'Acessar Demo'}
          </AuthButton>
        </AuthCard>
      </AuthSection>

      {/* Footer */}
      <Footer>
        VistorIA by <a href="https://proagentes.ai">ProAgentes.ai</a> — Vega Robotics © {new Date().getFullYear()}
      </Footer>

      {/* Demo Login Modal */}
      <DemoLoginModal
        isOpen={showDemoLogin}
        onClose={() => setShowDemoLogin(false)}
        onSuccess={() => {
          setShowDemoLogin(false);
          localStorage.setItem('vistoria_demo_active', 'true');
          navigate('/checkin?demo=1');
        }}
      />

      {/* Terms of Use — first visit only */}
      {!termsAccepted && (
        <TermsOverlay>
          <TermsCard>
            <TermsLogo>VistorIA</TermsLogo>
            <TermsTitle>Termos de Uso</TermsTitle>
            <TermsBody>
              <p>Ao utilizar o VistorIA, voce concorda com os seguintes termos:</p>
              <ol>
                <li><strong>Propriedade Intelectual</strong> — Todo o conteudo, algoritmos, modelos de IA, prompts, fluxos operacionais e interfaces deste sistema sao propriedade exclusiva da Vega Robotics LTDA. E expressamente proibida a copia, reproducao, engenharia reversa ou distribuicao nao autorizada.</li>
                <li><strong>Confidencialidade</strong> — Os laudos, resultados de inspecao e dados operacionais gerados sao confidenciais. O compartilhamento e permitido apenas com as partes envolvidas na operacao logistica.</li>
                <li><strong>Uso Autorizado</strong> — O acesso e concedido exclusivamente para operacoes de inspecao veicular nos Centros de Distribuicao autorizados. Qualquer uso fora deste escopo constitui violacao dos termos.</li>
                <li><strong>Auditoria</strong> — Todas as acoes sao registradas com identificacao do operador, horario e localizacao para fins de auditoria e conformidade.</li>
                <li><strong>Responsabilidade</strong> — O sistema auxilia na tomada de decisao, mas o operador e responsavel pela validacao final. O laudo da IA nao substitui inspecao manual quando necessario.</li>
              </ol>
            </TermsBody>
            <TermsActions>
              <TermsButton onClick={() => window.history.back()}>Recusar</TermsButton>
              <TermsButton $primary onClick={handleAcceptTerms}>Aceito os Termos</TermsButton>
            </TermsActions>
          </TermsCard>
        </TermsOverlay>
      )}
    </Page>
  );
}
