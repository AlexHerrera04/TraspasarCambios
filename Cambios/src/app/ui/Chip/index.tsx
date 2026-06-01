import { Theme } from 'src/app/core/models/Theme.model';
import styled from 'styled-components';

interface Props {
  id: string;
  name: string;
  selected: boolean;
}

const StyledChip = styled.div<any>`
  padding: 8px 16px;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
  display: flex;
  align-items: center;
`;

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M20 6L9 17L4 12"
      stroke="#A78BFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Chip({
  item,
  setActive = () => {},
  solid = false,
}: {
  item: { name: string; selected: boolean } | Theme;
  setActive?: Function;
  solid?: boolean;
}) {
  if (solid) {
    return (
      <StyledChip
        className={`border-2 rounded-full ${
          item.selected
            ? 'transition-all duration-500 border-primary-600 bg-primary-600'
            : 'border-tertiary'
        }
       `}
      >
        {item.name}
      </StyledChip>
    );
  } else {
    return (
      <StyledChip
        className={`border-2 rounded-full ${
          item.selected
            ? 'transition-all duration-500 border-active gap-2'
            : 'border-tertiary'
        }
       `}
        onClick={() => setActive(item)}
      >
        {item.name}
        <div
          className={`transform ${
            item.selected
              ? 'transition-all duration-500 scale-100 opacity-100 max-w-full'
              : 'scale-0 opacity-0 max-w-0'
          }`}
        >
          <CheckIcon />
        </div>
      </StyledChip>
    );
  }
}
