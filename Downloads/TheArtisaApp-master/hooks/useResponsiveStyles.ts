import { useWindowDimensions } from 'react-native';

// Define breakpoints
export const BREAKPOINTS = {
  SMALL: 375, // iPhone SE size
  MEDIUM: 768, // Tablet / larger phones
  LARGE: 1024, // Larger tablets / small laptops
};

/**
 * Hook to provide responsive styles based on screen dimensions
 */
export function useResponsiveStyles() {
  const { width, height } = useWindowDimensions();

  // Screen size helpers
  const isSmallScreen = width < BREAKPOINTS.MEDIUM;
  const isMediumScreen = width >= BREAKPOINTS.MEDIUM && width < BREAKPOINTS.LARGE;
  const isLargeScreen = width >= BREAKPOINTS.LARGE;
  const isLandscape = width > height;

  /**
   * Get a value based on screen size
   * @param {Object} options - The options object
   * @param {any} options.small - Value for small screens
   * @param {any} options.medium - Value for medium screens
   * @param {any} options.large - Value for large screens
   * @returns {any} The appropriate value based on screen size
   */
  const getValueForScreenSize = ({ small, medium, large }: { small: any; medium?: any; large?: any }) => {
    if (isLargeScreen) return large || medium || small;
    if (isMediumScreen) return medium || small;
    return small;
  };

  /**
   * Get a font size based on screen size
   * @param {Object} options - The options object
   * @param {number} options.small - Font size for small screens
   * @param {number} options.medium - Font size for medium screens
   * @param {number} options.large - Font size for large screens
   * @returns {number} The appropriate font size based on screen size
   */
  const getFontSize = ({ small, medium, large }: { small: number; medium?: number; large?: number }) => {
    return getValueForScreenSize({ small, medium, large });
  };

  /**
   * Get a spacing value based on screen size
   * @param {Object} options - The options object
   * @param {number} options.small - Spacing for small screens
   * @param {number} options.medium - Spacing for medium screens
   * @param {number} options.large - Spacing for large screens
   * @returns {number} The appropriate spacing based on screen size
   */
  const getSpacing = ({ small, medium, large }: { small: number; medium?: number; large?: number }) => {
    return getValueForScreenSize({ small, medium, large });
  };

  /**
   * Get number of columns for a grid based on screen size
   * @param {Object} options - The options object
   * @param {number} options.small - Number of columns for small screens
   * @param {number} options.medium - Number of columns for medium screens
   * @param {number} options.large - Number of columns for large screens
   * @returns {number} The appropriate number of columns based on screen size
   */
  const getColumns = ({ small, medium, large }: { small: number; medium?: number; large?: number }) => {
    return getValueForScreenSize({ small, medium, large });
  };

  /**
   * Calculate responsive width as a percentage of screen width
   * @param {number} percentage - Width percentage (0-100)
   * @returns {number} Width in pixels
   */
  const widthPercentage = (percentage: number) => {
    return (percentage / 100) * width;
  };

  /**
   * Calculate responsive height as a percentage of screen height
   * @param {number} percentage - Height percentage (0-100)
   * @returns {number} Height in pixels
   */
  const heightPercentage = (percentage: number) => {
    return (percentage / 100) * height;
  };

  return {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isLandscape,
    getValueForScreenSize,
    getFontSize,
    getSpacing,
    getColumns,
    widthPercentage,
    heightPercentage,
  };
}
