

export interface Hostel {
  id: string;
  name: string;
  code: string;
  genderType: 'male' | 'female' | 'mixed';
  wardenUserId?: string;
}

export interface Room {
  id: string;
  blockId: string;
  roomNo: string;
  floorNo: number;
  capacity: number;
  roomType: string;
}

export interface Bed {
  id: string;
  roomId: string;
  bedLabel: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface Allocation {
  id: string;
  studentId: string;
  bedId: string;
  allocatedFrom: Date;
  allocatedTo?: Date;
  status: 'active' | 'vacated' | 'transferred' | 'expired';
  idempotencyKey?: string;
}
