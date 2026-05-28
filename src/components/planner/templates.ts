import { FloorPlan } from './types';
import { samplePlan } from './samplePlan'; // Represents 2BHK

export const templates: Record<string, FloorPlan> = {
  'blank': {
    id: 'blank',
    name: 'Blank Plan',
    wallHeight: 3,
    rooms: []
  },
  '1bhk': {
    id: '1bhk-template',
    name: 'Standard 1BHK',
    wallHeight: 3,
    rooms: [
      {
        id: 'living-1bhk',
        name: 'Living Room',
        type: 'living',
        polygon: [[0, 0], [0, 4], [5, 4], [5, 0]] // 5x4 m
      },
      {
        id: 'kitchen-1bhk',
        name: 'Kitchen',
        type: 'kitchen',
        polygon: [[5, 0], [5, 3], [8, 3], [8, 0]] // 3x3 m
      },
      {
        id: 'bed-1bhk',
        name: 'Bedroom',
        type: 'bedroom',
        polygon: [[0, 4], [0, 8], [4, 8], [4, 4]] // 4x4 m
      },
      {
        id: 'bath-1bhk',
        name: 'Bathroom',
        type: 'bathroom',
        polygon: [[4, 4], [4, 6], [7, 6], [7, 4]] // 3x2 m
      }
    ]
  },
  '2bhk': samplePlan,
  '3bhk': {
    id: '3bhk-template',
    name: 'Spacious 3BHK',
    wallHeight: 3,
    rooms: [
      {
        id: 'living-3bhk',
        name: 'Living & Dining',
        type: 'living',
        polygon: [[0, 0], [0, 6], [7, 6], [7, 0]] // 7x6 m
      },
      {
        id: 'kitchen-3bhk',
        name: 'Kitchen',
        type: 'kitchen',
        polygon: [[7, 0], [7, 4], [11, 4], [11, 0]] // 4x4 m
      },
      {
        id: 'bed1-3bhk',
        name: 'Master Bedroom',
        type: 'bedroom',
        polygon: [[0, 6], [0, 11], [5, 11], [5, 6]] // 5x5 m
      },
      {
        id: 'bath1-3bhk',
        name: 'Master Bath',
        type: 'bathroom',
        polygon: [[5, 6], [5, 9], [7, 9], [7, 6]] // 2x3 m
      },
      {
        id: 'bed2-3bhk',
        name: 'Guest Bedroom',
        type: 'bedroom',
        polygon: [[7, 4], [7, 8], [11, 8], [11, 4]] // 4x4 m
      },
      {
        id: 'bed3-3bhk',
        name: 'Kids Bedroom',
        type: 'bedroom',
        polygon: [[0, -4], [0, 0], [5, 0], [5, -4]] // 5x4 m
      },
      {
        id: 'bath2-3bhk',
        name: 'Common Bath',
        type: 'bathroom',
        polygon: [[5, -3], [5, 0], [7, 0], [7, -3]] // 2x3 m
      },
      {
        id: 'balcony-3bhk',
        name: 'Balcony',
        type: 'balcony',
        polygon: [[-2, 0], [-2, 6], [0, 6], [0, 0]] // 2x6 m
      }
    ]
  }
};
