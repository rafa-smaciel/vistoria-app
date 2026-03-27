import React from 'react';
import styled from 'styled-components';
import { vistoriaColors as colors } from './theme';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.backgroundAlt};
  padding: 24px;
`;

const Card = styled.div`
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
  color: ${colors.danger};
  margin: 0 0 12px;
  font-size: 20px;
`;

const Message = styled.p`
  color: ${colors.textSecondary};
  font-size: 14px;
  margin: 0 0 24px;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  padding: 12px 32px;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

export default class VistorIAErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[VistorIA ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Card>
            <Title>Algo deu errado</Title>
            <Message>
              Ocorreu um erro inesperado no VistorIA.
              Tente recarregar a pagina.
            </Message>
            <RetryButton onClick={this.handleRetry}>
              Tentar Novamente
            </RetryButton>
          </Card>
        </Container>
      );
    }
    return this.props.children;
  }
}
