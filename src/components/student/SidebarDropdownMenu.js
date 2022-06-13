import React from 'react';
import './SidebarDropdownMenu.css';

const SidebarDropdownMenu = ({ text, children, Icon, collapseIdentifier }) => {
   return (
      <div>
         <button
            className='btn btn-primary text-start w-100 p-2 rounded-0'
            type='button'
            data-bs-toggle='collapse'
            data-bs-target={`#${collapseIdentifier}`}
         >
            <Icon className='sidebarDropdown__icon' />
            {text}
         </button>
         <div className='sidebarDropdown__menu'>{children}</div>
      </div>
   );
};

export default SidebarDropdownMenu;
