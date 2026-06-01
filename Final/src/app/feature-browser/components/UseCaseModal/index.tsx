import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

const UseCase = (props: any, ref: any) => {
  const { useCase } = props;
  return (
    <div>
      <h2 className="mb-6 mt-8 text-3xl font-bold print:text-black">
        {useCase.json_header.use_case_name}
      </h2>
      <div className="flex w-full gap-x-6">
        {useCase.highlights.slice(0, 3).map((el: any, index: number) => (
          <div
            key={index}
            className="flex-1 bg-white/10 print:bg-black/10 rounded-xl mb-6 p-6"
          >
            <HighLightIcon />
            <h2 className="uppercase text-white/60 text-sm my-4 print:text-black">
              {el.title}
            </h2>
            <ul className="text-base print:text-black">
              {el.body.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {useCase.content.map((el: any, index: number) => (
        <div
          key={index}
          className="w-full border border-white/10 print:border-black/10 rounded-xl mb-6 p-6"
        >
          <h2 className="text-lg font-bold mb-2 print:text-black">
            {el.title}
          </h2>
          <p className="text-base print:text-black">{el.body[0]}</p>
        </div>
      ))}
      <a href="http://google.com">test</a>
    </div>
  );
};

const UseCaseModal = (props: any) => {
  const navigate = useNavigate();
  const { open, handleOpen, fileUrl } = props;
  const { data, isFetching } = useQuery({
    queryKey: ['useCasaData'],
    queryFn: async () => {
      const body = await fetch(fileUrl);
      const data = await body.json();
      return data;
    },
  });

  console.log(data);
  const json = `{
    "json_header": {
      "use_case_id": "UC-MA-CO-2000",
      "use_case_name": "Cost Optimization"
    },
    "highlights": [
      {
        "title": "Complexity",
        "body": ["Medium"],
        "icon": "https://..."
      },
      {
        "title": "Estimated Effort",
        "body": ["8-12 weeks"],
        "icon": "https://..."
      },
      {
        "title": "Required Time Range",
        "body": ["8-12 weeks"],
        "icon": "https://..."
      },
      {
        "title": "Estimated Cost Range",
        "body": ["$50,000-$75,000"],
        "icon": "https://..."
      },
      {
        "title": "Problems Addressed",
        "body": [
          "Reducing energy consumption",
          "Improving production efficiency",
          "Streamlining operations",
          "Identifying potential investments that could yield higher returns"
        ],
        "icon": "https://..."
      },
      {
        "title": "Benefits for the Company",
        "body": ["Save costs", "Improve efficiency", "Make better decisions"],
        "icon": "https://..."
      }
    ],
    "content": [
      {
        "title": "Description",
        "body": [
          "This use case is designed to help a company with 2000 employees optimize their costs by leveraging data analytics.",
          "The use case will focus on analyzing available data to identify areas of cost savings, such as reducing energy consumption, improving the efficiency of production processes, and streamlining operations.",
          "It will also provide insights into potential investments that could yield higher returns and help the company to make better decisions."
        ]
      },
      {
        "title": "Short Description",
        "body": ["Optimizing Costs with Data"]
      },
      {
        "title": "Use Case Objective",
        "body": [
          "To optimize cost savings for a company with 2000 employees through data analytics."
        ]
      },
      {
        "title": "Sponsorship",
        "body": [
          "The use case should be sponsored by the company's CFO, as they are responsible for ensuring cost optimization."
        ]
      },
      {
        "title": "Main Activities",
        "body": [
          "Data collection",
          "Data analysis",
          "Cost savings identification",
          "Cost savings implementation",
          "Investment decision-making"
        ]
      },
      {
        "title": "Estimated Number of People and Roles Required",
        "body": [
          "The use case will require 6-8 people with roles such as data analyst, data engineer, cost analyst, and project manager."
        ]
      },
      {
        "title": "Key Data Requirements for Execution",
        "body": [
          "The key data requirements for this use case include financial data, production data, energy consumption data, and customer data."
        ]
      },
      {
        "title": "Recommended Technologies or Tools",
        "body": [
          "Data analytics tools such as Tableau, PowerBI, and Excel; cost-saving tools such as Lean Six Sigma; and decision-making tools such as Monte Carlo simulations."
        ]
      },
      {
        "title": "Example Results",
        "body": [
          "Example results of this use case could include cost savings of 10-20%, improved production efficiency of 5-10%, and a higher return on investment of 2-4%."
        ]
      },
      {
        "title": "Brief Overview",
        "body": [
          "This use case will help a company with 2000 employees optimize their costs by leveraging data analytics.",
          "The use case will focus on analyzing available data to identify areas of cost savings, such as reducing energy consumption, improving the efficiency of production processes, and streamlining operations.",
          "It will also provide insights into potential investments that could yield higher returns and help the company to make better decisions."
        ]
      },
      {
        "title": "Ideal Company Characteristics for Implementing this Use Case",
        "body": [
          "Companies with 2000 employees, access to data, and a PBI per capita of 3000.",
          "The company should also have the resources and personnel to implement the use case."
        ]
      }
    ]
  }
  `;

  const useCase = JSON.parse(json);

  return (
    <Modal open={open} handleOpen={handleOpen} showCloseBtn={true}>
      <UseCase useCase={useCase}></UseCase>
    </Modal>
  );
};

export default UseCaseModal;
