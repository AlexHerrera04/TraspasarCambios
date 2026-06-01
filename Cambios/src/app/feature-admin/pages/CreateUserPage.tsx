// import React, { useState } from 'react';
// import { CreateUserForm } from '../components/CreateUserForm';
// import { CreateLayerZeroUserForm } from '../components/CreateLayerZeroUserForm';
// import { Tab, Tabs, TabsHeader, TabsBody, TabPanel } from '@material-tailwind/react';

// export const CreateUserPage: React.FC = () => {
//   const [activeTab, setActiveTab] = useState('regular');

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold text-white mb-6">Create New User</h1>
      
//       <Tabs value={activeTab} onChange={(value) => setActiveTab(value as string)}>
//         <TabsHeader>
//           <Tab value="regular">Regular User</Tab>
//           <Tab value="layerZero">Layer Zero User</Tab>
//         </TabsHeader>
        
//         <TabsBody>
//           <TabPanel value="regular">
//             <CreateUserForm />
//           </TabPanel>
//           <TabPanel value="layerZero">
//             <CreateLayerZeroUserForm />
//           </TabPanel>
//         </TabsBody>
//       </Tabs>
//     </div>
//   );
// }; 