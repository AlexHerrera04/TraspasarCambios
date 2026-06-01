import { capitalize } from 'lodash';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'src/app/ui/Modal';

const HighLightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
  >
    <path
      d="M13.3384 16.941V19.0029H18.3384V21.0029H6.33838V19.0029H11.3384V16.941C7.39207 16.4489 4.33838 13.0825 4.33838 9.00293V3.00293H20.3384V9.00293C20.3384 13.0825 17.2847 16.4489 13.3384 16.941ZM6.33838 5.00293V9.00293C6.33838 12.3166 9.02467 15.0029 12.3384 15.0029C15.6521 15.0029 18.3384 12.3166 18.3384 9.00293V5.00293H6.33838ZM1.33838 5.00293H3.33838V9.00293H1.33838V5.00293ZM21.3384 5.00293H23.3384V9.00293H21.3384V5.00293Z"
      fill="currentColor"
      fillOpacity="0.64"
      className="print:text-black"
    />
  </svg>
);

const dropIn = {
  hidden: {
    y: '70vh',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.1,
      duration: 0.6,
    },
  },
  exit: {
    y: '100vh',
    opacity: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 1,
    },
  },
};

const Insight = (props: any, ref: any) => {
  const { insight } = props;
  //get keys from insight
  let text = '';
  let content = '';
  try {
    text = insight.insight_text.replace(/'/g, '"');
    content = JSON.parse(text);
  } catch (e) {
    text = insight.insight_text;
    content = JSON.parse(text);
    console.log('error', e);
  }
  const keys = Object.keys(content);

  return (
    <div>
      <h2 className="mb-6 mt-8 text-3xl font-bold print:text-black">
        {insight.theme_name}
      </h2>

      {keys.map((el: any, index: number) => (
        <div
          key={index}
          className="w-full border border-white/10 print:border-black/10 rounded-xl mb-6 p-6"
        >
          <h2 className="text-lg font-bold mb-2 print:text-black">
            {capitalize(el.split('_').join(' '))}
          </h2>
          <p className="text-base print:text-black">
            {content[el].split('\n').map((item: string, index: number) => (
              <span key={index} className="text-base print:text-black">
                {item}
                <br />
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
};

const InsightModal = (props: any) => {
  const navigate = useNavigate();
  const { open, handleOpen, insight } = props;

  return (
    <Modal open={open} handleOpen={handleOpen} showCloseBtn={true}>
      <Insight insight={insight}></Insight>
    </Modal>
  );
};

export default InsightModal;
