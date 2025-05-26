import React, { useEffect } from 'react';
import { mainButton, miniApp } from '@telegram-apps/sdk-react';

interface MainButtonProps {
  text?: string;
  backgroundColor?: `#${string}`; // Ensure it's a hex string
  textColor?: `#${string}`;       // Ensure it's a hex string
  hasShineEffect?: boolean;
  isEnabled?: boolean;
  isLoaderVisible?: boolean;
  isVisible?: boolean;
  onClick?: () => void;
}

const MainButton: React.FC<MainButtonProps> = ({
  text = 'CONTINUE',
  backgroundColor = '#000000',  // Default as a hex string
  textColor = '#ffffff',        // Default as a hex string
  hasShineEffect = true,
  isEnabled = true,
  isLoaderVisible = false,
  isVisible = true,
  onClick,
}) => {

  const MiniApp = miniApp.isMounted()

  useEffect(() => {
    // Mount the main button if available
    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
    }
  }, [MiniApp, mainButton]);

  useEffect(() => {
    // Set button parameters if setParams is available

    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({
        backgroundColor,
        hasShineEffect,
        isEnabled,
        isLoaderVisible,
        isVisible,
        text,
        textColor,
      });
    }
  }, [backgroundColor, hasShineEffect, isEnabled, isLoaderVisible, isVisible, text, textColor,MiniApp]);

  useEffect(() => {
    if (onClick && mainButton.onClick.isAvailable()) {
      // Bind the click listener
      mainButton.onClick(onClick);

      return () => {
        // Unbind the click listener
        mainButton.offClick(onClick);
      };
    }
  }, [onClick, MiniApp]);

  useEffect(()=>{
    return () => {

        mainButton.setParams({
          isEnabled:false,
          isVisible:false,
          hasShineEffect:false,
        });

        mainButton.unmount();

    }
  },[])

  return null; // This component renders nothing visually
};

export default MainButton;
