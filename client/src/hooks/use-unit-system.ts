import { useQuery } from "@tanstack/react-query";
import { Settings } from "@shared/schema";

/**
 * Hook to get the user's unit system preference and utility functions for weight conversion
 */
export function useUnitSystem() {
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const unitSystem = settings?.unitSystem || "lbs";
  
  /**
   * Convert weight from lbs (stored format) to user's preferred unit
   */
  const convertWeight = (weightInLbs: number): number => {
    if (unitSystem === "kg") {
      return weightInLbs * 0.453592; // Convert lbs to kg
    }
    return weightInLbs;
  };

  /**
   * Convert weight from user's preferred unit to lbs (storage format)
   */
  const convertToLbs = (weight: number): number => {
    if (unitSystem === "kg") {
      return weight / 0.453592; // Convert kg to lbs
    }
    return weight;
  };

  /**
   * Format weight with appropriate precision and unit label
   */
  const formatWeight = (weightInLbs: number, options?: { includeUnit?: boolean; decimals?: number }): string => {
    const { includeUnit = true, decimals } = options || {};
    const converted = convertWeight(weightInLbs);
    
    // Use appropriate decimal precision based on unit
    const precision = decimals !== undefined 
      ? decimals 
      : unitSystem === "kg" ? 1 : 0;
    
    // Round to appropriate precision
    const rounded = Math.round(converted * Math.pow(10, precision)) / Math.pow(10, precision);
    
    // If it's a whole number, return as integer string (no trailing .0)
    const formattedNumber = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(precision);
    
    if (includeUnit) {
      return `${formattedNumber} ${unitSystem}`;
    }
    
    return formattedNumber;
  };

  /**
   * Get the unit label
   */
  const getUnitLabel = (): string => {
    return unitSystem === "kg" ? "kg" : "lbs";
  };

  /**
   * Get the full unit name
   */
  const getUnitName = (): string => {
    return unitSystem === "kg" ? "Kilograms" : "Pounds";
  };

  return {
    unitSystem,
    convertWeight,
    convertToLbs,
    formatWeight,
    getUnitLabel,
    getUnitName,
    isMetric: unitSystem === "kg",
  };
}
