import { FloorPlan } from './types';

export const samplePlan: FloorPlan = {
  id: 'plan-1',
  name: 'Modern 2BHK',
  wallHeight: 3,
  rooms: [
    {
      id: 'living',
      name: 'Living Room',
      type: 'living',
      polygon: [
        [0, 0],
        [0, 5],
        [6, 5],
        [6, 0]
      ]
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      polygon: [
        [6, 0],
        [6, 3],
        [10, 3],
        [10, 0]
      ]
    },
    {
      id: 'bed1',
      name: 'Master Bedroom',
      type: 'bedroom',
      polygon: [
        [0, 5],
        [0, 9],
        [5, 9],
        [5, 5]
      ]
    },
    {
      id: 'bed2',
      name: 'Guest Bedroom',
      type: 'bedroom',
      polygon: [
        [5, 5],
        [5, 9],
        [10, 9],
        [10, 5]
      ]
    },
    {
      id: 'bath',
      name: 'Bathroom',
      type: 'bathroom',
      polygon: [
        [6, 3],
        [6, 5],
        [10, 5],
        [10, 3]
      ]
    },
    {
      id: 'balcony',
      name: 'Balcony',
      type: 'balcony',
      polygon: [
        [-2, 0],
        [-2, 5],
        [0, 5],
        [0, 0]
      ]
    }
  ]
};
