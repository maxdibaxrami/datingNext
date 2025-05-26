import React, { useEffect } from 'react';
import { secondaryButton, miniApp } from '@telegram-apps/sdk-react';

interface SecondaryButtonProps {
  text?: string;
  backgroundColor?: `#${string}`; // Must be a hex string like '#000000'
  textColor?: `#${string}`;       // Must be a hex string like '#ffffff'
  hasShineEffect?: boolean;
  isEnabled?: boolean;
  isLoaderVisible?: boolean;
  isVisible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';    // Only 'top' or 'bottom' allowed for position
  onClick?: () => void;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  text = 'CONTINUE',
  backgroundColor = '#000000',  // Default color
  textColor = '#ffffff',        // Default text color
  hasShineEffect = true,
  isEnabled = true,
  isLoaderVisible = false,
  isVisible = true,
  position = 'left',          // Default position
  onClick,
}) => {

  const MiniApp = miniApp.isMounted()


  useEffect(() => {
      // Mount the main button if available
      if (secondaryButton.mount.isAvailable()) {
        secondaryButton.mount();
      }
    }, [MiniApp, secondaryButton]);

  useEffect(() => {
    if (secondaryButton.setParams.isAvailable()) {
      secondaryButton.setParams({
        backgroundColor,
        hasShineEffect,
        isEnabled,
        isLoaderVisible,
        isVisible,
        position,
        text,
        textColor,
      });
    }
  }, [backgroundColor, hasShineEffect, isEnabled, isLoaderVisible, isVisible, position, text, textColor, MiniApp]);

  useEffect(() => {

    if (onClick && secondaryButton.onClick.isAvailable()) {
      // Bind the click listener
      secondaryButton.onClick(onClick);

      return () => {
        // Unbind the click listener when component unmounts
        secondaryButton.offClick(onClick);
      };
    }
  }, [onClick, MiniApp]);

  useEffect(()=>{
    return () => {
      console.log("dsdsadas")
      secondaryButton.setParams({
        isEnabled:false,
        isVisible:false,
        hasShineEffect:false,
        position:"left"

      });
      secondaryButton.unmount();

    }
  },[])

  return null; // No visual component, this button exists within the Telegram Mini App's UI
};

export default SecondaryButton;
