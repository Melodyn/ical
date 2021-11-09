import React from 'react';
import { Button } from '@vkontakte/vkui';

const SettingsButton = ({ description, buttonText, onClick }) => (
  <div className="d-flex justify-content-center align-items-start py-2 mt-2">
    <p className="flex-grow-1">{description}</p>
    <Button onClick={onClick}>{buttonText}</Button>
  </div>
);

export default SettingsButton;
