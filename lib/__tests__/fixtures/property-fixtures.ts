/**
 * Property Test Fixtures
 * Sprint 2: Test data for property matching tests
 */

/**
 * Mock property for testing
 */
export interface MockProperty {
  id: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  rentable_square_feet: number;
  property_type: string;
  parking_spaces: number;
  building_class: string;
  year_built: number;
  ada_compliant: boolean;
  security_level: number;
  available_date: string;
}

/**
 * Create mock property in Washington DC
 */
export function createMockDCProperty(overrides: Partial<MockProperty> = {}): MockProperty {
  return {
    id: `prop-dc-${Math.random().toString(36).substring(7)}`,
    street_address: '1800 F Street NW',
    city: 'Washington',
    state: 'DC',
    zipcode: '20006',
    latitude: 38.8977,
    longitude: -77.0365,
    rentable_square_feet: 60000,
    property_type: 'Office',
    parking_spaces: 120,
    building_class: 'A',
    year_built: 2015,
    ada_compliant: true,
    security_level: 4,
    available_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Create mock property in Virginia
 */
export function createMockVAProperty(overrides: Partial<MockProperty> = {}): MockProperty {
  return {
    id: `prop-va-${Math.random().toString(36).substring(7)}`,
    street_address: '1550 Crystal Drive',
    city: 'Arlington',
    state: 'VA',
    zipcode: '22202',
    latitude: 38.8580,
    longitude: -77.0498,
    rentable_square_feet: 55000,
    property_type: 'Office',
    parking_spaces: 100,
    building_class: 'A',
    year_built: 2018,
    ada_compliant: true,
    security_level: 3,
    available_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Create mock property with specific characteristics
 */
export function createMockPropertyWithSpecs(
  state: string,
  rsf: number,
  buildingClass: string,
  adaCompliant: boolean
): MockProperty {
  const baseProperty = state === 'DC' ? createMockDCProperty() : createMockVAProperty();

  return {
    ...baseProperty,
    rentable_square_feet: rsf,
    building_class: buildingClass,
    ada_compliant: adaCompliant,
  };
}

/**
 * Create multiple mock properties
 */
export function createMockProperties(count: number): MockProperty[] {
  return Array.from({ length: count }, (_, i) =>
    i % 2 === 0 ? createMockDCProperty() : createMockVAProperty()
  );
}

/**
 * Property that matches GSA requirements perfectly
 */
export function createPerfectMatchProperty(): MockProperty {
  return createMockDCProperty({
    rentable_square_feet: 65000, // Within typical GSA range
    building_class: 'A',
    ada_compliant: true,
    security_level: 4,
    parking_spaces: 150,
    year_built: 2020,
  });
}

/**
 * Property that doesn't match GSA requirements
 */
export function createPoorMatchProperty(): MockProperty {
  return {
    id: 'prop-poor-match',
    street_address: '123 Remote Road',
    city: 'Rural Town',
    state: 'WY', // Not a typical GSA location
    zipcode: '82001',
    latitude: 41.1400,
    longitude: -104.8202,
    rentable_square_feet: 5000, // Too small
    property_type: 'Warehouse', // Wrong type
    parking_spaces: 10, // Insufficient
    building_class: 'C',
    year_built: 1975, // Old
    ada_compliant: false, // Not compliant
    security_level: 1,
    available_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Too far out
  };
}
