import { Button } from '@material-tailwind/react';
import styled from 'styled-components';

const StyledContainer = styled.div.attrs({
  className: 'flex-col md:flex-row',
})`
  display: flex;
  padding: 16px;
  justify-content: center;
  align-items: center;
  gap: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.06);
`;

const StyledIconContainer = styled.div`
  display: flex;
  width: 48px;
  height: 48px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

interface AlertProps {
  image?: string;
  children: React.ReactNode;
}

const Alert = (props: AlertProps) => {
  const { image, children } = props;
  return (
    <StyledContainer>
      {image && (
        <StyledIconContainer>
          <img src={image} />
        </StyledIconContainer>
      )}
      {children}
    </StyledContainer>
  );
};

export default Alert;
